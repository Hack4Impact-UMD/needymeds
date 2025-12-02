import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  Alert,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { Button, Text, TextInput } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors } from '@/constants/theme';
import getUserLocation from '../../api/userLocation';
import BottomNavBar from '../components/BottomNavBar';
import DefaultHeader from '../components/DefaultHeader';
import MedicationLookupBackgroundShape from '../components/medication-lookup/MedicationLookupBackgroundShape';

const ZIPCODE_LENGTH = 5;

const PharmacyLocatorScreen = () => {
  const { t } = useTranslation();

  const params = useLocalSearchParams();
  const zipParam = Array.isArray(params.zipCode) ? params.zipCode[0] : (params.zipCode ?? '');
  const radiusParam = Array.isArray(params.radius) ? params.radius[0] : (params.radius ?? '5');

  useEffect(() => {
    if (zipParam) setZipCode(zipParam);
    if (radiusParam) setRadius(radiusParam);
  }, [zipParam, radiusParam]);

  const [zipCode, setZipCode] = useState(zipParam);
  const [radius, setRadius] = useState(radiusParam);
  const [isSearchEnabled, setIsSearchEnabled] = useState(false);
  const [zipFocused, setZipFocused] = useState(false);
  const [detectingZip, setDetectingZip] = useState(false);

  // Validate inputs and enable/disable search button
  useEffect(() => {
    const isZipValid = zipCode.length === 5 && /^\d{5}$/.test(zipCode);
    const isRadiusValid = radius.length > 0 && parseFloat(radius) > 0;
    setIsSearchEnabled(isZipValid && isRadiusValid);
  }, [zipCode, radius]);

  // Handle ZIP code input - restrict to 5 digits only
  const handleZipChange = (text: string) => {
    // Only allow digits and max 5 characters
    const numericText = text.replace(/[^0-9]/g, '');
    if (numericText.length <= 5) {
      setZipCode(numericText);
    }
  };

  // Handle radius input - only positive numbers
  const handleRadiusChange = (text: string) => {
    // Allow empty string or valid positive numbers (including decimals)
    if (text === '' || /^\d*\.?\d*$/.test(text)) {
      setRadius(text);
    }
  };

  const handleClearZip = () => {
    setZipCode('');
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

  // Handle search submission
  const handleSearch = () => {
    if (isSearchEnabled) {
      router.push({
        pathname: '/pharmacy-lookup-search',
        params: {
          zipCode,
          radius,
        },
      });
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <DefaultHeader />
        <MedicationLookupBackgroundShape top={580} maxHeight={700} color="#C7E7FF" />

        {/* Title Section */}
        <View style={styles.titleSection}>
          <Text style={styles.subtitle}>{t('HeroOverline')}</Text>
          <Text style={styles.title}>{t('HeroHeader')}</Text>
        </View>

        {/* Input Fields */}
        <View style={styles.inputsContainer}>
          <View style={styles.inputRow}>
            {/* ZIP Code Input */}
            <View style={styles.inputWrapper}>
              <TextInput
                label={t('ZipInputLabel')}
                value={zipCode}
                onChangeText={handleZipChange}
                onFocus={() => setZipFocused(true)}
                onBlur={() => setZipFocused(false)}
                placeholder=""
                mode="outlined"
                keyboardType="numeric"
                maxLength={5}
                style={styles.textInput}
                outlineStyle={styles.inputOutline}
                activeOutlineColor="#236488"
                textColor="#41484D"
                left={<TextInput.Icon icon="map-marker" />}
                right={
                  zipCode.length > 0 ? (
                    <TextInput.Icon icon="close" onPress={handleClearZip} />
                  ) : undefined
                }
              />

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
                    {detectingZip ? 'Detecting...' : 'Detect my location'}
                  </Text>
                </TouchableOpacity>
              )}
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
                textColor="#41484D"
                activeOutlineColor="#236488"
                right={
                  <TextInput.Affix text={t('RadiusInputSuffix')} textStyle={{ color: '#41484D' }} />
                }
              />
            </View>
          </View>

          {/* Search Button */}
          <Button
            mode="contained"
            onPress={handleSearch}
            disabled={!isSearchEnabled}
            buttonColor="#226488"
            style={styles.searchButton}
            contentStyle={styles.searchButtonContent}
            labelStyle={styles.searchButtonLabel}
            icon="magnify"
          >
            {t('SearchBtnLabel')}
          </Button>
        </View>
      </View>
      <BottomNavBar />
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
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 84 : 68,
  },
  titleSection: {
    marginBottom: 32,
    marginTop: 40,
  },
  subtitle: {
    fontSize: 14,
    color: '#1F1F1F',
    marginBottom: 8,
    fontFamily: 'Open Sans',
  },
  title: {
    fontSize: 24,
    color: '#1F1F1F',
    lineHeight: 32,
    fontFamily: 'Nunito',
  },
  inputsContainer: {
    gap: 60,
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
    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.30), 0 2px 6px 2px rgba(0, 0, 0, 0.15)',
  },
  detectLocationText: {
    color: '#181C20',
    fontSize: 16,
    marginLeft: 6,
    fontFamily: 'Open Sans',
  },
  searchButton: {
    borderRadius: 100,
  },
  searchButtonContent: {
    height: 48,
  },
  searchButtonLabel: {
    fontSize: 16,
    fontFamily: 'Open Sans',
    fontWeight: '400',
  },
});
