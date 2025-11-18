import { Colors } from '@/constants/theme';
import { StyleSheet, View } from 'react-native';
import { Button, Text, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

const DST = () => {
  const theme = useTheme();
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.content}>
          <Text variant="headlineMedium" style={styles.title}>
            Welcome to the{'\n'}DST App!
          </Text>
          <Text
            variant="bodyMedium"
            style={[styles.description, { color: theme.colors.onSurfaceVariant }]}
          >
            This is a dedicated app for DST users to access their services easily.
          </Text>
        </View>
        <View style={styles.actions}>
          <View style={styles.primaryButtonWrapper}>
            <Button
              mode="contained"
              buttonColor="#236488"
              textColor={Colors.default.neutrallt}
              style={styles.primaryButton}
              contentStyle={styles.primaryButtonContent}
              labelStyle={styles.primaryButtonLabel}
            >
              Continue to DST Services
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
          © {new Date().getFullYear()} DST App
        </Text>
      </View>
    </SafeAreaView>
  );
};

export default DST;

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
