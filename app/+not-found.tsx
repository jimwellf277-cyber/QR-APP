import { Link } from 'expo-router';
import { StyleSheet, Text } from 'react-native';
import Screen from '@/components/Screen';
import { COLORS } from '@/constants/colors';
export default function NotFound() { return <Screen><Text style={styles.title}>Page not found</Text><Text style={styles.body}>The page you requested does not exist.</Text><Link href="/" style={styles.link}>Return home</Link></Screen>; }
const styles = StyleSheet.create({ title: { fontSize: 28, fontWeight: '700', color: COLORS.textPrimary, marginTop: 48 }, body: { fontSize: 16, color: COLORS.textSecondary, marginTop: 8, marginBottom: 24 }, link: { color: COLORS.primary, fontWeight: '700', fontSize: 16 } });
