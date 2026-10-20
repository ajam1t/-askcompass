/* The /solutions overview page: a compass dial of the seven solutions, where
   documented work breaks, a scenario explorer built from each solution's
   example workflow, a one-question starting-point picker, the two sides of a
   procedure and a closing call to action. Scenarios are illustrations, not
   customer stories, and nothing here quotes a measured result. */
import { ICONS, CAPS } from './platform-page.mjs';

const svg = (paths, cls = '') => `<svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true">${paths}</svg>`;

// Per solution: icon, colour, and the one-line problem and direction used by
// the dial caption, the starting-point picker and the explorer.
const META = {
  operations: { c: '#2563EB', icon: '<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4h6v3H9zM8.5 12.5l2 2 4-4M8.5 17.5h7"/>',
    pain: 'The same task is done differently by different people.', to: 'One SOP everyone follows, with clean hand-offs.' },
  'employee-enablement': { c: '#0E8A80', icon: '<circle cx="10" cy="8" r="3.5"/><path d="M3.5 20a6.5 6.5 0 0 1 13 0M18.5 6.5v6M15.5 9.5h6"/>',
    pain: 'New people take a long time to get going.', to: 'Guidance in the flow of work from day one.' },
  'customer-support': { c: '#0B87B6', icon: '<path d="M4 13v-1a8 8 0 0 1 16 0v1"/><rect x="3" y="13" width="4" height="6" rx="1.5"/><rect x="17" y="13" width="4" height="6" rx="1.5"/><path d="M19 19c0 1.5-2 2.5-5 2.5"/>',
    pain: 'Customers get different answers from different agents.', to: 'The right troubleshooting path, step by step.' },
  'process-documentation': { c: '#6A4BD8', icon: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h4"/><path d="M14 3v5h5v3M9 9h2M9 13h4"/><path d="m14.5 21 6-6 1.5 1.5-6 6h-1.5z"/>',
    pain: 'Our documents no longer match how the work is done.', to: 'Procedures with owners, versions and reviews.' },
  'knowledge-management': { c: '#B26F08', icon: '<path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3z"/>',
    pain: 'People cannot find the right answer when they need it.', to: 'Knowledge tied to the step it supports.' },
  'compliance-governance': { c: '#173F73', icon: '<path d="M12 3 5 6v5c0 4.5 3 8.3 7 10 4-1.7 7-5.5 7-10V6z"/><path d="m9 12 2 2 4-4"/>',
    pain: 'We cannot show which version of a procedure was followed.', to: 'Approved procedures with an audit trail.' },
  'enterprise-automation': { c: '#C2416B', icon: '<circle cx="6" cy="6" r="2.5"/><circle cx="18" cy="18" r="2.5"/><path d="M8.5 6H14a4 4 0 0 1 0 8h-4a4 4 0 0 0 0 8h5.5"/>',
    pain: 'The same details are typed into several systems.', to: 'Connected actions with human checks (planned).' }
};

