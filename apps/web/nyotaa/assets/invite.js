/* NYOTAA invitation engine. Pure string rendering (no DOM), so the same code
   builds the homepage at build time and re-renders personalised invitations in
   the browser. Every design is typography and line-art ornament drawn in SVG:
   no photographs, no emoji. Sample names, dates and venues are fictional. */

export const OCCASIONS = [
  { id: 'wedding', name: 'Wedding', line: 'Vows, rituals and celebrations' },
  { id: 'engagement', name: 'Engagement', line: 'The promise before the vows' },
  { id: 'birthday', name: 'Birthday', line: 'Milestones worth a celebration' },
  { id: 'anniversary', name: 'Anniversary', line: 'Years together, honoured' },
  { id: 'babyshower', name: 'Baby Shower', line: 'Welcoming someone small' },
  { id: 'housewarming', name: 'Housewarming', line: 'A new door, opened' },
  { id: 'cultural', name: 'Religious & Cultural', line: 'Festivals, pujas and blessings' },
  { id: 'corporate', name: 'Corporate Events', line: 'Summits, launches and galas' },
  { id: 'graduation', name: 'Graduation', line: 'The next chapter begins' },
  { id: 'other', name: 'Other Celebrations', line: 'Every gathering that matters' }
];

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const n = (v) => +v.toFixed(1);

/* ───────── Ornaments (line art) ───────── */
function petals(cx, cy, r, count, len, w) {
  let d = '';
  for (let i = 0; i < count; i++) {
    const a = (i / count) * Math.PI * 2, ca = Math.cos(a), sa = Math.sin(a);
    const x1 = cx + ca * r, y1 = cy + sa * r, x2 = cx + ca * (r + len), y2 = cy + sa * (r + len);
    const px = -sa * w, py = ca * w, mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
    d += `M${n(x1)} ${n(y1)}Q${n(mx + px)} ${n(my + py)} ${n(x2)} ${n(y2)}Q${n(mx - px)} ${n(my - py)} ${n(x1)} ${n(y1)}Z`;
  }
  return d;
}
function leafBranch(x, y, len, angle, count, size, flip = 1) {
  let d = `M${x} ${y}`; const pts = [];
  for (let i = 1; i <= count; i++) {
    const t = i / count, bx = x + Math.cos(angle) * len * t, by = y + Math.sin(angle) * len * t - Math.sin(t * Math.PI) * len * .12 * flip;
    pts.push([bx, by]); d += `L${n(bx)} ${n(by)}`;
  }
  pts.forEach(([bx, by], i) => {
    [1, -1].forEach((side) => {
      const a = angle + side * .9 * flip - .2, s = size * (1 - i / (count * 1.6));
      const tx = bx + Math.cos(a) * s, ty = by + Math.sin(a) * s, cxl = bx + Math.cos(a - .5) * s * .6, cyl = by + Math.sin(a - .5) * s * .6, cxr = bx + Math.cos(a + .5) * s * .6, cyr = by + Math.sin(a + .5) * s * .6;
      d += `M${n(bx)} ${n(by)}Q${n(cxl)} ${n(cyl)} ${n(tx)} ${n(ty)}Q${n(cxr)} ${n(cyr)} ${n(bx)} ${n(by)}`;
    });
  });
  return d;
}

