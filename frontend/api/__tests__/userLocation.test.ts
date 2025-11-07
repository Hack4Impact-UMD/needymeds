import * as Location from 'expo-location';
import { cacheLocation, setAddress, setLoading, setZipCode } from '../../redux/locationSlice';
import { store } from '../../redux/store';
import getUserLocation from '../userLocation';

jest.mock('expo-location');
jest.mock('../../redux/store', () => ({
  store: {
    dispatch: jest.fn(),
    getState: jest.fn(() => ({
      location: { cache: {} },
    })),
  },
}));

global.fetch = jest.fn();

const mockDispatch = store.dispatch as jest.Mock;
const mockGetState = store.getState as jest.Mock;
const mockFetch = fetch as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
});

describe('getUserLocation', () => {
  it('should use cached result if available', async () => {
    (Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValueOnce({
      status: 'granted',
    });
    (Location.getCurrentPositionAsync as jest.Mock).mockResolvedValueOnce({
      coords: { latitude: 10, longitude: 20 },
    });

    mockGetState.mockReturnValueOnce({
      location: {
        cache: {
          '10,20': { zipCode: '12345', lat: '10', lon: '20', timestamp: Date.now() },
        },
      },
    });

    const result = await getUserLocation();

    expect(result.userZipCode).toBe('12345');
    expect(mockDispatch).toHaveBeenCalledWith(setZipCode('12345'));
    expect(mockDispatch).toHaveBeenCalledWith(setLoading(false));
  });

  it('should fetch new location data and cache it', async () => {
    (Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValueOnce({
      status: 'granted',
    });
    (Location.getCurrentPositionAsync as jest.Mock).mockResolvedValueOnce({
      coords: { latitude: 10, longitude: 20 },
    });

    const mockJson = jest.fn().mockResolvedValueOnce({
      address: { postcode: '67890' },
      display_name: 'Some Address',
    });

    mockFetch.mockResolvedValueOnce({ ok: true, json: mockJson });

    const result = await getUserLocation();

    expect(result.userZipCode).toBe('67890');
    expect(mockDispatch).toHaveBeenCalledWith(setZipCode('67890'));
    expect(mockDispatch).toHaveBeenCalledWith(setAddress('Some Address'));
    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: cacheLocation.type,
        payload: expect.objectContaining({
          lat: '10',
          lon: '20',
          zipCode: '67890',
        }),
      })
    );
  });

  it('should throw if permission is denied', async () => {
    (Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValueOnce({
      status: 'denied',
    });

    await expect(getUserLocation()).rejects.toThrow('Permission to access location was denied.');

    expect(mockDispatch).toHaveBeenCalledWith(setLoading(false));
  });

  it('should throw if location cannot be fetched', async () => {
    (Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValueOnce({
      status: 'granted',
    });
    (Location.getCurrentPositionAsync as jest.Mock).mockResolvedValueOnce(null);

    await expect(getUserLocation()).rejects.toThrow('Error fetching current location.');

    expect(mockDispatch).toHaveBeenCalledWith(setLoading(false));
  });

  it('should throw if API request fails after retries', async () => {
    (Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValueOnce({
      status: 'granted',
    });
    (Location.getCurrentPositionAsync as jest.Mock).mockResolvedValueOnce({
      coords: { latitude: 10, longitude: 20 },
    });

    mockFetch.mockResolvedValue({ ok: false });

    await expect(getUserLocation()).rejects.toThrow('Nominatim API request failed after retries.');

    expect(mockDispatch).toHaveBeenCalledWith(setLoading(false));
  });

  it('should throw if zip code not found in response', async () => {
    (Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValueOnce({
      status: 'granted',
    });
    (Location.getCurrentPositionAsync as jest.Mock).mockResolvedValueOnce({
      coords: { latitude: 10, longitude: 20 },
    });

    const mockJson = jest.fn().mockResolvedValueOnce({
      address: {},
      display_name: 'Some Address',
    });

    mockFetch.mockResolvedValueOnce({ ok: true, json: mockJson });

    await expect(getUserLocation()).rejects.toThrow('Zip code not found in address result.');

    expect(mockDispatch).toHaveBeenCalledWith(setLoading(false));
  });
});
