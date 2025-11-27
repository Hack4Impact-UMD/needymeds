import React from 'react';
import { Image, Linking, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { Pharmacy } from '../../api/types';

const copyIcon = require('../../assets/copy.svg');
const directionsIcon = require('../../assets/directions.svg');
const phoneIcon = require('../../assets/phone.svg');
const closeIcon = require('../../assets/close.svg');

type Props = {
  pharmacy?: Pharmacy | null;
  isOpen: boolean;
  onClose: () => void;
};

const fallbackPharmacy: Pharmacy = {
  pharmacyName: 'Walgreens',
  pharmacyStreet1: '8400 Sycamore Pl',
  pharmacyStreet2: '',
  pharmacyCity: 'College Park',
  pharmacyState: 'MD',
  pharmacyZipCode: '20740',
  distance: 0.1,
  phoneNumber: '(301) 445-8159',
};

export default function PharmacyDetailSheet({ pharmacy, isOpen, onClose }: Props) {
  const data = pharmacy ?? fallbackPharmacy;

  const addressLine = [data.pharmacyStreet1, data.pharmacyStreet2].filter(Boolean).join(' ');
  const cityState = [data.pharmacyCity, data.pharmacyState].filter(Boolean).join(', ');
  const cityStateZip = [cityState, data.pharmacyZipCode].filter(Boolean).join(' ');
  const distanceLabel = data.distance ? `${data.distance}mi` : '';

  const handleCopyAddress = async () => {
    const fullAddress = [addressLine, cityStateZip].filter(Boolean).join(', ');
    await Clipboard.setStringAsync(fullAddress);
  };

  const handleCopyPhone = async () => {
    if (!data.phoneNumber) return;
    await Clipboard.setStringAsync(data.phoneNumber);
  };

  const handleDirections = () => {
    const destination = encodeURIComponent([addressLine, cityStateZip].filter(Boolean).join(', '));
    Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${destination}`);
  };

  const handleCall = () => {
    if (!data.phoneNumber) return;
    const digits = data.phoneNumber.replace(/[^\d+]/g, '');
    Linking.openURL(`tel:${digits}`);
  };

  return (
    <Modal
      visible={isOpen}
      animationType="slide"
      transparent
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />

        <View style={styles.sheet}>
          <View style={styles.handle} />

          <View style={styles.header}>
            <Text style={styles.title}>{data.pharmacyName}</Text>
            <TouchableOpacity onPress={onClose} accessibilityLabel="Close pharmacy details">
              <Image source={closeIcon} style={styles.closeIcon} resizeMode="contain" />
            </TouchableOpacity>
          </View>

          <View style={styles.card}>
            <View style={styles.cardText}>
              <Text style={styles.cardTitle}>{addressLine}</Text>
              <Text style={styles.cardTitle}>{cityStateZip}</Text>
              {distanceLabel ? <Text style={styles.cardSubtitle}>{distanceLabel}</Text> : null}
            </View>
            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.copyButton}
                onPress={handleCopyAddress}
                accessibilityLabel="Copy address"
              >
                <Image source={copyIcon} style={styles.icon} resizeMode="contain" />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.copyButton, styles.primaryAction]}
                onPress={handleDirections}
                accessibilityLabel="Get directions"
              >
                <Image source={directionsIcon} style={styles.primaryIcon} resizeMode="contain" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={[styles.card, styles.phoneCard]}>
            <View style={styles.cardText}>
              <Text style={styles.phoneText}>
                {data.phoneNumber ? data.phoneNumber : 'Phone number unavailable'}
              </Text>
            </View>
            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.copyButton}
                onPress={handleCopyPhone}
                accessibilityLabel="Copy phone number"
              >
                <Image source={copyIcon} style={styles.icon} resizeMode="contain" />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.copyButton, styles.primaryAction]}
                onPress={handleCall}
                accessibilityLabel="Call pharmacy"
              >
                <Image source={phoneIcon} style={styles.primaryIcon} resizeMode="contain" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(17, 24, 39, 0.4)',
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  sheet: {
    backgroundColor: '#F6FAFE',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 22,
    paddingTop: 14,
    paddingBottom: 28,
    gap: 14,
  },
  handle: {
    alignSelf: 'center',
    width: 70,
    height: 6,
    borderRadius: 12,
    backgroundColor: '#DDE2E7',
    marginBottom: 6,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#111827',
  },
  closeIcon: {
    width: 26,
    height: 26,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 14,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DDE2E7',
  },
  phoneCard: {
    marginTop: 4,
  },
  cardText: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2933',
  },
  cardSubtitle: {
    marginTop: 6,
    fontSize: 14,
    color: '#41484D',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 10,
    marginLeft: 16,
  },
  copyButton: {
    width: 46,
    height: 46,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#CDD4DC',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryAction: {
    backgroundColor: '#CBEAF7',
    borderColor: '#CBEAF7',
  },
  icon: {
    width: 22,
    height: 22,
  },
  primaryIcon: {
    width: 24,
    height: 24,
    tintColor: '#236488',
  },
  phoneText: {
    fontSize: 16,
    fontWeight: '400',
    color: '#1F2933',
  },
});