export const ORNAMENTS = {
  arch: (c) => `<path d="M40 528V210A140 140 0 0 1 320 210V528Z" fill="none" stroke="${c}" stroke-width="1.4"/>
    <path d="M50 518V214A130 130 0 0 1 310 214V518Z" fill="none" stroke="${c}" stroke-width=".6" opacity=".7"/>
    <path d="${petals(180, 84, 4, 8, 10, 3.2)}" fill="none" stroke="${c}" stroke-width=".9"/><circle cx="180" cy="84" r="2.2" fill="${c}"/>`,
  floral: (c) => `<g fill="none" stroke="${c}" stroke-width="1" stroke-linecap="round">
    <path d="${leafBranch(40, 520, 120, -1.05, 6, 16)}"/><path d="${leafBranch(320, 520, 120, -2.09, 6, 16, -1)}"/>
    <path d="${petals(52, 506, 5, 6, 11, 4)}"/><path d="${petals(308, 506, 5, 6, 11, 4)}"/></g>`,
  mandala: (c) => `<g fill="none" stroke="${c}" stroke-width=".9">
    <circle cx="180" cy="104" r="44"/><circle cx="180" cy="104" r="38" opacity=".6"/>
    <path d="${petals(180, 104, 14, 12, 22, 6)}"/><path d="${petals(180, 104, 44, 24, 14, 3.4)}"/>
    <circle cx="180" cy="104" r="6" fill="${c}"/></g>
    <g stroke="${c}" stroke-width=".7" fill="none" opacity=".8"><path d="M28 28h304v504H28z"/><path d="M36 36h288v488H36z"/>
    <path d="${petals(28, 28, 2, 4, 12, 3)}${petals(332, 28, 2, 4, 12, 3)}${petals(28, 532, 2, 4, 12, 3)}${petals(332, 532, 2, 4, 12, 3)}"/></g>`,
  sprig: (c) => `<g fill="none" stroke="${c}" stroke-width="1" stroke-linecap="round">
    <path d="${leafBranch(118, 84, 124, -.05, 7, 13)}"/><path d="${leafBranch(242, 88, 120, 3.19, 7, 13, -1)}"/>
    <path d="${leafBranch(150, 470, 90, .12, 5, 10)}"/></g>`,
  confetti: (c, c2) => {
    let s = '', k = 7;
    const rnd = () => ((k = (k * 9301 + 49297) % 233280) / 233280);
    for (let i = 0; i < 46; i++) {
      const x = 20 + rnd() * 320, y = 20 + rnd() * 520; if (y > 150 && y < 430 && x > 70 && x < 290) continue;
      const col = rnd() < .65 ? c : c2, r = rnd() * 360;
      s += rnd() < .5 ? `<rect x="${n(x)}" y="${n(y)}" width="${n(3 + rnd() * 6)}" height="${n(2 + rnd() * 2)}" fill="${col}" transform="rotate(${n(r)} ${n(x)} ${n(y)})"/>` : `<circle cx="${n(x)}" cy="${n(y)}" r="${n(1 + rnd() * 2.2)}" fill="${col}"/>`;
    }
    return s;
  },
  moon: (c) => `<g fill="none" stroke="${c}" stroke-width="1.1" stroke-linecap="round">
    <path d="M196 64a34 34 0 1 0 22 52a28 28 0 1 1 -22 -52z"/>
    ${[[110, 70, 5], [262, 96, 6], [92, 150, 3.5], [276, 168, 4], [150, 40, 3]].map(([x, y, r]) => `<path d="M${x} ${y - r * 2}v${r * 4}M${x - r * 2} ${y}h${r * 4}M${x - r} ${y - r}l${r * 2} ${r * 2}M${x + r} ${y - r}l${-r * 2} ${r * 2}" opacity=".85"/>`).join('')}
    <path d="M60 520c40-26 80-26 120 0s80 26 120 0" opacity=".6"/></g>`,
  door: (c) => `<g fill="none" stroke="${c}" stroke-width="1.2" stroke-linecap="round">
    <path d="M140 196V100a40 40 0 0 1 80 0v96"/><path d="M148 196V102a32 32 0 0 1 64 0v94"/><path d="M180 70v126"/>
    <circle cx="170" cy="150" r="2.4" fill="${c}"/><circle cx="190" cy="150" r="2.4" fill="${c}"/>
    <path d="M126 196h108M118 204h124"/><path d="${leafBranch(110, 196, 44, -1.9, 4, 10, -1)}"/><path d="${leafBranch(250, 196, 44, -1.25, 4, 10)}"/></g>`,
  diya: (c) => `<g fill="none" stroke="${c}" stroke-width="1.2" stroke-linecap="round">
    <path d="M144 132c10 22 62 22 72 0M138 132h84"/><path d="M152 142c8 10 48 10 56 0"/>
    <path d="M180 126c-10-12-6-26 0-36c6 10 10 24 0 36z" fill="${c}" opacity=".9"/>
    <path d="${petals(180, 104, 40, 16, 10, 3.2)}" opacity=".55"/></g>
    <g stroke="${c}" stroke-width=".7" fill="none" opacity=".7"><rect x="26" y="26" width="308" height="508" rx="6"/>
    ${[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => `<path d="${petals(52 + i * 32, 520, 2, 6, 6, 2)}"/>`).join('')}</g>`,
  laurel: (c) => `<g fill="none" stroke="${c}" stroke-width="1.1" stroke-linecap="round">
    <path d="${leafBranch(166, 150, 74, -2.35, 7, 12, -1)}"/><path d="${leafBranch(194, 150, 74, -.79, 7, 12)}"/>
    <path d="M168 154l12 8l12-8" /></g>`,
  geometric: (c) => `<g stroke="${c}" stroke-width=".7" fill="none" opacity=".8">
    ${[0, 1, 2, 3, 4, 5].map((i) => `<path d="M${200 + i * 26} 0L360 ${160 - i * 26}"/>`).join('')}
    <path d="M28 470h120"/><circle cx="300" cy="420" r="60" opacity=".5"/><circle cx="300" cy="420" r="40" opacity=".35"/></g>`,
  rings: (c) => `<g fill="none" stroke="${c}" stroke-width="1.6"><circle cx="58" cy="74" r="22"/><circle cx="82" cy="74" r="22"/>
    <path d="${petals(82, 48, 1, 5, 6, 2.4)}" stroke-width="1"/></g>${ORNAMENTS.floral(c)}`
};

