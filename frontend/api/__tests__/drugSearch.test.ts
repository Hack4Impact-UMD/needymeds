import useUserLocation from '@/hooks/use-user-location';
import { setCacheEntry } from '../../redux/drugSearchSlice';
import { store } from '../../redux/store';
import { distanceBetweenCoordinates, zipToCoords } from '../distance';
import { searchDrugByDistance, searchDrugByPrice } from '../drugSearch';
import { dsntClient } from '../dsntClient';
import { scriptSaveClient } from '../scriptSaveClient';

// -------------------------------
// Mocks
// -------------------------------
jest.mock('@/hooks/use-user-location');
jest.mock('../../redux/drugSearchSlice', () => ({
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
jest.mock('../dsntClient', () => ({
  dsntClient: {
    getPriceByNdc: jest.fn(),
  },
}));
jest.mock('../scriptSaveClient', () => ({
  scriptSaveClient: {
    getDrugsByName: jest.fn(),
    getDrugPrices: jest.fn(),
  },
  groupID: 'GROUP123',
  ndcOverride: 'NDCOVERRIDE',
}));

// -------------------------------
// Helpers
// -------------------------------
const mockUserLocation = {
  userLat: 40,
  userLon: -74,
  userZipCode: '10001',
  userLocationError: null,
};

const mockDrugData = {
  Drugs: [{ NDC: '12345-6789' }],
};

const mockDsntResults = {
  DrugPricing: [
    {
      pharmacy: 'CVS Pharmacy',
      street1: '123 Main St',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      phoneNumber: '555-111-2222',
      ndc: '12345-6789',
      labelName: 'TestDrug',
      price: 10,
    },
  ],
};

const mockScriptSaveResults = {
  drugs: [
    {
      pharmacyName: 'Walgreens',
      address: '456 Park Ave, New York, NY 10001',
      phone: '555-333-4444',
      ndc: '12345-6789',
      ln: 'TestDrug',
      price: 12,
      latitude: 40.1,
      longitude: -74.1,
    },
  ],
};

// -------------------------------
// Setup before each test
// -------------------------------
beforeEach(() => {
  jest.clearAllMocks();

  (useUserLocation as jest.Mock).mockResolvedValue(mockUserLocation);
  (scriptSaveClient.getDrugsByName as jest.Mock).mockResolvedValue(mockDrugData);
  (scriptSaveClient.getDrugPrices as jest.Mock).mockResolvedValue(mockScriptSaveResults);
  (dsntClient.getPriceByNdc as jest.Mock).mockResolvedValue(mockDsntResults);

  (zipToCoords as jest.Mock).mockResolvedValue({ lat: 40, lon: -74 });
  (distanceBetweenCoordinates as jest.Mock).mockReturnValue(1);

  (store.getState as jest.Mock).mockReturnValue({
    drugSearch: { cache: {} },
  });
});

// -------------------------------
// TESTS
// -------------------------------
describe('searchDrugByPrice', () => {
  it('returns sorted results by price', async () => {
    const results = await searchDrugByPrice('TestDrug', 50, true, 10001);

    expect(results).toHaveLength(2);
    expect(results[0].adjudicator).toBe('DSNT');
    expect(results[1].adjudicator).toBe('ScriptSave');

    expect(setCacheEntry).toHaveBeenCalled();
    expect(store.dispatch).toHaveBeenCalled();
  });

  it('returns cached results if available', async () => {
    (store.getState as jest.Mock).mockReturnValueOnce({
      drugSearch: {
        cache: {
          'by-price-testdrug-10001-50': {
            results: [{ pharmacyName: 'Cached Pharmacy', price: 5 }],
          },
        },
      },
    });

    const results = await searchDrugByPrice('TestDrug', 50, true, 10001);
    expect(results).toEqual([{ pharmacyName: 'Cached Pharmacy', price: 5 }]);
    expect(setCacheEntry).not.toHaveBeenCalled();
  });

  it('handles user location errors gracefully', async () => {
    (useUserLocation as jest.Mock).mockResolvedValueOnce({
      ...mockUserLocation,
      userLocationError: 'Location error',
    });

    const results = await searchDrugByPrice('TestDrug', 50, true, 10001);
    expect(results).toEqual([]);
  });
});

describe('searchDrugByDistance', () => {
  it('returns sorted results by distance', async () => {
    const results = await searchDrugByDistance('TestDrug', 50, true, 10001);

    expect(results).toHaveLength(2);
    expect(store.dispatch).toHaveBeenCalled();
  });

  it('uses cached price-sorted results if available', async () => {
    (store.getState as jest.Mock).mockReturnValueOnce({
      drugSearch: {
        cache: {
          'by-price-testdrug-10001-50': {
            results: [
              { pharmacyName: 'CVS', distance: 10 },
              { pharmacyName: 'Walgreens', distance: 20 },
            ],
          },
        },
      },
    });

    const results = await searchDrugByDistance('TestDrug', 50, true, 10001);
    expect(setCacheEntry).toHaveBeenCalled();
  });
});
