import { apiGet } from './http';
import {
  DsntPriceNpiRequest,
  DsntPriceNpiResponse,
  DsntPriceRequest,
  DsntPriceResponse,
} from './types';

class DsntClient {
  getPriceByNdc(q: DsntPriceRequest) {
    return apiGet<DsntPriceResponse>('/api/price', q);
  }

  getPriceByNdcAndNpi(q: DsntPriceNpiRequest) {
    return apiGet<DsntPriceNpiResponse>('/api/price-ndc-npi', q);
  }
}

export const dsntClient = new DsntClient();
