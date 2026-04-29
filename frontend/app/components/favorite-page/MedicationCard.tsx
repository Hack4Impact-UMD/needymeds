import {
  getStrengthsForForm,
  initializeDrugSearch,
  resetDrugSearch,
  searchDrugByPrice,
  setActiveStrength,
} from '@/api/drugSearch';
import { SavedMedication } from '@/api/types';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Card, Icon } from 'react-native-paper';

interface FavoritedMedication {
  med: SavedMedication;
  onUnsave: (id: number) => void;
}

// extract the 5-digit (or also 4-digit) zipcode out of the saved pharmacy address
const ZIP_RE = /\b(\d{5})(?:-?\d{4})?\b/;

const MedicationCard = ({ med, onUnsave }: FavoritedMedication) => {
  // derive current price on mount
  const [price, setPrice] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false; // prevent state updates if the component is unmounted

    const fetchPrice = async () => {
      // return if the saved medication is missing fields we need for re-lookup
      const { pharmacy_address, form, strength, quantity, drug_name } = med;
      if (!pharmacy_address || !form || !strength || !quantity) {
        if (!cancelled) setPrice(null);
        return;
      }

      // extract zipcode
      const zipcode = pharmacy_address.match(ZIP_RE)?.[1];
      if (!zipcode) {
        if (!cancelled) setPrice(null);
        return;
      }

      // lookup the medication again to retrieve the dynamic price
      try {
        // prepare for a drug search re-lookup
        resetDrugSearch();
        await initializeDrugSearch(drug_name);
        await getStrengthsForForm(drug_name, form);
        setActiveStrength(drug_name, form, strength, quantity, true);

        // search with radius = 5
        const results = await searchDrugByPrice(drug_name, form, 5, true, zipcode);
        // find the entry where the pharmacy name matches the saved medication’s pharmacy name
        const match = results.find((r) => r.pharmacyName === med.pharmacy_name);
        if (!cancelled) setPrice(match?.price ?? null);
      } catch {
        if (!cancelled) setPrice(null);
      }
    };

    fetchPrice();

    // after the component has mounted
    return () => {
      cancelled = true;
    };
  }, [med, med.drug_name, med.form, med.strength, med.quantity, med.pharmacy_address]);

  return (
    <Card key={med.id} mode="outlined" style={styles.med_cards}>
      <Card.Content>
        <Text style={{ fontSize: 14, color: '#41484D' }}>
          {price ? `$${price}` : 'Fetching price...'} • {med.pharmacy_address}
        </Text>
        <View style={styles.header}>
          <View style={styles.name_container}>
            <Text style={styles.med_name}>{med.drug_name}</Text>
          </View>
          <TouchableOpacity onPress={() => med.id && onUnsave(med.id)} style={styles.star_icon}>
            <Icon source="star" color="#004E60" size={24} />
          </TouchableOpacity>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={{ textDecorationLine: 'underline', color: '#41484D', marginRight: 3 }}>
            {[med.form, med.strength].filter(Boolean).join(' ')}
          </Text>
          <Icon source="medication" color="#004E60" size={20} />
        </View>
      </Card.Content>
    </Card>
  );
};

export default MedicationCard;

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 5,
  },
  med_cards: {
    marginVertical: 8,
    width: '100%',
    fontFamily: 'Open Sans',
    backgroundColor: 'transparent',
    borderColor: '#C1C7CE',
  },
  med_name: {
    fontSize: 16,
    color: '#181C20',
  },
  name_container: {
    width: '80%',
  },
  star_icon: {
    marginHorizontal: 8,
  },
});
