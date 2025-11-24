import { Colors } from '@/constants/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import * as ExpoLocation from 'expo-location';
import React, { useRef, useState } from 'react';
import {
  Alert,
  Image,
  Linking,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import { ActivityIndicator, Text, TextInput } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import BottomNavBar from '../components/BottomNavBar';
import { SearchBar } from '../components/SearchBar';

type PaperInputRef = React.ComponentRef<typeof TextInput>;

interface PharmacySearchScreenProps {
  medicationName: string;
  genericName: string;
  strength: string;
  onClose: () => void;
}

interface Pharmacy {
  id: number;
  name: string;
  price: number;
  distance: string;
  address: string;
  city: string;
  phone: string;
  generic: boolean;
  label?: string;
}

const formOptions = [
  { label: 'tube', value: 'tube' },
  { label: 'cream', value: 'cream' },
  { label: 'ointment', value: 'ointment' },
  { label: 'gel', value: 'gel' },
];

const langOptions = [
  { label: 'EN', value: 'EN' },
  { label: 'SP', value: 'SP' },
];

const sortOptions = [
  { label: 'Price', value: 'price' },
  { label: 'Distance', value: 'distance' },
];

const PharmacySearchScreen: React.FC<PharmacySearchScreenProps> = ({
  medicationName,
  genericName,
  strength,
  onClose,
}) => {
  const [value, setValue] = useState('1');
  const [form, setForm] = useState('tube');
  const [quantity, setQuantity] = useState('1');
  const [zipCode, setZipCode] = useState('20740');
  const [radius, setRadius] = useState('2');
  const [sortBy, setSortBy] = useState<'price' | 'distance'>('price');
  const [includeGeneric, setIncludeGeneric] = useState(true);
  const [selectedPharmacy, setSelectedPharmacy] = useState<Pharmacy | null>(null);
  const [query, setQuery] = useState('');
  const [lang, setLang] = useState('EN');
  type PaperInputRef = React.ComponentRef<typeof TextInput>;
  const inputRef = useRef<PaperInputRef>(null);
  const [zipFocused, setZipFocused] = useState(false);
  const [detectingZip, setDetectingZip] = useState(false);

  const allPharmacies: Pharmacy[] = [];

  // Filter pharmacies based on search query and includeGeneric
  const filteredPharmacies = allPharmacies
    .filter((p) => includeGeneric || !p.generic)
    .filter(
      (p) =>
        query.trim() === '' ||
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.address.toLowerCase().includes(query.toLowerCase()) ||
        p.city.toLowerCase().includes(query.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'price') {
        return a.price - b.price;
      }
      if (sortBy === 'distance') {
        const distA = parseFloat(String(a.distance)) || 0;
        const distB = parseFloat(String(b.distance)) || 0;
        return distA - distB;
      }
      return 0;
    });

  const pharmacies = filteredPharmacies;

  const copyToClipboard = async (text: string) => {
    await Clipboard.setStringAsync(text);
    Alert.alert('Copied', 'Copied to clipboard');
  };

  const clearSearch = () => {
    setQuery('');
    inputRef.current?.focus();
  };

  const openMaps = (address: string, city: string) => {
    const fullAddress = `${address}, ${city}`;
    const url = `https://maps.google.com/?q=${encodeURIComponent(fullAddress)}`;
    Linking.openURL(url);
  };

  const detectZipFromLocation = async () => {
    if (detectingZip) return;
    try {
      setDetectingZip(true);
      const { status } = await ExpoLocation.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Location', 'Location permission denied');
        return;
      }
      const pos = await ExpoLocation.getCurrentPositionAsync({
        accuracy: ExpoLocation.Accuracy.Highest,
      });
      const { latitude, longitude } = pos.coords;

      // Try expo reverse geocode first
      const rev = await ExpoLocation.reverseGeocodeAsync({ latitude, longitude });
      const postcode = rev && rev[0]?.postalCode;
      if (postcode) {
        setZipCode(postcode.toString());
        return;
      }
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`
        );
        const json = await res.json();
        const nomPostcode = json?.address?.postcode;
        if (nomPostcode) {
          setZipCode(nomPostcode.toString());
          return;
        }
      } catch {}
      Alert.alert('Location', 'Could not determine ZIP code from your location');
    } catch (err) {
      Alert.alert('Location', 'Error detecting location');
    } finally {
      setDetectingZip(false);
    }
  };

  const makeCall = (phone: string) => {
    const phoneNumber = phone.replace(/[^0-9]/g, '');
    Linking.openURL(`tel:${phoneNumber}`);
  };

  const handleLang = (item: any) => {
    if (item && item.value) setLang(item.value);
  };

  const PharmacyDetailsModal = ({ pharmacy }: { pharmacy: Pharmacy }) => (
    <Modal
      visible={true}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setSelectedPharmacy(null)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.dragHandleContainer}>
            <View style={styles.dragHandle} />
          </View>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{pharmacy.name}</Text>
            <TouchableOpacity onPress={() => setSelectedPharmacy(null)}>
              <MaterialCommunityIcons name="close" size={24} color="#000" />
            </TouchableOpacity>
          </View>

          <View style={styles.modalBody}>
            {/* Address Section */}
            <View style={styles.infoCard}>
              <View style={styles.infoContent}>
                <Text style={styles.infoText}>{pharmacy.address}</Text>
                <Text style={styles.infoText}>{pharmacy.city}</Text>
                <Text style={styles.infoSubtext}>{pharmacy.distance}</Text>
              </View>
              <View style={styles.buttonGroup}>
                <TouchableOpacity
                  style={styles.iconButton}
                  onPress={() => copyToClipboard(`${pharmacy.address}, ${pharmacy.city}`)}
                >
                  <MaterialCommunityIcons name="content-copy" size={20} color="#6B7280" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.iconButtonUI}
                  onPress={() => openMaps(pharmacy.address, pharmacy.city)}
                >
                  <MaterialCommunityIcons name="directions" size={20} color="#236488" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Phone Section */}
            <View style={styles.infoCard}>
              <Text style={styles.infoText}>{pharmacy.phone}</Text>
              <View style={styles.buttonGroup}>
                <TouchableOpacity
                  style={styles.iconButton}
                  onPress={() => copyToClipboard(pharmacy.phone)}
                >
                  <MaterialCommunityIcons name="content-copy" size={20} color="#6B7280" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.iconButtonUI}
                  onPress={() => makeCall(pharmacy.phone)}
                >
                  <MaterialCommunityIcons name="phone" size={20} color="#236488" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Price Section */}
            <View style={styles.priceCard}>
              <View>
                <Text style={styles.priceLabel}>
                  {medicationName} {quantity} {form}
                </Text>
                <Text style={styles.priceAmount}>${pharmacy.price}</Text>
              </View>
              <TouchableOpacity style={styles.sendButtonIcon}>
                <Image source={require('../assets/sendIcon.svg')} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.mobileWrapper}>
        <View style={styles.container}>
          {/* Header with Search */}
          <View style={styles.header}>
            <View style={styles.searchContainer}>
              <SearchBar query={query} onChangeText={setQuery} onClear={clearSearch} />
              <Dropdown
                mode="modal"
                placeholder="EN"
                value={lang}
                labelField="label"
                valueField="value"
                data={langOptions}
                onChange={handleLang}
                style={styles.langDropdown}
                placeholderStyle={styles.langText}
                itemTextStyle={styles.langText}
                selectedTextStyle={styles.langText}
              />
            </View>
          </View>

          {/* Form Inputs */}
          <View style={styles.formContainer}>
            <View style={styles.formRow}>
              <View style={styles.formField}>
                <Text style={styles.label}>Form</Text>

                <View style={styles.outlinedWrapper}>
                  <Dropdown
                    data={formOptions}
                    labelField="label"
                    valueField="value"
                    value={form}
                    onChange={(item) => setForm(item.value)}
                    style={styles.dropdownInner}
                    selectedTextStyle={styles.dropdownText}
                    itemTextStyle={styles.dropdownText}
                    containerStyle={styles.dropdownContainer}
                    placeholder="Select"
                  />
                </View>
              </View>
              <View style={styles.formField}>
                <TextInput
                  mode="outlined"
                  label="How much?"
                  value={value}
                  onChangeText={setValue}
                  keyboardType="numeric"
                  outlineStyle={{ borderRadius: 5 }}
                  style={{ backgroundColor: 'white' }}
                />
              </View>
            </View>

            <View style={styles.formRow}>
              <View style={styles.formField}>
                <Text style={styles.label}>ZIP Code</Text>
                <View style={[styles.zipInputContainer, zipFocused && styles.zipInputFocused]}>
                  <MaterialCommunityIcons
                    name="map-marker"
                    size={18}
                    color="#6B7280"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    placeholder="ZIP Code"
                    placeholderTextColor="#9CA3AF"
                    value={zipCode}
                    onChangeText={setZipCode}
                    keyboardType="numeric"
                    maxLength={5}
                    style={styles.zipInput}
                    onFocus={() => setZipFocused(true)}
                    onBlur={() => {
                      // Delay blur to allow button click
                      setTimeout(() => setZipFocused(false), 200);
                    }}
                    underlineColor="transparent"
                    activeUnderlineColor="transparent"
                  />
                  {zipCode.length > 0 && (
                    <TouchableOpacity onPress={() => setZipCode('')} style={styles.zipClearButton}>
                      <MaterialCommunityIcons name="close-circle" size={18} color="#9CA3AF" />
                    </TouchableOpacity>
                  )}
                </View>
                {zipFocused && (
                  <TouchableOpacity
                    style={styles.detectLocationButton}
                    onPress={detectZipFromLocation}
                    disabled={detectingZip}
                  >
                    {detectingZip ? (
                      <ActivityIndicator size="small" color="#3B82F6" style={{ marginRight: 6 }} />
                    ) : (
                      <MaterialCommunityIcons name="crosshairs-gps" size={16} color="#3B82F6" />
                    )}
                    <Text style={styles.detectLocationText}>
                      {detectingZip ? 'Detecting...' : 'Detect my location'}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
              <View style={styles.formField}>
                <View style={styles.radiusRow}>
                  <TextInput
                    mode="outlined"
                    label="Radius"
                    value={radius}
                    onChangeText={setRadius}
                    keyboardType="numeric"
                    outlineStyle={{ borderRadius: 5 }}
                    style={{ backgroundColor: 'white' }}
                  />
                  <Text style={styles.radiusUnit}>miles</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Filter Options */}
          <View style={styles.filterContainer}>
            <View style={{ marginRight: 8 }}>
              <Dropdown
                data={sortOptions}
                labelField="label"
                valueField="value"
                value={sortBy}
                onChange={(item) => setSortBy(item.value)}
                style={styles.sortDropdown}
                selectedTextStyle={styles.sortDropdownText}
                placeholderStyle={styles.sortDropdownText}
                itemTextStyle={styles.sortDropdownText}
                showsVerticalScrollIndicator={false}
              />
            </View>
            <TouchableOpacity
              style={[styles.simpleFilterButton, includeGeneric && styles.filterButtonActive]}
              onPress={() => setIncludeGeneric(!includeGeneric)}
              activeOpacity={0.8}
            >
              {includeGeneric ? (
                <MaterialCommunityIcons
                  name="check"
                  size={18}
                  color="#6B7280"
                  style={{ marginRight: 8 }}
                />
              ) : (
                <View style={{ width: 18, height: 18, marginRight: 8 }} />
              )}
              <Text style={[styles.filterText, includeGeneric && styles.filterTextActive]}>
                Include generic ({genericName})
              </Text>
            </TouchableOpacity>
          </View>

          {/* Scrollable Pharmacy List */}
          <ScrollView
            style={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContentContainer}
          >
            <View style={styles.pharmacyListContainer}>
              {pharmacies.length === 0 ? (
                <View style={styles.emptyState}>
                  <Image source={require('../assets/add_shopping_cart.svg')} />
                  <Text style={styles.emptyStateTitle}>
                    {query.trim() !== ''
                      ? 'Looks like that’s not available here right \nnow. Try checking other zip codes or \nincreasing the search radius.'
                      : "Tell us how much you're looking for,\nand where you can pick it up."}
                  </Text>
                </View>
              ) : (
                pharmacies.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.pharmacyItem}
                    onPress={() => setSelectedPharmacy(item)}
                  >
                    <View style={styles.pharmacyLeft}>
                      <View style={styles.pharmacyIcon}>
                        <Image
                          source={require('../assets/confirmation_number.png')}
                          style={{ width: 24, height: 24 }}
                        />
                      </View>
                      <View style={styles.pharmacyInfo}>
                        <View style={[styles.pharmacyHeader, styles.pharmacyHeaderColumn]}>
                          {item.label && <Text style={styles.pharmacyLabel}>{item.label}</Text>}
                          <Text style={styles.pharmacyName}>{item.name}</Text>
                        </View>
                        <Text style={styles.pharmacyPrice}>${item.price.toFixed(2)}</Text>
                      </View>
                    </View>
                    <View style={styles.pharmacyRight}>
                      <Text style={styles.pharmacyDistance}>{item.distance}</Text>
                      <MaterialCommunityIcons name="chevron-right" size={20} color="#9CA3AF" />
                    </View>
                  </TouchableOpacity>
                ))
              )}
            </View>
          </ScrollView>
        </View>
      </View>
      <BottomNavBar />

      {/* Pharmacy Details Modal */}
      {selectedPharmacy && <PharmacyDetailsModal pharmacy={selectedPharmacy} />}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.default.neutrallt,
  },
  mobileWrapper: {
    flex: 1,
    width: '100%',
    maxWidth: 412,
    alignSelf: 'center',
    backgroundColor: Colors.default.neutrallt,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.default.neutrallt,
    paddingTop: 0,
    paddingBottom: 0,
  },
  scrollContentContainer: {
    paddingBottom: Platform.OS === 'ios' ? 84 : 68,
  },
  header: {
    backgroundColor: Colors.default.neutrallt,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: Colors.default.neutrallt,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
    fontFamily: 'Nunito Sans',
  },
  clearButton: {
    padding: 4,
    marginLeft: 8,
  },
  langDropdown: {
    width: 70,
    height: 36,
    borderColor: '#D1D5DB',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
  },
  langText: {
    color: '#41484D',
    fontSize: 14,
    fontFamily: 'Nunito Sans',
  },
  scrollContent: {
    flex: 1,
  },
  formContainer: {
    padding: 16,
    backgroundColor: Colors.default.neutrallt,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  formRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  formField: {
    flex: 1,
  },
  label: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 8,
    fontFamily: 'Nunito Sans',
  },
  dropdown: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 14,
    height: 44,
    backgroundColor: '#fff',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 14,
    height: 44,
    fontSize: 15,
    backgroundColor: '#fff',
    fontFamily: 'Nunito Sans',
    color: '#111827',
  },
  zipInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 2,
  },
  zipInputFocused: {
    borderColor: '#7C3AED',
    borderWidth: 2,
  },
  zipInput: {
    flex: 1,
    fontSize: 15,
    color: '#111827',
    paddingVertical: 10,
    fontFamily: 'Nunito Sans',
    backgroundColor: 'transparent',
  },
  zipClearButton: {
    padding: 4,
  },
  detectLocationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingVertical: 4,
  },
  detectLocationText: {
    color: '#3B82F6',
    fontSize: 14,
    marginLeft: 6,
    fontFamily: 'Nunito Sans',
  },
  inputIcon: {
    marginLeft: 8,
    marginRight: 4,
  },
  textInputWithIcon: {
    flex: 1,
    paddingHorizontal: 8,
    fontSize: 15,
    fontFamily: 'Nunito Sans',
    color: '#111827',
  },
  radiusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  radiusInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 14,
    height: 44,
    fontSize: 15,
    backgroundColor: '#fff',
    fontFamily: 'Nunito Sans',
    color: '#111827',
  },
  radiusUnit: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'Nunito Sans',
  },
  filterContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: Colors.default.neutrallt,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#F6FAFE',
    color: '#004E60',
  },
  filterButtonActive: {
    backgroundColor: '#B6EBFF',
    color: '#004E60',
    borderWidth: 0,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  filterText: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'Nunito Sans',
  },
  filterTextActive: {
    color: '#6B7280',
    fontWeight: '500',
  },
  pharmacyListContainer: {
    backgroundColor: Colors.default.neutrallt,
    flex: 1,
  },
  pharmacyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: Colors.default.neutrallt,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  pharmacyLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  pharmacyIcon: {
    width: 44,
    height: 44,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pharmacyInfo: {
    flex: 1,
  },
  pharmacyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  pharmacyName: {
    fontSize: 15,
    fontWeight: '500',
    color: '#111827',
    fontFamily: 'Nunito Sans',
  },
  genericBadge: {
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  genericText: {
    fontSize: 11,
    color: '#3B82F6',
    fontWeight: '500',
    fontFamily: 'Nunito Sans',
  },
  pharmacyPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 2,
    fontFamily: 'Nunito Sans',
  },
  pharmacyLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontFamily: 'Nunito Sans',
  },
  pharmacyRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginLeft: 12,
  },
  pharmacyDistance: {
    fontSize: 13,
    color: '#6B7280',
    fontFamily: 'Nunito Sans',
  },
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
    fontFamily: 'Nunito Sans',
    color: '#111827',
  },
  modalBody: {
    padding: 20,
    gap: 16,
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
    fontFamily: 'Nunito Sans',
  },
  infoSubtext: {
    fontSize: 13,
    color: '#9CA3AF',
    marginTop: 4,
    fontFamily: 'Nunito Sans',
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: 8,
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
    fontFamily: 'Nunito Sans',
  },
  priceAmount: {
    fontSize: 14,
    color: '#111827',
    fontFamily: 'Nunito Sans',
  },
  sendButton: {
    width: 48,
    height: 48,
    backgroundColor: '#3B82F6',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyStateTitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 16,
    fontFamily: 'Nunito Sans',
    lineHeight: 24,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 8,
    fontFamily: 'Nunito Sans',
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
  outlinedWrapper: {
    borderWidth: 1,
    borderColor: '#C1C7CE',
    borderRadius: 8,
    backgroundColor: '#fff',
    height: 48,
    justifyContent: 'center',
    paddingHorizontal: 12,
  },

  dropdownInner: {
    paddingHorizontal: 0,
    height: 48,
  },

  dropdownText: {
    fontSize: 15,
    color: '#111827',
    fontFamily: 'Nunito Sans',
  },

  dropdownContainer: {
    borderRadius: 8,
    borderColor: '#C1C7CE',
  },
  sortDropdown: {
    width: 140,
    height: 40,
    borderRadius: 8,
    borderWidth: 0,
    paddingHorizontal: 12,
    backgroundColor: '#B6EBFF',
    justifyContent: 'center',
  },
  sortDropdownText: {
    color: '#41484D',
    fontSize: 14,
    fontFamily: 'Nunito Sans',
  },
  simpleFilterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: 'transparent',
    borderColor: '#6B7280',
    borderWidth: 1,
  },
  pharmacyHeaderColumn: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 4,
  },
});
export default PharmacySearchScreen;
