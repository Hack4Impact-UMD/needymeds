import { autoCompleteSearchDrug } from '@/api/drugSearch';
import { Colors } from '@/constants/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { FlatList, Keyboard, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import { Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import BottomNavBar from '../components/BottomNavBar';
import { SearchBar } from '../components/SearchBar';

const langOptions = [
  { label: 'EN', value: 'EN' },
  { label: 'SP', value: 'SP' },
];

const MedicationLookupAutocompleteScreen = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<string[]>([]);
  const [lang, setLang] = useState('EN');
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const fetchAutoCompleteDrugNames = async (q: string) => {
      try {
        const autoCompleteDrugNames: string[] = await autoCompleteSearchDrug(q);
        setResults(autoCompleteDrugNames);
      } catch (error: any) {
        console.log(error);
        // TODO: Set error state
      }
    };

    const q = query.trim().toLowerCase();
    if (q.length < 3) {
      setResults([]);
    } else {
      fetchAutoCompleteDrugNames(q);
    }
  }, [query]);

  const handleSelectMed = (item: string) => {
    Keyboard.dismiss();
    // Navigate to selected medication details with params
    router.push({
      pathname: '/medication-lookup-selected',
      params: {
        drugName: item,
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
            <SearchBar query={query} onChangeText={setQuery} onClear={clearSearch} />
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
                keyExtractor={(item) => item}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.resultItem}
                    onPress={() => handleSelectMed(item)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.resultContent}>
                      <Text style={styles.resultName}>{item}</Text>
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
    margin: 0,
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
    height: 36,
    borderColor: '#C1C7CE',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    backgroundColor: Colors.default.neutrallt,
  },
  langText: {
    color: '#41484D',
    fontSize: 14,
    fontWeight: 600,
    fontFamily: 'Open Sans',
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
  resultsContainer: {
    flex: 1,
    backgroundColor: '#F6FAFE',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 20,
  },
  emptyText: {
    color: '#181C20',
    textAlign: 'left',
    fontFamily: 'Open Sans',
    lineHeight: 22,
    fontSize: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#C1C7CE',
    paddingBottom: 25,
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
});

export default MedicationLookupAutocompleteScreen;
