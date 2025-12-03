import { apiGet } from '../http';
import { groupID, scriptSaveClient } from '../scriptSaveClient';
import { ScriptSaveFindDrugsRequest, ScriptSavePriceRequest } from '../types';

jest.mock('../http', () => ({
  apiGet: jest.fn(),
}));

const mockApiGet = apiGet as jest.MockedFunction<typeof apiGet>;

describe('scriptSaveClient', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('calls /findDrugsUsingDrugName with params and returns data', async () => {
    mockApiGet.mockResolvedValueOnce({ ok: 1, type: 'findDrugs' } as any);

    const params: ScriptSaveFindDrugsRequest = {
      groupID,
      drugName: 'atorvastatin',
    };

    const res = await scriptSaveClient.getDrugsByName(params);

    expect(mockApiGet).toHaveBeenCalledWith('/findDrugsUsingDrugName', params);
    expect(res).toEqual({ ok: 1, type: 'findDrugs' });
  });

  it('calls /priceDrugs with params and returns data', async () => {
    mockApiGet.mockResolvedValueOnce({ ok: 1, type: 'priceDrugs' } as any);

    const params: ScriptSavePriceRequest = {
      ndc: '1234',
      groupID,
      quantity: 1,
      numResults: 10,
      zipCode: 12345,
    };

    const res = await scriptSaveClient.getDrugPrices(params);

    expect(mockApiGet).toHaveBeenCalledWith('/priceDrugs', params);
    expect(res).toEqual({ ok: 1, type: 'priceDrugs' });
  });

  it('propagates errors from transport layer (negative test)', async () => {
    mockApiGet.mockRejectedValueOnce(new Error('network down'));

    await expect(
      scriptSaveClient.getDrugsByName({
        drugName: '',
        limit: 0,
      } as any)
    ).rejects.toThrow('network down');
  });
});
