import * as Location from 'expo-location';
import { setAddress, setZipCode } from '../redux/locationSlice';
import { store } from '../redux/store';

export interface UserLocationResult {
  zipcode?: string;
  address?: string;
  error?: string;
}

export default async function useUserLocation(): Promise<UserLocationResult> {
  let zipcode: string | undefined;
  let address: string | undefined;
  let error: string | undefined;

  try {
    // Request location permissions
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      return { error: 'Permission to access location was denied. Please grant permissions.' };
    }

    // Get current location
    const location = await Location.getCurrentPositionAsync({});
    if (!location) {
      return { error: 'Error fetching current location.' };
    }

    // Extract latitude and longitude
    const lat = location.coords.latitude;
    const lon = location.coords.longitude;
    const format = 'json';
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=${format}`;

    // API Request to Nominatim
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'NeedyMeds-App/1.0 (info@needymeds.org)',
      },
    });
    if (!response.ok) {
      return { error: 'Request to Nominatim failed.' };
    }

    const result = await response.json();

    const addy = result.address;
    address = result.display_name;
    zipcode = addy?.postcode;

    if (zipcode) store.dispatch(setZipCode(zipcode));
    if (address) store.dispatch(setAddress(address));
  } catch (err: any) {
    error = 'Failed to get location/address: ' + (err.message ?? err);
  }

  return { zipcode, address, error };
}
