/* The /platform overview page: hero layer stack, operating model, capability
   explorer, an illustrative end-to-end example, the real Studio, outcomes and
   what runs today versus what is planned. Feature statuses come from
   platform.mjs, so the page never claims more than the capability pages do. */

const svg = (paths, cls = '') => `<svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true">${paths}</svg>`;

export const ICONS = {
  'workflow-builder': '<rect x="3.5" y="3.5" width="7" height="5" rx="1.2"/><rect x="13.5" y="15.5" width="7" height="5" rx="1.2"/><path d="M7 8.5V12h10v3.5"/>',
  'process-maps': '<circle cx="12" cy="5" r="2.4"/><circle cx="6" cy="19" r="2.4"/><circle cx="18" cy="19" r="2.4"/><path d="M12 7.4v4M12 11.4 6.8 16.8M12 11.4l5.2 5.4"/>',
  'si-procedure-studio': '<path d="M11 3.5l1.8 4.7 4.7 1.8-4.7 1.8L11 16.5l-1.8-4.7L4.5 10l4.7-1.8z"/><path d="M18 14.5l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8z"/>',
  'guided-procedures': '<circle cx="12" cy="12" r="9"/><path d="m15.5 8.5-2.2 4.8-4.8 2.2 2.2-4.8z"/>',
  'knowledge-hub': '<circle cx="11" cy="11" r="6.5"/><path d="m16 16 4.5 4.5M8.5 9.5h5M8.5 12.5h3.5"/>',
  training: '<path d="M2.5 9 12 4.5 21.5 9 12 13.5z"/><path d="M6.5 11v5c3 2.2 8 2.2 11 0v-5M21.5 9v5"/>',
  'workflow-engine': '<path d="M19.5 12a7.5 7.5 0 0 1-13 5.1M4.5 12a7.5 7.5 0 0 1 13-5.1"/><path d="M17.8 3.5v3.6h-3.6M6.2 20.5v-3.6h3.6"/><path d="M10.5 9.5v5l4-2.5z"/>',
  'automation-integrations': '<path d="M13 2.5 5 13.5h6l-1 8 8-11h-6z"/>',
  analytics: '<path d="M5 20v-6M10 20V9M15 20v-4M20 20V5"/>',
  'teams-collaboration': '<circle cx="9" cy="8" r="3.4"/><path d="M2.8 20a6.2 6.2 0 0 1 12.4 0"/><path d="M15.5 4.8a3.4 3.4 0 0 1 0 6.4M18 14.2a6 6 0 0 1 3.3 5.8"/>',
  'security-governance': '<path d="M12 3 5 6v5c0 4.5 3 8.3 7 10 4-1.7 7-5.5 7-10V6z"/><path d="m9 12 2 2 4-4"/>'
};

export const GROUPS = [
  { key: 'guide', title: 'Guide & enable', line: 'Help people do the work right, while they are doing it.' },
  { key: 'create', title: 'Create & structure', line: 'Give what people know a clear, followable shape.' },
  { key: 'connect', title: 'Connect & improve', line: 'Run procedures reliably and learn from every run.' },
  { key: 'govern', title: 'Collaborate & govern', line: 'Change procedures safely, with a record of who did what.' }
];

