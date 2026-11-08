/* NYOTAA homepage renderer. Reusable components (logo, header, section heading,
   design card, phone, footer) assemble the page from brand.config.mjs and the
   invitation engine. Nothing here names the host or the hosting company. */
import { BRAND, SITE, CONTACT, PUBLIC_CONFIG } from './brand.config.mjs';
import { OCCASIONS, TEMPLATES, occasionById, card, guestPage } from './assets/invite.js';

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const asset = (p) => `${SITE.basePath}/assets/${p}`;

/* ───────── Components ───────── */
export const starMark = (cls = 'ny-mark') => `<svg class="${cls}" viewBox="0 0 32 32" aria-hidden="true"><path d="M16 1.5 18.6 13.4 30.5 16 18.6 18.6 16 30.5 13.4 18.6 1.5 16 13.4 13.4Z"/><path d="M16 7.5 17.2 14.8 24.5 16 17.2 17.2 16 24.5 14.8 17.2 7.5 16 14.8 14.8Z" opacity=".55" transform="rotate(45 16 16)"/></svg>`;
export const logo = (cls = '') => `<a class="ny-logo ${cls}" href="#top" aria-label="${esc(BRAND.name)} home">${starMark()}<span>${esc(BRAND.logo.wordmark)}</span></a>`;
const head = (id, kicker, title, lead = '') => `<header class="ny-head"><p class="ny-kicker">${kicker}</p><h2 id="${id}">${title}</h2>${lead ? `<p class="ny-lead">${lead}</p>` : ''}</header>`;
const occName = (id) => occasionById[id].name;
const designCard = (t) => `<li class="dc" data-occ="${t.occasion}">
    <div class="dc-art"><div class="ivw">${card(t, t.data, { label: `${t.name} ${occName(t.occasion)} invitation design` })}</div></div>
    <div class="dc-body"><p class="dc-occ">${esc(occName(t.occasion))}</p><h3>${esc(t.name)}</h3><p>${esc(t.desc)}</p>
      <div class="dc-acts"><button type="button" class="ny-btn ny-ghost ny-sm" data-preview="${t.id}">Preview</button><button type="button" class="ny-btn ny-gold ny-sm" data-customise="${t.id}">Customise</button></div></div>
  </li>`;
const phone = (inner, cls = '') => `<div class="ph ${cls}"><div class="ph-notch" aria-hidden="true"></div><div class="ph-screen">${inner}</div></div>`;

/* ───────── Content ───────── */
const STEPS = [
  ['Choose your design', 'Browse designs made for every kind of occasion, each with its own typography, palette and ornament.'],
  ['Personalise your invitation', 'Add names, the date, the time and the venue, and see the invitation update as you type.'],
  ['Share it with your guests', 'Send the link on WhatsApp or anywhere else. Guests open it on their phone, no app needed.']
];
const WHY = [
  ['Premium designs', 'Every design is composed with editorial typography and fine line-art ornament, not clip art.', '<path d="M12 2.5 14 9.5 21 12 14 14.5 12 21.5 10 14.5 3 12 10 9.5Z"/>'],
  ['Personalised for you', 'Your names, dates, schedule and venue, set in the design with care.', '<path d="M4 20h4L19 9l-4-4L4 16zM14 6l4 4"/>'],
  ['Made for mobile', 'Invitations open beautifully on a phone: an envelope, the card, then every detail.', '<rect x="7" y="2.5" width="10" height="19" rx="2.5"/><path d="M11 18.5h2"/>'],
  ['Easy WhatsApp sharing', 'Share your invitation link to WhatsApp in one tap, or copy it anywhere.', '<path d="M4.5 19.5 6 15.6A8 8 0 1 1 9 18.6z"/><path d="M9.5 9.5c.4 2.2 2.1 3.9 4.5 4.6l1-1.4"/>'],
  ['Digital delivery', 'No printing or postage. Guests can open the map and add the date to their calendar.', '<path d="M3 7l9 6 9-6"/><rect x="3" y="5" width="18" height="14" rx="2"/>'],
  ['Every occasion, many styles', 'From pheras to product launches, with designs that suit the moment.', '<rect x="3" y="3" width="8" height="8" rx="1.5"/><rect x="13" y="3" width="8" height="8" rx="1.5"/><rect x="3" y="13" width="8" height="8" rx="1.5"/><rect x="13" y="13" width="8" height="8" rx="1.5"/>']
];
const FAQ = [
  ['What can I do on NYOTAA today?', 'You can browse every design, personalise one with your own details, preview it exactly as your guests will see it on a phone, and share that preview link, including on WhatsApp.'],
  ['Do my guests need an app?', 'No. A NYOTAA invitation is a web link that opens in any phone browser. Guests can open the venue in Maps and add the date to their calendar.'],
  ['Is my personalised invitation saved?', 'Not yet. Your details are kept inside the preview link you share, and nothing is stored on our servers. Accounts that save and manage invitations are coming.'],
  ['How much does NYOTAA cost?', 'Pricing will be announced when accounts open. Browsing, personalising and previewing designs is free to try now.'],
  ['How do I contact NYOTAA?', CONTACT.email ? `Write to us at ${CONTACT.email}.` : 'Our contact details will be published here shortly.']
];

