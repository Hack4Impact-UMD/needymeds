import { Colors } from '@/constants/theme';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { useTranslation } from 'react-i18next';
import { Alert, Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Pharmacy } from '../../../api/types';
import BottomSheetModal from '../BottomSheetModal';

type Props = {
  pharmacy: Pharmacy | null;
  isOpen: boolean;
  onClose: () => void;
};

const PHONE_NUMBER_LENGTH = 10;

export default function PharmacyDetailModal({ pharmacy, isOpen, onClose }: Props) {
  const { t } = useTranslation();

  if (!pharmacy) return null;

  const data = pharmacy;

  const addressLine = [data.pharmacyStreet1, data.pharmacyStreet2].filter(Boolean).join(' ');
  const cityState = [data.pharmacyCity, data.pharmacyState].filter(Boolean).join(', ');
  const cityStateZip = [cityState, data.pharmacyZipCode].filter(Boolean).join(' ');
  const distanceLabel = data.distance ? `${Number(data.distance).toFixed(1)}mi` : '';

  const formatPhoneNumber = (phone: string) => {
    if (phone.length === PHONE_NUMBER_LENGTH) {
      return `(${phone.slice(0, 3)}) ${phone.slice(3, 6)}-${phone.slice(6, 10)}`;
    } else {
      return phone;
    }
  };

  const formattedPhoneNumber = formatPhoneNumber(data.phoneNumber);

  const handleCopyAddress = async () => {
    const fullAddress = [addressLine, cityStateZip].filter(Boolean).join(', ');
    await Clipboard.setStringAsync(fullAddress);
    Alert.alert('Copied', `Copied "${fullAddress}" to clipboard`);
  };

  const handleCopyPhone = async () => {
    if (!data.phoneNumber) return;
    await Clipboard.setStringAsync(formattedPhoneNumber);
    Alert.alert('Copied', `Copied "${formattedPhoneNumber}" to clipboard`);
  };

  const handleDirections = () => {
    const destination = encodeURIComponent([addressLine, cityStateZip].filter(Boolean).join(', '));
    Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${destination}`);
  };

  const handleCall = (phone: string) => {
    const phoneNumber = phone.replace(/[^0-9]/g, '');
    Linking.openURL(`tel:${phoneNumber}`);
  };

  return (
    <BottomSheetModal visible={isOpen} onClose={onClose} animationDuration={300}>
      <View style={styles.sheet}>
        <View style={styles.handle} />

        <View style={styles.header}>
          <Text style={styles.title}>{data.pharmacyName}</Text>
          <TouchableOpacity onPress={onClose} accessibilityLabel={t('closeIcon4')}>
            <MaterialIcons name="close" size={28} color="#41484D" />
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
              accessibilityLabel={t('content_copyIcon')}
            >
              <MaterialCommunityIcons name="content-copy" size={20} color="#181C20" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.copyButton, styles.primaryAction]}
              onPress={handleDirections}
              accessibilityLabel={t('directionsIconButton')}
            >
              <MaterialCommunityIcons name="directions" size={20} color="#004E60" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={[styles.card]}>
          <View style={styles.cardText}>
            <Text style={styles.phoneText}>{formatPhoneNumber(data.phoneNumber)}</Text>
          </View>
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.copyButton}
              onPress={handleCopyPhone}
              accessibilityLabel={t('content_copyIcon')}
            >
              <MaterialCommunityIcons name="content-copy" size={20} color="#181C20" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.copyButton, styles.primaryAction]}
              onPress={() => handleCall(data.phoneNumber)}
              accessibilityLabel={t('phoneIconButton')}
            >
              <MaterialCommunityIcons name="phone" size={20} color="#004E60" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  sheet: {
    width: '100%',
    backgroundColor: Colors.default.neutrallt,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 22,
    paddingTop: 14,
    paddingBottom: 150,
    gap: 6,
  },
  handle: {
    alignSelf: 'center',
    width: 70,
    height: 6,
    borderRadius: 12,
    backgroundColor: '#71787E',
    marginBottom: 6,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  title: {
    maxWidth: '80%',
    fontSize: 24,
    fontWeight: '400',
    color: '#181C20',
    fontFamily: 'Nunito Sans',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#C1C7CE',
  },
  cardText: {
    flex: 1,
    maxWidth: '60%',
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
  copyButton: {
    width: 46,
    height: 46,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryAction: {
    backgroundColor: '#B6EBFF',
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