// Order is the bento order: featured first, then two wide cards placed by CSS.
export const CAPS = [
  { slug: 'guided-procedures', group: 'guide', featured: true,
    what: 'People follow the work one question at a time, with checklists, exceptions and the source beside every step.',
    benefit: 'Fewer wrong turns, and no re-reading of a long document mid-task.' },
  { slug: 'knowledge-hub', group: 'guide',
    what: 'Search procedures and individual steps, and open a procedure at the exact step you need.',
    benefit: 'Every answer points to an owned, versioned source.' },
  { slug: 'training', group: 'guide',
    what: 'Practise any procedure step by step. Onboarding paths and knowledge checks are planned.',
    benefit: 'New starters learn on the real procedure, not a copy.' },
  { slug: 'workflow-builder', group: 'create',
    what: 'Design steps, decisions, exceptions and linked procedures, with a live preview of the map.',
    benefit: 'Procedures get a clear structure before anyone has to follow them.' },
  { slug: 'process-maps', group: 'create',
    what: 'Every procedure draws its own SOP map and decision tree from the same definition.',
    benefit: 'The map can never drift from the steps people follow.' },
  { slug: 'si-procedure-studio', group: 'create', wide: true,
    what: 'Draft procedures from documents, notes and transcripts with SI, then review every change before it is published.',
    benefit: 'Faster first drafts, with a person always approving.' },
  { slug: 'workflow-engine', group: 'connect',
    what: 'Runs each procedure as a versioned definition and chooses the branch from the answers given.',
    benefit: 'Everyone follows the published version, the same way.' },
  { slug: 'automation-integrations', group: 'connect',
    what: 'Triggers, webhooks and connected systems, with people approving consequential actions.',
    benefit: 'Less copying the same details between systems.' },
  { slug: 'analytics', group: 'connect',
    what: 'Starts, completions, drop-offs, restarts and feedback flags, step by step.',
    benefit: 'Fix the step that causes trouble, not the symptom.' },
  { slug: 'teams-collaboration', group: 'govern',
    what: 'Drafts, side-by-side review, approval with a comment and full version history.',
    benefit: 'Changes are reviewed before they reach anyone.' },
  { slug: 'security-governance', group: 'govern', wide: true,
    what: 'Approved-content control, approval history and an audit log of changes today. Sign-in, server-enforced roles and tenant isolation are planned.',
    benefit: 'A clear record of who changed what, and when.' }
];

// Decorative drawings for the two wide cards.
const WIDE_VIS = {
  'si-procedure-studio': `<svg class="pxc-art" viewBox="0 0 240 90" aria-hidden="true">
    <rect x="6" y="10" width="54" height="70" rx="7"/><path d="M16 26h34M16 38h34M16 50h24M16 62h30"/>
    <path class="a-flow" d="M70 45h38"/><path class="a-spark" d="M120 30l4 11 11 4-11 4-4 11-4-11-11-4 11-4z"/>
    <path class="a-flow" d="M140 45h22"/>
    <rect x="170" y="10" width="64" height="18" rx="6"/><rect x="170" y="36" width="64" height="18" rx="6"/><rect x="170" y="62" width="64" height="18" rx="6"/></svg>`,
  'security-governance': `<svg class="pxc-art" viewBox="0 0 240 90" aria-hidden="true">
    <path d="M40 8 12 20v20c0 20 12 34 28 42 16-8 28-22 28-42V20z"/><path d="m28 44 9 9 17-18"/>
    <path class="a-flow" d="M80 45h20"/>
    <rect x="110" y="10" width="124" height="18" rx="6"/><rect x="110" y="36" width="124" height="18" rx="6"/><rect x="110" y="62" width="124" height="18" rx="6"/>
    <path d="M120 19h40M120 45h56M120 71h32"/><circle cx="222" cy="19" r="4"/><circle cx="222" cy="45" r="4"/><circle cx="222" cy="71" r="4"/></svg>`
};

const LAYERS = [
  { name: 'Knowledge', sub: 'Policies, procedures and sources', c: '#173F73',
    glyph: '<rect x="-74" y="-62" width="62" height="80" rx="6"/><rect x="-4" y="-40" width="62" height="80" rx="6"/><path d="M-62 -42h38M-62 -26h38M-62 -10h26M8 -20h38M8 -4h38M8 12h26"/>' },
  { name: 'Structure', sub: 'Steps, decisions and exceptions', c: '#2563EB',
    glyph: '<circle cx="-50" cy="-50" r="14"/><circle cx="50" cy="-50" r="14"/><circle cx="0" cy="48" r="14"/><path d="M-38 -42 -10 38M38 -42 10 38M-36 -50h72"/>' },
  { name: 'Guidance', sub: 'One question at a time', c: '#0B87B6',
    glyph: '<rect x="-74" y="-58" width="148" height="34" rx="10"/><rect x="-74" y="-10" width="148" height="28" rx="9"/><rect x="-74" y="28" width="148" height="28" rx="9"/><path d="M-60 -41l8-8 8 8-8 8z"/>' },
  { name: 'Insight', sub: 'Where people stop or restart', c: '#0E8A80',
    glyph: '<path d="M-64 60V10M-30 60V-30M4 60V20M38 60V-60M72 60V-6"/>' },
  { name: 'Governance', sub: 'Versions, approvals and audit', c: '#B97A0E',
    glyph: '<path d="M0 -66 -44 -48v28c0 28 18 50 44 62 26-12 44-34 44-62v-28z"/><path d="m-18 -6 12 12 26-26"/>' }
];

