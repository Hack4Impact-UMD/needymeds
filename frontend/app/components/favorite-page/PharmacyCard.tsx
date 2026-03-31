import { StyleSheet, Text, View } from 'react-native';
import { Card, Icon } from 'react-native-paper';

import { SavedMedication } from '../../../api/types';
// import { SavedPharmacy } from '../../../api/types';

interface FavoritedPharmacy {
  pharmacy: SavedMedication;
  onUnsave: (id: number) => void;
}

const PharmacyCard = ({ pharmacy, onUnsave }: FavoritedPharmacy) => {
  return (
    <Card mode="outlined" style={styles.pharmacy_cards}>
      <Card.Content>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginVertical: 5,
          }}
        >
          <Text style={{ fontSize: 18 }}>{pharmacy.drug_name}</Text>
          <Icon source="star" color="#004E60" size={24} />
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 5 }}>
          <Icon source="map-marker" color="#004E60" size={24} />
          <Text style={{ marginLeft: 5, fontSize: 12, color: '#181C20' }}>
            {pharmacy.last_saved_date}
          </Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 5 }}>
          <Icon source="phone-outline" color="#004E60" size={24} />
          <Text style={{ marginLeft: 5, fontSize: 12, color: '#181C20' }}>{pharmacy.form}</Text>
        </View>
      </Card.Content>
    </Card>
  );
};

export default PharmacyCard;

const styles = StyleSheet.create({
  pharmacy_cards: {
    marginVertical: 8,
    width: '100%',
    fontFamily: 'Open Sans',
    backgroundColor: '#C7E7FF',
    borderColor: '#C1C7CE',
  },
  pharmacy_card_title: {
    minHeight: 60,
    paddingRight: 16,
  },
});
