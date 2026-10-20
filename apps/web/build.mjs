/* Ask Compass site build.
   Generates every public page from shared templates and the content files in
   src/content, then copies the Studio demo and assets.
   No dependencies: run with `node build.mjs`. Output goes to ./public. */
import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { SITE, NAV, FOOTER, STATUS } from './src/content/site.mjs';
import { PLATFORM } from './src/content/platform.mjs';
import { renderPlatformOverview } from './src/content/platform-page.mjs';
import { renderSolutionsOverview, META as SOL_META } from './src/content/solutions-page.mjs';
import { ICONS, CAPS, GROUPS } from './src/content/platform-page.mjs';
import { renderPricing, PRICING_FAQ } from './src/content/pricing-page.mjs';
import { SOLUTIONS } from './src/content/solutions.mjs';
import { GUIDES, FAQ } from './src/content/resources.mjs';
import { PAGES } from './src/content/pages.mjs';

const ROOT = dirname(fileURLToPath(import.meta.url));
const OUT = join(ROOT, 'public');
const section = (name) => readFileSync(join(ROOT, 'src/sections', name + '.html'), 'utf8');

export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const absolute = (path) => SITE.origin + (path === '/' ? '/' : path);

/* ───────── shared layout ───────── */
const BRAND_MARK = `<img class="brand-mark" src="/assets/brand/logo-128.webp" width="46" height="46" alt="">`;

function head(page) {
  const title = page.path === '/' || page.fullTitle ? page.title : `${page.title} · Ask Compass`;
  const ld = [page.jsonLd, page.crumbs && breadcrumbLd(page)].filter(Boolean);
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(title)}</title>
<meta name="description" content="${esc(page.description)}">
${page.noindex ? '<meta name="robots" content="noindex">' : `<link rel="canonical" href="${absolute(page.path)}">`}
<meta name="theme-color" content="#FAFAF7">
<meta property="og:site_name" content="Ask Compass">
<meta property="og:type" content="${page.ogType || 'website'}">
<meta property="og:title" content="${esc(page.ogTitle || title)}">
<meta property="og:description" content="${esc(page.description)}">
${page.noindex ? '' : `<meta property="og:url" content="${absolute(page.path)}">`}
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="/favicon.ico" sizes="48x48">
<link rel="icon" type="image/png" sizes="32x32" href="/assets/brand/favicon-32.png">
<link rel="apple-touch-icon" href="/assets/brand/apple-touch-icon.png">
<meta property="og:image" content="${SITE.origin}/assets/brand/og-image.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="Ask Compass logo">
${page.headExtra || ''}
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&family=Geist+Mono:wght@400;500&display=swap">
<link rel="stylesheet" href="/assets/css/site.css">
<link rel="stylesheet" href="/assets/css/pages.css">
<link rel="stylesheet" href="/assets/css/overview.css">
${page.styles || ''}
${ld.map((o) => `<script type="application/ld+json">${JSON.stringify(o)}</script>`).join('\n')}
</head>`;
}

// The label opens the section's overview page; the arrow (or hovering with a mouse) opens the menu.
function megaMenu(id, label, group, active, inSection) {
  const items = group.items.map((i) => `<a href="${i.href}"${i.href === active ? ' aria-current="page"' : ''}><b>${esc(i.label)}</b><small>${esc(i.desc)}</small></a>`).join('');
  const here = group.overview.href === active ? ' aria-current="page"' : '';
  return `<div class="nav-drop${group.mega ? ' nav-mega' : ''}">
        <span class="nav-drop-top"><a class="nav-drop-link${inSection ? ' is-current' : ''}" href="${group.overview.href}"${here}>${esc(label)}</a><button class="nav-drop-btn" type="button" aria-expanded="false" aria-controls="${id}" aria-label="${esc(label)} menu"><span class="chev" aria-hidden="true"></span></button></span>
        <div class="nav-drop-menu${group.mega ? ' mega' : ''}" id="${id}">
          <div class="mega-grid">${items}</div>
          ${group.overview ? `<a class="mega-foot" href="${group.overview.href}">${esc(group.overview.label)} <span aria-hidden="true">→</span></a>` : ''}
        </div>
      </div>`;
}

function header(page) {
  const cur = (s) => (page.section === s ? ' aria-current="page"' : '');
  return `<a class="skip" href="#main">Skip to content</a>
