import { apiGet } from './http';
import {
  DsntPriceNpiRequest,
  DsntPriceNpiResponse,
  DsntPriceRequest,
  DsntPriceResponse,
} from './types';

class DsntClient {
  getPriceByNdc(q: DsntPriceRequest) {
    return apiGet<DsntPriceResponse>('/api/dsnt/price', q);
  }

  getPriceByNdcAndNpi(q: DsntPriceNpiRequest) {
    return apiGet<DsntPriceNpiResponse>('/api/dsnt/price-ndc-npi', q);
  }
}

export const dsntClient = new DsntClient();
