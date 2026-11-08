/* The homepage universe: an original SVG scene (no images) with floating world
   islands around a central portal, an explorer and an AI companion. Island
   labels are real links to each world. Motion is CSS and stops when the scene is
   off screen, the tab is hidden, or the visitor prefers reduced motion. */
import { rng } from './player.js';

const r = rng(2100);
const f = (n) => n.toFixed(1);
let uid = 0; // unique gradient ids: several scenes can share one page

// A floating island: grassy top, rocky underside, optional waterfall.
function island(x, y, w, opts = {}) {
  const h = w * .16, depth = w * (opts.deep || .62), top = opts.top || ['#3E6B47', '#1D3B2A'], id = 'dki' + (++uid);
  const pts = []; const n = 9;
  for (let i = 0; i <= n; i++) { const t = i / n, px = x - w / 2 + t * w, jag = Math.sin(t * Math.PI) * depth * (.55 + r() * .45); pts.push(`${f(px)},${f(y + h * .4 + jag)}`); }
  const fall = opts.fall ? `<rect class="sc-fall" x="${f(x + w * opts.fall)}" y="${f(y + h * .3)}" width="${f(w * .035)}" height="${f(depth * 1.5)}" fill="url(#gFall)"/>` : '';
  return `<g class="sc-isle" style="--d:${(r() * 3).toFixed(2)}s">
    <defs><linearGradient id="${id}r" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3A3328"/><stop offset=".55" stop-color="#1A1A1E"/><stop offset="1" stop-color="#0B0E14" stop-opacity="0"/></linearGradient>
    <linearGradient id="${id}t" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${top[0]}"/><stop offset="1" stop-color="${top[1]}"/></linearGradient></defs>
    <polygon points="${f(x - w / 2)},${f(y + h * .4)} ${pts.join(' ')} ${f(x + w / 2)},${f(y + h * .4)}" fill="url(#${id}r)"/>
    ${fall}
    <ellipse cx="${f(x)}" cy="${f(y + h * .3)}" rx="${f(w / 2)}" ry="${f(h * .62)}" fill="url(#${id}t)"/>
    <ellipse cx="${f(x - w * .08)}" cy="${f(y + h * .12)}" rx="${f(w * .34)}" ry="${f(h * .3)}" fill="#fff" opacity=".06"/>
    ${opts.feature || ''}
  </g>`;
}
const trees = (x, y, n, s = 1) => Array.from({ length: n }, (_, i) => { const tx = x + (i - n / 2) * 14 * s + r() * 8, th = (18 + r() * 14) * s; return `<path d="M${f(tx)} ${f(y - th)} L${f(tx + 7 * s)} ${f(y)} L${f(tx - 7 * s)} ${f(y)}Z" fill="#163826"/>`; }).join('');

