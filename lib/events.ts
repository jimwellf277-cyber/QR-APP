import { supabase } from './supabase';
export type EventInput = { eventId: string; title: string; start: string; end: string; createdBy: string };
export async function createEvent(event: EventInput) {
  const { data, error } = await supabase.from('events').upsert({ event_code: event.eventId, title: event.title, start_time: event.start, end_time: event.end, created_by: event.createdBy }, { onConflict: 'event_code' }).select().single();
  return { data, error };
}
export async function getEventByCode(code: string) {
  const { data, error } = await supabase.from('events').select('id, event_code, title, start_time, end_time, created_by').eq('event_code', code).maybeSingle();
  if (error) throw error;
  return data;
}
