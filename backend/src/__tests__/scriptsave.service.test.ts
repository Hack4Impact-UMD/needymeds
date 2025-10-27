import nock from 'nock';

jest.mock('../auth/scriptsave.tokenManager', () => ({
  scriptSaveTokenManager: {
    getToken: () => 'test-token',
  },
}));

import { getScriptSaveSecret } from '../secrets/secrets';
import {
  autoComplete,
  findDrugsUsingDrugName,
  findDrugsUsingGSNAndReferencedBN,
  findDrugsUsingNDC11,
  generateCardholder,
  getDrugFormStrength,
  priceDrug,
  priceDrugs,
  priceDrugsByNCPDP,
} from '../services/scriptsave.service';

describe('scriptsave.service', () => {
  let host: string = process.env.SCRIPTSAVE_BASE_URL || '';
  let subscriptionKey: string;

  beforeAll(async () => {
    const secrets = await getScriptSaveSecret();
    host = secrets.baseUrl;
    subscriptionKey = secrets.subscriptionKey;
  });

  afterEach(() => nock.cleanAll());

  // -------------------- autoComplete --------------------
  describe('autoComplete', () => {
    it('returns list of suggestions', async () => {
      nock(host)
        .get('/PricingAPI/api/PricingEngineExternal/AutoComplete')
        .query({ PrefixText: 'asp', groupID: '1', Count: '5' })
        .reply(200, ['aspirin', 'aspartame']);

      const data = await autoComplete({ prefixText: 'asp', groupID: '1', count: '5' });
      expect(data).toEqual(['aspirin', 'aspartame']);
    });

    it('fails validation when prefixText empty', async () => {
      await expect(
        autoComplete({ prefixText: '', groupID: '1', count: '5' })
      ).rejects.toMatchObject({ status: 400 });
    });

    it('throws safe error on 4xx', async () => {
      nock(host)
        .get(/AutoComplete/)
        .reply(400, { message: 'Bad request' });

      await expect(
        autoComplete({ prefixText: 'asp', groupID: '1', count: '5' })
      ).rejects.toMatchObject({
        message: expect.stringContaining('ScriptSave returned 400'),
        status: 400,
      });
    });
  });

  // -------------------- findDrugsUsingNDC11 --------------------
  describe('findDrugsUsingNDC11', () => {
    it('returns drug data', async () => {
      nock(host)
        .get('/PricingAPI/api/PricingEngineExternal/FindDrugs')
        .query({
          groupID: '1',
          BrandIndicator: 'B',
          NDC: '1234567890',
          IncludeDrugInfo: 'true',
          IncludeDrugImage: 'false',
          qty: '30',
          numPharm: '5',
          zip: '12345',
          UseUC: 'false',
          NDCOverride: 'true',
        })
        .reply(200, { drug: 'Aspirin' });

      const data = await findDrugsUsingNDC11({
        groupID: '1',
        brandIndicator: 'B',
        ndc: '1234567890',
        includeDrugInfo: 'true',
        includeDrugImage: 'false',
        quantity: '30',
        numPharm: '5',
        zipCode: '12345',
        useUC: 'false',
        ndcOverride: 'true',
      });
      expect(data).toEqual({ drug: 'Aspirin' });
    });

    it('fails validation on bad ndc', async () => {
      await expect(
        findDrugsUsingNDC11({
          groupID: '1',
          brandIndicator: 'B',
          ndc: 'bad',
          includeDrugInfo: 'true',
          includeDrugImage: 'false',
          quantity: '30',
          numPharm: '5',
          zipCode: '12345',
          useUC: 'false',
          ndcOverride: 'true',
        })
      ).rejects.toMatchObject({ status: 400 });
    });
  });

  // -------------------- findDrugsUsingDrugName --------------------
  describe('findDrugsUsingDrugName', () => {
    it('returns data successfully', async () => {
      nock(host)
        .get('/PricingAPI/api/PricingEngineExternal/FindDrugs')
        .query({
          groupID: '2',
          BrandIndicator: 'G',
          DrugName: 'acetaminophen',
          IncludeDrugInfo: 'true',
          IncludeDrugImage: 'false',
          qty: '15',
          numPharm: '3',
          zip: '67890',
          UseUC: 'true',
        })
        .reply(200, { results: ['drugX'] });

      const data = await findDrugsUsingDrugName({
        groupID: '2',
        brandIndicator: 'G',
        drugName: 'acetaminophen',
        includeDrugInfo: 'true',
        includeDrugImage: 'false',
        quantity: '15',
        numPharm: '3',
        zipCode: '67890',
        useUC: 'true',
      });
      expect(data).toEqual({ results: ['drugX'] });
    });

    it('throws 400 when zip invalid', async () => {
      await expect(
        findDrugsUsingDrugName({
          groupID: '2',
          brandIndicator: 'G',
          drugName: 'acetaminophen',
          includeDrugInfo: 'true',
          includeDrugImage: 'false',
          quantity: '15',
          numPharm: '3',
          zipCode: 'ABCDE',
          useUC: 'true',
        })
      ).rejects.toMatchObject({ status: 400 });
    });
  });

  // -------------------- findDrugsUsingGSNAndReferencedBN --------------------
  describe('findDrugsUsingGSNAndReferencedBN', () => {
    it('returns results successfully', async () => {
      nock(host)
        .get('/PricingAPI/api/PricingEngineExternal/FindDrugs')
        .query({
          groupID: '3',
          BrandIndicator: 'B',
          GSN: '123456',
          referencedBN: 'BN123',
          IncludeDrugInfo: 'true',
          IncludeDrugImage: 'true',
          qty: '10',
          numPharm: '2',
          zip: '10101',
          UseUC: 'false',
        })
        .reply(200, { drugs: ['X'] });

      const data = await findDrugsUsingGSNAndReferencedBN({
        groupID: '3',
        brandIndicator: 'B',
        gsn: '123456',
        referencedBN: 'BN123',
        includeDrugInfo: 'true',
        includeDrugImage: 'true',
        quantity: '10',
        numPharm: '2',
        zipCode: '10101',
        useUC: 'false',
      });
      expect(data).toEqual({ drugs: ['X'] });
    });

    it('throws 400 for invalid zipCode', async () => {
      await expect(
        findDrugsUsingGSNAndReferencedBN({
          groupID: '3',
          brandIndicator: 'B',
          gsn: '123456',
          referencedBN: 'BN123',
          includeDrugInfo: 'true',
          includeDrugImage: 'true',
          quantity: '10',
          numPharm: '2',
          zipCode: 'ABCDE',
          useUC: 'false',
        })
      ).rejects.toMatchObject({ status: 400 });
    });
  });

  // -------------------- getDrugFormStrength --------------------
  describe('getDrugFormStrength', () => {
    it('returns data on 200', async () => {
      nock(host)
        .get('/pricingapi/api/PricingEngineExternal/DrugFormStrength')
        .query({ groupID: '1', gsn: '123456' })
        .reply(200, { strength: '10mg' });

      const data = await getDrugFormStrength({ groupID: '1', gsn: '123456' });
      expect(data).toEqual({ strength: '10mg' });
    });

    it('throws 400 on bad input', async () => {
      await expect(getDrugFormStrength({ groupID: 'x', gsn: 'bad' })).rejects.toMatchObject({
        status: 400,
      });
    });

    it('bubbles 4xx with safe message', async () => {
      nock(host)
        .get(/DrugFormStrength/)
        .reply(400, { message: 'bad req' });

      await expect(getDrugFormStrength({ groupID: '1', gsn: '123456' })).rejects.toMatchObject({
        message: expect.stringContaining('ScriptSave returned 400'),
        status: 400,
      });
    });

    it('retries on 502 then succeeds', async () => {
      const scope = nock(host)
        .get(/DrugFormStrength/)
        .twice()
        .reply(502, {})
        .get(/DrugFormStrength/)
        .reply(200, { ok: true });

      const data = await getDrugFormStrength({ groupID: '1', gsn: '123456' });
      expect(data).toEqual({ ok: true });
      expect(scope.isDone()).toBe(true);
    });

    it('fails after 3 retries on 503', async () => {
      const scope = nock(host)
        .get(/DrugFormStrength/)
        .times(3)
        .reply(503, {});

      await expect(getDrugFormStrength({ groupID: '1', gsn: '123456' })).rejects.toMatchObject({
        status: 503,
      });
      expect(scope.isDone()).toBe(true);
    });
  });

  // -------------------- priceDrug --------------------
  describe('priceDrug', () => {
    it('returns pricing data', async () => {
      nock(host)
        .get('/pricingenginecore/api/pricing/pricedrug')
        .query({
          ndc: '1234567890',
          ncpdp: '["98765"]',
          groupID: '9',
          quantity: '30',
          ndcOverride: 'true',
        })
        .reply(200, { price: 12.34 });

      const data = await priceDrug({
        ndc: '1234567890',
        ncpdp: '["98765"]',
        groupID: '9',
        quantity: '30',
        ndcOverride: 'true',
      });

      expect(data).toEqual({ price: 12.34 });
    });

    it('validates inputs', async () => {
      await expect(
        priceDrug({
          ndc: 'bad',
          ncpdp: '["12345"]',
          groupID: '9',
          quantity: '-1',
          ndcOverride: 'true',
        })
      ).rejects.toMatchObject({ status: 400 });
    });
  });

  // -------------------- priceDrugs --------------------
  describe('priceDrugs', () => {
    it('returns list of prices', async () => {
      nock(host)
        .get('/pricingenginecore/api/pricing/pricedrug')
        .query({
          ndc: '1234567890',
          groupID: '1',
          quantity: '30',
          numResults: '10',
          zipCode: '90210',
          ndcOverride: 'false',
        })
        .reply(200, { results: [1, 2, 3] });

      const data = await priceDrugs({
        ndc: '1234567890',
        groupID: '1',
        quantity: '30',
        numResults: '10',
        zipCode: '90210',
        ndcOverride: 'false',
      });

      expect(data).toEqual({ results: [1, 2, 3] });
    });

    it('fails validation on bad zipCode', async () => {
      await expect(
        priceDrugs({
          ndc: '1234567890',
          groupID: '1',
          quantity: '30',
          numResults: '10',
          zipCode: 'abcde',
          ndcOverride: 'false',
        })
      ).rejects.toMatchObject({ status: 400 });
    });
  });

  // -------------------- priceDrugsByNCPDP --------------------
  describe('priceDrugsByNCPDP', () => {
    it('POSTs and returns data', async () => {
      nock(host)
        .post('/pricingenginecore/api/Pricing/PriceDrugsByNCPDP', (body) => {
          return body.NDC === '1234567890' && body.NCPDP === '["12345"]' && body.groupID === '1';
        })
        .reply(200, { ok: true });

      const data = await priceDrugsByNCPDP({
        ndc: '1234567890',
        ncpdp: '["12345"]',
        groupID: '1',
        quantity: '90',
        ndcOverride: 'false',
      });

      expect(data).toEqual({ ok: true });
    });

    it('throws 400 on invalid params', async () => {
      await expect(
        priceDrugsByNCPDP({
          ndc: 'bad',
          ncpdp: 'bad',
          groupID: '1',
          quantity: '0',
          ndcOverride: 'false',
        })
      ).rejects.toMatchObject({ status: 400 });
    });
  });

  // -------------------- generateCardholder --------------------
  describe('generateCardholder', () => {
    it('returns data on success', async () => {
      nock(host)
        .get('/pricingenginecore/api/pricing/GenerateCardholder')
        .query({ groupID: '123' })
        .reply(200, { id: 'abc123' });

      const data = await generateCardholder({ groupID: '123' });
      expect(data).toEqual({ id: 'abc123' });
    });

    it('fails validation on bad groupID', async () => {
      await expect(generateCardholder({ groupID: 'bad' })).rejects.toMatchObject({
        status: 400,
      });
    });
  });
});
