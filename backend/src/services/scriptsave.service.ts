import axios from 'axios';
import { scriptSaveTokenManager } from '../auth/scriptsave.tokenManager';
import { getScriptSaveSecret } from '../secrets/secrets';

async function client() {
  const { baseUrl, subscriptionKey } = await getScriptSaveSecret();

  const JWToken = await scriptSaveTokenManager.getToken();

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

type httpMethod = 'GET' | 'POST';

async function performRequest(method: httpMethod, path: string, params: Record<string, any>) {
  const MAX_ATTEMPTS = 3; // for 5xx retries
  let lastError: any;
  let retried401 = false; // only retry 401 once

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const c = await client(); // always fetch latest token

    let res;
    try {
      if (method === 'GET') {
        res = await c.get(path, { params });
      } else if (method === 'POST') {
        res = await c.post(path, params);
      } else {
        throw new Error(`Invalid HTTP method`);
      }
    } catch (err) {
      lastError = err;
      continue;
    }

    if (res.status >= 200 && res.status < 300) return res.data;

    if (res.status === 401 && !retried401) {
      retried401 = true;
      await scriptSaveTokenManager.refreshToken();
      continue;
    }

    if (res.status >= 400 && res.status < 500) {
      const err: any = new Error(`ScriptSave returned ${res.status}`);
      err.status = res.status;
      throw err;
    }

    // 5xx -> retry unless last attempt
    lastError = res;
    if (attempt < MAX_ATTEMPTS) continue;
  }

  const res = lastError;
  const err: any = new Error(`ScriptSave returned ${res?.status ?? 'unknown'}`);
  err.status = res?.status ?? 500;
  throw err;
}

// ----------------------------- Validation helpers -------------------------
const GSN_RE = /^\d{6}$/; // 6-digit GSN
const NCPDP_RE = /^\[("\d*")+(,\s*("\d*")+)*\]$/; // numerical string list
const NDC_RE = /^\d{11}$/; // 11 digit ndc (no dashes)
const ZIP_RE = /^\d{5}$/; // simple 5-digit US zip

function validate(opts: {
  count?: string;
  groupID?: string;
  gsn?: string;
  includeDrugInfo?: string;
  includeDrugImage?: string;
  ncpdp?: string;
  ndc?: string;
  ndcOverride?: string;
  numPharm?: string;
  numResults?: string;
  prefixText?: string;
  quantity?: string;
  useUC?: string;
  zipCode?: string;
}) {
  const numericCount = Number(opts.count);
  const numericGroupID = Number(opts.groupID);
  const numericNumPharm = Number(opts.numPharm);
  const numericNumResults = Number(opts.numResults);
  const numericQuantity = Number(opts.quantity);

  if (opts.count !== undefined && !(Number.isFinite(numericCount) && numericCount > 0))
    return 'Invalid count (must be >0)';
  if (opts.groupID !== undefined && !Number.isFinite(numericGroupID))
    return 'Invalid groupID (must be a number)';
  if (opts.gsn !== undefined && !GSN_RE.test(opts.gsn)) return 'Invalid gsn (expect 6 digits)';
  if (
    opts.includeDrugInfo !== undefined &&
    !(opts.includeDrugInfo === 'true' || opts.includeDrugInfo === 'false')
  ) {
    return 'Invalid includeDrugInfo (must be boolean)';
  }
  if (
    opts.includeDrugImage !== undefined &&
    !(opts.includeDrugImage === 'true' || opts.includeDrugImage === 'false')
  ) {
    return 'Invalid includeDrugImage (must be boolean)';
  }
  if (opts.ncpdp !== undefined && !NCPDP_RE.test(opts.ncpdp))
    return 'Invalid ncpdp (expect numerical string list)';
  if (opts.ndc !== undefined && !NDC_RE.test(opts.ndc)) return 'Invalid ndc (expect 11 digits)';
  if (
    opts.ndcOverride !== undefined &&
    !(opts.ndcOverride === 'true' || opts.ndcOverride === 'false')
  ) {
    return 'Invalid ndcOverride (must be boolean)';
  }
  if (opts.numPharm !== undefined && !(Number.isFinite(numericNumPharm) && numericNumPharm > 0))
    return 'Invalid numPharm (must be >0)';
  if (
    opts.numResults !== undefined &&
    !(Number.isFinite(numericNumResults) && numericNumResults > 0)
  )
    return 'Invalid numResults (must be >0)';
  if (opts.prefixText !== undefined && opts.prefixText === '')
    return 'Invalid prefixText (must be non-empty)';
  if (opts.quantity !== undefined && !(Number.isFinite(numericQuantity) && numericQuantity > 0))
    return 'Invalid quantity (must be >0)';
  if (opts.useUC !== undefined && !(opts.useUC === 'true' || opts.useUC === 'false')) {
    return 'Invalid useUC (must be boolean)';
  }
  if (opts.zipCode !== undefined && opts.zipCode !== '' && !ZIP_RE.test(opts.zipCode))
    return 'Invalid zipCode (expect 5 digits)';
  return null;
}

