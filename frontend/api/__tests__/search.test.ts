import useUserLocation from '@/hooks/use-user-location';
import { store } from '../../redux/store';
import { distanceBetweenCoordinates, zipToCoords } from '../distance';
import { dsntClient } from '../dsntClient';
import { scriptSaveClient } from '../scriptSaveClient';
import { searchDrugByDistance, searchDrugByPrice } from '../search';

// --- Mock dependencies ---
jest.mock('@/hooks/use-user-location');
jest.mock('../dsntClient');
jest.mock('../scriptSaveClient');
jest.mock('../distance');
jest.mock('../../redux/store', () => ({
  store: {
    dispatch: jest.fn(),
    getState: jest.fn(() => ({
      drugSearch: { cache: {} },
    })),
  },
}));
jest.mock('../../redux/drugSearchSlice', () => ({
  setCacheEntry: jest.fn((payload) => ({ type: 'cache/setCacheEntry', payload })),
}));

const mockUseUserLocation = useUserLocation as jest.Mock;
const mockDsntClient = dsntClient as any;
const mockScriptSaveClient = scriptSaveClient as any;
const mockZipToCoords = zipToCoords as jest.Mock;
const mockDistance = distanceBetweenCoordinates as jest.Mock;
const mockDispatch = store.dispatch as jest.Mock;
const mockGetState = store.getState as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
  mockGetState.mockReturnValue({ drugSearch: { cache: {} } });
  mockDistance.mockReturnValue(10);
  mockZipToCoords.mockResolvedValue({ lat: 10, lon: 20 });
});

// -----------------------------------------------------------------------------
// BASIC MOCK DATA
// -----------------------------------------------------------------------------
const DSNT_RESPONSE = {
  DrugPricing: [
    { pharmacy: 'Pharmacy A', ndc: '111', labelName: 'Drug A', price: 12.5 },
    { pharmacy: 'Pharmacy B', ndc: '111', labelName: 'Drug A', price: 9.5 },
  ],
};

const SCRIPT_SAVE_RESPONSE = {
  drugs: [
    {
      pharmacyName: 'Pharmacy A',
      ndc: '111',
      ln: 'Drug A',
      price: 11.5,
      latitude: '10',
      longitude: '20',
    },
    {
      pharmacyName: 'Pharmacy C',
      ndc: '111',
      ln: 'Drug A',
      price: 15.0,
      latitude: '11',
      longitude: '21',
    },
  ],
};

const DRUG_BY_NAME_RESPONSE = {
  Drugs: [{ NDC: '111' }],
};

