import { Colors } from '@/constants/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  Image,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import { Text, TouchableRipple } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import BottomNavBar from '../components/BottomNavBar';
import HomeBackgroundShape from '../components/HomeBackgroundShape';

const logo = require('../assets/horizontal_logo.png');

const langOptions = [
  { label: 'EN', value: 'EN' },
  { label: 'SP', value: 'SP' },
];

const MedicationLookupScreen = () => {
  const [showEligibilityModal, setShowEligibilityModal] = useState(false);
  const [lang, setLang] = useState('EN');

  // Navigate to full-page autocomplete when input is focused
  const handleSearchPress = () => {
    router.push('/medication-lookup-autocomplete');
  };

  function handleButton(item: any): void {
    if (item && item.value) setLang(item.value);
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.mobileWrapper}>
        <View style={styles.container}>
          {/* header area */}
          <View style={styles.headerRow}>
            <View>
              <Image source={logo} style={styles.logoImage} resizeMode="contain" />
            </View>
            <Dropdown
              placeholder="EN"
              value={lang}
              labelField="label"
              valueField="value"
              data={langOptions}
              onChange={handleButton}
              style={styles.langDropdown}
              placeholderStyle={styles.langPlaceholder}
              itemTextStyle={styles.langItemText}
              selectedTextStyle={styles.langSelectedText}
            />
          </View>

          {/* promo area */}
          <View style={styles.promoWrap}>
            <Text style={styles.promoTitle}>Upto 80% off</Text>
            <Text style={styles.promoSubtitle}>on your prescription</Text>
          </View>

          {/* Search Bar - Touchable to open full page */}
          <TouchableOpacity
            style={styles.searchRow}
            onPress={handleSearchPress}
            activeOpacity={0.8}
          >
            <View style={styles.inputWrap}>
              <Text style={styles.inputPlaceholder}>Search for a drug</Text>
              <View style={styles.searchIcon}>
                <MaterialCommunityIcons name="magnify" size={20} color="#41484D" />
              </View>
            </View>
          </TouchableOpacity>

          {/* Blue Background */}
          <HomeBackgroundShape top={280} color="#236488" maxWidth={700} maxHeight={1500} />
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
              <Text style={styles.eligibleText}>What is eligible?</Text>
            </View>
          </TouchableRipple>

          {/* Eligibility Modal */}
          <Modal
            visible={showEligibilityModal}
            transparent
            animationType="slide"
            onRequestClose={() => setShowEligibilityModal(false)}
          >
            <View style={styles.modalOverlay}>
              <TouchableOpacity
                style={styles.modalBackdrop}
                activeOpacity={1}
                onPress={() => setShowEligibilityModal(false)}
              />
              <View style={styles.modalMobileWrapper}>
                <View style={styles.modalContent}>
                  <View style={styles.modalHandle} />

                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Save on</Text>
                    <TouchableOpacity
                      onPress={() => setShowEligibilityModal(false)}
                      style={styles.modalCloseButton}
                    >
                      <MaterialCommunityIcons name="close" size={24} color="#111827" />
                    </TouchableOpacity>
                  </View>

                  <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
                    {[
                      'Prescription drugs.',
                      'Over-the-counter medicines if written on a prescription blank.',
                      'Medical supplies if written on a prescription blank.',
                      'Medical equipment (canes, crutches, splints, incontinence supplies, etc).',
                      'Diabetic supplies (glucose meters, test strips, lancets, diabetic shoes).',
                      'Pet prescription medicines.',
                    ].map((text, idx) => (
                      <View key={idx} style={styles.modalItem}>
                        <MaterialCommunityIcons name="check" size={20} color="#111827" />
                        <Text style={styles.modalItemText}>{text}</Text>
                      </View>
                    ))}
                  </ScrollView>

                  <TouchableOpacity style={styles.modalFooter}>
                    <Text style={styles.modalFooterText}>Learn more</Text>
                    <MaterialCommunityIcons name="open-in-new" size={18} color="#236488" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
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
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: Platform.OS === 'ios' ? 84 : 68,
  },
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
  langDropdown: {
    width: 60,
    height: 36,
    borderColor: '#C1C7CE',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    backgroundColor: '#fff',
  },
  langPlaceholder: {
    color: '#41484D',
    fontSize: 14,
    fontFamily: 'Nunito Sans',
  },
  langItemText: {
    color: '#41484D',
    fontSize: 14,
    fontFamily: 'Nunito Sans',
  },
  langSelectedText: {
    color: '#41484D',
    fontSize: 14,
    fontFamily: 'Nunito Sans',
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

  // Modal Styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalMobileWrapper: {
    width: '100%',
    maxWidth: 412,
    alignSelf: 'center',
  },
  modalContent: {
    backgroundColor: Colors.default.neutrallt,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '100%',
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
  },
  modalHandle: {
    width: 36,
    height: 2,
    backgroundColor: '#D1D5DB',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    fontFamily: 'Nunito Sans',
    color: '#111827',
  },
  modalCloseButton: {
    padding: 4,
  },
  modalScroll: {
    paddingHorizontal: 24,
  },
  modalItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    gap: 12,
  },
  modalItemText: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Nunito Sans',
    color: '#111827',
    lineHeight: 24,
  },
  modalFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 24,
    paddingHorizontal: 24,
    gap: 6,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    marginTop: 16,
  },
  modalFooterText: {
    fontSize: 16,
    fontFamily: 'Nunito Sans',
    color: '#236488',
    fontWeight: '400',
  },
});

export default MedicationLookupScreen;
