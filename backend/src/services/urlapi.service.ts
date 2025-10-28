import axios from 'axios';
import { getUrlApiSecret } from '../secrets/secrets';

// ----------------------------- Axios Client -----------------------------
async function client() {
  const { baseUrl, xApiKey } = await getUrlApiSecret();

  return axios.create({
    baseURL: baseUrl,
    timeout: 12000,
    headers: {
      Accept: 'application/json',
      'x-api-key': xApiKey,
    },
    validateStatus: () => true,
  });
}

type httpMethod = 'GET' | 'POST';

// ----------------------------- Request Helper -----------------------------
async function performRequest(method: httpMethod, path: string, params: Record<string, any>) {
  const c = await client();
  const MAX_ATTEMPTS = 3;
  let lastError: any;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    let res;
    try {
      if (method === 'GET') {
        res = await c.get(path, { params });
      } else if (method === 'POST') {
        res = await c.post(path, params);
      } else {
        throw new Error('Invalid HTTP method');
      }
    } catch (err) {
      // Network / timeout errors — retry
      lastError = err;
      if (attempt < MAX_ATTEMPTS) continue;
      throw new Error(`URL API request failed after ${MAX_ATTEMPTS} attempts: ${err}`);
    }

    if (res.status >= 200 && res.status < 300) return res.data;
    if (res.status >= 400 && res.status < 500) {
      const err: any = new Error(`URL API returned ${res.status}`);
      err.status = res.status;
      throw err;
    }

    // Retry for 5xx errors unless last attempt
    lastError = res;
    if (attempt < MAX_ATTEMPTS) continue;
  }

  const res = lastError;
  const err: any = new Error(`URL API returned ${res.status}`);
  err.status = res.status;
  throw err;
}

// ----------------------------- Validation Helpers -----------------------------
const NDC_RE = /^\d{10}$/; // 10-digit NDC

function validate(opts: { ndc?: string }) {
  if (!opts.ndc) return 'ndc is required';
  if (!NDC_RE.test(opts.ndc)) return 'ndc must be a 10-digit numeric string';
  return null;
}

// ----------------------------- API Functions -----------------------------

// NDC Request
export async function getUrlResponse(opts: { ndc: string }) {
  const validationError = validate({ ndc: opts.ndc });
  if (validationError) {
    const err: any = new Error(validationError);
    err.status = 400;
    throw err;
  }

  return performRequest('GET', '/lookup', {
    ndc: opts.ndc,
  });
}
