import { Adjudicator, DrugSearchResult } from '@/api/types';
import { Colors } from '@/constants/theme';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { router } from 'expo-router';
import { Alert, Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import BottomSheetModal from '../BottomSheetModal';

interface MedicationDetailModalProps {
  drugName: string;
  result: DrugSearchResult | null;
  quantity: string;
  form: string;
  isOpen: boolean;
  onClose: () => void;
}

const PHONE_NUMBER_LENGTH = 10;

const MedicationDetailModal = ({
  drugName,
  result,
  quantity,
  form,
  isOpen,
  onClose,
}: MedicationDetailModalProps) => {
  const insets = useSafeAreaInsets();

  if (!result) return null;

  const formatPhoneNumber = (phone: string) => {
    if (phone.length === PHONE_NUMBER_LENGTH) {
      return `(${phone.slice(0, 3)}) ${phone.slice(3, 6)}-${phone.slice(6, 10)}`;
    }
    return phone;
  };

  const formattedPhoneNumber = formatPhoneNumber(result.pharmacyPhone);

  const copyToClipboard = async (text: string) => {
    await Clipboard.setStringAsync(text);
    Alert.alert('Copied', `Copied "${text}" to clipboard`);
  };

  const openMaps = (address: string) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;
    Linking.openURL(url);
  };

  const makeCall = (phone: string) => {
    const phoneNumber = phone.replace(/[^0-9]/g, '');
    Linking.openURL(`tel:${phoneNumber}`);
  };

  const openDDC = () => {
    onClose();
    router.push({
      pathname: '/DDC',
      params: {
        drugName,
        quantity,
        form,
        adjudicator: result.adjudicator as Adjudicator,
        pharmacyName: result.pharmacyName as string,
        pharmacyAddress: result.pharmacyAddress as string,
        pharmacyPhone: result.pharmacyPhone as string,
        ndc: result.ndc as string,
        labelName: result.labelName as string,
        price: result.price as string,
        latitude: result.latitude as string,
        longitude: result.longitude as string,
        distance: result.distance as string,
      },
    });
  };

  return (
    <BottomSheetModal visible={isOpen} onClose={onClose} animationDuration={300}>
      {/* Make this look/behave just like the working PharmacyDetailModal */}
      <View
        style={[
          styles.sheet,
          { paddingBottom: Math.max(insets.bottom + 8, 22) }, // tuck price row to bottom while clearing the home indicator
        ]}
      >
        <View style={styles.handle} />

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{result.pharmacyName}</Text>
          <TouchableOpacity onPress={onClose}>
            <MaterialCommunityIcons name="close" size={24} color="#000" />
          </TouchableOpacity>
        </View>

        {/* Address card */}
        <View style={styles.card}>
          <View style={styles.cardText}>
            <Text style={styles.cardTitle}>{result.pharmacyAddress}</Text>
            <Text style={styles.cardSubtitle}>{Number(result.distance).toFixed(1)}mi</Text>
          </View>
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => copyToClipboard(result.pharmacyAddress)}
            >
              <MaterialCommunityIcons name="content-copy" size={20} color="#181C20" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.iconButton, styles.primaryAction]}
              onPress={() => openMaps(result.pharmacyAddress)}
            >
              <MaterialCommunityIcons name="directions" size={20} color="#004E60" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Phone card */}
        <View style={styles.card}>
          <View style={styles.cardText}>
            <Text style={styles.phoneText}>{formattedPhoneNumber}</Text>
          </View>
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => copyToClipboard(formattedPhoneNumber)}
            >
              <MaterialCommunityIcons name="content-copy" size={20} color="#181C20" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.iconButton, styles.primaryAction]}
              onPress={() => makeCall(result.pharmacyPhone)}
            >
              <MaterialCommunityIcons name="phone" size={20} color="#004E60" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Price row pinned to bottom of sheet */}
        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>
            {result.labelName} {quantity} {form}
          </Text>
          <Text style={styles.priceAmount}>
            ${(Number(result.price) * Number(quantity)).toFixed(2)}
          </Text>
          <TouchableOpacity style={styles.ticketButton} onPress={openDDC}>
            <MaterialIcons name="confirmation-number" size={22} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </BottomSheetModal>
  );
};

const styles = StyleSheet.create({
  sheet: {
    width: '100%',
    backgroundColor: Colors.default.neutrallt,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 22,
    paddingTop: 16,
    gap: 14,
  },
  handle: {
    alignSelf: 'center',
    width: 70,
    height: 6,
    borderRadius: 12,
    backgroundColor: '#71787E',
    marginBottom: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  title: {
    maxWidth: '80%',
    fontSize: 24,
    fontWeight: '400',
    fontFamily: 'Nunito Sans',
    color: '#181C20',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#C1C7CE',
  },
  cardText: {
    flex: 1,
    maxWidth: '65%',
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#181C20',
    fontFamily: 'Open Sans',
  },
  cardSubtitle: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: '700',
    color: '#181C20',
    fontFamily: 'Open Sans',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 10,
  },
  iconButton: {
    width: 46,
    height: 46,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryAction: {
    backgroundColor: '#B6EBFF',
  },
  phoneText: {
    fontSize: 16,
    color: '#181C20',
    fontFamily: 'Open Sans',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#C1C7CE',
    columnGap: 12,
  },
  priceLabel: {
    flex: 1,
    fontSize: 16,
    color: '#181C20',
    fontFamily: 'OpenSans-SemiBold',
  },
  priceAmount: {
    fontSize: 16,
    color: '#181C20',
    fontFamily: 'OpenSans-SemiBold',
  },
  ticketButton: {
    width: 46,
    height: 46,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#236488',
  },
});

export default MedicationDetailModal;
