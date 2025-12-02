import { useTranslation } from 'react-i18next';
import { StyleSheet } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';

const LanguageDropdown = () => {
  const { i18n } = useTranslation();

  const langOptions = [
    { label: 'EN', value: 'en' },
    { label: 'SP', value: 'es' },
  ];

  function handleChangeLanguage(item: any) {
    if (item && item.value) {
      i18n.changeLanguage(item.value);
    }
  }

  return (
    <Dropdown
      placeholder={i18n.language}
      value={i18n.language}
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
