import { Text, ScrollView, StyleSheet } from 'react-native';

import { useState, useEffect } from 'react';

import * as Location from 'expo-location';
import { Stack } from 'expo-router';

export default function UserLocation() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [address, setAddress] = useState<any | null>(null);
  const [zipcode, setZipcode] = useState('');

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

      let currentLocation = await Location.getCurrentPositionAsync({});
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

    const lat = location.coords.latitude;
    const lon = location.coords.longitude;
    const format = 'json';

    const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=${format}`;
    console.log(url);

    const fetchAddress = async () => {
      try {
        const response = await fetch(url); // add headers
        // need 'Access-Control-Allow-Origin' from source?

        if (!response.ok) {
          console.log('ERROR');
          return;
        }

        const data = await response.json();
        setAddress(data.display_name);
        setZipcode(data.address.postcode);

        console.log('Fetched full address info: ', data);
      } catch (err) {
        setError('Failed to get address: ' + err);
        console.log('Geocoding error: ', err);
      }
    };

    fetchAddress();
  }, [location]);

  // Testing to print to screen
  let loc = 'Location...';
  let addy = 'Address...';
  if (error) {
    loc = JSON.stringify(location);
    addy = error;
  } else if (location) {
    loc = JSON.stringify(location);
    addy = JSON.stringify(address);
  }

  return (
    <>
      <Stack.Screen options={{ title: 'User Location' }} />
      <ScrollView style={styles.container}>
        <Text style={styles.text}>User Location</Text>
        <Text style={styles.text}>{loc}</Text>
        <Text style={styles.text}>Latitude: {location?.coords.latitude}</Text>
        <Text style={styles.text}>Longitude: {location?.coords.longitude}</Text>
        <Text style={styles.text}>Address: {addy}</Text>
        <Text style={styles.text}>Zipcode: {zipcode}</Text>
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
