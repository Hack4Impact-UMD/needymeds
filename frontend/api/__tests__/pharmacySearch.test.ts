import { openDatabaseAsync } from 'expo-sqlite';
import { setCacheEntry } from '../../redux/pharmacySearchSlice';
import { store } from '../../redux/store';
import { distanceBetweenCoordinates, zipToCoords } from '../distance';
import { searchPharmacies } from '../pharmacySearch';
import { Pharmacy } from '../types';

// -------------------------------
// Mocks
// -------------------------------
jest.mock('expo-sqlite');
const mockOpenDatabaseAsync = openDatabaseAsync as jest.MockedFunction<typeof openDatabaseAsync>;

jest.mock('../../redux/pharmacySearchSlice', () => ({
  setCacheEntry: jest.fn((payload) => ({ type: 'setCacheEntry', payload })),
}));

jest.mock('../../redux/store', () => ({
  store: {
    getState: jest.fn(),
    dispatch: jest.fn(),
  },
}));

jest.mock('../distance', () => ({
  distanceBetweenCoordinates: jest.fn(),
  zipToCoords: jest.fn(),
}));

// -------------------------------
// Test Data
// -------------------------------
const mockUserCoords = { lat: '40.7128', lon: '-74.0060' }; // New York City
const mockPharmacy1Coords = { lat: '40.7580', lon: '-73.9855' }; // ~5 miles away
const mockPharmacy2Coords = { lat: '40.6782', lon: '-73.9442' }; // ~8 miles away
const mockPharmacy3Coords = { lat: '40.7489', lon: '-73.9680' }; // ~3 miles away

const mockPharmacy1: Pharmacy = {
  pharmacyName: 'CVS Pharmacy',
  pharmacyStreet1: '123 Main St',
  pharmacyStreet2: '',
  pharmacyCity: 'New York',
  pharmacyState: 'NY',
  pharmacyZipCode: '10001',
  latitude: 40.758,
  longitude: -73.9855,
};

const mockPharmacy2: Pharmacy = {
  pharmacyName: 'Walgreens',
  pharmacyStreet1: '456 Park Ave',
  pharmacyStreet2: '',
  pharmacyCity: 'New York',
  pharmacyState: 'NY',
  pharmacyZipCode: '10002',
  latitude: 40.6782,
  longitude: -73.9442,
};

const mockPharmacy3: Pharmacy = {
  pharmacyName: 'Rite Aid',
  pharmacyStreet1: '789 Broadway',
  pharmacyStreet2: '',
  pharmacyCity: 'New York',
  pharmacyState: 'NY',
  pharmacyZipCode: '10003',
  latitude: 40.7489,
  longitude: -73.968,
};

const mockDatabase = {
  getAllAsync: jest.fn(),
  closeAsync: jest.fn(),
};

// -------------------------------
// Setup before each test
// -------------------------------
beforeEach(() => {
  jest.clearAllMocks();

  (zipToCoords as jest.Mock).mockResolvedValue(mockUserCoords);
  (distanceBetweenCoordinates as jest.Mock).mockReturnValue(1);

  (mockOpenDatabaseAsync as jest.Mock).mockResolvedValue(mockDatabase);
  (mockDatabase.getAllAsync as jest.Mock).mockResolvedValue([
    {
      pharmacyName: mockPharmacy1.pharmacyName,
      pharmacyStreet1: mockPharmacy1.pharmacyStreet1,
      pharmacyStreet2: null,
      pharmacyCity: mockPharmacy1.pharmacyCity,
      pharmacyState: mockPharmacy1.pharmacyState,
      pharmacyZipCode: mockPharmacy1.pharmacyZipCode,
      latitude: mockPharmacy1.latitude,
      longitude: mockPharmacy1.longitude,
    },
    {
      pharmacyName: mockPharmacy2.pharmacyName,
      pharmacyStreet1: mockPharmacy2.pharmacyStreet1,
      pharmacyStreet2: null,
      pharmacyCity: mockPharmacy2.pharmacyCity,
      pharmacyState: mockPharmacy2.pharmacyState,
      pharmacyZipCode: mockPharmacy2.pharmacyZipCode,
      latitude: mockPharmacy2.latitude,
      longitude: mockPharmacy2.longitude,
    },
    {
      pharmacyName: mockPharmacy3.pharmacyName,
      pharmacyStreet1: mockPharmacy3.pharmacyStreet1,
      pharmacyStreet2: null,
      pharmacyCity: mockPharmacy3.pharmacyCity,
      pharmacyState: mockPharmacy3.pharmacyState,
      pharmacyZipCode: mockPharmacy3.pharmacyZipCode,
      latitude: mockPharmacy3.latitude,
      longitude: mockPharmacy3.longitude,
    },
  ]);

  (store.getState as jest.Mock).mockReturnValue({
    pharmacySearch: { cache: {} },
  });
});

