import { apiGet } from './http';

export type DsntPriceResponse = unknown;
export type DsntPriceNpiResponse = unknown; // add types?

export function getPriceByNdc(q: {
  quantity: string | number;
  ndc: string;
  radius: string | number;
  zipCode: string;
}) {
  return apiGet<DsntPriceResponse>('/api/price', q);
}

export function getPriceByNdcAndNpi(q: {
  npilist: string;
  quantity: string | number;
  ndc: string;
  radius?: string | number;
  zipCode?: string;
}) {
  return apiGet<DsntPriceNpiResponse>('/api/price-ndc-npi', q);
}
