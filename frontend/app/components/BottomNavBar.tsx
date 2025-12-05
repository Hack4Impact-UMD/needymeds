import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router, usePathname } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Platform, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Surface, Text } from 'react-native-paper';

function BottomNavBar() {
  const { t } = useTranslation();

  const pathname = usePathname();
  const isMedicationLookupActive = pathname.includes('medication-lookup') || pathname === '/(tabs)';
  const isPharmacyLookupActive = pathname.includes('pharmacy-lookup') || pathname === '/(tabs)';
  const isEducationalResourcesActive =
    pathname.includes('educational-resources') || pathname === '/(tabs)';

  return (
    <View style={styles.mobileWrapper}>
      <Surface style={styles.bottomNav} elevation={0}>
        <TouchableOpacity
          style={styles.navItem}
          activeOpacity={0.85}
          onPress={() => router.push('medication-lookup')}
        >
          <View
            style={{
              width: 60,
              height: 30,
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 30,
              backgroundColor: isMedicationLookupActive ? '#B6EBFF' : '#EBEEF3',
            }}
          >
            <MaterialCommunityIcons
              name={isMedicationLookupActive ? 'medication' : 'medication-outline'}
              size={24}
              color="#004E60"
            />
          </View>
          <Text
            variant="labelMedium"
            style={[styles.navLabel, isMedicationLookupActive && styles.navLabelActive]}
          >
            {t('DrugPricesTab')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navItem}
          activeOpacity={0.85}
          onPress={() => router.push('pharmacy-lookup')}
        >
          <View
            style={{
              width: 60,
              height: 30,
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 30,
              backgroundColor: isPharmacyLookupActive ? '#B6EBFF' : '#EBEEF3',
            }}
          >
            <MaterialCommunityIcons
              name={isPharmacyLookupActive ? 'store' : 'store-outline'}
              size={24}
              color="#004E60"
            />
          </View>
          <Text
            variant="labelMedium"
            style={[styles.navLabel, isPharmacyLookupActive && styles.navLabelActive]}
          >
            {t('PharmaciesTab')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navItem}
          activeOpacity={0.85}
          onPress={() => router.push('educational-resources')}
        >
          <View
            style={{
              width: 60,
              height: 30,
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 30,
              backgroundColor: isEducationalResourcesActive ? '#B6EBFF' : '#EBEEF3',
            }}
          >
            <MaterialCommunityIcons
              name={isEducationalResourcesActive ? 'library' : 'library-outline'}
              size={24}
              color="#004E60"
            />
          </View>

          <Text
            variant="labelMedium"
            style={[styles.navLabel, isEducationalResourcesActive && styles.navLabelActive]}
          >
            {t('ResourcesTab')}
          </Text>
        </TouchableOpacity>
      </Surface>
    </View>
  );
}

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
});

export default BottomNavBar;
