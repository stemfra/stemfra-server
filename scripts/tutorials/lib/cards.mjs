// Branded intro and outro cards, rendered as HTML and recorded with Playwright
// so they share the exact size, frame rate and codec of the main take. The
// intro animates the mark in, then the "Stemfra Help" label, then the title.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const LOGO = (root) => {
  const png = readFileSync(join(root, '..', 'stemfra_platform', 'stemfra_cms', 'public', 'stemfra_logo.png'));
  return `data:image/png;base64,${png.toString('base64')}`;
};

const BASE_CSS = `
  * { box-sizing: border-box; margin: 0; }
  html, body { width: 100%; height: 100%; overflow: hidden; }
  body { font-family: Inter, -apple-system, "Segoe UI", Helvetica, Arial, sans-serif; color: #fff;
    background: radial-gradient(120% 120% at 20% 10%, #4f46e5 0%, #3b82f6 45%, #1e1b4b 100%); }
  .wrap { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 22px; text-align: center; padding: 0 120px; }
  .mark { width: 132px; height: 132px; border-radius: 34px; background: rgba(255,255,255,.96); display: grid; place-items: center; box-shadow: 0 30px 60px rgba(0,0,0,.35); opacity: 0; transform: scale(.55); animation: pop .8s cubic-bezier(.2,.9,.3,1.2) .25s forwards; }
  .mark img { width: 84px; height: 84px; object-fit: contain; }
  .kicker { letter-spacing: .28em; font-size: 16px; text-transform: uppercase; opacity: 0; animation: rise .6s ease-out 1s forwards; color: rgba(255,255,255,.85); }
  .title { font-size: 54px; font-weight: 600; line-height: 1.12; letter-spacing: -.01em; max-width: 1100px; opacity: 0; animation: rise .7s ease-out 1.35s forwards; }
  .sub { font-size: 22px; opacity: 0; animation: rise .6s ease-out 1.7s forwards; color: rgba(255,255,255,.85); }
  .glow { position: absolute; width: 900px; height: 900px; border-radius: 50%; background: radial-gradient(circle, rgba(255,255,255,.16), transparent 60%); left: 55%; top: 40%; transform: translate(-50%,-50%); animation: drift 6s ease-in-out infinite alternate; }
  @keyframes pop { to { opacity: 1; transform: scale(1); } }
  @keyframes rise { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes drift { to { transform: translate(-45%,-55%) scale(1.15); } }
`;

export function introHtml(root, { title }) {
  return `<!doctype html><html><head><meta charset="utf-8"><style>${BASE_CSS}</style></head><body>
  <div class="glow"></div>
  <div class="wrap">
    <div class="mark"><img src="${LOGO(root)}" alt=""></div>
    <div class="kicker">Stemfra Help</div>
    <div class="title">${title}</div>
  </div></body></html>`;
}

export function outroHtml(root) {
  return `<!doctype html><html><head><meta charset="utf-8"><style>${BASE_CSS}
  .mark { animation-delay: .1s } .kicker { animation-delay: .7s } .title { animation-delay: .95s } .sub { animation-delay: 1.25s }
  </style></head><body>
  <div class="glow"></div>
  <div class="wrap">
    <div class="mark"><img src="${LOGO(root)}" alt=""></div>
    <div class="kicker">Discover more</div>
    <div class="title">stemfra.com/help</div>
    <div class="sub">Questions go under the video, or ask Stacy inside your CMS. support@stemfra.com</div>
  </div></body></html>`;
}
