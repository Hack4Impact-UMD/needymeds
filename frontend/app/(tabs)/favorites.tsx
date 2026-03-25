import { Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Card, Divider, Icon } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors } from '@/constants/theme';
import BottomNavBar from '../components/BottomNavBar';
import DefaultHeader from '../components/DefaultHeader';

const FavoritesScreen = () => {
  // pharmacy card info
  const pharmacyName = 'Pharmacy Name';
  const pharmacyAddress = '1234 Pharmacy Address';
  const pharmacyPhoneNumber = '123 456 7890';

  // medication cards info
  const medPrice = '$xx.xx';
  const medName = 'Medication name';
  const medDesc = '2% 1 tube descrption';

  // favoriting
  // handleFavorite function
  // isFavorite ? 'star' : 'star-outline'

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
        {/* favorite pharmacy card */}
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
              <Text style={{ fontSize: 18 }}>{pharmacyName}</Text>
              <Icon source="star" color="#004E60" size={24} />
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 5 }}>
              <Icon source="map-marker" color="#004E60" size={24} />
              <Text style={{ marginLeft: 5, fontSize: 12, color: '#181C20' }}>
                {pharmacyAddress}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 5 }}>
              <Icon source="phone-outline" color="#004E60" size={24} />
              <Text style={{ marginLeft: 5, fontSize: 12, color: '#181C20' }}>
                {pharmacyPhoneNumber}
              </Text>
            </View>
          </Card.Content>
        </Card>

        <View style={{ justifyContent: 'center', alignContent: 'center', alignItems: 'center' }}>
          <Icon source="store-plus-outline" color="#41484D" size={56} />
          <Text style={{ margin: 5, fontSize: 14, color: '#181C20' }}>
            No Favorite Pharmacy Yet!
          </Text>
          <Text style={{ margin: 2, fontSize: 12, color: '#41484D' }}>
            Click Pharmacies to save one.
          </Text>
        </View>

        <Divider style={{ marginTop: 16 }} />

        {/* favorite medications */}
        <Text style={styles.headers}>Favorite Medications</Text>
        {/* medication cards */}
        <Card mode="outlined" style={styles.med_cards}>
          <Card.Content>
            <Text style={{ fontSize: 14, color: '#41484D' }}>{medPrice}</Text>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginVertical: 5,
              }}
            >
              <Text style={{ fontSize: 16, color: '#181C20' }}>{medName}</Text>
              <Icon source="star" color="#004E60" size={24} />
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ textDecorationLine: 'underline', color: '#41484D' }}>{medDesc}</Text>
              <Icon source="medication" color="#004E60" size={20} />
            </View>
          </Card.Content>
        </Card>
        <Card mode="outlined" style={styles.med_cards}>
          <Card.Content>
            <Text style={{ fontSize: 14, color: '#41484D' }}>{medPrice}</Text>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginVertical: 5,
              }}
            >
              <Text style={{ fontSize: 16, color: '#181C20' }}>{medName}</Text>
              <Icon source="star" color="#004E60" size={24} />
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ textDecorationLine: 'underline', color: '#41484D' }}>{medDesc}</Text>
              <Icon source="medication" color="#004E60" size={20} />
            </View>
          </Card.Content>
        </Card>

        <View style={{ justifyContent: 'center', alignContent: 'center', alignItems: 'center' }}>
          <Icon source="ticket-confirmation-outline" color="#41484D" size={56} />
          <Text style={{ margin: 5, fontSize: 14, color: '#181C20' }}>
            No Favorite Medications Yet!
          </Text>
          <Text style={{ margin: 2, fontSize: 12, color: '#41484D' }}>
            Click Drug Prices to find medications.
          </Text>
        </View>
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
