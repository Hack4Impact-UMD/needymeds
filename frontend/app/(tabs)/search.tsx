import React, { useMemo, useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Platform,
  Image,
} from 'react-native';
import { Text, Surface, TouchableRipple } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Dropdown } from 'react-native-element-dropdown';
import { SafeAreaView } from 'react-native-safe-area-context';
import HomeBackgroundShape from '../components/HomeBackgroundShape';
//import ResourcesIcon from '../assets/resource.svg';
const logo = require('../assets/horizontal_logo.png');

const MOCK_MEDS = [
  { id: '1', name: 'Atorvastatin', strength: '10 mg', price: '$4' },
  { id: '2', name: 'Lisinopril', strength: '20 mg', price: '$6' },
  { id: '3', name: 'Metformin', strength: '500 mg', price: '$5' },
  { id: '4', name: 'Levothyroxine', strength: '50 mcg', price: '$8' },
  { id: '5', name: 'Amlodipine', strength: '5 mg', price: '$7' },
];

const langOptions = [
    { label: 'EN', value: 'EN' },
    { label: 'SP', value: 'SP' },
  ];

const SearchScreen = () => {
  const [query, setQuery] = useState('');

  // very small client-side search logic. Matches query against medication name.
  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return MOCK_MEDS.filter((m) => m.name.toLowerCase().includes(q));
  }, [query]);

  const onSubmit = () => {
    if (results.length > 0) {
      router.navigate('/selected');
    } else {
      // no results, do nothing for now could show a message or perform a fallback search.
    }
  };

  const [lang, setLang] = useState('EN');
  function handleButton(item: any): void {
    if (item && item.value) setLang(item.value);
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
      <HomeBackgroundShape top={200} height={800} color="#226488" />

        {/* header area */}
        <View style={styles.headerRow}>
          <View>
            <Image source={logo} style={styles.logoImage} resizeMode="contain" />
          </View>
          <Dropdown
            placeholder="EN"
            value={lang}
            labelField="label"
            valueField="value"
            data={langOptions}
            onChange={handleButton}
            style={{
              width: 60,
              borderColor: '#C1C7CE',
              borderWidth: 1,
              padding: 5,
              paddingLeft: 10,
              borderRadius: 10,
            }}
            placeholderStyle={{ color: '#41484D' }}
            itemTextStyle={{ color: '#41484D' }}
          />
        </View>

        {/* promo area */}
        <View style={styles.promoWrap}>
          <Text style={styles.promoTitle}>Up to 80% off</Text>
          <Text style={styles.promoSubtitle}>on your prescription</Text>
        </View>

        {/* searc bar */}
        <View style={styles.searchRow}>
          <View style={styles.inputWrap}>
            <TextInput
              placeholder="Search for a drug"
              placeholderTextColor="#9aa0a6"
              value={query}
              onChangeText={setQuery}
              onSubmitEditing={onSubmit}
              style={styles.input}
              returnKeyType="search"
            />
            <TouchableOpacity
              onPress={onSubmit}
              accessibilityRole="button"
              style={styles.inputIcon}
            >
              <MaterialCommunityIcons name="magnify" size={20} color="#111" />
            </TouchableOpacity>
          </View>
        </View>
          <TouchableRipple
            onPress={() => {/* TODO: Navigate to eligibility info */}}
            style={styles.eligibleWrap}
            borderless
            accessibilityRole="link"
            accessibilityHint="Learn more about program eligibility"
          >
            <View style={styles.eligibleInner}>
              <View style={styles.eligibleIconCircle}>
                <MaterialCommunityIcons name="information-outline" size={14} color="white" />
              </View>
              <Text style={styles.eligibleText}>What is eligible?</Text>
            </View>
          </TouchableRipple>

        {/* results list */}
        <View style={styles.resultsWrap}>
          {query.length === 0 ? (
              null
            ) : results.length === 0 ? (
              <View style={styles.hintWrap}>
                <Text style={styles.hintText}>No results found for {query}</Text>
              </View>
            ) : (
            <FlatList
              data={results}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.resultCard}
                  onPress={() => router.navigate('/selected')}
                >
                  <View>
                    <Text style={styles.resultTitle}>{item.name}</Text>
                    <Text style={styles.resultSubtitle}>{item.strength}</Text>
                  </View>
                  <Text style={styles.resultPrice}>{item.price}</Text>
                </TouchableOpacity>
              )}
            />
          )}
        </View>
      </View>
      {/* paper bottom navigation bar */}
      <Surface style={styles.bottomNav} elevation={0}>
        <TouchableOpacity style={styles.navItem} activeOpacity={0.85} onPress={() => {}}>
          <View style={styles.navActiveContainer}>
            <MaterialCommunityIcons name="magnify" size={20} color="#7C3AED" />
          </View>
          <Text variant="labelMedium" style={[styles.navLabel]}>
            Search
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <MaterialCommunityIcons name="credit-card" size={24} color="#6B7280" />
          <Text variant="labelMedium" style={styles.navLabel}>
            My Cards
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          {/* <ResourcesIcon width={24} height={24} /> */}
          <Text variant="labelMedium" style={styles.navLabel}>
            Resources
          </Text>
        </TouchableOpacity>
      </Surface>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { 
    flex: 1, 
    backgroundColor: '#fff' 
  },
  container: { 
    flex: 1, 
    padding: 20, 
    paddingBottom: Platform.OS === 'ios' ? 84 : 68, 
    fontFamily: 'Nunito Sans'
  },
  promoWrap: { 
    alignItems: 'center', 
    marginTop: 70, 
    marginBottom: 24 
  },
  promoTitle: { 
    fontSize: 32, 
    fontWeight: '300', 
    color: '#41484D' 
  },
  promoSubtitle: { 
    fontSize: 16, 
    color: '#41484D', 
    marginTop: 4
  },
  searchRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginTop: 25 
  },
  inputWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 7,
    paddingHorizontal: 7,
    borderRadius: 28,
    backgroundColor: '#E5E8ED',
  },
  inputIcon: {
    marginLeft: 8,
    padding: 3,
    borderRadius: 20,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
    padding: 12,
    borderRadius: 28,
    backgroundColor: '#E5E8ED',
  },
  /* eligible link */
  eligibleWrap: { 
    alignSelf: "center", 
    marginTop: 20,
    },
  eligibleInner: { 
    flexDirection: "row", 
    alignItems: "center", 
    gap: 4 
  },
  eligibleIconCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eligibleText: { 
    color: "white", 
    textDecorationLine: "underline", 
    fontSize: 14 
  },
  resultsWrap: { flex: 1, marginTop: 8 },
  hintWrap: { alignItems: 'center', marginTop: 24 },
  hintText: { color: '#666' },
  resultCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginVertical: 6,
    elevation: 1,
  },
  resultTitle: { fontSize: 16, fontWeight: '600' },
  resultSubtitle: { color: '#666', fontSize: 12 },
  resultPrice: { color: '#0b69ff', fontWeight: '600' },
  bottomNav: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#FAF5FF',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 88,
    paddingVertical: 8,
  },
  navLabel: {
    marginTop: 6,
    fontSize: 12,
    color: '#625B71',
    fontWeight: '500',
  },
  navActiveContainer: {
    width: 60,
    height: 30,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E8DEF8',
  },
  logoImage: {
    width: 80,
    height: 40,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 44,
  },
});

export default SearchScreen;