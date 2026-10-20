/* Static checks for the generated site. Run: node tests/site.test.mjs
   Builds the site, then verifies every planned route exists, internal links
   and assets resolve, metadata is unique, and the sitemap matches. */
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'public');
execFileSync('node', [join(ROOT, 'build.mjs')], { stdio: 'inherit' });

let failures = 0;
const fail = (msg) => { failures++; console.error('  ✗ ' + msg); };
const ok = (msg) => console.log('  ✓ ' + msg);

const ROUTES = [
  '/', '/platform', '/solutions', '/resources', '/resources/guides', '/faq', '/about', '/contact',
  '/platform/workflow-engine', '/platform/workflow-builder', '/platform/guided-procedures', '/platform/process-maps',
  '/platform/si-procedure-studio', '/platform/knowledge-hub', '/platform/automation-integrations', '/platform/analytics',
  '/platform/training', '/platform/teams-collaboration', '/platform/security-governance',
  '/solutions/operations', '/solutions/employee-enablement', '/solutions/customer-support', '/solutions/process-documentation',
  '/solutions/knowledge-management', '/solutions/compliance-governance', '/solutions/enterprise-automation',
  '/privacy', '/terms', '/security', '/accessibility', '/workspace', '/workspace/unavailable'
];
const fileFor = (route) => {
  if (route === '/studio') return join(OUT, 'studio.html');           // vercel.json rewrite
  const direct = join(OUT, route);
  if (existsSync(direct) && statSync(direct).isFile()) return direct;
  return join(OUT, route === '/' ? '' : route, 'index.html');
};

console.log('Routes');
for (const r of [...ROUTES, '/studio', '/studio.html', '/app.html', '/404.html']) existsSync(fileFor(r)) ? null : fail(`missing route ${r}`);
ok(`${ROUTES.length + 4} routes checked`);

const htmlFiles = [];
(function walk(dir) { for (const f of readdirSync(dir)) { const p = join(dir, f); statSync(p).isDirectory() ? walk(p) : p.endsWith('.html') && htmlFiles.push(p); } })(OUT);
const generated = htmlFiles.filter((f) => !/\/(studio|app)\.html$/.test(f));

console.log('Links and assets');
let links = 0;
for (const f of generated) {
  const html = readFileSync(f, 'utf8');
  for (const [, href] of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
    if (/^(https?:|mailto:|tel:|data:|#)/.test(href)) continue;
    const path = href.split('#')[0].split('?')[0];
    if (!path) continue;
    links++;
    if (!existsSync(fileFor(path))) fail(`${f.replace(OUT, '')} links to missing ${href}`);
  }
}
ok(`${links} internal links and assets resolve`);

console.log('Metadata');
const titles = new Map(), canon = new Map();
for (const f of generated) {
  const html = readFileSync(f, 'utf8'), rel = f.replace(OUT, '');
  const title = (html.match(/<title>([^<]*)<\/title>/) || [])[1];
  const desc = (html.match(/<meta name="description" content="([^"]*)"/) || [])[1];
  const c = (html.match(/<link rel="canonical" href="([^"]*)"/) || [])[1];
  const noindex = html.includes('content="noindex"');
  const h1s = (html.match(/<h1[\s>]/g) || []).length;
  if (!title) fail(`${rel} has no title`); else if (titles.has(title)) fail(`${rel} duplicates title of ${titles.get(title)}`); else titles.set(title, rel);
  if (!desc || desc.length < 50) fail(`${rel} needs a longer description`);
  if (!noindex && !c) fail(`${rel} has no canonical URL`);
  if (c) { if (canon.has(c)) fail(`${rel} duplicates canonical ${c}`); canon.set(c, rel); }
  if (h1s !== 1) fail(`${rel} has ${h1s} h1 elements`);
  if (!html.includes('id="main"')) fail(`${rel} has no main landmark`);
}
ok(`${generated.length} pages have unique titles, descriptions, one h1 and a main landmark`);

console.log('Sitemap and robots');
const sitemap = readFileSync(join(OUT, 'sitemap.xml'), 'utf8');
const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
for (const c of canon.keys()) if (!locs.includes(c)) fail(`sitemap missing ${c}`);
if (locs.length !== canon.size) fail(`sitemap has ${locs.length} URLs, expected ${canon.size}`);
if (!readFileSync(join(OUT, 'robots.txt'), 'utf8').includes('Sitemap:')) fail('robots.txt has no sitemap line');
ok(`sitemap lists ${locs.length} canonical URLs`);

console.log('Honesty checks');
const all = generated.map((f) => readFileSync(f, 'utf8')).join('\n');
for (const banned of ['testimonial', 'SOC 2', 'ISO 27001', 'HIPAA compliant', 'trusted by', '% faster', 'customers love']) {
  if (all.toLowerCase().includes(banned.toLowerCase())) fail(`found unsupported claim text: “${banned}”`);
}
if (/type="password"/.test(all)) fail('a page asks for a password, but sign-in does not exist yet');
ok('no fabricated proof, certifications or password fields');

const vercel = JSON.parse(readFileSync(join(ROOT, 'vercel.json'), 'utf8'));
if (vercel.redirects.some((r) => r.source === '/' && !r.has)) fail('the marketing homepage must not redirect');
ok('vercel.json keeps the homepage on the marketing site');

console.log(failures ? `\n${failures} check(s) failed` : '\nAll checks passed');
process.exit(failures ? 1 : 0);
