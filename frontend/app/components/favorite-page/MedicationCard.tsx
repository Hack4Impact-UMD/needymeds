import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Card, Icon } from 'react-native-paper';

import { SavedMedication } from '@/api/types';

interface FavoritedMedication {
  med: SavedMedication;
  onUnsave: (id: number) => void;
}

const MedicationCard = ({ med, onUnsave }: FavoritedMedication) => {
  const pharmacy_address = med.pharmacy_name;

  return (
    <Card key={med.id} mode="outlined" style={styles.med_cards}>
      <Card.Content>
        <Text style={{ fontSize: 14, color: '#41484D' }}>
          ${med.price} • {med.pharmacy_name}
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
