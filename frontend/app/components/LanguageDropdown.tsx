import { Colors } from '@/constants/theme';
import { useState } from 'react';
import { StyleSheet } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';

const LanguageDropdown = () => {
  const [lang, setLang] = useState('EN');
  const langOptions = [
    { label: 'EN', value: 'EN' },
    { label: 'SP', value: 'SP' },
  ];

  function handleChangeLanguage(item: any) {
    if (item && item.value) {
      setLang(item.value);
    }
  }

  return (
    <Dropdown
      placeholder="EN"
      value={lang}
      labelField="label"
      valueField="value"
      data={langOptions}
      onChange={handleChangeLanguage}
      style={styles.langDropdown}
      placeholderStyle={styles.langPlaceholder}
      itemTextStyle={styles.langItemText}
      selectedTextStyle={styles.langSelectedText}
    />
  );
};

const styles = StyleSheet.create({
  langDropdown: {
    width: 72,
    height: 36,
    borderColor: '#C1C7CE',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    backgroundColor: Colors.default.neutrallt,
  },
  langPlaceholder: {
    color: '#41484D',
    fontSize: 14,
    fontFamily: 'Open Sans',
  },
  langItemText: {
    color: '#41484D',
    fontSize: 14,
    fontFamily: 'Open Sans',
  },
  langSelectedText: {
    color: '#41484D',
    fontSize: 14,
    fontFamily: 'Open Sans',
  },
});

export default LanguageDropdown;
