import {
  getStrengthsForForm,
  initializeDrugSearch,
  resetDrugSearch,
  searchDrugByDistance,
  searchDrugByPrice,
  setActiveStrength,
} from '../drugSearch';

import { setCacheEntry } from '../../redux/drugSearchSlice';
import { store } from '../../redux/store';

import { distanceBetweenCoordinates, zipToCoords } from '../distance';
import { dsntClient } from '../dsntClient';
import { scriptSaveClient } from '../scriptSaveClient';

// -------------------------------
// Mocks
// -------------------------------

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
  zipToCoords: jest.fn(),
  distanceBetweenCoordinates: jest.fn(),
}));

jest.mock('../dsntClient', () => ({
  dsntClient: {
    getPriceByNdc: jest.fn(),
  },
}));

jest.mock('../scriptSaveClient', () => ({
  scriptSaveClient: {
    getDrugsByName: jest.fn(),
    getDrugFormStrength: jest.fn(),
    getDrugsByGSN: jest.fn(),
  },
  groupID: 'GROUP123',
}));

// -------------------------------
// Helpers
// -------------------------------

const createMockState = (overrides = {}) => ({
  drugSearch: {
    resultsByPrice: {},
    resultsByDistance: {},
    ...overrides,
  },
});

const mockDsntResults = {
  DrugPricing: [
    {
      pharmacy: 'CVS Pharmacy',
      street1: '123 Main St',
      city: 'Boston',
      state: 'MA',
      zipCode: '02118',
      phoneNumber: '555-111-2222',
      ndc: '12345',
      labelName: 'testdrug tablet',
      price: 10,
    },
  ],
};

const mockScriptSaveResults = {
  Drugs: [
    {
      pharmacyName: 'Walgreens',
      address: '456 Park Ave, Boston, MA 02118',
      phone: '555-333-4444',
      ndc: '12345',
      ln: 'testdrug tablet',
      price: 12,
      latitude: 42.3,
      longitude: -71.0,
    },
  ],
};

// -------------------------------
// Setup
// -------------------------------

beforeEach(async () => {
  jest.clearAllMocks();
  resetDrugSearch();

  (zipToCoords as jest.Mock).mockResolvedValue({
    lat: 42.3,
    lon: -71.0,
  });

  (distanceBetweenCoordinates as jest.Mock).mockReturnValue(1);

  // initializeDrugSearch mocks
  (scriptSaveClient.getDrugsByName as jest.Mock)
    .mockResolvedValueOnce({
      Drugs: [{ NDC: '12345' }],
      Forms: [{ Form: 'Tablet', GSN: 'GSN123' }],
      Names: [{ BrandGeneric: 'G', DrugName: 'TestDrug' }],
    })
    .mockResolvedValueOnce({
      Drugs: [{ NDC: '12345' }],
      Forms: [{ Form: 'Tablet', GSN: 'GSN123' }],
      Names: [{ BrandGeneric: 'B', DrugName: 'TestDrug' }],
    });

  (scriptSaveClient.getDrugFormStrength as jest.Mock).mockResolvedValue({
    Forms: [{ GSN: 'GSN123', CommonQty: 30 }],
    Strengths: [
      {
        Strength: '10 MG',
        GSN: 'GSN123',
        CommonQty: 30,
        LN: 'testdrug tablet',
      },
    ],
  });

  await initializeDrugSearch('TestDrug');
  await getStrengthsForForm('TestDrug', 'Tablet');

  setActiveStrength('TestDrug', 'Tablet', '10 MG', 30, true);

  (scriptSaveClient.getDrugsByGSN as jest.Mock)
    .mockResolvedValueOnce({ Drugs: [{ NDC: '12345' }] })
    .mockResolvedValueOnce(mockScriptSaveResults);

  (dsntClient.getPriceByNdc as jest.Mock).mockResolvedValue(mockDsntResults);

  (store.getState as jest.Mock).mockReturnValue(createMockState());
});

// -------------------------------
// Tests
// -------------------------------

describe('searchDrugByPrice', () => {
  it('returns results sorted by price', async () => {
    const results = await searchDrugByPrice('TestDrug', 'Tablet', 50, true, '02118');

    expect(results.length).toBeGreaterThan(0);

    expect(Number(results[0].price)).toBeLessThanOrEqual(
      Number(results[1]?.price || results[0].price)
    );

    expect(setCacheEntry).toHaveBeenCalled();
    expect(store.dispatch).toHaveBeenCalled();
  });

  it('returns cached price results when available', async () => {
    const key = 'testdrug-02118-50-Tablet-10 MG-30-true';

    (store.getState as jest.Mock).mockReturnValueOnce(
      createMockState({
        resultsByPrice: {
          [key]: {
            results: [{ pharmacyName: 'Cached Pharmacy', price: 5 }],
          },
        },
      })
    );

    const results = await searchDrugByPrice('TestDrug', 'Tablet', 50, true, '02118');

    expect(results).toEqual([{ pharmacyName: 'Cached Pharmacy', price: 5 }]);
    expect(setCacheEntry).not.toHaveBeenCalled();
  });
});

describe('searchDrugByDistance', () => {
  it('returns results sorted by distance', async () => {
    const results = await searchDrugByDistance('TestDrug', 'Tablet', 50, true, '02118');

    expect(results.length).toBeGreaterThan(0);

    expect(Number(results[0].distance)).toBeLessThanOrEqual(
      Number(results[1]?.distance || results[0].distance)
    );

    expect(store.dispatch).toHaveBeenCalled();
  });

  it('uses cached price results to compute distance sort', async () => {
    const key = 'testdrug-02118-50-Tablet-10 MG-30-true';

    (store.getState as jest.Mock).mockReturnValueOnce(
      createMockState({
        resultsByPrice: {
          [key]: {
            results: [
              { pharmacyName: 'CVS', distance: 10, price: 5 },
              { pharmacyName: 'Walgreens', distance: 5, price: 10 },
            ],
          },
        },
      })
    );

    const results = await searchDrugByDistance('TestDrug', 'Tablet', 50, true, '02118');

    expect(setCacheEntry).toHaveBeenCalled();
    expect(results[0].distance).toBe(5);
  });
});
