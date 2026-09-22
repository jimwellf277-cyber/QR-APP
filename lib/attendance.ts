import { supabase } from './supabase';
import { getEventByCode } from './events';
import { parseQRPayload } from './qr';

export type AttendanceRecord = { id: string; eventId: string; eventTitle: string; scannedAt: string };
export type RegisterResult = { success: boolean; message: string; eventTitle?: string };
export type TeacherEventAttendance = { eventId: string; eventCode: string; title: string; attendees: { studentId: string; studentName: string | null; scannedAt: string }[] };
export type TeacherEventSummary = { eventId: string; eventCode: string; title: string; attendeeCount: number };

export async function registerAttendance(raw: string, studentId: string): Promise<RegisterResult> {
  const parsed = parseQRPayload(raw); if (!parsed.ok) return { success: false, message: parsed.message };
  const payload = parsed.payload; const now = Date.now(); const start = payload.start ? Date.parse(payload.start) : null; const end = payload.end ? Date.parse(payload.end) : null;
  if (start && now < start) return { success: false, message: 'Event has not started yet.' };
  if (end && now > end) return { success: false, message: 'Event has already ended.' };
  let event;
  try { event = await getEventByCode(payload.event); } catch { return { success: false, message: 'Could not check event.' }; }
  if (!event) {
    const { data, error } = await supabase.from('events').insert({ event_code: payload.event, title: payload.title ?? payload.event, start_time: payload.start ?? null, end_time: payload.end ?? null }).select('id, title').single();
    if (error || !data) return { success: false, message: 'Could not create event.' }; event = data;
  }
  const { error } = await supabase.from('attendance').insert({ student_id: studentId, event_id: event.id });
  if (error?.code === '23505') return { success: false, message: 'Already registered for this event.', eventTitle: event.title };
  if (error) return { success: false, message: error.message };
  return { success: true, message: 'Attendance recorded!', eventTitle: event.title };
}

export async function getAttendanceHistory(studentId: string): Promise<AttendanceRecord[]> {
  const { data, error } = await supabase.from('attendance').select('id, scanned_at, events ( id, title )').eq('student_id', studentId).order('scanned_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map((row: any) => ({ id: row.id, eventId: row.events?.id ?? '', eventTitle: row.events?.title ?? 'Event', scannedAt: row.scanned_at }));
}

export async function getTeacherEventAttendance(teacherId: string): Promise<TeacherEventAttendance[]> {
  const { data: events, error } = await supabase.from('events').select('id, event_code, title').eq('created_by', teacherId).order('created_at', { ascending: false });
  if (error) throw error; if (!events?.length) return [];
  const { data: rows, error: attendanceError } = await supabase.from('attendance').select('student_id, scanned_at, event_id, profiles ( full_name, email )').in('event_id', events.map((e) => e.id));
  if (attendanceError) throw attendanceError;
  return events.map((event) => ({ eventId: event.id, eventCode: event.event_code, title: event.title, attendees: (rows ?? []).filter((row: any) => row.event_id === event.id).map((row: any) => ({ studentId: row.student_id, studentName: row.profiles?.full_name ?? row.profiles?.email ?? null, scannedAt: row.scanned_at })) }));
}

export async function getTeacherEventSummary(teacherId: string): Promise<TeacherEventSummary[]> {
  const { data: events, error } = await supabase.from('events').select('id, event_code, title').eq('created_by', teacherId).order('created_at', { ascending: false });
  if (error) throw error; if (!events?.length) return [];
  const { data: rows, error: countError } = await supabase.from('attendance').select('event_id').in('event_id', events.map((e) => e.id));
  if (countError) throw countError; const counts: Record<string, number> = {}; (rows ?? []).forEach((row) => { counts[row.event_id] = (counts[row.event_id] ?? 0) + 1; });
  return events.map((event) => ({ eventId: event.id, eventCode: event.event_code, title: event.title, attendeeCount: counts[event.id] ?? 0 }));
}