const STAGES = [
  { t: 'Capture knowledge', icon: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M9 13h6M9 17h4"/>',
    text: 'Bring policies, documents and what experienced people know into one place, each with an owner and a version.',
    points: ['Procedures, policies and sources in one library', 'Search that opens a procedure at the right step', 'Drafting from documents with SI (planned)'],
    caps: ['knowledge-hub', 'si-procedure-studio'], tryHref: '/studio#/search?q=refund', tryLabel: 'Try step-level search' },
  { t: 'Structure work', icon: ICONS['process-maps'],
    text: 'Turn that knowledge into steps, decisions, exceptions and linked procedures, and see it as an SOP map.',
    points: ['Decisions with labelled answers and branches', 'Checks for dead ends and unreachable steps', 'A map drawn from the same definition'],
    caps: ['workflow-builder', 'process-maps'], tryHref: '/studio#/p/customer-refund/map', tryLabel: 'Open a sample SOP map' },
  { t: 'Guide execution', icon: ICONS['guided-procedures'],
    text: 'Ask one question at a time and show the next step from the answer, with the source beside it.',
    points: ['Only the questions that decide the path', 'Checklists before moving on', 'Back, restart and linked procedures that return'],
    caps: ['guided-procedures', 'workflow-engine', 'training'], tryHref: '/studio#/p/customer-refund/run', tryLabel: 'Follow a sample procedure' },
  { t: 'Learn from outcomes', icon: ICONS.analytics,
    text: 'See where people stop, restart or flag a step, next to what changed recently.',
    points: ['Starts and completions per procedure', 'Drop-off and restarts by step', 'Feedback flags from the people doing the work'],
    caps: ['analytics'], tryHref: '/studio#/insights', tryLabel: 'Open demo insights' },
  { t: 'Improve continuously', icon: '<path d="M20 12a8 8 0 0 1-14.3 4.9M4 12a8 8 0 0 1 14.3-4.9"/><path d="M18.6 3.5v3.8h-3.8M5.4 20.5v-3.8h3.8"/>',
    text: 'Draft a fix, compare it side by side, approve it, and everyone follows the new version from then on.',
    points: ['Drafts that stay private until approved', 'Side-by-side comparison of changes', 'Version history and an audit log'],
    caps: ['teams-collaboration', 'security-governance'], tryHref: '/studio#/p/customer-refund/history', tryLabel: 'See version history' }
];

// Illustrative only: every capability named here exists as a page, and anything
// not in the demo is marked planned.
const MOMENTS = [
  { t: 'A policy changes', text: 'The refund window moves from 30 to 45 days. The procedure owner finds the refund procedure and opens it to edit.',
    caps: ['knowledge-hub', 'workflow-builder', 'si-procedure-studio'], status: 'demo', note: 'Drafting the change from the policy document with SI is planned.' },
  { t: 'Change the decision', text: 'The owner edits the decision step and its answers. The SOP map redraws itself from the same definition.',
    caps: ['workflow-builder', 'process-maps'], status: 'demo' },
  { t: 'Review and approve', text: 'The change is submitted as a draft. An approver compares it side by side and publishes it, and the audit log records who did what.',
    caps: ['teams-collaboration', 'security-governance'], status: 'demo', note: 'In the demo, roles are a switch, not sign-in.' },
  { t: 'Guide the next case', text: 'An agent searches “refund after 40 days”, lands on the decision step and follows the new version, one question at a time.',
    caps: ['knowledge-hub', 'guided-procedures', 'workflow-engine'], status: 'demo' },
  { t: 'Update other systems', text: 'The outcome updates the ticket and notifies the customer, with a person approving anything consequential.',
    caps: ['automation-integrations'], status: 'planned' },
  { t: 'Learn and refine', text: 'Insights show people restarting at the new step. The owner adds a clarifying note, and new starters practise the updated procedure.',
    caps: ['analytics', 'training'], status: 'demo', note: 'Training assignments and completion records are planned.' }
];