/* ───────── Designs ───────── */
const D = (o) => o;
export const TEMPLATES = [
  D({ id: 'aurelia', name: 'Aurelia', occasion: 'wedding', layout: 'arch', ornaments: ['arch', 'floral'],
    desc: 'Ivory paper, a champagne arch and hand-drawn botanicals for a timeless ceremony.',
    pal: { bg: '#FBF6EC', bg2: '#F3EADB', ink: '#2B2620', accent: '#B8924A', soft: '#8C7B66' },
    data: { kicker: 'Together with their families', title: 'Ananya', title2: 'Kabir', joiner: '&', line: 'request the pleasure of your company at their wedding', date: '2027-02-14', time: '18:30', venue: 'The Orchard House', address: 'Alibaug, Maharashtra', note: 'Dinner and dancing to follow',
      schedule: [['Haldi', 'Feb 13 · 10:00'], ['Sangeet', 'Feb 13 · 19:00'], ['Wedding', 'Feb 14 · 18:30']] } }),
  D({ id: 'mehr', name: 'Mehr', occasion: 'wedding', layout: 'royal', ornaments: ['mandala'],
    desc: 'Deep garnet and gold mandala work for a regal, ceremonial wedding.',
    pal: { bg: '#4A1520', bg2: '#2E0B13', ink: '#F6E7CF', accent: '#D8B26E', soft: '#C9A5A0' },
    data: { kicker: 'Shubh Vivah', title: 'Ishita', title2: 'Rohan', joiner: '&', line: 'invite you to bless their union', date: '2027-12-05', time: '19:00', venue: 'Rambagh Courtyard', address: 'Jaipur, Rajasthan', note: 'Baraat at 18:00',
      schedule: [['Mehendi', 'Dec 3 · 16:00'], ['Sangeet', 'Dec 4 · 19:30'], ['Pheras', 'Dec 5 · 19:00']] } }),
  D({ id: 'solenne', name: 'Solenne', occasion: 'engagement', layout: 'arch', top: 116, ornaments: ['sprig'],
    desc: 'Sage paper and delicate olive sprigs for an intimate engagement.',
    pal: { bg: '#EEF1E8', bg2: '#E1E7D8', ink: '#27311F', accent: '#6F7F57', soft: '#6E7766' },
    data: { kicker: 'Please join us to celebrate the engagement of', title: 'Zara', title2: 'Arjun', joiner: 'and', line: 'an evening of toasts, music and good company', date: '2027-04-17', time: '19:30', venue: 'The Glasshouse', address: 'Bengaluru, Karnataka', note: 'Garden cocktail attire',
      schedule: [['Welcome drinks', '19:30'], ['Ring ceremony', '20:15'], ['Dinner', '21:00']] } }),
  D({ id: 'noir', name: 'Confetti Noir', occasion: 'birthday', layout: 'modern', ornaments: ['confetti'], numeral: '30',
    desc: 'Black card, gold confetti and a bold milestone numeral.',
    pal: { bg: '#161412', bg2: '#0D0C0B', ink: '#F4ECDD', accent: '#D9BC84', soft: '#9C9286' },
    data: { kicker: 'You are invited', title: 'Meera', title2: 'turns thirty', joiner: '', line: 'Join us for a night of dinner, music and celebration', date: '2027-03-20', time: '20:00', venue: 'Sky Lounge, Level 24', address: 'Lower Parel, Mumbai', note: 'Dress code: black and gold',
      schedule: [['Arrivals', '20:00'], ['Dinner', '21:00'], ['Cake & toasts', '22:30']] } }),
  D({ id: 'silverline', name: 'Silverline', occasion: 'anniversary', layout: 'modern', ornaments: ['rings'], numeral: '25',
    desc: 'Blush and silver for a quarter century of togetherness.',
    pal: { bg: '#F6EEEA', bg2: '#EDE1DB', ink: '#3A2E2E', accent: '#9B8A8F', soft: '#8A7A78' },
    data: { kicker: 'Celebrating twenty-five years of', title: 'Priya', title2: 'Vikram', joiner: '&', line: 'join us as we renew our vows and raise a glass', date: '2027-06-12', time: '19:00', venue: 'The Willow Room', address: 'New Delhi', note: 'Your presence is our gift',
      schedule: [['Vow renewal', '19:00'], ['Dinner', '20:00'], ['First dance, again', '21:30']] } }),
  D({ id: 'lumi', name: 'Little Moon', occasion: 'babyshower', layout: 'arch', top: 168, ornaments: ['moon'],
    desc: 'Powder blue, a crescent moon and soft stars for a gentle welcome.',
    pal: { bg: '#EEF3F7', bg2: '#E2EAF1', ink: '#24364A', accent: '#7E9BB8', soft: '#6B7F93' },
    data: { kicker: 'A little one is on the way', title: 'Baby Shower', title2: 'for Naina', joiner: '', line: 'Join us for an afternoon of tea, games and blessings', date: '2027-05-09', time: '15:00', venue: 'The Courtyard Café', address: 'Pune, Maharashtra', note: 'Gifts are optional; your blessings are not',
      schedule: [['High tea', '15:00'], ['Games', '16:00'], ['Blessings', '17:00']] } }),
  D({ id: 'hearth', name: 'Hearth', occasion: 'housewarming', layout: 'arch', top: 222, ornaments: ['door'],
    desc: 'Terracotta on cream with an arched doorway for a new beginning.',
    pal: { bg: '#FAF2E8', bg2: '#F1E3D2', ink: '#3A2418', accent: '#B5603E', soft: '#8A6A58' },
    data: { kicker: 'Our door is open', title: 'The Mehta', title2: 'Home', joiner: '', line: 'Join us for griha pravesh and dinner in our new home', date: '2027-01-24', time: '11:00', venue: 'Flat 1402, Palm Grove', address: 'Gurugram, Haryana', note: 'Puja at 11:00, lunch to follow',
      schedule: [['Griha pravesh puja', '11:00'], ['Lunch', '13:00']] } }),
  D({ id: 'diya', name: 'Deepam', occasion: 'cultural', layout: 'royal', ornaments: ['diya'],
    desc: 'Midnight indigo and a glowing diya for festivals and pujas.',
    pal: { bg: '#1C2148', bg2: '#11142E', ink: '#F3E8D2', accent: '#E3B85F', soft: '#AEB1CC' },
    data: { kicker: 'With blessings, we invite you to our', title: 'Diwali', title2: 'Lakshmi Puja', joiner: '', line: 'An evening of prayer, lights and sweets with family', date: '2027-10-29', time: '18:30', venue: 'The Sharma Residence', address: 'Ahmedabad, Gujarat', note: 'Traditional attire welcome',
      schedule: [['Puja', '18:30'], ['Diyas & rangoli', '19:30'], ['Dinner', '20:30']] } }),
  D({ id: 'meridian', name: 'Meridian', occasion: 'corporate', layout: 'modern', ornaments: ['geometric'],
    desc: 'Navy and champagne with fine geometry for summits and launches.',
    pal: { bg: '#0F1D31', bg2: '#0A1424', ink: '#EEF0F3', accent: '#CDB27A', soft: '#9AA6B6' },
    data: { kicker: 'Halcyon Group invites you to the', title: 'Leadership', title2: 'Summit 2027', joiner: '', line: 'A day of keynotes, conversations and the year ahead', date: '2027-09-16', time: '09:30', venue: 'Grand Hall, Taj Convention Centre', address: 'Hyderabad, Telangana', note: 'Business formal · Registration from 09:00',
      schedule: [['Registration', '09:00'], ['Opening keynote', '09:30'], ['Panels', '11:00'], ['Evening reception', '18:30']] } }),
  D({ id: 'laurel', name: 'Laurel', occasion: 'graduation', layout: 'royal', ornaments: ['laurel'],
    desc: 'Emerald and gold laurels for the moment the tassel turns.',
    pal: { bg: '#123528', bg2: '#0B241B', ink: '#F1EBDD', accent: '#D4B36C', soft: '#A9BCAF' },
    data: { kicker: 'Please celebrate with us', title: 'Aditya', title2: 'Class of 2027', joiner: '', line: 'as he graduates with a degree in Architecture', date: '2027-06-26', time: '17:00', venue: 'The Lawn, Riverside Club', address: 'Chennai, Tamil Nadu', note: 'Dinner to follow',
      schedule: [['Toasts', '17:00'], ['Dinner', '18:30']] } })
];
export const templateById = Object.fromEntries(TEMPLATES.map((t) => [t.id, t]));
export const occasionById = Object.fromEntries(OCCASIONS.map((o) => [o.id, o]));