const BREAKS = [
  { t: 'Hard to find', icon: ICONS['knowledge-hub'], pain: 'The right document is buried in a shared drive, next to three older copies.', fix: 'Search lands on the exact step, in the approved version.' },
  { t: 'Too much to read', icon: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M9 12h6M9 15h6M9 18h4"/>', pain: 'The steps that apply are mixed in with the ones that do not.', fix: 'Only the questions that decide the path, one at a time.' },
  { t: 'Surprises halfway', icon: '<path d="M12 3 2.5 20h19z"/><path d="M12 10v4.5M12 17.5v.5"/>', pain: 'Exceptions only appear on page 31, after the work has started.', fix: 'Each exception sits on the step where it happens.' },
  { t: 'Which version?', icon: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>', pain: 'Nobody can tell which copy of the procedure was followed.', fix: 'Everyone follows the published version, with history.' }
];

const KIND = { action: 'Step', decision: 'Decision', exception: 'Exception', approval: 'Approval', auto: 'Automation', link: 'Linked procedure', form: 'Form', end: 'Outcome', source: 'Source' };

const PERSON = ['Find answers without unnecessary searching.', 'Understand what to do next.', 'Work through unfamiliar procedures with confidence.', 'Spend less time unsure about complex tasks.'];
const OWNER = ['Maintain approved procedures in one place.', 'Communicate changes to the people they affect.', 'Improve consistency in how work is done.', 'See where guidance needs improving.'];

export function renderSolutionsOverview({ esc, statusPill, crumbsHtml, SOLUTIONS, PLATFORM }) {
  const sols = SOLUTIONS.pages;
  const capBySlug = Object.fromEntries(PLATFORM.pages.map((p) => [p.slug, p]));
  const groupOf = Object.fromEntries(CAPS.map((c) => [c.slug, c.group]));
  const icon = (slug, cls) => svg(META[slug].icon, cls);
  // A solution is planned only when its own page says so; otherwise a missing sample just means Studio has none for it.
  const isPlanned = (s) => /^Planned/.test(s.description);
  const tryLink = (s) => s.demoHref ? `<a class="text-link" href="${s.demoHref}">Try a sample in Studio →</a>`
    : isPlanned(s) ? `<span class="sxe-plan">${statusPill('planned')} This scenario is a design, not in the demo yet.</span>`
    : '<a class="text-link" href="/studio">No sample for this scenario yet. Try the others in Studio →</a>';
  const capChip = (slug) => `<a class="px-chip g-${groupOf[slug]}" href="/platform/${slug}">${svg(ICONS[slug], 'px-chip-ic')}${esc(capBySlug[slug].title)}</a>`;

  /* ── A. hero: the seven solutions as bearings on a compass dial ── */
  const nodes = sols.map((s, i) => {
    const deg = i * 360 / sols.length, a = (deg - 90) * Math.PI / 180;
    const x = 50 + 40 * Math.cos(a), y = 50 + 40 * Math.sin(a);
    const side = Math.abs(x - 50) < 4 ? 't' : x > 50 ? 'r' : 'l';
    return { s, deg, x, y, side };
  });
  const ticks = Array.from({ length: 72 }, (_, i) => {
    const a = i * 5 * Math.PI / 180, r1 = i % 9 === 0 ? 44.5 : 46, r2 = 47.5;
    return `<line x1="${(50 + r1 * Math.sin(a)).toFixed(2)}" y1="${(50 - r1 * Math.cos(a)).toFixed(2)}" x2="${(50 + r2 * Math.sin(a)).toFixed(2)}" y2="${(50 - r2 * Math.cos(a)).toFixed(2)}"/>`;
  }).join('');
  const hero = `<section class="px-hero sx-hero" aria-labelledby="sx-title">
  <div class="px-hero-bg" aria-hidden="true"></div>
  <div class="wrap px-hero-in">
    <div class="px-hero-copy">
      ${crumbsHtml}
      <p class="px-pill">ASK COMPASS solutions</p>
      <h1 id="sx-title">For any work where <span class="px-grad">the right next step</span> isn’t obvious.</h1>
      <p class="px-lead">ASK COMPASS is not built for one industry. It is built for a kind of work: procedures with decisions, exceptions and hand-offs, where getting it right depends on knowing what applies to this case.</p>
      <div class="hero-ctas">
        <a class="btn hx-btn-gold btn-sheen" href="#start">Find your starting point <span aria-hidden="true">→</span></a>
        <a class="btn hx-btn-teal" href="/studio">Open Studio</a>
      </div>
    </div>
    <div class="sxd-wrap">
      <nav class="sxd" id="sxDial" aria-label="Solutions">
        <svg class="sxd-ring" viewBox="0 0 100 100" aria-hidden="true">
          <circle class="r-out" cx="50" cy="50" r="48"/><circle class="r-mid" cx="50" cy="50" r="40"/><circle class="r-in" cx="50" cy="50" r="30"/>
          <g class="r-ticks">${ticks}</g>
        </svg>
        <span class="sxd-needle" aria-hidden="true"><i></i></span>
        <img class="sxd-core" src="/assets/brand/logo-256.webp" width="256" height="256" alt="">
        <ul class="sxd-nodes">${nodes.map((n, i) => `<li style="left:${n.x.toFixed(2)}%;top:${n.y.toFixed(2)}%;--c:${META[n.s.slug].c};--deg:${n.deg.toFixed(2)}deg" class="sxd-n side-${n.side}${i === 0 ? ' is-on' : ''}" data-i="${i}">
          <a href="/solutions/${n.s.slug}"><span class="sxd-ic">${icon(n.s.slug, 'sx-ic')}</span><span class="sxd-l">${esc(n.s.title)}</span></a></li>`).join('')}</ul>
      </nav>
      <p class="sxd-cap" id="sxCap" aria-hidden="true">${nodes.map((n, i) => `<span data-i="${i}"${i === 0 ? ' class="is-on"' : ''}><b>${esc(n.s.title)}</b>${esc(n.s.navDesc)}</span>`).join('')}</p>
    </div>
  </div>
</section>`;

  /* ── B. where documented work breaks ── */
  const breaks = `<section class="px-sec sxb-sec" id="breaks" aria-labelledby="sb-title">
  <div class="wrap">
    <header class="px-head">
      <p class="px-pill">The problem</p>
      <h2 id="sb-title">Documentation exists. <span class="px-grad">Clarity often does not.</span></h2>
      <p class="px-sub">Most organizations already write their procedures down. The trouble starts when someone has to use one. These are the four places it usually breaks, in every industry.</p>
    </header>
    <ol class="sxb" id="sxBreaks">${BREAKS.map((b, i) => `<li class="sxb-c" style="--k:${i}">
      <span class="sxb-track" aria-hidden="true"><i class="t-a"></i><i class="t-gap"></i><i class="t-b"></i></span>
      <span class="sxb-ic">${svg(b.icon, 'sx-ic')}</span>
      <h3><span class="sxb-n">0${i + 1}</span> ${esc(b.t)}</h3>
      <p class="sxb-pain"><span class="sr-only">Where it breaks: </span>${esc(b.pain)}</p>
      <p class="sxb-fix"><b>With guided steps</b>${esc(b.fix)}</p>
    </li>`).join('')}</ol>
  </div>
</section>`;

  /* ── C. scenario explorer ── */
  const flowHtml = (steps) => `<ol class="sxw">${steps.map((st, k) => `<li class="sxw-s k-${st.type || 'action'}" style="--k:${k}">
      <span class="sxw-dot" aria-hidden="true"></span><span class="sxw-k">${esc(KIND[st.type || 'action'])}</span>
      <b>${esc(st.label)}</b>${st.alt ? `<span class="sxw-alt">${esc(st.alt)}</span>` : ''}${st.note ? `<span class="sxw-note">${esc(st.note)}</span>` : ''}</li>`).join('')}</ol>`;
  const panel = (s, i) => `<div class="sxe-p" id="sxp-${i}" role="tabpanel" aria-labelledby="sxt-${i}" tabindex="0" style="--c:${META[s.slug].c}"${i === 0 ? '' : ' data-off'}>
      <div class="sxe-top"><span class="sxe-ic">${icon(s.slug, 'sx-ic')}</span><div><p class="sxe-k">${esc(s.title)} · illustrative scenario</p><h3>${esc(s.scenarioTitle)}</h3></div></div>
      <p class="sxe-sc">${esc(s.scenario)}</p>
      <div class="sxe-grid">
        <div class="sxe-flow"><p class="sxe-h">Example workflow</p>${flowHtml(s.workflow)}</div>
        <div class="sxe-ba">
          <div class="sxe-b"><p class="sxe-h">Without guided work</p><ul>${s.before.slice(0, 3).map((t) => `<li>${esc(t)}</li>`).join('')}</ul></div>
          <div class="sxe-a"><p class="sxe-h">With ASK COMPASS</p><ul>${s.after.slice(0, 3).map((t) => `<li>${esc(t)}</li>`).join('')}</ul></div>
        </div>
      </div>
      <div class="sxe-foot">
        <div><p class="sxe-h">Built from</p><div class="px-chips">${s.features.map(capChip).join('')}</div></div>
        <div class="sxe-links"><a class="btn hx-btn-gold btn-sheen" href="/solutions/${s.slug}">Read ${esc(s.title)} <span aria-hidden="true">→</span></a>
        ${tryLink(s)}</div>
      </div>
    </div>`;
  const explorer = `<section class="px-sec sxe-sec" id="solutions" aria-labelledby="se-title">
  <div class="wrap">
    <header class="px-head">
      <p class="px-pill">Where it helps</p>
      <h2 id="se-title">Seven kinds of work, <span class="px-grad">one approach.</span></h2>
      <p class="px-sub">Pick a kind of work to see a realistic scenario and the guided workflow behind it. Scenarios are illustrations, not customer case studies.</p>
    </header>
    <div class="sxe" id="sxExplorer">
      <div class="sxe-tabs" role="tablist" aria-label="Solutions" aria-orientation="vertical">${sols.map((s, i) => `<button type="button" class="sxe-t${i === 0 ? ' is-on' : ''}" role="tab" id="sxt-${i}" aria-controls="sxp-${i}" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}" style="--c:${META[s.slug].c}">
        <span class="sxe-ic">${icon(s.slug, 'sx-ic')}</span><span class="sxe-tt"><b>${esc(s.title)}</b><small>${esc(s.navDesc)}</small></span></button>`).join('')}</div>
      <div class="sxe-panels">${sols.map(panel).join('')}</div>
    </div>
  </div>
</section>`;

  /* ── D. find your starting point, one question at a time ── */
  const start = `<section class="px-sec sxq-sec" id="start" aria-labelledby="sq-title">
  <div class="wrap sxq">
    <div class="sxq-copy">
      <p class="px-pill">Find your starting point</p>
      <h2 id="sq-title">Answer one question. <span class="px-grad">Get a direction.</span></h2>
      <p class="px-sub">This is how ASK COMPASS works: it asks one question at a time, and your answer decides the next step. Try it on yourself.</p>
    </div>
    <div class="sxq-card" id="sxQuiz">
      <div class="sxq-prog" aria-hidden="true"><span class="sxq-step">Step <b>1</b> of 2</span><i><b></b></i></div>
      <div class="sxq-q" id="sxQ">
        <span class="sxq-badge">Decision</span>
        <h3 class="sxq-title" id="sxQTitle">What makes the work hardest today?</h3>
        <p class="sxq-sel">Select one option</p>
        <ul class="sxq-opts">${sols.map((s) => `<li><a class="sxq-opt" href="/solutions/${s.slug}" data-s="${s.slug}" style="--c:${META[s.slug].c}">${esc(META[s.slug].pain)}</a></li>`).join('')}</ul>
      </div>
      ${sols.map((s) => `<div class="sxq-r" data-s="${s.slug}" hidden style="--c:${META[s.slug].c}">
        <span class="sxq-badge is-end">Outcome</span>
        <h3 class="sxq-title" tabindex="-1">Start with ${esc(s.title)}</h3>
        <p class="sxq-why"><span>You said:</span> ${esc(META[s.slug].pain)}</p>
        <p class="sxq-to"><span>Direction:</span> ${esc(META[s.slug].to)}</p>
        <p class="sxq-ex">Example: ${esc(s.scenarioTitle.charAt(0).toLowerCase() + s.scenarioTitle.slice(1))}.</p>
        <div class="sxq-acts"><a class="btn hx-btn-gold btn-sheen" href="/solutions/${s.slug}">Read ${esc(s.title)} <span aria-hidden="true">→</span></a>${s.demoHref ? `<a class="btn hx-btn-teal" href="${s.demoHref}">Try it in Studio</a>` : isPlanned(s) ? statusPill('planned') : '<a class="btn hx-btn-teal" href="/studio">Open Studio</a>'}</div>
        <div class="sxq-foot"><button type="button" class="sxq-back">← Back</button></div>
      </div>`).join('')}
    </div>
  </div>
</section>`;

  /* ── E. one procedure, two sides ── */
  const tick = (t) => `<li>${esc(t)}</li>`;
  const sides = `<section class="px-sec sxs-sec" id="two-sides" aria-labelledby="ss-title">
  <div class="wrap">
    <header class="px-head">
      <p class="px-pill">One procedure, two sides</p>
      <h2 id="ss-title">Clear guidance for the people doing the work, <span class="px-grad">and control for the people who own it.</span></h2>
    </header>
    <div class="sxs">
      <div class="sxs-side sxs-l"><span class="sxs-ic">${svg('<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>', 'sx-ic')}</span><h3>For the person doing the work</h3><ul>${PERSON.map(tick).join('')}</ul></div>
      <div class="sxs-core" aria-hidden="true"><i class="sxs-beam b-l"></i><span class="sxs-doc"><img src="/assets/brand/logo-128.webp" width="128" height="128" alt=""><b>Approved procedure</b><small>One published version</small></span><i class="sxs-beam b-r"></i></div>
      <div class="sxs-side sxs-r"><span class="sxs-ic">${svg(ICONS['teams-collaboration'], 'sx-ic')}</span><h3>For the people who own the process</h3><ul>${OWNER.map(tick).join('')}</ul></div>
    </div>
    <div class="sxs-now">
      <p>${statusPill('demo')} <span>Guided procedures, decisions, linked procedures, SOP maps, drafts, approvals, version history and usage insights, with sample data stored in your browser.</span></p>
      <p>${statusPill('planned')} <span>Customer workspaces with sign-in, shared data, integrations and drafting with SI.</span></p>
      <a class="text-link" href="/platform#capabilities">See the status of every feature →</a>
    </div>
  </div>
</section>`;

  /* ── F. final call to action ── */
  const close = `<section class="px-close" aria-labelledby="sz-title">
  <div class="wrap px-close-in">
    <img class="px-close-mark" src="/assets/brand/logo-128.webp" width="128" height="128" alt="">
    <div class="px-close-copy"><h2 id="sz-title">Map one of your processes <span class="px-grad">with us.</span></h2>
    <p>Tell us about a procedure your team finds hard to follow. We will show how it would work as guided steps.</p></div>
    <div class="hero-ctas"><a class="btn hx-btn-gold btn-sheen" href="/contact">Send a business enquiry <span aria-hidden="true">→</span></a><a class="btn hx-btn-teal" href="/studio">Open Studio</a></div>
  </div>
</section>`;

  return [hero, breaks, explorer, start, sides, close].join('\n\n');
}
