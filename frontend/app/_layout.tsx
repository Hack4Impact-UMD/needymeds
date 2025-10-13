import { DefaultTheme as NavigationDefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { MD3LightTheme as PaperDefaultTheme, PaperProvider } from 'react-native-paper';

import { Colors, Fonts } from '../constants/theme';

export const unstable_settings = {
  anchor: '(tabs)',
};

const paperTheme = {
  ...PaperDefaultTheme,
  colors: {
    ...PaperDefaultTheme.colors,
    background: Colors.default.neutrallt,
    primary: Colors.default.primary,
    secondary: Colors.default.secondary,
    onSurface: Colors.default.neutraldk,
    surfaceVariant: Colors.default.neutrallt,
    tertiary: Colors.default.accent,
  },
  fonts: {
    ...PaperDefaultTheme.fonts,
    default: {
      ...PaperDefaultTheme.fonts.default,
      fontFamily: Fonts.sans,
    },
  },
};

const navigationTheme = {
  ...NavigationDefaultTheme,
  colors: {
    ...NavigationDefaultTheme.colors,
    background: Colors.default.neutrallt,
    primary: Colors.default.primary,
    text: Colors.default.neutraldk,
    card: Colors.default.neutrallt,
    border: Colors.default.secondary,
    notification: Colors.default.accent,
  },
};

export default function RootLayout() {
  return (
    <PaperProvider theme={paperTheme}>
      <ThemeProvider value={navigationTheme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </PaperProvider>
  );
}
