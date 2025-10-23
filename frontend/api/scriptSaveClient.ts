import { apiGet } from './http';
import {
  ScriptSaveFindDrugsRequest,
  ScriptSaveFindDrugsResponse,
  ScriptSavePriceRequest,
  ScriptSavePriceResponse,
} from './types';

export const groupID = 4295;
export const ncpdp = 1918119;
export const ndcOverride = true;

class ScriptSaveClient {
  getDrugsByName(q: ScriptSaveFindDrugsRequest) {
    return apiGet<ScriptSaveFindDrugsResponse>('/findDrugsUsingDrugName', q);
  }

  getDrugPrices(q: ScriptSavePriceRequest) {
    return apiGet<ScriptSavePriceResponse>('/priceDrugs', q);
  }
}

export const scriptSaveClient = new ScriptSaveClient();
