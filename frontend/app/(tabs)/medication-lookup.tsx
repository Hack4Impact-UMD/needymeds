import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Platform, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text, TouchableRipple } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

import BottomNavBar from '../components/BottomNavBar';
import DefaultHeader from '../components/DefaultHeader';
import EligibilityModal from '../components/medication-lookup/EligibilityModal';
import MedicationLookupBackgroundShape from '../components/medication-lookup/MedicationLookupBackgroundShape';

const MedicationLookupScreen = () => {
  const { t } = useTranslation();

  const [showEligibilityModal, setShowEligibilityModal] = useState(false);

  // Navigate to full-page autocomplete when input is focused
  const handleSearchPress = () => {
    router.push('/medication-lookup-autocomplete');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.mobileWrapper}>
        <View style={styles.container}>
          {/* header area */}
          <DefaultHeader />

          {/* promo area */}
          <View style={styles.promoWrap}>
            <Text style={styles.promoTitle}>{t('HeroTxtEmphasisLine')}</Text>
            <Text style={styles.promoSubtitle}>{t('HeroTxtSecondaryLine')}</Text>
          </View>

          {/* Search Bar - Touchable to open full page */}
          <TouchableOpacity
            style={styles.searchRow}
            onPress={handleSearchPress}
            activeOpacity={0.8}
          >
            <View style={styles.inputWrap}>
              <Text style={styles.inputPlaceholder}>{t('SearchPlaceholder')}</Text>
              <View style={styles.searchIcon}>
                <MaterialCommunityIcons name="magnify" size={20} color="#41484D" />
              </View>
            </View>
          </TouchableOpacity>

          {/* Blue Background */}
          <MedicationLookupBackgroundShape
            top={280}
            color="#236488"
            maxWidth={700}
            maxHeight={1500}
          />
          {/* Eligible Link */}
          <TouchableRipple
            onPress={() => setShowEligibilityModal(true)}
            style={styles.eligibleWrap}
            borderless
            accessibilityRole="link"
            accessibilityHint="Learn more about program eligibility"
          >
            <View style={styles.eligibleInner}>
              <View style={styles.eligibleIconCircle}>
                <MaterialCommunityIcons name="information-outline" size={17} color="white" />
              </View>
              <Text style={styles.eligibleText}>{t('InfoLink')}</Text>
            </View>
          </TouchableRipple>

          {/* Eligibility Modal */}
          <EligibilityModal
            showEligibilityModal={showEligibilityModal}
            setShowEligibilityModal={setShowEligibilityModal}
          />
        </View>
      </View>
      <BottomNavBar />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#fff',
  },
  mobileWrapper: {
    flex: 1,
    width: '100%',
    maxWidth: 412,
    alignSelf: 'center',
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 84 : 68,
  },
  promoWrap: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 32,
  },
  promoTitle: {
    fontSize: 32,
    fontWeight: '300',
    fontFamily: 'Nunito Sans',
    color: '#41484D',
    letterSpacing: 0.5,
  },
  promoSubtitle: {
    fontSize: 14.5,
    fontFamily: 'Open Sans',
    color: '#41484D',
    marginTop: 4,
    fontWeight: '400',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 0,
    zIndex: 10,
    elevation: 5,
  },
  inputWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
    paddingHorizontal: 16,
    borderRadius: 28,
    backgroundColor: '#E5E8ED',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    minHeight: 48,
  },
  inputPlaceholder: {
    flex: 1,
    fontSize: 14.5,
    color: '#41484D',
    fontFamily: 'Open Sans',
  },
  searchIcon: {
    padding: 4,
  },
  eligibleWrap: {
    alignSelf: 'center',
    marginTop: 24,
    zIndex: 5,
  },
  eligibleInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  eligibleIconCircle: {
    width: 17,
    height: 17,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eligibleText: {
    color: 'white',
    textDecorationLine: 'underline',
    fontSize: 14,
    fontFamily: 'Open Sans',
    fontWeight: '400',
  },
});

export default MedicationLookupScreen;
