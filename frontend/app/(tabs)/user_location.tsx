import { Text, ScrollView, StyleSheet } from 'react-native';

import { useState, useEffect } from 'react';

import * as Location from 'expo-location';
import { Stack } from 'expo-router';

export default function UserLocation() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [address, setAddress] = useState<Location.LocationGeocodedAddress[] | null>(null);

  // update current location
  useEffect(() => {
    const fetchCurrentLocation = async () => {
      // get permission from user
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('Permission to access location was denied. Please grant permissions.');
        console.log(error);
        return;
      }

      let currentLocation = await Location.getCurrentPositionAsync({}); // no dependencies
      setLocation(currentLocation);
      console.log('Current Location: ' + JSON.stringify(currentLocation));
    };

    fetchCurrentLocation();
  }, []);

  // reverse geocode the location coordinates to get the address
  useEffect(() => {
    if (!location) {
      return;
    }
    const fetchAddress = async () => {
      try {
        const reversedGeocode = await Location.reverseGeocodeAsync({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
        console.log('Fetch address: ', reversedGeocode);
        setAddress(reversedGeocode);
      } catch (err) {
        setError('Failed to get address: ' + err);
        console.log('Geocoding error: ', error);
      }
    };

    fetchAddress();
  }, [location]);

  // Testing to print to screen
  let loc = 'Location...';
  let addy = 'Address...';
  if (error) {
    loc = error;
  } else if (location) {
    loc = JSON.stringify(location);
    addy = JSON.stringify(address);
  }

  // <Text style={styles.text}>Address: {address[0].postalCode}</Text>
  // <Text style={styles.text}>Address: {JSON.stringify(address)}</Text>
  return (
    <>
      <Stack.Screen options={{ title: 'User Location' }} />
      <ScrollView style={styles.container}>
        <Text style={styles.text}>User Location</Text>
        <Text style={styles.text}>{loc}</Text>
        <Text style={styles.text}>Latitude: {location?.coords.latitude}</Text>
        <Text style={styles.text}>Longitude: {location?.coords.longitude}</Text>
        <Text style={styles.text}>Address: {addy}</Text>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'pink',
  },
  text: {
    textAlign: 'center',
    margin: 10,
  },
});
