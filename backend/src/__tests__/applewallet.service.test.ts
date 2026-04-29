import { createPass } from '../services/applewallet.service';

describe('createPass ', () => {
  test('generates a pkpass buffer', async () => {
    const result = await createPass({
      serial: '123',
      bin: '020750',
      pcn: 'NMeds',
      group: 'NEEDYMED',
      memberId: '90MA019309343023',
    });
    expect(result).toBeDefined();
    expect(result.length).toBeGreaterThan(0);
  });
});
