import { apiPost } from './http';

export async function submitSurvey(opts: {
  rating: number;
  email: string;
  comments?: string;
  drugName?: string;
}) {
  return apiPost('/api/survey', opts);
}
