import * as Location from 'expo-location';
import useUserLocation from '../../hooks/use-user-location';
import {
  cacheLocation,
  setAddress,
  setError,
  setLoading,
  setZipCode,
} from '../../redux/locationSlice';
import { store } from '../../redux/store';

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

describe('useUserLocation', () => {
  it('should return error if location permission is denied', async () => {
    (Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValueOnce({
      status: 'denied',
    });

    const result = await useUserLocation();

    expect(result.userLocationError).toContain('Permission');
    expect(mockDispatch).toHaveBeenCalledWith(setLoading(true));
    expect(mockDispatch).toHaveBeenCalledWith(setError(expect.anything()));
  });

  it('should return error if location retrieval fails', async () => {
    (Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValueOnce({
      status: 'granted',
    });
    (Location.getCurrentPositionAsync as jest.Mock).mockResolvedValueOnce(null);

    const result = await useUserLocation();
    expect(result.userLocationError).toContain('Error fetching current location');
    expect(mockDispatch).toHaveBeenCalledWith(setError(expect.anything()));
  });

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

    const result = await useUserLocation();

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

    const result = await useUserLocation();

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

  it('should retry API calls and fail after retries', async () => {
    (Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValueOnce({
      status: 'granted',
    });
    (Location.getCurrentPositionAsync as jest.Mock).mockResolvedValueOnce({
      coords: { latitude: 50, longitude: 60 },
    });

    mockFetch
      .mockResolvedValueOnce({ ok: false })
      .mockResolvedValueOnce({ ok: false })
      .mockResolvedValueOnce({ ok: false });

    const result = await useUserLocation();

    expect(result.userLocationError).toContain('Nominatim API request failed after retries');
    expect(mockDispatch).toHaveBeenCalledWith(setError(expect.any(String)));
  });

  it('should throw error if zip code missing in response', async () => {
    (Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValueOnce({
      status: 'granted',
    });
    (Location.getCurrentPositionAsync as jest.Mock).mockResolvedValueOnce({
      coords: { latitude: 30, longitude: 40 },
    });

    const mockJson = jest.fn().mockResolvedValueOnce({
      address: {},
      display_name: 'Unknown Area',
    });

    mockFetch.mockResolvedValueOnce({ ok: true, json: mockJson });

    const result = await useUserLocation();
    expect(result.userLocationError).toContain('Zip code not found');
  });

  it('should handle unexpected exceptions gracefully', async () => {
    (Location.requestForegroundPermissionsAsync as jest.Mock).mockRejectedValueOnce(
      new Error('Unexpected error')
    );

    const result = await useUserLocation();
    expect(result.userLocationError).toContain('Unexpected error');
    expect(mockDispatch).toHaveBeenCalledWith(setError(expect.any(String)));
  });
});