/* ───────── Sections ───────── */
function header() {
  return `<header class="ny-nav" id="nyNav"><div class="ny-wrap ny-nav-in">
    ${logo()}
    <nav class="ny-links" aria-label="Main"><a href="#designs">Explore Invitations</a><a href="#occasions">Occasions</a><a href="#how">How It Works</a><a href="#pricing">Pricing</a></nav>
    <div class="ny-nav-acts"><button type="button" class="ny-signin" data-signin>Sign In</button><a class="ny-btn ny-dark ny-sm" href="#designs" data-create>Create Invitation</a>
      <button type="button" class="ny-burger" id="nyBurger" aria-expanded="false" aria-controls="nyMenu" aria-label="Open menu"><span></span><span></span></button></div>
  </div>
  <div class="ny-menu" id="nyMenu" hidden><nav aria-label="Menu">
    <a href="#designs">Explore Invitations</a><a href="#occasions">Occasions</a><a href="#how">How It Works</a><a href="#pricing">Pricing</a>
    <button type="button" data-signin>Sign In</button><a class="ny-btn ny-gold" href="#designs" data-create>Create Your Invitation</a></nav>
    <p class="ny-menu-tag">${esc(BRAND.tagline)}</p></div>
</header>`;
}

function hero() {
  const a = TEMPLATES.find((t) => t.id === 'aurelia'), m = TEMPLATES.find((t) => t.id === 'mehr');
  return `<section class="hero" id="top" aria-labelledby="heroTitle">
  <div class="ny-wrap hero-in">
    <div class="hero-copy">
      <p class="ny-kicker hero-k">${esc(BRAND.category)}</p>
      <h1 id="heroTitle"><span class="hl">Every Occasion Deserves</span> <span class="hl"><em>a Beautiful</em> Beginning.</span></h1>
      <p class="hero-lead">Create extraordinary digital invitations for life’s most memorable moments.</p>
      <div class="hero-ctas"><a class="ny-btn ny-gold" href="#designs" data-create>Create Your Invitation</a><a class="ny-btn ny-line" href="#designs">Explore Designs</a></div>
      <p class="hero-note"><span>${starMark('ny-mark-sm')}</span>Personalise and preview any design, free. Guests open it on their phone, no app needed.</p>
    </div>
    <div class="hero-art" aria-hidden="true">
      <div class="ha-glow"></div>
      <div class="ha-env"><div class="ha-env-flap"></div><span class="ha-seal">${starMark('ny-mark-seal')}</span></div>
      <div class="ha-card ha-back"><div class="ivw">${card(m)}</div></div>
      <div class="ha-card ha-front"><div class="ivw">${card(a)}</div></div>
      ${phone(guestPage(a, a.data, { opened: true }), 'ha-phone')}
      <div class="ha-chip ha-chip-1"><b>14</b><span>February 2027<small>The Orchard House</small></span></div>
      <div class="ha-chip ha-chip-2"><i></i>Added to calendar</div>
    </div>
  </div>
</section>`;
}

function occasions() {
  const tileArt = (o) => {
    const ts = TEMPLATES.filter((t) => t.occasion === o.id);
    const pick = ts.length ? [ts[0]] : [TEMPLATES[0], TEMPLATES[3], TEMPLATES[8]];
    return pick.map((t, i) => `<span class="oc-card oc-c${pick.length > 1 ? i + 1 : 0}"><span class="ivw">${card(t)}</span></span>`).join('');
  };
  return `<section class="ny-sec occ" id="occasions" aria-labelledby="occTitle"><div class="ny-wrap">
    ${head('occTitle', 'Browse by occasion', 'For every moment that <em>matters</em>', 'From the first ceremony to the final toast, find designs made for the way you celebrate.')}
    <ul class="oc-grid">${OCCASIONS.map((o, i) => `<li class="oc${i < 2 ? ' oc-lg' : ''}"><a href="#designs" data-occasion="${o.id}">
      <span class="oc-art">${tileArt(o)}</span>
      <span class="oc-txt"><b>${esc(o.name)}</b><small>${esc(o.line)}</small><i aria-hidden="true">→</i></span></a></li>`).join('')}</ul>
  </div></section>`;
}

