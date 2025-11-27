import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router, usePathname } from 'expo-router';
import { Platform, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Surface, Text } from 'react-native-paper';

const resourcesIcon = require('../assets/Icon.png');
const cardIcon = require('../assets/confirmation_number.png');

const BottomNavBar = () => {
  const pathname = usePathname();
  const isMedicationLookupActive = pathname.includes('medication-lookup') || pathname === '/(tabs)';

  return (
    <View style={styles.mobileWrapper}>
      <Surface style={styles.bottomNav} elevation={0}>
        <TouchableOpacity
          style={styles.navItem}
          activeOpacity={0.85}
          onPress={() => router.push('medication-lookup')}
        >
          <View style={isMedicationLookupActive ? styles.navActiveContainer : undefined}>
            <MaterialCommunityIcons
              name="pill"
              size={24}
              color={isMedicationLookupActive ? '#236488' : '#6B7280'}
            />
          </View>
          <Text
            variant="labelMedium"
            style={[styles.navLabel, isMedicationLookupActive && styles.navLabelActive]}
          >
            Drug Prices
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} activeOpacity={0.85}>
          <MaterialCommunityIcons name="hospital-building" size={24} color="#6B7280" />
          <Text variant="labelMedium" style={styles.navLabel}>
            Pharmacies
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} activeOpacity={0.85}>
          <MaterialCommunityIcons name="book-open-variant" size={24} color="#6B7280" />
          <Text variant="labelMedium" style={styles.navLabel}>
            Resources
          </Text>
        </TouchableOpacity>
      </Surface>
    </View>
  );
};

const styles = StyleSheet.create({
  bottomNav: {
    backgroundColor: '#EBEEF3',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 20 : 8,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    height: Platform.OS === 'ios' ? 84 : 68,
  },
  mobileWrapper: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    maxWidth: 412,
    alignSelf: 'center',
    backgroundColor: '#fff',
    zIndex: 1000,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingVertical: 4,
  },
  navLabel: {
    marginTop: 4,
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '400',
    fontFamily: 'Nunito Sans',
  },
  navLabelActive: {
    color: '#111827',
    fontWeight: '600',
  },
  navActiveContainer: {
    width: 56,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E0F2FE',
    marginBottom: 2,
  },
});

export default BottomNavBar;
