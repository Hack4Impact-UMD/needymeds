import request from 'supertest';
import app from '../app';

jest.mock('../services/urlLookupService', () => ({
  getUrlResponse: async (opts: { ndc: string }) => ({ mocked: true, ndc: opts.ndc }),
}));

describe('GET /api/url/url-lookup', () => {
  it('returns 400 when ndc is missing', async () => {
    const res = await request(app).get('/api/url/url-lookup');
    expect(res.status).toBe(400);
    expect(res.body).toMatchObject({ ok: false, error: 'ndc is required' });
  });

  it('returns 400 when ndc is not a 10-digit numeric string', async () => {
    const res = await request(app).get('/api/url/url-lookup').query({ ndc: 'abc' });
    expect(res.status).toBe(400);
    expect(res.body).toMatchObject({ ok: false, error: 'ndc must be a 10-digit numeric string' });
  });

  it('returns 200 and forwards valid 10-digit ndc', async () => {
    const res = await request(app).get('/api/url/url-lookup').query({ ndc: '1234567890' });
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ ok: true, data: { mocked: true, ndc: '1234567890' } });
  });
});
