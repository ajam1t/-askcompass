/* Ask Compass site build.
   Generates every public page from shared templates and the content files in
   src/content, then copies the existing Studio demo, legacy app and assets.
   No dependencies: run with `node build.mjs`. Output goes to ./public. */
import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { SITE, NAV, FOOTER, STATUS } from './src/content/site.mjs';
import { PLATFORM } from './src/content/platform.mjs';
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
  const title = page.path === '/' ? page.title : `${page.title} · Ask Compass`;
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
${page.styles || ''}
${ld.map((o) => `<script type="application/ld+json">${JSON.stringify(o)}</script>`).join('\n')}
</head>`;
}

function megaMenu(id, label, group, active) {
  const items = group.items.map((i) => `<a href="${i.href}"${i.href === active ? ' aria-current="page"' : ''}><b>${esc(i.label)}</b><small>${esc(i.desc)}</small></a>`).join('');
  return `<div class="nav-drop${group.mega ? ' nav-mega' : ''}">
        <button class="nav-drop-btn" type="button" aria-expanded="false" aria-controls="${id}">${esc(label)} <span class="chev" aria-hidden="true"></span></button>
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
      ${megaMenu('mm-platform', 'Platform', NAV.platform, page.path)}
      ${megaMenu('mm-solutions', 'Solutions', NAV.solutions, page.path)}
      ${megaMenu('mm-resources', 'Resources', NAV.resources, page.path)}
      <a href="/about"${cur('about')}>About</a>
      <a href="/contact"${cur('contact')}>Contact</a>
      <a class="btn btn-primary nav-cta-mobile" href="/studio">Open Studio</a>
    </nav>
    <div class="header-actions">
      <a class="btn btn-ghost btn-sm hdr-get" href="/contact">Get started</a>
      <a class="btn btn-primary btn-sm" href="/studio">Open Studio</a>
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

function layout(page) {
  const scripts = ['<script src="/assets/js/site.js" defer></script>', ...(page.scripts || [])].join('\n');
  return `${head(page)}
<body class="${page.bodyClass || ''}">
${header(page)}
<main id="main">
${page.body}
</main>
${footer()}
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

const cta = (c) => `<section class="band band-cta"><div class="wrap band-cta-in">
    <div><h2>${esc(c.title)}</h2><p>${esc(c.text)}</p></div>
    <div class="hero-ctas">${c.primary ? `<a class="btn btn-gold btn-sheen" href="${c.primary.href}">${esc(c.primary.label)} <span aria-hidden="true">→</span></a>` : ''}${c.secondary ? `<a class="btn btn-ghost-dark" href="${c.secondary.href}">${esc(c.secondary.label)}</a>` : ''}</div>
  </div></section>`;

const relatedLinks = (items) => `<ul class="related">${items.map((r) => `<li><a href="${r.href}"><b>${esc(r.label)}</b><span>${esc(r.desc || '')}</span></a></li>`).join('')}</ul>`;

function pageHero(p) {
  return `<section class="page-hero"><div class="wrap">
    ${breadcrumbs(p)}
    <p class="eyebrow">${esc(p.eyebrow)}</p>
    <h1>${p.h1Html || esc(p.h1 || p.title)}</h1>
    <p class="page-lead">${esc(p.lead)}</p>
    ${p.heroActions || ''}
  </div></section>`;
}

/* ───────── page renderers ───────── */
const platformByKey = Object.fromEntries(PLATFORM.pages.map((p) => [p.slug, p]));
const solutionByKey = Object.fromEntries(SOLUTIONS.pages.map((p) => [p.slug, p]));
const linkToPlatform = (slug) => { const p = platformByKey[slug]; return { href: `/platform/${slug}`, label: p.title, desc: p.navDesc }; };
const linkToSolution = (slug) => { const p = solutionByKey[slug]; return { href: `/solutions/${slug}`, label: p.title, desc: p.navDesc }; };

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
      heroActions: `<div class="hero-ctas"><a class="btn btn-primary btn-sheen" href="${p.demoHref || '/studio'}">${esc(p.demoLabel || 'Try it in the Studio demo')} <span aria-hidden="true">→</span></a><a class="btn btn-ghost" href="/contact">Talk to us</a></div>` }) +
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
      heroActions: `<div class="hero-ctas"><a class="btn btn-primary btn-sheen" href="/contact?topic=${encodeURIComponent(s.title)}">Discuss your process <span aria-hidden="true">→</span></a><a class="btn btn-ghost" href="${s.demoHref || '/studio'}">Try a sample</a></div>` }) +
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
        <aside class="article-side"><p class="eyebrow">Related</p>${relatedLinks(g.related.map(linkToPlatform))}<a class="btn btn-primary" href="/studio">Try it in Studio</a></aside>
      </div></section>`
  };
}

