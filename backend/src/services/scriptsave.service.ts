import axios from 'axios';
import { scriptSaveTokenManager } from '../auth/scriptsave.tokenManager'; // placeholder
import { getScriptSaveSecret } from '../secrets/secrets'; // placeholder

async function client() {
  const { baseUrl, subscriptionKey } = await getScriptSaveSecret();

  const JWToken = scriptSaveTokenManager.getToken();

  return axios.create({
    baseURL: baseUrl,
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
  prefixText?: string;
  groupID?: string;
  count?: string;
  gsn?: string;
  ndc?: string;
  ncpdp?: string;
  quantity?: string;
  ndcOverride?: string;
  numResults?: string;
  zipCode?: string;
}) {
  const numericGroupID = Number(opts.groupID);
  const numericCount = Number(opts.count);
  const numericQuantity = Number(opts.quantity);
  const numericNumResults = Number(opts.numResults);

  if (opts.prefixText !== undefined && opts.prefixText === '')
    return 'Invalid prefixText (must be non-empty)';
  if (opts.groupID !== undefined && !Number.isFinite(numericGroupID))
    return 'Invalid groupID (must be >0)';
  if (opts.count !== undefined && !(Number.isFinite(numericCount) && numericCount > 0))
    return 'Invalid count (must be >0)';
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

// 001 AutoComplete
export async function autoComplete(opts: { prefixText: string; groupID: string; count?: string }) {
  const validationError = validateCommon({
    prefixText: opts.prefixText,
    groupID: opts.groupID,
    count: opts.count,
  });
  if (validationError) {
    const err: any = new Error(validationError);
    err.status = 400;
    throw err;
  }

  return performRequest('GET', '/PricingAPI/api/PricingEngineExternal/AutoComplete', {
    PrefixText: opts.prefixText,
    groupID: opts.groupID,
    Count: opts.count,
  });
}

// 002a FindDrugs - Using NDC11
export async function findDrugsUsingNDC11(opts: {
  groupID: string;
  brandIndicator: string;
  ndc: string;
  includeDrugInfo: string;
  includeDrugImage: string;
  quantity: string;
  numPharm: string;
  zipCode: string;
  useUC: string;
  ndcOverride: string;
}) {
  const validationError = validateCommon({
    groupID: opts.groupID,
    ndc: opts.ndc,
    quantity: opts.quantity,
    zipCode: opts.zipCode,
    ndcOverride: opts.ndcOverride,
  });
  if (validationError) {
    const err: any = new Error(validationError);
    err.status = 400;
    throw err;
  }

  return performRequest('GET', '/PricingAPI/api/PricingEngineExternal/FindDrugs', {
    groupID: opts.groupID,
    BrandIndicator: opts.brandIndicator,
    NDC: opts.ndc,
    IncludeDrugInfo: opts.includeDrugInfo,
    IncludeDrugImage: opts.includeDrugImage,
    qty: opts.quantity,
    numPharm: opts.numPharm,
    zip: opts.zipCode,
    UseUC: opts.useUC,
    NDCOverride: opts.ndcOverride,
  });
}

// 002b FindDrugs - Using DrugName
export async function findDrugsUsingDrugName(opts: {
  groupID: string;
  brandIndicator: string;
  drugName: string;
  includeDrugInfo: string;
  includeDrugImage: string;
  quantity: string;
  numPharm: string;
  zipCode: string;
  useUC: string;
}) {
  const validationError = validateCommon({
    groupID: opts.groupID,
    quantity: opts.quantity,
    zipCode: opts.zipCode,
  });
  if (validationError) {
    const err: any = new Error(validationError);
    err.status = 400;
    throw err;
  }

  return performRequest('GET', '/PricingAPI/api/PricingEngineExternal/FindDrugs', {
    groupID: opts.groupID,
    BrandIndicator: opts.brandIndicator,
    DrugName: opts.drugName,
    IncludeDrugInfo: opts.includeDrugInfo,
    IncludeDrugImage: opts.includeDrugImage,
    qty: opts.quantity,
    numPharm: opts.numPharm,
    zip: opts.zipCode,
    UseUC: opts.useUC,
  });
}

// 002c FindDrugs - Using GSN and ReferencedBN
export async function findDrugsUsingGSNAndReferencedBN(opts: {
  groupID: string;
  brandIndicator: string;
  gsn: string;
  referencedBN: string;
  includeDrugInfo: string;
  includeDrugImage: string;
  quantity: string;
  numPharm: string;
  zipCode: string;
  useUC: string;
}) {
  const validationError = validateCommon({
    groupID: opts.groupID,
    quantity: opts.quantity,
    zipCode: opts.zipCode,
  });
  if (validationError) {
    const err: any = new Error(validationError);
    err.status = 400;
    throw err;
  }

  return performRequest('GET', '/PricingAPI/api/PricingEngineExternal/FindDrugs', {
    groupID: opts.groupID,
    BrandIndicator: opts.brandIndicator,
    GSN: opts.gsn,
    referencedBN: opts.referencedBN,
    IncludeDrugInfo: opts.includeDrugInfo,
    IncludeDrugImage: opts.includeDrugImage,
    qty: opts.quantity,
    numPharm: opts.numPharm,
    zip: opts.zipCode,
    UseUC: opts.useUC,
  });
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