<header class="site-header" id="top">
  <div class="wrap header-in">
    <a class="brand" href="/" aria-label="Ask Compass home">
      ${BRAND_MARK}
      <span class="brand-text"><span class="brand-word">ASK COMPASS</span><span class="brand-sub">Where knowledge becomes direction</span></span>
    </a>
    <nav class="main-nav" id="mainNav" aria-label="Main">
      <a href="/"${cur('home')}>Home</a>
      ${megaMenu('mm-platform', 'Platform', NAV.platform, page.path, page.section === 'platform')}
      ${megaMenu('mm-solutions', 'Solutions', NAV.solutions, page.path, page.section === 'solutions')}
      ${megaMenu('mm-resources', 'Resources', NAV.resources, page.path, page.section === 'resources')}
      <a href="/pricing"${cur('pricing')}>Pricing</a>
      <a href="/about"${cur('about')}>About</a>
      <a href="/contact"${cur('contact')}>Contact</a>
      <a class="btn nav-cta-mobile nav-login-mobile" href="https://app.askcompass.in">Login</a>
      <a class="btn btn-primary nav-cta-mobile" href="/studio">Open Studio</a>
    </nav>
    <div class="header-actions">
      <a class="btn btn-sm hdr-login" href="https://app.askcompass.in"><svg class="lk" viewBox="0 0 24 24" aria-hidden="true"><path class="lk-shackle" d="M8 11V8a4 4 0 0 1 8 0v3"/><rect x="5" y="11" width="14" height="10" rx="2.5"/><circle cx="12" cy="16" r="1.4"/></svg><span>Login</span></a>
      <a class="btn btn-sm hdr-studio" href="/studio">Open Studio</a>
      <button class="menu-btn" id="menuBtn" type="button" aria-expanded="false" aria-controls="mainNav" aria-label="Open menu"><span></span><span></span></button>
    </div>
  </div>
</header>`;
}

function footer() {
  const col = (c) => `<div><h2 class="f-h">${esc(c.title)}</h2>${c.links.map((l) => `<a href="${l.href}"${l.external ? ' target="_blank" rel="noopener"' : ''}>${esc(l.label)}</a>`).join('')}</div>`;
  return `<footer class="site-footer">
  <div class="wrap footer-in">
    <div class="f-brand">
      <a class="brand" href="/">${BRAND_MARK}<span class="brand-word">ASK COMPASS</span></a>
      <p>Beyond Intelligence. Towards Clarity.</p>
    </div>
    <nav class="f-cols f-cols-wide" aria-label="Footer">${FOOTER.map(col).join('')}</nav>
  </div>
  <div class="wrap f-base"><span>© ${new Date().getFullYear()} Ask Compass</span><span class="f-legal"><a href="/privacy">Privacy</a><a href="/terms">Terms</a><a href="/security">Security</a><a href="/accessibility">Accessibility</a></span></div>
</footer>`;
}

function breadcrumbs(page) {
  if (!page.crumbs) return '';
  const all = [{ label: 'Home', href: '/' }, ...page.crumbs];
  return `<nav class="crumbs" aria-label="Breadcrumb"><ol>${all.map((c, i) => i === all.length - 1
    ? `<li><span aria-current="page">${esc(c.label)}</span></li>`
    : `<li><a href="${c.href}">${esc(c.label)}</a></li>`).join('')}</ol></nav>`;
}
function breadcrumbLd(page) {
  const all = [{ label: 'Home', href: '/' }, ...page.crumbs];
  return { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: all.map((c, i) => ({ '@type': 'ListItem', position: i + 1, name: c.label, item: absolute(c.href) })) };
}

// A "bare" page (the leadership sign-in) is full-screen: no site header, footer or site.js.
function layout(page) {
  const scripts = [...(page.bare ? [] : ['<script src="/assets/js/site.js" defer></script>']), ...(page.scripts || [])].join('\n');
  return `${head(page)}