function designs() {
  const occ = OCCASIONS.filter((o) => TEMPLATES.some((t) => t.occasion === o.id));
  return `<section class="ny-sec des" id="designs" aria-labelledby="desTitle"><div class="ny-wrap">
    ${head('desTitle', 'Featured invitation designs', 'Designed to be <em>remembered</em>', 'Each design is composed for its occasion. Preview it as a guest would see it, or make it yours.')}
    <div class="des-filter" role="group" aria-label="Filter designs by occasion"><button type="button" class="chip" data-filter="all" aria-pressed="true">All designs</button>${occ.map((o) => `<button type="button" class="chip" data-filter="${o.id}" aria-pressed="false">${esc(o.name)}</button>`).join('')}</div>
    <p class="des-status" id="desStatus" aria-live="polite"></p>
    <ul class="dc-grid" id="dcGrid">${TEMPLATES.map(designCard).join('')}</ul>
  </div></section>`;
}

function how() {
  const art = [
    `<div class="hw-pick">${['aurelia', 'noir', 'solenne', 'meridian'].map((id, i) => `<span class="hw-thumb${i === 0 ? ' on' : ''}"><span class="ivw">${card(TEMPLATES.find((t) => t.id === id))}</span></span>`).join('')}</div>`,
    `<div class="hw-form"><span class="hw-field"><small>Names</small>Ananya &amp; Kabir<i></i></span><span class="hw-field"><small>Date</small>14 February 2027</span><span class="hw-field"><small>Venue</small>The Orchard House</span></div>`,
    `<div class="hw-share">${phone(`<div class="hw-sheet"><p>Share invitation</p><span class="hw-app hw-wa"><i></i>WhatsApp</span><span class="hw-app"><i></i>Copy link</span><span class="hw-app"><i></i>More</span></div>`, 'ph-mini')}</div>`
  ];
  return `<section class="ny-sec how" id="how" aria-labelledby="howTitle"><div class="ny-wrap">
    ${head('howTitle', 'How it works', 'Three steps to a <em>beautiful</em> beginning')}
    <ol class="hw-steps">${STEPS.map(([t, p], i) => `<li class="hw"><div class="hw-art" aria-hidden="true">${art[i]}</div><span class="hw-n">0${i + 1}</span><h3>${esc(t)}</h3><p>${esc(p)}</p></li>`).join('')}</ol>
  </div></section>`;
}

function why() {
  return `<section class="ny-sec why" id="about" aria-labelledby="whyTitle"><div class="ny-wrap why-in">
    <div class="why-intro">${head('whyTitle', `Why ${esc(BRAND.name)}`, 'An invitation is the <em>first moment</em> of your celebration', `${esc(BRAND.name)} brings the care of fine stationery to the invitations you send from your phone.`)}</div>
    <ul class="why-grid">${WHY.map(([t, p, ic]) => `<li><span class="why-ic"><svg viewBox="0 0 24 24" aria-hidden="true">${ic}</svg></span><h3>${esc(t)}</h3><p>${esc(p)}</p></li>`).join('')}</ul>
  </div></section>`;
}

function showcase() {
  const ex = [['aurelia', 'Wedding', 'An envelope with a wax seal opens to the card, then the schedule, venue and a countdown.', 'Ananya & Kabir'],
    ['noir', 'Birthday', 'A milestone night in black and gold, with directions and the plan for the evening.', 'Rhea'],
    ['meridian', 'Corporate event', 'A summit agenda your guests can add to their calendar and find on the map.', 'Mr. S. Kapoor']];
  return `<section class="ny-sec show" id="showcase" aria-labelledby="showTitle"><div class="ny-wrap">
    ${head('showTitle', 'Invitation showcase', 'What your guests <em>experience</em>', 'These are live invitations. Tap “Open invitation” and scroll, just as a guest would on their phone.')}
    <ul class="sh-grid">${ex.map(([id, occ, p, guest]) => { const t = TEMPLATES.find((x) => x.id === id); return `<li class="sh">
      ${phone(guestPage(t, t.data, { guest: `Dear ${guest}` }), 'ph-live')}
      <div class="sh-txt"><p class="ny-kicker">${esc(occ)}</p><h3>${esc(t.name)}</h3><p>${esc(p)}</p><button type="button" class="ny-link" data-preview="${id}">Open full preview →</button></div></li>`; }).join('')}</ul>
  </div></section>`;
}

