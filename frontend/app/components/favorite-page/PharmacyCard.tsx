import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Card, Icon } from 'react-native-paper';

import { SavedPharmacy } from '@/api/types';

interface FavoritedPharmacy {
  pharmacy: SavedPharmacy;
  onUnsave: (id: string) => void;
}

const PharmacyCard = ({ pharmacy, onUnsave }: FavoritedPharmacy) => {
  return (
    <Card key={pharmacy.npi} mode="outlined" style={styles.pharmacy_cards}>
      <Card.Content>
        <View style={styles.header}>
          <Text style={{ fontSize: 18, flex: 1 }} numberOfLines={2}>
            {pharmacy.name}
          </Text>
          <TouchableOpacity onPress={() => pharmacy.npi && onUnsave(pharmacy.npi)}>
            <Icon source="star" color="#004E60" size={24} />
          </TouchableOpacity>
        </View>
        <View style={styles.infoRow}>
          <Icon source="map-marker" color="#004E60" size={24} />
          <Text style={styles.info}>{pharmacy.address}</Text>
        </View>
        <View style={styles.infoRow}>
          <Icon source="phone-outline" color="#004E60" size={24} />
          <Text style={styles.info}>{pharmacy.phoneNumber}</Text>
        </View>
      </Card.Content>
    </Card>
  );
};

export default PharmacyCard;

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 5,
  },
  info: {
    marginLeft: 5,
    fontSize: 12,
    color: '#181C20',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
  },
  pharmacy_cards: {
    marginVertical: 8,
    width: '100%',
    fontFamily: 'Open Sans',
    backgroundColor: '#C7E7FF',
    borderColor: '#C1C7CE',
  },
});