function fortress(x, y) { // Action: dark citadel with ember light
  const towers = [[-48, 70], [-22, 104], [6, 128], [32, 96], [58, 66]].map(([dx, h]) => `<rect x="${x + dx - 9}" y="${y - h}" width="18" height="${h}" fill="#1C1416"/><path d="M${x + dx - 11} ${y - h} L${x + dx} ${y - h - 22} L${x + dx + 11} ${y - h}Z" fill="#2A1A1A"/><rect x="${x + dx - 2}" y="${y - h + 20}" width="4" height="9" fill="#FF8A4C"/>`).join('');
  return `<ellipse cx="${x}" cy="${y - 40}" rx="110" ry="80" fill="url(#gEmber)" class="sc-pulse"/>${towers}<path d="M${x - 70} ${y} Q${x} ${y - 30} ${x + 76} ${y}" fill="#2A1A1A"/>`;
}
function track(x, y) { // Racing: banked ring with a car
  return `<ellipse cx="${x}" cy="${y - 14}" rx="118" ry="34" fill="none" stroke="#2B2F3A" stroke-width="16"/>
    <ellipse cx="${x}" cy="${y - 14}" rx="118" ry="34" fill="none" stroke="#F6C96B" stroke-width="2" stroke-dasharray="10 12" class="sc-dash"/>
    <ellipse cx="${x}" cy="${y - 14}" rx="96" ry="22" fill="#24452F"/>
    <g class="sc-car"><rect x="${x + 60}" y="${y + 6}" width="34" height="14" rx="6" fill="#E0663B"/><rect x="${x + 68}" y="${y + 2}" width="16" height="8" rx="3" fill="#2B1C1C"/></g>`;
}
function stadium(x, y) { // Sports: bowl with floodlights
  return `<ellipse cx="${x}" cy="${y - 18}" rx="104" ry="36" fill="#2A3240"/><ellipse cx="${x}" cy="${y - 22}" rx="84" ry="24" fill="#3F8A54"/>
    <ellipse cx="${x}" cy="${y - 22}" rx="34" ry="10" fill="none" stroke="#EAF1F8" stroke-opacity=".7" stroke-width="1.5"/>
    ${[-96, 96].map((dx) => `<rect x="${x + dx - 2}" y="${y - 90}" width="4" height="70" fill="#3A4150"/><ellipse cx="${x + dx}" cy="${y - 92}" rx="12" ry="6" fill="#FFF3D1" class="sc-pulse"/>`).join('')}`;
}
function cubes(x, y) { // Puzzle: stacked jewel cubes
  const c = ['#8C7CF0', '#F6C96B', '#5FB37C', '#E58FB0', '#4FA3D9', '#E0663B'];
  let s = ''; let k = 0;
  for (let row = 0; row < 3; row++) for (let i = 0; i < 3 - row; i++) {
    const cx = x - 34 + i * 26 + row * 13, cy = y - 22 - row * 24, col = c[k++ % c.length];
    s += `<path d="M${cx} ${cy} l12 -7 l12 7 l-12 7z" fill="${col}"/><path d="M${cx} ${cy} l12 7 v14 l-12 -7z" fill="${col}" opacity=".75"/><path d="M${cx + 24} ${cy} l-12 7 v14 l12 -7z" fill="${col}" opacity=".55"/>`;
  }
  return s;
}
function crystalCity(x, y) { // Multiplayer: crystal spires
  return [[-50, 60], [-26, 96], [0, 140], [24, 104], [50, 70], [72, 48]].map(([dx, h]) => `<path d="M${x + dx - 10} ${y} L${x + dx} ${y - h} L${x + dx + 10} ${y}Z" fill="url(#gCrystal)"/>`).join('') + `<ellipse cx="${x}" cy="${y - 60}" rx="90" ry="70" fill="url(#gIce)" class="sc-pulse"/>`;
}
function spires(x, y) { // Adventure: castle around the portal base
  return [[-120, 70], [-90, 110], [90, 120], [124, 76]].map(([dx, h]) => `<rect x="${x + dx - 8}" y="${y - h}" width="16" height="${h}" fill="#1E2B3A"/><path d="M${x + dx - 11} ${y - h} L${x + dx} ${y - h - 26} L${x + dx + 11} ${y - h}Z" fill="#2C3E52"/><rect x="${x + dx - 2}" y="${y - h + 18}" width="4" height="8" fill="#F6C96B"/>`).join('');
}
function skyline(x, y) { // Simulation: small city
  return [[-40, 40], [-24, 64], [-6, 50], [12, 80], [30, 56], [46, 36]].map(([dx, h]) => `<rect x="${x + dx - 8}" y="${y - h}" width="16" height="${h}" fill="#233447"/><rect x="${x + dx - 4}" y="${y - h + 8}" width="3" height="3" fill="#F6C96B"/><rect x="${x + dx + 2}" y="${y - h + 18}" width="3" height="3" fill="#F6C96B"/>`).join('');
}

function label(x, y, text, href, icon) {
  const w = 30 + text.length * 9.6;
  return `<a class="sc-label" href="${href}" aria-label="${text} world"><g transform="translate(${x} ${y})">
    <rect x="${-w / 2}" y="-20" width="${w}" height="40" rx="20" fill="rgba(7,24,39,.78)" stroke="rgba(246,201,107,.55)"/>
    <circle cx="${-w / 2 + 20}" cy="0" r="9" fill="#F6C96B"/><text x="${-w / 2 + 20}" y="4" text-anchor="middle" font-size="11" font-weight="700" fill="#071827">${icon}</text>
    <text x="${-w / 2 + 36}" y="6" font-size="17" font-weight="600" fill="#EAF1F8">${text}</text></g></a>`;
}

