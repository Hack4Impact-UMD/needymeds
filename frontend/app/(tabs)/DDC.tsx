import { Colors } from '@/constants/theme';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Image, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Adjudicator, DrugSearchResult } from '../../api/types';

import { Ionicons, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import DDCMedInfoRow from '../components/ddc/DDCMedInfoRow';
import DDCShareModal from '../components/ddc/DDCShareModal';
import DefaultHeader from '../components/DefaultHeader';
import DDCFaqScreen from './DDCFaqScreen';

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
  const [showShareModal, setShowShareModal] = useState(false);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* header area */}
        <DefaultHeader />
        <View style={styles.pageBody}>
          {showFAQ ? (
            <DDCFaqScreen onClose={() => setShowFAQ(false)} />
          ) : (
            <>
              <View style={styles.pageHeader}>
                <View style={styles.backButton}>
                  <Ionicons
                    name="arrow-back"
                    size={25}
                    color="#181C20"
                    onPress={() => {
                      router.push({
                        pathname: '/medication-lookup-selected',
                        params: {
                          drugName: params.drugName,
                        },
                      });
                    }}
                  />
                </View>
              </View>
              <Text variant="headlineLarge" style={styles.title}>
                {t('CardHeader')}
              </Text>

              <View style={styles.medInfoWrapper}>
                <DDCMedInfoRow
                  result={result}
                  form={params.form as string}
                  quantity={params.quantity as string}
                />
              </View>

              <View style={styles.cardContainer}>
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
              </View>

              <View style={styles.actionRow}>
                <Pressable
                  style={styles.actionButton}
                  onPress={() => {
                    router.push({
                      pathname: '/DDCExpand',
                      params: {
                        drugName: params.drugName,
                        quantity: params.quantity,
                        form: params.form,
                        adjudicator: result.adjudicator,
                        pharmacyName: params.pharmacyName,
                        pharmacyAddress: params.pharmacyAddress,
                        pharmacyPhone: params.pharmacyPhone,
                        ndc: params.ndc,
                        labelName: params.labelName,
                        price: params.price,
                        latitude: params.latitude,
                        longitude: params.longitude,
                        distance: params.distance,
                      },
                    });
                  }}
                >
                  <MaterialCommunityIcons name="aspect-ratio" size={20} color="white" />
                  <Text style={styles.buttonText}>{t('ButtonLabel1')}</Text>
                </Pressable>

                <Pressable style={styles.actionButton} onPress={() => setShowShareModal(true)}>
                  <MaterialIcons name="share" size={20} color="white" />
                  <Text style={styles.buttonText}>{t('ButtonLabel2')}</Text>
                </Pressable>
              </View>

              <View style={styles.footerNote}>
                <Pressable onPress={() => setShowFAQ(true)}>
                  <Text style={styles.footerQuestion}>
                    {t('HelpLink1')}
                    {'\n'} {t('HelpLink2')}
                  </Text>
                </Pressable>
              </View>
            </>
          )}
        </View>
      </ScrollView>

      <DDCShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        adjudicator={result.adjudicator}
      />
    </SafeAreaView>
  );
};

export default DDC;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.default.neutrallt,
  },
  scrollContent: {
    padding: 20,
  },
  pageBody: {
    gap: 5,
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
  title: {
    flex: 1,
    paddingHorizontal: 50,
    textAlign: 'center',
    fontWeight: '400',
    color: '#1F2328',
    fontFamily: 'Nunito Sans',
  },
  medInfoWrapper: {
    paddingHorizontal: 2,
  },
  cardContainer: {
    gap: 20,
    marginBottom: 15,
  },
  cardSection: {
    gap: 12,
  },
  logoImage: {
    width: 80,
    height: 40,
  },
  sectionLabel: {
    color: '#181C20',
    fontFamily: 'Open Sans',
    fontWeight: '400',
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
    marginBottom: 25,
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
  buttonText: {
    paddingLeft: 10,
    color: 'white',
    fontSize: 16,
    fontWeight: '400',
    fontFamily: 'Open Sans',
  },
  footerNote: {
    alignItems: 'center',
    paddingHorizontal: 12,
    color: '#181C20',
    textDecorationLine: 'underline',
  },
  footerQuestion: {
    color: '#181C20',
    textAlign: 'center',
    fontSize: 13,
    fontFamily: 'Open Sans',
  },
});
