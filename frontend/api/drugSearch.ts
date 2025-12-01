import getUserLocation from '@/api/userLocation';
import { setCacheEntry } from '../redux/drugSearchSlice';
import { store } from '../redux/store';
import { distanceBetweenCoordinates, zipToCoords } from './distance';
import { dsntClient } from './dsntClient';
import { brandIndicator, groupID, ndcOverride, scriptSaveClient } from './scriptSaveClient';
import {
  type DrugSearchResult,
  DsntPriceRequest,
  ScriptSaveAutoCompleteItem,
  ScriptSaveAutoCompleteResponse,
  ScriptSaveFindDrugsResponse,
  ScriptSavePriceRequest,
} from './types';

const MAX_DSNT_RADIUS = 125.99;
const MAX_SCRIPTSAVE_NUMRESULTS = 100;
const ZIPCODE_LENGTH = 5;
const DEFAULT_ZIPCODE = '01930';

let ndc: string = '';
let genericVersion: string | null = null;
let availableForms: string[] = [];

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
  // Find the drug’s NDC
  const findDrugsResponse: ScriptSaveFindDrugsResponse = await scriptSaveClient.getDrugsByName({
    drugName,
    brandIndicator,
    groupID: String(groupID),
    includeDrugInfo: 'false',
    includeDrugImage: 'false',
    quantity: '1',
    numPharm: '1',
    zipCode: DEFAULT_ZIPCODE,
    useUC: 'true',
  });

  if (!findDrugsResponse.Drugs?.length || !findDrugsResponse.Drugs?.length) {
    throw new Error('Initializing drug search failed');
  }

  ndc = findDrugsResponse.Drugs[0].NDC;
  for (const nameItem of findDrugsResponse.Names) {
    if (nameItem.BrandGeneric === 'G') {
      genericVersion = nameItem.DrugName;
    }
  }

  availableForms = findDrugsResponse.Forms.map((form) => {
    const formName = form.Form.replace(/\([^)]*\)/g, '').trim(); // Remove substrings in parentheses (and the parentheses themselves)
    return formName;
  });
}

/**
 * This function queries both adjudicator APIs to find pharmacy drugs with
 * the given 'drugName', within 'radius' miles of 'zipCode'. It de-duplicates
 * results by pharmacy, selecting results with the lowest price for a given
 * pharmacy. The function is used by wrappers to return sorted search results.
 *
 * @param drugName of the drug to search.
 * @param zipCode to search for pharmacy drugs in.
 * @param radius to search within, relative to 'zipCode'.
 */