function explorer(x, y) {
  return `<g class="sc-hero-fig">
    <ellipse cx="${x + 30}" cy="${y + 128}" rx="230" ry="26" fill="#000" opacity=".35"/>
    <path d="M${x - 260} ${y + 160} Q${x - 120} ${y + 70} ${x + 40} ${y + 92} Q${x + 220} ${y + 70} ${x + 330} ${y + 160}Z" fill="#0D1118"/>
    <path d="M${x - 200} ${y + 120} Q${x - 60} ${y + 84} ${x + 60} ${y + 100}" stroke="#F6C96B" stroke-opacity=".18" stroke-width="2" fill="none"/>
    <!-- explorer, seen from behind -->
    <path d="M${x - 46} ${y + 98} Q${x - 52} ${y + 30} ${x - 30} ${y + 4} L${x + 30} ${y + 4} Q${x + 52} ${y + 30} ${x + 46} ${y + 98}Z" fill="#1A2330"/>
    <rect x="${x - 32}" y="${y + 18}" width="64" height="62" rx="14" fill="#232E3D"/>
    <circle cx="${x}" cy="${y + 48}" r="15" fill="none" stroke="#9FD8FF" stroke-width="3.5" class="sc-glow"/>
    <circle cx="${x}" cy="${y + 48}" r="5" fill="#CFEFFF" class="sc-glow"/>
    <circle cx="${x}" cy="${y - 14}" r="22" fill="#1B2028"/>
    <path d="M${x - 22} ${y - 16} Q${x - 18} ${y - 44} ${x + 4} ${y - 40} Q${x + 26} ${y - 38} ${x + 22} ${y - 12} Q${x + 10} ${y - 28} ${x - 6} ${y - 24}Z" fill="#11151B"/>
    <path d="M${x - 46} ${y + 30} Q${x - 50} ${y + 4} ${x - 26} ${y - 2}" stroke="#F6C96B" stroke-opacity=".45" stroke-width="2" fill="none"/>
    <path d="M${x + 46} ${y + 30} Q${x + 50} ${y + 4} ${x + 26} ${y - 2}" stroke="#F6C96B" stroke-opacity=".45" stroke-width="2" fill="none"/>
    <!-- AI companion -->
    <g class="sc-bot"><ellipse cx="${x - 104}" cy="${y + 96}" rx="20" ry="6" fill="#000" opacity=".4"/>
    <rect x="${x - 122}" y="${y + 50}" width="36" height="40" rx="12" fill="#2A3645"/>
    <circle cx="${x - 104}" cy="${y + 34}" r="22" fill="#33445A"/><rect x="${x - 120}" y="${y + 24}" width="32" height="18" rx="9" fill="#0A1018"/>
    <circle cx="${x - 112}" cy="${y + 33}" r="4" fill="#9FD8FF" class="sc-glow"/><circle cx="${x - 96}" cy="${y + 33}" r="4" fill="#9FD8FF" class="sc-glow"/>
    <path d="M${x - 104} ${y + 12} v-10" stroke="#5E718A" stroke-width="2"/><circle cx="${x - 104}" cy="${y}" r="3" fill="#F6C96B"/></g>
  </g>`;
}

