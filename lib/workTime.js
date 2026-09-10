// ─── Work time — staff working-time monitor (P29 phase 1, 2026-09-10) ───────
//
// The CRM heartbeat (routes/presence.js) now carries `idle` (no input for
// crm_settings.work_time.idle_stop_minutes) and `in_call`. This module turns
// those beats into:
//   work_sessions — one row per stretch of activity (opened when a fresh,
//                   non-idle beat arrives; closed at last_active_at when the
//                   person goes idle, offline or stale)
//   work_days     — one row per person per SHIFT (the rep's shift from
//                   profiles.shift, else work_time.default_shift): active and
//                   idle minutes inside the window, first/last seen, calls
//                   made (calls.handled_by) and emails sent (email_sends.sent_by).
// The sweeper runs every minute from index.js. No screenshots, no keystrokes:
// activity + outcomes only (Peter, docs: stemfra-ops/docs/SALES_HOURS.md).
//
// Single-var supabase require per convention.
const supabase = require('../config/supabase');
const { DateTime } = require('luxon');

const DEFAULTS = {
  idle_stop_minutes: 5,   // 5..10, super_admin
  lock_minutes: 45,       // 15..240, super_admin
  lock_mode: 'pin',       // 'pin' | 'tap'
  target_hours: 7,        // of shift_hours
  shift_hours: 8,
  default_shift: { start: '16:00', end: '24:00', tz: 'Africa/Lagos' },
};
const LIMITS = {
  idle_stop_minutes: [5, 10],
  lock_minutes: [15, 240],
  target_hours: [1, 12],
  shift_hours: [1, 16],
};
const STALE_MS = 150_000; // same slack as the presence sweeper

let settingsCache = { at: 0, value: null };

function clamp(n, [lo, hi], fallback) {
  const v = Number(n);
  if (!Number.isFinite(v)) return fallback;
  return Math.min(hi, Math.max(lo, Math.round(v)));
}

function normalizeShift(s, fallback) {
  const ok = (t) => typeof t === 'string' && /^([01]\d|2[0-4]):[0-5]\d$/.test(t);
  if (!s || typeof s !== 'object') return fallback;
  const tz = typeof s.tz === 'string' && DateTime.now().setZone(s.tz).isValid ? s.tz : fallback.tz;
  return { start: ok(s.start) ? s.start : fallback.start, end: ok(s.end) ? s.end : fallback.end, tz };
}

/** Merge a raw settings object over the defaults with the ranges enforced. */
function normalizeSettings(raw) {
  const r = raw && typeof raw === 'object' ? raw : {};
  return {
    idle_stop_minutes: clamp(r.idle_stop_minutes, LIMITS.idle_stop_minutes, DEFAULTS.idle_stop_minutes),
    lock_minutes: clamp(r.lock_minutes, LIMITS.lock_minutes, DEFAULTS.lock_minutes),
    lock_mode: r.lock_mode === 'tap' ? 'tap' : 'pin',
    target_hours: clamp(r.target_hours, LIMITS.target_hours, DEFAULTS.target_hours),
    shift_hours: clamp(r.shift_hours, LIMITS.shift_hours, DEFAULTS.shift_hours),
    default_shift: normalizeShift(r.default_shift, DEFAULTS.default_shift),
  };
}

async function getSettings({ fresh = false } = {}) {
  if (!fresh && settingsCache.value && Date.now() - settingsCache.at < 60_000) return settingsCache.value;
  const { data } = await supabase.from('crm_settings').select('value').eq('key', 'work_time').maybeSingle();
  const value = normalizeSettings(data?.value);
  settingsCache = { at: Date.now(), value };
  return value;
}

async function saveSettings(patch, userId) {
  const current = await getSettings({ fresh: true });
  const value = normalizeSettings({ ...current, ...patch, default_shift: { ...current.default_shift, ...(patch?.default_shift || {}) } });
  const { error } = await supabase.from('crm_settings')
    .upsert({ key: 'work_time', value, updated_at: new Date().toISOString(), updated_by: userId || null }, { onConflict: 'key' });
  if (error) throw error;
  settingsCache = { at: Date.now(), value };
  return value;
}