// 001 AutoComplete
export async function autoComplete(opts: { prefixText: string; groupID: string; count?: string }) {
  const validationError = validate({
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
  brandIndicator?: string;
  ndc: string;
  includeDrugInfo?: string;
  includeDrugImage?: string;
  quantity?: string;
  numPharm?: string;
  zipCode?: string;
  useUC?: string;
  ndcOverride?: string;
}) {
  const validationError = validate({
    groupID: opts.groupID,
    ndc: opts.ndc,
    includeDrugInfo: opts.includeDrugInfo,
    includeDrugImage: opts.includeDrugImage,
    quantity: opts.quantity,
    numPharm: opts.numPharm,
    zipCode: opts.zipCode,
    useUC: opts.useUC,
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
  brandIndicator?: string;
  drugName: string;
  includeDrugInfo?: string;
  includeDrugImage?: string;
  quantity?: string;
  numPharm?: string;
  zipCode?: string;
  useUC?: string;
}) {
  const validationError = validate({
    groupID: opts.groupID,
    includeDrugInfo: opts.includeDrugInfo,
    includeDrugImage: opts.includeDrugImage,
    quantity: opts.quantity,
    numPharm: opts.numPharm,
    zipCode: opts.zipCode,
    useUC: opts.useUC,
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
  brandIndicator?: string;
  gsn: string;
  referencedBN?: string;
  includeDrugInfo?: string;
  includeDrugImage?: string;
  quantity?: string;
  numPharm?: string;
  zipCode?: string;
  useUC?: string;
}) {
  const validationError = validate({
    groupID: opts.groupID,
    gsn: opts.gsn,
    includeDrugInfo: opts.includeDrugInfo,
    includeDrugImage: opts.includeDrugImage,
    quantity: opts.quantity,
    zipCode: opts.zipCode,
    useUC: opts.useUC,
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
  const validationError = validate({
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
  ndcOverride?: string;
}) {
  const validationError = validate({
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
    NDC: opts.ndc,
    NCPDP: opts.ncpdp,
    groupID: opts.groupID,
    quantity: opts.quantity,
    NDCOverride: opts.ndcOverride,
  });
}

// 005 Price Drugs
export async function priceDrugs(opts: {
  ndc: string;
  groupID: string;
  quantity: string;
  numResults: string;
  zipCode: string;
  ndcOverride?: string;
}) {
  const validationError = validate({
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

  return performRequest('GET', '/pharmacypricing/api/pricing/pricedrugs', {
    NDC: opts.ndc,
    groupID: opts.groupID,
    quantity: opts.quantity,
    numResults: opts.numResults,
    zipCode: opts.zipCode,
    NDCOverride: opts.ndcOverride,
  });
}

// 006 PriceDrugsByNCPDP
export async function priceDrugsByNCPDP(opts: {
  ndc: string;
  ncpdp: string;
  groupID: string;
  quantity: string;
  ndcOverride?: string;
}) {
  const validationError = validate({
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

  const parsedNcpdp = (() => {
    try {
      const arr = JSON.parse(String(opts.ncpdp));
      return Array.isArray(arr) ? arr : [String(opts.ncpdp)];
    } catch {
      return [String(opts.ncpdp)];
    }
  })();

  return performRequest('POST', '/pricingenginecore/api/Pricing/PriceDrugsByNCPDP', {
    NDC: opts.ndc,
    NCPDP: parsedNcpdp,
    groupID: opts.groupID,
    quantity: opts.quantity,
    NDCOverride: opts.ndcOverride,
  });
}

// 007 GenerateCardholder
export async function generateCardholder(opts: { groupID: string }) {
  const validationError = validate({
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
