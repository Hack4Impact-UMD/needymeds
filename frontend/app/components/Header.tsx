import { useState } from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';

const h_logo = require('../assets/horizontal_logo.png');

const langOptions = [
  { label: 'EN', value: 'EN' },
  { label: 'ES', value: 'ES' },
];

export default function Header() {
  const [lang, setLang] = useState('EN');
  function handleDropdown(item: any): void {
    if (item && item.value) setLang(item.value);
  }

  return (
    <View style={styles.headerRow}>
      <View>
        <Image source={h_logo} style={styles.logoImage} resizeMode="contain" />
      </View>
      <Dropdown
        placeholder="EN"
        value={lang}
        labelField="label"
        valueField="value"
        data={langOptions}
        onChange={handleDropdown}
        dropdownPosition="bottom"
        style={styles.dropdown}
        placeholderStyle={{ color: '#41484D' }}
        itemTextStyle={{ color: '#41484D' }}
        searchPlaceholderTextColor="#41484D"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  logoImage: {
    width: 80,
    height: 40,
    marginLeft: 10,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 64,
  },
  dropdown: {
    width: 60,
    height: 30,
    borderColor: '#C1C7CE',
    borderWidth: 1,
    padding: 5,
    paddingLeft: 10,
    borderRadius: 8,
    marginRight: 10,
  },
});