const SHOTS = [
  { src: 'library', t: 'Library', d: 'Every procedure with its owner, version and number of steps.', href: '/studio#/', alt: 'The Studio library: sample procedures grouped by team, each showing its version, step count and owner.' },
  { src: 'guided-run', t: 'Guided run', d: 'One question at a time, with the policy source beside it.', href: '/studio#/p/customer-refund/run', alt: 'A guided run in Studio: a decision step asking how long ago the order was delivered, with two answer options, a policy chip, Back and SOP buttons.' },
  { src: 'sop-map', t: 'SOP map', d: 'Drawn from the same definition, so it always matches.', href: '/studio#/p/customer-refund/map', alt: 'The SOP map of the refund procedure in Studio: actions, decisions with labelled branches and end steps.' },
  { src: 'search', t: 'Step search', d: 'Search lands on the exact step in the right procedure.', href: '/studio#/search?q=refund', alt: 'Studio search results for “refund”: the procedure and two individual steps that open at that step.' }
];

const OUTCOMES = [
  ['operations', 'The same task is done differently on every shift.', 'One SOP everyone follows, with clean handoffs.'],
  ['employee-enablement', 'New starters wait for someone to explain the process.', 'Guidance in the flow of work from day one.'],
  ['customer-support', 'Agents search for answers while the customer waits.', 'The right troubleshooting path, step by step.'],
  ['process-documentation', 'Documents nobody updates after they are written.', 'Procedures with owners, versions and reviews.'],
  ['knowledge-management', 'Answers spread across wikis, chats and inboxes.', 'Knowledge tied to the step it supports.'],
  ['compliance-governance', 'No record of which version people followed.', 'Approved procedures with an audit trail.'],
  ['enterprise-automation', 'The same details typed into several systems.', 'Connected actions with human checks (planned).']
];

const TODAY = [
  'The website is static and served over HTTPS by Vercel.',
  'The Studio demo keeps its data in your browser only. There is no server-side database and no customer data.',
  'Published versions, review and approval, version history and an audit log of changes work in the demo.',
  'Demo roles are a switch for trying the approval flow. They do not enforce access.',
  'No API keys or secrets are included in the site’s code.'
];
const PLANNED = [
  'Secure sign-in with session expiry, password reset and invitations, then SSO and MFA.',
  'Each organization in its own workspace, with membership and role checked on the server for every request.',
  'Database-level isolation between organizations, tested explicitly.',
  'Audit records for administrative and data-changing actions.',
  'APIs and webhooks for connected systems.'
];

