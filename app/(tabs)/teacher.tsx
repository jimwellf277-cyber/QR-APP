import { useCallback, useMemo, useState } from 'react';
import DateTimePicker, { DateTimePickerAndroid, type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { Modal, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import AppButton from '@/components/AppButton';
import Screen from '@/components/Screen';
import { COLORS } from '@/constants/colors';
import { useAuth } from '@/lib/auth';
import { createEvent } from '@/lib/events';
import { getProfile } from '@/lib/profiles';
import { buildQRPayload } from '@/lib/qr';

type PickerTarget = 'start' | 'end';

const formatDate = (value: Date) => value.toLocaleDateString(undefined, { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' });
const formatTime = (value: Date) => value.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });

export default function Teacher() {
  const { user } = useAuth();
  const [allowed, setAllowed] = useState<boolean | null>(null);
  const [title, setTitle] = useState('');
  const [code, setCode] = useState('');
  const [start, setStart] = useState(() => new Date(Date.now() + 5 * 60_000));
  const [end, setEnd] = useState(() => new Date(Date.now() + 65 * 60_000));
  const [picker, setPicker] = useState<PickerTarget | null>(null);
  const [pickerDraft, setPickerDraft] = useState(() => new Date());
  const [payload, setPayload] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useFocusEffect(useCallback(() => {
    let active = true;
    if (user) getProfile(user.id).then((profile) => active && setAllowed(profile?.role === 'teacher')).catch(() => active && setAllowed(false));
    return () => { active = false; };
  }, [user?.id]));

  const eventCode = useMemo(() => code.trim().toUpperCase(), [code]);
  const setDateTime = (target: PickerTarget, value: Date) => {
    if (target === 'start') {
      const duration = Math.max(end.getTime() - start.getTime(), 30 * 60_000);
      setStart(value);
      if (value >= end) setEnd(new Date(value.getTime() + duration));
    } else setEnd(value);
  };

  const openAndroidPicker = (target: PickerTarget) => {
    const current = target === 'start' ? start : end;
    DateTimePickerAndroid.open({
      value: current,
      mode: 'date',
      display: 'default',
      minimumDate: target === 'end' ? start : undefined,
      onChange: (dateEvent: DateTimePickerEvent, pickedDate?: Date) => {
        if (dateEvent.type !== 'set' || !pickedDate) return;
        const combined = new Date(pickedDate);
        combined.setHours(current.getHours(), current.getMinutes(), 0, 0);
        DateTimePickerAndroid.open({
          value: combined,
          mode: 'time',
          display: 'default',
          is24Hour: false,
          onChange: (timeEvent: DateTimePickerEvent, pickedTime?: Date) => {
            if (timeEvent.type !== 'set' || !pickedTime) return;
            combined.setHours(pickedTime.getHours(), pickedTime.getMinutes(), 0, 0);
            setDateTime(target, new Date(combined));
          },
        });
      },
    });
  };

  const openPicker = (target: PickerTarget) => {
    if (Platform.OS === 'android') openAndroidPicker(target);
    else {
      setPickerDraft(new Date(target === 'start' ? start : end));
      setPicker(target);
    }
  };

  const confirmPicker = () => {
    if (picker) setDateTime(picker, pickerDraft);
    setPicker(null);
  };

  const create = async () => {
    setMessage(null); setPayload(null);
    if (!user || !title.trim() || !eventCode) return setMessage('Event title and code are required.');
    if (start >= end) return setMessage('End date and time must be later than the start.');
    setLoading(true);
    const event = { eventId: eventCode, title: title.trim(), start: start.toISOString(), end: end.toISOString(), createdBy: user.id };
    const { error } = await createEvent(event);
    if (error) setMessage(error.message);
    else { setPayload(buildQRPayload(event)); setMessage('Event saved. Students can scan this code.'); }
    setLoading(false);
  };

  if (allowed === null) return <Screen><Text style={styles.subtitle}>Checking teacher access...</Text></Screen>;
  if (!allowed) return <Screen><Text style={styles.title}>Teachers only</Text><Text style={styles.subtitle}>Your account is registered as a student, so event creation is unavailable.</Text></Screen>;

  return <Screen>
    <Text style={styles.title}>Create event</Text>
    <Text style={styles.subtitle}>Save an event to the cloud, then display its QR code for students.</Text>
    <Text style={styles.label}>Event title</Text>
    <TextInput value={title} onChangeText={setTitle} placeholder="Founders Day Assembly" placeholderTextColor={COLORS.textSecondary} style={styles.input} />
    <Text style={styles.label}>Event code</Text>
    <TextInput value={code} onChangeText={setCode} autoCapitalize="characters" placeholder="EVT-2026-0001" placeholderTextColor={COLORS.textSecondary} style={styles.input} />
    <Text style={styles.label}>Attendance window</Text>
    <Text style={styles.helper}>Tap either field to choose both its date and time.</Text>
    <View style={styles.times}>
      <DateTimeField label="Starts" value={start} onPress={() => openPicker('start')} />
      <DateTimeField label="Ends" value={end} onPress={() => openPicker('end')} />
    </View>
    <Modal visible={picker !== null && Platform.OS !== 'android'} transparent animationType="fade" presentationStyle="overFullScreen" onRequestClose={() => setPicker(null)}>
      <View style={styles.modalBackdrop}>
        <View accessibilityViewIsModal style={styles.pickerCard}>
          <View style={styles.pickerHeader}>
            <Pressable accessibilityRole="button" onPress={() => setPicker(null)} style={styles.modalButton}><Text style={styles.cancelText}>Cancel</Text></Pressable>
            <Text style={styles.pickerTitle}>{picker === 'start' ? 'Start' : 'End'} date and time</Text>
            <Pressable accessibilityRole="button" onPress={confirmPicker} style={styles.modalButton}><Text style={styles.doneText}>Done</Text></Pressable>
          </View>
          <DateTimePicker value={pickerDraft} mode="datetime" display={Platform.OS === 'ios' ? 'spinner' : 'default'} minimumDate={picker === 'end' ? start : undefined} themeVariant="light" textColor={COLORS.textPrimary} accentColor={COLORS.primary} onChange={(_, date) => date && setPickerDraft(date)} style={styles.picker} />
          <Text style={styles.pickerPreview}>{formatDate(pickerDraft)} at {formatTime(pickerDraft)}</Text>
        </View>
      </View>
    </Modal>
    <View style={styles.chips}>{[30, 60, 120].map((minutes) => <Pressable key={minutes} accessibilityRole="button" style={({ pressed }) => [styles.chip, pressed && styles.pressed]} onPress={() => setEnd(new Date(start.getTime() + minutes * 60_000))}><Text style={styles.chipText}>+{minutes < 60 ? `${minutes} min` : `${minutes / 60} hr`}</Text></Pressable>)}</View>
    {message && <Text accessibilityRole="alert" style={[styles.message, payload && styles.success]}>{message}</Text>}
    <AppButton theme="primary" title="Create Event & QR" icon="qr-code-outline" onPress={create} loading={loading} />
    {payload && <View style={styles.qr}><QRCode value={payload} size={220} /><Text style={styles.qrTitle}>{title}</Text><Text style={styles.code}>{eventCode}</Text></View>}
  </Screen>;
}

function DateTimeField({ label, value, onPress }: { label: string; value: Date; onPress: () => void }) {
  return <Pressable accessibilityRole="button" accessibilityLabel={`${label}: ${formatDate(value)}, ${formatTime(value)}. Tap to change.`} onPress={onPress} style={({ pressed }) => [styles.time, pressed && styles.pressed]}>
    <View style={styles.fieldIcon}><Ionicons name="calendar-outline" size={24} color={COLORS.textPrimary} /></View>
    <View style={styles.fieldText}><Text style={styles.timeLabel}>{label}</Text><Text style={styles.dateValue}>{formatDate(value)}</Text><View style={styles.timeRow}><Ionicons name="time-outline" size={17} color={COLORS.textSecondary} /><Text style={styles.timeValue}>{formatTime(value)}</Text></View></View>
    <Ionicons name="chevron-forward" size={22} color={COLORS.textSecondary} />
  </Pressable>;
}

const styles = StyleSheet.create({
  title: { color: COLORS.textPrimary, fontSize: 26, fontWeight: '700' },
  subtitle: { color: COLORS.textSecondary, fontSize: 15, lineHeight: 22, marginTop: 6, marginBottom: 18 },
  label: { color: COLORS.textPrimary, fontSize: 15, fontWeight: '700', marginTop: 12, marginBottom: 7 },
  helper: { color: COLORS.textSecondary, fontSize: 14, lineHeight: 20, marginBottom: 10 },
  input: { minHeight: 52, borderWidth: 1, borderColor: COLORS.border, borderRadius: 10, backgroundColor: COLORS.card, paddingHorizontal: 14, fontSize: 16, fontWeight: '500', color: COLORS.textPrimary },
  times: { gap: 10 },
  time: { minHeight: 92, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: COLORS.card, borderWidth: 1.5, borderColor: COLORS.border, borderRadius: 10 },
  fieldIcon: { width: 42, height: 42, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.surface },
  fieldText: { flex: 1 },
  timeLabel: { color: COLORS.textSecondary, fontSize: 13, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  dateValue: { color: COLORS.textPrimary, fontSize: 17, lineHeight: 24, fontWeight: '700', marginTop: 3 },
  timeRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 2 },
  timeValue: { color: COLORS.textSecondary, fontSize: 16, lineHeight: 22, fontWeight: '600', fontVariant: ['tabular-nums'] },
  modalBackdrop: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: 'rgba(43, 33, 18, 0.55)' },
  pickerCard: { width: '100%', maxWidth: 440, alignSelf: 'center', padding: 12, backgroundColor: COLORS.card, borderWidth: 1.5, borderColor: COLORS.primary, borderRadius: 16 },
  pickerHeader: { minHeight: 52, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: COLORS.border },
  pickerTitle: { flex: 1, color: COLORS.textPrimary, fontSize: 15, fontWeight: '700', textAlign: 'center' },
  modalButton: { minWidth: 64, minHeight: 48, alignItems: 'center', justifyContent: 'center' },
  cancelText: { color: COLORS.textSecondary, fontSize: 16, fontWeight: '700' },
  doneText: { color: COLORS.textPrimary, fontSize: 16, fontWeight: '800' },
  picker: { alignSelf: 'stretch' },
  pickerPreview: { color: COLORS.textPrimary, fontSize: 16, lineHeight: 22, fontWeight: '700', textAlign: 'center', paddingVertical: 10, borderTopWidth: 1, borderTopColor: COLORS.border },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginVertical: 12 },
  chip: { minHeight: 46, paddingHorizontal: 14, justifyContent: 'center', backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, borderRadius: 10 },
  chipText: { color: COLORS.textPrimary, fontSize: 15, fontWeight: '700' },
  pressed: { opacity: 0.68 },
  message: { color: COLORS.danger, fontSize: 15, fontWeight: '600', marginVertical: 10, lineHeight: 22 },
  success: { color: COLORS.success },
  qr: { alignItems: 'center', marginTop: 24, padding: 24, borderWidth: 1, borderColor: COLORS.border, borderRadius: 10, backgroundColor: COLORS.card },
  qrTitle: { color: COLORS.textPrimary, fontSize: 18, fontWeight: '700', marginTop: 16, textAlign: 'center' },
  code: { color: COLORS.textSecondary, fontSize: 14, fontWeight: '600', marginTop: 4 },
});
