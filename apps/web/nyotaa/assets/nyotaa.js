/* NYOTAA homepage interactions. Links are built from the address the page is
   opened on, so they keep working when the site moves to its permanent domain. */
import { TEMPLATES, templateById, occasionById, card, guestPage, encodeData, decodeData } from './invite.js';

document.documentElement.classList.add('js');
const CONFIG = JSON.parse(document.getElementById('nyConfig').textContent);
const reduce = matchMedia('(prefers-reduced-motion: reduce)');
const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const pageBase = () => location.origin + location.pathname;
// A shareable preview link: the design id plus the personalised details, carried in the link.
const inviteLink = (id, data) => `${pageBase()}#invite=${id}${data && Object.keys(data).length ? '.' + encodeData(data) : ''}`;
const titleOf = (t, d) => (d.title2 && d.joiner ? `${d.title} ${d.joiner} ${d.title2}` : `${d.title}${d.title2 ? ' ' + d.title2 : ''}`);

/* ───────── Navigation ───────── */
const nav = $('#nyNav'), burger = $('#nyBurger'), menu = $('#nyMenu');
const onScroll = () => nav.classList.toggle('is-solid', scrollY > 20);
addEventListener('scroll', onScroll, { passive: true }); onScroll();
function setMenu(open) { menu.hidden = !open; burger.setAttribute('aria-expanded', String(open)); burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu'); document.body.style.overflow = open ? 'hidden' : ''; }
burger.addEventListener('click', () => setMenu(menu.hidden));
menu.addEventListener('click', (e) => { if (e.target.closest('a, button')) setMenu(false); });

/* ───────── Reveal on scroll ───────── */
if ('IntersectionObserver' in window && !reduce.matches) {
  const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -10% 0px' });
  $$('.ny-sec .ny-head, .oc, .hw, .why-grid li, .sh, .faq-list, .final-in').forEach((el) => { if (el.getBoundingClientRect().top > innerHeight) { el.classList.add('rv'); io.observe(el); } });
}

/* ───────── Design filter and occasion shortcuts ───────── */
const status = $('#desStatus');
function filter(occ, announce = true) {
  const has = occ === 'all' || TEMPLATES.some((t) => t.occasion === occ);
  const key = has ? occ : 'all';
  $$('.des-filter .chip').forEach((c) => c.setAttribute('aria-pressed', String(c.dataset.filter === key)));
  let shown = 0;
  $$('#dcGrid .dc').forEach((li) => { const on = key === 'all' || li.dataset.occ === key; li.hidden = !on; if (on) shown++; });
  if (announce) status.textContent = !has ? `New ${occasionById[occ].name.toLowerCase()} designs are on their way. Every design can be personalised for any occasion; here are all ${shown}.`
    : key === 'all' ? `Showing all ${shown} designs.` : `Showing ${shown} ${occasionById[key].name.toLowerCase()} ${shown === 1 ? 'design' : 'designs'}.`;
}
$$('.des-filter .chip').forEach((c) => c.addEventListener('click', () => filter(c.dataset.filter)));
$$('[data-occasion]').forEach((a) => a.addEventListener('click', () => filter(a.dataset.occasion)));
$$('[data-create]').forEach((a) => a.addEventListener('click', () => { filter('all', false); status.textContent = 'Choose a design to begin, then select Customise to make it yours.'; }));

/* ───────── Guest experience behaviour (works in every phone on the page) ───────── */
function countdowns(root = document) {
  $$('[data-countdown]', root).forEach((el) => {
    const gp = el.closest('.gp'), d = new Date(`${gp.dataset.date}T${/^\d\d:\d\d$/.test(gp.dataset.time) ? gp.dataset.time : '00:00'}:00`);
    if (isNaN(d)) { el.textContent = ''; return; }
    const days = Math.ceil((d - Date.now()) / 864e5);
    el.textContent = days > 1 ? `In ${days} days` : days === 1 ? 'Tomorrow' : days === 0 ? 'Today' : 'This celebration has taken place';
  });
}
function ics(gp) {
  const [y, m, d] = gp.dataset.date.split('-'), [hh, mm] = (/^\d\d:\d\d$/.test(gp.dataset.time) ? gp.dataset.time : '18:00').split(':');
  const start = `${y}${m}${d}T${hh}${mm}00`, endH = String(Math.min(23, +hh + 3)).padStart(2, '0');
  const clean = (s) => String(s).replace(/[,;\\]/g, (c) => '\\' + c).replace(/\n/g, ' ');
  const body = ['BEGIN:VCALENDAR', 'VERSION:2.0', `PRODID:-//${CONFIG.name}//Invitation//EN`, 'BEGIN:VEVENT', `UID:${start}-${Math.random().toString(36).slice(2)}@invitation`,
    `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+/, '')}`, `DTSTART:${start}`, `DTEND:${y}${m}${d}T${endH}${mm}00`,
    `SUMMARY:${clean(gp.dataset.title)}`, `LOCATION:${clean(gp.dataset.venue)}`, 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([body], { type: 'text/calendar' })); a.download = `${gp.dataset.title.replace(/[^\w]+/g, '-').toLowerCase()}.ics`;
  document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
}
document.addEventListener('click', (e) => {
  const open = e.target.closest('[data-open]');
  if (open) { const gp = open.closest('.gp'); gp.classList.add('is-open'); countdowns(gp); const sc = $('.gp-scroll', gp); if (sc) { sc.scrollTop = 0; setTimeout(() => sc.focus && sc.focus({ preventScroll: true }), 50); } return; }
  const cal = e.target.closest('[data-ics]'); if (cal) { ics(cal.closest('.gp')); return; }
  const pv = e.target.closest('[data-preview]'); if (pv) { preview(pv.dataset.preview); return; }
  const cz = e.target.closest('[data-customise]'); if (cz) { customise(cz.dataset.customise); return; }
  if (e.target.closest('[data-signin]')) signIn();
});
$$('.gp-scroll').forEach((s) => s.setAttribute('tabindex', '0'));
countdowns();

/* ───────── Modal ───────── */
const modal = $('#nyModal');
let lastFocus = null;
function openModal(html, cls = '') {
  lastFocus = document.activeElement;
  modal.innerHTML = `<div class="md ${cls}" role="dialog" aria-modal="true" aria-labelledby="mdTitle"><button type="button" class="md-close" data-close aria-label="Close">✕</button>${html}</div>`;
  modal.hidden = false; document.body.style.overflow = 'hidden';
  countdowns(modal); $$('.gp-scroll', modal).forEach((s) => s.setAttribute('tabindex', '0'));
  ($('[autofocus]', modal) || $('.md-close', modal)).focus();
}
function closeModal() { modal.hidden = true; modal.innerHTML = ''; document.body.style.overflow = ''; if (lastFocus) lastFocus.focus(); }
modal.addEventListener('click', (e) => { if (e.target === modal || e.target.closest('[data-close]')) closeModal(); });
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') { if (!modal.hidden) closeModal(); else if (!menu.hidden) { setMenu(false); burger.focus(); } else if (guest) closeGuest(); }
  if (e.key === 'Tab' && !modal.hidden) { // keep focus inside the dialog
    const f = $$('button, a[href], input, [tabindex="0"]', modal).filter((x) => x.offsetParent !== null);
    if (!f.length) return; const first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); } else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }
});
function shareBlock(id, data) {
  const t = templateById[id], d = { ...t.data, ...data };
  return `<div class="md-acts"><a class="ny-btn md-wa" data-share target="_blank" rel="noopener" href="https://wa.me/?text=${encodeURIComponent(`${titleOf(t, d)} · You are invited: ${inviteLink(id, data)}`)}">Share on WhatsApp</a>
    <button type="button" class="ny-btn ny-ghost" data-copy="${esc(inviteLink(id, data))}">Copy link</button></div><p class="md-msg" aria-live="polite"></p>`;
}
modal.addEventListener('click', async (e) => {
  const c = e.target.closest('[data-copy]'); if (!c) return;
  const msg = $('.md-msg', modal);
  try { await navigator.clipboard.writeText(c.dataset.copy); msg.textContent = 'Link copied. Anyone who opens it sees this invitation.'; } catch (err) { msg.textContent = c.dataset.copy; }
});

