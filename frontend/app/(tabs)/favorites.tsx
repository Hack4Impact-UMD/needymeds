import { useEffect, useState } from 'react';
import { Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Card, Divider, Icon } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors } from '@/constants/theme';
import BottomNavBar from '../components/BottomNavBar';
import DefaultHeader from '../components/DefaultHeader';
import MedicationCard from '../components/favorite-page/MedicationCard';
import PharmacyCard from '../components/favorite-page/PharmacyCard';

import { SavedMedication } from '@/api/types';
import { getAllMedications, deleteMedication } from '@/api/savedMedicationsCRUD';

import { useSavedMedications } from '@/hooks/use-saved-medications';
// import { useSavedPharmacies } from '@/hooks/use-saved-pharmacies';

const FavoritesScreen = () => {
  // initialize the database
  // load saved medications and pharmacies
  const { medications, loading: medsLoading, deleteMedication } = useSavedMedications();
  const {
    medications: pharmacies,
    loading: pharmsLoading,
    deleteMedication: deletePharmacy,
  } = useSavedMedications();

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
        {/* display favorite pharmacy cards or none */}
        {pharmsLoading ? null : pharmacies.length > 0 ? (
          pharmacies.map((p) => <PharmacyCard key={p.id} pharmacy={p} onUnsave={deletePharmacy} />)
        ) : (
          <View
            style={{
              justifyContent: 'center',
              alignContent: 'center',
              alignItems: 'center',
              marginVertical: 30,
            }}
          >
            <Icon source="store-plus-outline" color="#41484D" size={56} />
            <Text style={{ margin: 5, fontSize: 14, color: '#181C20' }}>
              No Favorite Pharmacy Yet!
            </Text>
            <Text style={{ margin: 2, fontSize: 12, color: '#41484D' }}>
              Click Pharmacies to save one.
            </Text>
          </View>
        )}

        <Divider style={{ marginTop: 16 }} />

        {/* favorite medications */}
        <Text style={styles.headers}>Favorite Medications</Text>
        {/* display medication cards */}
        {medsLoading ? null : medications.length > 0 ? (
          medications.map((med) => (
            <MedicationCard key={med.id} medication={med} onUnsave={deleteMedication} />
          ))
        ) : (
          <View
            style={{
              justifyContent: 'center',
              alignContent: 'center',
              alignItems: 'center',
              marginVertical: 50,
            }}
          >
            <Icon source="ticket-confirmation-outline" color="#41484D" size={56} />
            <Text style={{ margin: 5, fontSize: 14, color: '#181C20' }}>
              No Favorite Medications Yet!
            </Text>
            <Text style={{ margin: 2, fontSize: 12, color: '#41484D' }}>
              Click Drug Prices to find medications.
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
  pharmacy_cards: {
    marginVertical: 8,
    width: '100%',
    fontFamily: 'Open Sans',
    backgroundColor: '#C7E7FF',
    borderColor: '#C1C7CE',
  },
  med_cards: {
    marginVertical: 8,
    width: '100%',
    fontFamily: 'Open Sans',
    backgroundColor: 'transparent',
    borderColor: '#C1C7CE',
  },
  pharmacy_card_title: {
    minHeight: 60,
    paddingRight: 16,
  },
  med_card_title: {
    minHeight: 36,
    paddingRight: 16,
  },
});

export default FavoritesScreen;
