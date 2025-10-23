/* Data */

type Adjudicator = 'DSNT' | 'ScriptSave';

export interface DrugSearchResult {
  adjudicator: Adjudicator;
  pharmacyName: string; // primary field for de-duplication
  ndc: string;
  labelName: string;
  price: string;
  latitude: number;
  longitude: number;
}

/* Requests */

export interface DsntPriceRequest {
  quantity: string | number;
  ndc: string;
  radius: string | number;
  zipCode: string;
}

export interface DsntPriceNpiRequest {
  npilist: string;
  quantity: string | number;
  ndc: string;
  radius?: string | number;
  zipCode?: string;
}

export interface ScriptSaveFindDrugsRequest {
  groupID: string | number;
  brandIndicator?: string;
  drugName: string;
  includeDrugInfo?: string | boolean;
  includeDrugImage?: string | boolean;
  quantity?: string | number;
  numPharm?: string | number;
  zipCode?: string | number;
  useUC?: string | boolean;
}

export interface ScriptSavePriceRequest {
  ndc: string | number;
  groupID: string | number;
  quantity: string | number;
  numResults: string | number;
  zipCode: string | number;
  ndcOverride?: string | boolean;
}

/* Responses */

export interface DsntPriceResponse {
  DrugPricing: DsntDrugPricingItem[];
}

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

export type DsntPriceNpiResponse = DsntPriceResponse;

export interface ScriptSaveFindDrugsResponse {
  Drugs: ScriptSaveDrugItem[];
}

export interface ScriptSaveDrugItem {
  ChainCode: string;
  PharmacyName: string;
  Latitude: string;
  Longitude: string;
  Address: string;
  Phone: string;
  Distance: string;
  City: string;
  State: string;
  Zip: string;
  HoursOfOperation: string;
  GroupName: string;
  NDC: string;
  LN: string;
  Qty: string;
  Price: string;
  PriceBasis: string;
  UCPrice: string;
  AWPPrice: string;
  MACPrice: string;
  BrandGeneric: string;
  DrugRanking: string;
  QuantityRanking: string;
  NCPDP: string;
  GroupNum: string;
  GSN: string;
  Splittable: string;
}

export interface ScriptSavePriceResponse {
  drugs: ScriptSavePriceItem[];
}

export interface ScriptSavePriceItem {
  chainCode: string;
  pharmacyName: string;
  latitude: string;
  longitude: string;
  address: string;
  phone: string;
  distance: string;
  city: string;
  state: string;
  zip: string;
  hoursOfOperation: string;
  groupName: string;
  ndc: string;
  ln: string;
  qty: string;
  price: string;
  awpPrice: string;
  brandGeneric: string;
  ncpdp: string;
  groupNum: string;
  gsn: string;
  splittable: string;
}
