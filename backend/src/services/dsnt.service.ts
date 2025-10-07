import axios from 'axios';
import { getDsntSecret } from '../secrets/secrets.js';

function basicHeader(user: string, pass: string) {
  const b64 = Buffer.from(`${user}:${pass}`).toString('base64');
  return `Basic ${b64}`;
}

// Shared axios client per request (keeps code obvious for a new dev)
async function client() {
  const { baseUrl, username, password } = await getDsntSecret();
  return axios.create({
    baseURL: baseUrl,
    timeout: 12_000,
    headers: {
      Authorization: basicHeader(username, password),
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  });
}

/** GET /pharmacy-drug-pricing/1.0/service/PharmacyPricing (Price by NDC) */
export async function getPriceByNdc(opts: {
  quantity: string | number;
  ndc: string;
  radius?: string | number;
  zipCode?: string;
}) {
  const c = await client();
  try {
    const res = await c.get('/pharmacy-drug-pricing/1.0/service/PharmacyPricing', {
      params: {
        quantity: String(opts.quantity),
        ndc: opts.ndc,
        radius: opts.radius !== undefined ? String(opts.radius) : undefined,
        zipCode: opts.zipCode,
      },
    });
    return res.data;
  } catch (e: any) {
    const status = e?.response?.status ?? 502;
    const msg = e?.response?.data?.message || e?.message || 'DSNT request failed';
    const err: any = new Error(msg);
    err.status = status;
    throw err;
  }
}

/** GET …/PharmacyPricing (Price by NDC and NPI List) */
export async function priceByNdcAndNpiList(opts: {
  npiList: string; // comma-separated
  quantity: string | number;
  ndc: string;
  radius?: string | number;
  zipCode?: string;
}) {
  const c = await client();
  try {
    const res = await c.get('/pharmacy-drug-pricing/1.0/service/PharmacyPricing', {
      params: {
        npiList: opts.npiList,
        quantity: String(opts.quantity),
        ndc: opts.ndc,
        radius: opts.radius !== undefined ? String(opts.radius) : undefined,
        zipCode: opts.zipCode,
      },
    });
    return res.data;
  } catch (e: any) {
    const status = e?.response?.status ?? 502;
    const msg = e?.response?.data?.message || e?.message || 'DSNT request failed';
    const err: any = new Error(msg);
    err.status = status;
    throw err;
  }
}
