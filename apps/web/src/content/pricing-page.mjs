/* The /pricing page: one plan at $1 per user per month. Customer workspaces
   are not open yet, so the page says plainly that nobody is billed today, and
   capability statuses come from platform.mjs. */
import { ICONS, CAPS, GROUPS } from './platform-page.mjs';

export const PRICE = { amount: 1, currency: 'USD', symbol: '$' };

export const PRICING_FAQ = [
  ['What does $1 per user per month include?', 'Every ASK COMPASS capability, for every person in your workspace: guided procedures, the workflow builder, SOP maps, the knowledge hub, approvals, version history, analytics and the rest of the platform as it ships.'],
  ['Can we try it before paying?', 'Yes. The Studio demo is free and needs no account. It runs in your browser with sample procedures, so you can follow, edit and approve procedures today.'],
  ['When can we start?', 'Customer workspaces are being built now and are not open yet, so nobody is billed today. Request a workspace and we will get in touch when yours can be set up.'],
  ['Do planned features cost extra?', 'No. There is one plan. Features marked “Planned” become part of it as they are released.'],
  ['Which currency do you charge in?', 'Prices are in US dollars.']
];

export function renderPricing({ esc, statusPill, pageHero, cta, PLATFORM }) {
  const groupOf = Object.fromEntries(CAPS.map((c) => [c.slug, c.group]));
  const order = GROUPS.flatMap((g) => CAPS.filter((c) => c.group === g.key).map((c) => c.slug));
  const bySlug = Object.fromEntries(PLATFORM.pages.map((p) => [p.slug, p]));
  // Most features in the demo → "In the demo"; some → "Partly in the demo"; none → "Planned".
  const capPill = (slug) => {
    const items = bySlug[slug].groups.flatMap((g) => g.items), demo = items.filter((i) => i[1] === 'demo').length;
    if (demo * 2 >= items.length) return statusPill('demo');
    return demo ? '<span class="status status-dev">Partly in the demo</span>' : statusPill('planned');
  };
  const svg = (slug) => `<svg class="px-chip-ic" viewBox="0 0 24 24" aria-hidden="true">${ICONS[slug]}</svg>`;
  const request = '/contact?topic=Workspace%20for%20my%20company';

  const priceCard = `<aside class="pr-card" aria-label="The ASK COMPASS plan">
      <p class="pr-plan">One plan for every team</p>
      <p class="pr-price"><span class="pr-cur">$</span><span class="pr-amt">1</span><span class="pr-per">per user<br>per month</span></p>
      <p class="pr-cur-note">Prices in US dollars</p>
      <ul class="pr-inc">
        <li>Every platform capability, as it ships</li>
        <li>Guided procedures, SOP maps, approvals and insights</li>
        <li>Your own workspace at <span class="mono">your-company.askcompass.in</span></li>
      </ul>
      <a class="btn hx-btn-gold btn-sheen pr-go" href="${request}">Request a workspace <span aria-hidden="true">→</span></a>
      <p class="pr-soon"><i aria-hidden="true"></i>Customer workspaces are opening soon. Nobody is billed today.</p>
    </aside>`;

  const hero = pageHero({
    eyebrow: 'Pricing', crumbs: [{ label: 'Pricing' }],
    h1Html: 'One plan. <span class="px-grad">$1 per user, per month.</span>',
    lead: 'Every ASK COMPASS capability for every person on your team. No tiers to compare and nothing held back for a higher plan.',
    heroActions: `<div class="hero-ctas"><a class="btn hx-btn-gold btn-sheen" href="${request}">Request a workspace <span aria-hidden="true">→</span></a><a class="btn hx-btn-teal" href="/studio">Try the free demo</a></div>`,
    heroAside: priceCard
  });

  const calc = `<section class="section section-tight pc-sec" aria-labelledby="pc-title"><div class="wrap pc">
    <div class="pc-copy">
      <p class="eyebrow">Estimate</p>
      <h2 id="pc-title">What would it cost your team?</h2>
      <p class="section-lead">Move the slider or type the number of people who would use ASK COMPASS.</p>
    </div>
    <div class="pc-card" id="pcCalc">
      <label class="pc-label" for="pcUsers">People on your team</label>
      <div class="pc-row">
        <input class="pc-range" id="pcRange" type="range" min="1" max="1000" step="1" value="50" aria-label="People on your team (slider)">
        <input class="pc-num" id="pcUsers" type="number" min="1" max="100000" step="1" value="50" inputmode="numeric">
      </div>
      <div class="pc-out" aria-live="polite">
        <p><span>Per month</span><b id="pcMonth">$50</b></p>
        <p><span>Per year</span><b id="pcYear">$600</b></p>
      </div>
      <p class="pc-note">An estimate at $1 per user per month. Final terms are confirmed when your workspace is set up.</p>
    </div>
  </div></section>`;

  const included = `<section class="section section-alt" aria-labelledby="pi-title"><div class="wrap">
    <div class="section-head"><p class="eyebrow">Everything included</p><h2 id="pi-title">All eleven capabilities, in one price.</h2>
    <p class="section-lead">Each capability is marked with its status today. “In the demo” works now in the public Studio demo, “Partly in the demo” has some of its features there, and everything “Planned” joins the same plan when it is released.</p></div>
    <ul class="pi-grid">${order.map((slug) => `<li><a class="pi-cap g-${groupOf[slug]}" href="/platform/${slug}"><span class="pi-ic">${svg(slug)}</span><b>${esc(bySlug[slug].title)}</b>${capPill(slug)}</a></li>`).join('')}</ul>
  </div></section>`;

  const free = `<section class="section section-tight" aria-labelledby="pf-title"><div class="wrap pf">
    <div class="pf-card">
      <span class="pf-badge">Free</span>
      <h2 id="pf-title">Explore first, with the Studio demo.</h2>
      <p>Follow, edit and approve sample procedures in your browser. No account, no card, and nothing is sent to a server.</p>
      <a class="btn hx-btn-teal" href="/studio">Open Studio</a>
    </div>
    <div class="pq">
      <h2>Questions about pricing</h2>
      ${PRICING_FAQ.map(([q, a]) => `<details><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join('')}
    </div>
  </div></section>`;

  return hero + calc + included + free + cta({ title: 'Ready when your workspace is.', text: 'Tell us about your team and the procedures you want to guide. We will be in touch when your workspace can open.', primary: { label: 'Request a workspace', href: request }, secondary: { label: 'Talk to us', href: '/contact' } });
}
