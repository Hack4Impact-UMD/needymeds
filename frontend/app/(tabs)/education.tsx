import { useState } from 'react';

import { router } from 'expo-router';

import { Image, Linking, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Card, Divider, Icon, IconButton } from 'react-native-paper';
import { Dropdown } from 'react-native-element-dropdown';
import { SafeAreaView } from 'react-native-safe-area-context';

import BottomNavBar from '../components/BottomNavBar';
const h_logo = require('../assets/horizontal_logo.png');
const v_logo = require('../assets/vertical_logo.png');

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

  const general_faq_url = 'https://needymeds.org/faq';
  const coupon_faq_url = 'https://www.needymeds.org/copay-cards-faqs';
  const nm_url = 'https://needymeds.org/';

  const handleLink = (url: string) => {
    Linking.openURL(url);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* HEADER */}
        <View style={styles.header}>
          <Image source={h_logo} style={{ width: 80 }} resizeMode="contain" />
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
        <Text style={styles.title}>Educational Resources</Text>

        {/* description + left icon */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 20 }}>
          <Icon source="book-open-page-variant-outline" color="#41484D" size={30} />
          <Text style={styles.description}>
            Learn more about frequently asked questions, prescription savings tips, and more
            information.
          </Text>
        </View>

        {/* saving tips card */}
        <Card style={styles.cards}>
          <Card.Title
            title="Prescription Saving Tips"
            subtitle={
              <Text onPress={() => router.push('/(tabs)/tips')}>Click here to learn more!</Text>
            }
            left={() => <Icon source="piggy-bank-outline" color="#41484D" size={40} />}
            style={styles.title_cards}
            titleStyle={{ marginBottom: -2 }}
            subtitleStyle={{ letterSpacing: 0.5 }}
          />
        </Card>

        {/* FAQ cards */}
        <Card style={styles.cards}>
          <Card.Title
            title="Frequently Asked Questions"
            subtitle="Find answers quickly:"
            left={() => <Icon source="help-circle-outline" color="#41484D" size={40} />}
            style={styles.grouped_cards}
            titleStyle={{ marginBottom: -2 }}
            subtitleStyle={{ letterSpacing: 0.5 }}
          />
          <Divider style={{ marginHorizontal: 16 }} />
          <Card.Title
            title="General FAQ"
            subtitle="Click arrow to learn more!"
            left={() => <Icon source="forum-outline" color="#41484D" size={40} />}
            right={() => (
              <IconButton
                icon="menu-right"
                iconColor="#181C20"
                size={25}
                onPress={() => handleLink(general_faq_url)}
              />
            )}
            style={styles.grouped_cards}
            titleStyle={{ marginBottom: -2 }}
            subtitleStyle={{ letterSpacing: 0.5 }}
          />
          <Divider style={{ marginHorizontal: 16 }} />
          <Card.Title
            title="Manufacturer Coupon FAQ"
            subtitle="Click arrow to learn more!"
            left={() => <Icon source="currency-usd-off" color="#41484D" size={40} />}
            right={() => (
              <IconButton
                icon="menu-right"
                iconColor="#181C20"
                size={25}
                onPress={() => handleLink(coupon_faq_url)}
              />
            )}
            style={styles.grouped_cards}
            titleStyle={{ marginBottom: -2 }}
            subtitleStyle={{ letterSpacing: 0.5 }}
          />
        </Card>

        {/* NeedyMeds website card */}
        <Card style={styles.cards} onPress={() => handleLink(nm_url)}>
          <Card.Title
            title="Visit the NeedyMeds' website for more information"
            subtitle="https://needymeds.org/"
            left={() => <Image source={v_logo} style={{ width: 40 }} resizeMode="contain" />}
            style={styles.title_cards}
            titleNumberOfLines={2}
            subtitleStyle={{ textDecorationLine: 'underline', letterSpacing: 0.5 }}
          />
        </Card>
      </ScrollView>
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
  title: {
    textAlign: 'center',
    fontSize: 32,
    fontWeight: 300,
    color: '#181C20',
    margin: 10,
    width: '60%',
  },
  description: {
    fontSize: 14,
    color: '#181C20',
    margin: 10,
  },
  cards: {
    marginVertical: 10,
    width: '100%',
    backgroundColor: '#F1F4F9',
  },
  title_cards: {
    height: 100,
  },
  grouped_cards: {
    paddingVertical: 12,
  },
});

export default EducationScreen;
