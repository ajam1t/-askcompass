/* Guides and FAQ. Guide bodies are trusted HTML written here. */

export const GUIDES = [
  {
    slug: 'design-a-decision-tree', category: 'Workflow design', minutes: 6,
    title: 'How to design a decision tree people can follow',
    description: 'A practical method for turning a procedure’s conditions into clear questions, labelled answers and branches that never dead-end.',
    lead: 'Most procedures already contain decisions. They are just hidden inside sentences like “if the item is non-standard, unless…”. Here is how to pull them out into a tree people can actually follow.',
    related: ['workflow-builder', 'process-maps', 'guided-procedures'],
    body: `
<h2>1. Find the real decisions</h2>
<p>Read the procedure and underline every word that changes what happens next: <em>if</em>, <em>unless</em>, <em>only when</em>, <em>except</em>, <em>depending on</em>. Each one is a candidate decision. Many documents hide three or four decisions in a single paragraph.</p>
<h2>2. Ask one thing per question</h2>
<p>A good decision asks a single question the person can answer from what is in front of them. “Is the item over ₹1,00,000 or outside the standard catalog?” is acceptable because both conditions lead to the same branch. “Is the item expensive and does your manager agree?” is two decisions and should be split.</p>
<h2>3. Label every answer</h2>
<p>Answers should read as statements, not just Yes or No, whenever the question is not obvious: “More than 30 days since delivery” is clearer than “No”. People scanning a breadcrumb of the path they took should understand it without re-reading the question.</p>
<h2>4. Give every branch an ending</h2>
<p>Follow each answer to its end. Every path must finish at a clear outcome: completed, escalated, paused, or handed off to another procedure. A branch that simply stops is the most common reason people abandon a procedure halfway.</p>
<h2>5. Put exceptions where they happen</h2>
<p>Exceptions belong at the step they affect, not in a section at the end. “If your manager is away for more than two business days, route the approval to their delegate” should appear on the approval step itself.</p>
<h2>6. Check it before anyone uses it</h2>
<ul>
  <li>Can every step be reached from the first step?</li>
  <li>Does every decision have at least two labelled answers?</li>
  <li>Does every path end somewhere sensible?</li>
  <li>Would a new starter understand each question without help?</li>
</ul>
<p>The Ask Compass builder runs the first three checks automatically and blocks submission until they pass. The fourth still needs a person.</p>`
  },
  {
    slug: 'write-sops-people-follow', category: 'SOP documentation', minutes: 5,
    title: 'Writing SOPs people will actually follow',
    description: 'Short, testable guidance for writing standard operating procedures that stay clear, current and easy to use at the moment of work.',
    lead: 'Most SOPs are written to be approved, not to be used. A few habits make the difference between a document that sits in a folder and a procedure people follow.',
    related: ['guided-procedures', 'teams-collaboration', 'knowledge-hub'],
    body: `
<h2>Write for the moment of work</h2>
<p>Picture the person using the procedure: mid-task, slightly unsure, with a customer or a deadline waiting. They need the next action, not background. Put context in a short note step; keep action steps to one instruction each.</p>
<h2>Start each step with a verb</h2>
<p>“Check the delivery date”, “Send the request to your manager”, “Record the ticket number”. A step that starts with a verb is easy to scan and easy to check off.</p>
<h2>Say what “done” looks like</h2>
<p>If a step has to produce something, say so in a short checklist: “Approval received”, “Ticket updated”. It removes guesswork and gives people a clear moment to move on.</p>
<h2>Name an owner and a source</h2>
<p>Every procedure needs one named owner, and each rule should point to where it comes from, such as a policy section. People trust guidance more when they can see its origin, and owners know what to update when a policy changes.</p>
<h2>Change it through review, not in place</h2>
<p>Edit a draft, have someone compare it with the live version, then publish. Keep old versions. When a question arises later about what the procedure said last month, you will have the answer.</p>
<h2>Watch where people stop</h2>
<p>The steps where people abandon or restart a procedure, or flag it as unclear, are the steps to rewrite first. Usage data is more reliable than opinions about which part is confusing.</p>`
  },
  {
    slug: 'document-to-guided-procedure', category: 'Process improvement', minutes: 7,
    title: 'Turning a long document into a guided procedure',
    description: 'A step-by-step method for converting an existing SOP or policy document into structured, guided steps without losing what matters.',
    lead: 'You do not need to start from scratch. An existing document already contains most of a guided procedure; the work is in separating actions, decisions, exceptions and background.',
    related: ['workflow-builder', 'si-procedure-studio', 'process-maps'],
    body: `
<h2>1. Mark up the document</h2>
<p>Go through the document once with four colours: <strong>actions</strong> (something a person does), <strong>decisions</strong> (something that changes the path), <strong>exceptions</strong> (unusual cases) and <strong>background</strong> (why, context, definitions). Most long documents are more than half background.</p>
<h2>2. List the actions in order</h2>
<p>Write the actions as a numbered list of short, verb-first steps. Do not worry about branches yet. If two actions always happen together, combine them.</p>
<h2>3. Insert the decisions</h2>
<p>Place each decision just before the first action that depends on it. Give each answer a label and connect it to the action it leads to. Add an ending for each branch.</p>
<h2>4. Attach exceptions and sources</h2>
<p>Move each exception onto the step it affects. Add a source reference, such as the section of the original document, so people can check the detail if they need it.</p>
<h2>5. Keep only the background that helps</h2>
<p>Turn the useful parts of the background into short notes at the point they matter. Leave the rest in the source document, linked from the procedure.</p>
<h2>6. Test with someone new</h2>
<p>Ask someone unfamiliar with the process to follow the draft on a real or sample case. Every place they hesitate is a step to rewrite. Then send it for review and approval.</p>
<p class="note">SI-assisted conversion is on the Ask Compass roadmap. When it arrives, it will produce a draft with source citations for a person to review; it will not publish anything on its own.</p>`
  },
  {
    slug: 'measure-where-procedures-fail', category: 'Analytics', minutes: 5,
    title: 'Measuring where procedures fail',
    description: 'Which signals show that a procedure is unclear or broken, and how to use them to decide what to fix first.',
    lead: 'Procedures rarely fail loudly. People quietly work around them. A handful of signals reveal where that is happening.',
    related: ['analytics', 'teams-collaboration', 'guided-procedures'],
    body: `
<h2>Starts versus completions</h2>
<p>If many people start a procedure and few finish, something in the middle is not working. Compare procedures with each other; a sudden fall after a change usually points to the change.</p>
<h2>Where people stop</h2>
<p>Drop-off by step is the single most useful signal. A step where people repeatedly stop is often missing information, asks a question people cannot answer, or leads to a dead end.</p>
<h2>Restarts</h2>
<p>A restart often means someone took the wrong branch. Look at the decision just before the restart: is the question ambiguous, or are the answer labels unclear?</p>
<h2>Flags and feedback</h2>
<p>A simple “flag this step” option gives people a way to report problems at the moment they notice them. Read flags weekly and reply by fixing the step.</p>
<h2>Deciding what to fix first</h2>
<ol>
  <li>Steps with the most drop-offs in high-volume procedures.</li>
  <li>Decisions followed by frequent restarts.</li>
  <li>Steps with repeated flags.</li>
  <li>Procedures whose owner or source has not been reviewed recently.</li>
</ol>
<p>In the Ask Compass demo, these counts are recorded in your browser as you use the sample procedures, so you can see the signals appear.</p>`
  }
];

