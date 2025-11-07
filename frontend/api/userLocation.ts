import * as Location from 'expo-location';
import {
  cacheLocation,
  setAddress,
  setError,
  setLoading,
  setZipCode,
} from '../redux/locationSlice';
import { store } from '../redux/store';

export interface UserLocationResult {
  userLat: string;
  userLon: string;
  userZipCode: string;
  userLocationError: string;
}

async function fetchWithRetry(
  url: string,
  options: RequestInit,
  retries = 3,
  delay = 1000
): Promise<Response> {
  for (let attempt = 0; attempt < retries; attempt++) {
    const response = await fetch(url, options);
    if (response.ok) return response;
    if (attempt < retries - 1) {
      await new Promise((resolve) => setTimeout(resolve, delay * (attempt + 1)));
    }
  }
  throw new Error('Nominatim API request failed after retries.');
}

export default async function getUserLocation(): Promise<UserLocationResult> {
  let userLat = '';
  let userLon = '';
  let userZipCode = '';
  let userLocationError = '';

  const dispatch = store.dispatch;

  try {
    dispatch(setLoading(true));
    dispatch(setError(null));

    // Request location permissions
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      throw new Error('Permission to access location was denied.');
    }

    // Get current location
    const location = await Location.getCurrentPositionAsync({});
    if (!location) throw new Error('Error fetching current location.');

    userLat = String(location.coords.latitude);
    userLon = String(location.coords.longitude);

    const cacheKey = `${userLat},${userLon}`;
    const state = store.getState().location;
    const cached = state.cache[cacheKey];

    if (cached) {
      // Use cached result
      userZipCode = cached.zipCode;
      dispatch(setZipCode(userZipCode));
      dispatch(setLoading(false));
      return { userLat, userLon, userZipCode, userLocationError };
    }

    // Build Nominatim request
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${userLat}&lon=${userLon}&format=json`;

    // Retry-enabled API call
    const response = await fetchWithRetry(url, {
      headers: {
        'User-Agent': 'NeedyMeds-App/1.0 (info@needymeds.org)',
      },
    });

    const result = await response.json();
    userZipCode = result?.address?.postcode || '';
    const address = result?.display_name || '';

    if (!userZipCode) throw new Error('Zip code not found in address result.');

    // Update Redux state
    dispatch(setZipCode(userZipCode));
    dispatch(setAddress(address));

    // Cache it
    dispatch(
      cacheLocation({
        lat: userLat,
        lon: userLon,
        zipCode: userZipCode,
        timestamp: Date.now(),
      })
    );
  } catch (err: any) {
    userLocationError = err?.message ?? String(err);
    dispatch(setError(userLocationError));
  } finally {
    dispatch(setLoading(false));
  }

  return { userLat, userLon, userZipCode, userLocationError };
}