/* ───────── pages ───────── */
const pages = [];
const add = (p) => pages.push(p);

// Home: hero, story video, use-case tabs, challenge, infrastructure, industries, platform preview, capabilities, Studio preview, closing CTA, founder.
add({
  path: '/', section: 'home', title: 'Ask Compass · Beyond Intelligence. Towards Clarity.',
  description: 'Ask Compass turns procedures and organizational knowledge into interactive, step-by-step guidance, so people know what to do next and move work forward.',
  bodyClass: 'is-home',
  headExtra: `<script>
  // Links to the previous single-page site (e.g. /#build) now live in the legacy app.
  (function () {
    var h = location.hash.slice(1);
    if (['try','features','industries','faq','contact','build','run','dashboard','pricing'].indexOf(h) !== -1) location.replace('/app.html#' + h);
  })();
</script>`,
  styles: '<link rel="stylesheet" href="/assets/css/home.css">',
  jsonLd: { '@context': 'https://schema.org', '@type': 'Organization', name: 'Ask Compass', url: SITE.origin + '/', logo: SITE.origin + '/assets/brand/logo-512.png', founder: { '@type': 'Person', name: 'Resham Chaudhary' } },
  scripts: ['<script src="/assets/js/home.js" defer></script>', '<script type="module" src="/assets/js/compass.js"></script>'],
  body: ['hero', 'home-video', 'home-usecases-tabs', 'home-challenge', 'home-infra', 'home-industries', 'home-platform', 'home-capabilities', 'home-studio', 'home-closing', 'founder'].map(section).join('\n\n')
});

add({
  ...PLATFORM.overview, path: '/platform', section: 'platform', crumbs: [{ label: 'Platform', href: '/platform' }],
  body: pageHero({ ...PLATFORM.overview, crumbs: [{ label: 'Platform' }] }) + PLATFORM.overview.render({ flow, statusPill, legend, esc, section, PLATFORM }) +
    cta({ title: 'Try the platform on a sample procedure.', text: 'Studio is the public demo. It runs in your browser with sample data.', primary: { label: 'Open Studio', href: '/studio' }, secondary: { label: 'Send a business enquiry', href: '/contact' } })
});
PLATFORM.pages.forEach((p) => add(renderCapability(p)));

add({
  ...SOLUTIONS.overview, path: '/solutions', section: 'solutions', crumbs: [{ label: 'Solutions', href: '/solutions' }],
  body: pageHero({ ...SOLUTIONS.overview, crumbs: [{ label: 'Solutions' }] }) + SOLUTIONS.overview.render({ esc, section, SOLUTIONS, relatedLinks, linkToSolution }) +
    cta({ title: 'Have a process people struggle to follow?', text: 'Tell us about it. We will show how it would work as a guided procedure.', primary: { label: 'Send a business enquiry', href: '/contact' }, secondary: { label: 'Open Studio', href: '/studio' } })
});
SOLUTIONS.pages.forEach((s) => add(renderSolution(s)));

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
for (const f of ['studio.html', 'app.html', 'favicon.ico', 'assets']) cpSync(join(ROOT, f), join(OUT, f), { recursive: true });

const indexable = pages.filter((p) => !p.noindex);
writeFileSync(join(OUT, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${indexable.map((p) => `  <url><loc>${absolute(p.path)}</loc></url>`).join('\n')}
</urlset>
`);
writeFileSync(join(OUT, 'robots.txt'), `User-agent: *
Allow: /
Disallow: /app.html
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
