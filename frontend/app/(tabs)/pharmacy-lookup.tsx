import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Platform, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Button, Text, TextInput } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

import BottomNavBar from '../components/BottomNavBar';
import DefaultHeader from '../components/DefaultHeader';
import MedicationLookupBackgroundShape from '../components/medication-lookup/MedicationLookupBackgroundShape';

const PharmacyLocatorScreen = () => {
  const { t } = useTranslation();

  const [zipCode, setZipCode] = useState('');
  const [radius, setRadius] = useState('5');
  const [isSearchEnabled, setIsSearchEnabled] = useState(false);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [showZipDropdown, setShowZipDropdown] = useState(false);
  const [isZipFocused, setIsZipFocused] = useState(false);

  // Validate inputs and enable/disable search button
  useEffect(() => {
    const isZipValid = zipCode.length === 5 && /^\d{5}$/.test(zipCode);
    const isRadiusValid = radius.length > 0 && parseFloat(radius) > 0;
    setIsSearchEnabled(isZipValid && isRadiusValid);
  }, [zipCode, radius]);

  // Show/hide dropdown based on focus state
  useEffect(() => {
    if (isZipFocused) {
      setShowZipDropdown(true);
    } else {
      setShowZipDropdown(false);
    }
  }, [isZipFocused]);

  // Handle ZIP code input - restrict to 5 digits only
  const handleZipChange = (text: string) => {
    // Only allow digits and max 5 characters
    const numericText = text.replace(/[^0-9]/g, '');
    if (numericText.length <= 5) {
      setZipCode(numericText);
    }
    // Dropdown stays visible while typing
  };

  // Show dropdown when ZIP field is focused
  const handleZipFocus = () => {
    setIsZipFocused(true);
  };

  // Hide dropdown when ZIP field loses focus
  const handleZipBlur = () => {
    // Small delay to allow dropdown click to register
    setTimeout(() => {
      setIsZipFocused(false);
    }, 200);
  };

  // Handle detect location from dropdown
  const handleDetectFromDropdown = () => {
    handleDetectLocation();
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

  const handleDetectLocation = async () => {
    setIsDetectingLocation(true);

    try {
      const { default: getUserLocation } = await import('../../api/userLocation');
      const result = await getUserLocation();

      const zipMatch = result.userZipCode.match(/\d{5}/);

      const detectedZip = zipMatch![0];
      setZipCode(detectedZip);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

      if (errorMessage.includes('Permission')) {
        Alert.alert(
          'Permission Denied',
          'Location permission is required to detect your location. Please enable it in your device settings.',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert(
          'Error',
          'Unable to detect your location. Please enter your ZIP code manually.',
          [{ text: 'OK' }]
        );
      }
    } finally {
      setIsDetectingLocation(false);
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
        <MedicationLookupBackgroundShape top={530} maxHeight={700} color="#C7E7FF" />

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
                onFocus={handleZipFocus}
                onBlur={handleZipBlur}
                placeholder=""
                mode="outlined"
                keyboardType="numeric"
                maxLength={5}
                style={styles.textInput}
                outlineStyle={styles.inputOutline}
                textColor="#41484D"
                left={<TextInput.Icon icon="map-marker" />}
                right={
                  zipCode.length > 0 ? (
                    <TextInput.Icon icon="close" onPress={handleClearZip} />
                  ) : undefined
                }
              />

              {/* Dropdown with "Detect my location" option */}
              {showZipDropdown && (
                <View style={styles.dropdownContainer}>
                  <TouchableOpacity
                    style={styles.dropdownItem}
                    onPress={handleDetectFromDropdown}
                    disabled={isDetectingLocation}
                  >
                    <Text style={styles.dropdownText}>
                      {isDetectingLocation ? 'Detecting...' : t('ZipDetectOpt')}
                    </Text>
                  </TouchableOpacity>
                </View>
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
    backgroundColor: '#fff',
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
    color: '#6B7280',
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#41484D',
    lineHeight: 32,
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
    backgroundColor: 'white',
    fontSize: 16,
  },
  inputOutline: {
    borderColor: '#41484D',
    borderWidth: 1,
    borderRadius: 8,
  },
  dropdownContainer: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#C1C7CE',
    zIndex: 1000,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3.84,
  },
  dropdownItem: {
    padding: 14,
  },
  dropdownText: {
    fontSize: 15,
    color: '#41484D',
  },
  searchButton: {
    borderRadius: 8,
  },
  searchButtonContent: {
    height: 48,
  },
  searchButtonLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
});
