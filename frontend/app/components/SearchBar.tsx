import { Colors } from '@/constants/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useRef } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, View, ViewStyle } from 'react-native';

interface SearchBarProps {
  query: string;
  onChangeText: (text: string) => void;
  onClear: () => void;
  lang?: string;
  langOptions?: Array<{ label: string; value: string }>;
  onLangChange?: (item: { label: string; value: string }) => void;
  placeholder?: string;
  showLanguageDropdown?: boolean;
  containerStyle?: ViewStyle;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  query,
  onChangeText,
  onClear,
  lang,
  langOptions = [],
  onLangChange,
  placeholder = 'Search',
  showLanguageDropdown = false,
  containerStyle,
}) => {
  const inputRef = useRef<TextInput>(null);

  return (
    <View style={[styles.searchContainer, containerStyle]}>
      <View style={styles.searchBar}>
        <TextInput
          ref={inputRef}
          placeholder={placeholder}
          placeholderTextColor="#9aa0a6"
          value={query}
          onChangeText={onChangeText}
          style={styles.input}
          returnKeyType="search"
          autoCapitalize="none"
          autoCorrect={false}
        />

        {query.length > 0 && (
          <TouchableOpacity onPress={onClear} style={styles.clearButton}>
            <MaterialCommunityIcons name="close" size={20} color="#6B7280" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
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
  },
  langDropdown: {
    marginLeft: 8,
    minWidth: 70,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#DBD6DF',
    borderRadius: 20,
  },
  langText: {
    fontSize: 14,
    color: '#111827',
    fontFamily: 'Nunito Sans',
  },
});
