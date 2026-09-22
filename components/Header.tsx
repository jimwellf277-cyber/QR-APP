import { MaterialIcons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { COLORS } from '@/constants/colors';

export default function Header({ title }: { title: string }) {
  return <View style={styles.wrap}><View style={styles.logo}><MaterialIcons name="qr-code-scanner" size={38} color={COLORS.primary} /></View><Text style={styles.title}>{title}</Text></View>;
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'flex-start', gap: 10 },
  logo: { width: 64, height: 64, borderRadius: 10, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, alignItems: 'center', justifyContent: 'center' },
  title: { color: COLORS.textPrimary, fontSize: 22, fontWeight: '700' },
});
