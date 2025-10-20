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

// ----------------------------- Validation helpers -------------------------
const GSN_RE = /^\d{5}$/; // 6-digit GSN
const NDC_RE = /^\d{11}$/; // 11 digit ndc (no dashes)
const NCPDP_RE = /^\[("(\d)+")*\]$/;
const ZIP_RE = /^\d{5}$/; // simple 5-digit US zip

function validateCommon(opts: {
  groupID?: string;
  gsn?: string;
  ndc?: string;
  ncpdp?: string;
  quantity?: string;
  ndcOverride?: string;
  numResults?: string;
  zipCode?: string;
}) {
  const numericGroupID = Number(opts.groupID);
  const numericQuantity = Number(opts.quantity);
  const numericNumResults = Number(opts.numResults);

  if (opts.groupID !== undefined && !Number.isFinite(numericGroupID))
    return 'Invalid groupID (must be >0)';
  if (opts.gsn !== undefined && !GSN_RE.test(opts.gsn)) return 'Invalid gsn (expect 6 digits)';
  if (opts.ndc !== undefined && !NDC_RE.test(opts.ndc)) return 'Invalid ndc (expect 11 digits)';
  if (opts.ncpdp !== undefined && !NCPDP_RE.test(opts.ncpdp))
    return 'Invalid ncpdp (expect numerical list)';
  if (opts.quantity !== undefined && !(Number.isFinite(numericQuantity) && numericQuantity > 0))
    return 'Invalid quantity (must be >0)';
  if (
    opts.ndcOverride !== undefined &&
    !(opts.ndcOverride === 'true' || opts.ndcOverride === 'false')
  ) {
    return 'Invalid ndcOverride (must be boolean)';
  }
  if (
    opts.numResults !== undefined &&
    !(Number.isFinite(numericNumResults) && numericNumResults > 0)
  )
    return 'Invalid numResults (must be >0)';
  if (opts.zipCode !== undefined && opts.zipCode !== '' && !ZIP_RE.test(opts.zipCode))
    return 'Invalid zipCode (expect 5 digits)';
  return null;
}

type httpMethod = 'GET' | 'POST';

async function performRequest(method: httpMethod, path: string, params: Record<string, any>) {
  const c = await client();

  const MAX_ATTEMPTS = 3;
  let lastError: any;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    let res;
    if (method === 'GET') {
      res = await c.get(path, { params });
    } else if (method === 'POST') {
      res = await c.post(path, { params });
    } else {
      throw new Error(`Invalid HTTP method`);
    }

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
export async function getDrugFormStrength(opts: { groupID: string; gsn: string }) {
  const validationError = validateCommon({
    groupID: opts.groupID,
    gsn: opts.gsn,
  });
  if (validationError) {
    const err: any = new Error(validationError);
    err.status = 400;
    throw err;
  }

  return performRequest('GET', '/pricingapi/api/PricingEngineExternal/DrugFormStrength', {
    groupID: opts.groupID,
    gsn: opts.gsn,
  });
}

// 004 Price Drug
export async function priceDrug(opts: {
  ndc: string;
  ncpdp: string;
  groupID: string;
  quantity: string;
  ndcOverride: string;
}) {
  const validationError = validateCommon({
    ndc: opts.ndc,
    ncpdp: opts.ncpdp,
    groupID: opts.groupID,
    quantity: opts.quantity,
    ndcOverride: opts.ndcOverride,
  });
  if (validationError) {
    const err: any = new Error(validationError);
    err.status = 400;
    throw err;
  }

  return performRequest('GET', '/pricingenginecore/api/pricing/pricedrug', {
    ndc: opts.ndc,
    ncpdp: opts.ncpdp,
    groupID: opts.groupID,
    quantity: opts.quantity,
    ndcOverride: opts.ndcOverride,
  });
}

// 005 Price Drugs
export async function priceDrugs(opts: {
  ndc: string;
  groupID: string;
  quantity: string;
  numResults: string;
  zipCode: string;
  ndcOverride: string;
}) {
  const validationError = validateCommon({
    ndc: opts.ndc,
    groupID: opts.groupID,
    quantity: opts.quantity,
    numResults: opts.numResults,
    zipCode: opts.zipCode,
    ndcOverride: opts.ndcOverride,
  });
  if (validationError) {
    const err: any = new Error(validationError);
    err.status = 400;
    throw err;
  }

  return performRequest('GET', '/pricingenginecore/api/pricing/pricedrug', {
    ndc: opts.ndc,
    groupID: opts.groupID,
    quantity: opts.quantity,
    numResults: opts.numResults,
    zipCode: opts.zipCode,
    ndcOverride: opts.ndcOverride,
  });
}

// 006 PriceDrugsByNCPDP
export async function priceDrugsByNCPDP(opts: {
  ndc: string;
  ncpdp: string;
  groupID: string;
  quantity: string;
  ndcOverride: string;
}) {
  const validationError = validateCommon({
    ndc: opts.ndc,
    ncpdp: opts.ncpdp,
    groupID: opts.groupID,
    quantity: opts.quantity,
    ndcOverride: opts.ndcOverride,
  });
  if (validationError) {
    const err: any = new Error(validationError);
    err.status = 400;
    throw err;
  }

  return performRequest('POST', '/pricingenginecore/api/Pricing/PriceDrugsByNCPDP', {
    NDC: opts.ndc,
    NCPDP: opts.ncpdp,
    groupID: opts.groupID,
    quantity: opts.quantity,
    ndcoverride: opts.ndcOverride,
  });
}

// 007 GenerateCardholder
export async function generateCardholder(opts: { groupID: string }) {
  const validationError = validateCommon({
    groupID: opts.groupID,
  });
  if (validationError) {
    const err: any = new Error(validationError);
    err.status = 400;
    throw err;
  }

  return performRequest('GET', '/pricingenginecore/api/pricing/GenerateCardholder', {
    groupID: opts.groupID,
  });
}
