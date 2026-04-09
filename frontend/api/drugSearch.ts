import { setCacheEntry } from '../redux/drugSearchSlice';
import { store } from '../redux/store';
import { distanceBetweenCoordinates, zipToCoords } from './distance';
import { dsntClient } from './dsntClient';
import { groupID, scriptSaveClient } from './scriptSaveClient';
import {
  type DrugSearchResult,
  ScriptSaveAutoCompleteItem,
  ScriptSaveAutoCompleteResponse,
  ScriptSaveFormItem,
  ScriptSaveGetDrugFormStrengthResponse,
} from './types';

const MAX_DSNT_RADIUS = 125.99;
const MAX_SCRIPTSAVE_NUMRESULTS = 100;
const ZIPCODE_LENGTH = 5;
const DEFAULT_ZIPCODE = '01930';

let activeGsn: string = ''; // GSN for the selected strength
let activeStrength: string = ''; // Strength text (e.g., "10 MG")
let activeForm: string = ''; // Form text (e.g., "Tablet")
let activeDrugName: string = ''; // Drug name (e.g., "Abilify")
let activeQuantity: number = 0; // Quantity for the selected strength
let includeGeneric: boolean = true; // Whether to include generic in search
let genericVersion: string | null = null;
let availableForms: string[] = [];
let formGsnMap: Record<string, string> = {}; // Maps form name to its GSN
let strengthGsnMap: Map<string, string> = new Map(); // Maps "form|strength" to GSN

export interface InitializeDrugSearchResult {
  genericVersion: string | null;
  availableForms: string[];
  formCommonQtyMap: Record<string, number>;
  formGsnMap: Record<string, string>;
}

export interface GetStrengthsForFormResult {
  strengths: string[];
  strengthCommonQtyMap: Record<string, number>;
}

/**
 * Resets all module-level state. Call this when starting a new drug search.
 */
export function resetDrugSearch(): void {
  activeGsn = '';
  activeStrength = '';
  activeForm = '';
  activeDrugName = '';
  activeQuantity = 0;
  includeGeneric = true;
  genericVersion = null;
  availableForms = [];
  formGsnMap = {};
  strengthGsnMap.clear();
}

export async function autoCompleteSearchDrug(drugPrefix: string): Promise<string[]> {
  const autoCompleteResponse: ScriptSaveAutoCompleteResponse = await scriptSaveClient.autoComplete({
    prefixText: drugPrefix,
    groupID: String(groupID),
  });

  if (!autoCompleteResponse.DrugNames?.length) {
    return [];
  }

  const autoCompleteDrugNames = autoCompleteResponse.DrugNames.map(
    (autoCompleteItem: ScriptSaveAutoCompleteItem) => {
      return autoCompleteItem.DrugName.split(' ')
        .map((word) => {
          return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
        })
        .join(' ') as string;
    }
  );

  return autoCompleteDrugNames;
}

export async function initializeDrugSearch(drugName: string) {
  // Don't reset here - let the caller decide when to reset
  // This prevents race conditions when React calls this multiple times

  // Fetch both generic and brand drug data
  const [genericResponse, brandResponse] = await Promise.all([
    scriptSaveClient.getDrugsByName({
      drugName,
      brandIndicator: 'G',
      groupID: String(groupID),
      includeDrugInfo: 'false',
      includeDrugImage: 'false',
      quantity: '1',
      numPharm: '10',
      zipCode: DEFAULT_ZIPCODE,
      useUC: 'true',
    }),
    scriptSaveClient.getDrugsByName({
      drugName,
      brandIndicator: 'B',
      groupID: String(groupID),
      includeDrugInfo: 'false',
      includeDrugImage: 'false',
      quantity: '1',
      numPharm: '10',
      zipCode: DEFAULT_ZIPCODE,
      useUC: 'true',
    }),
  ]);

  const findDrugsResponse = genericResponse.Drugs?.length ? genericResponse : brandResponse;

  if (!findDrugsResponse.Drugs?.length || !findDrugsResponse.Forms?.length) {
    throw new Error('Initializing drug search failed');
  }

  // Extract generic version name
  for (const nameItem of findDrugsResponse.Names) {
    if (nameItem.BrandGeneric === 'G') {
      genericVersion = nameItem.DrugName.toLowerCase();
    }
  }

  // Get the first GSN to fetch proper form data with CommonQty
  const firstGSN = findDrugsResponse.Forms[0]?.GSN;
  if (!firstGSN) {
    throw new Error('No GSN found for drug forms');
  }

  // Fetch drug form strength data which includes proper CommonQty values
  const formStrengthResponse: ScriptSaveGetDrugFormStrengthResponse =
    await scriptSaveClient.getDrugFormStrength({
      groupID: String(groupID),
      gsn: firstGSN,
    });

  // Map forms and extract CommonQty for each form from the proper endpoint
  const formCommonQtyMap: Record<string, number> = {};
  formGsnMap = {};
  availableForms = findDrugsResponse.Forms.map((form: ScriptSaveFormItem) => {
    const formName = form.Form.replace(/\([^)]*\)/g, '').trim();

    // Store the GSN for this form
    formGsnMap[formName] = form.GSN;

    // Find the matching form in the formStrengthResponse to get the correct CommonQty
    const matchingFormData = formStrengthResponse.Forms?.find((f) => f.GSN === form.GSN);
    const commonQty = matchingFormData?.CommonQty || 1;

    formCommonQtyMap[formName] = commonQty;
    return formName;
  });

  return {
    genericVersion,
    availableForms,
    formCommonQtyMap,
    formGsnMap,
  } as InitializeDrugSearchResult;
}