/* ───────── Dates ───────── */
export function formatDate(iso, style = 'long') {
  const d = new Date(iso + 'T00:00:00'); if (isNaN(d)) return '';
  if (style === 'parts') return { day: d.toLocaleDateString('en-GB', { weekday: 'long' }), date: d.getDate(), month: d.toLocaleDateString('en-GB', { month: 'long' }), year: d.getFullYear() };
  return d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}
export function formatTime(t) {
  if (!/^\d{2}:\d{2}$/.test(t || '')) return esc(t || '');
  const [h, m] = t.split(':').map(Number); return `${((h + 11) % 12) + 1}${m ? ':' + String(m).padStart(2, '0') : ''} ${h < 12 ? 'AM' : 'PM'}`;
}

/* ───────── The invitation card (front) ───────── */
export function card(t, data = t.data, opts = {}) {
  const d = { ...t.data, ...data }, p = t.pal, parts = formatDate(d.date, 'parts');
  const orn = t.ornaments.map((k) => ORNAMENTS[k](p.accent, p.soft)).join('');
  const names = d.title2 && d.joiner
    ? `<p class="iv-names"><span>${esc(d.title)}</span><i>${esc(d.joiner)}</i><span>${esc(d.title2)}</span></p>`
    : `<p class="iv-names iv-single"><span>${esc(d.title)}</span>${d.title2 ? `<small>${esc(d.title2)}</small>` : ''}</p>`;
  return `<div class="iv iv-${t.layout}" style="${t.top ? `--top:${t.top};` : ''}--bg:${p.bg};--bg2:${p.bg2};--ink:${p.ink};--accent:${p.accent};--soft:${p.soft}"${opts.label ? ` role="img" aria-label="${esc(opts.label)}"` : ''}>
    <svg class="iv-orn" viewBox="0 0 360 560" aria-hidden="true">${orn}</svg>
    ${t.numeral ? `<span class="iv-num" aria-hidden="true">${esc(t.numeral)}</span>` : ''}
    <div class="iv-body">
      <p class="iv-kicker">${esc(d.kicker)}</p>
      ${names}
      <p class="iv-line">${esc(d.line)}</p>
      ${parts ? `<p class="iv-date"><span>${parts.day}</span><b>${parts.date}</b><span>${parts.month} ${parts.year}</span></p>` : ''}
      <p class="iv-time">${formatTime(d.time)}</p>
      <p class="iv-venue">${esc(d.venue)}<small>${esc(d.address)}</small></p>
      ${d.note ? `<p class="iv-note">${esc(d.note)}</p>` : ''}
    </div>
  </div>`;
}