function pricing() {
  return `<section class="ny-sec price" id="pricing" aria-labelledby="priceTitle"><div class="ny-wrap price-in">
    ${head('priceTitle', 'Pricing', 'Simple pricing, <em>announced at launch</em>', 'We are finalising plans for saving, sending and managing invitations. Until then, every design is free to personalise, preview and share as a preview link.')}
    <a class="ny-btn ny-gold" href="#designs" data-create>Start with a design</a>
  </div></section>`;
}

function faq() {
  return `<section class="ny-sec faq" id="faq" aria-labelledby="faqTitle"><div class="ny-wrap faq-in">
    ${head('faqTitle', 'Questions', 'Good to <em>know</em>')}
    <div class="faq-list">${FAQ.map(([q, a], i) => `<details${i === 0 ? ' open' : ''}${i === FAQ.length - 1 ? ' id="contact"' : ''}><summary><span>${esc(q)}</span></summary><p>${esc(a)}</p></details>`).join('')}</div>
  </div></section>`;
}

function finalCta() {
  return `<section class="final" aria-labelledby="finalTitle"><div class="ny-wrap final-in">
    ${starMark('ny-mark-xl')}
    <h2 id="finalTitle">Your Celebration Starts With <em>an Invitation.</em></h2>
    <p>Create something beautiful. Share something unforgettable.</p>
    <a class="ny-btn ny-gold" href="#designs" data-create>Create Your Invitation</a>
  </div></section>`;
}

function footer() {
  const social = Object.entries(CONTACT.social).filter(([, u]) => u);
  return `<footer class="ny-foot"><div class="ny-wrap foot-in">
    <div class="foot-brand">${logo('ny-logo-light')}<p>${esc(BRAND.tagline)}</p>
      ${social.length ? `<ul class="foot-social">${social.map(([k, u]) => `<li><a href="${esc(u)}" rel="noopener" target="_blank">${k[0].toUpperCase() + k.slice(1)}</a></li>`).join('')}</ul>` : ''}</div>
    <nav class="foot-cols" aria-label="Footer">
      <div><h2>${esc(BRAND.name)}</h2><a href="#about">About ${esc(BRAND.name)}</a><a href="#designs">Explore Invitations</a><a href="#occasions">Occasions</a><a href="#how">How It Works</a></div>
      <div><h2>Help</h2><a href="#faq">FAQs</a>${CONTACT.email ? `<a href="mailto:${esc(CONTACT.email)}">Contact</a>` : '<a href="#contact">Contact</a>'}<a href="#pricing">Pricing</a></div>
      <div><h2>Legal</h2><a href="${SITE.basePath}/privacy">Privacy Policy</a><a href="${SITE.basePath}/terms">Terms and Conditions</a></div>
    </nav>
  </div><div class="ny-wrap foot-base"><span>© ${new Date().getFullYear()} ${esc(BRAND.name)}</span><span>${esc(BRAND.category)}</span></div></footer>`;
}

