import { useState } from 'react';
import { Link, useRouter } from 'expo-router';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, View } from 'react-native';
import AppButton from '@/components/AppButton';
import Header from '@/components/Header';
import Screen from '@/components/Screen';
import { COLORS } from '@/constants/colors';
import { signIn } from '@/lib/auth';
import { isSupabaseConfigured } from '@/lib/supabase';

export default function Login() {
  const router = useRouter(); const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const [error, setError] = useState<string | null>(null); const [loading, setLoading] = useState(false);
  const submit = async () => { if (!email.trim() || !password) return setError('Enter your email and password.'); if (!isSupabaseConfigured) return setError('Add your Supabase URL and anon key to a .env file first.'); setLoading(true); setError(null); try { const { error: authError } = await signIn(email.trim(), password); if (authError) setError(authError.message); else router.replace('/(tabs)'); } catch { setError('Unable to sign in. Check your connection and try again.'); } finally { setLoading(false); } };
  return <Screen><KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}><Header title="QR Attendance" /><View style={styles.heading}><Text style={styles.title}>Welcome back</Text><Text style={styles.subtitle}>Sign in to record or manage school event attendance.</Text></View><View style={styles.form}><Text style={styles.label}>Email</Text><TextInput accessibilityLabel="Email" autoCapitalize="none" autoComplete="email" keyboardType="email-address" value={email} onChangeText={setEmail} editable={!loading} placeholder="your.email@school.edu" placeholderTextColor={COLORS.textSecondary} style={styles.input} /><Text style={styles.label}>Password</Text><TextInput accessibilityLabel="Password" autoComplete="password" secureTextEntry value={password} onChangeText={setPassword} editable={!loading} placeholder="Enter your password" placeholderTextColor={COLORS.textSecondary} style={styles.input} />{error && <Text accessibilityRole="alert" style={styles.error}>{error}</Text>}<AppButton theme="primary" title="Sign In" icon="log-in-outline" onPress={submit} loading={loading} /></View><Link href="/register" style={styles.link}>Don't have an account? Sign up</Link></KeyboardAvoidingView></Screen>;
}
const styles = StyleSheet.create({ flex: { flex: 1 }, heading: { marginTop: 36, marginBottom: 24 }, title: { fontSize: 28, fontWeight: '700', color: COLORS.textPrimary }, subtitle: { fontSize: 15, lineHeight: 22, color: COLORS.textSecondary, marginTop: 6 }, form: { marginBottom: 22 }, label: { fontSize: 14, fontWeight: '600', color: COLORS.textPrimary, marginTop: 12, marginBottom: 7 }, input: { minHeight: 50, borderWidth: 1, borderColor: COLORS.border, borderRadius: 10, backgroundColor: COLORS.card, paddingHorizontal: 14, fontSize: 16, color: COLORS.textPrimary }, error: { color: COLORS.danger, marginVertical: 12, lineHeight: 20 }, link: { color: COLORS.textPrimary, fontWeight: '700', fontSize: 15 } });
