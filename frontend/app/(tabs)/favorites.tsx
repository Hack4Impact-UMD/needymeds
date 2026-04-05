import { useEffect } from 'react';
import { useNavigation } from 'expo-router';
import { Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Divider, Icon } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors } from '@/constants/theme';
import BottomNavBar from '../components/BottomNavBar';
import DefaultHeader from '../components/DefaultHeader';
import MedicationCard from '../components/favorite-page/MedicationCard';
import PharmacyCard from '../components/favorite-page/PharmacyCard';

import { useSavedMedications } from '@/hooks/use-saved-medications';
import { useSavedPharmacies } from '@/hooks/use-saved-pharmacies';

const FavoritesScreen = () => {
  const navigation = useNavigation();
  const { pharmacies: savedPharmacies, deletePharmacy, refreshPharmacies } = useSavedPharmacies();
  const {
    medications: savedMedications,
    deleteMedication,
    refreshMedications,
  } = useSavedMedications();

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      refreshPharmacies();
      refreshMedications();
    });
    return unsubscribe;
  }, [navigation, refreshPharmacies, refreshMedications]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* HEADER */}
        <DefaultHeader />

        {/* TITLE */}
        <Text style={styles.title}>Your Favorites</Text>
        <Divider />

        {/* favorite pharmacy */}
        <Text style={styles.headers}>Favorite Pharmacy</Text>
        {savedPharmacies.length > 0 ? (
          savedPharmacies.map((pharmacy) => (
            <PharmacyCard key={pharmacy.npi} pharmacy={pharmacy} onUnsave={deletePharmacy} />
          ))
        ) : (
          <View
            style={{
              justifyContent: 'center',
              alignContent: 'center',
              alignItems: 'center',
              marginVertical: 20,
            }}
          >
            <Icon source="store-plus-outline" color="#41484D" size={56} />
            <Text style={{ margin: 5, fontSize: 14, color: '#181C20' }}>
              No Favorite Pharmacy Yet!
            </Text>
            <Text style={{ margin: 2, fontSize: 12, color: '#41484D' }}>
              {`Click 'Pharmacies' to save one.`}
            </Text>
          </View>
        )}

        <Divider style={{ marginTop: 16 }} />

        {/* favorite medications */}
        <Text style={styles.headers}>Favorite Medications</Text>
        {savedMedications.length > 0 ? (
          savedMedications.map((med) => (
            <MedicationCard key={med.id} medication={med} onUnsave={deleteMedication} />
          ))
        ) : (
          <View
            style={{
              justifyContent: 'center',
              alignContent: 'center',
              alignItems: 'center',
              marginVertical: 80,
            }}
          >
            <Icon source="ticket-confirmation-outline" color="#41484D" size={56} />
            <Text style={{ margin: 5, fontSize: 14, color: '#181C20' }}>
              No Favorite Medications Yet!
            </Text>
            <Text style={{ margin: 2, fontSize: 12, color: '#41484D' }}>
              {`Click 'Drug Prices' to find medications.`}
            </Text>
          </View>
        )}
      </ScrollView>
      <BottomNavBar />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.default.neutrallt,
  },
  container: {
    paddingTop: 20,
    paddingRight: 20,
    paddingBottom: Platform.OS === 'ios' ? 84 : 68, // bottom navbar height
    paddingLeft: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: '400',
    color: '#181C20',
    fontFamily: 'Nunito Sans',
  },
  headers: {
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: 'Open Sans',
    color: '#181C20',
  },
  findPharmacyButton: {
    borderRadius: 100,
    marginTop: 16,
    width: '100%',
  },
  findPharmacyButtonContent: {
    height: 48,
  },
  findPharmacyButtonLabel: {
    fontSize: 16,
    fontFamily: 'Open Sans',
    fontWeight: '400',
  },
});

export default FavoritesScreen;
