import * as Location from 'expo-location';
import { setAddress, setZipCode } from '../redux/locationSlice';
import { store } from '../redux/store';

export interface UserLocationResult {
  zipcode?: string;
  address?: string;
  error?: string;
}

export default async function getUserLocation(): Promise<UserLocationResult> {
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
      return { error: 'Error fetching current location.' }
    }

    // Extract latitude and longitude
    const lat = location.coords.latitude;
    const lon = location.coords.longitude;
    const format = "json";
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=${format}`;

    // API Request to Nominatim
    const response = await fetch(url);
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

  // return (
  //   <>
  //     <Stack.Screen options={{ title: 'User Location' }} />
  //     <ScrollView style={styles.container}>
  //       <Text style={styles.text}>Full Location: {loc}</Text>
  //       <Text style={styles.text}>Latitude: {location?.coords.latitude}</Text>
  //       <Text style={styles.text}>Longitude: {location?.coords.longitude}</Text>
  //       {/* <Text style={styles.text}>Address Display Name: {addy}</Text> */}
  //       {/* <Text style={styles.text}>Zipcode: {zipcode}</Text> */}
  //       <Text style={styles.text}>Redux Zipcode: {zipcode ?? 'Loading...'}</Text>
  //       <Text style={styles.text}>Redux Address: {address ?? 'Loading...'}</Text>
  //       <Text style={styles.text}>Error: {error}</Text>
  //     </ScrollView>
  //   </>
  // );

// const styles = StyleSheet.create({
//   container: {
//     backgroundColor: 'pink',
//   },
//   text: {
//     textAlign: 'left',
//     margin: 10,
//   },
// });
