import { router } from 'expo-router';

import { useTranslation } from 'react-i18next';
import { Linking, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Card } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors } from '@/constants/theme';
import BottomNavBar from '../components/BottomNavBar';
import DefaultHeader from '../components/DefaultHeader';

const BRAND_BLUE = '#236488';
const NM_BASE = 'https://www.needymeds.org';

const MORE_INFO_LINKS: { labelKey: string; url: string }[] = [
  { labelKey: 'AboutLinkContactUs', url: `${NM_BASE}/about-us/contact-needymeds/` },
  { labelKey: 'AboutLinkSupporters', url: `${NM_BASE}/about-us/our-supporters/` },
  { labelKey: 'AboutLinkHistory', url: `${NM_BASE}/about-us/needymeds-history/` },
  { labelKey: 'AboutLinkAdPolicy', url: `${NM_BASE}/about-us/advertisement-editorial-policy/` },
  { labelKey: 'AboutLinkStaff', url: `${NM_BASE}/about-us/staff-profiles/` },
  { labelKey: 'AboutLinkAnnualReport', url: `${NM_BASE}/about-us/needymeds-annual-report/` },
  { labelKey: 'AboutLinkBoard', url: `${NM_BASE}/about-us/board-of-directors/` },
  { labelKey: 'AboutLinkFinancial', url: `${NM_BASE}/about-us/needymeds-financial-information/` },
  { labelKey: 'AboutLinkAdvisory', url: `${NM_BASE}/about-us/advisory-panel/` },
  { labelKey: 'AboutLinkNews', url: `${NM_BASE}/about-us/news/` },
  { labelKey: 'AboutLinkPrivacy', url: `${NM_BASE}/about-us/privacy-statement/` },
  { labelKey: 'AboutLinkFAQ', url: `${NM_BASE}/faq/` },
  { labelKey: 'AboutLinkCommunity', url: `${NM_BASE}/about-us/community-guidelines/` },
  { labelKey: 'AboutLinkDonate', url: `${NM_BASE}/donate/` },
];

const AboutNeedyMeds = () => {
  const { t } = useTranslation();

  const handleLink = (url: string) => {
    Linking.openURL(url);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* HEADER */}
        <DefaultHeader />

        <Pressable
          onPress={() => router.back()}
          hitSlop={10}
          style={styles.backButton}
          accessibilityRole="button"
          accessibilityLabel={t('arrow_backIcon')}
        >
          <MaterialCommunityIcons name="arrow-left" size={28} color="#41484D" />
        </Pressable>

        {/* TITLE */}
        <Text style={styles.title}>{t('AboutTitle')}</Text>

        {/* Info card */}
        <Card style={styles.infoCard}>
          <View style={styles.infoCardInner}>
            <Text style={styles.infoCardText}>{t('AboutDescription')}</Text>
          </View>
        </Card>

        {/* Mission Statement */}
        <View style={styles.statementRow}>
          <MaterialCommunityIcons name="account-group" color={BRAND_BLUE} size={24} />
          <Text style={styles.statementText}>
            <Text style={styles.statementLabel}>{t('AboutMissionLabel')} </Text>
            {t('AboutMissionBody')}
          </Text>
        </View>

        {/* Vision Statement */}
        <View style={styles.statementRow}>
          <MaterialCommunityIcons name="shield-plus-outline" color={BRAND_BLUE} size={24} />
          <Text style={styles.statementText}>
            <Text style={styles.statementLabel}>{t('AboutVisionLabel')} </Text>
            {t('AboutVisionBody')}
          </Text>
        </View>

        {/* How We Do It */}
        <View style={styles.statementRow}>
          <MaterialCommunityIcons name="bandage" color={BRAND_BLUE} size={24} />
          <Text style={styles.statementText}>
            <Text style={styles.statementLabel}>{t('AboutHowLabel')} </Text>
            {t('AboutHowBody')}
          </Text>
        </View>

        {/* More Information */}
        <Text style={styles.moreInfoHeader}>{t('AboutMoreInfo')}</Text>

        <Card style={styles.linksCard}>
          <View style={styles.linksGrid}>
            {MORE_INFO_LINKS.map((link, index) => (
              <Pressable
                key={link.labelKey}
                style={styles.linkItem}
                onPress={() => handleLink(link.url)}
                hitSlop={4}
              >
                <Text style={styles.linkBullet}>{'\u2022'}</Text>
                <Text style={styles.linkText}>{t(link.labelKey)}</Text>
              </Pressable>
            ))}
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
    paddingBottom: Platform.OS === 'ios' ? 84 : 68,
    paddingLeft: 20,
  },
  backButton: {
    marginBottom: 4,
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
  infoCard: {
    marginVertical: 8,
    width: '100%',
    backgroundColor: '#D6E8F6',
    borderRadius: 12,
  },
  infoCardInner: {
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  infoCardText: {
    fontSize: 14,
    color: '#181C20',
    fontFamily: 'Open Sans',
    lineHeight: 20,
  },
  statementRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginTop: 16,
  },
  statementText: {
    flex: 1,
    fontSize: 14,
    color: '#181C20',
    fontFamily: 'Open Sans',
    lineHeight: 20,
  },
  statementLabel: {
    fontWeight: '700',
  },
  moreInfoHeader: {
    fontSize: 18,
    fontWeight: '600',
    color: '#181C20',
    fontFamily: 'Open Sans',
    marginTop: 24,
    marginBottom: 10,
  },
  linksCard: {
    width: '100%',
    backgroundColor: '#D6E8F6',
    borderRadius: 12,
    marginBottom: 16,
  },
  linksGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  linkItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    width: '50%',
    paddingVertical: 6,
    paddingRight: 8,
  },
  linkBullet: {
    fontSize: 14,
    color: '#181C20',
    marginRight: 6,
    lineHeight: 20,
  },
  linkText: {
    fontSize: 13,
    color: BRAND_BLUE,
    fontFamily: 'Open Sans',
    lineHeight: 20,
    flex: 1,
  },
});

export default AboutNeedyMeds;