async function searchDrug(
  drugName: string,
  form: string,
  radius: number,
  includeGeneric: boolean,
  effectiveZip: string
): Promise<DrugSearchResult[]> {
  if (!ndc) {
    throw new Error('The NDC has not been initialized');
  }

  const userCoords = await zipToCoords(effectiveZip);

  // Prepare adjudicator queries
  const dsntSearchQuery: DsntPriceRequest = {
    ndc: String(ndc),
    quantity: '1',
    zipCode: effectiveZip,
    radius: String(Math.min(radius, MAX_DSNT_RADIUS)),
  };

  const scriptSaveSearchQuery: ScriptSavePriceRequest = {
    ndc: String(ndc),
    groupID: String(groupID),
    quantity: '1',
    numResults: String(MAX_SCRIPTSAVE_NUMRESULTS),
    zipCode: effectiveZip,
    ndcOverride: String(ndcOverride),
  };

  // Query both DSNT and ScriptSave in parallel
  const [dsntDrugResults, scriptSaveDrugResults] = await Promise.all([
    dsntClient.getPriceByNdc(dsntSearchQuery),
    scriptSaveClient.getDrugPrices(scriptSaveSearchQuery),
  ]);

  const pharmacyResultMap: Map<string, DrugSearchResult[]> = new Map();

  // Process DSNT results
  for (const dsntResult of dsntDrugResults.DrugPricing ?? []) {
    if (!includeGeneric && !dsntResult.labelName.includes(genericVersion)) {
      continue;
    }

    if (!dsntResult.labelName.includes(form)) {
      for (const availableForm of availableForms) {
        if (dsntResult.labelName.toLowerCase().includes(availableForm.toLowerCase())) {
          continue;
        }
      }
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

    const convertedResult: DrugSearchResult = {
      adjudicator: 'DSNT',
      pharmacyName: dsntResult.pharmacy,
      pharmacyAddress,
      pharmacyPhone: dsntResult.phoneNumber,
      ndc: dsntResult.ndc,
      labelName: dsntResult.labelName,
      price: dsntResult.price,
      latitude: pharmacyCoords.lat,
      longitude: pharmacyCoords.lon,
      distance: String(distance),
    };

    const existing = pharmacyResultMap.get(convertedResult.pharmacyName) ?? [];
    pharmacyResultMap.set(convertedResult.pharmacyName, [...existing, convertedResult]);
  }

  // Process ScriptSave results
  for (const scriptSaveResult of scriptSaveDrugResults.drugs ?? []) {
    if (!includeGeneric && !scriptSaveResult.ln.includes(drugName)) {
      continue;
    }

    if (!scriptSaveResult.ln.includes(form)) {
      for (const availableForm of availableForms) {
        if (scriptSaveResult.ln.toLowerCase().includes(availableForm.toLowerCase())) {
          continue;
        }
      }
    }

    const distance = distanceBetweenCoordinates(
      { lat: scriptSaveResult.latitude, lon: scriptSaveResult.longitude },
      { lat: userCoords.lat, lon: userCoords.lon }
    );

    if (distance > radius) {
      continue;
    }

    const convertedResult: DrugSearchResult = {
      adjudicator: 'ScriptSave',
      pharmacyName: scriptSaveResult.pharmacyName,
      pharmacyPhone: scriptSaveResult.phone,
      pharmacyAddress: scriptSaveResult.address,
      ndc: scriptSaveResult.ndc,
      labelName: scriptSaveResult.ln,
      price: scriptSaveResult.price,
      latitude: scriptSaveResult.latitude,
      longitude: scriptSaveResult.longitude,
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
  zipCode?: number
): Promise<DrugSearchResult[]> {
  try {
    const { userZipCode } = await getUserLocation();

    const effectiveZip = zipCode !== undefined && zipCode !== null ? String(zipCode) : userZipCode;

    const key = `${drugName.toLowerCase()}-${effectiveZip}-${radius}-${form}-${includeGeneric}`;
    const state = store.getState() as any;
    const cachedEntry = state.drugSearch.resultsByPrice[key];
    if (cachedEntry) return cachedEntry.results;

    // Reutilize distance-sorted cache if available
    const byDistanceKey = `${drugName.toLowerCase()}-${effectiveZip}-${radius}-${form}-${includeGeneric}`;
    const cachedDistanceEntry = state.drugSearch.resultsByDistance[byDistanceKey];
    if (cachedDistanceEntry) {
      const sorted = [...cachedDistanceEntry.results].sort((a, b) => +a.price - +b.price);
      store.dispatch(setCacheEntry({ key, results: sorted, by: 'price' }));
      return sorted;
    }

    // Fresh query
    const searchResults = await searchDrug(drugName, form, radius, includeGeneric, effectiveZip);
    const sorted = [...searchResults].sort((a, b) => +a.price - +b.price);
    store.dispatch(setCacheEntry({ key, results: sorted, by: 'price' }));
    return sorted;
  } catch (err) {
    console.error('Error in searchDrugByPrice:', err);
    return [];
  }
}

// -----------------------------------------------------------------------------
// SEARCH BY DISTANCE
// -----------------------------------------------------------------------------
export async function searchDrugByDistance(
  drugName: string,
  form: string,
  radius: number,
  includeGeneric: boolean,
  zipCode?: number
): Promise<DrugSearchResult[]> {
  try {
    const { userZipCode } = await getUserLocation();

    const effectiveZip = zipCode !== undefined && zipCode !== null ? String(zipCode) : userZipCode;

    const key = `${drugName.toLowerCase()}-${effectiveZip}-${radius}-${form}-${includeGeneric}`;
    const state = store.getState() as any;
    const cachedEntry = state.drugSearch.resultsByDistance[key];
    if (cachedEntry) return cachedEntry.results;

    // Reutilize price-sorted cache if available
    const byPriceKey = `${drugName.toLowerCase()}-${effectiveZip}-${radius}-${form}-${includeGeneric}`;
    const cachedByPriceEntry = state.drugSearch.resultsByPrice[byPriceKey];
    if (cachedByPriceEntry) {
      const sorted = [...cachedByPriceEntry.results].sort((a, b) => +a.distance - +b.distance);
      store.dispatch(setCacheEntry({ key, results: sorted, by: 'distance' }));
      return sorted;
    }

    // Fresh query
    const searchResults = await searchDrug(drugName, form, radius, includeGeneric, effectiveZip);
    const sorted = [...searchResults].sort((a, b) => +a.distance - +b.distance);
    store.dispatch(setCacheEntry({ key, results: sorted, by: 'distance' }));
    return sorted;
  } catch (err) {
    console.error('Error in searchDrugByDistance:', err);
    return [];
  }
}