export const FAQ = [
  { group: 'Product', items: [
    ['What is Ask Compass?', 'Ask Compass turns procedures and organizational knowledge into guided, step-by-step work. People see the steps that apply to their situation, the decisions that matter and the source behind each instruction.'],
    ['Is Ask Compass only for one industry?', 'No. It is designed for any work with procedures, decisions and exceptions, such as onboarding, IT requests, approvals, customer support and operations.'],
    ['How is it different from a document library?', 'A document library stores procedures. Ask Compass helps people follow them: it asks the questions that decide the path, shows only the steps that apply, and keeps the map, the steps and the history in one definition.']
  ] },
  { group: 'Studio demo', items: [
    ['What is the Studio demo?', 'Studio is a public, no-login demonstration of the product. You can follow sample procedures, edit drafts, approve changes and see usage insights.'],
    ['Where is my demo data stored?', 'Only in your own browser, using local storage. Nothing you do in the demo is sent to a server, and other visitors cannot see it. Clearing your browser data resets it.'],
    ['Are the roles in the demo real permissions?', 'No. The Viewer, Editor, Approver and Admin switch is there so you can try each role. It is not sign-in and does not enforce access control.']
  ] },
  { group: 'Accounts and workspaces', items: [
    ['Can my company get its own workspace?', 'Customer workspaces at your-company.askcompass.in are planned. They are not open yet. Use the contact page to register interest.'],
    ['Is there a sign-in?', 'Not yet. The workspace sign-in page explains the current status. We will not ask for passwords until real, secure sign-in is in place.']
  ] },
  { group: 'Current limitations', items: [
    ['Is SI available today?', 'No. SI drafting and question answering are planned. Nothing on this site uses SI yet, and we will mark SI features clearly when they launch.'],
    ['Are there integrations?', 'Not yet. Integrations are planned and will only be listed as available once they are built and tested.'],
    ['Can I share procedures with my team?', 'Not in the demo, because data stays in your browser. Shared procedures arrive with customer workspaces.']
  ] },
  { group: 'Privacy and security', items: [
    ['Do you collect personal data on this website?', 'The site does not use analytics or advertising cookies. The contact form opens your own email app; nothing is sent until you send the email. See the privacy page for details.'],
    ['How will customer data be protected?', 'Customer workspaces are being designed with sign-in, server-side permission checks and per-organization data isolation. The security page explains what exists today and what is planned.']
  ] },
  { group: 'Contact and onboarding', items: [
    ['How do I request a walkthrough?', 'Use the contact page to send a demo request. We will walk through one of your own processes as a guided procedure.'],
    ['Can I partner with Ask Compass?', 'Yes. Choose “Partnership” on the contact form and tell us what you have in mind.']
  ] }
];
