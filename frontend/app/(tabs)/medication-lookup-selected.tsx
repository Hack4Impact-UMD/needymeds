import { searchDrugByPrice } from '@/api/drugSearch';
import { DrugSearchResult } from '@/api/types';
import getUserLocation from '@/api/userLocation';
import { Colors } from '@/constants/theme';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Image,
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
import ErrorState from '../components/errorMessage';
import LanguageDropdown from '../components/LanguageDropdown';
import { LookupSearchbar } from '../components/LookupSearchbar';
import MedicationLookupResultModal from '../components/medication-lookup/MedicationLookupResultModal';

const sortOptions = [
  { label: 'By price', value: 'price' },
  { label: 'By distance', value: 'distance' },
];

const ZIPCODE_LENGTH = 5;

const MedicationLookupSelectedScreen = () => {
  const [form, setForm] = useState('tube');
  const [quantity, setQuantity] = useState('1');
  const [zipCode, setZipCode] = useState('');
  const [radius, setRadius] = useState('5');
  const [sortBy, setSortBy] = useState<'price' | 'distance'>('price');
  const [includeGeneric, setIncludeGeneric] = useState(true);
  const [genericName, setGenericName] = useState('');
  const [selectedDrugResult, setSelectedDrugResult] = useState<DrugSearchResult | null>(null);
  const [query, setQuery] = useState('');
  const [zipFocused, setZipFocused] = useState(false);
  const [detectingZip, setDetectingZip] = useState(false);
  const [formOptions, setFormOptions] = useState(['tube']);
  const [drugResults, setDrugResults] = useState<DrugSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  type PaperInputRef = React.ComponentRef<typeof TextInput>;
  const inputRef = useRef<PaperInputRef>(null);

  const params = useLocalSearchParams<{ drugName: string }>();
  const drugName = Array.isArray(params.drugName) ? params.drugName[0] : params.drugName || '';

  useEffect(() => {
    // TODO: Get forms
    setFormOptions([]);
  }, []);

  useEffect(() => {
    if (!radius || !zipCode || zipCode.length !== ZIPCODE_LENGTH) {
      return;
    }

    const fetchDrugSearchResults = async () => {
      try {
        setIsLoading(true);
        setHasError(false);
        const drugSearchResults: DrugSearchResult[] = await searchDrugByPrice(
          drugName,
          Number(radius),
          includeGeneric,
          Number(zipCode)
        );
        setDrugResults(drugSearchResults);
        setHasSearched(true);
      } catch (error) {
        console.error('Error fetching drug results:', error);
        setHasError(true);
        setDrugResults([]);
        setHasSearched(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDrugSearchResults();
  }, [radius, includeGeneric, zipCode]);

  const clearSearch = () => {
    setQuery('');
    inputRef.current?.focus();
  };

  const detectZipFromLocation = async () => {
    if (detectingZip) return;

    setDetectingZip(true);
    try {
      const userLocationResult = await getUserLocation();
      if (userLocationResult?.userZipCode) {
        setZipCode(userLocationResult.userZipCode);
      } else {
        Alert.alert('Location', 'Could not detect ZIP code.');
      }
    } catch (err) {
      Alert.alert('Location', 'Error detecting location');
    } finally {
      setDetectingZip(false);
      setZipFocused(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.mobileWrapper}>
        <View style={styles.container}>
          {/* Header with Search */}
          <View style={styles.header}>
            <View style={styles.searchContainer}>
              <View style={{ width: '80%' }}>
                <LookupSearchbar
                  query={drugName}
                  onChangeText={setQuery}
                  onClear={clearSearch}
                  onFocus={() => router.push('/medication-lookup-autocomplete')}
                  removeFocus={true}
                />
              </View>

              <LanguageDropdown />
            </View>
          </View>

          <View style={styles.formContainer}>
            <View style={styles.formRow}>
              <View style={styles.formField}>
                {/* Form field */}
                <TextInput
                  mode="outlined"
                  label="Form"
                  value={form}
                  render={() => (
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
                    />
                  )}
                  outlineStyle={{ borderRadius: 5 }}
                  style={{ backgroundColor: Colors.default.neutrallt }}
                />
              </View>

              {/* How much? field */}
              <View style={styles.formField}>
                <TextInput
                  mode="outlined"
                  label="How much?"
                  value={quantity}
                  onChangeText={setQuantity}
                  keyboardType="numeric"
                  outlineStyle={{ borderRadius: 5 }}
                  style={{ backgroundColor: Colors.default.neutrallt }}
                />
              </View>
            </View>

            {/* ZIP Code field */}
            <View style={styles.formRow}>
              <View style={styles.formField}>
                <TextInput
                  mode="outlined"
                  label="ZIP Code"
                  value={zipCode}
                  onChangeText={setZipCode}
                  keyboardType="numeric"
                  outlineStyle={{ borderRadius: 5 }}
                  style={{ backgroundColor: Colors.default.neutrallt }}
                  maxLength={5}
                  left={
                    <TextInput.Icon
                      icon={() => (
                        <MaterialCommunityIcons
                          name="map-marker-outline"
                          size={22}
                          color="#41484D"
                        />
                      )}
                    />
                  }
                  right={
                    zipFocused ? (
                      <TextInput.Icon
                        icon={() => (
                          <MaterialCommunityIcons
                            name="close-circle-outline"
                            size={22}
                            color="#41484D"
                          />
                        )}
                        onPress={() => setZipCode('')}
                      />
                    ) : null
                  }
                  onFocus={() => setZipFocused(true)}
                />

                {zipFocused && (
                  <TouchableOpacity
                    style={styles.detectLocationButton}
                    onPress={() => detectZipFromLocation()}
                    disabled={detectingZip}
                  >
                    {detectingZip && (
                      <ActivityIndicator size="small" color="#3B82F6" style={{ marginRight: 6 }} />
                    )}
                    <Text style={styles.detectLocationText}>
                      {detectingZip ? 'Detecting...' : 'Detect my location'}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Radius field */}
              <View style={styles.formField}>
                <TextInput
                  mode="outlined"
                  label="Radius"
                  value={radius}
                  onChangeText={setRadius}
                  keyboardType="numeric"
                  outlineStyle={{ borderRadius: 5 }}
                  style={{ backgroundColor: Colors.default.neutrallt }}
                />
                <Text style={styles.radiusUnit}>miles</Text>
              </View>
            </View>
          </View>

          {/* Filter Options */}
          {drugResults.length > 0 && !isLoading && (
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
                  renderLeftIcon={() => (
                    <MaterialCommunityIcons
                      name="check"
                      size={18}
                      color="#004E60"
                      style={{ marginRight: 9 }}
                    />
                  )}
                  renderRightIcon={() => (
                    <MaterialCommunityIcons name="chevron-down" size={18} color="#004E60" />
                  )}
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
                    color="#004E60"
                    style={{ marginRight: 8 }}
                  />
                ) : (
                  <View style={{ width: 18, height: 18, marginRight: 7 }} />
                )}
                <Text style={[styles.filterText, includeGeneric && styles.filterTextActive]}>
                  Include generic ({genericName})
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Scrollable Pharmacy List */}
          <ScrollView
            style={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContentContainer}
          >
            <View style={styles.pharmacyListContainer}>
              {isLoading ? (
                // Show loading state
                <ErrorState type="loading" />
              ) : hasError ? (
                // Show error state
                <ErrorState
                  type="generic"
                  message="We couldn't load pharmacy results right now. Please check your connection and try again."
                />
              ) : drugResults.length === 0 ? (
                // Show initial empty state (before search)
                <View style={styles.emptyState}>
                  <MaterialIcons name="add-shopping-cart" size={64} color="#555" />
                  <Text style={styles.emptyStateTitle}>
                    Tell us how much you're looking for,{'\n'}and where you can pick it up.
                  </Text>
                </View>
              ) : (
                // Show results list
                drugResults.map((result) => (
                  <TouchableOpacity
                    key={result.pharmacyName}
                    style={styles.pharmacyItem}
                    onPress={() => setSelectedDrugResult(result)}
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
                          {result.pharmacyName && (
                            <Text style={styles.pharmacyLabel}>{result.pharmacyName}</Text>
                          )}
                          <Text style={styles.pharmacyName}>{result.pharmacyName}</Text>
                        </View>
                        <Text style={styles.pharmacyPrice}>${result.price}</Text>
                      </View>
                    </View>
                    <View style={styles.pharmacyRight}>
                      <Text style={styles.pharmacyDistance}>{result.distance}</Text>
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

      {/* Medication Lookup Result Modal */}
      {selectedDrugResult && (
        <MedicationLookupResultModal
          result={selectedDrugResult}
          setSelectedDrugResult={setSelectedDrugResult}
          drugName={drugName}
          quantity={quantity}
          form={form}
        />
      )}
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
    alignItems: 'center',
    gap: 10,
    justifyContent: 'flex-start',
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
    fontFamily: 'Open Sans',
  },
  clearButton: {
    padding: 4,
    marginLeft: 8,
  },
  scrollContent: {
    flex: 1,
  },
  formContainer: {
    padding: 8,
  },
  formRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  formField: {
    flexDirection: 'column',
    flex: 1,
    position: 'relative',
    zIndex: 0,
  },
  label: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 8,
    fontFamily: 'Open Sans',
  },
  dropdown: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 14,
    height: 44,
    backgroundColor: 'rgba(255, 255, 255, 0)',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 14,
    height: 44,
    fontSize: 15,
    fontFamily: 'Open Sans',
    color: '#111827',
  },
  detectLocationButton: {
    position: 'absolute',
    top: 56,
    flexDirection: 'row',
    width: 190,
    borderRadius: 5,
    alignItems: 'center',
    paddingVertical: 15,
    zIndex: 100,
    paddingHorizontal: 8,
    backgroundColor: '#EBEEF3',
    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.30), 0 2px 6px 2px rgba(0, 0, 0, 0.15)',
  },
  detectLocationText: {
    color: '#181C20',
    fontSize: 16,
    marginLeft: 6,
    fontFamily: 'Open Sans',
  },
  inputIcon: {
    marginLeft: 8,
    marginRight: 4,
  },
  textInputWithIcon: {
    flex: 1,
    paddingHorizontal: 8,
    fontSize: 15,
    fontFamily: 'Open Sans',
    color: '#111827',
  },
  radiusUnit: {
    position: 'absolute',
    top: 20,
    right: 10,
    fontSize: 15,
    color: '#181C20',
    fontFamily: 'Open Sans',
  },
  filterContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
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
    color: '#41484D',
    fontFamily: 'Open Sans',
  },
  filterTextActive: {
    color: '#004E60',
  },
  pharmacyListContainer: {
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
    fontFamily: 'Open Sans',
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
    fontFamily: 'Open Sans',
  },
  pharmacyPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 2,
    fontFamily: 'Open Sans',
  },
  pharmacyLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontFamily: 'Open Sans',
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
    fontFamily: 'Open Sans',
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
    color: '#181C20',
    textAlign: 'center',
    marginTop: 16,
    fontFamily: 'Open Sans',
    lineHeight: 24,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 8,
    fontFamily: 'Open Sans',
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
    paddingHorizontal: 15,
    height: 48,
  },
  dropdownText: {
    fontSize: 15,
    color: '#111827',
    fontFamily: 'Open Sans',
  },
  dropdownContainer: {
    borderRadius: 8,
    borderColor: '#C1C7CE',
  },
  sortDropdown: {
    width: 150,
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
    fontFamily: 'Open Sans',
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

export default MedicationLookupSelectedScreen;