function preview(id, data = {}) {
  const t = templateById[id]; if (!t) return;
  openModal(`<div class="md-in"><div class="md-phone"><div class="ph"><div class="ph-notch" aria-hidden="true"></div><div class="ph-screen">${guestPage(t, { ...t.data, ...data }, { guest: 'For you' })}</div></div></div>
    <div class="md-side"><p class="ny-kicker">${esc(occasionById[t.occasion].name)} · Guest preview</p><h2 id="mdTitle">${esc(t.name)}</h2><p>${esc(t.desc)} Tap “Open invitation” to see exactly what your guests will see.</p>
      ${shareBlock(id, data)}
      <div class="md-acts"><button type="button" class="ny-btn ny-gold" data-customise="${id}" autofocus>Customise this design</button></div>
      <p class="md-fine">Sample details are fictional. Personalise the design to share your own.</p></div></div>`);
}

function customise(id) {
  const t = templateById[id]; if (!t) return;
  const d = { ...t.data };
  const field = (k, label, type = 'text', attrs = '') => `<label>${label}<input name="${k}" type="${type}" value="${esc(d[k])}" maxlength="80" ${attrs}></label>`;
  openModal(`<div class="md-in">
    <form class="cz" id="czForm" novalidate><p class="ny-kicker">Personalise · ${esc(t.name)}</p><h2 id="mdTitle" class="cz-title">Make it yours</h2>
      ${field('kicker', 'Opening line')}
      <div class="cz-row">${field('title', d.joiner ? 'First name' : 'Title', 'text', 'autofocus')}${field('title2', d.joiner ? 'Second name' : 'Subtitle')}</div>
      <div class="cz-row">${field('date', 'Date', 'date')}${field('time', 'Time', 'time')}</div>
      ${field('venue', 'Venue')}${field('address', 'City or address')}${field('note', 'A note for guests')}
      <p class="md-fine">Your details stay in your browser and in the link you share. Nothing is saved on our servers yet.</p>
    </form>
    <div class="md-side"><div class="cz-card"><div class="ivw" id="czCard">${card(t, d)}</div></div>
      <div class="md-acts"><button type="button" class="ny-btn ny-gold" id="czGuest">Preview as a guest</button></div>
      <div id="czShare">${shareBlock(id, {})}</div></div></div>`);
  const form = $('#czForm', modal), out = $('#czCard', modal), share = $('#czShare', modal);
  const read = () => { const o = {}; new FormData(form).forEach((v, k) => { o[k] = String(v).trim(); }); return o; };
  let timer = 0;
  form.addEventListener('input', () => { const v = read(); out.innerHTML = card(t, { ...d, ...v }); clearTimeout(timer); timer = setTimeout(() => { share.innerHTML = shareBlock(id, v); }, 250); });
  form.addEventListener('submit', (e) => e.preventDefault());
  $('#czGuest', modal).addEventListener('click', () => { const v = read(); closeModal(); showGuest(id, v); });
}