export function universeSVG() {
  const stars = Array.from({ length: 140 }, () => `<circle cx="${f(r() * 1600)}" cy="${f(r() * 520)}" r="${f(r() * 1.3 + .3)}" opacity="${f(r() * .7 + .2)}"/>`).join('');
  const clouds = Array.from({ length: 14 }, () => { const cx = r() * 1600, cy = 420 + r() * 380; return `<ellipse cx="${f(cx)}" cy="${f(cy)}" rx="${f(180 + r() * 260)}" ry="${f(40 + r() * 60)}" fill="url(#gCloud)" opacity="${f(.35 + r() * .45)}"/>`; }).join('');
  return `<svg class="sc" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" role="img" aria-labelledby="scTitle">
  <title id="scTitle">A universe of floating game worlds around a glowing portal, with an explorer and a small AI companion looking out at them.</title>
  <defs>
    <radialGradient id="gSky" cx="58%" cy="42%" r="75%"><stop offset="0" stop-color="#2A3A52"/><stop offset=".35" stop-color="#11243A"/><stop offset=".7" stop-color="#071827"/><stop offset="1" stop-color="#05090F"/></radialGradient>
    <radialGradient id="gWarm" cx="60%" cy="62%" r="45%"><stop offset="0" stop-color="#F6C96B" stop-opacity=".55"/><stop offset=".5" stop-color="#C98A3A" stop-opacity=".18"/><stop offset="1" stop-color="#C98A3A" stop-opacity="0"/></radialGradient>
    <radialGradient id="gCloud"><stop offset="0" stop-color="#F3E3C3" stop-opacity=".55"/><stop offset=".6" stop-color="#8EA3B8" stop-opacity=".18"/><stop offset="1" stop-color="#8EA3B8" stop-opacity="0"/></radialGradient>
    <radialGradient id="gPortal"><stop offset="0" stop-color="#FFF7E6"/><stop offset=".35" stop-color="#BFE3FF"/><stop offset=".7" stop-color="#3E78B8" stop-opacity=".6"/><stop offset="1" stop-color="#0B2236" stop-opacity="0"/></radialGradient>
    <radialGradient id="gEmber"><stop offset="0" stop-color="#FF7A3C" stop-opacity=".6"/><stop offset="1" stop-color="#FF7A3C" stop-opacity="0"/></radialGradient>
    <radialGradient id="gIce"><stop offset="0" stop-color="#9FD8FF" stop-opacity=".45"/><stop offset="1" stop-color="#9FD8FF" stop-opacity="0"/></radialGradient>
    <linearGradient id="gCrystal" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#DDF2FF"/><stop offset="1" stop-color="#2E6FA8"/></linearGradient>
    <linearGradient id="gFall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#EAF6FF" stop-opacity=".9"/><stop offset="1" stop-color="#EAF6FF" stop-opacity="0"/></linearGradient>
    <linearGradient id="gRing" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FCE4A8"/><stop offset=".5" stop-color="#F6C96B"/><stop offset="1" stop-color="#9C6E22"/></linearGradient>
  </defs>
  <rect width="1600" height="900" fill="url(#gSky)"/>
  <g class="sc-stars" fill="#EAF1F8">${stars}</g>
  <rect width="1600" height="900" fill="url(#gWarm)"/>
  <g class="sc-layer" data-depth="6">
    ${island(760, 150, 150, { top: ['#3A5A4A', '#1E3328'], feature: trees(760, 152, 5, .8) })}
    ${island(1490, 360, 170, { top: ['#3D5266', '#1E2B3A'], feature: skyline(1490, 362) })}
  </g>
  <g class="sc-layer" data-depth="12">
    ${island(620, 250, 250, { top: ['#5A3A30', '#2A1A18'], fall: .66, feature: fortress(620, 262) })}
    ${island(1260, 250, 290, { top: ['#3E6B47', '#1D3B2A'], fall: .2, feature: stadium(1260, 262) })}
  </g>
  <g class="sc-portal">
    <circle cx="960" cy="360" r="170" fill="url(#gPortal)" class="sc-pulse"/>
    <circle cx="960" cy="360" r="128" fill="none" stroke="url(#gRing)" stroke-width="14"/>
    <circle cx="960" cy="360" r="112" fill="none" stroke="#F6C96B" stroke-opacity=".5" stroke-width="2" stroke-dasharray="4 10" class="sc-spin"/>
    <circle cx="960" cy="360" r="146" fill="none" stroke="#EAF1F8" stroke-opacity=".25" stroke-width="1.5" stroke-dasharray="2 14" class="sc-spin-r"/>
    <path d="M920 340 q40 -40 80 0 q-40 20 -80 0z" fill="#0B2236" opacity=".5"/>
  </g>
  <g class="sc-layer" data-depth="18">
    ${island(960, 520, 420, { top: ['#456F4C', '#1F3D2C'], fall: .3, deep: .5, feature: spires(960, 528) + trees(860, 530, 4) + trees(1060, 530, 4) })}
    ${island(1210, 500, 200, { top: ['#4A4472', '#25223F'], feature: cubes(1210, 508) })}
    ${island(540, 600, 300, { top: ['#3E6B47', '#1D3B2A'], fall: .78, feature: track(540, 612) })}
    ${island(1400, 640, 250, { top: ['#2F4D66', '#16283A'], fall: .25, feature: crystalCity(1400, 652) })}
  </g>
  <g class="sc-clouds">${clouds}</g>
  <g class="sc-labels">
    ${label(640, 120, 'Action', '#/world/action', '✦')}
    ${label(1260, 130, 'Sports', '#/world/sports', '●')}
    ${label(960, 568, 'Adventure', '#/world/adventure', '◆')}
    ${label(1240, 420, 'Puzzle', '#/world/puzzle', '■')}
    ${label(520, 520, 'Racing', '#/world/racing', '▶')}
    ${label(1420, 520, 'Multiplayer', '#/world/multiplayer', '⇄')}
  </g>
  ${explorer(1000, 700)}
</svg>`;
}

