import { useEffect, useState } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from './supabase';

type AuthState = { session: Session | null; user: User | null; loading: boolean };
let globalSession: Session | null = null;
let globalLoading = false;
const listeners = new Set<() => void>();
const notify = () => listeners.forEach((listener) => listener());

export function setAuth(session: Session | null) { globalSession = session; globalLoading = false; notify(); }
export function useAuth(): AuthState {
  const [, render] = useState(0);
  useEffect(() => { const listener = () => render((n) => n + 1); listeners.add(listener); return () => { listeners.delete(listener); }; }, []);
  return { session: globalSession, user: globalSession?.user ?? null, loading: globalLoading };
}
export async function signUp(email: string, password: string) { const result = await supabase.auth.signUp({ email, password }); if (result.data.session) setAuth(result.data.session); return result; }
export async function signIn(email: string, password: string) { const result = await supabase.auth.signInWithPassword({ email, password }); if (result.data.session) setAuth(result.data.session); return result; }
export async function signOut() { setAuth(null); const { error } = await supabase.auth.signOut(); return { error }; }
