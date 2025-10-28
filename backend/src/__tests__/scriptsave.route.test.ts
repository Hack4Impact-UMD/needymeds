import nock from 'nock';
import { autoComplete, findDrugsUsingNDC11, priceDrug } from '../services/scriptsave.service';

const host = process.env.SCRIPTSAVE_BASE_URL || '';

describe('ScriptSave service endpoints', () => {
  afterEach(() => nock.cleanAll());

  // ------------------- 001 AutoComplete -------------------
  it('returns autocomplete data on 200', async () => {
    nock(host)
      .get('/PricingAPI/api/PricingEngineExternal/AutoComplete')
      .query({ PrefixText: 'amox', groupID: '123', Count: '5' })
      .reply(200, { suggestions: ['amoxicillin', 'amoxapine'] });

    const data = await autoComplete({
      prefixText: 'amox',
      groupID: '123',
      count: '5',
    });

    expect(data).toEqual({ suggestions: ['amoxicillin', 'amoxapine'] });
  });

  it('returns findDrugsUsingNDC11 data on 200', async () => {
    nock(host)
      .get('/PricingAPI/api/PricingEngineExternal/FindDrugs')
      .query({
        groupID: '123',
        NDC: '12345678901',
        qty: '30',
        zip: '10001',
      })
      .reply(200, { prices: [{ pharmacyId: 'A', price: 10.25 }] });

    const data = await findDrugsUsingNDC11({
      groupID: '123',
      ndc: '12345678901',
      quantity: '30',
      zipCode: '10001',
    });

    expect(data).toEqual({ prices: [{ pharmacyId: 'A', price: 10.25 }] });
  });

  // ------------------- 004 PriceDrug -------------------
  it('handles priceDrug successfully', async () => {
    nock(host)
      .get('/pricingenginecore/api/pricing/pricedrug')
      .query({
        NDC: '12345678901',
        NCPDP: '5555555',
        groupID: '123',
        quantity: '30',
      })
      .reply(200, { price: 12.34 });

    const data = await priceDrug({
      ndc: '12345678901',
      ncpdp: '5555555',
      groupID: '123',
      quantity: '30',
    });

    expect(data).toEqual({ price: 12.34 });
  });

  // ------------------- Error and Retry Example -------------------
  it('bubbles 4xx with safe message', async () => {
    nock(host)
      .get('/PricingAPI/api/PricingEngineExternal/AutoComplete')
      .query({ PrefixText: 'amox', groupID: '123', Count: '5' })
      .reply(400, { message: 'Bad request' });

    await expect(
      autoComplete({ prefixText: 'amox', groupID: '123', count: '5' })
    ).rejects.toMatchObject({ message: 'ScriptSave returned 400', status: 400 });
  });

  it('retries on 502 then succeeds', async () => {
    const scope = nock(host)
      .get(/PricingAPI\/api\/PricingEngineExternal\/FindDrugs/)
      .twice()
      .reply(502, {})
      .get(/PricingAPI\/api\/PricingEngineExternal\/FindDrugs/)
      .reply(200, { ok: true });

    const data = await findDrugsUsingNDC11({
      groupID: '123',
      ndc: '12345678901',
      quantity: '30',
      zipCode: '10001',
    });

    expect(data).toEqual({ ok: true });
    expect(scope.isDone()).toBe(true);
  });
});
