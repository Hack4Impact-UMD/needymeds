import axios from 'axios';

export async function getUrlResponse(opts: { ndc: string }) {
  if (!opts.ndc) {
    throw new Error('ndc is required');
  }
  if (!/^\d{10}$/.test(opts.ndc)) {
    throw new Error('ndc must be a 10-digit numeric string');
  }
  let targetUrl: string = process.env.TARGET_URL || '';
  targetUrl += `?ndc=${encodeURIComponent(opts.ndc)}`;
  try {
    const response = await axios.get(targetUrl, {
      headers: {
        'x-api-key': process.env.X_API_KEY || '',
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(`Failed to fetch URL: ${error}`);
  }
}
