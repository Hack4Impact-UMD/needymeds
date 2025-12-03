import React, { useRef } from 'react';
import { View, ViewStyle } from 'react-native';
import { Searchbar } from 'react-native-paper';

interface MedicationSearchbarProps {
  query: string;
  onChangeText: (text: string) => void;
  onClear: () => void;
  placeholder?: string;
  containerStyle?: ViewStyle;
  onFocus?: () => void;
  removeFocus?: boolean;
}

const QUERY_TRUNCATE_CUTOFF = 25;

const MedicationSearchbar: React.FC<MedicationSearchbarProps> = ({
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
        placeholder={query ? query : placeholder}
        onChangeText={onChangeText}
        value={
          query.length >= QUERY_TRUNCATE_CUTOFF
            ? `${query.slice(0, QUERY_TRUNCATE_CUTOFF - 2)}...`
            : query
        }
        onClearIconPress={onClear}
        onFocus={() => {
          if (removeFocus) {
            searchRef.current?.blur();
            setTimeout(() => {
              onFocus && onFocus();
            }, 10);
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
        maxLength={20}
      />
    </View>
  );
};

export default MedicationSearchbar;
