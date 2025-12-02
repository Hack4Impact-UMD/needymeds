import { Colors } from '@/constants/theme';
import { MaterialIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Image, Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Adjudicator, DrugSearchResult } from '../../api/types';
import DDCMedInfoRow from '../components/DDCMedInfoRow';
import DefaultHeader from '../components/DefaultHeader';
import DDCFaqScreen from './DDCFaqScreen';

const backArrow = require('../assets/arrow_back.png');
const expandIcon = require('../assets/aspect_ratio.png');
const shareIcon = require('../assets/share.png');

const DST_DDCCardFront = require('../assets/DST_DDCDetailsFront.png');
const DST_DDCCardBack = require('../assets/DST_DDCBackDetails.png');
const ScriptSave_DDCCardFront = require('../assets/ScriptSave_DDCDetailsFront.png');
const ScriptSave_DDCCardBack = require('../assets/ScriptSave_DDCBackDetails.png');

const DDC = () => {
  const { t } = useTranslation();

  const params = useLocalSearchParams();

  const result: DrugSearchResult = {
    adjudicator: params.adjudicator as Adjudicator,
    pharmacyName: params.pharmacyName as string,
    pharmacyAddress: params.pharmacyAddress as string,
    pharmacyPhone: params.pharmacyPhone as string,
    ndc: params.ndc as string,
    labelName: params.labelName as string,
    price: params.price as string,
    latitude: params.latitude as string,
    longitude: params.longitude as string,
    distance: params.distance as string,
  };

  const [showFAQ, setShowFAQ] = useState(false);
  const [showShare, setShowShare] = useState(false);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* header area */}
        <View style={styles.headerRow}>
          <DefaultHeader />
        </View>
        <View style={styles.pageBody}>
          {showFAQ ? (
            <DDCFaqScreen onClose={() => setShowFAQ(false)} />
          ) : (
            <>
              <View style={styles.pageHeader}>
                <View style={styles.backButton}>
                  <Pressable onPress={() => router.push('/medication-lookup')}>
                    <Image source={backArrow} style={styles.backIcon} resizeMode="contain" />
                  </Pressable>
                </View>
                <Text variant="headlineLarge" style={styles.title}>
                  {t('CardHeader')}
                </Text>
              </View>

              <View style={styles.medInfoWrapper}>
                <DDCMedInfoRow result={result} />
              </View>

              <View style={styles.cardSection}>
                <Text variant="titleMedium" style={styles.sectionLabel}>
                  {t('ImageHeader1')}
                </Text>
                <View style={styles.cardImageWrapper}>
                  <Image
                    source={
                      result.adjudicator === 'DSNT' ? DST_DDCCardFront : ScriptSave_DDCCardFront
                    }
                    style={styles.cardImage}
                    resizeMode="contain"
                  />
                </View>
              </View>

              <View style={styles.cardSection}>
                <Text variant="titleMedium" style={styles.sectionLabel}>
                  {t('ImageHeader2')}
                </Text>
                <View style={styles.cardImageWrapper}>
                  <Image
                    source={
                      result.adjudicator === 'DSNT' ? DST_DDCCardBack : ScriptSave_DDCCardBack
                    }
                    style={styles.cardImage}
                    resizeMode="contain"
                  />
                </View>
              </View>

              <View style={styles.actionRow}>
                <Pressable
                  style={styles.actionButton}
                  onPress={() => {
                    router.push({
                      pathname: '/DDCExpand',
                      params: {
                        adjudicator: result.adjudicator,
                      },
                    });
                  }}
                >
                  <Image source={expandIcon} style={styles.actionIcon} resizeMode="contain" />
                  <Text style={styles.buttonText}>{t('ButtonLabel1')}</Text>
                </Pressable>

                <Pressable style={styles.actionButton} onPress={() => setShowShare(true)}>
                  <Image source={shareIcon} style={styles.actionIcon} resizeMode="contain" />
                  <Text style={styles.buttonText}>{t('ButtonLabel2')}</Text>
                </Pressable>
              </View>

              <View style={styles.footerNote}>
                <Pressable onPress={() => setShowFAQ(true)}>
                  <Text style={styles.footerQuestion}>
                    {t('HelpLink1')} {t('HelpLink2')}
                  </Text>
                </Pressable>
              </View>
            </>
          )}
        </View>
      </ScrollView>

      <Modal
        transparent
        animationType="slide"
        visible={showShare}
        onRequestClose={() => setShowShare(false)}
      >
        {/* Background overlay */}
        <Pressable style={styles.overlay} onPress={() => setShowShare(false)} />

        {/* Bottom popup container */}
        <View style={styles.bottomSheet}>
          <Pressable style={styles.closeIconContainer} onPress={() => setShowShare(false)}>
            <MaterialIcons name="close" size={24} color="#555" />
          </Pressable>

          <Text style={styles.sheetTitle}>Share Drug Discount Card</Text>

          <Text style={styles.sheetSubTitle}>Send image to:</Text>

          <Pressable style={styles.sheetRow} onPress={() => {}}>
            <View style={styles.iconCircle}>
              <MaterialIcons name="sms" size={24} color="#fff" />
            </View>
            <Text style={styles.sheetText}>Text</Text>
          </Pressable>

          <View style={styles.separator} />

          <Pressable style={styles.sheetRow} onPress={() => {}}>
            <View style={styles.iconCircle}>
              <MaterialIcons name="email" size={24} color="#fff" />
            </View>
            <Text style={styles.sheetText}>Email</Text>
          </Pressable>

          <View style={styles.separator} />

          <Pressable style={styles.sheetRow} onPress={() => {}}>
            <View style={styles.iconCircle}>
              <MaterialIcons name="file-download" size={24} color="#fff" />
            </View>
            <Text style={styles.sheetText}>Download to device</Text>
          </Pressable>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default DDC;

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
    textDecorationLine: 'underline',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    paddingTop: 40,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  bottomSheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#FFF',
    paddingTop: 20,
    paddingBottom: 36,
    paddingHorizontal: 24,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,

    // iOS-style drop shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,

    // Android elevation
    elevation: 10,
  },
  sheetTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  sheetSubTitle: {
    width: '100%',
    fontSize: 16,
    paddingVertical: 14,
    textAlign: 'center',
  },
  sheetText: {
    width: '100%',
    fontSize: 16,
    paddingVertical: 14,
  },
  separator: {
    width: '100%',
    height: 1,
    backgroundColor: '#E5E5EA',
  },
  closeIconContainer: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 10,
    padding: 4,
  },
  sheetRow: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'flex-start',
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 10,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20, // makes it a circle
    backgroundColor: '#1d658c', // navy blue
    alignItems: 'center',
    justifyContent: 'center',
  },
});