export function renderPlatformOverview({ esc, statusPill, crumbsHtml, PLATFORM, SOLUTIONS }) {
  const bySlug = Object.fromEntries(PLATFORM.pages.map((p) => [p.slug, p]));
  const solBySlug = Object.fromEntries(SOLUTIONS.pages.map((s) => [s.slug, s]));
  const groupOf = Object.fromEntries(CAPS.map((c) => [c.slug, c.group]));
  const groupTitle = Object.fromEntries(GROUPS.map((g) => [g.key, g.title]));
  const icon = (slug, cls = 'px-ic') => svg(ICONS[slug], cls);
  const capChip = (slug) => `<a class="px-chip g-${groupOf[slug]}" href="/platform/${slug}">${icon(slug, 'px-chip-ic')}${esc(bySlug[slug].title)}</a>`;

  const counts = (slug) => bySlug[slug].groups.flatMap((g) => g.items).reduce((a, i) => (a[i[1]] = (a[i[1]] || 0) + 1, a), {});
  const meter = (slug) => {
    const c = counts(slug), total = Object.values(c).reduce((a, b) => a + b, 0);
    const parts = ['demo', 'dev', 'planned'].filter((k) => c[k]);
    return `<div class="px-meter"><span class="px-bar" aria-hidden="true">${parts.map((k) => `<i class="m-${k}" style="--w:${(c[k] / total * 100).toFixed(1)}%"></i>`).join('')}</span>
      <span class="px-meter-t">${parts.map((k) => `<span class="mt-${k}">${c[k]} ${k === 'demo' ? 'in the demo' : k === 'dev' ? 'in development' : 'planned'}</span>`).join('<span aria-hidden="true"> · </span>')}</span></div>`;
  };

  /* ── A. hero: five glass layers under the compass ── */
  const cx = 200, hw = 165, hh = 82, th = 12, ys = [440, 372, 304, 236, 168];
  const plates = LAYERS.map((l, i) => {
    const y = ys[i];
    return `<g class="pxh-plate" data-i="${i}" style="--c:${l.c}">
      <polygon class="pl-side" points="${cx - hw},${y} ${cx},${y + hh} ${cx},${y + hh + th} ${cx - hw},${y + th}"/>
      <polygon class="pl-side pl-side-r" points="${cx},${y + hh} ${cx + hw},${y} ${cx + hw},${y + th} ${cx},${y + hh + th}"/>
      <polygon class="pl-top" points="${cx},${y - hh} ${cx + hw},${y} ${cx},${y + hh} ${cx - hw},${y}"/>
      <g class="pl-glyph" transform="matrix(${hw / 200} ${hh / 200} ${-hw / 200} ${hh / 200} ${cx} ${y})">${l.glyph}</g>
      <circle class="pl-core" cx="${cx}" cy="${y}" r="5"/>
      <path class="pl-lead" d="M${cx + hw + 6} ${y}h30"/>
    </g>`;
  }).join('');
  const hero = `<section class="px-hero" aria-labelledby="px-title">
  <div class="px-hero-bg" aria-hidden="true"></div>
  <div class="wrap px-hero-in">
    <div class="px-hero-copy">
      ${crumbsHtml}
      <p class="px-pill">The ASK COMPASS platform</p>
      <h1 id="px-title">Everything your teams need to <span class="px-grad">understand, execute and improve</span> work.</h1>
      <p class="px-lead">One connected platform for knowledge, procedures and guided work. Each procedure is stored once, as an approved definition, and that same definition guides people step by step, draws the SOP map, records every change and shows where work gets stuck.</p>
      <div class="hero-ctas">
        <a class="btn hx-btn-gold btn-sheen" href="/studio">Open Studio <span aria-hidden="true">→</span></a>
        <a class="btn hx-btn-teal" href="#capabilities">Explore capabilities</a>
      </div>
    </div>
    <figure class="pxh" id="pxStack">
      <div class="pxh-art">
        <svg class="pxh-svg" viewBox="0 0 560 540" aria-hidden="true">
          <defs><linearGradient id="pxBeam" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#2563EB" stop-opacity=".1"/><stop offset=".6" stop-color="#0B87B6" stop-opacity=".7"/><stop offset="1" stop-color="#EFB64A"/></linearGradient></defs>
          <path class="pxh-beam" d="M${cx} ${ys[0]}V70"/>
          ${plates}
          <circle class="pxh-pulse" cx="${cx}" cy="${ys[0]}" r="4.5"/>
        </svg>
        <img class="pxh-emblem" src="/assets/brand/logo-256.webp" width="256" height="256" alt="">
        <ol class="pxh-labels">${LAYERS.map((l, i) => `<li data-i="${i}" style="--y:${(ys[i] / 540 * 100).toFixed(2)}%;--c:${l.c}"><span class="lb-n">${String(i + 1).padStart(2, '0')}</span><b>${l.name}</b><small>${l.sub}</small></li>`).reverse().join('')}</ol>
      </div>
      <figcaption class="sr-only">Five layers stacked under the ASK COMPASS emblem: knowledge, structure, guidance, insight and governance, joined by one line of direction.</figcaption>
    </figure>
  </div>
</section>`;

  /* ── B. operating model ── */
  const model = `<section class="px-sec px-model" id="model" aria-labelledby="pm-title">
  <div class="wrap">
    <header class="px-head">
      <p class="px-pill">The operating model</p>
      <h2 id="pm-title">From what people know to <span class="px-grad">how work gets better.</span></h2>
      <p class="px-sub">Five stages in one loop. Each stage feeds the next, and what you learn goes back into the knowledge you started with.</p>
    </header>
    <div class="pm" id="pmModel">
      <svg class="pm-loop" viewBox="0 0 100 20" preserveAspectRatio="none" aria-hidden="true"><path d="M90 19C90 2 10 2 10 19"/></svg>
      <span class="pm-loop-t" aria-hidden="true">What you learn feeds the next version</span>
      <span class="pm-track" aria-hidden="true"><i></i></span>
      ${STAGES.map((s, i) => `<div class="pm-stage${i === 0 ? ' is-on' : ''}" style="--k:${i}">
        <h3 class="pm-h"><button type="button" class="pm-btn" id="pmb-${i}" aria-expanded="${i === 0}" aria-controls="pmp-${i}"><span class="pm-node">${svg(s.icon)}</span><span class="pm-n">0${i + 1}</span><span class="pm-t">${s.t}</span></button></h3>
        <div class="pm-panel" id="pmp-${i}" role="region" aria-labelledby="pmb-${i}">
          <div class="pm-copy"><p class="pm-lead">${esc(s.text)}</p><ul class="pm-points">${s.points.map((p) => `<li>${esc(p)}</li>`).join('')}</ul></div>
          <div class="pm-side"><p class="pm-k">Capabilities</p><div class="px-chips">${s.caps.map(capChip).join('')}</div>
          <a class="text-link pm-try" href="${s.tryHref}">${esc(s.tryLabel)} →</a></div>
        </div>
      </div>`).join('')}
    </div>
  </div>
</section>`;

  /* ── C. capability explorer ── */
  const featuredVis = `<div class="pxq" aria-hidden="true">
      <span class="pxq-badge">Decision</span>
      <p class="pxq-q">How long ago was the order delivered?</p>
      <span class="pxq-chip">Refund policy §1</span>
      <span class="pxq-sel">Select one option</span>
      <span class="pxq-opt is-pick">Within 30 days</span><span class="pxq-opt">More than 30 days</span>
      <span class="pxq-foot"><i>← Back</i><i class="pxq-sop">SOP</i></span>
    </div>`;
  const card = (c) => {
    const p = bySlug[c.slug];
    return `<li class="pxc g-${c.group}${c.featured ? ' is-featured' : ''}${c.wide ? ' is-wide' : ''}" data-group="${c.group}">
      ${c.featured ? '<span class="pxc-flag">Featured</span>' : ''}
      <div class="pxc-top"><span class="pxc-ic">${icon(c.slug)}</span><span class="pxc-g">${esc(groupTitle[c.group])}</span></div>
      <h3 class="pxc-t"><a href="/platform/${c.slug}">${esc(p.title)}</a></h3>
      <p class="pxc-what">${esc(c.what)}</p>
      <p class="pxc-why"><b>Why it matters</b> ${esc(c.benefit)}</p>
      ${c.featured ? featuredVis : c.wide ? WIDE_VIS[c.slug] : ''}
      ${meter(c.slug)}
      <span class="pxc-go" aria-hidden="true">Explore ${esc(p.title)} →</span>
    </li>`;
  };
  const explorer = `<section class="px-sec px-caps" id="capabilities" aria-labelledby="pc-title">
  <div class="wrap">
    <header class="px-head">
      <p class="px-pill">Capabilities</p>
      <h2 id="pc-title">Eleven capabilities. <span class="px-grad">One connected platform.</span></h2>
      <p class="px-sub">Grouped by the job they do. Every capability has its own page, and every feature on it is marked with its real status.</p>
    </header>
    <div class="pxf" role="group" aria-label="Show capabilities by group">
      <button type="button" class="pxf-btn is-on" data-g="all" aria-pressed="true">All <span>${CAPS.length}</span></button>
      ${GROUPS.map((g) => `<button type="button" class="pxf-btn g-${g.key}" data-g="${g.key}" aria-pressed="false"><i aria-hidden="true"></i>${esc(g.title)} <span>${CAPS.filter((c) => c.group === g.key).length}</span></button>`).join('')}
    </div>
    <p class="pxf-line" id="pxfLine" data-g="all" aria-live="polite"><span class="g-all">All eleven capabilities, in four groups. Select a group to highlight it.</span>${GROUPS.map((g) => `<span class="g-${g.key}"><b>${esc(g.title)}</b> ${esc(g.line)}</span>`).join('')}</p>
    <ul class="pxc-grid" id="pxGrid" data-g="all">${CAPS.map(card).join('')}</ul>
    <p class="px-legend">${['demo', 'planned'].map((k) => statusPill(k)).join(' ')} <span>Bars show how many of each capability’s listed features work in the public Studio demo today and how many are planned.</span></p>
  </div>
</section>`;

  /* ── D. how the capabilities work together ── */
  const ring = CAPS.slice().sort((a, b) => GROUPS.findIndex((g) => g.key === a.group) - GROUPS.findIndex((g) => g.key === b.group));
  const pos = ring.map((c, i) => {
    const a = (i / ring.length) * Math.PI * 2 - Math.PI / 2;
    return { slug: c.slug, x: 50 + 39 * Math.cos(a), y: 50 + 39 * Math.sin(a) };
  });
  const together = `<section class="px-sec px-tog" id="together" aria-labelledby="pt-title">
  <div class="wrap">
    <header class="px-head">
      <p class="px-pill">Illustrative example</p>
      <h2 id="pt-title">One policy change, <span class="px-grad">followed through the platform.</span></h2>
      <p class="px-sub">A sample scenario with made-up details, showing how the capabilities hand work to each other. Steps marked Planned are not available yet.</p>
    </header>
    <div class="pt" id="ptRoot">
      <div class="pt-stage" aria-hidden="true">
        <svg class="pt-lines" viewBox="0 0 100 100">${pos.map((p) => `<line class="g-${groupOf[p.slug]}" data-s="${p.slug}" x1="50" y1="50" x2="${p.x.toFixed(2)}" y2="${p.y.toFixed(2)}"/>`).join('')}<circle class="pt-orbit" cx="50" cy="50" r="39"/></svg>
        <div class="pt-core"><img src="/assets/brand/logo-128.webp" width="128" height="128" alt=""><span id="ptCoreT">Step 1 of ${MOMENTS.length}</span></div>
        ${pos.map((p) => `<span class="pt-node g-${groupOf[p.slug]}" data-s="${p.slug}" style="left:${p.x.toFixed(2)}%;top:${p.y.toFixed(2)}%">${icon(p.slug, 'pt-ic')}<small>${esc(bySlug[p.slug].title)}</small></span>`).join('')}
      </div>
      <div class="pt-story">
        <div class="pt-ctl"><button type="button" class="pt-play" id="ptPlay" aria-pressed="false"><span class="pt-play-i" aria-hidden="true"></span><span class="pt-play-t">Play the story</span></button><span class="pt-note">Illustrative · sample data</span></div>
        <ol class="pt-list">${MOMENTS.map((m, i) => `<li class="pt-m${i === 0 ? ' is-on' : ''}" data-caps="${m.caps.join(' ')}">
          <h3 class="pt-h"><button type="button" class="pt-btn" id="ptb-${i}" aria-expanded="${i === 0}" aria-controls="ptp-${i}"><span class="pt-n">${i + 1}</span><span>${esc(m.t)}</span>${statusPill(m.status)}</button></h3>
          <div class="pt-panel" id="ptp-${i}" role="region" aria-labelledby="ptb-${i}">
            <p>${esc(m.text)}</p>${m.note ? `<p class="pt-plan">${esc(m.note)}</p>` : ''}
            <div class="px-chips">${m.caps.map(capChip).join('')}</div>
            <span class="pt-timer" aria-hidden="true"><i></i></span>
          </div>
        </li>`).join('')}</ol>
      </div>
    </div>
  </div>
</section>`;

  /* ── E. the real Studio ── */
  const studio = `<section class="px-sec px-studio" id="studio-preview" aria-labelledby="ps-title">
  <div class="wrap">
    <header class="px-head">
      <p class="px-pill">The Studio</p>
      <h2 id="ps-title">See it in the <span class="px-grad">real Studio demo.</span></h2>
      <p class="px-sub">These are screenshots of the public Studio. It runs in your browser with five sample procedures and needs no account. Select a screen to open it.</p>
    </header>
    <ul class="ps-deck">${SHOTS.map((s, i) => `<li class="ps-card" style="--k:${i}"><a href="${s.href}">
      <span class="ps-frame"><span class="ps-bar" aria-hidden="true"><i></i><i></i><i></i><em>askcompass.in/studio</em></span><img src="/assets/img/studio/${s.src}.webp" width="1100" height="784" loading="lazy" decoding="async" alt="${esc(s.alt)}"></span>
      <span class="ps-cap"><b>${esc(s.t)}</b><span>${esc(s.d)}</span></span></a></li>`).join('')}</ul>
    <div class="ps-facts">
      <div class="ps-col"><h3>${statusPill('demo')} Works in the demo</h3><ul><li>Guided runs, one question at a time</li><li>SOP maps and step-level search</li><li>Drafts, side-by-side review and approval</li><li>Version history and an audit log</li><li>Usage insights from this browser</li></ul></div>
      <div class="ps-col"><h3>${statusPill('planned')} Not in the demo yet</h3><ul><li>Sign-in and shared workspaces</li><li>Storing procedures on a server</li><li>Drafting procedures with SI</li><li>Integrations, APIs and webhooks</li><li>Training assignments and records</li></ul></div>
      <a class="btn hx-btn-gold btn-sheen ps-open" href="/studio">Open Studio <span aria-hidden="true">→</span></a>
    </div>
  </div>
</section>`;

  /* ── F. outcomes mapped to solutions ── */
  const outcomes = `<section class="px-sec px-out" id="outcomes" aria-labelledby="po-title">
  <div class="wrap">
    <header class="px-head">
      <p class="px-pill">Outcomes</p>
      <h2 id="po-title">Pick a starting point. <span class="px-grad">Follow the bearing.</span></h2>
      <p class="px-sub">Seven common problems and the direction guided work takes them. Each links to a solution page with a worked example. These are the intended effects, not measured results.</p>
    </header>
    <ol class="po-list">${OUTCOMES.map(([slug, from, to], i) => `<li style="--deg:${Math.round(i * 360 / OUTCOMES.length)}deg"><a href="/solutions/${slug}">
      <span class="po-dial" aria-hidden="true"><i></i></span>
      <span class="po-from"><small>Today</small>${esc(from)}</span>
      <span class="po-arrow" aria-hidden="true"></span>
      <span class="po-to"><small>With guided work</small>${esc(to)}</span>
      <span class="po-sol">${esc(solBySlug[slug].title)} <span aria-hidden="true">→</span></span></a></li>`).join('')}</ol>
  </div>
</section>`;

  /* ── G. architecture and trust ── */
  const outputs = [['Guided run', 'guided-procedures'], ['SOP map', 'process-maps'], ['Versions & audit', 'security-governance'], ['Insights', 'analytics']];
  const trust = `<section class="px-sec px-trust" id="trust" aria-labelledby="pr-title">
  <div class="wrap">
    <header class="px-head">
      <p class="px-pill">Architecture and trust</p>
      <h2 id="pr-title">What runs today, <span class="px-grad">and what comes next.</span></h2>
      <p class="px-sub">We keep what exists apart from what is planned. We do not hold security certifications today and will not claim any until they are earned.</p>
    </header>
    <div class="pr-core">
      <div class="pr-def"><span class="pr-def-ic" aria-hidden="true"><img src="/assets/brand/logo-128.webp" width="128" height="128" alt=""></span><div><h3>One structured definition per procedure</h3><p>Steps, decisions, exceptions, owner and version are stored once. Everything below is generated from it, so nothing drifts.</p></div></div>
      <ul class="pr-outs">${outputs.map(([t, slug]) => `<li>${icon(slug, 'pr-ic')}${t}</li>`).join('')}</ul>
    </div>
    <div class="pr-lanes">
      <div class="pr-lane pr-today"><h3><span class="status status-demo">Live</span> Today</h3><ul>${TODAY.map((t) => `<li>${esc(t)}</li>`).join('')}</ul></div>
      <div class="pr-lane pr-next"><h3>${statusPill('planned')} Planned for customer workspaces</h3><ul>${PLANNED.map((t) => `<li>${esc(t)}</li>`).join('')}</ul></div>
    </div>
    <p class="pr-links"><a class="text-link" href="/platform/security-governance">Security &amp; Governance capability →</a><a class="text-link" href="/security">How security works today →</a></p>
  </div>
</section>`;

  /* ── H. final call to action ── */
  const close = `<section class="px-close" aria-labelledby="pz-title">
  <div class="wrap px-close-in">
    <img class="px-close-mark" src="/assets/brand/logo-128.webp" width="128" height="128" alt="">
    <div class="px-close-copy"><h2 id="pz-title">See how your work could <span class="px-grad">become clearer.</span></h2>
    <p>Follow a sample procedure in the Studio, or tell us about a process your team finds hard to follow.</p></div>
    <div class="hero-ctas"><a class="btn hx-btn-gold btn-sheen" href="/studio">Open Studio <span aria-hidden="true">→</span></a><a class="btn hx-btn-teal" href="/contact">Talk to us</a></div>
  </div>
</section>`;

  return [hero, model, explorer, together, studio, outcomes, trust, close].join('\n\n');
}
