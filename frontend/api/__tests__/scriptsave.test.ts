import { scriptsaveSearch } from '../scriptSaveClient';

describe('scriptsave api', () => {
  it('calls /scriptsave/search', async () => {
    const res = await scriptsaveSearch('lipitor', '10003');
    expect(res).toEqual({ results: [] });
  });
});