<body class="${page.bodyClass || 'is-inner'}">
${page.bare ? '' : header(page)}
<main id="main">
${page.body}
</main>
${page.bare ? '' : footer()}
${scripts}
</body>
</html>
`;
}

/* ───────── reusable components ───────── */
export const statusPill = (s) => `<span class="status status-${s}">${esc(STATUS[s].label)}</span>`;

// A process strip: steps with decisions, branches and exceptions, readable as text.
export function flow(steps, label) {
  return `<ol class="flow" aria-label="${esc(label || 'Example workflow')}">${steps.map((s) => `<li class="fl fl-${s.type || 'action'}">
      <span class="fl-node" aria-hidden="true"></span>
      <span class="fl-k">${esc(KIND[s.type || 'action'])}</span>
      <b>${esc(s.label)}</b>${s.note ? `<span class="fl-note">${esc(s.note)}</span>` : ''}${s.alt ? `<span class="fl-alt">${esc(s.alt)}</span>` : ''}
    </li>`).join('')}</ol>`;
}
const KIND = { action: 'Step', decision: 'Decision', exception: 'Exception', approval: 'Approval', auto: 'Automation', link: 'Linked procedure', form: 'Form', end: 'Outcome', source: 'Source' };

// Headings end in the brand gradient: the last two or three words carry it.
const gradTail = (t) => {
  const w = String(t).split(' ');
  if (w.length < 3) return `<span class="px-grad">${esc(t)}</span>`;
  const n = w.length > 5 ? 3 : 2;
  return `${esc(w.slice(0, -n).join(' '))} <span class="px-grad">${esc(w.slice(-n).join(' '))}</span>`;
};

// The closing band used across inner pages: light, with the emblem, gold and teal actions.
const cta = (c) => `<section class="px-close"><div class="wrap px-close-in">
    <img class="px-close-mark" src="/assets/brand/logo-128.webp" width="128" height="128" alt="">
    <div class="px-close-copy"><h2>${gradTail(c.title)}</h2><p>${esc(c.text)}</p></div>
    <div class="hero-ctas">${c.primary ? `<a class="btn hx-btn-gold btn-sheen" href="${c.primary.href}">${esc(c.primary.label)} <span aria-hidden="true">→</span></a>` : ''}${c.secondary ? `<a class="btn hx-btn-teal" href="${c.secondary.href}">${esc(c.secondary.label)}</a>` : ''}</div>
  </div></section>`;

const relatedLinks = (items) => `<ul class="related">${items.map((r) => `<li><a href="${r.href}"><b>${esc(r.label)}</b><span>${esc(r.desc || '')}</span></a></li>`).join('')}</ul>`;

// Light hero shared by inner pages; `heroAside` adds a summary card on the right.
function pageHero(p) {
  return `<section class="page-hero px-hero${p.heroAside ? ' has-aside' : ''}"><div class="px-hero-bg" aria-hidden="true"></div><div class="wrap ph-in">
    <div class="ph-copy">
      ${breadcrumbs(p)}
      <p class="px-pill">${esc(p.eyebrow)}</p>
      <h1>${p.h1Html || gradTail(p.h1 || p.title)}</h1>
      <p class="page-lead">${esc(p.lead)}</p>
      ${p.heroActions || ''}
    </div>
    ${p.heroAside || ''}
  </div></section>`;
}

/* ───────── page renderers ───────── */
const platformByKey = Object.fromEntries(PLATFORM.pages.map((p) => [p.slug, p]));
const solutionByKey = Object.fromEntries(SOLUTIONS.pages.map((p) => [p.slug, p]));
const linkToPlatform = (slug) => { const p = platformByKey[slug]; return { href: `/platform/${slug}`, label: p.title, desc: p.navDesc }; };
const linkToSolution = (slug) => { const p = solutionByKey[slug]; return { href: `/solutions/${slug}`, label: p.title, desc: p.navDesc }; };

const capGroup = Object.fromEntries(CAPS.map((c) => [c.slug, c.group]));
const groupTitle = Object.fromEntries(GROUPS.map((g) => [g.key, g.title]));
const svgIcon = (paths, cls) => `<svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true">${paths}</svg>`;

