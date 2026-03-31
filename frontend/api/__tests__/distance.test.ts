import { distanceBetweenCoordinates, zipToCoords } from '../distance';

describe('converting to coordinates and calculating distances', () => {
  // mock fetching that returns a json with just lat and lon
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
    expect(Number(result.lat)).toBeCloseTo(38.99, 1);
    expect(Number(result.lon)).toBeCloseTo(-76.94, 1);
    expect(result.error).toBe('');
  });

  test('haversine formula on coordinates', () => {
    const cp = { lat: '38.988836', lon: '-76.941576', error: '' };
    const la = { lat: '34.053691', lon: '-118.242766', error: '' };
    const distance = distanceBetweenCoordinates(cp, la);
    expect(distance).toBeCloseTo(2301.13);
    expect(distance).toBeGreaterThan(2200);
    expect(distance).toBeLessThan(2400);
  });
});