/**
 * The shift window that contains `now` for this shift, or the most recent one
 * that ended (so a rep who logs in before the shift sees "not started yet"
 * against today's window rather than yesterday's).
 * Returns { day (YYYY-MM-DD in shift tz), start, end } as luxon DateTimes.
 */
function shiftWindow(shift, now = DateTime.utc()) {
  const local = now.setZone(shift.tz);
  const build = (dayLocal) => {
    const [sh, sm] = shift.start.split(':').map(Number);
    const [eh, em] = shift.end.split(':').map(Number);
    const start = dayLocal.set({ hour: sh, minute: sm, second: 0, millisecond: 0 });
    let end = dayLocal.set({ hour: eh === 24 ? 0 : eh, minute: em, second: 0, millisecond: 0 });
    if (eh === 24 || end <= start) end = end.plus({ days: 1 });
    return { day: start.toISODate(), start, end };
  };
  const today = build(local.startOf('day'));
  if (local >= today.start) return today;
  // Before today's start: if yesterday's window is still open, that's the one.
  const yesterday = build(local.startOf('day').minus({ days: 1 }));
  if (local < yesterday.end) return yesterday;
  return today; // upcoming shift, nothing counted yet
}

function shiftFor(profile, settings) {
  return normalizeShift(profile?.shift, settings.default_shift);
}

// ─── Sweeper: heartbeats → sessions ──────────────────────────────────────────

async function sweepSessions(now = new Date()) {
  const cutoff = new Date(now.getTime() - STALE_MS);
  const [{ data: presence, error: pe }, { data: open, error: oe }] = await Promise.all([
    supabase.from('user_presence').select('user_id, is_online, last_heartbeat, last_active_at, idle, in_call'),
    supabase.from('work_sessions').select('id, user_id, started_at').is('ended_at', null),
  ]);
  if (pe) throw pe;
  if (oe) throw oe;
  const openBy = new Map((open || []).map((s) => [s.user_id, s]));
  const touched = new Set();

  for (const p of presence || []) {
    const fresh = p.last_heartbeat && new Date(p.last_heartbeat) >= cutoff;
    const active = fresh && p.is_online && (!p.idle || p.in_call);
    const session = openBy.get(p.user_id);
    if (active && !session) {
      const startedAt = p.last_active_at && new Date(p.last_active_at) <= now ? p.last_active_at : now.toISOString();
      const { error } = await supabase.from('work_sessions').insert({ user_id: p.user_id, started_at: startedAt });
      if (error && !/duplicate|unique/i.test(error.message)) console.warn('[work-time] open session failed:', error.message);
      touched.add(p.user_id);
    } else if (!active && session) {
      const started = new Date(session.started_at);
      let endedAt = p.last_active_at ? new Date(p.last_active_at) : (p.last_heartbeat ? new Date(p.last_heartbeat) : now);
      if (endedAt < started) endedAt = started;
      if (endedAt > now) endedAt = now;
      const { error } = await supabase.from('work_sessions').update({ ended_at: endedAt.toISOString() }).eq('id', session.id);
      if (error) console.warn('[work-time] close session failed:', error.message);
      touched.add(p.user_id);
    } else if (active && session) {
      touched.add(p.user_id); // still working: keep today's rollup fresh
    }
  }
  return [...touched];
}

// ─── Rollup: sessions → work_days for one person's current shift window ──────

function overlapMinutes(aStart, aEnd, bStart, bEnd) {
  const s = Math.max(aStart, bStart);
  const e = Math.min(aEnd, bEnd);
  return e > s ? (e - s) / 60_000 : 0;
}

