import { Adjudicator, DrugSearchResult } from '@/api/types';
import { Colors } from '@/constants/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { router } from 'expo-router';
import {
  Alert,
  Image,
  Linking,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

interface MedicationLookupResultModalProps {
  result: DrugSearchResult;
  setSelectedDrugResult: React.Dispatch<React.SetStateAction<DrugSearchResult | null>>;
  drugName: string;
  quantity: string;
  form: string;
}

const MedicationLookupResultModal = ({
  result,
  setSelectedDrugResult,
  drugName,
  quantity,
  form,
}: MedicationLookupResultModalProps) => {
  const copyToClipboard = async (text: string) => {
    await Clipboard.setStringAsync(text);
    Alert.alert('Copied', 'Copied to clipboard');
  };

  const openMaps = (address: string) => {
    const url = `https://maps.google.com/?q=${encodeURIComponent(address)}`;
    Linking.openURL(url);
  };

  const makeCall = (phone: string) => {
    const phoneNumber = phone.replace(/[^0-9]/g, '');
    Linking.openURL(`tel:${phoneNumber}`);
  };

  const openDDC = () => {
    setSelectedDrugResult(null);
    router.push({
      pathname: '/DDC',
      params: {
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
      visible={true}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setSelectedDrugResult(null)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.dragHandleContainer}>
            <View style={styles.dragHandle} />
          </View>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{result.pharmacyName}</Text>
            <TouchableOpacity onPress={() => setSelectedDrugResult(null)}>
              <MaterialCommunityIcons name="close" size={24} color="#000" />
            </TouchableOpacity>
          </View>

          <View style={styles.modalBody}>
            {/* Address Section */}
            <View style={styles.infoCard}>
              <View style={styles.infoContent}>
                <Text style={styles.infoText}>{result.pharmacyAddress}</Text>
                <Text style={styles.infoSubtext}>{Number(result.distance).toFixed(2)}</Text>
              </View>
              <View style={styles.buttonGroup}>
                <TouchableOpacity
                  style={styles.iconButton}
                  onPress={() => copyToClipboard(`${result.pharmacyAddress}`)}
                >
                  <MaterialCommunityIcons name="content-copy" size={20} color="#6B7280" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.iconButtonUI}
                  onPress={() => openMaps(result.pharmacyAddress)}
                >
                  <MaterialCommunityIcons name="directions" size={20} color="#236488" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Phone Section */}
            <View style={styles.infoCard}>
              <Text style={styles.infoText}>{result.pharmacyPhone}</Text>
              <View style={styles.buttonGroup}>
                <TouchableOpacity
                  style={styles.iconButton}
                  onPress={() => copyToClipboard(result.pharmacyPhone)}
                >
                  <MaterialCommunityIcons name="content-copy" size={20} color="#6B7280" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.iconButtonUI}
                  onPress={() => makeCall(result.pharmacyPhone)}
                >
                  <MaterialCommunityIcons name="phone" size={20} color="#236488" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Price Section */}
            <View style={styles.priceCard}>
              <View>
                <Text style={styles.priceLabel}>
                  {drugName} {quantity} {form}
                </Text>
                <Text style={styles.priceAmount}>${Number(result.price) * Number(quantity)}</Text>
              </View>
              <TouchableOpacity style={styles.sendButtonIcon} onPress={openDDC}>
                <Image source={require('../../assets/sendIcon.png')} />
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
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
    backgroundColor: '#F9FAFB',
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
    color: '#374151',
    marginBottom: 2,
    fontFamily: 'Open Sans',
  },
  infoSubtext: {
    fontSize: 13,
    color: '#9CA3AF',
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
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Open Sans',
    color: '#111827',
  },
  modalBody: {
    padding: 20,
    gap: 16,
  },
  iconButton: {
    width: 40,
    height: 40,
    backgroundColor: '#fff',
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
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
    fontFamily: 'Open Sans',
  },
  priceAmount: {
    fontSize: 14,
    color: '#111827',
    fontFamily: 'Open Sans',
  },
  sendButtonIcon: {
    width: 40,
    height: 40,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: '#ffffffff',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#236488',
    color: '#fff',
  },
});

export default MedicationLookupResultModal;
