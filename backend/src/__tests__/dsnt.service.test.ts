import nock from 'nock';
import request from 'supertest';
import app from '../app';
import { getDsntSecret } from '../secrets/secrets';
import { getPriceByNdc, priceByNdcAndNpiList } from '../services/dsnt.service';

describe('GET /api/dsnt/price', () => {
  let host: string;
  let username: string;
  let password: string;

  beforeAll(async () => {
    const secrets = await getDsntSecret();
    host = secrets.baseUrl;
    username = secrets.username;
    password = secrets.password;
  });

  afterEach(() => nock.cleanAll());

  it('200 happy path', async () => {
    nock(host)
      .get(/PharmacyPricing/)
      .reply(200, { foo: 'bar' });
    const res = await request(app)
      .get('/api/dsnt/price')
      .query({ ndc: '59148000713', quantity: 100, radius: 100, zipCode: '10003' });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true, data: { foo: 'bar' } });
  });

  it('400 on bad input', async () => {
    const res = await request(app)
      .get('/api/dsnt/price')
      .query({ ndc: 'bad', quantity: -1, radius: 0, zipCode: 'abc' });
    expect(res.status).toBe(400);
    expect(res.body.ok).toBe(false);
  });
});

describe('getPriceByNdc', () => {
  let host: string;

  beforeAll(async () => {
    const secrets = await getDsntSecret();
    host = secrets.baseUrl;
  });

  afterEach(() => nock.cleanAll());

  it('returns data on 200', async () => {
    nock(host)
      .get('/pharmacy-drug-pricing/1.0/service/PharmacyPricing')
      .query({ quantity: '100', ndc: '59148000713', radius: '100', zipCode: '10003' })
      .reply(200, { prices: [{ pharmacyId: 'X', price: 12.34 }] });

    const data = await getPriceByNdc({
      ndc: '59148000713',
      quantity: 100,
      radius: 100,
      zipCode: '10003',
    });
    expect(data).toEqual({ prices: [{ pharmacyId: 'X', price: 12.34 }] });
  });

  it('bubbles 4xx with safe message', async () => {
    nock(host)
      .get('/pharmacy-drug-pricing/1.0/service/PharmacyPricing')
      .query({ quantity: '100', ndc: '59148000713', radius: '100', zipCode: '10003' })
      .reply(400, { message: 'bad request' });

    await expect(
      getPriceByNdc({
        ndc: '59148000713',
        quantity: 100,
        radius: 100,
        zipCode: '10003',
      })
    ).rejects.toMatchObject({ message: 'DS&T returned 400', status: 400 });
  });

  it('fails after exhausting retries with 5xx', async () => {
    const scope = nock(host)
      .get('/pharmacy-drug-pricing/1.0/service/PharmacyPricing')
      .times(3)
      .query({ quantity: '100', ndc: '59148000713', radius: '100', zipCode: '10003' })
      .reply(503, {});

    await expect(
      getPriceByNdc({
        ndc: '59148000713',
        quantity: 100,
        radius: 100,
        zipCode: '10003',
      })
    ).rejects.toMatchObject({ status: 503 });
    expect(scope.isDone()).toBe(true);
  });

  it('retries on 502 then succeeds', async () => {
    const scope = nock(host)
      .get(/PharmacyPricing/)
      .twice()
      .reply(502, {})
      .get(/PharmacyPricing/)
      .reply(200, { ok: true });

    const data = await getPriceByNdc({
      ndc: '59148000713',
      quantity: 100,
      radius: 5,
      zipCode: '10003',
    });
    expect(data).toEqual({ ok: true });
    expect(scope.isDone()).toBe(true);
  });
});

describe('priceByNdcAndNpiList', () => {
  let host: string;
  let username: string;
  let password: string;

  beforeAll(async () => {
    const secrets = await getDsntSecret();
    host = secrets.baseUrl;
    username = secrets.username;
    password = secrets.password;
  });

  afterEach(() => nock.cleanAll());

  it('returns pricing for npilist single', async () => {
    nock(host)
      .get('/pharmacy-drug-pricing/1.0/service/PharmacyPricing')
      .query({ quantity: '100', ndc: '59148000713', npilist: '1326064445' })
      .reply(200, { DrugPricing: [{ npi: '1326064445', ndc: '59148000713', price: '2087.39' }] });

    const data = await priceByNdcAndNpiList({
      ndc: '59148000713',
      quantity: 100,
      npilist: '1326064445',
    });
    expect(data).toEqual({
      DrugPricing: [{ npi: '1326064445', ndc: '59148000713', price: '2087.39' }],
    });
  });

  it('returns pricing for multiple npis', async () => {
    nock(host)
      .get('/pharmacy-drug-pricing/1.0/service/PharmacyPricing')
      .query({ quantity: '45', ndc: '00591405289', npilist: '1013431949,1326064445' })
      .reply(200, { DrugPricing: [] });

    const data = await priceByNdcAndNpiList({
      ndc: '00591405289',
      quantity: 45,
      npilist: '1013431949,1326064445',
    });
    expect(data).toEqual({ DrugPricing: [] });
  });

  it('validates bad npi', async () => {
    await expect(
      priceByNdcAndNpiList({ ndc: '00591405289', quantity: 45, npilist: 'abc' })
    ).rejects.toMatchObject({ status: 400 });
  });
});