async function rollupUser(userId, { settings, profile, now = DateTime.utc(), window } = {}) {
  settings = settings || await getSettings();
  if (!profile) {
    const { data } = await supabase.from('profiles').select('id, shift').eq('id', userId).maybeSingle();
    profile = data;
  }
  const w = window || shiftWindow(shiftFor(profile, settings), now);
  const startMs = w.start.toMillis();
  const endMs = w.end.toMillis();
  const nowMs = now.toMillis();

  const [{ data: sessions }, { data: calls }, { data: emails }] = await Promise.all([
    supabase.from('work_sessions').select('started_at, ended_at').eq('user_id', userId)
      .gte('started_at', w.start.minus({ hours: 20 }).toISO()).lte('started_at', w.end.toISO()),
    supabase.from('calls').select('id', { count: 'exact', head: false }).eq('handled_by', userId)
      .gte('started_at', w.start.toISO()).lt('started_at', w.end.toISO()),
    supabase.from('email_sends').select('id').eq('sent_by', userId)
      .gte('sent_at', w.start.toISO()).lt('sent_at', w.end.toISO()),
  ]);

  let active = 0; let first = null; let last = null;
  for (const s of sessions || []) {
    const sStart = new Date(s.started_at).getTime();
    const sEnd = s.ended_at ? new Date(s.ended_at).getTime() : nowMs;
    const mins = overlapMinutes(sStart, sEnd, startMs, endMs);
    if (mins <= 0) continue;
    active += mins;
    const os = Math.max(sStart, startMs); const oe = Math.min(sEnd, endMs);
    if (first === null || os < first) first = os;
    if (last === null || oe > last) last = oe;
  }
  const elapsedEnd = Math.min(nowMs, endMs);
  const idle = first !== null ? Math.max(0, (elapsedEnd - first) / 60_000 - active) : 0;

  const row = {
    user_id: userId,
    day: w.day,
    shift_start: w.start.toISO(),
    shift_end: w.end.toISO(),
    active_minutes: Math.round(active),
    idle_minutes: Math.round(idle),
    calls: (calls || []).length,
    emails: (emails || []).length,
    first_seen: first !== null ? new Date(first).toISOString() : null,
    last_seen: last !== null ? new Date(last).toISOString() : null,
    target_minutes: settings.target_hours * 60,
    updated_at: new Date().toISOString(),
  };
  const { error } = await supabase.from('work_days').upsert(row, { onConflict: 'user_id,day' });
  if (error) console.warn('[work-time] rollup failed:', error.message);
  return row;
}

async function sweep() {
  const settings = await getSettings();
  const users = await sweepSessions();
  if (!users.length) return;
  const { data: profiles } = await supabase.from('profiles').select('id, shift').in('id', users);
  const byId = new Map((profiles || []).map((p) => [p.id, p]));
  for (const id of users) await rollupUser(id, { settings, profile: byId.get(id) });
}

/** Started from index.js; self-contained like startStalePresenceSweeper. */
function startWorkTimeSweeper({ intervalMs = 60_000 } = {}) {
  const tick = () => sweep().catch((err) => console.warn('[work-time] sweep error:', err.message));
  tick();
  return setInterval(tick, intervalMs);
}

// ─── Reads for the CRM ───────────────────────────────────────────────────────

/** A person's day rows in [from, to] (YYYY-MM-DD, shift days) plus a fresh
 *  rollup of the window that contains now, so "today" never waits on the sweep. */
async function daysFor(userId, { from, to, profile, settings } = {}) {
  settings = settings || await getSettings();
  if (!profile) {
    const { data } = await supabase.from('profiles').select('id, shift').eq('id', userId).maybeSingle();
    profile = data;
  }
  const shift = shiftFor(profile, settings);
  const current = shiftWindow(shift);
  const live = await rollupUser(userId, { settings, profile, window: current });
  let q = supabase.from('work_days').select('*').eq('user_id', userId).order('day', { ascending: false });
  if (from) q = q.gte('day', from);
  if (to) q = q.lte('day', to);
  const { data: days, error } = await q;
  if (error) throw error;
  return { shift, current: { day: current.day, start: current.start.toISO(), end: current.end.toISO() }, live, days: days || [] };
}

module.exports = {
  DEFAULTS, LIMITS,
  getSettings, saveSettings, normalizeSettings, normalizeShift,
  shiftWindow, shiftFor, sweep, rollupUser, daysFor, startWorkTimeSweeper,
};
