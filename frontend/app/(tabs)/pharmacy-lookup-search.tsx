import { Colors } from '@/constants/theme';
import { useSearchPharmacies } from '@/hooks/use-search-pharmacies';
import { useSavedPharmacies } from '@/hooks/use-saved-pharmacies';
import { Ionicons, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams, useNavigation } from 'expo-router';
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
import { ActivityIndicator, Divider, Text, TextInput } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Pharmacy } from '../../api/types';
import getUserLocation from '../../api/userLocation';

import BottomNavBar from '../components/BottomNavBar';
import DefaultHeader from '../components/DefaultHeader';
import ErrorState, { ErrorStateType } from '../components/ErrorState';
import PharmacyDetailModal from '../components/pharmacy-lookup/PharmacyDetailModal';

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

  const navigation = useNavigation();
  const {
    pharmacies: savedPharmacies,
    savePharmacy,
    deletePharmacy,
    refreshPharmacies,
  } = useSavedPharmacies();

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      refreshPharmacies();
    });
    return unsubscribe;
  }, [navigation, refreshPharmacies]);

  const formatAddress = (pharmacy: Pharmacy) => {
    return `${pharmacy.pharmacyStreet1}, ${pharmacy.pharmacyCity}, ${pharmacy.pharmacyState} ${pharmacy.pharmacyZipCode}`;
  };

  const isSaved = (pharmacy: Pharmacy) => {
    return savedPharmacies.some(
      (sp) => sp.name === pharmacy.pharmacyName && sp.address === formatAddress(pharmacy)
      // just match npi instead?
      // && sp.npi === pharmacy.npi
    );
  };

  const getSavedId = (pharmacy: Pharmacy) => {
    const found = savedPharmacies.find(
      (sp) => sp.name === pharmacy.pharmacyName && sp.address === formatAddress(pharmacy)
      // match on npi instead?
      // return savedPharmacies.find((sp) => sp.npi === pharmacy.npi)?.npi;
    );
    return found?.npi;
  };

  const toggleStar = (pharmacy: Pharmacy) => {
    const saved = isSaved(pharmacy);

    // pharmacy is already saved so toggle to unfavorite
    if (saved) {
      const id = getSavedId(pharmacy);
      if (id) deletePharmacy(id);
      return;
    }

    // pharmacy has not been saved yet so favorite it
    if (savedPharmacies.length === 0) {
      savePharmacy({
        npi: formatAddress(pharmacy),
        // npi: pharmacy.npi
        name: pharmacy.pharmacyName,
        address: formatAddress(pharmacy),
        phoneNumber: pharmacy.phoneNumber,
      });
    }

    // another pharmacy is currently saved so confirm to replace with new pharmacy
    Alert.alert(
      'Replace Favorite Pharmacy',
      'You already have a saved pharmacy. Do you want to replace it?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Yes',
          onPress: () => {
            // remove current favorited pharmacy
            const current = savedPharmacies[0];
            if (current?.npi) {
              // needed ?
              deletePharmacy(current.npi);
            }
            // save new pharmacy
            savePharmacy({
              npi: pharmacy.pharmacyName,
              // npi: pharmacy.npi
              name: pharmacy.pharmacyName,
              address: formatAddress(pharmacy),
              phoneNumber: pharmacy.phoneNumber,
            });
          },
        },
      ]
    );
  };

  const { pharmacies, loading, error } = useSearchPharmacies(zipCode, parseFloat(radius));

  useEffect(() => {
    if (loading || pharmacies.length === 0) return;

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
              filteredPharmacies.map((pharmacy) => {
                const key = `${pharmacy.pharmacyName}, ${pharmacy.pharmacyStreet1}, ${pharmacy.pharmacyCity}`;
                const isStarred = isSaved(pharmacy);
                return (
                  <TouchableOpacity
                    key={key}
                    onPress={() => setSelectedPharmacy(pharmacy)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.resultRow}>
                      <TouchableOpacity
                        onPress={() => toggleStar(pharmacy)}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      >
                        <MaterialCommunityIcons
                          name={isStarred ? 'star' : 'star-outline'}
                          size={24}
                          color="#004E60"
                        />
                      </TouchableOpacity>
                      <View style={styles.resultText}>
                        <Text style={styles.resultTitle} numberOfLines={1}>
                          {pharmacy.pharmacyName}
                        </Text>
                        <Text style={styles.resultSubtitle} numberOfLines={2}>
                          {pharmacy.pharmacyStreet1}, {pharmacy.pharmacyCity}
                        </Text>
                      </View>
                      <View style={styles.resultRight}>
                        <Text style={styles.resultMiles}>
                          {Number(pharmacy.distance).toFixed(1)}mi
                        </Text>
                        <MaterialCommunityIcons name="chevron-right" size={24} color="#41484D" />
                      </View>
                    </View>
                    <Divider style={styles.divider} />
                  </TouchableOpacity>
                );
              })
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
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  resultText: {
    flex: 1,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 24,
    color: '#181C20',
  },
  resultSubtitle: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
    color: '#41484D',
  },
  resultRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resultMiles: {
    fontSize: 13,
    fontWeight: '500',
    color: '#41484D',
    fontFamily: 'Roboto',
  },
  divider: {
    marginHorizontal: 16,
    backgroundColor: '#C1C7CE',
  },
});
