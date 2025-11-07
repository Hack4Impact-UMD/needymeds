import * as Location from 'expo-location';
import { cacheLocation, setAddress, setLoading, setZipCode } from '../redux/locationSlice';
import { store } from '../redux/store';

export interface UserLocationResult {
  userZipCode: string;
}

async function fetchWithRetry(
  url: string,
  options: RequestInit,
  retries = 3,
  delay = 1000
): Promise<Response> {
  for (let attempt = 0; attempt < retries; attempt++) {
    const response = await fetch(url, options);
    if (response && response.ok) return response;
    if (attempt < retries - 1) {
      await new Promise((resolve) => setTimeout(resolve, delay * (attempt + 1)));
    }
  }
  throw new Error('Nominatim API request failed after retries.');
}

export default async function getUserLocation(): Promise<UserLocationResult> {
  const dispatch = store.dispatch;
  dispatch(setLoading(true));

  try {
    // Request location permissions
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      throw new Error('Permission to access location was denied.');
    }

    // Get current location
    const location = await Location.getCurrentPositionAsync({});
    if (!location) throw new Error('Error fetching current location.');

    const { latitude, longitude } = location.coords;
    const userLat = latitude.toString();
    const userLon = longitude.toString();

    const cacheKey = `${userLat},${userLon}`;
    const state = store.getState().location;
    const cached = state.cache[cacheKey];

    if (cached) {
      // Use cached result
      const userZipCode = cached.zipCode;
      dispatch(setZipCode(userZipCode));
      return { userZipCode };
    }

    const url = `https://nominatim.openstreetmap.org/reverse?lat=${userLat}&lon=${userLon}&format=json`;

    // Retry-enabled API call
    const response = await fetchWithRetry(url, {
      headers: {
        'User-Agent': 'NeedyMeds-App/1.0 (info@needymeds.org)',
      },
    });

    const result = await response.json();
    const userZipCode = result?.address?.postcode || '';
    const address = result?.display_name || '';

    if (!userZipCode) throw new Error('Zip code not found in address result.');

    dispatch(setZipCode(userZipCode));
    dispatch(setAddress(address));

    dispatch(
      cacheLocation({
        lat: userLat,
        lon: userLon,
        address,
        zipCode: userZipCode,
        timestamp: Date.now(),
      })
    );

    return { userZipCode };
  } catch (error) {
    console.error('Error in getUserLocation:', error);
    throw error;
  } finally {
    dispatch(setLoading(false));
  }
}
