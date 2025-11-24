import { Colors } from '@/constants/theme';
import { router } from 'expo-router';
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Button, Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

const WelcomeScreen = () => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.blueSection}>
          <View style={styles.logoContainer}>
            <Image
              source={require('../assets/needymeds_logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
          <View style={styles.content}>
            <Text variant="headlineMedium" style={styles.title}>
              Welcome to the{'\n'}NeedyMeds App!
            </Text>
            <Text style={styles.description}>
              We are a dedicated nonprofit{'\n'}
              organization committed to improving{'\n'}
              access to affordable healthcare for{'\n'}
              individuals in need.
            </Text>
          </View>
        </View>
        <View style={styles.whiteSection}>
          <View style={styles.actions}>
            <View style={styles.primaryButtonWrapper}>
              <Button
                mode="contained"
                onPress={() => router.navigate('/search')}
                buttonColor="#236488"
                textColor={Colors.default.neutrallt}
                style={styles.primaryButton}
                contentStyle={styles.primaryButtonContent}
                labelStyle={styles.primaryButtonLabel}
              >
                Continue Anonymously
              </Button>
            </View>
            <Text variant="bodySmall" style={styles.secondaryMessage}>
              No sign-up or personal information needed
            </Text>
            <TouchableOpacity activeOpacity={0.7}>
              <Text variant="bodySmall" style={styles.languageSwitcher}>
                English <Text style={styles.languageDivider}>|</Text> Español
              </Text>
            </TouchableOpacity>
          </View>
          <Text variant="bodySmall" style={styles.footer}>
            Copyright © 2025 by NeedyMeds, Inc.{'\n'}Terms & Conditions | Privacy Policy
          </Text>
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
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  logoContainer: {
    marginTop: 20,
    marginBottom: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 270,
    height: 220,
  },
  content: {
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: 19,
  },
  title: {
    textAlign: 'center',
    fontWeight: 400,
    color: '#181C20',
    fontSize: 28,
    lineHeight: 36,
    fontFamily: 'Nunito Sans',
  },
  description: {
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 412,
    color: '#181C20',
    fontSize: 14,
    paddingHorizontal: 8,
    fontFamily: 'Roboto',
    letterSpacing: 0.25,
    paddingTop: 10,
  },
  whiteSection: {
    flex: 0.35,
    paddingTop: 40,
    paddingBottom: 32,
    paddingHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  actions: {
    width: '100%',
    alignItems: 'center',
    gap: 16,
  },
  primaryButtonWrapper: {
    width: '100%',
    maxWidth: 220,
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
    fontSize: 16,
    fontWeight: '400',
    letterSpacing: 0.3,
    textAlign: 'center',
  },
  secondaryMessage: {
    textAlign: 'center',
    color: '#6F7787',
    fontSize: 13,
    maxWidth: 280,
    lineHeight: 18,
  },
  languageSwitcher: {
    textAlign: 'center',
    color: Colors.default.secondary,
    fontWeight: '400',
    fontSize: 14,
    paddingVertical: 8,
  },
  languageDivider: {
    color: '#6F7787',
    fontWeight: '400',
  },
  footer: {
    textAlign: 'center',
    color: '#838A9B',
    lineHeight: 18,
    fontSize: 11,
    marginTop: 16,
    paddingHorizontal: 16,
  },
});
