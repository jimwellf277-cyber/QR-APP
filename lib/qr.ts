export type QRPayload = { v: 1; event: string; title?: string; start?: string; end?: string };
export function buildQRPayload(event: { eventId: string; title: string; start: string; end: string }) { return JSON.stringify({ v: 1, event: event.eventId, title: event.title, start: event.start, end: event.end } satisfies QRPayload); }
export function parseQRPayload(raw: string): { ok: true; payload: QRPayload } | { ok: false; message: string } {
  try { const value = JSON.parse(raw); if (value?.v !== 1 || typeof value?.event !== 'string' || !value.event.trim()) return { ok: false, message: 'Not an attendance QR code.' }; return { ok: true, payload: value }; }
  catch { return { ok: false, message: 'Invalid QR code.' }; }
}
