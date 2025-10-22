import { apiGet } from './http';
import { ScriptSaveFindDrugsResponse, ScriptSavePriceResponse } from './types';

// TODO: ask NPO about these
export const groupID = 4295;
export const ncpdp = 1918119;
export const ndcOverride = true;

class ScriptSaveClient {
  getDrugsByName(q: any) {
    return apiGet<ScriptSaveFindDrugsResponse>('/findDrugsUsingDrugName', q);
  }

  getDrugPrices(q: any) {
    return apiGet<ScriptSavePriceResponse>('/priceDrugs', q);
  }
}

export const scriptSaveClient = new ScriptSaveClient();
