import { useState } from 'react';

import { router } from 'expo-router';

import { Image, StyleSheet, Text, View } from 'react-native';
import { Card, Icon } from 'react-native-paper';
import { Dropdown } from 'react-native-element-dropdown';
import { SafeAreaView } from 'react-native-safe-area-context';

import BottomNavBar from '../components/BottomNavBar';
const logo = require('../assets/horizontal_logo.png');

const EducationScreen = () => {
  // language dropdown
  const langOptions = [
    { label: 'EN', value: 'EN' },
    { label: 'SP', value: 'SP' },
  ];
  const [lang, setLang] = useState('EN');

  const handleLang = (e: any) => {
    setLang(e.value);
    console.log(lang);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* HEADER */}
        <View style={styles.header}>
          <Image source={logo} style={styles.logo} resizeMode="contain" />
          <Dropdown
            placeholder="EN"
            value={lang}
            labelField="label"
            valueField="value"
            data={langOptions}
            onChange={handleLang}
            style={styles.drop}
            dropdownPosition="bottom"
            placeholderStyle={{ color: '#41484D', fontWeight: 500 }}
            itemTextStyle={{ color: '#41484D' }}
            itemContainerStyle={{}}
            searchPlaceholderTextColor="#41484D"
          />
        </View>

        {/* TITLE */}
        <Text
          style={{
            textAlign: 'center',
            fontSize: 32,
            fontWeight: 500,
            color: '#181C20',
            margin: 10,
            marginLeft: 20,
            marginRight: 20,
          }}
        >
          Educational Resources
        </Text>

        {/* description + left icon */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 20 }}>
          <Icon source="book-open-page-variant-outline" size={30} />
          <Text
            style={{
              fontSize: 14,
              color: '#181C20',
              margin: 10,
            }}
          >
            Learn more about frequently asked questions, prescription savings tips, and more
            information.
          </Text>
        </View>

        {/* make into card components */}

        {/* saving tips card, add  left={LeftContent} */}
        <Card style={styles.cards} onPress={() => router.push("/(tabs)/tips")}>
          <Card.Title
            title="Prescription Saving Tips"
            subtitle="Click here to learn more!"
            left={(props) => <Icon source="piggy-bank-outline" size={30} />}
          />
        </Card>
        <View style={{ marginTop: 25, marginBottom: 25 }}>
            {/* FAQ cards */}
          <Card style={styles.cards}>
            <Card.Title
              title="Frequently Asked Questions"
              subtitle="Find answers quickly:"
              left={(props) => <Icon source="help-circle-outline" size={30} />}
            />
          </Card>
          <Card style={styles.cards}>
            <Card.Title
              title="General FAQ"
              subtitle="Click arrow to learn more!"
              left={(props) => <Icon source="forum-outline" size={30} />}
              right={(props) => <Icon source="menu-right" size={25} />}
            />
          </Card>
          <Card style={styles.cards}>
            <Card.Title
              title="Manufacturer Coupon FAQ"
              subtitle="Click arrow to learn more!"
              left={(props) => <Icon source="currency-usd-off" size={30} />}
              right={(props) => <Icon source="menu-right" size={25} />}
            />
          </Card>
        </View>

        {/* NeedyMeds website card */}
        {/* notes: make workable link */}
        {/* use other logo here */}
        <Card style={styles.cards}>
          <Card.Title
            title="Visit the NeedyMeds' website for more information"
            subtitle="https://needymeds.org/"
            left={(props) => <Image source={logo} style={{ width: 50 }} resizeMode="contain" />}
          />
        </Card>
      </View>
      <BottomNavBar />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F6FAFE',
  },
  container: {
    flex: 1,
    paddingHorizontal: 32,
    paddingTop: 24,
    paddingBottom: 32,
    alignItems: 'center',
    alignContent: 'space-between',
    justifyContent: 'flex-start',
  },

  header: {
    width: 340,
    height: 85,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  logo: {
    width: 80,
  },
  drop: {
    width: 60,
    height: 30,
    alignSelf: 'center',

    borderColor: '#C1C7CE',
    borderWidth: 1,
    padding: 5,
    paddingLeft: 10,
    borderRadius: 8,
  },

  cards: {
    height: 80,
    width: 300,
    backgroundColor: '#F1F4F9',
  },
});

export default EducationScreen;
