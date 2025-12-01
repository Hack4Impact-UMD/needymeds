import React from 'react';
import { View, ViewStyle } from 'react-native';
import { Searchbar } from 'react-native-paper';

interface SearchBarProps {
  query: string;
  onChangeText: (text: string) => void;
  onClear: () => void;
  placeholder?: string;
  containerStyle?: ViewStyle;
  onFocus?: () => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  query,
  onChangeText,
  onClear,
  placeholder = 'Search',
  containerStyle,
  onFocus,
}) => {
  return (
    <View style={containerStyle}>
      <Searchbar
        placeholder={placeholder}
        onChangeText={onChangeText}
        onFocus={onFocus}
        value={query}
        onIconPress={onClear}
        inputStyle={{ color: '#41484D', fontFamily: 'Open Sans' }}
        style={{
          width: 320,
          backgroundColor: '#EBEEF3',
          color: '#41484D',
          elevation: 0,
        }}
      />
    </View>
  );
};
