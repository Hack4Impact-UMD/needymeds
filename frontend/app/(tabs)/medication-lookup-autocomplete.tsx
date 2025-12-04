import { autoCompleteSearchDrug } from '@/api/drugSearch';
import { Colors } from '@/constants/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  FlatList,
  Keyboard,
  Platform,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { ActivityIndicator, Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

import BottomNavBar from '../components/BottomNavBar';
import ErrorState, { ErrorStateType } from '../components/ErrorState';
import LanguageDropdown from '../components/LanguageDropdown';
import MedicationSearchbar from '../components/medication-lookup/MedicationSearchbar';

const MIN_QUERY_LENGTH = 3;

const MedicationLookupAutocompleteScreen = () => {
  const { t } = useTranslation();

  const params = useLocalSearchParams<{ drugName: string }>();
  const drugNameParam = Array.isArray(params.drugName) ? params.drugName[0] : params.drugName || '';

  useFocusEffect(
    useCallback(() => {
      setQuery(drugNameParam);
    }, [drugNameParam])
  );

  const [query, setQuery] = useState(drugNameParam);
  const [results, setResults] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorType, setErrorType] = useState<ErrorStateType | null>(null);

  const inputRef = useRef<TextInput>(null);

  useFocusEffect(
    useCallback(() => {
      const fetchAutoCompleteDrugNames = async (q: string) => {
        try {
          setIsLoading(true);
          const autoCompleteDrugNames: string[] = await autoCompleteSearchDrug(q);
          if (autoCompleteDrugNames.length > 0) {
            setErrorType(null);
          } else {
            setErrorType('notFound');
          }
          setResults(autoCompleteDrugNames);
        } catch (error: any) {
          setErrorType('loading');
        } finally {
          setIsLoading(false);
        }
      };

      const q = query.trim().toLowerCase();
      if (q.length < MIN_QUERY_LENGTH) {
        setResults([]);
      } else {
        fetchAutoCompleteDrugNames(q);
      }
    }, [query])
  );

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
    inputRef.current?.focus();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.wrapper}>
        <View style={styles.container}>
          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <View style={{ width: '80%' }}>
              <MedicationSearchbar query={query} onChangeText={setQuery} onClear={clearSearch} />
            </View>

            <LanguageDropdown />
          </View>

          {/* Results or Empty State */}
          <View style={styles.resultsContainer} onTouchStart={Keyboard.dismiss}>
            {query.length < MIN_QUERY_LENGTH ? (
              // Show placeholder message when no search
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>{t('EmptyMsg')}</Text>
              </View>
            ) : isLoading ? (
              // Show loading state
              <ActivityIndicator size="large" style={{ marginTop: 200 }} color="#236488" />
            ) : errorType ? (
              // Show error state
              <ErrorState type={errorType} />
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
        </View>
      </View>
      <BottomNavBar />
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
    paddingBottom: Platform.OS === 'ios' ? 84 : 68, // bottom navbar height
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
    backgroundColor: Colors.default.neutrallt,
  },
  emptyState: {
    maxWidth: '100%',
    flex: 1,
    alignItems: 'center',
    paddingTop: 40,
    paddingHorizontal: 20,
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
    backgroundColor: Colors.default.neutrallt,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  resultContent: {
    flex: 1,
    marginRight: 12,
  },
  resultName: {
    fontSize: 16,
    fontWeight: '400',
    fontFamily: 'Open Sans',
    color: '#181C20',
    lineHeight: 22,
  },
});

export default MedicationLookupAutocompleteScreen;
