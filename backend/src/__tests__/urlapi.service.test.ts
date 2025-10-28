import nock from 'nock';
import { getUrlResponse } from '../services/urlapi.service';

const host: string = process.env.URLAPI_BASE_URL || 'https://fake-urlapi.test';

describe('urlapi.service', () => {
  afterEach(() => nock.cleanAll());

  // -------------------- getUrlResponse --------------------
  describe('getUrlResponse', () => {
    it('returns data on successful 200', async () => {
      nock(host)
        .get('/lookup')
        .query({ ndc: '1234567890' })
        .reply(200, { url: 'https://example.com/drug' });

      const data = await getUrlResponse({ ndc: '1234567890' });
      expect(data).toEqual({ url: 'https://example.com/drug' });
    });

    it('fails validation when ndc is missing', async () => {
      await expect(getUrlResponse({ ndc: '' as any })).rejects.toMatchObject({
        status: 400,
        message: expect.stringContaining('ndc is required'),
      });
    });

    it('fails validation when ndc invalid', async () => {
      await expect(getUrlResponse({ ndc: 'abc123' })).rejects.toMatchObject({
        status: 400,
        message: expect.stringContaining('10-digit numeric'),
      });
    });

    it('throws safe error on 4xx', async () => {
      nock(host).get('/lookup').query({ ndc: '1234567890' }).reply(404, { message: 'Not found' });

      await expect(getUrlResponse({ ndc: '1234567890' })).rejects.toMatchObject({
        message: expect.stringContaining('URL API returned 404'),
        status: 404,
      });
    });

    it('retries up to 3 times on 502 then succeeds', async () => {
      const scope = nock(host)
        .get('/lookup')
        .query({ ndc: '1234567890' })
        .times(2)
        .reply(502, {})
        .get('/lookup')
        .query({ ndc: '1234567890' })
        .reply(200, { ok: true });

      const data = await getUrlResponse({ ndc: '1234567890' });
      expect(data).toEqual({ ok: true });
      expect(scope.isDone()).toBe(true);
    });

    it('fails after 3 retries on persistent 503', async () => {
      const scope = nock(host).get('/lookup').query({ ndc: '1234567890' }).times(3).reply(503, {});

      await expect(getUrlResponse({ ndc: '1234567890' })).rejects.toMatchObject({
        status: 503,
      });
      expect(scope.isDone()).toBe(true);
    });
  });
});
