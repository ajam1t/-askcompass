/* Resources, company, legal, workspace and utility pages. */

export function PAGES({ esc, section, flow, statusPill, relatedLinks, linkToPlatform, linkToSolution, pageHero, GUIDES, FAQ, SITE, cta }) {
  const guideCard = (g) => `<li data-cat="${esc(g.category)}"><a href="/resources/guides/${g.slug}"><span class="g-cat">${esc(g.category)} · ${g.minutes} min</span><b>${esc(g.title)}</b><span>${esc(g.description)}</span></a></li>`;
  const categories = [...new Set(GUIDES.map((g) => g.category))];
  const prose = (html) => `<section class="section section-tight"><div class="wrap"><div class="prose legal">${html}</div></div></section>`;
  const updated = 'Last updated 19 October 2026';
  const reviewNote = '<p class="note">This page is a plain-language description of how the site works today. It has not yet been reviewed by a lawyer and is not legal advice. It will be revised when customer workspaces launch.</p>';
  const founderCard = section('founder');

  return [
    {
      path: '/resources', section: 'resources', title: 'Resources', eyebrow: 'Resources',
      h1: 'Learn to design work people can follow.',
      lead: 'Practical guides on procedures, decision trees and process improvement, plus sample workflows you can open in the Studio demo.',
      description: 'Guides, workflow examples and answers to common questions about designing procedures, decision trees and guided work.',
      crumbs: [{ label: 'Resources', href: '/resources' }],
      body: pageHero({ eyebrow: 'Resources', h1: 'Learn to design work people can follow.', lead: 'Practical guides on procedures, decision trees and process improvement, plus sample workflows you can open in the Studio demo.', crumbs: [{ label: 'Resources' }] }) + `
<section class="section section-tight"><div class="wrap">
  <div class="section-head"><p class="eyebrow">Featured guides</p><h2>Start here.</h2></div>
  <div class="filter" role="group" aria-label="Filter guides by category"><button type="button" aria-pressed="true" data-filter="all">All</button>${categories.map((c) => `<button type="button" aria-pressed="false" data-filter="${esc(c)}">${esc(c)}</button>`).join('')}</div>
  <ul class="guide-cards" id="guideCards">${GUIDES.map(guideCard).join('')}</ul>
  <a class="text-link" href="/resources/guides">All guides and insights →</a>
</div></section>
<section class="section section-alt"><div class="wrap">
  <div class="section-head"><p class="eyebrow">Workflow examples</p><h2>Open a sample procedure.</h2><p class="section-lead">These sample procedures run in the Studio demo with synthetic data. Each one shows a different pattern.</p></div>
  ${relatedLinks([
    { href: '/studio#/p/equipment-request/run', label: 'Request new equipment', desc: 'A decision with an approval branch and an exception' },
    { href: '/studio#/p/system-access/run', label: 'Grant access to a business system', desc: 'A linked identity check that returns to the main flow' },
    { href: '/studio#/p/customer-refund/run', label: 'Handle a refund request', desc: 'Two decisions and an escalation path' },
    { href: '/studio#/p/onboarding-week-one/run', label: 'Prepare a new starter’s first week', desc: 'Branches that hand off to another procedure' },
    { href: '/studio#/p/verify-identity/run', label: 'Verify someone’s identity', desc: 'A short, reusable sub-procedure' }
  ])}
</div></section>
<section class="section"><div class="wrap split">
  <div class="split-l"><p class="eyebrow">Questions</p><h2>Looking for a quick answer?</h2></div>
  <div class="split-r prose-lg"><p>The FAQ covers what works today, what is planned, how the demo stores data and how to get in touch.</p><p><a class="btn btn-ghost" href="/faq">Read the FAQ</a></p></div>
</div></section>`
    },
    {
      path: '/resources/guides', section: 'resources', title: 'Guides & Insights',
      description: 'Practical guides to workflow design, SOP writing, decision trees, document conversion and measuring where procedures fail.',
      crumbs: [{ label: 'Resources', href: '/resources' }, { label: 'Guides', href: '/resources/guides' }],
      body: pageHero({ eyebrow: 'Guides & Insights', h1: 'Guides & Insights', lead: 'Short, practical guides for anyone who writes, owns or improves procedures.', crumbs: [{ label: 'Resources', href: '/resources' }, { label: 'Guides' }] }) + `
<section class="section section-tight"><div class="wrap">
  <ul class="guide-cards guide-cards-list">${GUIDES.map(guideCard).join('')}</ul>
  <p class="muted-note">Topics coming next: AI-assisted procedure creation, knowledge management at the moment of work, and designing approval workflows.</p>
</div></section>`
    },
    {
      path: '/faq', section: 'resources', title: 'FAQ',
      description: 'Answers about Ask Compass: what it does, the Studio demo, workspaces, current limitations, privacy and how to get in touch.',
      crumbs: [{ label: 'Resources', href: '/resources' }, { label: 'FAQ', href: '/faq' }],
      jsonLd: { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: FAQ.flatMap((g) => g.items).map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) },
      body: pageHero({ eyebrow: 'FAQ', h1: 'Frequently asked questions', lead: 'What works today, what is planned, and how to get in touch.', crumbs: [{ label: 'Resources', href: '/resources' }, { label: 'FAQ' }] }) + `
<section class="section section-tight"><div class="wrap faq">${FAQ.map((g) => `<div class="faq-group"><h2>${esc(g.group)}</h2>${g.items.map(([q, a]) => `<details><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join('')}</div>`).join('')}</div></section>` +
        cta({ title: 'Still have a question?', text: 'Send it to us directly.', primary: { label: 'Contact us', href: '/contact' }, secondary: { label: 'Open Studio', href: '/studio' } })
    },
    {
      path: '/about', section: 'about', title: 'About',
      description: 'Why Ask Compass exists, the product philosophy behind it, and who is building it.',
      crumbs: [{ label: 'About', href: '/about' }],
      body: pageHero({ eyebrow: 'About', h1: 'We help people find their way through complex work.', lead: 'Ask Compass exists because knowing where a procedure is written down is not the same as knowing what to do next.', crumbs: [{ label: 'About' }] }) + `
<section class="section section-tight"><div class="wrap split">
  <div class="split-l"><p class="eyebrow">Mission</p><h2>Complex work. Clear direction.</h2></div>
  <div class="split-r prose-lg">
    <p>Organizations write down how work should be done, then ask people to find, read and interpret it in the middle of their day. Ask Compass turns that knowledge into guidance people can follow: the questions that decide the path, the steps that apply, and the source behind each one.</p>
    <p>We are an early-stage company. The public Studio demo shows the product as it stands today; customer workspaces are being built.</p>
  </div>
</div></section>
<section class="section section-alt"><div class="wrap">
  <div class="section-head"><p class="eyebrow">Philosophy</p><h2>Five principles.</h2></div>
  <ol class="principles">${[['Understand', 'Help people find the right information and understand what it means for their situation.'], ['Navigate', 'Guide people through steps, decisions and branches instead of leaving them to interpret a document.'], ['Decide', 'Make the conditions behind each decision visible, so people know why a path applies.'], ['Execute', 'Turn instructions into actions, checklists and a clear next step.'], ['Improve', 'Help owners keep procedures approved, current and better over time.']].map((p, i) => `<li><span class="how-n">${String(i + 1).padStart(2, '0')}</span><h3>${p[0]}</h3><p>${p[1]}</p></li>`).join('')}</ol>
</div></section>
${founderCard}
<section class="section"><div class="wrap split">
  <div class="split-l"><p class="eyebrow">Vision</p><h2>Where we are heading.</h2></div>
  <div class="split-r prose-lg">
    <p>Our aim is one navigation system for complex work: knowledge, decisions, guided steps and automation in a single model, with governance and analytics across all of it, and a secure workspace for every organization.</p>
    <p>We will get there step by step, and we will be clear about what is available at each stage. The platform pages mark every feature as in the demo or planned.</p>
  </div>
</div></section>` + cta({ title: 'Want to shape what we build next?', text: 'Tell us about the procedures your team finds hardest to follow.', primary: { label: 'Contact us', href: '/contact' }, secondary: { label: 'Open Studio', href: '/studio' } })
    },
    {
      path: '/contact', section: 'contact', title: 'Contact',
      description: 'Request a walkthrough, discuss a partnership or ask a question about Ask Compass.',
      crumbs: [{ label: 'Contact', href: '/contact' }],
      scripts: ['<script src="/assets/js/contact.js" defer></script>'],
      body: pageHero({ eyebrow: 'Contact', h1: 'Let’s talk about your process.', lead: 'Request a walkthrough, discuss a partnership or ask a question. We usually reply within two working days.', crumbs: [{ label: 'Contact' }] }) + `
<section class="section section-tight"><div class="wrap contact">
  <form class="contact-form" id="contactForm" novalidate>
    <h2>Send an enquiry</h2>
    <p class="form-note">Sending opens your own email app with your message filled in. Nothing is sent until you press send there.</p>
    <div class="field"><label for="cName">Your name</label><input id="cName" name="name" autocomplete="name" required><p class="err" id="cName-err"></p></div>
    <div class="field"><label for="cEmail">Work email</label><input id="cEmail" name="email" type="email" autocomplete="email" required><p class="err" id="cEmail-err"></p></div>
    <div class="field"><label for="cCompany">Company <span class="opt">(optional)</span></label><input id="cCompany" name="company" autocomplete="organization"></div>
    <div class="field"><label for="cTopic">What is it about?</label>
      <select id="cTopic" name="topic" required>
        <option value="">Choose one</option>
        <option>Product walkthrough</option>
        <option>Partnership</option>
        <option>Workspace for my company</option>
        <option>Question about the product</option>
        <option>Something else</option>
      </select><p class="err" id="cTopic-err"></p></div>
    <div class="field"><label for="cMessage">Message</label><textarea id="cMessage" name="message" rows="5" required placeholder="Which process would you like to make easier to follow?"></textarea><p class="err" id="cMessage-err"></p></div>
    <div class="hp" aria-hidden="true"><label for="cWebsite">Leave this empty</label><input id="cWebsite" name="website" tabindex="-1" autocomplete="off"></div>
    <button class="btn btn-primary" type="submit">Open in my email app</button>
    <div class="form-status" id="formStatus" role="status" aria-live="polite"></div>
  </form>
  <aside class="contact-side">
    <h2>How we reply</h2>
    <p>Send your enquiry with the form and we will reply to the email address you give us.</p>
    <p class="muted-note">For security reports, see the <a href="/security">security page</a>.</p>
  </aside>
</div></section>`
    },
    {
      path: '/privacy', section: 'legal', title: 'Privacy Policy', description: 'How the Ask Compass website and Studio demo handle information today.',
      crumbs: [{ label: 'Privacy Policy', href: '/privacy' }],
      body: pageHero({ eyebrow: 'Legal', h1: 'Privacy Policy', lead: updated, crumbs: [{ label: 'Privacy Policy' }] }) + prose(`
${reviewNote}
<h2>What this covers</h2><p>This policy covers the Ask Compass website at askcompass.in, the public Studio demo and the legacy prototype at /app.html. Customer workspaces do not exist yet; this policy will be updated before they launch.</p>
<h2>Information we collect</h2>
<ul>
<li><strong>No accounts.</strong> The site has no sign-in and does not ask for passwords.</li>
<li><strong>No analytics or advertising.</strong> We do not use analytics tools, tracking pixels or advertising cookies, and we do not set cookies.</li>
<li><strong>Messages you send us.</strong> The contact form opens your own email app. If you email, call or message us on WhatsApp, we receive what you send and use it only to reply and follow up on your enquiry.</li>
</ul>
<h2>Data stored in your browser</h2><p>The Studio demo and the legacy prototype save what you do (sample procedures, drafts, usage counts) in your browser’s local storage. It stays on your device, is never sent to us and can be removed by clearing your browser’s site data or using “Reset sample data” in Studio.</p>
<h2>Services that see your connection</h2>
<ul>
<li><strong>Vercel</strong> hosts the site and processes standard request information, such as IP address and browser type, to deliver pages and protect the service.</li>
<li><strong>Google Fonts</strong> serves the typefaces; your browser requests them from Google.</li>
<li><strong>jsDelivr</strong> serves the 3D graphics library used on the homepage; the legacy prototype also loads a spreadsheet library from SheetJS.</li>
</ul>
<h2>Your choices</h2><p>You can ask us what information we hold from your messages, or ask us to delete it, through the <a href="/contact">contact form</a>.</p>
<h2>Changes</h2><p>We will update this page when the site changes, and before any feature that collects personal data goes live.</p>`)
    },
    {
      path: '/terms', section: 'legal', title: 'Terms of Use', description: 'Terms for using the Ask Compass website and the public Studio demo.',
      crumbs: [{ label: 'Terms of Use', href: '/terms' }],
      body: pageHero({ eyebrow: 'Legal', h1: 'Terms of Use', lead: updated, crumbs: [{ label: 'Terms of Use' }] }) + prose(`
${reviewNote}
<h2>Using the website and demo</h2><p>You may use the Ask Compass website and Studio demo to learn about the product. The demo is provided as a preview, free of charge, with sample data.</p>
<h2>The demo is a prototype</h2><p>Studio runs in your browser and stores data locally. It is not intended for real or confidential business information, and its roles are a demonstration, not access control. Data can be lost if your browser storage is cleared.</p>
<h2>No warranty</h2><p>The website and demo are provided “as is”, without warranties of any kind. Sample procedures are illustrative and are not professional, legal or policy advice.</p>
<h2>Acceptable use</h2><p>Do not attempt to disrupt the service, probe it for vulnerabilities outside responsible disclosure, or use it to distribute harmful content.</p>
<h2>Content</h2><p>The Ask Compass name, design and site content belong to Ask Compass. Procedures you create in the demo stay in your browser and remain yours.</p>
<h2>Contact</h2><p>Questions about these terms: use the <a href="/contact">contact form</a>.</p>`)
    },
    {
      path: '/security', section: 'legal', title: 'Security', description: 'Security at Ask Compass today, what is planned for customer workspaces, and how to report a vulnerability.',
      crumbs: [{ label: 'Security', href: '/security' }],
      body: pageHero({ eyebrow: 'Security', h1: 'Security', lead: 'What exists today, what is planned, and how to report a problem.', crumbs: [{ label: 'Security' }] }) + prose(`
<h2>Today</h2>
<ul>
<li>The website is static and served over HTTPS by Vercel.</li>
<li>There are no user accounts, no server-side database and no customer data.</li>
<li>The Studio demo stores data only in your browser. Its roles are a demonstration and do not enforce access control.</li>
<li>No API keys or secrets are included in the site’s code.</li>
</ul>
<h2>Planned for customer workspaces</h2>
<ul>
<li>Secure sign-in with session expiry, password reset and invitations, then SSO and MFA.</li>
<li>Each organization in its own workspace, with every request and database query checked against the signed-in user’s membership and role on the server.</li>
<li>Database-level isolation policies so one organization’s data cannot be read by another, tested explicitly.</li>
<li>Audit records for administrative and data-changing actions.</li>
</ul>
<p>We do not hold security certifications today and will not claim any until they are earned.</p>
<h2>Report a vulnerability</h2><p>If you believe you have found a security issue, tell us through the <a href="/contact">contact form</a> and start your message with “Security report”. Please give us reasonable time to fix it before disclosing it publicly, and do not access or modify data that is not yours.</p>`)
    },
    {
      path: '/accessibility', section: 'legal', title: 'Accessibility', description: 'Our commitment to an accessible Ask Compass website and demo, and how to report a barrier.',
      crumbs: [{ label: 'Accessibility', href: '/accessibility' }],
      body: pageHero({ eyebrow: 'Accessibility', h1: 'Accessibility statement', lead: updated, crumbs: [{ label: 'Accessibility' }] }) + prose(`
<h2>Our goal</h2><p>We want everyone to be able to use Ask Compass. We aim to meet the Web Content Accessibility Guidelines (WCAG) 2.2 at level AA.</p>
<h2>What we have done</h2>
<ul>
<li>Semantic page structure with landmarks, headings and a skip link.</li>
<li>Menus, tabs, demos and forms that work with a keyboard, with visible focus.</li>
<li>Reduced motion: the 3D compass and animations stay still when your system asks for less motion.</li>
<li>Process maps also exist as text: every procedure can be followed step by step without the map.</li>
<li>Form errors described in text, next to the field.</li>
</ul>
<h2>Known limitations</h2>
<ul>
<li>The 3D compass is decorative; its labels are available as buttons, but the visual itself has only a short description.</li>
<li>Large process maps in the Studio demo scroll horizontally on small screens.</li>
<li>The legacy prototype at /app.html has not been fully reviewed.</li>
</ul>
<h2>Tell us about a barrier</h2><p>If something on the site is hard to use, tell us through the <a href="/contact">contact form</a>. Tell us the page and what happened, and we will work on a fix.</p>`)
    },
    {
      path: '/workspace', section: 'workspace', title: 'Workspace sign-in', noindex: true,
      description: 'Find your Ask Compass customer workspace. Workspaces are not open yet; try the Studio demo or request one.',
      scripts: ['<script src="/assets/js/workspace.js" defer></script>'],
      body: `<section class="ws"><div class="wrap ws-in">
  <div class="ws-card">
    <p class="eyebrow">app.askcompass.in</p>
    <h1>Find your workspace</h1>
    <p class="page-lead">Each organization will have its own workspace at <span class="mono">your-company.askcompass.in</span>.</p>
    <form id="wsForm" class="ws-form" novalidate>
      <label for="wsSlug">Workspace name</label>
      <div class="ws-input"><input id="wsSlug" name="slug" autocomplete="organization" placeholder="your-company" spellcheck="false" inputmode="url"><span>.askcompass.in</span></div>
      <p class="err" id="wsSlug-err"></p>
      <button class="btn btn-primary" type="submit">Continue</button>
      <div class="form-status" id="wsStatus" role="status" aria-live="polite"></div>
    </form>
    <div class="ws-note"><b>Customer workspaces are not open yet.</b> Sign-in will be added together with server-side permission checks and per-organization data isolation. Until then there are no accounts, and this page will never ask for a password.</div>
    <div class="hero-ctas"><a class="btn btn-ghost" href="/studio">Try the Studio demo</a><a class="btn btn-ghost" href="/contact?topic=Workspace%20for%20my%20company">Request a workspace</a></div>
  </div>
</div></section>`
    },
    {
      path: '/workspace/unavailable', section: 'workspace', title: 'Workspace not available', noindex: true,
      description: 'There is no active Ask Compass workspace at this address. Find your workspace or go to askcompass.in.',
      scripts: ['<script src="/assets/js/workspace.js" defer></script>'],
      body: `<section class="ws"><div class="wrap ws-in">
  <div class="ws-card">
    <p class="eyebrow" id="wsHost">Workspace</p>
    <h1>This workspace isn’t available</h1>
    <p class="page-lead">There is no active Ask Compass workspace at this address. It may not have been set up yet, or the name may be misspelled.</p>
    <div class="hero-ctas"><a class="btn btn-primary" href="${SITE.origin}/workspace">Find your workspace</a><a class="btn btn-ghost" href="${SITE.origin}/">Go to askcompass.in</a></div>
  </div>
</div></section>`
    },
    {
      path: '/404', file: '404.html', section: 'none', title: 'Page not found', noindex: true,
      description: 'The page you were looking for could not be found. Continue to the platform, the Studio demo or contact us.',
      body: `<section class="ws"><div class="wrap ws-in"><div class="ws-card">
  <p class="eyebrow">404</p><h1>This page is off the map.</h1>
  <p class="page-lead">The link may be old or mistyped. These are good places to continue:</p>
  ${relatedLinks([{ href: '/', label: 'Home', desc: 'Complex work. Clear direction.' }, { href: '/platform', label: 'Platform', desc: 'What Ask Compass does' }, { href: '/studio', label: 'Studio demo', desc: 'Try it with sample procedures' }, { href: '/contact', label: 'Contact', desc: 'Ask us directly' }])}
</div></div></section>`
    }
  ];
}