/* ───────── Document ───────── */
export function documentHead({ title, description, path = '', noindex = !SITE.indexable }) {
  const c = BRAND.colors, f = BRAND.fonts;
  const fam = (x) => `family=${x.family.replace(/ /g, '+')}:${x.italic ? `ital,wght@${x.weights.split(';').map((w) => '0,' + w).join(';')};${x.weights.split(';').map((w) => '1,' + w).join(';')}` : `wght@${x.weights}`}`;
  const url = SITE.siteUrl ? SITE.siteUrl + (path === '/' ? '/' : path) : '';
  const ld = [{ '@context': 'https://schema.org', '@type': 'Organization', name: BRAND.name, slogan: BRAND.tagline, description: BRAND.description, ...(SITE.siteUrl ? { url: SITE.siteUrl + '/' } : {}) },
    { '@context': 'https://schema.org', '@type': 'WebSite', name: BRAND.name, ...(SITE.siteUrl ? { url: SITE.siteUrl + '/' } : {}) }];
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
${noindex ? '<meta name="robots" content="noindex">' : ''}${url && !noindex ? `<link rel="canonical" href="${esc(url)}">` : ''}
<meta name="theme-color" content="${c.ivory}">
<meta property="og:site_name" content="${esc(BRAND.name)}">
<meta property="og:type" content="website">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
${url ? `<meta property="og:url" content="${esc(url)}">` : ''}
<meta property="og:locale" content="${SITE.locale}">
<meta name="twitter:card" content="summary">
<link rel="icon" href="${asset('favicon.svg')}" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?${fam(f.display)}&${fam(f.body)}&${fam(f.script)}&display=swap">
<style>:root{${Object.entries(c).map(([k, v]) => `--${k.replace(/[A-Z]/g, (m) => '-' + m.toLowerCase())}:${v}`).join(';')};--f-display:"${f.display.family}",Georgia,serif;--f-body:"${f.body.family}",system-ui,sans-serif;--f-script:"${f.script.family}","${f.display.family}",cursive}</style>
<link rel="stylesheet" href="${asset('invite.css')}">
<link rel="stylesheet" href="${asset('nyotaa.css')}">
${ld.map((o) => `<script type="application/ld+json">${JSON.stringify(o)}</script>`).join('\n')}
</head>`;
}

export function renderHome() {
  return `${documentHead({ title: `${BRAND.name} · Premium Digital Invitations | ${BRAND.tagline}`, description: BRAND.description, path: '/' })}
<body>
<a class="ny-skip" href="#main">Skip to content</a>
${header()}
<main id="main">
${hero()}
${occasions()}
${designs()}
${how()}
${why()}
${showcase()}
${pricing()}
${faq()}
${finalCta()}
</main>
${footer()}
<div class="ny-modal" id="nyModal" hidden></div>
<script>
/* Scale every invitation card from its full design size (see invite.css). Runs before first paint. */
(function () {
  if (!('ResizeObserver' in window)) return;
  var ro = new ResizeObserver(function (es) { es.forEach(function (e) { var w = e.contentRect.width; if (w) { e.target.style.setProperty('--k', (w / 360).toFixed(4)); e.target.classList.add('is-fit'); } }); });
  var scan = function () { document.querySelectorAll('.ivw:not([data-fit])').forEach(function (el) { el.setAttribute('data-fit', ''); ro.observe(el); }); };
  scan(); new MutationObserver(scan).observe(document.body, { childList: true, subtree: true });
})();
</script>
<script type="application/json" id="nyConfig">${JSON.stringify(PUBLIC_CONFIG)}</script>
<script type="module" src="${asset('nyotaa.js')}"></script>
</body>
</html>
`;
}

// Plain-language legal pages, linked from the footer. Draft until reviewed.
export function renderLegal(kind) {
  const isPrivacy = kind === 'privacy', title = isPrivacy ? 'Privacy Policy' : 'Terms and Conditions';
  const body = isPrivacy ? `
    <p>This page describes, in plain language, how the ${esc(BRAND.name)} website works today.</p>
    <h2>What we collect</h2><p>Nothing. The website has no accounts, no forms that send data to us, no analytics and no advertising trackers, and it sets no cookies.</p>
    <h2>Personalised invitations</h2><p>When you personalise a design, your details stay in your browser. If you share a preview, the details travel inside the link itself; anyone with the link can read them, so share it only with people you invite.</p>
    <h2>Services that see your connection</h2><p>Our hosting provider delivers the pages and processes standard request information such as your IP address. Google Fonts serves the typefaces. “Open in Maps” opens Google Maps, which has its own policy.</p>
    <h2>Changes</h2><p>We will update this policy before accounts, payments or any feature that collects personal information goes live.</p>`
    : `
    <p>These terms cover use of the ${esc(BRAND.name)} website as it is today.</p>
    <h2>Using the site</h2><p>You may browse designs, personalise them and share preview links for your own events. Designs remain the property of ${esc(BRAND.name)}.</p>
    <h2>Your content</h2><p>You are responsible for the details you add to an invitation and for sharing preview links only with people you choose.</p>
    <h2>Availability</h2><p>The site is provided as it is while ${esc(BRAND.name)} prepares accounts and paid plans. Full terms will be published before purchases are possible.</p>`;
  return `${documentHead({ title: `${title} · ${BRAND.name}`, description: `${title} for the ${BRAND.name} website: what the site does today and how it treats your information.`, path: `/${kind}` })}
<body class="legal">
<header class="ny-nav is-solid"><div class="ny-wrap ny-nav-in">${logo().replace('href="#top"', `href="${SITE.basePath || '/'}"`)}<a class="ny-btn ny-dark ny-sm" href="${SITE.basePath || '/'}#designs">Explore Invitations</a></div></header>
<main id="main" class="ny-wrap legal-in"><p class="ny-kicker">Draft · last updated ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p><h1>${title}</h1>
<p class="legal-note">This is a plain-language draft that has not yet been reviewed by a lawyer.</p>${body}</main>
${footer().replace(/href="#/g, `href="${SITE.basePath || ''}/#`)}
</body></html>
`;
}
