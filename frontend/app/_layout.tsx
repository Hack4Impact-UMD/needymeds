import { DefaultTheme as NavigationDefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native';
import {
  MD3DarkTheme as PaperDarkTheme,
  MD3LightTheme as PaperDefaultTheme,
  PaperProvider,
} from 'react-native-paper';

import { Colors, Fonts } from '../constants/theme';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const scheme = useColorScheme();
  const basePaperTheme = scheme === 'dark' ? PaperDarkTheme : PaperDefaultTheme;

  const paperTheme = {
    ...basePaperTheme,
    colors: {
      ...basePaperTheme.colors,
      background: Colors.default.neutrallt,
      primary: Colors.default.primary,
      secondary: Colors.default.secondary,
      onSurface: Colors.default.neutraldk,
      surfaceVariant: Colors.default.neutrallt,
      tertiary: Colors.default.accent,
    },
    fonts: {
      ...basePaperTheme.fonts,
      default: {
        ...basePaperTheme.fonts.default,
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
