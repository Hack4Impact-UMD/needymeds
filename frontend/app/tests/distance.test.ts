import { zipToCoords, addrToCoords, haversine } from '../(tabs)/distance';

describe('converting to coordinates and calculating distances', () => {
  // mock fetching before the tests that returns a json with just lat and lon
  beforeEach(() => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve([{ lat: '38.98998', lon: '-76.94210' }]),
      })
    ) as any;
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  test('zipcode to coordinates', async () => {
    const result = await zipToCoords('20742');
    expect(result.lat).toBe('38.98998');
    expect(result.lon).toBe('-76.94210');
    expect(result.error).toBe('');
  });

  test('address to coordinates', async () => {
    const result = await addrToCoords('College Park, MD 20742');
    expect(result.lat).toBe('38.98998');
    expect(result.lon).toBe('-76.94210');
    expect(result.error).toBe('');
  });

  test('haversine formula on coordinates', () => {
    const cp = { lat: '38.988836', lon: '-76.941576', error: '' };
    const la = { lat: '34.053691', lon: '-118.242766', error: '' };
    const distance = haversine(cp, la) / 1000; // meters to kilometers
    expect(distance).toBeCloseTo(3699.352);
    expect(distance).toBeGreaterThan(3600);
    expect(distance).toBeLessThan(3800);
  });
});

// test failures too
