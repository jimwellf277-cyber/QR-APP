import { useCallback, useState } from 'react';
import { useFocusEffect, useRouter } from 'expo-router';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import AppButton from '@/components/AppButton';
import Screen from '@/components/Screen';
import { COLORS } from '@/constants/colors';
import { signOut, useAuth } from '@/lib/auth';
import { getProfile, updateProfile, type Profile } from '@/lib/profiles';

export default function ProfileScreen() {
  const { user } = useAuth(); const router = useRouter(); const [profile, setProfile] = useState<Profile | null>(null); const [name, setName] = useState(''); const [message, setMessage] = useState<string | null>(null); const [loading, setLoading] = useState(false);
  useFocusEffect(useCallback(() => { let active = true; if (user) getProfile(user.id).then((value) => { if (active) { setProfile(value); setName(value?.full_name ?? ''); } }).catch((e) => active && setMessage(e.message)); return () => { active = false; }; }, [user?.id]));
  const save = async () => { if (!user) return; setLoading(true); setMessage(null); try { const next = await updateProfile(user.id, { full_name: name.trim() || null }); setProfile(next); setMessage('Profile saved.'); } catch (e: any) { setMessage(e?.message ?? 'Could not save profile.'); } finally { setLoading(false); } };
  const logout = async () => { setLoading(true); await signOut(); router.replace('/login'); };
  return <Screen><Text style={styles.title}>My profile</Text><Text style={styles.subtitle}>Keep your name current so teachers can recognize your attendance.</Text><View style={styles.card}><Text style={styles.label}>Email</Text><Text style={styles.value}>{profile?.email ?? user?.email ?? '—'}</Text><Text style={styles.label}>Role</Text><Text style={styles.role}>{profile?.role ?? 'student'}</Text><Text style={styles.label}>Full name</Text><TextInput value={name} onChangeText={setName} placeholder="Your full name" placeholderTextColor={COLORS.textSecondary} style={styles.input} />{message && <Text style={styles.message}>{message}</Text>}<AppButton theme="primary" title="Save Profile" icon="save-outline" onPress={save} loading={loading} /></View><View style={styles.logout}><AppButton title="Sign Out" icon="log-out-outline" onPress={logout} disabled={loading} /></View></Screen>;
}
const styles = StyleSheet.create({ title: { color: COLORS.textPrimary, fontSize: 26, fontWeight: '700' }, subtitle: { color: COLORS.textSecondary, fontSize: 15, lineHeight: 22, marginTop: 6, marginBottom: 20 }, card: { padding: 16, backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.border, borderRadius: 10 }, label: { color: COLORS.textSecondary, fontSize: 12, fontWeight: '600', marginTop: 10, marginBottom: 5 }, value: { color: COLORS.textPrimary, fontSize: 16 }, role: { alignSelf: 'flex-start', color: COLORS.primary, fontWeight: '700', textTransform: 'capitalize', backgroundColor: COLORS.surface, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10 }, input: { minHeight: 50, borderWidth: 1, borderColor: COLORS.border, borderRadius: 10, paddingHorizontal: 14, fontSize: 16, color: COLORS.textPrimary }, message: { color: COLORS.primary, marginVertical: 8 }, logout: { marginTop: 18 } });
