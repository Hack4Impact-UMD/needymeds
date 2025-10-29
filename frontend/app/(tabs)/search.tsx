import React, { useMemo, useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  SafeAreaView,
  Platform,
} from 'react-native';
import { Text, Surface } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

//  medication dataset used as  search stub.
const MOCK_MEDS = [
  { id: '1', name: 'Atorvastatin', strength: '10 mg', price: '$4' },
  { id: '2', name: 'Lisinopril', strength: '20 mg', price: '$6' },
  { id: '3', name: 'Metformin', strength: '500 mg', price: '$5' },
  { id: '4', name: 'Levothyroxine', strength: '50 mcg', price: '$8' },
  { id: '5', name: 'Amlodipine', strength: '5 mg', price: '$7' },
];

const SearchScreen = ({ navigation }: any) => {
  const [query, setQuery] = useState('');

  // very small client-side search logic. Matches query against medication name.
  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return MOCK_MEDS.filter((m) => m.name.toLowerCase().includes(q));
  }, [query]);

  const onSubmit = () => {
    // if there is an exact-ish match, navigate to the selected medication screen for the first match.
    if (results.length > 0) {
      navigation.navigate('SelectedMedication', { medication: results[0] });
    } else {
      // no results, do nothing for now — could show a message or perform a fallback search.
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {/* header area */}
        <View style={styles.headerRow}>
          <Text style={styles.logo}>NeedyMeds</Text>
          <TouchableOpacity style={styles.langPill} accessibilityRole="button">
            <Text style={styles.langText}>EN ▾</Text>
          </TouchableOpacity>
        </View>

        {/* promo area */}
        <View style={styles.promoWrap}>
          <Text style={styles.promoTitle}>Upto 80% off</Text>
          <Text style={styles.promoSubtitle}>on your prescription</Text>
        </View>

        {/* searc bar */}
        <View style={styles.searchRow}>
          <View style={styles.inputWrap}>
            <MaterialCommunityIcons name="arrow-left" size={20} color="#111" style={{ marginRight: 8 }} />
            <TextInput
              placeholder="Search for a drug"
              placeholderTextColor="#9aa0a6"
              value={query}
              onChangeText={setQuery}
              onSubmitEditing={onSubmit}
              style={styles.input}
              returnKeyType="search"
            />
            <TouchableOpacity onPress={onSubmit} accessibilityRole="button" style={styles.inputIcon}>
              <MaterialCommunityIcons name="magnify" size={20} color="#111" />
            </TouchableOpacity>
          </View>
        </View>


        {/* results list */}
        <View style={styles.resultsWrap}>
          {query.length === 0 ? (
            <View style={styles.hintWrap}>
              <Text style={styles.hintText}>Search for a medication to see results.</Text>
            </View>
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
                  onPress={() => navigation.navigate('SelectedMedication', { medication: item })}
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
        <TouchableOpacity style={styles.navItem}>
          <MaterialCommunityIcons name="magnify" size={24} color="#111827" />
          <Text variant="labelMedium" style={styles.navLabel}>Search</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <MaterialCommunityIcons name="credit-card" size={24} color="#6B7280" />
          <Text variant="labelMedium" style={styles.navLabel}>My Cards</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <MaterialCommunityIcons name="web" size={24} color="#6B7280" />
          <Text variant="labelMedium" style={styles.navLabel}>Resources</Text>
        </TouchableOpacity>
      </Surface>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  container: { flex: 1, padding: 20, paddingBottom: Platform.OS === 'ios' ? 84 : 68 },
  header: { height: 44, justifyContent: 'center' },
  logo: { fontSize: 20, fontWeight: '600', color: '#2563EB' },
  promoWrap: { alignItems: 'center', marginTop: 16, marginBottom: 24 },
  promoTitle: { fontSize: 32, fontWeight: '200', color: '#111827' },
  promoSubtitle: { fontSize: 16, color: '#6B7280', marginTop: 4 },
  searchRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8},
  inputWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 28,
    backgroundColor: '#E5E8ED',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  inputIcon: {
    marginLeft: 8,
    padding: 4,
    borderRadius: 20,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
    paddingVertical: 0,
    backgroundColor: '#E5E8ED'
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
    paddingBottom: Platform.OS === 'ios' ? 24 : 16,
    paddingTop: 12,
    height: Platform.OS === 'ios' ? 90 : 76,
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
    color: '#6B7280',
    fontWeight: '500',
  },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', height: 44 },
  langPill: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 16, backgroundColor: '#fff' },
  langText: { color: '#111827', fontSize: 12 },
});

export default SearchScreen;
