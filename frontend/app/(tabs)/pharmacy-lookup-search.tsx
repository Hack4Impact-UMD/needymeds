import { Colors } from '@/constants/theme';
import { useSearchPharmacies } from '@/hooks/use-search-pharmacies';
import { Ionicons, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Alert,
  Keyboard,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { ActivityIndicator, Text, TextInput } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Pharmacy } from '../../api/types';
import getUserLocation from '../../api/userLocation';

import BottomNavBar from '../components/BottomNavBar';
import DefaultHeader from '../components/DefaultHeader';
import ErrorState, { ErrorStateType } from '../components/ErrorState';
import PharmacyDetailModal from '../components/pharmacy-lookup/PharmacyDetailModal';
import PharmacySearchResult from '../components/pharmacy-lookup/PharmacySearchResult';

const ZIPCODE_LENGTH = 5;

const PharmacyLocatorScreen = () => {
  const { t } = useTranslation();

  const params = useLocalSearchParams();
  const zipParam = Array.isArray(params.zipCode) ? params.zipCode[0] : (params.zipCode ?? '');
  const radiusParam = Array.isArray(params.radius) ? params.radius[0] : (params.radius ?? '5');

  useEffect(() => {
    setZipCode(zipParam);
    setRadius(radiusParam);
  }, [zipParam, radiusParam]);

  const [zipCode, setZipCode] = useState(zipParam);
  const [zipFocused, setZipFocused] = useState(false);
  const [detectingZip, setDetectingZip] = useState(false);
  const [radius, setRadius] = useState(radiusParam);
  const [filterText, setFilterText] = useState('');
  const [filterTextFocused, setFilterTextFocused] = useState(false);
  const [selectedPharmacy, setSelectedPharmacy] = useState<Pharmacy | null>(null);
  const [filteredPharmacies, setFilteredPharmacies] = useState<Pharmacy[]>([]);
  const [errorType, setErrorType] = useState<ErrorStateType | null>(null);

  const { pharmacies, loading, error } = useSearchPharmacies(zipCode, parseFloat(radius));

  useEffect(() => {
    if (loading) return;

    const filtered = !filterText
      ? pharmacies
      : pharmacies.filter((p) => p.pharmacyName.toLowerCase().includes(filterText.toLowerCase()));

    setFilteredPharmacies(filtered);

    if (error) {
      setErrorType('loading');
    } else if (filtered.length === 0) {
      setErrorType('noPharmacies');
    } else {
      setErrorType(null);
    }
  }, [pharmacies, filterText, error, loading]);

  // Handle radius input - only positive numbers
  const handleRadiusChange = (text: string) => {
    // Allow empty string or valid positive numbers (including decimals)
    if (text === '' || /^\d*\.?\d*$/.test(text)) {
      setRadius(text);
    }
  };

  // Clear ZIP code
  const handleClearZip = () => {
    setZipCode('');
    // Keep dropdown visible since field is still focused
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

  const goBack = () => {
    router.push({
      pathname: '/pharmacy-lookup',
      params: {
        zipCode,
        radius,
      },
    });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <DefaultHeader />
        {/* Title Section */}
        <View style={styles.titleSection} onTouchStart={Keyboard.dismiss}>
          <TouchableOpacity style={styles.breadcrumbContainer} onPress={goBack}>
            <Ionicons name="arrow-back" size={25} color="#41484D" />
            <Text style={styles.breadcrumb}>{t('Breadcrumb')}</Text>
          </TouchableOpacity>
        </View>

        {/* Input Fields */}
        <View style={styles.inputsContainer}>
          <View style={styles.inputRow}>
            {/* ZIP Code Input */}
            <View style={styles.inputWrapper}>
              <TextInput
                label={t('ZipInputLabel2')}
                value={zipCode}
                onChangeText={setZipCode}
                onFocus={() => setZipFocused(true)}
                onBlur={() => setZipFocused(false)}
                placeholder=""
                mode="outlined"
                keyboardType="numeric"
                maxLength={5}
                style={styles.textInput}
                outlineStyle={styles.inputOutline}
                activeOutlineColor="#236488"
                textColor="#181C20"
                left={
                  <TextInput.Icon
                    icon={() => (
                      <MaterialCommunityIcons name="map-marker-outline" size={22} color="#41484D" />
                    )}
                  />
                }
                right={
                  zipCode.length > 0 ? (
                    <TextInput.Icon icon="close" onPress={handleClearZip} />
                  ) : undefined
                }
              />
            </View>

            {/* Radius Input */}
            <View style={styles.inputWrapper}>
              <TextInput
                label={t('RadiusInputLabel')}
                value={radius}
                onChangeText={handleRadiusChange}
                placeholder=""
                mode="outlined"
                keyboardType="decimal-pad"
                style={styles.textInput}
                outlineStyle={styles.inputOutline}
                textColor="#181C20"
                activeOutlineColor="#236488"
                maxLength={4}
                right={
                  <TextInput.Affix text={t('RadiusInputSuffix')} textStyle={{ color: '#41484D' }} />
                }
              />
            </View>

            {/* Dropdown with "Detect my location" option */}
            {zipFocused && zipCode.length !== ZIPCODE_LENGTH && (
              <TouchableOpacity
                style={styles.detectLocationButton}
                onPress={() => detectZipFromLocation()}
                disabled={detectingZip}
              >
                {detectingZip && (
                  <ActivityIndicator size="small" color="#3B82F6" style={{ marginRight: 6 }} />
                )}
                <Text style={styles.detectLocationText}>
                  {detectingZip ? 'Detecting...' : t('ZipDetectOpt')}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Filter Input */}
          <View style={{ position: 'relative' }}>
            <TextInput
              label={t('FilterNameInputLabel')}
              value={filterText}
              onChangeText={setFilterText}
              placeholder=""
              mode="outlined"
              style={styles.textInput}
              outlineStyle={styles.inputOutline}
              textColor="#181C20"
              activeOutlineColor="#236488"
              maxLength={20}
              right={
                filterTextFocused ? (
                  <TextInput.Icon
                    icon={() => (
                      <MaterialCommunityIcons
                        name="close-circle-outline"
                        size={22}
                        color="#41484D"
                      />
                    )}
                    onPress={() => setFilterText('')}
                  />
                ) : undefined
              }
              onFocus={() => setFilterTextFocused(true)}
              onBlur={() => setFilterTextFocused(false)}
              autoCorrect={false}
              spellCheck={false}
            />
          </View>

          <ScrollView showsVerticalScrollIndicator={false} onTouchStart={Keyboard.dismiss}>
            {loading ? (
              <ActivityIndicator size="large" style={{ marginTop: 200 }} color="#236488" />
            ) : pharmacies.length === 0 ? (
              <View style={styles.emptyContainer}>
                <MaterialIcons name="add-business" size={41} color="#41484D" />
                <Text style={styles.emptyMessage}>{t('EmptyMsg2')}</Text>
              </View>
            ) : errorType ? (
              <ErrorState
                type={errorType}
                iconName={errorType === 'noPharmacies' ? 'store-outline' : undefined}
              />
            ) : (
              filteredPharmacies.map((pharmacy) => (
                <PharmacySearchResult
                  key={`${pharmacy.pharmacyName}, ${pharmacy.pharmacyStreet1}, ${pharmacy.pharmacyCity}`}
                  name={pharmacy.pharmacyName}
                  address={`${pharmacy.pharmacyStreet1}, ${pharmacy.pharmacyCity}`}
                  distance={pharmacy.distance!}
                  onPress={() => setSelectedPharmacy(pharmacy)}
                />
              ))
            )}
          </ScrollView>
        </View>
      </View>
      <BottomNavBar />

      {/* Medication Lookup Result Modal */}
      <PharmacyDetailModal
        pharmacy={selectedPharmacy}
        isOpen={!!selectedPharmacy}
        onClose={() => setSelectedPharmacy(null)}
      />
    </SafeAreaView>
  );
};

export default PharmacyLocatorScreen;

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.default.neutrallt,
  },
  container: {
    flex: 1,
    paddingTop: 20,
    paddingRight: 20,
    paddingBottom: (Platform.OS === 'ios' ? 84 : 68) + 236, // bottom navbar height + extra
    paddingLeft: 20,
  },
  titleSection: {
    display: 'flex',
    justifyContent: 'center',
  },
  breadcrumbContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 25,
  },
  breadcrumb: {
    fontSize: 16,
    color: '#181C20',
    fontFamily: 'Open Sans',
  },
  inputsContainer: {
    gap: 20,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 16,
  },
  inputWrapper: {
    flex: 1,
    position: 'relative',
  },
  textInput: {
    backgroundColor: Colors.default.neutrallt,
    fontSize: 16,
    fontFamily: 'Open Sans',
  },
  inputOutline: {
    borderRadius: 8,
  },
  detectLocationButton: {
    position: 'absolute',
    top: 56,
    flexDirection: 'row',
    width: 170,
    borderRadius: 5,
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 8,
    zIndex: 100,
    backgroundColor: '#EBEEF3',
    // iOS shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 2,
    // Android shadow
    elevation: 2,
  },
  detectLocationText: {
    color: '#181C20',
    fontSize: 16,
    marginLeft: 6,
    fontFamily: 'Open Sans',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingTop: 0,
  },
  emptyMessage: {
    fontSize: 16,
    color: '#41484D',
    textAlign: 'center',
    lineHeight: 22,
  },
});
