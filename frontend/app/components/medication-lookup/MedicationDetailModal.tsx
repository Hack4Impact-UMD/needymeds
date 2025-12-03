import { Adjudicator, DrugSearchResult } from '@/api/types';
import { Colors } from '@/constants/theme';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Modal from 'react-native-modal';

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
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // small delay to allow modal animation to start
      const timeout = setTimeout(() => setShowContent(true), 100);
      return () => clearTimeout(timeout);
    } else {
      setShowContent(false);
    }
  }, [isOpen]);

  if (!result || !showContent) {
    return null;
  }

  const formatPhoneNumber = (phone: string) => {
    if (phone.length === PHONE_NUMBER_LENGTH) {
      return `(${phone.slice(0, 3)}) ${phone.slice(3, 6)}-${phone.slice(6, 9)}`;
    } else {
      return phone;
    }
  };

  const formattedPhoneNumber = formatPhoneNumber(result.pharmacyPhone);

  const copyToClipboard = async (text: string) => {
    await Clipboard.setStringAsync(text);
    Alert.alert('Copied', `Copied "${text}" to clipboard`);
  };

  const openMaps = (address: string) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${address}`;
    Linking.openURL(url);
  };

  const makeCall = (phone: string) => {
    const phoneNumber = phone.replace(/[^0-9]/g, '');
    Linking.openURL(`tel:${phoneNumber}`);
  };

  const openDDC = () => {
    onClose();
    router.push({
      pathname: '/ddc',
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
    <Modal
      isVisible={isOpen}
      onSwipeComplete={onClose}
      swipeDirection={['down']}
      style={{ margin: 0, justifyContent: 'flex-end' }}
      backdropColor="black"
      backdropOpacity={0.7}
      backdropTransitionInTiming={300}
      backdropTransitionOutTiming={300}
      onBackdropPress={onClose}
      useNativeDriver={false}
      animationIn="slideInUp"
      animationOut="slideOutDown"
      animationInTiming={300}
      animationOutTiming={300}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.dragHandleContainer}>
            <View style={styles.dragHandle} />
          </View>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{result.pharmacyName}</Text>
            <TouchableOpacity onPress={onClose}>
              <MaterialCommunityIcons name="close" size={24} color="#000" />
            </TouchableOpacity>
          </View>

          <View style={styles.modalBody}>
            {/* Address Section */}
            <View style={styles.infoCard}>
              <View style={styles.infoContent}>
                <Text style={styles.infoText}>{result.pharmacyAddress}</Text>
                <Text style={styles.infoSubtext}>{Number(result.distance).toFixed(1)}mi</Text>
              </View>
              <View style={styles.buttonGroup}>
                <TouchableOpacity
                  style={styles.iconButton}
                  onPress={() => copyToClipboard(`${result.pharmacyAddress}`)}
                >
                  <MaterialCommunityIcons name="content-copy" size={20} color="#181C20" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.iconButtonUI}
                  onPress={() => openMaps(result.pharmacyAddress)}
                >
                  <MaterialCommunityIcons name="directions" size={20} color="#004E60" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Phone Section */}
            <View style={styles.infoCard}>
              <Text style={styles.infoText}>{formattedPhoneNumber}</Text>
              <View style={styles.buttonGroup}>
                <TouchableOpacity
                  style={styles.iconButton}
                  onPress={() => copyToClipboard(formattedPhoneNumber)}
                >
                  <MaterialCommunityIcons name="content-copy" size={20} color="#181C20" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.iconButtonUI}
                  onPress={() => makeCall(result.pharmacyPhone)}
                >
                  <MaterialCommunityIcons name="phone" size={20} color="#004E60" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Price Section */}
            <View style={styles.priceCard}>
              <Text style={styles.priceLabel}>
                {result.labelName} {quantity} {form}
              </Text>
              <Text style={styles.priceAmount}>${Number(result.price) * Number(quantity)}</Text>
              <TouchableOpacity style={styles.sendButtonIcon} onPress={openDDC}>
                <MaterialIcons name="confirmation-number" size={22} color="white" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: Colors.default.neutrallt,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 32,
    maxHeight: '80%',
    width: '100%',
    maxWidth: 412,
    alignSelf: 'center',
  },
  dragHandleContainer: {
    width: '100%',
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 8,
  },
  dragHandle: {
    width: 36,
    height: 4,
    backgroundColor: '#D1D5DB',
    borderRadius: 2,
  },
  infoCard: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#C1C7CE',
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoContent: {
    flex: 1,
  },
  infoText: {
    fontSize: 14,
    color: '#181C20',
    marginBottom: 2,
    fontFamily: 'Open Sans',
  },
  infoSubtext: {
    fontSize: 13,
    color: '#181C20',
    marginTop: 4,
    fontFamily: 'Open Sans',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    maxWidth: '80%',
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Open Sans',
    color: '#111827',
  },
  modalBody: {
    padding: 20,
    gap: 8,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconButtonUI: {
    width: 40,
    height: 40,
    backgroundColor: '#B6EBFF',
    borderRadius: 28,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: 8,
  },
  priceCard: {
    backgroundColor: Colors.default.neutrallt,
    borderWidth: 1,
    borderTopColor: '#C1C7CE',
    borderLeftColor: Colors.default.neutrallt,
    borderRightColor: Colors.default.neutrallt,
    borderBottomColor: Colors.default.neutrallt,
    marginTop: 25,
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceLabel: {
    display: 'flex',
    fontSize: 14,
    color: '#181C20',
    fontFamily: 'OpenSans-SemiBold',
    width: '70%',
  },
  priceAmount: {
    fontSize: 14,
    color: '#181C20',
    fontFamily: 'OpenSans-SemiBold',
  },
  sendButtonIcon: {
    width: 40,
    height: 40,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#236488',
    color: '#fff',
  },
});

export default MedicationDetailModal;
