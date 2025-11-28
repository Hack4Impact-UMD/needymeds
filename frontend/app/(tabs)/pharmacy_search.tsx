import { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Platform, Alert, TouchableOpacity } from 'react-native';
import { Text, TextInput, Button } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import * as Location from 'expo-location';
import HomeBackgroundShape from '../components/HomeBackgroundShape';
import BottomNavBar from '../components/BottomNavBar';
import Header from '../components/Header';
import { Ionicons } from '@expo/vector-icons';
import { MaterialIcons } from '@expo/vector-icons';

const PharmacyLocatorScreen = () => {
  const params = useLocalSearchParams();
  const zipParam = Array.isArray(params.zipCode) ? params.zipCode[0] : (params.zipCode ?? '');
  const radiusParam = Array.isArray(params.radius) ? params.radius[0] : (params.radius ?? '5');

  const [zipCode, setZipCode] = useState(zipParam);
  const [radius, setRadius] = useState(radiusParam);
  const [isSearchEnabled, setIsSearchEnabled] = useState(false);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [showZipDropdown, setShowZipDropdown] = useState(false);
  const [filterText, setFilterText] = useState('');
  const [emptyResults, setEmptyResults] = useState(true);

  // Validate inputs and enable/disable search button
  useEffect(() => {
    const isZipValid = zipCode.length === 5 && /^\d{5}$/.test(zipCode);
    const isRadiusValid = radius.length > 0 && parseFloat(radius) > 0;
    setIsSearchEnabled(isZipValid && isRadiusValid);
  }, [zipCode, radius]);

  // Handle ZIP code input - restrict to 5 digits only
  const handleZipChange = (text: string) => {
    const numericText = text.replace(/[^0-9]/g, '');
    if (numericText.length <= 5) {
      setZipCode(numericText);
    }
  };

  const handleZipFocus = () => {
    setShowZipDropdown(true);
  };

  // Hide dropdown shortly after blur so taps still register
  const handleZipBlur = () => {
    setTimeout(() => {
      setShowZipDropdown(false);
    }, 100); // 100ms is enough
  };

  // Handle detect location from dropdown
  const handleDetectFromDropdown = () => {
    setShowZipDropdown(false); // hide immediately after selection
    handleDetectLocation();
  };

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
  };

  // Detect user location and convert to ZIP code
  const handleDetectLocation = async () => {
    setIsDetectingLocation(true);
    console.log('Starting location detection...');

    try {
      // Request location permissions
      const { status } = await Location.requestForegroundPermissionsAsync();
      console.log('Permission status:', status);

      if (status !== 'granted') {
        Alert.alert(
          'Permission Denied',
          'Location permission is required to detect your location. Please enable it in your device settings.',
          [{ text: 'OK' }]
        );
        setIsDetectingLocation(false);
        return;
      }

      // Get current location
      console.log('Getting current position...');
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const { latitude, longitude } = location.coords;
      console.log('Coordinates:', latitude, longitude);

      // Use BigDataCloud reverse geocoding API (free, no key required)
      console.log('Fetching address from coordinates...');
      const response = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
      );

      if (!response.ok) {
        console.log('Geocoding API error:', response.status);
        throw new Error('Geocoding service unavailable');
      }

      const data = await response.json();
      console.log('Geocoding response:', data);

      const postalCode = data.postcode || data.postalCode;
      console.log('Postal code from API:', postalCode);

      if (postalCode) {
        // Extract 5-digit ZIP if it exists
        const zipMatch = postalCode.match(/\d{5}/);
        console.log('ZIP match result:', zipMatch);

        if (zipMatch) {
          const detectedZip = zipMatch[0];
          console.log('Setting ZIP code to:', detectedZip);
          setZipCode(detectedZip);
          console.log('ZIP code set successfully');
          console.log('Current zipCode state should update to:', detectedZip);

          // Force a small delay to ensure state updates
          setTimeout(() => {
            console.log('ZIP code after timeout - checking if updated');
          }, 100);
        } else {
          console.log('No 5-digit ZIP found in postal code');
          Alert.alert(
            'Location Detected',
            'Could not determine ZIP code from your location. Please enter it manually.',
            [{ text: 'OK' }]
          );
        }
      } else {
        console.log('No postal code in response');
        Alert.alert(
          'Location Detected',
          'Could not determine ZIP code from your location. Please enter it manually.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error detecting location:', error);
      Alert.alert(
        'Error',
        'Unable to detect your location. Please check your internet connection and try again.',
        [{ text: 'OK' }]
      );
    } finally {
      console.log('Location detection finished');
      setIsDetectingLocation(false);
    }
  };

  // Handle search submission
  const handleSearch = () => {
    if (isSearchEnabled) {
      // Navigate to results page with parameters
      router.push({
        pathname: '/pharmacy_search',
        params: {
          zipCode,
          radius,
        },
      });
    }
  };

  const goToParamsTyping = () => {
    router.push({
      pathname: '/paramstyping',
    });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Header />
        <HomeBackgroundShape top={450} height={700} color="#C7E7FF" />

        {/* Title Section */}
        <View style={styles.titleSection}>
          <Text style={styles.subtitle}>
            <TouchableOpacity onPress={() => goToParamsTyping()}>
              <Ionicons name="arrow-back" size={16} color="#41484D" />
            </TouchableOpacity>
            Participating Pharmacies
          </Text>
        </View>

        {/* Input Fields */}
        <View style={styles.inputsContainer}>
          <View style={styles.inputRow}>
            {/* ZIP Code Input */}
            <View style={styles.inputWrapper}>
              <TextInput
                label="ZIP Code"
                value={zipCode}
                onChangeText={handleZipChange}
                onFocus={handleZipFocus}
                placeholder=""
                mode="outlined"
                keyboardType="numeric"
                maxLength={5}
                onBlur={handleZipBlur}
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
                      {isDetectingLocation ? 'Detecting...' : 'Detect my location'}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* Radius Input */}
            <View style={styles.inputWrapper}>
              <TextInput
                label="Radius"
                value={radius}
                onChangeText={handleRadiusChange}
                placeholder=""
                mode="outlined"
                keyboardType="decimal-pad"
                style={styles.textInput}
                outlineStyle={styles.inputOutline}
                textColor="#41484D"
                right={<TextInput.Affix text="miles" textStyle={{ color: '#41484D' }} />}
              />
            </View>
          </View>

          {/* Filter Input */}
          <View style={styles.inputWrapper}>
            <TextInput
              label="Filter by name"
              value={filterText}
              onChangeText={setFilterText}
              placeholder=""
              mode="outlined"
              style={styles.textInput}
              outlineStyle={styles.inputOutline}
              textColor="#41484D"
              activeOutlineColor="#246387" // outline color when focused (blue)
              right={
                <TextInput.Icon
                  icon={() => <Ionicons name="close-circle" size={20} color="#41484D" />}
                  onPress={() => setFilterText('')}
                />
              }
            />
          </View>

          <ScrollView contentContainerStyle={{ flexGrow: 0, paddingTop: 0 }}>
            {emptyResults ? (
              <View>
                <View style={styles.emptyContainer}>
                  <MaterialIcons name="add-business" size={41} color="#41484D" />
                  <Text style={styles.emptyMessage}>
                    {' '}
                    We are sorry there are no matching pharmacies in our network yet. Try checking
                    other ZIP Codes or increasing search radius.
                  </Text>
                </View>
              </View>
            ) : (
              <View></View>
            )}
          </ScrollView>
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
    fontWeight: '400',
    color: '#41484D',
    lineHeight: 32,
  },
  inputsContainer: {
    gap: 20,
    flex: 1,
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
    top: 56,
    left: 0,
    right: 0,
    backgroundColor: '#EBEEF3',
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
