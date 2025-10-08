import { getPriceByNdc, getPriceByNdcAndNpi } from '../dsnt';

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
