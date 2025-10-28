import nock from 'nock';
import { getUrlResponse } from '../services/urlapi.service';

const host = process.env.URLAPI_BASE_URL || '';

describe('getUrlResponse (service)', () => {
  afterEach(() => nock.cleanAll());

  // ------------------- 200 Success -------------------
  it('returns data on 200', async () => {
    nock(host)
      .get('/lookup')
      .query({ ndc: '1234567890' })
      .reply(200, { result: 'https://example.com/drug-info' });

    const data = await getUrlResponse({ ndc: '1234567890' });

    expect(data).toEqual({ result: 'https://example.com/drug-info' });
  });

  // ------------------- 400 Client Error -------------------
  it('bubbles 4xx with safe message', async () => {
    nock(host).get('/lookup').query({ ndc: '1234567890' }).reply(400, { message: 'Bad Request' });

    await expect(getUrlResponse({ ndc: '1234567890' })).rejects.toMatchObject({
      status: 400,
    });
  });

  // ------------------- 502 Retry Then Success -------------------
  it('retries on 502 then succeeds', async () => {
    const scope = nock(host)
      .get(/lookup/)
      .twice()
      .reply(502, {})
      .get(/lookup/)
      .reply(200, { ok: true });

    const data = await getUrlResponse({ ndc: '1234567890' });

    expect(data).toEqual({ ok: true });
    expect(scope.isDone()).toBe(true);
  });
});
