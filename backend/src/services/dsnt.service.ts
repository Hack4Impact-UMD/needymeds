import axios from 'axios';
import { getDSNTSecret } from '../secrets/secrets';

function basicHeader(user: string, pass: string) {
  const b64 = Buffer.from(`${user}:${pass}`).toString('base64');
  return `Basic ${b64}`;
}

async function client() {
  const { baseUrl, username, password } = await getDSNTSecret();

  if (!/^https:\/\/argusprod\.dstsystems\.com\b/.test(baseUrl)) {
    const err: any = new Error('Invalid DS&T baseUrl (expected argusprod.dstsystems.com)');
    err.status = 500;
    throw err;
  }

  // Normalize base URL (remove trailing slash)
  const normalized = baseUrl.replace(/\/$/, '');

  return axios.create({
    baseURL: normalized,
    timeout: 12_000,
    headers: {
      Authorization: basicHeader(username, password),
      Accept: 'application/json',
    },
    validateStatus: () => true,
  });
}

// ----------------------------- Validation helpers -------------------------
const NDC_RE = /^\d{10}$/; // 10 digit ndc (no dashes)
const ZIP_RE = /^\d{5}$/; // simple 5-digit US zip
const NPI_RE = /^\d{10}$/; // 10 digit NPI

function validateCommon(opts: {
  ndc: string;
  quantity: number;
  radius?: number;
  zipCode?: string;
}) {
  if (!NDC_RE.test(opts.ndc)) return 'Invalid ndc (expect 11 digits)';
  if (!(Number.isFinite(opts.quantity) && opts.quantity > 0))
    return 'Invalid quantity (must be >0)';
  if (opts.radius !== undefined && !(Number.isFinite(opts.radius) && opts.radius > 0))
    return 'Invalid radius (must be >0)';
  if (opts.zipCode !== undefined && opts.zipCode !== '' && !ZIP_RE.test(opts.zipCode))
    return 'Invalid zipCode (expect 5 digits)';
  return null;
}

function validateNpiList(npilist: string) {
  if (!npilist) return 'npilist required';
  const parts = npilist.split(',');
  if (parts.some((p) => !NPI_RE.test(p))) return 'Invalid npi in list (10 digits each)';
  return null;
}

// Decide endpoint path depending on whether baseUrl already includes the service path.
function endpointPath(baseUrl: string) {
  return /\/pharmacy-drug-pricing\/1\.0\/service$/.test(baseUrl.replace(/\/$/, ''))
    ? '/PharmacyPricing'
    : '/pharmacy-drug-pricing/1.0/service/PharmacyPricing';
}

async function performRequest(path: string, params: Record<string, any>) {
  const c = await client();
  const fullPath =
    endpointPath(c.defaults.baseURL || '') === '/PharmacyPricing' ? '/PharmacyPricing' : path; // safety

  const MAX_ATTEMPTS = 3;
  let lastError: any;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const res = await c.get(fullPath, { params });
    if (res.status >= 200 && res.status < 300) return res.data;
    if (res.status >= 400 && res.status < 500) {
      const err: any = new Error(`DS&T returned ${res.status}`);
      err.status = res.status;
      throw err;
    }
    // 5xx -> retry except last attempt
    lastError = res;
    if (attempt < MAX_ATTEMPTS) continue;
  }
  const res = lastError;
  const err: any = new Error(`DS&T returned ${res.status}`);
  err.status = res.status;
  throw err;
}

// Price by NDC
export async function getPriceByNdc(opts: {
  quantity: string | number;
  ndc: string;
  radius?: string | number;
  zipCode?: string;
}) {
  const numericQuantity = Number(opts.quantity);
  const numericRadius = opts.radius !== undefined ? Number(opts.radius) : undefined;
  const validationError = validateCommon({
    ndc: opts.ndc,
    quantity: numericQuantity,
    radius: numericRadius,
    zipCode: opts.zipCode,
  });
  if (validationError) {
    const err: any = new Error(validationError);
    err.status = 400;
    throw err;
  }

  return performRequest('/pharmacy-drug-pricing/1.0/service/PharmacyPricing', {
    quantity: String(opts.quantity),
    ndc: opts.ndc,
    radius: numericRadius !== undefined ? String(numericRadius) : undefined,
    zipCode: opts.zipCode,
  });
}

// Price by NDC and NPI List
export async function priceByNdcAndNpiList(opts: {
  npilist: string;
  quantity: string | number;
  ndc: string;
  radius?: string | number;
  zipCode?: string;
}) {
  const numericQuantity = Number(opts.quantity);
  const numericRadius = opts.radius !== undefined ? Number(opts.radius) : undefined;
  const validationError =
    validateCommon({
      ndc: opts.ndc,
      quantity: numericQuantity,
      radius: numericRadius,
      zipCode: opts.zipCode,
    }) || validateNpiList(opts.npilist);
  if (validationError) {
    const err: any = new Error(validationError);
    err.status = 400;
    throw err;
  }

  return performRequest('/pharmacy-drug-pricing/1.0/service/PharmacyPricing', {
    npilist: opts.npilist,
    quantity: String(opts.quantity),
    ndc: opts.ndc,
    radius: numericRadius !== undefined ? String(numericRadius) : undefined,
    zipCode: opts.zipCode,
  });
}

// ---------------------------------------------------------------------------
// Compatibility class (legacy interface expected by existing tests/routes)
// ---------------------------------------------------------------------------
// legacy DSNTService class removed; prefer functional exports above