/**
 * Fetches available strengths for a selected form.
 * Also stores the NDC values for each strength for later use in search.
 *
 * @param drugName The drug name
 * @param form The selected form
 * @returns Object containing strength options and their common quantities
 */
export async function getStrengthsForForm(
  drugName: string,
  form: string
): Promise<GetStrengthsForFormResult> {
  const gsn = formGsnMap[form];
  if (!gsn) {
    throw new Error(`No GSN found for form: ${form}`);
  }

  // Fetch strength data for this form
  const formStrengthResponse: ScriptSaveGetDrugFormStrengthResponse =
    await scriptSaveClient.getDrugFormStrength({
      groupID: String(groupID),
      gsn: gsn,
    });

  if (!formStrengthResponse.Strengths?.length) {
    throw new Error('No strengths found for this form');
  }

  // Build the strength maps - filter to only include strengths matching the selected form
  const strengthCommonQtyMap: Record<string, number> = {};
  const strengths: string[] = [];

  // If there's only one form available, no filtering needed - all strengths belong to that form
  const skipFiltering = availableForms.length === 1;

  // Abbreviation mappings for form names (both directions)
  const formAbbreviations: Record<string, string[]> = {
    TAB: ['TAB', 'TABLET', 'TABLETS'],
    TABLET: ['TAB', 'TABLET', 'TABLETS'],
    CAP: ['CAP', 'CAPS', 'CAPSULE', 'CAPSULES'],
    CAPSULE: ['CAP', 'CAPS', 'CAPSULE', 'CAPSULES'],
    SOL: ['SOL', 'SOLN', 'SOLUTION'],
    SOLUTION: ['SOL', 'SOLN', 'SOLUTION'],
    SUSP: ['SUSP', 'SUSPENSION'],
    SUSPENSION: ['SUSP', 'SUSPENSION'],
    INJ: ['INJ', 'INJECTION'],
    INJECTION: ['INJ', 'INJECTION'],
    SR: ['SR', 'SUSTAINED'],
    ER: ['ER', 'EXTENDED'],
    DR: ['DR', 'DELAYED'],
    XR: ['XR', 'EXTENDED'],
    XL: ['XL', 'EXTENDED'],
  };

  // Words to ignore during matching (duration indicators, etc.)
  const ignoreWords = new Set(['12H', '24H', '12HR', '24HR']);

  // Helper: check if a form word matches the label (considering abbreviations)
  const wordMatchesLabel = (formWord: string, labelUpper: string): boolean => {
    // Direct match
    if (labelUpper.includes(formWord)) return true;

    // Check abbreviation matches
    const variants = formAbbreviations[formWord];
    if (variants) {
      return variants.some((variant) => labelUpper.includes(variant));
    }
    return false;
  };

  formStrengthResponse.Strengths.forEach((strength) => {
    const labelName = strength.LN?.toUpperCase() || '';
    const formUpper = form.toUpperCase();

    // Skip filtering if only one form exists
    if (!skipFiltering) {
      // Primary check: if the strength's GSN matches the form's GSN, include it
      // This handles cases where API data has inconsistent naming (e.g., form says "ER" but label says "SR")
      const strengthMatchesFormGsn = strength.GSN === gsn;

      // Secondary check: label name contains all form words (with abbreviation support)
      const formWords = formUpper.split(/\s+/).filter((w) => !ignoreWords.has(w));
      const allWordsMatch = formWords.every((word) => wordMatchesLabel(word, labelName));

      // Include if either: GSN matches, or label matches
      const shouldInclude = strengthMatchesFormGsn || allWordsMatch;

      if (!shouldInclude) {
        return; // Skip this strength - it's for a different form
      }
    }

    const key = `${form}|${strength.Strength}`;

    // Store the GSN for this strength
    strengthGsnMap.set(key, strength.GSN);

    strengthCommonQtyMap[strength.Strength] = strength.CommonQty;
    strengths.push(strength.Strength);
  });

  // If no strengths matched the form, throw an error
  if (strengths.length === 0) {
    throw new Error(`No strengths found for form: ${form}`);
  }

  // Sort strengths numerically (extract number from string like "10 MG", "5 MG")
  strengths.sort((a, b) => {
    const numA = parseFloat(a.replace(/[^0-9.]/g, '')) || 0;
    const numB = parseFloat(b.replace(/[^0-9.]/g, '')) || 0;
    return numA - numB;
  });

  return {
    strengths,
    strengthCommonQtyMap,
  };
}

