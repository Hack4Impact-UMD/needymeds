import nock from 'nock';
import { getScriptSaveSecret } from '../secrets/secrets'; // placeholder
import {
  generateCardholder,
  getDrugFormStrength,
  priceDrug,
  priceDrugs,
  priceDrugsByNCPDP,
} from '../services/scriptsave.service';

describe('scriptsave.service', () => {
  const { host, _ } = getScriptSaveSecret();

  afterEach(() => nock.cleanAll());

  // -------------------- getDrugFormStrength --------------------
  describe('getDrugFormStrength', () => {
    it('returns data on 200', async () => {
      nock(host)
        .get('/pricingapi/api/PricingEngineExternal/DrugFormStrength')
        .query({ groupID: '1', gsn: '12345' })
        .reply(200, { strength: '10mg' });

      const data = await getDrugFormStrength({ groupID: '1', gsn: '12345' });
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

      await expect(getDrugFormStrength({ groupID: '1', gsn: '12345' })).rejects.toMatchObject({
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

      const data = await getDrugFormStrength({ groupID: '1', gsn: '12345' });
      expect(data).toEqual({ ok: true });
      expect(scope.isDone()).toBe(true);
    });

    it('fails after 3 retries on 503', async () => {
      const scope = nock(host)
        .get(/DrugFormStrength/)
        .times(3)
        .reply(503, {});

      await expect(getDrugFormStrength({ groupID: '1', gsn: '12345' })).rejects.toMatchObject({
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
          ndc: '12345678901',
          ncpdp: '98765',
          groupID: '9',
          quantity: '30',
          ndcOverride: 'true',
        })
        .reply(200, { price: 12.34 });

      const data = await priceDrug({
        ndc: '12345678901',
        ncpdp: '98765',
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
          ncpdp: '12345',
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
          ndc: '12345678901',
          groupID: '1',
          quantity: '30',
          numResults: '10',
          zipCode: '90210',
          ndcOverride: 'false',
        })
        .reply(200, { results: [1, 2, 3] });

      const data = await priceDrugs({
        ndc: '12345678901',
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
          ndc: '12345678901',
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
          return (
            body.params.NDC === '12345678901' &&
            body.params.NCPDP === '12345' &&
            body.params.groupID === '1'
          );
        })
        .reply(200, { ok: true });

      const data = await priceDrugsByNCPDP({
        ndc: '12345678901',
        ncpdp: '12345',
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
