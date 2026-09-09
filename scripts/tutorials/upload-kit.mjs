#!/usr/bin/env node
// Builds stemfra_video/tutorials/UPLOAD.md: one block per cut video with the
// YouTube title, description (the script's description + the standing series
// line naming every business type, + chapters + the help links), the cover
// path and the master path. Run after a batch:  node scripts/tutorials/upload-kit.mjs
import { readdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..', '..', '..', 'stemfra_video', 'tutorials');
const SERIES = 'Part of "Getting started with Stemfra", the how-to series for the Stemfra CMS. The same steps apply whether you run a barbershop, a salon, a CrossFit box, a yoga studio, a massage practice or a spa.';
const LINKS = 'Join Stemfra today: https://stemfra.com/start\nHelp: https://stemfra.com/help\nQuestions: leave a comment, or ask Stacy inside your CMS.';
// Peter 2026-09-09: a Squarespace-style "about the company" paragraph at the foot of every
// description, naming the business types, so the videos surface for those searches too.
const ABOUT = 'About Stemfra\nStemfra gives local businesses a website that takes the bookings. Barbershops, hair salons, CrossFit boxes, yoga studios, massage practices and spas pick a theme made for their kind of business, add their services and team, and publish. Every Stemfra website comes with online booking, automatic reminders, a front desk assistant that answers customers, reviews, invoices and a simple CMS built for busy owners. Start for free and pay when you publish.\n\nWebsite builder and online booking for barbershops, hair salons, CrossFit gyms, yoga and pilates studios, massage therapists and day spas.';
// Peter 2026-09-08: the Squarespace-style socials block waits until the handles exist and carry content.
const TAGS = 'Stemfra, website builder, small business website, booking website, barbershop website, salon website, CrossFit website, yoga studio website, massage website, spa website, CMS tutorial';

const dirs = readdirSync(root).filter((d) => /^\d\d-/.test(d)).sort();
const blocks = [];
for (const d of dirs) {
  const mp4 = join(root, d, `${d}.mp4`), mf = join(root, d, 'manifest.json'), ch = join(root, d, 'chapters.txt');
  if (!existsSync(mp4) || !existsSync(mf)) continue;
  const m = JSON.parse(readFileSync(mf, 'utf8'));
  const chapters = existsSync(ch) ? readFileSync(ch, 'utf8').split('\n').filter((l) => /^\d+:\d\d /.test(l)).join('\n') : '';
  const desc = readFileSync(ch, 'utf8').split('\n')[0];
  const mmss = `${Math.floor(m.total / 60)}:${String(Math.floor(m.total % 60)).padStart(2, '0')}`;
  blocks.push(`## ${d.slice(0, 2)}. ${m.title}

- Master: \`${mp4}\` (${m.size}, ${mmss})
- Cover: \`${join(root, d, 'cover.png')}\`
- Tags: ${TAGS}

**Title**

${m.title} | Stemfra CMS

**Description**

\`\`\`
${desc}

${SERIES}

Chapters
${chapters}

${LINKS}

${ABOUT}
\`\`\`
`);
}
const out = join(root, 'UPLOAD.md');
writeFileSync(out, `# YouTube upload kit: Getting started with Stemfra\n\nGenerated ${new Date().toISOString().slice(0, 10)} from the manifests in this folder. Playlist: "Getting started with Stemfra". Upload the master, set the cover as the thumbnail, paste the title and description, add the tags, add to the playlist.\n\n${blocks.join('\n')}`);
console.log(`wrote ${out} (${blocks.length} videos)`);
