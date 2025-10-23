import { getPriceByNdc, getPriceByNdcAndNpi } from '../dsnt';
import { apiGet } from '../http';
import { DsntPriceRequest, DsntPriceNpiRequest } from '../types';

describe('dsnt api', () => {
  it('calls /api/price', async () => {
    const res = await getPriceByNdc({
      quantity: '100',
      ndc: '59148000713',
      radius: '100',
      zipCode: '10003',
    });
    expect(res).toEqual({ ok: 1, type: 'ndc' });
  });

  it('calls /api/price-ndc-npi', async () => {
    const res = await getPriceByNdcAndNpi({
      npilist: '1326064445',
      quantity: 100,
      ndc: '59148000713',
      radius: '100',
      zipCode: '10002',
    });
    expect(res).toEqual({ ok: 1, type: 'ndc-npi' });
  });
});

// more thorough tests below

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

    const res = await getPriceByNdc(params);

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

    const res = await getPriceByNdcAndNpi(params);

    expect(mockApiGet).toHaveBeenCalledWith('/api/price-ndc-npi', params);
    expect(res).toEqual({ ok: 1, type: 'ndc-npi' });
  });

  it('propagates errors from transport layer (negative test)', async () => {
    mockApiGet.mockRejectedValueOnce(new Error('network down'));

    await expect(
      getPriceByNdc({
        quantity: -1 as any,
        ndc: '',
        radius: '0',
        zipCode: '',
      })
    ).rejects.toThrow('network down');
  });
});