// "At a glance" card in a capability hero: group, real feature counts and what works today.
function capSpec(p) {
  const items = p.groups.flatMap((g) => g.items);
  const count = (k) => items.filter((i) => i[1] === k).length;
  const parts = ['demo', 'dev', 'planned'].filter((k) => count(k));
  const label = { demo: 'in the demo', dev: 'in development', planned: 'planned' };
  const today = items.filter((i) => i[1] === 'demo').slice(0, 4);
  return `<aside class="ph-spec g-${capGroup[p.slug]}" aria-label="${esc(p.title)} at a glance">
      <div class="sp-top"><span class="sp-ic">${svgIcon(ICONS[p.slug], 'sp-svg')}</span><div><p class="sp-k">${esc(groupTitle[capGroup[p.slug]])}</p><b>${esc(p.title)}</b></div></div>
      <div class="sp-meter"><span class="px-bar" aria-hidden="true">${parts.map((k) => `<i class="m-${k}" style="--w:${(count(k) / items.length * 100).toFixed(1)}%"></i>`).join('')}</span>
      <p class="sp-mt">${parts.map((k) => `<span class="mt-${k}">${count(k)} ${label[k]}</span>`).join(' · ')}</p></div>
      ${today.length ? `<p class="sp-h">Works in the demo today</p><ul class="sp-list">${today.map((i) => `<li>${esc(i[0])}</li>`).join('')}</ul>` : `<p class="sp-h">Not in the demo yet</p><p class="sp-none">Every feature of this capability is planned. The page below explains how it is designed to work.</p>`}
    </aside>`;
}

// Summary card in a solution hero: what to expect and the capabilities it is built from.
function solSpec(s) {
  const m = SOL_META[s.slug];
  return `<aside class="ph-spec ph-sol" style="--c:${m.c}" aria-label="${esc(s.title)} at a glance">
      <div class="sp-top"><span class="sp-ic">${svgIcon(m.icon, 'sp-svg')}</span><div><p class="sp-k">Solution</p><b>${esc(s.title)}</b></div></div>
      <p class="sp-h">What to expect</p><ul class="sp-list sp-out">${s.outcomes.map((o) => `<li>${esc(o)}</li>`).join('')}</ul>
      <p class="sp-h">Built from</p><div class="px-chips">${s.features.map((f) => `<a class="px-chip g-${capGroup[f]}" href="/platform/${f}">${svgIcon(ICONS[f], 'px-chip-ic')}${esc(platformByKey[f].title)}</a>`).join('')}</div>
      <p class="sp-fine">Intended effects of guided work, not measured results.</p>
    </aside>`;
}

function renderCapability(p) {
  const groups = p.groups.map((g) => `<div class="feat-group">
      <h3>${esc(g.title)}</h3>
      <ul class="feat-list">${g.items.map((i) => `<li><span>${esc(i[0])}</span>${statusPill(i[1])}</li>`).join('')}</ul>
    </div>`).join('');
  const steps = p.how ? `<section class="section"><div class="wrap split">
      <div class="split-l"><p class="eyebrow">How it works</p><h2>${esc(p.howTitle)}</h2></div>
      <ol class="how">${p.how.map((h, i) => `<li><span class="how-n">${String(i + 1).padStart(2, '0')}</span><div><h3>${esc(h[0])}</h3><p>${esc(h[1])}</p></div></li>`).join('')}</ol>
    </div></section>` : '';
  return {
    path: `/platform/${p.slug}`, section: 'platform', title: p.title, description: p.description,
    crumbs: [{ label: 'Platform', href: '/platform' }, { label: p.title, href: `/platform/${p.slug}` }],
    body: pageHero({ ...p, eyebrow: p.module, crumbs: [{ label: 'Platform', href: '/platform' }, { label: p.title }],
      heroActions: `<div class="hero-ctas"><a class="btn hx-btn-gold btn-sheen" href="${p.demoHref || '/studio'}">${esc(p.demoLabel || (p.demoHref ? 'Try it in the Studio demo' : 'Open Studio'))} <span aria-hidden="true">→</span></a><a class="btn hx-btn-teal" href="/contact">Talk to us</a></div>`, heroAside: capSpec(p) }) +
      `<section class="section section-tight"><div class="wrap split">
        <div class="split-l"><p class="eyebrow">Example</p><h2>${esc(p.exampleTitle)}</h2><p class="section-lead">${esc(p.exampleText)}</p></div>
        <div class="split-r">${flow(p.example, p.exampleTitle)}</div>
      </div></section>` + steps +
      (p.extraSection ? section(p.extraSection) : '') +
      `<section class="section"><div class="wrap">
        <div class="section-head"><p class="eyebrow">Capabilities</p><h2>What’s included</h2>
        <p class="section-lead">${esc(STATUS_NOTE)}</p></div>
        <div class="feat-groups">${groups}</div>
        ${legend()}
      </div></section>` +
      `<section class="section section-alt"><div class="wrap"><div class="section-head"><p class="eyebrow">Related</p><h2>Works together with</h2></div>${relatedLinks([...p.related.map(linkToPlatform), ...(p.solutions || []).map(linkToSolution)])}</div></section>` +
      cta({ title: p.ctaTitle || 'See it working on a sample procedure.', text: 'The Studio demo runs in your browser with sample data. No account needed.', primary: { label: 'Open Studio', href: p.demoHref || '/studio' }, secondary: { label: 'Explore the platform', href: '/platform' } })
  };
}
const STATUS_NOTE = 'Each item is marked with its real status. “In the demo” works today in the public Studio demo, which runs in your browser with sample data. “Planned” is on the roadmap and not available yet.';
const legend = () => `<p class="legend-row">${Object.keys(STATUS).map((k) => `${statusPill(k)} <span>${esc(STATUS[k].desc)}</span>`).join('')}</p>`;

