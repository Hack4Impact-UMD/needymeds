/* Data */

type Adjudicator = 'DSNT' | 'ScriptSave';

export interface DrugSearchResult {
  adjudicator: Adjudicator;
  pharmacyName: string; // primary field for de-duplication
  pharmacyAddress: string;
  pharmacyPhone: string;
  ndc: string;
  labelName: string;
  price: string;
  latitude: string;
  longitude: string;
  distance: string;
}

export interface Pharmacy {
  pharmacyName: string;
  pharmacyStreet1: string;
  pharmacyStreet2: string;
  pharmacyCity: string;
  pharmacyState: string;
  pharmacyZipCode: string;
  latitude?: number;
  longitude?: number;
  distance?: number;
  phoneNumber?: string;
}

/* Requests */

export interface DsntPriceRequest {
  quantity: string;
  ndc: string;
  radius: string;
  zipCode: string;
}

export interface DsntPriceNpiRequest {
  npilist: string;
  quantity: string;
  ndc: string;
  radius?: string;
  zipCode?: string;
}

export interface ScriptSaveAutoCompleteRequest {
  prefixText: string;
  groupID: string;
  count?: string;
}

export interface ScriptSaveFindDrugsRequest {
  groupID: string;
  brandIndicator?: string;
  drugName: string;
  includeDrugInfo?: string;
  includeDrugImage?: string;
  quantity?: string;
  numPharm?: string;
  zipCode?: string;
  useUC?: string;
}

export interface ScriptSaveGetDrugFormStrengthRequest {
  groupID: string;
  gsn: string;
}

export interface ScriptSavePriceRequest {
  ndc: string;
  groupID: string;
  quantity: string;
  numResults: string;
  zipCode: string;
  ndcOverride?: string;
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

export interface ScriptSaveAutoCompleteResponse {
  DrugNames: ScriptSaveAutoCompleteItem[];
}

export interface ScriptSaveAutoCompleteItem {
  DrugName: string;
}

export interface ScriptSaveFindDrugsResponse {
  Drugs: ScriptSaveDrugItem[];
  Names: ScriptSaveNameItem[];
  Forms: ScriptSaveFormItem[];
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

export interface ScriptSaveNameItem {
  DrugName: string;
  BrandGeneric: string;
  IsSelected: string;
}

export interface ScriptSaveFormItem {
  GSN: string;
  Form: string;
  Ranking: string;
  IsSelected: string;
  LN: string;
  CommonQty: string;
  IsDiscontinued: string;
  DiscontinuedDate: string;
}

export interface ScriptSaveStrengthItem {
  GSN: string;
  Strength: string;
  Ranking: string;
  IsSelected: string;
  LN: string;
  CommonQty: string;
}

export interface ScriptSaveQuantityItem {
  GSN: string;
  Quantity: string;
  QuantityLabel: string;
  Ranking: string;
  IsSelected: string;
}

export interface ScriptSaveGetDrugFormStrengthResponse {
  DrugName: string;
  BrandGeneric: string;
  Forms: ScriptSaveFormItem[];
  Strengths: ScriptSaveStrengthItem[];
  Quantities: ScriptSaveQuantityItem[];
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
