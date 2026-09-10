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
  work_days: [1, 2, 3, 4, 5],        // ISO weekdays (Mon=1 … Sun=7) that count toward the target
  tracked_roles: ['sales', 'sales_manager', 'support', 'member'], // who is held to the target
  weekly_summary: true,              // Monday 09:00 (default_shift.tz): bell + email to team roles
};
const ALL_ROLES = ['super_admin', 'admin', 'manager', 'sales_manager', 'sales', 'finance', 'support', 'member'];
const TEAM_ROLES = ['super_admin', 'admin', 'manager', 'sales_manager'];
const CRM_URL = process.env.CRM_URL || 'https://crm.stemfra.com';
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
    work_days: Array.isArray(r.work_days) && r.work_days.length
      ? [...new Set(r.work_days.map(Number).filter((d) => d >= 1 && d <= 7))].sort()
      : DEFAULTS.work_days,
    tracked_roles: Array.isArray(r.tracked_roles)
      ? r.tracked_roles.filter((x) => ALL_ROLES.includes(x))
      : DEFAULTS.tracked_roles,
    weekly_summary: r.weekly_summary !== false,
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

/** The window of a specific shift day (YYYY-MM-DD in the shift tz). */
function shiftWindowForDay(shift, dayISO) {
  const dayLocal = DateTime.fromISO(dayISO, { zone: shift.tz }).startOf('day');
  const [sh, sm] = shift.start.split(':').map(Number);
  const [eh, em] = shift.end.split(':').map(Number);
  const start = dayLocal.set({ hour: sh, minute: sm });
  let end = dayLocal.set({ hour: eh === 24 ? 0 : eh, minute: em });
  if (eh === 24 || end <= start) end = end.plus({ days: 1 });
  return { day: start.toISODate(), start, end };
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

async function rollupUser(userId, { settings, profile, now = DateTime.utc(), window, write = true } = {}) {
  settings = settings || await getSettings();
  if (!profile) {
    const { data } = await supabase.from('profiles').select('id, shift').eq('id', userId).maybeSingle();
    profile = data;
  }
  const w = window || shiftWindow(shiftFor(profile, settings), now);
  const startMs = w.start.toMillis();
  const endMs = w.end.toMillis();
  const nowMs = now.toMillis();

  const [{ data: sessions }, { data: calls }, { data: emails }, { data: absences }] = await Promise.all([
    supabase.from('work_sessions').select('started_at, ended_at').eq('user_id', userId)
      .gte('started_at', w.start.minus({ hours: 20 }).toISO()).lte('started_at', w.end.toISO()),
    supabase.from('calls').select('id', { count: 'exact', head: false }).eq('handled_by', userId)
      .gte('started_at', w.start.toISO()).lt('started_at', w.end.toISO()),
    supabase.from('email_sends').select('id').eq('sent_by', userId)
      .gte('sent_at', w.start.toISO()).lt('sent_at', w.end.toISO()),
    supabase.from('staff_absences').select('minutes').eq('user_id', userId).eq('day', w.day).eq('status', 'approved'),
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
  const excused = (absences || []).reduce((n, a) => n + (a.minutes || 0), 0);
  const targetMinutes = settings.target_hours * 60;
  // Live status (phase 4 freezes it at shift end for the alerts):
  //   off   = the shift has not started yet
  //   ok    = active + excused reached the target
  //   near  = within an hour of it
  //   short = below that
  const credited = Math.round(active) + excused;
  const status = nowMs < startMs ? 'off'
    : credited >= targetMinutes ? 'ok'
    : credited >= targetMinutes - 60 ? 'near'
    : 'short';

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
    excused_minutes: excused,
    target_minutes: targetMinutes,
    status,
    updated_at: new Date().toISOString(),
  };
  if (write) {
    const { error } = await supabase.from('work_days').upsert(row, { onConflict: 'user_id,day' });
    if (error) console.warn('[work-time] rollup failed:', error.message);
  }
  return row;
}

async function sweep() {
  const settings = await getSettings();
  const users = await sweepSessions();
  if (users.length) {
    const { data: profiles } = await supabase.from('profiles').select('id, shift').in('id', users);
    const byId = new Map((profiles || []).map((p) => [p.id, p]));
    for (const id of users) await rollupUser(id, { settings, profile: byId.get(id) });
  }
  try { await closeShifts({ settings }); } catch (err) { console.warn('[work-time] close error:', err.message); }
  try { await weeklySummary({ settings }); } catch (err) { console.warn('[work-time] weekly error:', err.message); }
}

// ─── Phase 4: shift-end close + alerts ───────────────────────────────────────

async function staffProfiles() {
  const { data } = await supabase.from('profiles').select('id, full_name, email, role, shift')
    .eq('is_active', true).like('email', '%@stemfra.com');
  return data || [];
}

async function bell(userIds, kind, title, body, route = '/activities/hours') {
  for (const id of userIds) {
    try {
      await supabase.rpc('crm_notify', { p_user: id, p_kind: kind, p_title: title, p_body: body || '', p_route: route, p_entity_type: 'work_day', p_entity_id: null });
    } catch (err) { console.warn('[work-time] bell failed:', err.message); }
  }
}

const fmtMin = (m) => { const n = Math.max(0, Math.round(m || 0)); const h = Math.floor(n / 60); const r = n % 60; return h ? `${h}h ${String(r).padStart(2, '0')}m` : `${r}m`; };

/**
 * Freeze every shift whose window has ended (within the last 36h so an old
 * backlog never floods anyone): final rollup, closed_at, and, for a TRACKED
 * role on a WORK day that came up short without enough excused time, one bell
 * to every team role (not the person) plus one to the person. `dryRun` returns
 * the decisions without writing or belling (used to verify the logic).
 */
async function closeShifts({ settings, now = DateTime.utc(), dryRun = false } = {}) {
  settings = settings || await getSettings();
  const profiles = await staffProfiles();
  const teamIds = profiles.filter((p) => TEAM_ROLES.includes(p.role)).map((p) => p.id);
  const decisions = [];
  for (const p of profiles) {
    const shift = shiftFor(p, settings);
    const cur = shiftWindow(shift, now);
    // The most recent window that has ENDED: the current one if it is over, else yesterday's.
    const ended = now >= cur.end ? cur : shiftWindowForDay(shift, cur.start.minus({ days: 1 }).toISODate());
    if (now < ended.end || now.diff(ended.end, 'hours').hours > 36) continue;
    const { data: existing } = await supabase.from('work_days').select('closed_at, alerted_at').eq('user_id', p.id).eq('day', ended.day).maybeSingle();
    if (existing?.closed_at) continue;
    const row = await rollupUser(p.id, { settings, profile: p, now, window: ended, write: !dryRun });
    const credited = (row.active_minutes || 0) + (row.excused_minutes || 0);
    const target = row.target_minutes || settings.target_hours * 60;
    const status = credited >= target ? 'ok' : credited >= target - 60 ? 'near' : 'short';
    const workDay = settings.work_days.includes(ended.start.weekday);
    const tracked = settings.tracked_roles.includes(p.role);
    const alert = workDay && tracked && status === 'short' && !existing?.alerted_at;
    decisions.push({ user: p.email, day: ended.day, status, credited, target, workDay, tracked, alert });
    if (dryRun) continue;
    const stamp = new Date().toISOString();
    await supabase.from('work_days').update({ status, closed_at: stamp, ...(alert ? { alerted_at: stamp } : {}) }).eq('user_id', p.id).eq('day', ended.day);
    if (alert) {
      const name = p.full_name || p.email;
      const dayLabel = ended.start.setZone(shift.tz).toFormat('ccc d LLL');
      const body = `${fmtMin(row.active_minutes)} active${row.excused_minutes ? ` + ${fmtMin(row.excused_minutes)} excused` : ''} of ${fmtMin(target)}${row.calls ? ` · ${row.calls} calls` : ''}${row.first_seen ? '' : ' · never signed in'}`;
      await bell(teamIds.filter((id) => id !== p.id), 'work_day_short', `${name} came up short on ${dayLabel}`, body);
      await bell([p.id], 'work_day_short', `Your ${dayLabel} shift closed short of the target`, `${body}. Ask a manager to excuse the hours if there was a reason.`);
    }
  }
  return decisions;
}

// ─── Phase 4: weekly summary (Monday 09:00 in the default shift tz) ──────────

async function readState() {
  const { data } = await supabase.from('crm_settings').select('value').eq('key', 'work_time_state').maybeSingle();
  return data?.value && typeof data.value === 'object' ? data.value : {};
}
async function writeState(patch) {
  const cur = await readState();
  await supabase.from('crm_settings').upsert({ key: 'work_time_state', value: { ...cur, ...patch }, updated_at: new Date().toISOString() }, { onConflict: 'key' });
}

/** Build last week's summary (Mon..Sun before `now`, in the default shift tz). */
async function buildWeeklySummary({ settings, now = DateTime.utc() } = {}) {
  settings = settings || await getSettings();
  const local = now.setZone(settings.default_shift.tz);
  const weekStart = local.startOf('week').minus({ weeks: 1 }); // last Monday
  const weekEnd = weekStart.plus({ days: 6 });
  const from = weekStart.toISODate(); const to = weekEnd.toISODate();
  const profiles = (await staffProfiles()).filter((p) => settings.tracked_roles.includes(p.role));
  const ids = profiles.map((p) => p.id);
  const { data: days } = ids.length
    ? await supabase.from('work_days').select('user_id, day, active_minutes, excused_minutes, target_minutes, status, calls, emails').in('user_id', ids).gte('day', from).lte('day', to)
    : { data: [] };
  const people = profiles.map((p) => {
    const mine = (days || []).filter((d) => d.user_id === p.id);
    const active = mine.reduce((n, d) => n + (d.active_minutes || 0), 0);
    const excused = mine.reduce((n, d) => n + (d.excused_minutes || 0), 0);
    const worked = mine.filter((d) => (d.active_minutes || 0) > 0).length;
    const short = mine.filter((d) => d.status === 'short').length;
    const calls = mine.reduce((n, d) => n + (d.calls || 0), 0);
    return { id: p.id, name: p.full_name || p.email, active, excused, worked, short, calls };
  }).sort((a, b) => b.active - a.active);
  const totalShort = people.reduce((n, x) => n + x.short, 0);
  return { from, to, label: `${weekStart.toFormat('d LLL')} to ${weekEnd.toFormat('d LLL')}`, people, totalShort, weekKey: weekStart.toFormat("kkkk-'W'WW") };
}

async function weeklySummary({ settings, now = DateTime.utc(), force = false } = {}) {
  settings = settings || await getSettings();
  if (!settings.weekly_summary && !force) return null;
  const local = now.setZone(settings.default_shift.tz);
  if (!force && !(local.weekday === 1 && local.hour >= 9)) return null;
  const summary = await buildWeeklySummary({ settings, now });
  const state = await readState();
  if (!force && state.last_weekly_week === summary.weekKey) return null;
  if (!summary.people.length) { if (!force) await writeState({ last_weekly_week: summary.weekKey }); return summary; }
  const profiles = await staffProfiles();
  const team = profiles.filter((p) => TEAM_ROLES.includes(p.role));
  const title = `Weekly hours, ${summary.label}: ${summary.people.length} ${summary.people.length === 1 ? 'rep' : 'reps'}, ${summary.totalShort} short ${summary.totalShort === 1 ? 'day' : 'days'}`;
  const top = summary.people.slice(0, 3).map((x) => `${x.name} ${fmtMin(x.active)}`).join(' · ');
  await bell(team.map((p) => p.id), 'work_week', title, top);
  try {
    const { renderEmail } = require('../templates/baseEmail');
    const { sendMail } = require('./mailer');
    const rows = summary.people.map((x) => ({ label: x.name, value: `${fmtMin(x.active)} active · ${x.worked} days · ${x.short} short${x.excused ? ` · ${fmtMin(x.excused)} excused` : ''}` }));
    const html = renderEmail({
      eyebrow: 'Team hours',
      heading: `Week of ${summary.label}`,
      paragraphs: [`${summary.people.length} tracked ${summary.people.length === 1 ? 'person' : 'people'}, ${summary.totalShort} short ${summary.totalShort === 1 ? 'day' : 'days'} without an approved absence. Target ${settings.target_hours}h of ${settings.shift_hours}h inside the shift.`],
      rows,
      cta: { label: 'Open Hours in the CRM', url: `${CRM_URL}/activities/hours` },
      reason: 'You receive this because you manage the Stemfra sales team.',
    });
    const text = [`Team hours, week of ${summary.label}`, '', ...rows.map((r) => `${r.label}: ${r.value}`), '', `${CRM_URL}/activities/hours`].join('\n');
    for (const p of team) {
      if (!p.email) continue;
      await sendMail({ fromName: 'Stemfra', to: p.email, subject: title, text, html });
    }
  } catch (err) { console.warn('[work-time] weekly email failed:', err.message); }
  if (!force) await writeState({ last_weekly_week: summary.weekKey, last_weekly_at: new Date().toISOString() });
  return summary;
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
  shiftWindow, shiftWindowForDay, shiftFor, sweep, rollupUser, daysFor, startWorkTimeSweeper,
  closeShifts, buildWeeklySummary, weeklySummary, TEAM_ROLES, ALL_ROLES,
};
