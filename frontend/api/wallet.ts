import { apiPost } from './http';
import { DrugSearchResult } from './types';

export async function getGoogleWalletUrl(cardData: DrugSearchResult): Promise<{ url: string }> {
  return apiPost<{ url: string }>('/api/wallet/google', cardData);
}
