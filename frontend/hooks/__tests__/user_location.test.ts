import useUserLocation from '../user_location';

// Mock Expo Location
jest.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
  getCurrentPositionAsync: jest.fn(() =>
    Promise.resolve({
      coords: { latitude: 37.7749, longitude: -122.4194 },
    })
  ),
}));

// Mock Redux store and actions
jest.mock('../../redux/store', () => ({
  store: {
    dispatch: jest.fn(),
  },
}));

jest.mock('../../redux/locationSlice', () => ({
  setZipCode: jest.fn((zip: string) => ({ type: 'location/setZipCode', payload: zip })),
  setAddress: jest.fn((addr: string) => ({ type: 'location/setAddress', payload: addr })),
}));

// Mock fetch (Nominatim API)
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () =>
      Promise.resolve({
        display_name: '123 Main St, Test City, TS 12345',
        address: { postcode: '12345', city: 'Test City' },
      }),
  })
) as jest.Mock;

// Tests works when all data is correctly obtained
test('fetches user address and zipcode successfully', async () => {
  const result = await useUserLocation();

  expect(result).toHaveProperty('zipcode', '12345');
  expect(result).toHaveProperty('address', '123 Main St, Test City, TS 12345');
  expect(result.error).toBeUndefined();

  // Verify Redux dispatches were called
  const { store } = require('../../redux/store');
  const { setAddress, setZipCode } = require('../../redux/locationSlice');
  expect(store.dispatch).toHaveBeenCalledWith(setZipCode('12345'));
  expect(store.dispatch).toHaveBeenCalledWith(setAddress('123 Main St, Test City, TS 12345'));
});

test('handles permission denial', async () => {
  const { requestForegroundPermissionsAsync } = require('expo-location');
  requestForegroundPermissionsAsync.mockResolvedValueOnce({ status: 'denied' });

  const result = await useUserLocation();

  expect(result.error).toContain('Permission to access location was denied');
  expect(result.zipcode).toBeUndefined();
  expect(result.address).toBeUndefined();
});

test('handles Nominatim API failure', async () => {
  global.fetch = jest.fn(() => Promise.resolve({ ok: false })) as jest.Mock;

  const result = await useUserLocation();

  expect(result.error).toContain('Request to Nominatim failed');
});

test('handles missing postcode in response', async () => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () =>
        Promise.resolve({
          display_name: '123 Main St, Test City, TS',
          address: { city: 'Test City' }, // no postcode
        }),
    })
  ) as jest.Mock;

  const result = await useUserLocation();

  expect(result.zipcode).toBeUndefined();
  expect(result.address).toBe('123 Main St, Test City, TS');
  expect(result.error).toBeUndefined();
});
