import { createPass } from '../services/applewallet.service';

describe('createPass ', () => {
  test('generates a pkpass buffer', async () => {
    const result = await createPass({ serial: '123', number: 'ABC', bin: '015926', pcn: 'PRXIDST', group: 'IDST01', memberId: 'IDST733224411' });
    expect(result).toBeDefined();
    expect(result.length).toBeGreaterThan(0);
  });
});
