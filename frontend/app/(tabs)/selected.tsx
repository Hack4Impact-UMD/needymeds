import { Colors } from '@/constants/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { FlatList, Keyboard, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import { Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import BottomNavBar from '../components/BottomNavBar';
import { SearchBar } from '../components/SearchBar';
const logo = require('../assets/horizontal_logo.png');

const MOCK_MEDS = [
  {
    id: '1',
    name: 'Abraxane injectable suspension',
    genericName: 'paclitaxel protein-bound particles injectable',
    strength: '100 mg/vial',
    price: '$450',
  },
  {
    id: '2',
    name: 'Abreva cream 2%',
    genericName: 'docosanol',
    strength: '2% topical',
    price: '$18',
  },
  {
    id: '3',
    name: 'Abrilada injection',
    genericName: 'adalimumab-afzb injection',
    strength: '40 mg/0.8 mL',
    price: '$850',
  },
  {
    id: '4',
    name: 'Abryxvo solution',
    genericName: 'respiratory syncytial virus vaccine solution',
    strength: '1 dose',
    price: '$295',
  },
  {
    id: '5',
    name: 'BACKAID Max caplet',
    genericName: 'acetaminophen paracetamol caplet',
    strength: '500 mg',
    price: '$12',
  },
  {
    id: '6',
    name: 'Calquence',
    genericName: 'n/a',
    strength: '100 mg',
    price: '$680',
  },
  {
    id: '7',
    name: 'Cibinqo tablet',
    genericName: 'abrocitinib tablet',
    strength: '50 mg',
    price: '$425',
  },
  {
    id: '8',
    name: 'Corlanor',
    genericName: 'ivabradine',
    strength: '5 mg',
    price: '$560',
  },
  {
    id: '9',
    name: 'Diurex Max caplets',
    genericName: 'pamabrom',
    strength: '50 mg',
    price: '$9',
  },
  {
    id: '10',
    name: 'Atorvastatin',
    genericName: 'atorvastatin calcium',
    strength: '10 mg',
    price: '$4',
  },
  {
    id: '11',
    name: 'Lisinopril',
    genericName: 'lisinopril',
    strength: '20 mg',
    price: '$6',
  },
  {
    id: '12',
    name: 'Metformin',
    genericName: 'metformin hydrochloride',
    strength: '500 mg',
    price: '$5',
  },
];

const langOptions = [
  { label: 'EN', value: 'EN' },
  { label: 'SP', value: 'SP' },
];

const SelectedScreen = () => {
  const [query, setQuery] = useState('');
  const [lang, setLang] = useState('EN');
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 1) return [];
    return MOCK_MEDS.filter(
      (m) => m.name.toLowerCase().includes(q) || m.genericName.toLowerCase().includes(q)
    );
  }, [query]);

  const handleSelectMed = (item: (typeof MOCK_MEDS)[0]) => {
    Keyboard.dismiss();
    // Navigate to selected medication details with params
    router.push({
      pathname: '/pharmacy-search',
      params: {
        id: item.id,
        name: item.name,
        genericName: item.genericName,
        strength: item.strength,
        price: item.price,
      },
    });
  };

  const clearSearch = () => {
    setQuery('');
    inputRef.current?.focus();
  };

  const handleLang = (item: any) => {
    if (item && item.value) setLang(item.value);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.wrapper}>
        <View style={styles.container}>
          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <SearchBar
              query={query}
              onChangeText={setQuery}
              onClear={clearSearch}
              lang={lang}
              langOptions={langOptions}
              onLangChange={handleLang}
              showLanguageDropdown={true}
            />
            <Dropdown
              placeholder="EN"
              value={lang}
              labelField="label"
              valueField="value"
              data={langOptions}
              onChange={handleLang}
              style={styles.langDropdown}
              placeholderStyle={styles.langText}
              itemTextStyle={styles.langText}
              selectedTextStyle={styles.langText}
            />
          </View>

          {/* Results or Empty State */}
          <View style={styles.resultsContainer}>
            {query.length === 0 ? (
              // Show placeholder message when no search
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>
                  Type the first three letters to start searching.
                </Text>
              </View>
            ) : results.length === 0 ? (
              // Show no results message
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>No results found for "{query}"</Text>
              </View>
            ) : (
              // Show results list
              <FlatList
                data={results}
                keyExtractor={(item) => item.id}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.resultItem}
                    onPress={() => handleSelectMed(item)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.resultContent}>
                      <Text style={styles.resultName}>{item.name}</Text>
                      {item.genericName !== 'n/a' && (
                        <Text style={styles.resultGeneric}>/ {item.genericName}</Text>
                      )}
                    </View>
                    <MaterialCommunityIcons name="chevron-right" size={20} color="#9CA3AF" />
                  </TouchableOpacity>
                )}
                contentContainerStyle={styles.listContent}
              />
            )}
          </View>
          <BottomNavBar />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.default.neutrallt,
  },
  wrapper: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: Colors.default.neutrallt,
  },
  container: {
    flex: 1,
    width: '100%',
    maxWidth: 412,
    backgroundColor: Colors.default.neutrallt,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: Colors.default.neutrallt,
  },
  logoImage: {
    width: 120,
    height: 32,
  },
  langDropdown: {
    width: 70,
    height: 32,
    borderColor: '#E5E7EB',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
  },
  langText: {
    color: '#41484D',
    fontSize: 14,
    fontFamily: 'Nunito Sans',
  },
  searchContainer: {
    paddingHorizontal: 8,
    paddingVertical: 10,
    backgroundColor: Colors.default.neutrallt,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DBD6DF',
    borderRadius: 30,
    paddingHorizontal: 20,
    paddingVertical: 1,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
    paddingVertical: 12,
    fontFamily: 'Nunito Sans',
    width: 255,
  },
  clearButton: {
    padding: 4,
    marginLeft: 4,
  },
  resultsContainer: {
    flex: 1,
    backgroundColor: '#F6FAFE',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyText: {
    color: '#6B7280',
    textAlign: 'left',
    fontFamily: 'Nunito Sans',
    lineHeight: 22,
    fontSize: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#C1C7CE',
    paddingBottom: 15,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 20,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: '#F6FAFE',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  resultContent: {
    flex: 1,
    marginRight: 12,
  },
  resultName: {
    fontSize: 15,
    fontWeight: '500',
    fontFamily: 'Nunito Sans',
    color: '#111827',
    lineHeight: 22,
  },
  resultGeneric: {
    fontSize: 13,
    fontFamily: 'Nunito Sans',
    color: '#6B7280',
    marginTop: 2,
    lineHeight: 18,
  },
});

export default SelectedScreen;
