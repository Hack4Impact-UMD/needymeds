import { autoCompleteSearchDrug } from '@/api/drugSearch';
import { Colors } from '@/constants/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { FlatList, Keyboard, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import BottomNavBar from '../components/BottomNavBar';
import ErrorState from '../components/errorMessage';
import LanguageDropdown from '../components/LanguageDropdown';
import { LookupSearchbar } from '../components/LookupSearchbar';

const MedicationLookupAutocompleteScreen = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
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
        setIsLoading(true);
        const autoCompleteDrugNames: string[] = await autoCompleteSearchDrug(q);
        setResults(autoCompleteDrugNames);
        setHasSearched(true);
      } catch (error: any) {
        console.log(error);
        setResults([]);
        setHasSearched(true);
      } finally {
        setIsLoading(false);
      }
    };

    const q = query.trim().toLowerCase();
    if (q.length < 3) {
      setResults([]);
      setHasSearched(false);
    } else {
      fetchAutoCompleteDrugNames(q);
    }
  }, [query]);

  const handleSelectMed = (item: string) => {
    Keyboard.dismiss();
    router.push({
      pathname: '/medication-lookup-selected',
      params: {
        drugName: item,
      },
    });
  };

  const clearSearch = () => {
    setQuery('');
    setHasSearched(false);
    inputRef.current?.focus();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.wrapper}>
        <View style={styles.container}>
          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <View style={{ width: '80%' }}>
              <LookupSearchbar query={query} onChangeText={setQuery} onClear={clearSearch} />
            </View>

            <LanguageDropdown />
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
            ) : isLoading ? (
              // Show loading error state
              <ErrorState type="loading" />
            ) : results.length === 0 && hasSearched ? (
              // Show not found error state
              <ErrorState type="notFound" query={query} />
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
    paddingTop: 60,
  },
  emptyText: {
    color: '#181C20',
    textAlign: 'left',
    fontFamily: 'Nunito Sans',
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
