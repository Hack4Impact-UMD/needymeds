import { dsntClient } from '../dsntClient';
import { apiGet } from '../http';
import { DsntPriceNpiRequest, DsntPriceRequest } from '../types';

jest.mock('../http', () => ({
  apiGet: jest.fn(),
}));

const mockApiGet = apiGet as jest.MockedFunction<typeof apiGet>;

describe('dsnt api', () => {
  afterEach(() => {
    mockApiGet.mockReset();
  });

  it('calls /api/price with params and returns data', async () => {
    mockApiGet.mockResolvedValueOnce({ ok: 1, type: 'ndc' } as any);

    const params: DsntPriceRequest = {
      quantity: '100',
      ndc: '59148000713',
      radius: '100',
      zipCode: '10003',
    };

    const res = await dsntClient.getPriceByNdc(params);

    expect(mockApiGet).toHaveBeenCalledWith('/api/price', params);
    expect(res).toEqual({ ok: 1, type: 'ndc' });
  });

  it('calls /api/price-ndc-npi with params and returns data', async () => {
    mockApiGet.mockResolvedValueOnce({ ok: 1, type: 'ndc-npi' } as any);

    const params: DsntPriceNpiRequest = {
      npilist: '1326064445',
      quantity: 100,
      ndc: '59148000713',
      radius: '100',
      zipCode: '10002',
    };

    const res = await dsntClient.getPriceByNdcAndNpi(params);

    expect(mockApiGet).toHaveBeenCalledWith('/api/price-ndc-npi', params);
    expect(res).toEqual({ ok: 1, type: 'ndc-npi' });
  });

  it('propagates errors from transport layer (negative test)', async () => {
    mockApiGet.mockRejectedValueOnce(new Error('network down'));

    await expect(
      dsntClient.getPriceByNdc({
        quantity: -1 as any,
        ndc: '',
        radius: '0',
        zipCode: '',
      })
    ).rejects.toThrow('network down');
  });
});
