import axios from 'axios';
import { getDsntSecret } from '../secrets/secrets';

function basicHeader(user: string, pass: string) {
  const b64 = Buffer.from(`${user}:${pass}`).toString('base64');
  return `Basic ${b64}`;
}

async function client() {
  const { baseUrl, username, password } = await getDsntSecret();

  if (!/^https:\/\/argusprod\.dstsystems\.com\b/.test(baseUrl)) {
    const err: any = new Error('Invalid DS&T baseUrl (expected argusprod.dstsystems.com)');
    err.status = 500;
    throw err;
  }

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

// Price by NDC
export async function getPriceByNdc(opts: {
  quantity: string | number;
  ndc: string;
  radius?: string | number;
  zipCode?: string;
}) {
  const c = await client();

  const res = await c.get('/pharmacy-drug-pricing/1.0/service/PharmacyPricing', {
    params: {
      quantity: String(opts.quantity),
      ndc: opts.ndc,
      radius: opts.radius !== undefined ? String(opts.radius) : undefined,
      zipCode: opts.zipCode,
    },
  });

  if (res.status >= 200 && res.status < 300) return res.data;

  const msg =
    (res.data && ((res.data as any)?.message || (res.data as any)?.error)) ||
    `DSNT request failed (${res.status})`;
  const err: any = new Error(msg);
  err.status = res.status;
  throw err;
}

// Price by NDC and NPI List
export async function priceByNdcAndNpiList(opts: {
  npilist: string;
  quantity: string | number;
  ndc: string;
  radius?: string | number;
  zipCode?: string;
}) {
  const c = await client();

  const res = await c.get('/pharmacy-drug-pricing/1.0/service/PharmacyPricing', {
    params: {
      npilist: opts.npilist,
      quantity: String(opts.quantity),
      ndc: opts.ndc,
      radius: opts.radius !== undefined ? String(opts.radius) : undefined,
      zipCode: opts.zipCode,
    },
  });

  if (res.status >= 200 && res.status < 300) return res.data;

  const msg =
    (res.data && ((res.data as any)?.message || (res.data as any)?.error)) ||
    `DSNT request failed (${res.status})`;
  const err: any = new Error(msg);
  err.status = res.status;
  throw err;
}
