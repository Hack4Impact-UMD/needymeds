import { router } from 'expo-router';

import { useTranslation } from 'react-i18next';
import { Image, Linking, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Card, Divider, Icon, IconButton } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors } from '@/constants/theme';
import BottomNavBar from '../components/BottomNavBar';
import DefaultHeader from '../components/DefaultHeader';

const v_logo = require('../assets/vertical_logo.png');

const EducationScreen = () => {
  const { t } = useTranslation();

  const general_faq_url = 'https://needymeds.org/faq';
  const coupon_faq_url = 'https://www.needymeds.org/copay-cards-faqs';
  const nm_url = 'https://needymeds.org/';

  const handleLink = (url: string) => {
    Linking.openURL(url);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* HEADER */}
        <DefaultHeader />

        {/* TITLE */}
        <Text style={styles.title}>{t('Header2')}</Text>

        {/* description + left icon */}
        <View style={styles.subtitle}>
          <Icon source="book-open-page-variant-outline" color="#41484D" size={30} />
          <Text style={styles.description}>{t('Text13')}</Text>
        </View>

        {/* saving tips card */}
        <Card style={styles.cards}>
          <Card.Title
            title={t('Header3')}
            subtitle={
              <Text onPress={() => router.push('/(tabs)/prescription-savings-tips')}>
                {t('CardSecondaryLine1')}
              </Text>
            }
            left={() => <Icon source="piggy-bank-outline" color="#41484D" size={40} />}
            style={styles.title_cards}
            titleStyle={{ marginBottom: -2 }}
            subtitleStyle={{ letterSpacing: 0.5 }}
          />
        </Card>

        {/* FAQ cards */}
        <Card style={styles.cards}>
          <Card.Title
            title={t('FAQ')}
            subtitle={t('CardSecondaryLine2')}
            left={() => <Icon source="help-circle-outline" color="#41484D" size={40} />}
            style={styles.grouped_cards}
            titleStyle={{ marginBottom: -2 }}
            subtitleStyle={{ letterSpacing: 0.5 }}
          />
          <Divider style={{ marginHorizontal: 16 }} />
          <Card.Title
            title={t('Card')}
            subtitle={t('CardSecondaryLine3')}
            left={() => <Icon source="forum-outline" color="#41484D" size={40} />}
            right={() => (
              <IconButton
                icon="menu-right"
                iconColor="#181C20"
                size={25}
                onPress={() => handleLink(general_faq_url)}
              />
            )}
            style={styles.grouped_cards}
            titleStyle={{ marginBottom: -2 }}
            subtitleStyle={{ letterSpacing: 0.5 }}
          />
          <Divider style={{ marginHorizontal: 16 }} />
          <Card.Title
            title={t('Card2')}
            subtitle={t('CardSecondaryLine3')}
            left={() => <Icon source="currency-usd-off" color="#41484D" size={40} />}
            right={() => (
              <IconButton
                icon="menu-right"
                iconColor="#181C20"
                size={25}
                onPress={() => handleLink(coupon_faq_url)}
              />
            )}
            style={styles.grouped_cards}
            titleStyle={{ marginBottom: -2 }}
            subtitleStyle={{ letterSpacing: 0.5 }}
          />
        </Card>

        {/* NeedyMeds website card */}
        <Card style={styles.cards} onPress={() => handleLink(nm_url)}>
          <Card.Title
            title={t('Card3')}
            subtitle="https://needymeds.org/"
            left={() => <Image source={v_logo} style={{ width: 40 }} resizeMode="contain" />}
            style={styles.title_cards}
            titleNumberOfLines={2}
            subtitleStyle={{ textDecorationLine: 'underline', letterSpacing: 0.5 }}
          />
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
  subtitle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 12,
    paddingBottom: 20,
    fontFamily: 'Open Sans',
  },
  description: {
    fontSize: 14,
    color: '#181C20',
    paddingLeft: 15,
    fontFamily: 'Open Sans',
  },
  cards: {
    marginVertical: 8,
    width: '100%',
    backgroundColor: '#F1F4F9',
    fontFamily: 'Open Sans',
  },
  title_cards: {
    height: 100,
  },
  grouped_cards: {
    paddingVertical: 12,
  },
});

export default EducationScreen;
