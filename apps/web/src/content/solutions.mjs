/* Solutions overview and solution pages. Scenarios are illustrative examples,
   not customer stories; outcomes are qualitative and never invented metrics. */

export const SOLUTIONS = {
  overview: {
    title: 'Solutions', eyebrow: 'Solutions',
    h1: 'For any work where the right next step is not obvious.',
    lead: 'Ask Compass is not built for one industry. It is built for a kind of work: procedures with decisions, exceptions and hand-offs, where getting it right depends on knowing what applies to this case.',
    description: 'Where Ask Compass helps: operations, employee enablement, customer support, process documentation, knowledge management, compliance and enterprise automation.',
    render: ({ esc, section, SOLUTIONS, relatedLinks, linkToSolution }) => `
<section class="section section-tight"><div class="wrap split">
  <div class="split-l"><p class="eyebrow">The problem</p><h2>Documentation exists. Clarity often does not.</h2></div>
  <div class="split-r prose-lg">
    <p>Most organizations already write their procedures down. The difficulty starts when someone has to use one: the right document is hard to find, the steps that apply are mixed with the ones that do not, and exceptions only appear halfway through.</p>
    <p>The result is familiar in every industry. People ask a colleague, follow an outdated copy, or skip a step they did not know applied to them.</p>
  </div>
</div></section>
<section class="section section-alt"><div class="wrap">
  <div class="section-head"><p class="eyebrow">Where it helps</p><h2>Seven kinds of work, one approach.</h2>
  <p class="section-lead">Each page walks through a realistic scenario and an example workflow. Scenarios are illustrations, not customer case studies.</p></div>
  ${relatedLinks(SOLUTIONS.pages.map((p) => linkToSolution(p.slug)))}
</div></section>
${section('sides')}
<section class="section section-tight"><div class="wrap split">
  <div class="split-l"><p class="eyebrow">Today and next</p><h2>What you can use now.</h2></div>
  <div class="split-r prose-lg">
    <p>The public Studio demo already shows guided procedures, decisions, linked procedures, process maps, drafts, approvals, version history and usage insights, using sample data stored in your browser.</p>
    <p>Customer workspaces with sign-in, shared data, integrations and SI drafting are on the roadmap. Each platform page marks every feature as in the demo or planned.</p>
  </div>
</div></section>`
  },

  pages: [
    {
      slug: 'operations', title: 'Business Operations', navDesc: 'Consistent SOPs and clean handoffs',
      description: 'Run standard operating procedures the same way every time, with clear hand-offs, visible exceptions and a view of where work gets stuck.',
      lead: 'Operations run on repeatable procedures. Ask Compass makes them consistent across people, shifts and sites, and shows where they break down.',
      problemTitle: 'The same process, done five different ways.',
      problem: ['Experienced people carry the real procedure in their heads. Everyone else follows a document that is partly out of date, and hand-offs between teams depend on who happens to be on shift.', 'When something goes wrong, nobody can tell whether the procedure was unclear, skipped or simply wrong.'],
      scenarioTitle: 'An end-of-shift handover', scenario: 'A shift lead hands over open work. Critical items get a direct briefing; everything else is logged for the next owner.',
      workflow: [
        { type: 'action', label: 'Review open items for the shift' },
        { type: 'decision', label: 'Anything critical in progress?', alt: 'No → log the handover' },
        { type: 'action', label: 'Brief the next owner directly' },
        { type: 'exception', label: 'Next owner not available', note: 'Escalate to the duty manager' },
        { type: 'end', label: 'Handover logged with owner and time' }
      ],
      before: ['Handover notes vary by person', 'Critical items rely on memory', 'No record of who took ownership', 'Problems found only after the fact'],
      after: ['Every handover follows the same steps', 'Critical items get an explicit briefing step', 'Ownership is confirmed before closing', 'Drop-offs and flags show which steps need work'],
      outcomes: ['More consistent execution across people and shifts', 'Clearer ownership at every hand-off', 'Faster identification of steps that cause friction'],
      features: ['workflow-engine', 'guided-procedures', 'analytics', 'process-maps']
    },
    {
      slug: 'employee-enablement', title: 'Employee Enablement', navDesc: 'Onboarding and role-based guidance',
      description: 'Help new and existing employees do unfamiliar work correctly, with step-by-step guidance, role-specific paths and the source behind each instruction.',
      lead: 'New starters should not need to memorize a handbook before they can be useful. Guided procedures let people do the work correctly the first time, and learn while they do it.',
      problemTitle: 'Onboarding that depends on who you sit next to.',
      problem: ['New employees spend their first weeks searching for documents and interrupting colleagues. Long manuals are read once and forgotten.', 'Managers have no easy way to know which procedures someone has actually practised.'],
      scenarioTitle: 'Preparing a new starter’s first week', scenario: 'A hiring manager follows one procedure. It adapts to whether the starter is remote, and hands off to the equipment request when needed.',
      workflow: [
        { type: 'action', label: 'Confirm start date and role' },
        { type: 'decision', label: 'Signed contract on file?', alt: 'No → pause and contact HR' },
        { type: 'decision', label: 'Remote or on site?', alt: 'On site → reserve a desk' },
        { type: 'link', label: 'Order and ship equipment' },
        { type: 'end', label: 'First-week plan sent' }
      ],
      before: ['A long onboarding document', 'Steps that do not apply to this role', 'Questions sent to busy colleagues', 'No record of what was practised'],
      after: ['A procedure that adapts to the answers given', 'Only the steps that apply are shown', 'Exceptions explained at the step they affect', 'Planned: assignments, checks and completion records'],
      outcomes: ['New people productive sooner, with fewer interruptions', 'The same standard of work from day one', 'Managers can see what has been followed'],
      features: ['guided-procedures', 'training', 'knowledge-hub', 'workflow-engine'],
      demoHref: '/studio#/p/onboarding-week-one/run'
    },
    {
      slug: 'customer-support', title: 'Customer Support', navDesc: 'Troubleshooting and escalation paths',
      description: 'Give support teams decision trees for troubleshooting and policy questions, with clear escalation paths and the same answer for every customer.',
      lead: 'Two agents should give a customer the same answer. Decision trees with clear escalation paths make that the default, even for unusual cases.',
      problemTitle: 'The answer depends on which agent you reach.',
      problem: ['Support policies have conditions, time limits and exceptions. Agents interpret them differently, and edge cases are escalated inconsistently.', 'When a policy changes, it takes weeks for every agent to apply the new version.'],
      scenarioTitle: 'A refund request after 30 days', scenario: 'An agent checks the delivery date and the item’s condition. Requests outside the window go to a team lead with the customer’s reason attached.',
      workflow: [
        { type: 'action', label: 'Find the order' },
        { type: 'decision', label: 'Delivered within 30 days?', alt: 'No → collect the reason, escalate to a team lead' },
        { type: 'decision', label: 'Unused and in original packaging?', alt: 'No → explain the policy, offer repair' },
        { type: 'action', label: 'Issue the refund and send confirmation' },
        { type: 'end', label: 'Case noted and closed' }
      ],
      before: ['Policies interpreted case by case', 'Escalations without context', 'Policy changes reach agents slowly', 'Hard to see which questions cause trouble'],
      after: ['The same decision path for every agent', 'Escalations carry the reason and the path taken', 'A new version reaches everyone once approved', 'Flags and drop-offs show unclear steps'],
      outcomes: ['More consistent answers for customers', 'Cleaner escalations for team leads', 'Policy changes applied as soon as they are approved'],
      features: ['guided-procedures', 'process-maps', 'teams-collaboration', 'analytics'],
      demoHref: '/studio#/p/customer-refund/run'
    },
    {
      slug: 'process-documentation', title: 'Process Documentation', navDesc: 'Capture and maintain procedures',
      description: 'Capture procedures as structured, visual workflows that stay current, with version control and a review step for every change.',
      lead: 'Documentation is only valuable if it stays true. Structured procedures with owners, versions and review keep the documented process and the real process together.',
      problemTitle: 'Documents drift away from the real process.',
      problem: ['Procedures are written once, in long documents, and updated rarely. Diagrams are drawn separately and soon disagree with the text.', 'Nobody is sure which copy is current, or who is responsible for it.'],
      scenarioTitle: 'Updating a procedure after a policy change', scenario: 'A process owner changes one rule. The map updates with the steps, an approver compares the versions, and the new version replaces the old for everyone.',
      workflow: [
        { type: 'action', label: 'Start a draft of the procedure' },
        { type: 'form', label: 'Change the approval threshold' },
        { type: 'exception', label: 'Checks flag a broken branch', note: 'Fixed before submitting' },
        { type: 'approval', label: 'Approver compares draft and live' },
        { type: 'end', label: 'v2 published; history kept' }
      ],
      before: ['Text and diagrams maintained separately', 'Several copies, unclear which is current', 'Changes made without review', 'No history of what changed and why'],
      after: ['One definition drives steps and map', 'One published version, with an owner', 'Every change reviewed before it goes live', 'Version history with restore as a new draft'],
      outcomes: ['Documentation that matches how work is done', 'Clear ownership of each procedure', 'Safer changes, with a full history'],
      features: ['workflow-builder', 'process-maps', 'teams-collaboration', 'si-procedure-studio'],
      demoHref: '/studio#/p/customer-refund/edit'
    },
    {
      slug: 'knowledge-management', title: 'Knowledge Management', navDesc: 'Knowledge tied to the work it supports',
      description: 'Connect organizational knowledge to the steps that use it, with search that finds the exact step, source references and clear ownership.',
      lead: 'Knowledge bases answer “where is the document?”. Ask Compass answers “what do I do now, and where does that come from?”.',
      problemTitle: 'Knowledge that is stored but not used.',
      problem: ['Policies, guides and procedures pile up in different places. Search returns long documents, and the relevant paragraph is somewhere inside.', 'People cannot tell whether what they found is approved or current.'],
      scenarioTitle: 'Finding what to do when a manager is away', scenario: 'An employee searches for “delegate”. Search lands on the exception inside the equipment procedure, with its source and version.',
      workflow: [
        { type: 'action', label: 'Search “delegate”' },
        { type: 'source', label: 'Step match inside “Request new equipment”' },
        { type: 'exception', label: 'Exception: route approval to the delegate' },
        { type: 'end', label: 'Continue the procedure from that step' }
      ],
      before: ['Search returns whole documents', 'Approval status is unclear', 'Knowledge separate from the work', 'No sign of which content is stale'],
      after: ['Search lands on the exact step', 'Owner and version shown with the guidance', 'Knowledge attached to the step that needs it', 'Planned: review dates and stale-content alerts'],
      outcomes: ['Less time searching', 'More confidence in the answer found', 'Knowledge that stays connected to real work'],
      features: ['knowledge-hub', 'guided-procedures', 'si-procedure-studio', 'security-governance'],
      demoHref: '/studio#/search?q=delegate'
    },
    {
      slug: 'compliance-governance', title: 'Compliance & Governance', navDesc: 'Approved, reviewable procedures',
      description: 'Keep procedures approved, reviewed and auditable: controlled changes, approval history and a record of every edit.',
      lead: 'Governance starts with knowing that people follow the approved procedure. Ask Compass makes approval, change control and history part of how procedures work.',
      compareTitle: 'How control improves',
      problemTitle: 'Proving that the right procedure was followed.',
      problem: ['When procedures live in documents, it is hard to show which version was in force, who approved it and what changed.', 'Reviews happen in email threads that are difficult to reconstruct later.'],
      scenarioTitle: 'A controlled change to an approval rule', scenario: 'An editor proposes a change. An approver rejects the first draft with a comment, accepts the revision, and the log records each step.',
      workflow: [
        { type: 'action', label: 'Editor submits a change' },
        { type: 'approval', label: 'Approver reviews the comparison', alt: 'Reject → comment returned to the editor' },
        { type: 'action', label: 'Editor revises and resubmits' },
        { type: 'approval', label: 'Approver publishes v3' },
        { type: 'end', label: 'Audit log shows every step' }
      ],
      before: ['Changes made directly to documents', 'Approval by email', 'Unclear which version was in force', 'History reconstructed by hand'],
      after: ['Changes go through drafts and review', 'Approve or reject with a recorded comment', 'One published version at a time', 'An audit log of edits, approvals and restores'],
      outcomes: ['Stronger control over procedure changes', 'A clear record for internal review', 'Fewer surprises when policies change'],
      features: ['teams-collaboration', 'security-governance', 'knowledge-hub', 'analytics'],
      ctaTitle: 'Talk to us about your review and approval process.',
      demoHref: '/studio#/audit'
    },
    {
      slug: 'enterprise-automation', title: 'Enterprise Automation', navDesc: 'Orchestrate systems with human checks',
      description: 'Planned: procedures that trigger and orchestrate actions across business systems, with human approval for consequential steps and full execution logs.',
      lead: 'Automation works best when it follows a procedure people already trust. Ask Compass is designed to add system actions to guided work, with people approving anything that matters.',
      problemTitle: 'Automation without the procedure behind it.',
      problem: ['Automations are often built separately from the procedures they implement, so the two drift apart and nobody can see the whole process.', 'When an automated step fails, the people involved do not know what to do next.'],
      scenarioTitle: 'Provisioning access for a new starter', scenario: 'An intended design: the HR system triggers the procedure, a manager approves, and the IT system is updated, with every action logged.',
      workflow: [
        { type: 'auto', label: 'Trigger: starter added in HR system', note: 'Planned' },
        { type: 'decision', label: 'Sensitive systems requested?', alt: 'No → standard access' },
        { type: 'approval', label: 'Data owner approves' },
        { type: 'auto', label: 'Create accounts in connected systems', note: 'Planned; retried and logged' },
        { type: 'end', label: 'Starter notified' }
      ],
      before: ['Automations separate from procedures', 'Failures handled ad hoc', 'No single view of the process', 'Consequential actions without review'],
      after: ['System actions are steps in the procedure', 'Failures route to a person with guidance', 'One map of people and system steps', 'Human approval before consequential actions'],
      outcomes: ['Automation people can understand and trust', 'Clear recovery when a system step fails', 'A complete record of what ran and why'],
      features: ['automation-integrations', 'workflow-engine', 'security-governance', 'teams-collaboration'],
      ctaTitle: 'Tell us which systems your procedures depend on.'
    }
  ]
};