// Gentle parallax with the pointer on desktop, and pause motion when it can't be seen.
export function animateScene(root) {
  const svg = root.querySelector('.sc'); if (!svg) return () => {};
  const layers = [...svg.querySelectorAll('.sc-layer')];
  const fine = matchMedia('(pointer: fine)').matches;
  let raf = 0, tx = 0, ty = 0, cx = 0, cy = 0;
  const onMove = (e) => { const b = root.getBoundingClientRect(); tx = (e.clientX - b.left) / b.width - .5; ty = (e.clientY - b.top) / b.height - .5; if (!raf) raf = requestAnimationFrame(step); };
  const step = () => {
    cx += (tx - cx) * .08; cy += (ty - cy) * .08;
    layers.forEach((l) => { const d = +l.dataset.depth; l.style.transform = `translate(${(-cx * d).toFixed(2)}px, ${(-cy * d * .6).toFixed(2)}px)`; });
    raf = Math.abs(tx - cx) + Math.abs(ty - cy) > .001 ? requestAnimationFrame(step) : 0;
  };
  if (fine) root.addEventListener('pointermove', onMove);
  const io = new IntersectionObserver(([e]) => root.classList.toggle('is-off', !e.isIntersecting), { threshold: .05 });
  io.observe(root);
  const vis = () => root.classList.toggle('is-hidden', document.hidden);
  document.addEventListener('visibilitychange', vis);
  return () => { io.disconnect(); cancelAnimationFrame(raf); root.removeEventListener('pointermove', onMove); document.removeEventListener('visibilitychange', vis); };
}

// Small island scene for a world portal card (same artwork language as the universe).
const WORLD_ART = {
  action: { top: ['#5A3A30', '#2A1A18'], feature: (x, y) => fortress(x, y), sky: '#3A1E1A', glow: '#FF7A3C' },
  racing: { top: ['#3E6B47', '#1D3B2A'], feature: (x, y) => track(x, y), sky: '#2E2A1C', glow: '#F6C96B' },
  sports: { top: ['#3E6B47', '#1D3B2A'], feature: (x, y) => stadium(x, y), sky: '#1C2E24', glow: '#FFF3D1' },
  puzzle: { top: ['#4A4472', '#25223F'], feature: (x, y) => cubes(x, y), sky: '#221E3A', glow: '#8C7CF0' },
  adventure: { top: ['#456F4C', '#1F3D2C'], feature: (x, y) => spires(x, y) + trees(x, y + 4, 4), sky: '#16283A', glow: '#9FD8FF' },
  strategy: { top: ['#5A4A30', '#2A2218'], feature: (x, y) => spires(x, y), sky: '#2A2416', glow: '#C9A15A' },
  simulation: { top: ['#3D5266', '#1E2B3A'], feature: (x, y) => skyline(x, y), sky: '#142A30', glow: '#6FC1B5' },
  multiplayer: { top: ['#2F4D66', '#16283A'], feature: (x, y) => crystalCity(x, y), sky: '#1E1A30', glow: '#E58FB0' },
  ai: { top: ['#24345A', '#121A30'], feature: (x, y) => `<circle cx="${x}" cy="${y - 70}" r="56" fill="url(#gPortal)" class="sc-pulse"/><circle cx="${x}" cy="${y - 70}" r="40" fill="none" stroke="url(#gRing)" stroke-width="6"/>`, sky: '#0E1A30', glow: '#7FD3F0' }
};
export function worldArt(id) {
  const a = WORLD_ART[id] || WORLD_ART.adventure;
  return `<svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
    <defs><radialGradient id="wa${id}" cx="50%" cy="38%" r="70%"><stop offset="0" stop-color="${a.glow}" stop-opacity=".45"/><stop offset=".5" stop-color="${a.sky}"/><stop offset="1" stop-color="#05090F"/></radialGradient>
    <radialGradient id="gPortal"><stop offset="0" stop-color="#FFF7E6"/><stop offset=".35" stop-color="#BFE3FF"/><stop offset=".7" stop-color="#3E78B8" stop-opacity=".6"/><stop offset="1" stop-color="#0B2236" stop-opacity="0"/></radialGradient>
    <radialGradient id="gEmber"><stop offset="0" stop-color="#FF7A3C" stop-opacity=".6"/><stop offset="1" stop-color="#FF7A3C" stop-opacity="0"/></radialGradient>
    <radialGradient id="gIce"><stop offset="0" stop-color="#9FD8FF" stop-opacity=".45"/><stop offset="1" stop-color="#9FD8FF" stop-opacity="0"/></radialGradient>
    <linearGradient id="gCrystal" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#DDF2FF"/><stop offset="1" stop-color="#2E6FA8"/></linearGradient>
    <linearGradient id="gFall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#EAF6FF" stop-opacity=".9"/><stop offset="1" stop-color="#EAF6FF" stop-opacity="0"/></linearGradient>
    <linearGradient id="gRing" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FCE4A8"/><stop offset=".5" stop-color="#F6C96B"/><stop offset="1" stop-color="#9C6E22"/></linearGradient></defs>
    <rect width="400" height="300" fill="url(#wa${id})"/>
    ${island(200, 200, 280, { top: a.top, fall: .72, deep: .45, feature: a.feature(200, 210) })}
  </svg>`;
}
