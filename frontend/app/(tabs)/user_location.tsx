import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';

import * as Location from 'expo-location';
import { Stack } from 'expo-router';

export default function UserLocation() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [address, setAddress] = useState<any | null>(null);
  const [zipcode, setZipcode] = useState('');
  const [error, setError] = useState<string | null>(null);

  // update the user's current location
  useEffect(() => {
    const fetchCurrentLocation = async () => {
      // get permissions from user
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('Permission to access location was denied. Please grant permissions.');
        console.log(error);
        return;
      }

      let currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation);
      console.log('Current Location: ' + JSON.stringify(currentLocation));
    };

    fetchCurrentLocation();
  }, []);

  // reverse geocode the location coordinates into the human-readable address
  useEffect(() => {
    if (!location) {
      return;
    }

    const lat = location.coords.latitude;
    const lon = location.coords.longitude;
    const format = 'json';
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=${format}`;

    const fetchAddress = async () => {
      try {
        const response = await fetch(url); // add headers or do I need 'Access-Control-Allow-Origin'?
        if (!response.ok) {
          setError('Request failed.');
          return;
        }

        const result = await response.json();
        const add = result.address;
        setAddress(result.display_name);
        setZipcode(add.postcode);
        console.log(
          `Formatted address: ${result.address.house_number} ${result.address.road}, ${add.city}, ${add.state} ${add.postcode}`
        );

        console.log('Fetched full address info: ', result);
      } catch (err) {
        setError('Failed to fetch address due to: ' + err);
        console.log('Failed to fetch address due to: ', err);
      }
    };

    fetchAddress();
  }, [location]);

  // Testing to print to screen
  let loc = 'Location...';
  let addy = 'Address...';
  if (!error) {
    loc = JSON.stringify(location);
    addy = JSON.stringify(address);
  }

  return (
    <>
      <Stack.Screen options={{ title: 'User Location' }} />
      <ScrollView style={styles.container}>
        <Text style={styles.text}>Full Location: {loc}</Text>
        <Text style={styles.text}>Latitude: {location?.coords.latitude}</Text>
        <Text style={styles.text}>Longitude: {location?.coords.longitude}</Text>
        <Text style={styles.text}>Address Display Name: {addy}</Text>
        <Text style={styles.text}>Zipcode: {zipcode}</Text>
        <Text style={styles.text}>Error: {error}</Text>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'pink',
  },
  text: {
    textAlign: 'left',
    margin: 10,
  },
});
