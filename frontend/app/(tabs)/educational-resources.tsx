import { router } from 'expo-router';

import { MaterialCommunityIcons } from '@expo/vector-icons';
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
import { Card } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors } from '@/constants/theme';
import BottomNavBar from '../components/BottomNavBar';
import DefaultHeader from '../components/DefaultHeader';

const v_logo = require('../assets/vertical_logo.png');

const EducationScreen = () => {
  const { t } = useTranslation();

  const coupon_faq_url = 'https://www.needymeds.org/copay-cards-faqs';
  const nm_url = 'https://needymeds.org/';
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
        <Card style={styles.websiteCard} onPress={() => handleLink(nm_url)} elevation={0}>
          <View style={styles.websiteCardInner}>
            <Image source={v_logo} style={styles.websiteLogo} resizeMode="contain" />
            <View style={styles.websiteTextCol}>
              <Text style={styles.websiteTitle}>{t('Card3')}</Text>
              <Text style={styles.websiteLine}>
                {t('WebsiteLabel')} <Text style={styles.websiteLink}>{nm_url}</Text>
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
          <MaterialCommunityIcons
            name="account-multiple-outline"
            color={Colors.default.brandBlue}
            size={30}
          />
          <Text style={styles.sectionHeaderText}>{t('AboutUsHeader')}</Text>
        </View>
        <Card
          style={styles.cards}
          onPress={() => router.push('/(tabs)/about-needymeds')}
          elevation={0}
        >
          <View style={styles.linkCardInner}>
            <Text style={styles.linkCardBody}>{t('AboutUsBody')}</Text>
            <Pressable onPress={() => router.push('/(tabs)/about-needymeds')} hitSlop={10}>
              <Text style={styles.linkCardLink}>
                {t('ClickHereToLearnMore')} <Text style={styles.linkArrow}> ➤</Text>
              </Text>
            </Pressable>
          </View>
        </Card>

        {/* Prescription savings tips */}
        <View style={styles.sectionHeader}>
          <MaterialCommunityIcons
            name="piggy-bank-outline"
            color={Colors.default.brandBlue}
            size={30}
          />
          <Text style={styles.sectionHeaderText}>{t('Header3')}</Text>
        </View>
        <Card
          style={styles.cards}
          onPress={() => router.push('/(tabs)/prescription-savings-tips')}
          elevation={0}
        >
          <View style={styles.linkCardInner}>
            <Text style={styles.linkCardBody}>{t('PrescriptionSavingsTipsBody')}</Text>
            <Pressable
              onPress={() => router.push('/(tabs)/prescription-savings-tips')}
              hitSlop={10}
            >
              <Text style={styles.linkCardLink}>
                {t('ClickHereToLearnMore')} <Text style={styles.linkArrow}> ➤</Text>
              </Text>
            </Pressable>
          </View>
        </Card>

        {/* Manufacturer coupon FAQ */}
        <View style={styles.sectionHeader}>
          <MaterialCommunityIcons
            name="view-dashboard-outline"
            color={Colors.default.brandBlue}
            size={30}
          />
          <Text style={styles.sectionHeaderText}>{t('Card2')}</Text>
        </View>
        <Card style={styles.cards} onPress={() => handleLink(coupon_faq_url)} elevation={0}>
          <View style={styles.linkCardInner}>
            <Text style={styles.linkCardBody}>{t('ManufacturerCouponFaqBody')}</Text>
            <Pressable onPress={() => handleLink(coupon_faq_url)} hitSlop={10}>
              <Text style={styles.linkCardLink}>
                {t('ClickHereToLearnMore')} <Text style={styles.linkArrow}> ➤</Text>
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
    paddingHorizontal: 10,
    textAlign: 'center',
    fontSize: 30,
    fontWeight: '400',
    color: Colors.default.neutraldk,
    fontFamily: 'Nunito Sans',
    marginBottom: 20,
  },
  websiteCard: {
    marginVertical: 8,
    width: '100%',
    backgroundColor: Colors.default.neutrallt,
    fontFamily: 'Open Sans',
    borderRadius: 12,
    borderColor: '#C1C7CE',
    borderWidth: 1,
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
    gap: 2,
  },
  websiteTitle: {
    marginBottom: 3,
    fontSize: 15,
    color: Colors.default.neutraldk,
    fontFamily: 'Open Sans',
    fontWeight: '400',
  },
  websiteLine: {
    fontSize: 13,
    color: Colors.default.neutraldk,
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
    fontSize: 16,
    color: Colors.default.neutraldk,
    fontFamily: 'Open Sans',
    fontWeight: '400',
  },
  cards: {
    marginVertical: 8,
    width: '100%',
    backgroundColor: Colors.default.neutrallt,
    fontFamily: 'Open Sans',
    borderRadius: 12,
    borderColor: '#C1C7CE',
    borderWidth: 1,
  },
  linkCardInner: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    gap: 10,
  },
  linkCardBody: {
    fontSize: 15,
    color: Colors.default.neutraldk,
    fontFamily: 'Open Sans',
    lineHeight: 20,
  },
  linkCardLink: {
    fontSize: 14,
    fontFamily: 'OpenSans',
    fontWeight: '700',
    color: Colors.default.brandBlue,
  },
  linkArrow: {
    fontWeight: '700',
  },
});

export default EducationScreen;