// -------------------------------
// TESTS
// -------------------------------
describe('searchPharmacies', () => {
  it('returns pharmacies sorted by distance', async () => {
    // Mock different distances for each pharmacy call (in database order: CVS, Walgreens, Rite Aid)
    (distanceBetweenCoordinates as jest.Mock)
      .mockReturnValueOnce(5.0) // CVS Pharmacy (first in DB)
      .mockReturnValueOnce(8.0) // Walgreens (second in DB)
      .mockReturnValueOnce(3.0); // Rite Aid (third in DB)

    const results = await searchPharmacies(10001, 10);

    expect(results).toHaveLength(3);
    // Should be sorted by distance: 3.0, 5.0, 8.0
    expect(results[0].pharmacyName).toBe('Rite Aid');
    expect(results[0].distance).toBe(3.0);
    expect(results[1].pharmacyName).toBe('CVS Pharmacy');
    expect(results[1].distance).toBe(5.0);
    expect(results[2].pharmacyName).toBe('Walgreens');
    expect(results[2].distance).toBe(8.0);

    expect(setCacheEntry).toHaveBeenCalled();
    expect(store.dispatch).toHaveBeenCalled();
  });

  it('filters pharmacies by radius', async () => {
    // Mock distances in database order: CVS (outside), Walgreens (outside), Rite Aid (within)
    (distanceBetweenCoordinates as jest.Mock)
      .mockReturnValueOnce(5.0) // CVS Pharmacy - outside 4 miles
      .mockReturnValueOnce(8.0) // Walgreens - outside 4 miles
      .mockReturnValueOnce(3.0); // Rite Aid - within 4 miles

    const results = await searchPharmacies(10001, 4);

    // Only pharmacies within 4 miles should be returned
    expect(results).toHaveLength(1);
    expect(results[0].pharmacyName).toBe('Rite Aid');
    expect(results[0].distance).toBe(3.0);
  });

  it('returns cached results if available', async () => {
    const cachedResults: Pharmacy[] = [
      {
        ...mockPharmacy1,
        distance: 5.0,
      },
    ];

    (store.getState as jest.Mock).mockReturnValueOnce({
      pharmacySearch: {
        cache: {
          'pharmacy-10001-10': {
            results: cachedResults,
            timestamp: Date.now(),
          },
        },
      },
    });

    const results = await searchPharmacies(10001, 10);

    expect(results).toEqual(cachedResults);
    expect(mockOpenDatabaseAsync as jest.Mock).not.toHaveBeenCalled();
    expect(setCacheEntry).not.toHaveBeenCalled();
  });

  it('handles pharmacies without stored coordinates by converting zip code', async () => {
    (mockDatabase.getAllAsync as jest.Mock).mockResolvedValueOnce([
      {
        pharmacyName: mockPharmacy1.pharmacyName,
        pharmacyStreet1: mockPharmacy1.pharmacyStreet1,
        pharmacyStreet2: null,
        pharmacyCity: mockPharmacy1.pharmacyCity,
        pharmacyState: mockPharmacy1.pharmacyState,
        pharmacyZipCode: mockPharmacy1.pharmacyZipCode,
        latitude: null,
        longitude: null,
      },
    ]);

    (zipToCoords as jest.Mock).mockResolvedValueOnce(mockUserCoords); // For user zip
    (zipToCoords as jest.Mock).mockResolvedValueOnce(mockPharmacy1Coords); // For pharmacy zip

    const results = await searchPharmacies(10001, 10);

    expect(results).toHaveLength(1);
    expect(zipToCoords).toHaveBeenCalledTimes(2); // Once for user zip, once for pharmacy zip
    expect(results[0].latitude).toBe(parseFloat(mockPharmacy1Coords.lat));
    expect(results[0].longitude).toBe(parseFloat(mockPharmacy1Coords.lon));
  });

  it('handles empty database results', async () => {
    (mockDatabase.getAllAsync as jest.Mock).mockResolvedValueOnce([]);

    const results = await searchPharmacies(10001, 10);

    expect(results).toHaveLength(0);
    expect(setCacheEntry).toHaveBeenCalledWith({
      key: 'pharmacy-10001-10',
      results: [],
    });
  });

  it('handles database errors gracefully', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    (mockOpenDatabaseAsync as jest.Mock).mockRejectedValueOnce(new Error('Database error'));

    const results = await searchPharmacies(10001, 10);

    expect(results).toEqual([]);
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it('caches results with correct key format', async () => {
    await searchPharmacies(10001, 10);

    expect(setCacheEntry).toHaveBeenCalledWith(
      expect.objectContaining({
        key: 'pharmacy-10001-10',
        results: expect.any(Array),
      })
    );
  });

  it('sorts results correctly when distances are equal', async () => {
    (distanceBetweenCoordinates as jest.Mock).mockReturnValue(5.0);

    const results = await searchPharmacies(10001, 10);

    // All should have distance 5.0, order should be stable
    expect(results.every((p) => p.distance === 5.0)).toBe(true);
    expect(results.length).toBe(3);
  });
});