function renderSolution(s) {
  return {
    path: `/solutions/${s.slug}`, section: 'solutions', title: s.title, description: s.description,
    crumbs: [{ label: 'Solutions', href: '/solutions' }, { label: s.title, href: `/solutions/${s.slug}` }],
    body: pageHero({ ...s, eyebrow: 'Solutions', crumbs: [{ label: 'Solutions', href: '/solutions' }, { label: s.title }],
      heroActions: `<div class="hero-ctas"><a class="btn hx-btn-gold btn-sheen" href="/contact?topic=${encodeURIComponent(s.title)}">Discuss your process <span aria-hidden="true">→</span></a>${s.demoHref ? `<a class="btn hx-btn-teal" href="${s.demoHref}">Try a sample</a>` : '<a class="btn hx-btn-teal" href="/platform">Explore the platform</a>'}</div>`, heroAside: solSpec(s) }) +
      `<section class="section section-tight"><div class="wrap split">
        <div class="split-l"><p class="eyebrow">The problem</p><h2>${esc(s.problemTitle)}</h2></div>
        <div class="split-r prose-lg">${s.problem.map((p) => `<p>${esc(p)}</p>`).join('')}</div>
      </div></section>
      <section class="section section-alt"><div class="wrap split">
        <div class="split-l"><p class="eyebrow">Scenario</p><h2>${esc(s.scenarioTitle)}</h2><p class="section-lead">${esc(s.scenario)}</p></div>
        <div class="split-r">${flow(s.workflow, s.scenarioTitle)}</div>
      </div></section>
      <section class="section"><div class="wrap">
        <div class="section-head"><p class="eyebrow">Before and after</p><h2>${esc(s.compareTitle || 'How the work changes')}</h2></div>
        <div class="ba">
          <div class="ba-col ba-before"><h3>Without guided work</h3><ul>${s.before.map((b) => `<li>${esc(b)}</li>`).join('')}</ul></div>
          <div class="ba-arrow" aria-hidden="true"></div>
          <div class="ba-col ba-after"><h3>With Ask Compass</h3><ul>${s.after.map((b) => `<li>${esc(b)}</li>`).join('')}</ul></div>
        </div>
        <div class="outcomes"><h3>What to expect</h3><ul>${s.outcomes.map((o) => `<li>${esc(o)}</li>`).join('')}</ul><p class="muted-note">These are the intended effects of guided work. Ask Compass does not publish customer results it cannot verify.</p></div>
      </div></section>
      <section class="section section-alt"><div class="wrap"><div class="section-head"><p class="eyebrow">Relevant capabilities</p><h2>Built from these parts of the platform</h2></div>${relatedLinks(s.features.map(linkToPlatform))}</div></section>` +
      cta({ title: s.ctaTitle || 'Map one of your processes with us.', text: 'Tell us about a procedure your team finds hard to follow. We will show how it would work as guided steps.', primary: { label: 'Send a business enquiry', href: `/contact?topic=${encodeURIComponent(s.title)}` }, secondary: { label: 'Open Studio', href: '/studio' } })
  };
}

