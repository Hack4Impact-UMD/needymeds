import axios from 'axios';
import { getDSNTSecret } from '../secrets/secrets';

function basicHeader(user: string, pass: string) {
  const b64 = Buffer.from(`${user}:${pass}`).toString('base64');
  return `Basic ${b64}`;
}

async function client() {
  const { baseUrl, username, password } = await getDSNTSecret();

  return axios.create({
    baseURL: baseUrl,
    timeout: 12_000,
    headers: {
      Authorization: basicHeader(username, password),
      Accept: 'application/json',
    },
    validateStatus: () => true,
  });
}

// ----------------------------- Validation helpers -------------------------
const NDC_RE = /^\d{11}$/; // 11 digit ndc (no dashes)
const ZIP_RE = /^\d{5}$/; // simple 5-digit US zip
const NPILIST_RE = /^(\d{10},( )?)*\d{10}$/; // comma-separated 10-digit NPIs

function validateCommon(opts: {
  ndc: string;
  npilist?: string;
  quantity: string;
  radius?: string;
  zipCode?: string;
}) {
  const numericQuantity = Number(opts.quantity);
  const numericRadius = Number(opts.radius);

  if (!NDC_RE.test(opts.ndc)) return 'Invalid ndc (expect 11 digits)';
  if (opts.npilist !== undefined && !NPILIST_RE.test(opts.npilist))
    return 'Invalid npilist (expect comma-separated 10-digit npis)';
  if (!(Number.isFinite(numericQuantity) && numericQuantity > 0))
    return 'Invalid quantity (must be >0)';
  if (opts.radius !== undefined && !(Number.isFinite(numericRadius) && numericRadius > 0))
    return 'Invalid radius (must be >0)';
  if (opts.zipCode !== undefined && opts.zipCode !== '' && !ZIP_RE.test(opts.zipCode))
    return 'Invalid zipCode (expect 5 digits)';
  return null;
}

async function performRequest(path: string, params: Record<string, any>) {
  const c = await client();

  const MAX_ATTEMPTS = 3;
  let lastError: any;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const res = await c.get(path, { params });
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
  ndc: string;
  quantity: string;
  radius?: string;
  zipCode?: string;
}) {
  const validationError = validateCommon({
    ndc: opts.ndc,
    quantity: opts.quantity,
    radius: opts.radius,
    zipCode: opts.zipCode,
  });
  if (validationError) {
    const err: any = new Error(validationError);
    err.status = 400;
    throw err;
  }

  return performRequest('/PharmacyPricing', {
    ndc: opts.ndc,
    quantity: opts.quantity,
    radius: opts.radius,
    zipCode: opts.zipCode,
  });
}

// Price by NDC and NPI List
export async function priceByNdcAndNpiList(opts: {
  npilist: string;
  quantity: string;
  ndc: string;
  radius?: string;
  zipCode?: string;
}) {
  const validationError = validateCommon({
    npilist: opts.npilist,
    quantity: opts.quantity,
    ndc: opts.ndc,
    radius: opts.radius,
    zipCode: opts.zipCode,
  });
  if (validationError) {
    const err: any = new Error(validationError);
    err.status = 400;
    throw err;
  }

  return performRequest('/PharmacyPricing', {
    npilist: opts.npilist,
    quantity: opts.quantity,
    ndc: opts.ndc,
    radius: opts.radius,
    zipCode: opts.zipCode,
  });
}
