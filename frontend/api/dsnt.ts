import { apiGet } from './http';
import {
  DsntPriceRequest,
  DsntPriceNpiRequest,
  DsntPriceResponse,
  DsntPriceNpiResponse,
} from './types';

export function getPriceByNdc(q: DsntPriceRequest) {
  return apiGet<DsntPriceResponse>('/api/price', q);
}

export function getPriceByNdcAndNpi(q: DsntPriceNpiRequest) {
  return apiGet<DsntPriceNpiResponse>('/api/price-ndc-npi', q);
}
