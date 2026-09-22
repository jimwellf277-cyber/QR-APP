import { useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import AppButton from '@/components/AppButton';
import Header from '@/components/Header';
import Screen from '@/components/Screen';
import { COLORS } from '@/constants/colors';

export default function Home() { const router = useRouter(); return <Screen><Header title="QR Attendance" /><View style={styles.hero}><Text style={styles.title}>School event attendance</Text><Text style={styles.subtitle}>Scan in quickly, review your history, or create a teacher event.</Text></View><View style={styles.actions}><AppButton theme="primary" title="Scan QR Code" icon="qr-code-outline" onPress={() => router.push('/scan')} /><AppButton title="Attendance History" icon="time-outline" onPress={() => router.push('/history')} /><AppButton title="My Profile" icon="person-outline" onPress={() => router.push('/profile')} /></View></Screen>; }
const styles = StyleSheet.create({ hero: { marginTop: 42 }, title: { color: COLORS.textPrimary, fontSize: 24, fontWeight: '700' }, subtitle: { color: COLORS.textSecondary, fontSize: 16, lineHeight: 24, marginTop: 8, maxWidth: 480 }, actions: { marginTop: 'auto', paddingTop: 40 } });