/* ───────── The guest experience (what a guest sees on their phone) ───────── */
export function guestPage(t, data = t.data, opts = {}) {
  const d = { ...t.data, ...data }, p = t.pal, title = d.title2 && d.joiner ? `${d.title} ${d.joiner} ${d.title2}` : `${d.title}${d.title2 ? ' ' + d.title2 : ''}`;
  const maps = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${d.venue}, ${d.address}`)}`;
  return `<article class="gp${opts.opened ? ' is-open' : ''}" style="--bg:${p.bg};--bg2:${p.bg2};--ink:${p.ink};--accent:${p.accent};--soft:${p.soft}" data-date="${esc(d.date)}" data-time="${esc(d.time)}" data-title="${esc(title)}" data-venue="${esc(d.venue + ', ' + d.address)}">
    <div class="gp-env" aria-hidden="${opts.opened ? 'true' : 'false'}">
      <div class="gp-env-flap"></div>
      <div class="gp-seal"><svg viewBox="0 0 40 40" aria-hidden="true"><path d="${petals(20, 20, 3, 8, 9, 3)}" fill="none" stroke="currentColor" stroke-width="1"/></svg></div>
      <p class="gp-env-to">${esc(opts.guest || 'For you')}</p>
      <button type="button" class="gp-open" data-open>Open invitation</button>
    </div>
    <div class="gp-scroll">
      <div class="gp-card"><div class="ivw">${card(t, d)}</div></div>
      <section class="gp-sec"><h3>The day</h3>
        <p class="gp-big">${formatDate(d.date)}</p><p>${formatTime(d.time)} · ${esc(d.venue)}</p>
        <p class="gp-count" data-countdown></p></section>
      ${d.schedule && d.schedule.length ? `<section class="gp-sec"><h3>Schedule</h3><ol class="gp-sched">${d.schedule.map(([a, b]) => `<li><span>${esc(a)}</span><b>${esc(b)}</b></li>`).join('')}</ol></section>` : ''}
      <section class="gp-sec"><h3>Venue</h3><p class="gp-big">${esc(d.venue)}</p><p>${esc(d.address)}</p>
        <a class="gp-btn" href="${maps}" target="_blank" rel="noopener">Open in Maps</a></section>
      ${d.note ? `<section class="gp-sec gp-note"><p>${esc(d.note)}</p></section>` : ''}
      <div class="gp-acts"><button type="button" class="gp-btn gp-solid" data-ics>Add to calendar</button></div>
      <p class="gp-foot">Sent with NYOTAA</p>
    </div>
  </article>`;
}

/* ───────── Share links ───────── */
// Personalised details travel in the link itself, base64url-encoded, so a preview can be shared before accounts exist.
const FIELDS = ['kicker', 'title', 'title2', 'joiner', 'line', 'date', 'time', 'venue', 'address', 'note'];
export function encodeData(data) {
  const o = {}; FIELDS.forEach((k) => { if (data[k] !== undefined) o[k] = String(data[k]).slice(0, 160); });
  const json = JSON.stringify(o);
  const b64 = typeof btoa === 'function' ? btoa(unescape(encodeURIComponent(json))) : Buffer.from(json).toString('base64');
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
export function decodeData(s) {
  try {
    const b64 = s.replace(/-/g, '+').replace(/_/g, '/');
    const json = typeof atob === 'function' ? decodeURIComponent(escape(atob(b64))) : Buffer.from(b64, 'base64').toString();
    const o = JSON.parse(json), out = {};
    FIELDS.forEach((k) => { if (typeof o[k] === 'string') out[k] = o[k].slice(0, 160); });
    return out;
  } catch (e) { return {}; }
}