/**
 * Sets the active GSN, quantity, and includeGeneric flag for the selected strength.
 * Must be called before searchDrug functions.
 */
export function setActiveStrength(
  drugName: string,
  form: string,
  strength: string,
  quantity: number,
  includeGen: boolean
): void {
  const key = `${form}|${strength}`;
  const gsn = strengthGsnMap.get(key);

  if (!gsn) {
    activeGsn = '';
    activeStrength = '';
    activeForm = '';
    activeDrugName = '';
    activeQuantity = 0;
    includeGeneric = includeGen;
    return;
  }

  activeGsn = gsn;
  activeStrength = strength;
  activeForm = form;
  activeDrugName = drugName;
  activeQuantity = quantity;
  includeGeneric = includeGen;
}

/**
 * This function queries both adjudicator APIs to find pharmacy drugs with
 * the given 'drugName', within 'radius' miles of 'zipCode'. Uses GSN-based
 * searching. De-duplicates results by pharmacy, selecting results with the
 * lowest price for a given pharmacy.
 *
 * @param drugName of the drug to search.
 * @param zipCode to search for pharmacy drugs in.
 * @param radius to search within, relative to 'zipCode'.
 */
async function searchDrug(
  form: string,
  radius: number,
  zipCode: string
): Promise<DrugSearchResult[]> {
  if (!activeGsn || !activeQuantity) {
    throw new Error('The active strength has not been set');
  }

  const userCoords = await zipToCoords(String(zipCode));

  // Use GSN-based search for ScriptSave (supports GSN + ReferencedBN)
  // For generic: use genericVersion name, for brand: use original drug name
  const genericReferencedBN = genericVersion || activeDrugName;
  const brandReferencedBN = activeDrugName; // Use the brand name for brand searches

  const [genericGsnResponse, brandGsnResponse] = await Promise.all([
    includeGeneric
      ? scriptSaveClient.getDrugsByGSN({
          groupID: String(groupID),
          brandIndicator: 'G',
          gsn: activeGsn,
          referencedBN: genericReferencedBN,
          includeDrugInfo: 'false',
          includeDrugImage: 'false',
          quantity: String(activeQuantity),
          numPharm: String(MAX_SCRIPTSAVE_NUMRESULTS),
          zipCode: String(zipCode),
          useUC: 'true',
        })
      : Promise.resolve({ Drugs: [] }),
    scriptSaveClient.getDrugsByGSN({
      groupID: String(groupID),
      brandIndicator: 'B',
      gsn: activeGsn,
      referencedBN: brandReferencedBN,
      includeDrugInfo: 'false',
      includeDrugImage: 'false',
      quantity: String(activeQuantity),
      numPharm: String(MAX_SCRIPTSAVE_NUMRESULTS),
      zipCode: String(zipCode),
      useUC: 'true',
    }),
  ]);

  // Extract NDCs from the GSN search for DSNT queries
  const genericNdc = genericGsnResponse.Drugs?.[0]?.NDC || '';
  const brandNdc = brandGsnResponse.Drugs?.[0]?.NDC || '';

  // Query DSNT if we have NDCs
  const dsntQueries = [];
  if (genericNdc && includeGeneric) {
    dsntQueries.push(
      dsntClient.getPriceByNdc({
        ndc: String(genericNdc),
        quantity: String(activeQuantity),
        zipCode: String(zipCode),
        radius: String(Math.min(radius, MAX_DSNT_RADIUS)),
      })
    );
  } else if (!includeGeneric) {
    dsntQueries.push(Promise.resolve({ DrugPricing: [] }));
  }

  if (brandNdc) {
    dsntQueries.push(
      dsntClient.getPriceByNdc({
        ndc: String(brandNdc),
        quantity: String(activeQuantity),
        zipCode: String(zipCode),
        radius: String(Math.min(radius, MAX_DSNT_RADIUS)),
      })
    );
  }

  const dsntResults = dsntQueries.length > 0 ? await Promise.all(dsntQueries) : [];
  const dsntGenericResults = dsntResults[0] || { DrugPricing: [] };
  const dsntBrandResults = dsntResults[1] || { DrugPricing: [] };

  const pharmacyResultMap: Map<string, DrugSearchResult[]> = new Map();

  // Process results based on includeGeneric setting
  const dsntResultsToProcess = includeGeneric
    ? [...(dsntGenericResults.DrugPricing || []), ...(dsntBrandResults.DrugPricing || [])]
    : dsntBrandResults.DrugPricing || [];

  const scriptSaveResultsToProcess = includeGeneric
    ? [...(genericGsnResponse.Drugs || []), ...(brandGsnResponse.Drugs || [])]
    : brandGsnResponse.Drugs || [];

  // Process DSNT results
  for (const dsntResult of dsntResultsToProcess) {
    const lowerLabelName = dsntResult.labelName.toLowerCase();
    const lowerForm = form.toLowerCase();

    if (
      lowerLabelName !== '' &&
      !lowerLabelName.includes(lowerForm) &&
      availableForms.some((af) => lowerLabelName.includes(af.toLowerCase()))
    ) {
      continue;
    }

    const dsntZipCode: string =
      dsntResult.zipCode.length === ZIPCODE_LENGTH
        ? dsntResult.zipCode
        : dsntResult.zipCode.slice(0, 5);

    const pharmacyCoords = await zipToCoords(dsntZipCode);

    const distance = distanceBetweenCoordinates(
      { lat: pharmacyCoords.lat, lon: pharmacyCoords.lon },
      { lat: userCoords.lat, lon: userCoords.lon }
    );

    if (distance > radius) {
      continue;
    }

    const pharmacyAddress = dsntResult.street2
      ? `${dsntResult.street1}, ${dsntResult.street2}, ${dsntResult.city}, ${dsntResult.state} ${dsntZipCode}`
      : `${dsntResult.street1}, ${dsntResult.city}, ${dsntResult.state} ${dsntZipCode}`;

    // Construct proper label based on whether this is generic or brand
    const displayName = includeGeneric && genericVersion ? genericVersion : activeDrugName;
    const constructedLabel = `${displayName} ${activeStrength} ${activeForm}`.toLowerCase();

    const convertedResult: DrugSearchResult = {
      adjudicator: 'DSNT',
      pharmacyName: dsntResult.pharmacy,
      pharmacyAddress,
      pharmacyPhone: dsntResult.phoneNumber,
      ndc: dsntResult.ndc,
      labelName: constructedLabel
        .split(' ')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' '),
      price: dsntResult.price,
      latitude: pharmacyCoords.lat,
      longitude: pharmacyCoords.lon,
      distance: String(distance),
    };

    const existing = pharmacyResultMap.get(convertedResult.pharmacyName) ?? [];
    pharmacyResultMap.set(convertedResult.pharmacyName, [...existing, convertedResult]);
  }

  // Process ScriptSave results
  for (const scriptSaveResult of scriptSaveResultsToProcess) {
    // Check what fields exist on the result
    const lowerLn = (
      scriptSaveResult.ln ||
      scriptSaveResult.LN ||
      scriptSaveResult.labelName ||
      ''
    ).toLowerCase();

    if (
      lowerLn !== '' &&
      !lowerLn.includes(form.toLowerCase()) &&
      availableForms.some((af) => lowerLn.includes(af.toLowerCase()))
    ) {
      continue;
    }

    const latitude = scriptSaveResult.latitude || scriptSaveResult.Latitude;
    const longitude = scriptSaveResult.longitude || scriptSaveResult.Longitude;

    if (!latitude || !longitude) {
      continue;
    }

    const distance = distanceBetweenCoordinates(
      { lat: String(latitude), lon: String(longitude) },
      { lat: userCoords.lat, lon: userCoords.lon }
    );

    if (distance > radius) {
      continue;
    }

    // Construct proper label based on whether this is generic or brand
    const displayName = includeGeneric && genericVersion ? genericVersion : activeDrugName;
    const constructedLabel = `${displayName} ${activeStrength} ${activeForm}`.toLowerCase();

    const convertedResult: DrugSearchResult = {
      adjudicator: 'ScriptSave',
      pharmacyName: scriptSaveResult.pharmacyName || scriptSaveResult.PharmacyName || '',
      pharmacyPhone: scriptSaveResult.phone || scriptSaveResult.Phone || '',
      pharmacyAddress: scriptSaveResult.address || scriptSaveResult.Address || '',
      ndc: scriptSaveResult.ndc || scriptSaveResult.NDC || '',
      labelName: constructedLabel
        .split(' ')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' '),
      price: scriptSaveResult.price || scriptSaveResult.Price || '',
      latitude: String(latitude),
      longitude: String(longitude),
      distance: String(distance),
    };

    const existing = pharmacyResultMap.get(convertedResult.pharmacyName) ?? [];
    pharmacyResultMap.set(convertedResult.pharmacyName, [...existing, convertedResult]);
  }

  // De-duplicate by pharmacy, keeping lowest price
  const deDuplicatedResults: DrugSearchResult[] = [];
  for (const results of pharmacyResultMap.values()) {
    const bestDeal = results.reduce((a, b) => (Number(a.price) < Number(b.price) ? a : b));
    deDuplicatedResults.push(bestDeal);
  }

  return deDuplicatedResults;
}

