import { setCacheEntry } from '../redux/drugSearchSlice';
import { store } from '../redux/store';
import { dsntClient } from './dsntClient';
import { groupID, ndcOverride, scriptSaveClient } from './scriptSaveClient';
import {
  type DrugSearchResult,
  DsntPriceRequest,
  DsntPriceResponse,
  ScriptSaveFindDrugsResponse,
  ScriptSavePriceRequest,
  ScriptSavePriceResponse,
} from './types';

/**
 * This function queries both adjudicator APIs to find pharmacy drugs with
 * the given 'drugName', within 'radius' miles of 'zipCode'. It de-duplicates
 * results by pharmacy, selecting results with the highest price for a given
 * pharmacy. Then, it sorts the results from lowest to highest price.
 *
 * @param drugName of the drug to search.
 * @param zipCode to search for pharmacy drugs in.
 * @param radius to search within, relative to 'zipCode'.
 */
export async function searchDrugByPrice(
  drugName: string,
  zipCode: number,
  radius: number
): Promise<DrugSearchResult[]> {
  const MAX_DSNT_RADIUS = 125.99; // the maximum 'radius' value allowed by the DS&T API
  const MAX_SCRIPTSAVE_NUMRESULTS = 999999999; // the maximum 'numResults' value allowed by the ScriptSave API

  const key = `${drugName.toLowerCase()}-${zipCode}-${radius}`;
  const state = store.getState() as any;
  const cachedEntry = state.drugSearch.cache[key];

  if (cachedEntry) {
    return cachedEntry.results;
  }

  try {
    const drugsByName: ScriptSaveFindDrugsResponse =
      await scriptSaveClient.getDrugsByName(drugName);
    if (drugsByName['Drugs'].length === 0) {
      return [];
    }

    const ndc = drugsByName['Drugs'][0].NDC;

    const dsntSearchQuery: DsntPriceRequest = {
      ndc: String(ndc),
      quantity: 1,
      zipCode: String(zipCode),
      radius: Math.min(radius, MAX_DSNT_RADIUS),
    };
    const scriptSaveSearchQuery: ScriptSavePriceRequest = {
      ndc: String(ndc),
      groupID: groupID,
      quantity: 1,
      numResults: MAX_SCRIPTSAVE_NUMRESULTS,
      zipCode: String(zipCode),
      ndcOverride: ndcOverride,
    };

    const dsntDrugResults: DsntPriceResponse = await dsntClient.getPriceByNdc(dsntSearchQuery);
    const scriptSaveDrugResults: ScriptSavePriceResponse =
      await scriptSaveClient.getDrugPrices(scriptSaveSearchQuery);

    const pharmacyResultMap: Map<string, DrugSearchResult[]> = new Map();

    for (const dsntResult of dsntDrugResults.DrugPricing) {
      const convertedResult: DrugSearchResult = {
        adjudicator: 'DSNT',
        pharmacyName: dsntResult.pharmacy,
        ndc: dsntResult.ndc,
        labelName: dsntResult.labelName,
        price: dsntResult.price,
        latitude: 0, // TODO: Convert using distance function
        longitude: 0, // TODO: Convert using distance function
      };
      const existing = pharmacyResultMap.get(convertedResult.pharmacyName) ?? [];
      pharmacyResultMap.set(convertedResult.pharmacyName, [...existing, convertedResult]);
    }

    for (const scriptSaveResult of scriptSaveDrugResults.drugs) {
      const convertedResult: DrugSearchResult = {
        adjudicator: 'ScriptSave',
        pharmacyName: scriptSaveResult.pharmacyName,
        ndc: scriptSaveResult.ndc,
        labelName: scriptSaveResult.ln,
        price: scriptSaveResult.price,
        latitude: Number(scriptSaveResult.latitude),
        longitude: Number(scriptSaveResult.longitude),
      };
      const existing = pharmacyResultMap.get(convertedResult.pharmacyName) ?? [];
      pharmacyResultMap.set(convertedResult.pharmacyName, [...existing, convertedResult]);
    }

    const deDuplicatedResults: DrugSearchResult[] = [];
    for (const [_, results] of pharmacyResultMap.entries()) {
      const mostExpensive = results.reduce((a, b) => (Number(a.price) > Number(b.price) ? a : b));
      deDuplicatedResults.push(mostExpensive);
    }

    const sortedResults = deDuplicatedResults.sort((a, b) => Number(a.price) - Number(b.price));

    store.dispatch(setCacheEntry({ key, results: sortedResults, by: 'price' }));

    return sortedResults;
  } catch (err: any) {
    console.error(err);
    return [];
  }
}
