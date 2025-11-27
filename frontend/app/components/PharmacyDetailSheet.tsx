import { StyleSheet, View } from 'react-native';
import { Pharmacy } from '../../api/types';
const card = require('../assets/confirmation_number.png');
const arrow = require('../assets/arrow_right.png');

const samplePharmacy: Pharmacy = {
  pharmacyName: 'Walgreens',
  pharmacyStreet1: '8400 Sycamore PI',
  pharmacyStreet2: '',
  pharmacyCity: 'College Park',
  pharmacyState: 'MD',
  pharmacyZipCode: '20740',
  distance: 0.1,
  phoneNumber: '(301)445-8159',
};

export default function PharmacyRow({
  pharmacyName,
  pharmacyStreet1,
  pharmacyStreet2,
  pharmacyCity,
  pharmacyState,
  pharmacyZipCode,
  distance,
  phoneNumber,
}: Pharmacy) {
  return <View></View>;
}

const styles = StyleSheet.create({});
