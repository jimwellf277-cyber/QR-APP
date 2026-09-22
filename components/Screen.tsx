import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '@/constants/colors';

export default function Screen({ children, scroll = true }: { children: ReactNode; scroll?: boolean }) {
  return <SafeAreaView style={styles.safe} edges={['top']}><View style={styles.max}>{scroll ? <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">{children}</ScrollView> : <View style={styles.content}>{children}</View>}</View></SafeAreaView>;
}
const styles = StyleSheet.create({ safe: { flex: 1, backgroundColor: COLORS.background }, max: { flex: 1, width: '100%', maxWidth: 720, alignSelf: 'center' }, content: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 20, paddingBottom: 40 } });
