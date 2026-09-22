import { Redirect, Stack, useSegments } from 'expo-router';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { COLORS } from '@/constants/colors';
import { useAuth } from '@/lib/auth';

export default function RootLayout() {
  const { session, loading } = useAuth();
  const segments = useSegments();
  if (loading) return <View style={styles.loading}><ActivityIndicator size="large" color={COLORS.primary} /></View>;
  const path = segments[0];
  const inAuth = path === 'login' || path === 'register';
  const inTabs = path === '(tabs)';
  return <Stack screenOptions={{ headerShown: false }}>
    {!session && inTabs && <Redirect href="/login" />}
    {session && inAuth && <Redirect href="/(tabs)" />}
    <Stack.Screen name="index" /><Stack.Screen name="login" /><Stack.Screen name="register" /><Stack.Screen name="(tabs)" /><Stack.Screen name="+not-found" />
  </Stack>;
}
const styles = StyleSheet.create({ loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.background } });
