import { useState } from 'react';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import AppButton from '@/components/AppButton';
import { COLORS } from '@/constants/colors';
import { useAuth } from '@/lib/auth';
import { registerAttendance } from '@/lib/attendance';

export default function Scan() {
  const { user } = useAuth(); const [permission, requestPermission] = useCameraPermissions(); const [scanned, setScanned] = useState(false); const [busy, setBusy] = useState(false); const [message, setMessage] = useState<string | null>(null); const [success, setSuccess] = useState(false);
  const onScan = async ({ data }: { data: string }) => { if (scanned || busy || !user) return; setScanned(true); setBusy(true); const result = await registerAttendance(data, user.id); setSuccess(result.success); setMessage(result.eventTitle ? `${result.message}\n${result.eventTitle}` : result.message); setBusy(false); };
  if (!permission) return <View style={styles.center}><Text style={styles.body}>Checking camera permission...</Text></View>;
  if (!permission.granted) return <View style={styles.permission}><Ionicons name="camera-outline" size={42} color={COLORS.primary} /><Text style={styles.title}>Camera access needed</Text><Text style={styles.body}>Allow camera access so the app can scan event QR codes.</Text><AppButton theme="primary" title="Grant Permission" icon="camera-outline" onPress={requestPermission} /></View>;
  return <View style={styles.container}><CameraView style={StyleSheet.absoluteFill} facing="back" barcodeScannerSettings={{ barcodeTypes: ['qr'] }} onBarcodeScanned={scanned ? undefined : onScan} /><View style={styles.guide}><View style={styles.frame} /></View><View style={styles.panel}><Text style={styles.panelTitle}>{busy ? 'Checking attendance...' : message ? (success ? 'Attendance verified' : 'Unable to register') : 'Align the event QR code'}</Text><Text accessibilityRole={message ? 'alert' : undefined} style={[styles.message, message && (success ? styles.good : styles.bad)]}>{message ?? 'Hold the code inside the frame. Scanning happens automatically.'}</Text>{scanned && <AppButton theme="primary" title="Scan Again" icon="scan-outline" disabled={busy} onPress={() => { setScanned(false); setMessage(null); }} />}</View></View>;
}
const styles = StyleSheet.create({ container: { flex: 1, backgroundColor: '#000' }, center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.background }, permission: { flex: 1, justifyContent: 'center', padding: 24, gap: 12, backgroundColor: COLORS.background }, title: { color: COLORS.textPrimary, fontSize: 24, fontWeight: '700' }, body: { color: COLORS.textSecondary, fontSize: 16, lineHeight: 23 }, guide: { flex: 1, alignItems: 'center', justifyContent: 'center' }, frame: { width: 240, height: 240, borderRadius: 16, borderWidth: 3, borderColor: COLORS.textOnPrimary, backgroundColor: 'transparent' }, panel: { backgroundColor: COLORS.card, padding: 20, borderTopLeftRadius: 16, borderTopRightRadius: 16 }, panelTitle: { color: COLORS.textPrimary, fontSize: 19, fontWeight: '700' }, message: { color: COLORS.textSecondary, fontSize: 15, lineHeight: 22, marginTop: 6, marginBottom: 8 }, good: { color: COLORS.success }, bad: { color: COLORS.danger } });
