import React, { useRef } from 'react';
import { View, ViewStyle } from 'react-native';
import { Searchbar } from 'react-native-paper';

interface LookupSearchbarProps {
  query: string;
  onChangeText: (text: string) => void;
  onClear: () => void;
  placeholder?: string;
  containerStyle?: ViewStyle;
  onFocus?: () => void;
  removeFocus?: boolean;
}

export const LookupSearchbar: React.FC<LookupSearchbarProps> = ({
  query,
  onChangeText,
  onClear,
  placeholder = 'Search',
  containerStyle,
  onFocus,
  removeFocus = false,
}) => {
  const searchRef = useRef<any>(null);

  return (
    <View style={containerStyle}>
      <Searchbar
        ref={searchRef}
        placeholder={placeholder}
        onChangeText={onChangeText}
        value={query}
        onIconPress={onClear}
        onFocus={() => {
          if (removeFocus) {
            setTimeout(() => {
              searchRef.current?.blur();
              onFocus && onFocus();
            }, 100);
          } else {
            onFocus && onFocus();
          }
        }}
        inputStyle={{ color: '#41484D', fontFamily: 'Open Sans' }}
        style={{
          backgroundColor: '#EBEEF3',
          color: '#41484D',
          elevation: 0,
        }}
      />
    </View>
  );
};
