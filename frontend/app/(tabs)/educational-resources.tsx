import { router } from 'expo-router';

import { useTranslation } from 'react-i18next';
import {
  Image,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Card } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors } from '@/constants/theme';
import BottomNavBar from '../components/BottomNavBar';
import DefaultHeader from '../components/DefaultHeader';

const v_logo = require('../assets/vertical_logo.png');
const BRAND_BLUE = '#236488';

const EducationScreen = () => {
  const { t } = useTranslation();

  const coupon_faq_url = 'https://www.needymeds.org/copay-cards-faqs';
  const nm_url = 'https://needymeds.org/';
  const about_us_url = 'https://needymeds.org/about-us/';
  const nm_phone = '(800) 503-6897';
  const nm_phone_tel = 'tel:8005036897';

  const handleLink = (url: string) => {
    Linking.openURL(url);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* HEADER */}
        <DefaultHeader />

        {/* TITLE */}
        <Text style={styles.title}>{t('Header2')}</Text>

        {/* NeedyMeds website card (top) */}
        <Card style={styles.websiteCard} onPress={() => handleLink(nm_url)}>
          <View style={styles.websiteCardInner}>
            <Image source={v_logo} style={styles.websiteLogo} resizeMode="contain" />
            <View style={styles.websiteTextCol}>
              <Text style={styles.websiteTitle}>{t('Card3')}</Text>
              <Text style={styles.websiteLine}>
                {t('WebsiteLabel')} <Text style={styles.websiteLink}>https://needymeds.org/</Text>
              </Text>
              <Text style={styles.websiteLine}>
                {t('NumberLabel')}{' '}
                <Text style={styles.websiteLink} onPress={() => handleLink(nm_phone_tel)}>
                  {nm_phone}
                </Text>
              </Text>
            </View>
          </View>
        </Card>

        {/* About us */}
        <View style={styles.sectionHeader}>
          <MaterialCommunityIcons name="account-multiple-outline" color={BRAND_BLUE} size={30} />
          <Text style={styles.sectionHeaderText}>{t('AboutUsHeader')}</Text>
        </View>
        <Card style={styles.cards} onPress={() => handleLink(about_us_url)}>
          <View style={styles.linkCardInner}>
            <Text style={styles.linkCardBody}>{t('AboutUsBody')}</Text>
            <Pressable onPress={() => handleLink(about_us_url)} hitSlop={10}>
              <Text style={styles.linkCardLink}>
                {t('ClickHereToLearnMore')} <Text style={styles.linkArrow}>{'>'}</Text>
              </Text>
            </Pressable>
          </View>
        </Card>

        {/* Prescription savings tips */}
        <View style={styles.sectionHeader}>
          <MaterialCommunityIcons name="piggy-bank-outline" color={BRAND_BLUE} size={30} />
          <Text style={styles.sectionHeaderText}>{t('Header3')}</Text>
        </View>
        <Card style={styles.cards} onPress={() => router.push('/(tabs)/prescription-savings-tips')}>
          <View style={styles.linkCardInner}>
            <Text style={styles.linkCardBody}>{t('PrescriptionSavingsTipsBody')}</Text>
            <Pressable
              onPress={() => router.push('/(tabs)/prescription-savings-tips')}
              hitSlop={10}
            >
              <Text style={styles.linkCardLink}>
                {t('ClickHereToLearnMore')} <Text style={styles.linkArrow}>{'>'}</Text>
              </Text>
            </Pressable>
          </View>
        </Card>

        {/* Manufacturer coupon FAQ */}
        <View style={styles.sectionHeader}>
          <MaterialCommunityIcons name="view-dashboard-outline" color={BRAND_BLUE} size={30} />
          <Text style={styles.sectionHeaderText}>{t('Card2')}</Text>
        </View>
        <Card style={styles.cards} onPress={() => handleLink(coupon_faq_url)}>
          <View style={styles.linkCardInner}>
            <Text style={styles.linkCardBody}>{t('ManufacturerCouponFaqBody')}</Text>
            <Pressable onPress={() => handleLink(coupon_faq_url)} hitSlop={10}>
              <Text style={styles.linkCardLink}>
                {t('ClickHereToLearnMore')} <Text style={styles.linkArrow}>{'>'}</Text>
              </Text>
            </Pressable>
          </View>
        </Card>
      </ScrollView>
      <BottomNavBar />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.default.neutrallt,
  },
  container: {
    paddingTop: 20,
    paddingRight: 20,
    paddingBottom: Platform.OS === 'ios' ? 84 : 68, // bottom navbar height
    paddingLeft: 20,
  },
  title: {
    paddingHorizontal: 40,
    textAlign: 'center',
    fontSize: 32,
    fontWeight: '400',
    color: '#181C20',
    fontFamily: 'Nunito Sans',
    marginBottom: 20,
  },
  websiteCard: {
    marginVertical: 8,
    width: '100%',
    backgroundColor: '#F1F4F9',
    fontFamily: 'Open Sans',
    borderRadius: 12,
  },
  websiteCardInner: {
    flexDirection: 'row',
    gap: 14,
    paddingVertical: 16,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  websiteLogo: {
    width: 44,
    height: 44,
  },
  websiteTextCol: {
    flex: 1,
    gap: 6,
  },
  websiteTitle: {
    fontSize: 14,
    color: '#181C20',
    fontFamily: 'Open Sans',
    fontWeight: '600',
  },
  websiteLine: {
    fontSize: 13,
    color: '#181C20',
    fontFamily: 'Open Sans',
  },
  websiteLink: {
    textDecorationLine: 'underline',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 14,
    marginBottom: 6,
  },
  sectionHeaderText: {
    fontSize: 20,
    color: '#181C20',
    fontFamily: 'Open Sans',
    fontWeight: '600',
  },
  cards: {
    marginVertical: 8,
    width: '100%',
    backgroundColor: '#F1F4F9',
    fontFamily: 'Open Sans',
    borderRadius: 12,
  },
  linkCardInner: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    gap: 10,
  },
  linkCardBody: {
    fontSize: 14,
    color: '#181C20',
    fontFamily: 'Open Sans',
    lineHeight: 20,
  },
  linkCardLink: {
    fontSize: 14,
    fontFamily: 'OpenSans-SemiBold',
    color: BRAND_BLUE,
  },
  linkArrow: {
    fontWeight: '700',
  },
});

export default EducationScreen;
