import { createPass } from '../services/applewallet.service';

describe('createPass ', () => {
  test('generates a pkpass buffer', async () => {
    const result = await createPass({ serial: '123', number: 'ABC' });
    expect(result).toBeDefined();
    expect(result.length).toBeGreaterThan(0);
  });
});
