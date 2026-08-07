// app/_layout.tsx
import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router/react-navigation';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useColorScheme } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { LanguageProvider } from '@/contexts/language-context';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  return (
    <LanguageProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <AnimatedSplashOverlay />
        <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="login" />
        <Stack.Screen name="dashboard" />
        <Stack.Screen name="dashboard_admin" />
        <Stack.Screen name="stories" />
        <Stack.Screen name="upload" />
        <Stack.Screen name="campaigns" />
        <Stack.Screen name="action" />
        <Stack.Screen name="about" />
        <Stack.Screen name="privacy" />
        </Stack>
      </ThemeProvider>
    </LanguageProvider>
  );
}