// -----------------------------------------------------------------------------
// SEARCH BY PRICE
// -----------------------------------------------------------------------------
export async function searchDrugByPrice(
  drugName: string,
  form: string,
  radius: number,
  includeGeneric: boolean,
  zipCode: string
): Promise<DrugSearchResult[]> {
  const resolvedDrugName = (activeDrugName || drugName).toLowerCase();
  const key = `${resolvedDrugName}-${zipCode}-${radius}-${form}-${activeStrength}-${activeQuantity}-${includeGeneric}`;
  const state = store.getState() as any;
  const cachedEntry = state.drugSearch.resultsByPrice[key];
  if (cachedEntry) {
    return cachedEntry.results;
  }

  // Reutilize distance-sorted cache if available
  const byDistanceKey = `${resolvedDrugName}-${zipCode}-${radius}-${form}-${activeStrength}-${activeQuantity}-${includeGeneric}`;
  const cachedDistanceEntry = state.drugSearch.resultsByDistance[byDistanceKey];
  if (cachedDistanceEntry) {
    const sorted = [...cachedDistanceEntry.results].sort((a, b) => +a.price - +b.price);
    store.dispatch(setCacheEntry({ key, results: sorted, by: 'price' }));
    return sorted;
  }

  // Fresh query
  const searchResults = await searchDrug(form, radius, zipCode);
  const sorted = [...searchResults].sort((a, b) => +a.price - +b.price);
  store.dispatch(setCacheEntry({ key, results: sorted, by: 'price' }));
  return sorted;
}

