import useUserLocation from '@/hooks/use-user-location';
import { setCacheEntry } from '../redux/drugSearchSlice';
import { store } from '../redux/store';
import { distanceBetweenCoordinates, zipToCoords } from './distance';
import { dsntClient } from './dsntClient';
import { groupID, ndcOverride, scriptSaveClient } from './scriptSaveClient';
import {
  type DrugSearchResult,
  DsntPriceRequest,
  ScriptSaveFindDrugsResponse,
  ScriptSavePriceRequest,
} from './types';

const MAX_DSNT_RADIUS = 125.99;
const MAX_SCRIPTSAVE_NUMRESULTS = 999999999;

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
  radius: number,
  includeGeneric: boolean,
  zipCode?: number
) {
  // Get user's location (lat/lon/zip) from hook
  const { userLat, userLon, userZipCode, userLocationError } = await useUserLocation();

  if (userLocationError) {
    throw new Error(userLocationError);
  }

  const effectiveZip = String(zipCode) || userZipCode;

  // Find the drug’s NDC
  const drugsByName: ScriptSaveFindDrugsResponse = await scriptSaveClient.getDrugsByName({
    drugName,
    groupID,
  });

  if (!drugsByName?.Drugs?.length) {
    return [];
  }

  const ndc = drugsByName.Drugs[0].NDC;

  // Prepare adjudicator queries
  const dsntSearchQuery: DsntPriceRequest = {
    ndc: String(ndc),
    quantity: 1,
    zipCode: effectiveZip,
    radius: Math.min(radius, MAX_DSNT_RADIUS),
  };

  const scriptSaveSearchQuery: ScriptSavePriceRequest = {
    ndc: String(ndc),
    groupID,
    quantity: 1,
    numResults: MAX_SCRIPTSAVE_NUMRESULTS,
    zipCode: effectiveZip,
    ndcOverride,
  };

  // Query both DSNT and ScriptSave in parallel
  const [dsntDrugResults, scriptSaveDrugResults] = await Promise.all([
    dsntClient.getPriceByNdc(dsntSearchQuery),
    scriptSaveClient.getDrugPrices(scriptSaveSearchQuery),
  ]);

  const pharmacyResultMap: Map<string, DrugSearchResult[]> = new Map();

  // Process DSNT results
  for (const dsntResult of dsntDrugResults.DrugPricing ?? []) {
    if (!includeGeneric && !dsntResult.labelName.includes(drugName)) {
      continue;
    }

    const coords = await zipToCoords(dsntResult.zipCode);

    const distance = distanceBetweenCoordinates(
      { lat: coords.lat, lon: coords.lon },
      { lat: userLat, lon: userLon }
    );

    if (distance > radius) {
      continue;
    }

    const pharmacyAddress = dsntResult.street2
      ? `${dsntResult.street1}, ${dsntResult.street2}, ${dsntResult.city}, ${dsntResult.state} ${dsntResult.zipCode}`
      : `${dsntResult.street1}, ${dsntResult.city}, ${dsntResult.state} ${dsntResult.zipCode}`;

    const convertedResult: DrugSearchResult = {
      adjudicator: 'DSNT',
      pharmacyName: dsntResult.pharmacy,
      pharmacyAddress,
      pharmacyPhone: dsntResult.phoneNumber,
      ndc: dsntResult.ndc,
      labelName: dsntResult.labelName,
      price: dsntResult.price,
      latitude: coords.lat,
      longitude: coords.lon,
      distance,
    };

    const existing = pharmacyResultMap.get(convertedResult.pharmacyName) ?? [];
    pharmacyResultMap.set(convertedResult.pharmacyName, [...existing, convertedResult]);
  }

  // Process ScriptSave results
  for (const scriptSaveResult of scriptSaveDrugResults.drugs ?? []) {
    if (!includeGeneric && !scriptSaveResult.ln.includes(drugName)) {
      continue;
    }

    const distance = distanceBetweenCoordinates(
      { lat: scriptSaveResult.latitude, lon: scriptSaveResult.longitude },
      { lat: userLat, lon: userLon }
    );

    if (distance > radius) {
      continue;
    }

    const resultLat = Number(scriptSaveResult.latitude);
    const resultLon = Number(scriptSaveResult.longitude);

    const convertedResult: DrugSearchResult = {
      adjudicator: 'ScriptSave',
      pharmacyName: scriptSaveResult.pharmacyName,
      pharmacyPhone: scriptSaveResult.phone,
      pharmacyAddress: scriptSaveResult.address,
      ndc: scriptSaveResult.ndc,
      labelName: scriptSaveResult.ln,
      price: scriptSaveResult.price,
      latitude: resultLat,
      longitude: resultLon,
      distance,
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
  radius: number,
  includeGeneric: boolean,
  zipCode?: number
): Promise<DrugSearchResult[]> {
  try {
    const key = `by-price-${drugName.toLowerCase()}-${zipCode}-${radius}`;
    const state = store.getState() as any;
    const cachedEntry = state.drugSearch.cache[key];
    if (cachedEntry) return cachedEntry.results;

    // Reutilize distance-sorted cache if available
    const byDistanceKey = `by-distance-${drugName.toLowerCase()}-${zipCode}-${radius}`;
    const cachedDistanceEntry = state.drugSearch.cache[byDistanceKey];
    if (cachedDistanceEntry) {
      const sorted = [...cachedDistanceEntry.results].sort((a, b) => +a.price - +b.price);
      store.dispatch(setCacheEntry({ key, results: sorted, by: 'price' }));
      return sorted;
    }

    // Fresh query
    const searchResults = await searchDrug(drugName, radius, includeGeneric, zipCode);
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
  radius: number,
  includeGeneric: boolean,
  zipCode?: number
): Promise<DrugSearchResult[]> {
  try {
    const key = `by-distance-${drugName.toLowerCase()}-${zipCode}-${radius}`;
    const state = store.getState() as any;
    const cachedEntry = state.drugSearch.cache[key];
    if (cachedEntry) return cachedEntry.results;

    // Reutilize price-sorted cache if available
    const byPriceKey = `by-price-${drugName.toLowerCase()}-${zipCode}-${radius}`;
    const cachedByPriceEntry = state.drugSearch.cache[byPriceKey];
    if (cachedByPriceEntry) {
      const sorted = [...cachedByPriceEntry.results].sort((a, b) => +a.distance - +b.distance);
      store.dispatch(setCacheEntry({ key, results: sorted, by: 'distance' }));
      return sorted;
    }

    // Fresh query
    const searchResults = await searchDrug(drugName, radius, includeGeneric, zipCode);
    const sorted = [...searchResults].sort((a, b) => +a.distance - +b.distance);
    store.dispatch(setCacheEntry({ key, results: sorted, by: 'distance' }));
    return sorted;
  } catch (err) {
    console.error('Error in searchDrugByDistance:', err);
    return [];
  }
}