function renderGuide(g) {
  return {
    path: `/resources/guides/${g.slug}`, section: 'resources', title: g.title, description: g.description, ogType: 'article',
    crumbs: [{ label: 'Resources', href: '/resources' }, { label: 'Guides', href: '/resources/guides' }, { label: g.title, href: `/resources/guides/${g.slug}` }],
    jsonLd: { '@context': 'https://schema.org', '@type': 'Article', headline: g.title, description: g.description, author: { '@type': 'Organization', name: 'Ask Compass' }, mainEntityOfPage: absolute(`/resources/guides/${g.slug}`) },
    body: pageHero({ ...g, eyebrow: `${g.category} · ${g.minutes} min read`, crumbs: [{ label: 'Resources', href: '/resources' }, { label: 'Guides', href: '/resources/guides' }, { label: g.title }] }) +
      `<section class="section section-tight"><div class="wrap article">
        <article class="prose">${g.body}</article>
        <aside class="article-side"><p class="eyebrow">Related</p>${relatedLinks(g.related.map(linkToPlatform))}<a class="btn hx-btn-teal" href="/studio">Try it in Studio</a></aside>
      </div></section>` + cta({ title: 'See it in a guided procedure.', text: 'The Studio demo runs in your browser with sample procedures. No account needed.', primary: { label: 'Open Studio', href: '/studio' }, secondary: { label: 'More guides', href: '/resources/guides' } })
  };
}

/* ───────── pages ───────── */
const pages = [];
const add = (p) => pages.push(p);

// Home: hero, story video, use-case tabs, challenge, infrastructure, industries, capabilities, closing CTA.
add({
  path: '/', section: 'home', title: 'Ask Compass · Beyond Intelligence. Towards Clarity.',
  description: 'Ask Compass turns procedures and organizational knowledge into interactive, step-by-step guidance, so people know what to do next and move work forward.',
  bodyClass: 'is-home',
  headExtra: `<script>
  // Section links from the retired single-page prototype (e.g. /#build, or /app.html#pricing,
  // which redirects here) open the page that replaced each section.
  (function () {
    var to = { pricing: '/pricing', features: '/platform', industries: '/solutions', faq: '/faq', contact: '/contact',
      try: '/studio', build: '/studio', run: '/studio', dashboard: '/studio#/insights' }[location.hash.slice(1)];
    if (to) location.replace(to);
  })();
</script>`,
  styles: '<link rel="stylesheet" href="/assets/css/home.css">',
  jsonLd: { '@context': 'https://schema.org', '@type': 'Organization', name: 'Ask Compass', url: SITE.origin + '/', logo: SITE.origin + '/assets/brand/logo-512.png' },
  scripts: ['<script src="/assets/js/home.js" defer></script>', '<script type="module" src="/assets/js/compass.js"></script>'],
  body: ['hero', 'home-video', 'home-usecases-tabs', 'home-challenge', 'home-infra', 'home-industries', 'home-capabilities', 'home-closing'].map(section).join('\n\n')
});

add({
  ...PLATFORM.overview, path: '/platform', section: 'platform', bodyClass: 'is-overview is-platform', crumbs: [{ label: 'Platform', href: '/platform' }],
  styles: '<link rel="stylesheet" href="/assets/css/platform.css">',
  jsonLd: { '@context': 'https://schema.org', '@type': 'WebPage', name: PLATFORM.overview.title, description: PLATFORM.overview.description, url: absolute('/platform'),
    publisher: { '@type': 'Organization', name: 'Ask Compass', url: SITE.origin + '/' },
    mainEntity: { '@type': 'ItemList', name: 'Ask Compass platform capabilities', itemListElement: PLATFORM.pages.map((p, i) => ({ '@type': 'ListItem', position: i + 1, name: p.title, url: absolute(`/platform/${p.slug}`) })) } },
  scripts: ['<script src="/assets/js/platform.js" defer></script>'],
  body: renderPlatformOverview({ esc, statusPill, crumbsHtml: breadcrumbs({ crumbs: [{ label: 'Platform' }] }), PLATFORM, SOLUTIONS })
});
PLATFORM.pages.forEach((p) => add(renderCapability(p)));

