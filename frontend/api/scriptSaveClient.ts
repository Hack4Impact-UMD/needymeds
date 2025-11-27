import { apiGet } from './http';
import {
  ScriptSaveAutoCompleteRequest,
  ScriptSaveAutoCompleteResponse,
  ScriptSaveFindDrugsRequest,
  ScriptSaveFindDrugsResponse,
  ScriptSaveGetDrugFormStrengthRequest,
  ScriptSaveGetDrugFormStrengthResponse,
  ScriptSavePriceRequest,
  ScriptSavePriceResponse,
} from './types';

export const groupID = 4295;
export const ncpdp = 1918119;
export const ndcOverride = true;

class ScriptSaveClient {
  autoComplete(q: ScriptSaveAutoCompleteRequest) {
    return apiGet<ScriptSaveAutoCompleteResponse>('/api/scriptsave/autoComplete', q);
  }

  getDrugsByName(q: ScriptSaveFindDrugsRequest) {
    return apiGet<ScriptSaveFindDrugsResponse>('/api/scriptsave/findDrugsUsingDrugName', q);
  }

  getDrugFormStrength(q: ScriptSaveGetDrugFormStrengthRequest) {
    return apiGet<ScriptSaveGetDrugFormStrengthResponse>('/api/scriptsave/getDrugFormStrength', q);
  }

  getDrugPrices(q: ScriptSavePriceRequest) {
    return apiGet<ScriptSavePriceResponse>('/api/scriptsave/priceDrugs', q);
  }
}

export const scriptSaveClient = new ScriptSaveClient();
