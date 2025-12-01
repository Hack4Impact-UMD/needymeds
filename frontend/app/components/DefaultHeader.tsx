import { Image, StyleSheet, View } from 'react-native';
import LanguageDropdown from './LanguageDropdown';

const DefaultHeader = () => {
  const logo = require('../assets/horizontal_logo.png');

  return (
    <View style={styles.headerRow}>
      <View>
        <Image source={logo} style={styles.logoImage} resizeMode="contain" />
      </View>

      <LanguageDropdown />
    </View>
  );
};

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingTop: 8,
  },
  logoImage: {
    width: 120,
    height: 32,
  },
});

export default DefaultHeader;