// -----------------------------------------------------------------------------
// SEARCH BY DISTANCE
// -----------------------------------------------------------------------------
export async function searchDrugByDistance(
  drugName: string,
  form: string,
  radius: number,
  includeGeneric: boolean,
  zipCode: string
): Promise<DrugSearchResult[]> {
  const resolvedDrugName = (activeDrugName || drugName).toLowerCase();
  const key = `${resolvedDrugName}-${zipCode}-${radius}-${form}-${activeStrength}-${activeQuantity}-${includeGeneric}`;
  const state = store.getState() as any;
  const cachedEntry = state.drugSearch.resultsByDistance[key];
  if (cachedEntry) {
    return cachedEntry.results;
  }

  // Reutilize price-sorted cache if available
  const byPriceKey = `${resolvedDrugName}-${zipCode}-${radius}-${form}-${activeStrength}-${activeQuantity}-${includeGeneric}`;
  const cachedPriceEntry = state.drugSearch.resultsByPrice[byPriceKey];
  if (cachedPriceEntry) {
    const sorted = [...cachedPriceEntry.results].sort((a, b) => +a.distance - +b.distance);
    store.dispatch(setCacheEntry({ key, results: sorted, by: 'distance' }));
    return sorted;
  }

  // Fresh query
  const searchResults = await searchDrug(form, radius, zipCode);
  const sorted = [...searchResults].sort((a, b) => +a.distance - +b.distance);
  store.dispatch(setCacheEntry({ key, results: sorted, by: 'distance' }));
  return sorted;
}
