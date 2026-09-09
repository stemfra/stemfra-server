// Frame capture straight from Chromium (CDP Page.startScreencast) instead of
// Playwright's recordVideo. Two reasons: (1) every frame carries Chromium's own
// wall-clock timestamp, so narration can be placed on the picture exactly,
// with no recorder drift; (2) frames arrive at device pixels, so a 1920x1080
// viewport at deviceScaleFactor 2 yields a true 3840x2160 (4K) master.
//
// Frames are written as JPEGs with a per-frame duration list, then encoded by
// ffmpeg through the concat demuxer (variable frame timing -> constant 30fps).
import { mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';

export async function startCapture(page, dir, { maxWidth = 3840, maxHeight = 2160, quality = 92 } = {}) {
  mkdirSync(dir, { recursive: true });
  const cdp = await page.context().newCDPSession(page);
  const frames = []; // { file, ts } with ts in epoch seconds (Chromium's clock)
  let n = 0, stopped = false;
  cdp.on('Page.screencastFrame', async (ev) => {
    if (!stopped) {
      const file = join(dir, `f${String(n++).padStart(6, '0')}.jpg`);
      writeFileSync(file, Buffer.from(ev.data, 'base64'));
      frames.push({ file, ts: ev.metadata.timestamp });
    }
    try { await cdp.send('Page.screencastFrameAck', { sessionId: ev.sessionId }); } catch { /* session gone */ }
  });
  await cdp.send('Page.startScreencast', { format: 'jpeg', quality, maxWidth, maxHeight, everyNthFrame: 1 });
  return {
    frames,
    /** Nudge the compositor so a frame exists at this instant (static screens emit none). */
    tick: async () => { try { await page.evaluate(() => { document.documentElement.style.setProperty('--tutorial-tick', String(Date.now())); }); } catch { /* ignore */ } },
    stop: async () => { stopped = true; try { await cdp.send('Page.stopScreencast'); await cdp.detach(); } catch { /* ignore */ } return frames; },
  };
}

/**
 * Encode captured frames to an mp4 whose timeline starts at `startTs` (epoch s)
 * and ends at `endTs`. Frames before startTs are dropped (the last one before
 * it still paints the first instant). Returns the mp4 path.
 */
export function encodeFrames(frames, { startTs, endTs, out, width, height, fps = 30 }) {
  if (!frames.length) throw new Error('no frames captured');
  const sorted = [...frames].sort((a, b) => a.ts - b.ts);
  // The frame that is on screen at startTs = the last one at or before it.
  let first = sorted.findIndex((f) => f.ts > startTs) - 1;
  if (first < 0) first = 0;
  const used = sorted.slice(first).filter((f) => f.ts <= endTs);
  if (!used.length) throw new Error('no frames in range');
  const lines = ['ffconcat version 1.0'];
  used.forEach((f, i) => {
    const t0 = Math.max(f.ts, startTs);
    const t1 = i + 1 < used.length ? used[i + 1].ts : endTs;
    const d = Math.max(0.001, t1 - t0);
    lines.push(`file '${f.file}'`, `duration ${d.toFixed(4)}`);
  });
  lines.push(`file '${used[used.length - 1].file}'`, 'duration 0.034'); // trailing repeat: explicit tiny duration, else ffconcat reuses the previous one
  const list = `${out}.txt`;
  writeFileSync(list, lines.join('\n') + '\n');
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', list, '-vf', `scale=${width}:${height},fps=${fps},format=yuv420p`, '-c:v', 'libx264', '-preset', 'medium', '-crf', '17', '-an', out]);
  return out;
}

export function dropFrames(dir) { rmSync(dir, { recursive: true, force: true }); }
