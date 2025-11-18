import { Colors } from '@/constants/theme';
import { router } from 'expo-router';
import { useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import { Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import DDCMedInfoRow from '../../components/DDCMedInfoRow';

const logo = require('../../assets/horizontal_logo.png');
const backArrow = require('../../assets/arrow_back.svg');
const expandIcon = require('../../assets/aspect_ratio.svg');
const shareIcon = require('../../assets/share.svg');
const DDCCardFront = require('../../assets/DST_DDCDetailsFront.svg');
const DDCCardBack = require('../../assets/DST_DDCBackDetails.svg');
const langOptions = [
  { label: 'EN', value: 'EN' },
  { label: 'SP', value: 'SP' },
];

const DST = () => {
  const [lang, setLang] = useState('EN');

  function handleButton(item: any): void {
    if (item && item.value) setLang(item.value);
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
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
            style={styles.dropdown}
            placeholderStyle={{ color: '#41484D' }}
            itemTextStyle={{ color: '#41484D' }}
          />
        </View>
        <View style={styles.pageBody}>
          <View style={styles.pageHeader}>
            <View style={styles.backButton}>
              <Pressable onPress={() => router.navigate('/selected')}>
                <Image source={backArrow} style={styles.backIcon} resizeMode="contain" />
              </Pressable>
            </View>
            <Text variant="headlineLarge" style={styles.title}>
              Drug Discount Card
            </Text>
          </View>

          <View style={styles.medInfoWrapper}>
            <DDCMedInfoRow name="Abreva cream" price="$35.95" details="2% / 1 tube" />
          </View>

          <View style={styles.cardSection}>
            <Text variant="titleMedium" style={styles.sectionLabel}>
              Front of Card:
            </Text>
            <View style={styles.cardImageWrapper}>
              <Image source={DDCCardFront} style={styles.cardImage} resizeMode="contain" />
            </View>
          </View>

          <View style={styles.cardSection}>
            <Text variant="titleMedium" style={styles.sectionLabel}>
              Back of Card:
            </Text>
            <View style={styles.cardImageWrapper}>
              <Image source={DDCCardBack} style={styles.cardImage} resizeMode="contain" />
            </View>
          </View>

          <View style={styles.actionRow}>
            <View style={styles.actionButton}>
              <Image source={expandIcon} style={styles.actionIcon} resizeMode="contain" />
              <Text style={styles.buttonText}>Expand</Text>
            </View>
            <View style={styles.actionButton}>
              <Image source={shareIcon} style={styles.actionIcon} resizeMode="contain" />
              <Text style={styles.buttonText}>Share</Text>
            </View>
          </View>

          <View style={styles.footerNote}>
            <Text style={styles.footerQuestion}>
              Have questions? Learn more about the Drug Discount Card here!
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default DST;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#E7EDF5',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 48,
    paddingTop: 12,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 44,
    marginBottom: 16,
  },
  dropdown: {
    width: 60,
    borderColor: '#C1C7CE',
    borderWidth: 1,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  pageBody: {
    paddingVertical: 24,
    gap: 24,
  },
  pageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    width: 16,
    height: 16,
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontWeight: '400',
    color: '#1F2328',
  },
  medInfoWrapper: {
    paddingHorizontal: 2,
  },
  cardSection: {
    gap: 12,
  },
  logoImage: {
    width: 80,
    height: 40,
  },
  sectionLabel: {
    color: '#353D4E',
  },
  cardImageWrapper: {
    alignItems: 'center',
  },
  cardImage: {
    width: '100%',
    height: 180,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'center',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#236488',
    borderRadius: 999,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  actionIcon: {
    width: 20,
    height: 20,
    marginRight: 8,
    tintColor: Colors.default.neutrallt,
  },
  buttonText: {
    color: Colors.default.neutrallt,
    fontSize: 16,
    fontWeight: '600',
  },
  footerNote: {
    alignItems: 'center',
    paddingHorizontal: 12,
    color: '#181C20',
    textDecorationLine: 'underline',
  },
  footerQuestion: {
    color: '#41484D',
    textAlign: 'center',
  },
});