function signIn() {
  openModal(`<div class="md-in"><svg class="ny-mark ny-mark-xl" viewBox="0 0 32 32" aria-hidden="true"><path d="M16 1.5 18.6 13.4 30.5 16 18.6 18.6 16 30.5 13.4 18.6 1.5 16 13.4 13.4Z"/></svg>
    <h2 id="mdTitle">Accounts are on their way</h2><p class="md-fine md-lede">Signing in to save, send and manage invitations opens soon. You can already browse, personalise, preview and share any design without an account.</p>
    <a class="ny-btn ny-gold" href="#designs" data-close autofocus>Explore designs</a></div>`, 'md-sm');
}

/* ───────── Guest view: what someone sees when they open a shared invitation link ───────── */
let guest = null;
function showGuest(id, data) {
  const t = templateById[id]; if (!t) return;
  guest = document.createElement('div'); guest.className = 'gv'; guest.setAttribute('role', 'dialog'); guest.setAttribute('aria-modal', 'true'); guest.setAttribute('aria-label', `${titleOf(t, { ...t.data, ...data })} invitation`);
  guest.innerHTML = `<div class="gv-in">${guestPage(t, { ...t.data, ...data })}</div>
    <div class="gv-bar"><a href="${location.pathname}" class="gv-brand" data-gv-close>${esc(CONFIG.name)} · Create your own</a><button type="button" class="gv-x" data-gv-close aria-label="Close invitation">✕</button></div>`;
  document.body.appendChild(guest); document.body.style.overflow = 'hidden';
  countdowns(guest); $$('.gp-scroll', guest).forEach((s) => s.setAttribute('tabindex', '0'));
  $('[data-open]', guest).focus();
  guest.addEventListener('click', (e) => { if (e.target.closest('[data-gv-close]')) { e.preventDefault(); closeGuest(); } });
}
function closeGuest() { if (!guest) return; guest.remove(); guest = null; document.body.style.overflow = ''; if (location.hash.startsWith('#invite=')) history.replaceState(null, '', location.pathname); }
function fromHash() {
  const m = location.hash.match(/^#invite=([a-z0-9-]+)(?:\.([\w-]+))?$/i);
  if (m && templateById[m[1]]) showGuest(m[1], m[2] ? decodeData(m[2]) : {});
}
addEventListener('hashchange', fromHash);
fromHash();
