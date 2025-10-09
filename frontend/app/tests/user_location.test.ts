import getUserLocation from "../(tabs)/user_location";

// Mock Expo Location
jest.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: jest.fn(() =>
    Promise.resolve({ status: 'granted' })
  ),
  getCurrentPositionAsync: jest.fn(() =>
    Promise.resolve({
      coords: { latitude: 37.7749, longitude: -122.4194 },
    })
  ),
}));

// Mock Redux store and actions
jest.mock('../redux/store', () => ({
  store: {
    dispatch: jest.fn(),
  },
}));

jest.mock('../redux/locationSlice', () => ({
  setZipCode: jest.fn((zip: string) => ({ type: 'SET_ZIP', payload: zip })),
  setAddress: jest.fn((addr: string) => ({ type: 'SET_ADDR', payload: addr })),
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

// Actual test
test("fetches user address and zipcode successfully", async () => {
  const result = await getUserLocation();

  expect(result).toHaveProperty("zipcode", "12345");
  expect(result).toHaveProperty("address", "123 Main St, Test City, TS 12345");
  expect(result.error).toBeUndefined();

  // Verify Redux dispatches were called
  const { store } = require('../redux/store');
  const { setAddress, setZipCode } = require('../redux/locationSlice');
  expect(store.dispatch).toHaveBeenCalledWith(setZipCode("12345"));
  expect(store.dispatch).toHaveBeenCalledWith(setAddress("123 Main St, Test City, TS 12345"));
});