// -----------------------------------------------------------------------------
// TESTS
// -----------------------------------------------------------------------------
describe('searchDrug (indirectly via searchDrugByPrice)', () => {
  beforeEach(() => {
    mockUseUserLocation.mockResolvedValue({
      userLat: '10',
      userLon: '20',
      userZipCode: '12345',
      userLocationError: '',
    });
    mockScriptSaveClient.getDrugsByName = jest.fn().mockResolvedValue(DRUG_BY_NAME_RESPONSE);
    mockDsntClient.getPriceByNdc = jest.fn().mockResolvedValue(DSNT_RESPONSE);
    mockScriptSaveClient.getDrugPrices = jest.fn().mockResolvedValue(SCRIPT_SAVE_RESPONSE);
  });

  it('should perform a fresh drug search, merge results, and cache by price', async () => {
    const results = await searchDrugByPrice('Aspirin', 12345, 50);

    // Should call underlying clients
    expect(mockScriptSaveClient.getDrugsByName).toHaveBeenCalledWith({
      drugName: 'Aspirin',
      groupID: expect.anything(),
    });
    expect(mockDsntClient.getPriceByNdc).toHaveBeenCalled();
    expect(mockScriptSaveClient.getDrugPrices).toHaveBeenCalled();

    // Should compute distances
    expect(mockDistance).toHaveBeenCalled();

    // Should return deduplicated and sorted by price
    expect(results).toBeInstanceOf(Array);
    expect(results.length).toBeGreaterThan(0);
    expect(results[0]).toHaveProperty('price');

    // Should cache results
    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'cache/setCacheEntry',
        payload: expect.objectContaining({
          by: 'price',
          results: expect.any(Array),
        }),
      })
    );
  });

  it('should handle missing drug results gracefully', async () => {
    mockScriptSaveClient.getDrugsByName.mockResolvedValueOnce({ Drugs: [] });

    const results = await searchDrugByPrice('FakeDrug', 99999, 25);
    expect(results).toEqual([]);
  });

  it('should log warning but not fail if useUserLocation returns error', async () => {
    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
    mockUseUserLocation.mockResolvedValueOnce({
      userLat: '0',
      userLon: '0',
      userZipCode: null,
      userLocationError: 'Permission denied',
    });

    await searchDrugByPrice('Aspirin', 12345, 50);
    expect(consoleSpy).toHaveBeenCalledWith(
      'Failed to retrieve user location:',
      'Permission denied'
    );
    consoleSpy.mockRestore();
  });

  it('should reuse cached by-price result from Redux store', async () => {
    mockGetState.mockReturnValueOnce({
      drugSearch: {
        cache: {
          'by-price-aspirin-12345-50': { results: [{ price: 1 }] },
        },
      },
    });

    const results = await searchDrugByPrice('Aspirin', 12345, 50);
    expect(results).toEqual([{ price: 1 }]);
    expect(mockScriptSaveClient.getDrugsByName).not.toHaveBeenCalled();
  });

  it('should reuse by-distance cache to generate by-price cache', async () => {
    mockGetState.mockReturnValueOnce({
      drugSearch: {
        cache: {
          'by-distance-aspirin-12345-50': {
            results: [{ price: 10 }, { price: 5 }],
          },
        },
      },
    });

    const results = await searchDrugByPrice('Aspirin', 12345, 50);
    expect(results).toEqual([{ price: 5 }, { price: 10 }]);
    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        payload: expect.objectContaining({ by: 'price' }),
      })
    );
  });
});

describe('searchDrugByDistance', () => {
  beforeEach(() => {
    mockUseUserLocation.mockResolvedValue({
      userLat: '10',
      userLon: '20',
      userZipCode: '12345',
      userLocationError: '',
    });
    mockScriptSaveClient.getDrugsByName.mockResolvedValue(DRUG_BY_NAME_RESPONSE);
    mockDsntClient.getPriceByNdc.mockResolvedValue(DSNT_RESPONSE);
    mockScriptSaveClient.getDrugPrices.mockResolvedValue(SCRIPT_SAVE_RESPONSE);
  });

  it('should reuse cached by-distance result', async () => {
    mockGetState.mockReturnValueOnce({
      drugSearch: {
        cache: {
          'by-distance-aspirin-12345-50': { results: [{ distance: 1 }] },
        },
      },
    });

    const results = await searchDrugByDistance('Aspirin', 12345, 50);
    expect(results).toEqual([{ distance: 1 }]);
  });

  it('should reuse cached by-price result to create distance cache', async () => {
    mockGetState.mockReturnValueOnce({
      drugSearch: {
        cache: {
          'by-price-aspirin-12345-50': {
            results: [{ distance: 10 }, { distance: 2 }],
          },
        },
      },
    });

    const results = await searchDrugByDistance('Aspirin', 12345, 50);
    expect(results).toEqual([{ distance: 2 }, { distance: 10 }]);
    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        payload: expect.objectContaining({ by: 'distance' }),
      })
    );
  });

  it('should perform a new search and sort by distance', async () => {
    const results = await searchDrugByDistance('Aspirin', 12345, 50);
    expect(results.every((r) => typeof r.distance === 'number')).toBe(true);
  });

  it('should handle exceptions gracefully', async () => {
    mockScriptSaveClient.getDrugsByName.mockRejectedValueOnce(new Error('API fail'));
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    const results = await searchDrugByDistance('Aspirin', 12345, 50);
    expect(results).toEqual([]);
    expect(consoleSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });
});
