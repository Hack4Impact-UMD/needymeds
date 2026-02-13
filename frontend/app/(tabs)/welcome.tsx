import { Colors } from '@/constants/theme';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import {
  Image,
  Linking,
  StyleSheet,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import { Button, Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

const WelcomeScreen = () => {
  const { t, i18n } = useTranslation();
  const { width, height } = useWindowDimensions();

  // Adjust logo size dynamically
  const logoWidth = Math.min(width * 0.7, 270);
  const logoHeight = Math.min(height * 0.25, 220);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={[styles.blueSection, { paddingTop: height * 0.08 }]}>
          <View style={styles.logoContainer}>
            <Image
              source={require('../assets/needymeds_logo.png')}
              style={{ width: logoWidth, height: logoHeight }}
              resizeMode="contain"
            />
          </View>
          <View style={styles.content}>
            <Text variant="headlineMedium" style={styles.title}>
              {t('WelcomeHeader')}
            </Text>
            <Text style={styles.description}>{t('InfoBody')}</Text>
          </View>
        </View>
        <View style={[styles.whiteSection, { paddingTop: height * 0.05 }]}>
          <View style={styles.actions}>
            <View style={styles.primaryButtonWrapper}>
              <Button
                mode="contained"
                onPress={() => router.navigate('/medication-lookup')}
                buttonColor="#236488"
                textColor={Colors.default.neutrallt}
                style={styles.primaryButton}
                contentStyle={styles.primaryButtonContent}
                labelStyle={styles.primaryButtonLabel}
              >
                {t('PrimaryCtaBtnLabel')}
              </Button>
            </View>
            <Text variant="bodySmall" style={styles.secondaryMessage}>
              {t('SecondaryTxt')}
            </Text>
            <TouchableOpacity activeOpacity={0.7}>
              <Text variant="bodySmall" style={styles.languageSwitcher}>
                <Text onPress={() => i18n.changeLanguage('en')}>{t('LangControlEN')}</Text>
                <Text style={styles.languageDivider}> | </Text>
                <Text onPress={() => i18n.changeLanguage('es')}>{t('LangControlES')}</Text>
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.footer}>
            <Text style={styles.footerText}>{t('FooterLinkCopyright')}</Text>
            <View style={styles.footerLinkContainer}>
              <Text
                style={styles.footerLink}
                onPress={() => Linking.openURL('https://www.needymeds.org/terms-and-conditions')}
              >
                {t('FooterLinkTnC')}
              </Text>
              <Text style={styles.footerSeparator}> | </Text>
              <Text
                style={styles.footerLink}
                onPress={() => Linking.openURL('https://www.needymeds.org/privacy-policy')}
              >
                {t('FooterLinkPrivacy')}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default WelcomeScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.default.neutrallt,
  },
  container: {
    flex: 1,
  },
  blueSection: {
    flex: 0.65,
    paddingHorizontal: '5%',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  logoContainer: {
    marginVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: '5%',
  },
  title: {
    textAlign: 'center',
    color: '#181C20',
    fontSize: 28,
    lineHeight: 36,
    fontWeight: '400',
    fontFamily: 'Nunito Sans',
  },
  description: {
    fontFamily: 'Roboto',
    textAlign: 'center',
    lineHeight: 20,
    color: '#181C20',
    fontSize: 14,
    paddingHorizontal: 8,
    letterSpacing: 0.25,
    paddingTop: 10,
  },
  whiteSection: {
    flex: 0.35,
    paddingBottom: 32,
    paddingHorizontal: '5%',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  actions: {
    width: '100%',
    alignItems: 'center',
    gap: 16,
  },
  primaryButtonWrapper: {
    alignSelf: 'center',
  },
  primaryButton: {
    borderRadius: 12,
    alignSelf: 'stretch',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  primaryButtonContent: {
    height: 52,
    justifyContent: 'center',
  },
  primaryButtonLabel: {
    fontFamily: 'Open Sans',
    fontSize: 15,
    fontWeight: '400',
    letterSpacing: 0.3,
    textAlign: 'center',
  },
  secondaryMessage: {
    textAlign: 'center',
    color: '#41484D',
    fontSize: 13,
    maxWidth: '90%',
    lineHeight: 18,
  },
  languageSwitcher: {
    textAlign: 'center',
    color: '#41484D',
    fontWeight: '400',
    fontSize: 14,
  },
  languageDivider: {
    color: '#41484D',
    fontWeight: '400',
  },
  footer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    paddingHorizontal: 16,
  },
  footerText: {
    textAlign: 'center',
    color: '#41484D',
    lineHeight: 18,
    fontSize: 11,
    marginBottom: 4,
  },
  footerLinkContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerSeparator: {
    color: '#41484D',
    fontSize: 11,
  },
  footerLink: {
    color: '#41484D',
    textDecorationLine: 'underline',
    fontSize: 11,
  },
});
