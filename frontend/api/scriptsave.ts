import { apiGet } from './http';

export type ScriptSaveSearchResponse = unknown;

export function scriptsaveSearch(drug: string, zip: string) {
  return apiGet<ScriptSaveSearchResponse>('/scriptsave/search', { drug, zip });
}
