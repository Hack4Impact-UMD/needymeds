import axios from 'axios';
import { getJWToken } from '../auth/scriptsave.tokenManager'; // placeholder
import { getScriptSaveSecret } from '../secrets/secrets'; // placeholder

async function client() {
  const { baseURL, subscriptionKey } = await getScriptSaveSecret();

  const JWToken = getJWToken();

  return axios.create({
    baseURL,
    timeout: 12000,
    headers: {
      Authorization: `Bearer ${JWToken}`,
      Accept: 'application/json',
      'Ocp-Apim-Subscription-Key': subscriptionKey,
    },
    validateStatus: () => true,
  });
}

async function performRequest(path: string, params: Record<string, any>) {
  const c = await client();

  const MAX_ATTEMPTS = 3;
  let lastError: any;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const res = await c.get(path, { params });
    if (res.status >= 200 && res.status < 300) return res.data;
    if (res.status >= 400 && res.status < 500) {
      const err: any = new Error(`ScriptSave returned ${res.status}`);
      err.status = res.status;
      throw err;
    }
    // 5xx -> retry except last attempt
    lastError = res;
    if (attempt < MAX_ATTEMPTS) continue;
  }
  const res = lastError;
  const err: any = new Error(`ScriptSave returned ${res.status}`);
  err.status = res.status;
  throw err;
}

// 003 GetDrugFormStrength
export async function getDrugFormStrength(opts: { groupID: number; gsn: number }) {
  return performRequest('/pricingapi/api/PricingEngineExternal/DrugFormStrength', {
    groupID: String(opts.groupID),
    gsn: String(opts.gsn),
  });
}

// 004 Price Drug
export async function priceDrug(opts: {
  ndc: number;
  ncpdp: number;
  groupID: number;
  quantity: number;
  ndcOverride: boolean;
}) {
  return performRequest('/pricingenginecore/api/pricing/pricedrug', {
    ndc: String(opts.ndc),
    ncpdp: String(opts.ncpdp),
    groupID: String(opts.groupID),
    quantity: String(opts.quantity),
    ndcOverride: String(opts.ndcOverride),
  });
}

// 005 Price Drugs
export async function priceDrugs(opts: {
  ndc: number;
  groupID: number;
  quantity: number;
  numResults: number;
  zipCode: number;
  ndcOverride: boolean;
}) {
  return performRequest('/pricingenginecore/api/pricing/pricedrug', {
    ndc: String(opts.ndc),
    groupID: String(opts.groupID),
    quantity: String(opts.quantity),
    numResults: String(opts.numResults),
    zipCode: String(opts.zipCode),
    ndcOverride: String(opts.ndcOverride),
  });
}
