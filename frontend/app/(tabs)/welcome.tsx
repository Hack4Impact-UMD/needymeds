import { Image, StyleSheet, View } from 'react-native';
import { Button, Text, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Colors } from '@/constants/theme';

const WelcomeScreen = () => {
  const theme = useTheme();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Image
          source={require('../assets/needymeds-logo.jpg')}
          style={styles.logo}
          resizeMode="contain"
        />
        <View style={styles.content}>
          <Text variant="headlineMedium" style={styles.title}>
            Welcome to the{'\n'}NeedyMeds App!
          </Text>
          <Text
            variant="bodyMedium"
            style={[styles.description, { color: theme.colors.onSurfaceVariant }]}
          >
            We are a dedicated nonprofit organization committed to improving access to affordable
            healthcare for individuals in need.
          </Text>
        </View>
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
            No sign-up or personal{'\n'}information needed
          </Text>
          <Text variant="bodySmall" style={styles.languageSwitcher}>
            English <Text style={styles.languageDivider}>|</Text> Español
          </Text>
        </View>
        <Text variant="bodySmall" style={styles.footer}>
          Copyright © 2025 by NeedyMeds, Inc. | Terms & Conditions | Privacy Policy
        </Text>
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
    paddingHorizontal: 32,
    paddingTop: 24,
    paddingBottom: 32,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logo: {
    width: 210,
    height: 150,
  },
  content: {
    alignItems: 'center',
    gap: 16,
  },
  title: {
    textAlign: 'center',
    fontWeight: '700',
    color: Colors.default.neutraldk,
  },
  description: {
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 320,
  },
  actions: {
    width: '100%',
    alignItems: 'center',
    gap: 12,
  },
  primaryButtonWrapper: {
    width: '100%',
    maxWidth: 240,
    alignSelf: 'center',
  },
  primaryButton: {
    borderRadius: 12,
    alignSelf: 'stretch',
  },
  primaryButtonContent: {
    height: 48,
    justifyContent: 'center',
  },
  primaryButtonLabel: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.2,
    textDecorationLine: 'underline',
    textAlign: 'center',
  },
  secondaryMessage: {
    textAlign: 'center',
    color: '#6F7787',
  },
  languageSwitcher: {
    textAlign: 'center',
    color: Colors.default.secondary,
    fontWeight: '600',
  },
  languageDivider: {
    color: '#6F7787',
    fontWeight: '400',
  },
  footer: {
    textAlign: 'center',
    color: '#838A9B',
    lineHeight: 18,
    marginTop: 24,
  },
});
