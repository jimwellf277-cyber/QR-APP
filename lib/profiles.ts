import { supabase } from './supabase';
export type UserRole = 'student' | 'teacher';
export type Profile = { id: string; email: string; full_name: string | null; role: UserRole; created_at?: string; updated_at?: string };

export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
  if (error) throw error;
  return data as Profile | null;
}
export async function updateProfile(userId: string, updates: Pick<Profile, 'full_name'>) {
  const { data, error } = await supabase.from('profiles').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', userId).select().single();
  if (error) throw error;
  return data as Profile;
}
export async function setProfileRole(userId: string, role: UserRole) {
  const { data, error } = await supabase.from('profiles').update({ role, updated_at: new Date().toISOString() }).eq('id', userId).select().single();
  if (error) throw error;
  return data as Profile;
}
