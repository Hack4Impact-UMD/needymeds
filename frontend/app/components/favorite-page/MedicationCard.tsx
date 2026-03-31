import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Card, Icon } from 'react-native-paper';

import { SavedMedication } from '@/api/types';

interface FavoritedMedication {
  medication: SavedMedication;
  onUnsave: (id: number) => void;
}

const MedicationCard = ({ medication, onUnsave }: FavoritedMedication) => {
  return (
    <Card key={medication.id} mode="outlined" style={styles.med_cards}>
      <Card.Content>
        <Text style={{ fontSize: 14, color: '#41484D' }}>$xx.xx</Text>
        <View style={styles.header}>
          <Text style={{ fontSize: 16, color: '#181C20' }}>{medication.drug_name}</Text>
          <Icon source="star" color="#004E60" size={24} />
          <TouchableOpacity onPress={() => medication.id && onUnsave(medication.id)}>
            <Icon source="star" color="#004E60" size={24} />
          </TouchableOpacity>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={{ textDecorationLine: 'underline', color: '#41484D', marginRight: 3 }}>
            {[medication.form, medication.strength].filter(Boolean).join(' ')}
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
});
