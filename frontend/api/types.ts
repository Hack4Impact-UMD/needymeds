export interface DsntDrugPricingItem {
  npi: string;
  name: string;
  pharmacy: string;
  phoneNumber: string;
  street1: string;
  street2: string;
  city: string;
  state: string;
  zipCode: string;
  ndc: string;
  price: string;
  labelName: string;
}

export interface DsntPriceResponse {
  DrugPricing: DsntDrugPricingItem[];
}

export type DsntPriceNpiResponse = DsntPriceResponse;

export interface DsntPriceRequest {
  quantity: string | number;
  ndc: string;
  radius: string | number;
  zipCode: string;
  [key: string]: string | number | undefined;
}

export interface DsntPriceNpiRequest {
  npilist: string;
  quantity: string | number;
  ndc: string;
  radius?: string | number;
  zipCode?: string;
  [key: string]: string | number | undefined;
}
