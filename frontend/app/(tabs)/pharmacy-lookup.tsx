import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Platform, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text, TextInput } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { searchPharmacies } from '../../api/pharmacySearch';
import { Pharmacy } from '../../api/types';
import BottomNavBar from '../components/BottomNavBar';
import Header from '../components/Header';
import MedicationLookupBackgroundShape from '../components/medication-lookup/MedicationLookupBackgroundShape';
import SearchResult from '../components/SearchResult';

const PharmacyLocatorScreen = () => {
  const params = useLocalSearchParams();
  const zipParam = Array.isArray(params.zipCode) ? params.zipCode[0] : (params.zipCode ?? '');
  const radiusParam = Array.isArray(params.radius) ? params.radius[0] : (params.radius ?? '5');

  const [zipCode, setZipCode] = useState(zipParam);
  const [radius, setRadius] = useState(radiusParam);
  const [isSearchEnabled, setIsSearchEnabled] = useState(false);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [showZipDropdown, setShowZipDropdown] = useState(false);
  const [isZipFocused, setIsZipFocused] = useState(false);
  const [filterText, setFilterText] = useState('');

  // change this WHEN TESTING FOR ACTUAL RESULTS ON SEARCH PAGE
  const [emptyResults, setEmptyResults] = useState(true);
  // ^^^^^

  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [loading, setLoading] = useState(false);

  // Validate inputs and enable/disable search button
  useEffect(() => {
    const isZipValid = zipCode.length === 5 && /^\d{5}$/.test(zipCode);
    const isRadiusValid = radius.length > 0 && parseFloat(radius) > 0;
    setIsSearchEnabled(isZipValid && isRadiusValid);

    const fetchPharmacies = async () => {
      if (!isZipValid || !isRadiusValid) {
        setPharmacies([]);
        setEmptyResults(true);
        return;
      }

      setLoading(true);
      try {
        const results = await searchPharmacies(Number(zipCode), Number(radius));
        setPharmacies(results);
        setEmptyResults(results.length === 0);
        console.log('Search results:', results);
      } catch (error) {
        console.error('Error fetching pharmacies: ', error);
        setPharmacies([]);
        setEmptyResults(true);
      } finally {
        setLoading(false);
      }
    };

    fetchPharmacies();
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
    const numericText = text.replace(/[^0-9]/g, '');
    if (numericText.length <= 5) {
      setZipCode(numericText);
    }
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

  // Clear ZIP code
  const handleClearZip = () => {
    setZipCode('');
    // Keep dropdown visible since field is still focused
  };

  // Detect user location and convert to ZIP code
  const handleDetectLocation = async () => {
    setIsDetectingLocation(true);
    console.log('Starting location detection...');

    try {
      // Use the existing getUserLocation function from your API
      const { default: getUserLocation } = await import('../../api/userLocation');
      const result = await getUserLocation();

      console.log('Location result:', result);

      if (result.userZipCode) {
        // Extract 5-digit ZIP if it exists
        const zipMatch = result.userZipCode.match(/\d{5}/);
        console.log('ZIP match result:', zipMatch);

        if (zipMatch) {
          const detectedZip = zipMatch[0];
          console.log('Setting ZIP code to:', detectedZip);
          setZipCode(detectedZip);
          console.log('ZIP code set successfully');

          Alert.alert('Location Detected', `ZIP code ${detectedZip} detected successfully!`, [
            { text: 'OK' },
          ]);
        } else {
          console.log('No 5-digit ZIP found in postal code');
          Alert.alert(
            'Location Detected',
            'Could not determine ZIP code from your location. Please enter it manually.',
            [{ text: 'OK' }]
          );
        }
      } else {
        console.log('No postal code in result');
        Alert.alert(
          'Location Detected',
          'Could not determine ZIP code from your location. Please enter it manually.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error detecting location:', error);

      // Provide more specific error messages
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
        <MedicationLookupBackgroundShape top={450} maxHeight={700} color="#C7E7FF" />

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

          {/* put a placeholder for the route to the Pharmacy Detail page / component */}
          {/* also picked a random attribute for pharmacy ID */}
          <ScrollView contentContainerStyle={{ flexGrow: 0, paddingTop: 0 }}>
            {loading ? (
              <Text style={{ textAlign: 'center', marginTop: 20 }}>Searching...</Text>
            ) : emptyResults ? (
              <View style={styles.emptyContainer}>
                <MaterialIcons name="add-business" size={41} color="#41484D" />
                <Text style={styles.emptyMessage}>
                  {' '}
                  We are sorry there are no matching pharmacies in our network yet. Try checking
                  other ZIP Codes or increasing search radius.
                </Text>
              </View>
            ) : (
              pharmacies
                .filter((pharmacy) => {
                  // Filter by name if filterText is provided
                  if (!filterText) return true;
                  return pharmacy.pharmacyName.toLowerCase().includes(filterText.toLowerCase());
                })
                .map((pharmacy, index) => (
                  <SearchResult
                    key={pharmacy.phoneNumber || index}
                    name={pharmacy.pharmacyName}
                    address={`${pharmacy.pharmacyStreet1}, ${pharmacy.pharmacyCity}`}
                    distance={pharmacy.distance ? `${pharmacy.distance.toFixed(1)} mi` : ''}
                    // onPress={() => router.push({
                    //   pathname: '/pharmacy-detail',
                    //   params: {
                    //     pharmacyId: pharmacy.phoneNumber || index,
                    //     pharmacyName: pharmacy.pharmacyName,
                    //     address: pharmacy.pharmacyStreet1,
                    //     city: pharmacy.pharmacyCity,
                    //     state: pharmacy.pharmacyState,
                    //     zip: pharmacy.pharmacyZipCode,
                    //     phone: pharmacy.phoneNumber || '',
                    //     distance: pharmacy.distance || 0,
                    //   }
                    // })}
                    onPress={() => console.log(`Pressed pharmacy: ${pharmacy.pharmacyName}`)}
                  />
                ))
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