add({
  ...SOLUTIONS.overview, path: '/solutions', section: 'solutions', bodyClass: 'is-overview is-solutions', crumbs: [{ label: 'Solutions', href: '/solutions' }],
  styles: '<link rel="stylesheet" href="/assets/css/solutions.css">',
  jsonLd: { '@context': 'https://schema.org', '@type': 'WebPage', name: SOLUTIONS.overview.title, description: SOLUTIONS.overview.description, url: absolute('/solutions'),
    publisher: { '@type': 'Organization', name: 'Ask Compass', url: SITE.origin + '/' },
    mainEntity: { '@type': 'ItemList', name: 'Ask Compass solutions', itemListElement: SOLUTIONS.pages.map((s, i) => ({ '@type': 'ListItem', position: i + 1, name: s.title, url: absolute(`/solutions/${s.slug}`) })) } },
  scripts: ['<script src="/assets/js/solutions.js" defer></script>'],
  body: renderSolutionsOverview({ esc, statusPill, crumbsHtml: breadcrumbs({ crumbs: [{ label: 'Solutions' }] }), SOLUTIONS, PLATFORM })
});
SOLUTIONS.pages.forEach((s) => add(renderSolution(s)));

add({
  path: '/pricing', section: 'pricing', title: 'Pricing',
  description: 'ASK COMPASS pricing: one plan at $1 per user per month, with every capability included. Try the free Studio demo while customer workspaces open.',
  crumbs: [{ label: 'Pricing', href: '/pricing' }],
  jsonLd: { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: PRICING_FAQ.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) },
  scripts: ['<script src="/assets/js/pricing.js" defer></script>'],
  body: renderPricing({ esc, statusPill, pageHero, cta, PLATFORM })
});

// Leadership sign-in, served at ceo.askcompass.in. Sign-in is not live: nothing is sent or stored.
add({
  path: '/ceo', section: 'none', bare: true, noindex: true, bodyClass: 'is-ceo',
  title: 'Leadership sign-in',
  description: 'Sign-in for the ASK COMPASS leadership team. Secure sign-in launches with the ASK COMPASS backend.',
  styles: '<link rel="stylesheet" href="/assets/css/ceo.css">',
  scripts: ['<script src="/assets/js/ceo.js" defer></script>', '<script type="module" src="/assets/js/compass.js"></script>'],
  body: section('ceo')
});

PAGES({ esc, section, flow, statusPill, relatedLinks, linkToPlatform, linkToSolution, pageHero, GUIDES, FAQ, SITE, cta }).forEach(add);
GUIDES.forEach((g) => add(renderGuide(g)));

/* ───────── write ───────── */
rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });
for (const p of pages) {
  const file = p.path === '/' ? join(OUT, 'index.html') : p.file ? join(OUT, p.file) : join(OUT, p.path.slice(1), 'index.html');
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, layout(p));
}
for (const f of ['studio.html', 'favicon.ico', 'assets']) cpSync(join(ROOT, f), join(OUT, f), { recursive: true });

const indexable = pages.filter((p) => !p.noindex);
writeFileSync(join(OUT, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${indexable.map((p) => `  <url><loc>${absolute(p.path)}</loc></url>`).join('\n')}
</urlset>
`);
writeFileSync(join(OUT, 'robots.txt'), `User-agent: *
Allow: /
Disallow: /studio.html
Disallow: /workspace

Sitemap: ${SITE.origin}/sitemap.xml
`);
// `node build.mjs --status` also regenerates docs/CAPABILITY_STATUS.md from the same content.
if (process.argv.includes('--status')) {
  const rows = PLATFORM.pages.map((p) => `## ${p.title}\n\n${p.navDesc}. Page: \`/platform/${p.slug}\`\n\n| Feature | Status |\n|---|---|\n` +
    p.groups.flatMap((g) => g.items).map((i) => `| ${i[0]} | ${STATUS[i[1]].label} |`).join('\n')).join('\n\n');
  const counts = PLATFORM.pages.flatMap((p) => p.groups.flatMap((g) => g.items)).reduce((a, i) => (a[i[1]] = (a[i[1]] || 0) + 1, a), {});
  writeFileSync(join(ROOT, '../../docs/CAPABILITY_STATUS.md'), `# Capability status\n\nGenerated by \`node build.mjs --status\` from \`apps/web/src/content/platform.mjs\`, the same source the website uses. Do not edit by hand.\n\n` +
    Object.keys(STATUS).map((k) => `- **${STATUS[k].label}** (${counts[k] || 0}): ${STATUS[k].desc}`).join('\n') +
    `\n\n“In the demo” features run in \`studio.html\` only: data lives in the visitor's browser (localStorage), roles are a demo switch, and nothing is shared or persisted on a server.\n\n${rows}\n`);
  console.log('Wrote docs/CAPABILITY_STATUS.md');
}
console.log(`Built ${pages.length} pages (${indexable.length} indexable) into ${OUT}`);
