import { useState } from 'react';

import { router } from 'expo-router';

import { Image, StyleSheet, Text, View } from 'react-native';
import { Card, Icon } from 'react-native-paper';
import { Dropdown } from 'react-native-element-dropdown';
import { SafeAreaView } from 'react-native-safe-area-context';

import BottomNavBar from '../components/BottomNavBar';
const logo = require('../assets/horizontal_logo.png');

const SavingsScreen = () => {
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
          Prescription Savings Tips
        </Text>

        {/* description + left icon */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 20 }}>
          <Icon source="medical-cotton-swab" color="#41484D" size={30} />
          <Text
            style={{
              fontSize: 14,
              color: '#181C20',
              margin: 10,
            }}
          >
            Saving money on prescription is possible! Try these steps to make sure you're getting
            the best price for you're medications:
          </Text>
        </View>

        {/* make into card components */}
        <Text>collapsible cards</Text>
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

export default SavingsScreen;
