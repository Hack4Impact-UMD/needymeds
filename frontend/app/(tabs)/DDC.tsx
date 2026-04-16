import { getGoogleWalletUrl } from '@/api/wallet';
import { Colors } from '@/constants/theme';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Alert,
  Image,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { handleAddToWallet } from '../../api/appleWallet';
import { Adjudicator, DrugSearchResult } from '../../api/types';

import { Ionicons, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import DDCMedInfoRow from '../components/ddc/DDCMedInfoRow';
import DDCShareModal from '../components/ddc/DDCShareModal';
import DefaultHeader from '../components/DefaultHeader';
import DDCFaqScreen from './ddc-faq';

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
  const [showBack, setShowBack] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);

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
                    color={Colors.default.neutraldk}
                    onPress={() => {
                      router.push({
                        pathname: '/medication-lookup-selected',
                        params: {
                          drugName: params.drugName,
                          form: params.form,
                          strength: params.strength,
                          quantity: params.quantity,
                          zipCode: params.zipCode,
                          radius: params.radius,
                        },
                      });
                    }}
                  />
                </View>
              </View>
              <Text variant="headlineLarge" style={styles.title}>
                {t('CardHeader')}
              </Text>

              <View style={styles.divider} />

              <View style={styles.medInfoWrapper}>
                <DDCMedInfoRow
                  result={result}
                  form={params.form as string}
                  quantity={params.quantity as string}
                />
              </View>

              <View style={styles.actionRow}>
                <Pressable
                  style={styles.actionButtonCircle}
                  onPress={() => {
                    router.push({
                      pathname: '/ddc-expand',
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
                </Pressable>

                <Pressable
                  style={styles.actionButtonCircle}
                  onPress={() => setIsFavorited(!isFavorited)}
                >
                  <MaterialIcons
                    name={isFavorited ? 'star' : 'star-border'}
                    size={20}
                    color="white"
                  />
                </Pressable>

                <Pressable
                  style={styles.actionButtonCircle}
                  onPress={() => setShowShareModal(true)}
                >
                  <MaterialIcons name="share" size={20} color="white" />
                </Pressable>
              </View>

              <View style={styles.cardContainer}>
                <View style={styles.cardSection}>
                  <View style={styles.cardImageWrapper}>
                    <Image
                      source={
                        showBack
                          ? result.adjudicator === 'DSNT'
                            ? DST_DDCCardBack
                            : ScriptSave_DDCCardBack
                          : result.adjudicator === 'DSNT'
                            ? DST_DDCCardFront
                            : ScriptSave_DDCCardFront
                      }
                      style={styles.cardImage}
                      resizeMode="contain"
                    />
                  </View>
                </View>
              </View>

              <Pressable style={styles.actionButton} onPress={() => setShowBack(!showBack)}>
                {showBack ? (
                  <Text style={styles.buttonText}>{t('ButtonLabel4')}</Text>
                ) : (
                  <Text style={styles.buttonText}>{t('ButtonLabel3')}</Text>
                )}
              </Pressable>

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
        result={result}
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
    paddingHorizontal: 10,
    textAlign: 'left',
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
    color: Colors.default.neutraldk,
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
  actionButtonsWrap: {
    gap: 12,
    marginBottom: 25,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 10,
    justifyContent: 'flex-end',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.default.brandBlue,
    borderRadius: 999,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 40,
  },
  actionButtonCircle: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#236488',
    borderRadius: 28,
  },
  actionButtonFull: {
    width: '100%',
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
    color: Colors.default.neutraldk,
    textDecorationLine: 'underline',
  },
  footerQuestion: {
    color: Colors.default.neutraldk,
    textAlign: 'center',
    fontSize: 13,
    fontFamily: 'Open Sans',
  },
  divider: {
    height: 1,
    backgroundColor: '#C1C7CE',
  },
});
