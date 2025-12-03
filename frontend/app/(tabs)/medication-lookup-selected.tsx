import {
  initializeDrugSearch,
  InitializeDrugSearchResult,
  searchDrugByDistance,
  searchDrugByPrice,
} from '@/api/drugSearch';
import { DrugSearchResult } from '@/api/types';
import getUserLocation from '@/api/userLocation';
import { Colors } from '@/constants/theme';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
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
import ErrorState, { ErrorStateType } from '../components/ErrorState';
import LanguageDropdown from '../components/LanguageDropdown';
import MedicationDetailModal from '../components/medication-lookup/MedicationDetailModal';
import MedicationSearchbar from '../components/medication-lookup/MedicationSearchbar';

const ZIPCODE_LENGTH = 5;
const GENERIC_NAME_TRUNCATE_CUTOFF = 7;

const MedicationLookupSelectedScreen = () => {
  const { t } = useTranslation();

  const sortOptions = [
    { label: t('FilterChipSortPrice'), value: 'price' },
    { label: t('FilterChipSortDist'), value: 'distance' },
  ];

  const params = useLocalSearchParams<{ drugName: string }>();
  const drugNameParam = Array.isArray(params.drugName) ? params.drugName[0] : params.drugName || '';

  useEffect(() => {
    setDrugName(drugNameParam);
  }, [drugNameParam]);

  const [drugName, setDrugName] = useState(drugNameParam);
  const [form, setForm] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [zipCode, setZipCode] = useState('');
  const [radius, setRadius] = useState('5');
  const [sortBy, setSortBy] = useState<'price' | 'distance'>('price');
  const [includeGeneric, setIncludeGeneric] = useState(true);
  const [genericName, setGenericName] = useState('');
  const [selectedDrugResult, setSelectedDrugResult] = useState<DrugSearchResult | null>(null);
  const [zipFocused, setZipFocused] = useState(false);
  const [detectingZip, setDetectingZip] = useState(false);
  const [formOptions, setFormOptions] = useState<{ label: string; value: string }[]>([]);
  const [drugResults, setDrugResults] = useState<DrugSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorType, setErrorType] = useState<ErrorStateType | null>(null);

  useEffect(() => {
    async function initializeSearch() {
      try {
        const { genericVersion, availableForms } = (await initializeDrugSearch(
          drugName
        )) as InitializeDrugSearchResult;
        if (!genericVersion) {
          setGenericName('');
        } else {
          setGenericName(
            genericVersion.length >= GENERIC_NAME_TRUNCATE_CUTOFF
              ? `${genericVersion.slice(0, GENERIC_NAME_TRUNCATE_CUTOFF - 1)}..`
              : genericVersion
          );
        }

        const mappedForms = (availableForms || []).map((f) => ({
          label: f,
          value: f,
        }));

        setForm(mappedForms[0].value);
        setFormOptions(mappedForms);
      } catch (error: any) {
        console.error('Error initializing drug search:', error);
        setErrorType('loading');
      }
    }

    initializeSearch();
  }, [drugName]);

  useEffect(() => {
    if (!quantity || !radius || !zipCode || zipCode.length !== ZIPCODE_LENGTH) {
      return;
    }

    const fetchDrugSearchResults = async () => {
      try {
        setIsLoading(true);
        setErrorType(null);
        let drugSearchResults: DrugSearchResult[];
        if (sortBy === 'price') {
          drugSearchResults = await searchDrugByPrice(
            drugName,
            form,
            Number(radius),
            includeGeneric,
            Number(zipCode)
          );
        } else {
          drugSearchResults = await searchDrugByDistance(
            drugName,
            form,
            Number(radius),
            includeGeneric,
            Number(zipCode)
          );
        }
        setDrugResults(drugSearchResults);
      } catch (error) {
        console.error('Error fetching drug results:', error);
        setErrorType('loading');
        setDrugResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDrugSearchResults();
  }, [sortBy, form, radius, includeGeneric, zipCode]);

  const clearSearch = () => {
    router.push({
      pathname: '/medication-lookup-autocomplete',
      params: {
        drugName: '',
      },
    });
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
                <MedicationSearchbar
                  query={drugName}
                  onChangeText={setDrugName}
                  onClear={clearSearch}
                  onFocus={() =>
                    router.push({
                      pathname: '/medication-lookup-autocomplete',
                      params: {
                        drugName,
                      },
                    })
                  }
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
                  label={t('FormInputLabel')}
                  value={form}
                  render={() => (
                    <Dropdown
                      data={formOptions}
                      placeholder={formOptions.length > 0 ? formOptions[0].label : ''}
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
                  activeOutlineColor="#236488"
                  textColor="#181C20"
                  style={{ backgroundColor: Colors.default.neutrallt }}
                />
              </View>

              {/* How much? field */}
              <View style={styles.formField}>
                <TextInput
                  mode="outlined"
                  label={t('QtyInputLabel')}
                  value={quantity}
                  onChangeText={setQuantity}
                  keyboardType="numeric"
                  outlineStyle={{ borderRadius: 5 }}
                  activeOutlineColor="#236488"
                  textColor="#181C20"
                  maxLength={3}
                  style={{ backgroundColor: Colors.default.neutrallt }}
                />
              </View>
            </View>

            {/* ZIP Code field */}
            <View style={styles.formRow}>
              <View style={styles.formField}>
                <TextInput
                  mode="outlined"
                  label={t('ZipInputLabel')}
                  value={zipCode}
                  onChangeText={setZipCode}
                  keyboardType="numeric"
                  outlineStyle={{ borderRadius: 5 }}
                  activeOutlineColor="#236488"
                  textColor="#181C20"
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
                  onBlur={() => setZipFocused(false)}
                />

                {zipFocused &&
                  zipCode.length !== ZIPCODE_LENGTH &&
                  drugResults.length === 0 &&
                  includeGeneric && (
                    <TouchableOpacity
                      style={styles.detectLocationButton}
                      onPress={() => detectZipFromLocation()}
                      disabled={detectingZip}
                    >
                      {detectingZip && (
                        <ActivityIndicator
                          size="small"
                          color="#3B82F6"
                          style={{ marginRight: 6 }}
                        />
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
                  label={t('RadiusInputLabel')}
                  value={radius}
                  onChangeText={setRadius}
                  keyboardType="numeric"
                  outlineStyle={{ borderRadius: 5 }}
                  activeOutlineColor="#236488"
                  textColor="#181C20"
                  maxLength={4}
                  style={{ backgroundColor: Colors.default.neutrallt }}
                />
                <Text style={styles.radiusUnit}>miles</Text>
              </View>
            </View>
          </View>

          {/* Filter Options */}
          {(drugResults.length > 0 || !includeGeneric) && !isLoading && (
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
              {genericName.length > 0 && (
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
                    {t('FilterChipGenericPrefix')} ({genericName})
                  </Text>
                </TouchableOpacity>
              )}
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
                <ActivityIndicator size="large" style={{ marginTop: 200 }} color="#236488" />
              ) : errorType ? (
                // Show error state
                <ErrorState
                  type={errorType}
                  message="We couldn't load pharmacy results right now. Please check your connection and try again."
                />
              ) : drugResults.length === 0 ? (
                // Show initial empty state (before search)
                <View style={styles.emptyState}>
                  <MaterialIcons name="add-shopping-cart" size={64} color="#555" />
                  <Text style={styles.emptyStateTitle}>{t('EmptyPristineMsg')}</Text>
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
                          <Text style={styles.pharmacyLabel}>{result.labelName}</Text>
                          <Text style={styles.pharmacyName}>{result.pharmacyName}</Text>
                        </View>
                        <Text style={styles.pharmacyPrice}>
                          ${(Number(result.price) * Number(quantity)).toFixed(2)}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.pharmacyRight}>
                      <Text style={styles.pharmacyDistance}>
                        {`${Number(result.distance).toFixed(1)}mi`}
                      </Text>
                      <MaterialCommunityIcons name="chevron-right" size={20} color="#41484D" />
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
      <MedicationDetailModal
        drugName={drugName}
        result={selectedDrugResult}
        quantity={quantity}
        form={form}
        isOpen={!!selectedDrugResult}
        onClose={() => setSelectedDrugResult(null)}
      />
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
    paddingHorizontal: 8,
    zIndex: 100,
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
    paddingHorizontal: 10,
    paddingVertical: 14,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: Colors.default.neutrallt,
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
    color: '#41484D',
    marginBottom: 2,
    fontFamily: 'Roboto',
  },
  pharmacyLabel: {
    fontSize: 12,
    color: '#181C20',
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
    color: '#41484D',
    fontFamily: 'Roboto',
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
    color: '#181C20',
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
