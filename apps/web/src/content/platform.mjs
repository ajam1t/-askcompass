/* Platform overview and capability pages.
   Status values: 'demo' (works in the public Studio demo), 'dev', 'planned'.
   Only mark something 'demo' if it can be tried in studio.html today. */

const page = (o) => o;

export const PLATFORM = {
  overview: {
    // The overview page itself is rendered by platform-page.mjs.
    title: 'Ask Compass Platform | Guided Workflows, Procedures & Process Intelligence', fullTitle: true,
    description: 'The Ask Compass platform: guided procedures, a workflow builder, SOP maps, knowledge search, analytics and governance, built on one approved definition of every procedure.'
  },

  pages: [
    page({
      slug: 'workflow-engine', title: 'Workflow Engine', module: 'Module 1 · Guided work',
      navDesc: 'Run repeatable, versioned workflows',
      description: 'The Ask Compass workflow engine runs procedures as versioned definitions with decisions, exceptions, linked sub-procedures and execution records.',
      lead: 'The engine is what turns a procedure definition into work. It keeps track of where someone is, which answer they gave, what is still required and which version they are following.',
      exampleTitle: 'One definition, many runs', exampleText: 'An access request runs the same way for everyone. The engine picks the branch from the answers given, hands off to a linked identity check, and returns to the main procedure when it is done.',
      example: [
        { type: 'action', label: 'Open the access request' },
        { type: 'link', label: 'Verify the requester’s identity', note: 'Linked procedure, then return' },
        { type: 'decision', label: 'Does the system hold sensitive data?', alt: 'No → grant access' },
        { type: 'approval', label: 'Data owner approves' },
        { type: 'end', label: 'Access granted, ticket updated' }
      ],
      howTitle: 'The lifecycle of a workflow',
      how: [['Define', 'Steps, decisions and exceptions are stored as one structured definition.'], ['Publish', 'An approved version goes live. Earlier versions stay in history.'], ['Run', 'Each run follows the published version and records the path taken.'], ['Improve', 'Drop-offs, restarts and flags show which steps need work.']],
      groups: [
        { title: 'Execution', items: [['Conditional branches from answers', 'demo'], ['Exceptions and alternate paths', 'demo'], ['Reusable linked procedures (sub-flows)', 'demo'], ['Back, restart and jump to an earlier step', 'demo'], ['Resume a run later', 'planned'], ['Parallel branches', 'planned']] },
        { title: 'Versions and records', items: [['Runs follow the published version', 'demo'], ['Version-aware publishing', 'demo'], ['Execution records stored on a server', 'planned'], ['Workflow templates', 'planned'], ['Test runs with sample inputs', 'planned']] }
      ],
      related: ['workflow-builder', 'guided-procedures', 'process-maps'], solutions: ['operations'],
      demoHref: '/studio#/p/system-access/run'
    }),
    page({
      slug: 'workflow-builder', title: 'Workflow Builder', module: 'Module 2 · Workflow builder',
      navDesc: 'Design steps, decisions and branches',
      description: 'Design procedures as steps, decisions, approvals and linked sub-procedures, with live checks for dead ends and unreachable steps.',
      lead: 'Process owners build procedures without code. The builder checks the logic as you go, so nothing reaches the people doing the work with a dead end or a missing answer.',
      exampleTitle: 'Checks that catch broken logic', exampleText: 'Before a draft can be submitted, the builder flags decisions without enough answers, answers without labels, steps with no next step and steps nobody can reach.',
      example: [
        { type: 'form', label: 'Add a decision: “Within 30 days?”' },
        { type: 'exception', label: 'Check: “No” answer has no next step', note: 'Submit is blocked until fixed' },
        { type: 'action', label: 'Connect “No” to “Escalate to a team lead”' },
        { type: 'end', label: 'No problems found: ready for review' }
      ],
      howTitle: 'Building a procedure',
      how: [['Start a draft', 'Edit a copy while everyone keeps following the approved version.'], ['Add steps and decisions', 'Choose a type for each step and connect where it leads.'], ['Fix what the checks find', 'Dead ends, unlabelled answers and unreachable steps are listed live.'], ['Submit for review', 'An approver compares the draft with the live version.']],
      groups: [
        { title: 'Editing', items: [['Step, decision, note, linked-procedure and end steps', 'demo'], ['Checklists and exceptions per step', 'demo'], ['Live preview of the process map', 'demo'], ['Drag-and-drop visual canvas', 'planned'], ['Form, approval and integration nodes', 'planned'], ['Properties panel on the canvas', 'planned']] },
        { title: 'Quality', items: [['Validation of dead ends and unreachable steps', 'demo'], ['Reusable sub-procedures', 'demo'], ['Templates for common workflows', 'planned'], ['Test mode with sample inputs', 'planned'], ['Publish and version controls', 'demo']] }
      ],
      related: ['workflow-engine', 'process-maps', 'teams-collaboration'], solutions: ['process-documentation'],
      demoHref: '/studio#/p/customer-refund/edit', demoLabel: 'Edit a sample procedure'
    }),
    page({
      slug: 'guided-procedures', title: 'Guided Procedures', module: 'Module 1 · Guided work',
      navDesc: 'Step-by-step execution with checklists',
      description: 'Follow procedures one step at a time with checklists, decision questions, exceptions, linked procedures and the source behind each step.',
      lead: 'People see one step at a time: what to do, what to confirm before moving on, what to do if something is unusual, and where the instruction comes from.',
      exampleTitle: 'A first-week onboarding plan', exampleText: 'A hiring manager answers two questions. The procedure skips what does not apply and hands off to the equipment request when the starter is remote.',
      example: [
        { type: 'action', label: 'Confirm start date and role', note: 'Checklist: start date confirmed' },
        { type: 'decision', label: 'Is the signed contract on file?', alt: 'No → pause and contact HR' },
        { type: 'decision', label: 'Remote or on site?', alt: 'On site → reserve a desk' },
        { type: 'link', label: 'Order and ship equipment', note: 'Linked procedure' },
        { type: 'end', label: 'Ready for day one' }
      ],
      howTitle: 'What people see at each step',
      how: [['The instruction', 'Plain language, written by the process owner.'], ['What to confirm', 'A short checklist that must be ticked before continuing.'], ['What if it is unusual', 'Exceptions and escalation routes shown at the step they affect.'], ['Where it comes from', 'The source section and version of the approved procedure.']],
      groups: [
        { title: 'Guidance', items: [['Step-by-step execution', 'demo'], ['Conditional questions with labelled answers', 'demo'], ['Checklists before continuing', 'demo'], ['Exceptions and escalation paths', 'demo'], ['Source reference on each step', 'demo'], ['Embedded documents and attachments', 'planned']] },
        { title: 'Navigation', items: [['Breadcrumb of the path taken', 'demo'], ['Back, restart and jump back', 'demo'], ['Open a procedure at a step from search', 'demo'], ['Linked procedures that return', 'demo'], ['Resume where you left off', 'planned'], ['Completion records per person', 'planned']] }
      ],
      related: ['workflow-engine', 'knowledge-hub', 'training'], solutions: ['employee-enablement', 'customer-support'],
      demoHref: '/studio#/p/onboarding-week-one/run'
    }),
    page({
      slug: 'process-maps', title: 'Process Maps', module: 'Module 2 · Workflow builder',
      navDesc: 'Maps and decision trees from one definition',
      description: 'Process maps and decision trees generated from the same definition that drives guided execution, so the picture and the steps never disagree.',
      lead: 'The map is drawn from the same definition people follow. There is no second copy to keep in sync, so the picture of the process and the process itself always match.',
      exampleTitle: 'From map to step', exampleText: 'Select any step on the map to start following the procedure from that point. Decisions show every branch, and linked procedures are marked as hand-offs.',
      example: [
        { type: 'action', label: 'Find the order' },
        { type: 'decision', label: 'Delivered within 30 days?', alt: 'No → team lead decision' },
        { type: 'decision', label: 'Unused and in original packaging?', alt: 'No → offer repair or exchange' },
        { type: 'end', label: 'Issue the refund and close the case' }
      ],
      groups: [
        { title: 'Maps', items: [['Maps generated from the workflow definition', 'demo'], ['Decision branches and alternate paths', 'demo'], ['Select a step to follow from there', 'demo'], ['Side-by-side map of draft and live versions', 'demo'], ['Zoom and pan on large maps', 'planned'], ['Highlight the current run’s path on the map', 'planned']] },
        { title: 'Sharing', items: [['Text view of every step for screen readers', 'demo'], ['Export as image or PDF', 'planned'], ['Share a read-only map link', 'planned']] }
      ],
      related: ['workflow-builder', 'guided-procedures', 'analytics'], solutions: ['process-documentation'],
      demoHref: '/studio#/p/customer-refund/map', demoLabel: 'Open a sample process map'
    }),
    page({
      slug: 'si-procedure-studio', title: 'SI Procedure Studio', module: 'Module 3 · SI Procedure Studio',
      navDesc: 'Draft procedures from documents, with review',
      description: 'Planned: SI assistance to draft procedures from documents and notes, find missing steps and answer questions with citations, always with human review before publishing.',
      lead: 'SI will help process owners get from a long document to a structured draft faster. It will not publish anything on its own: every generated procedure goes through the same review and approval as one written by hand.',
      exampleTitle: 'How SI assistance is designed to work', exampleText: 'This is the intended flow, not a live feature. SI suggests; a person reviews, edits and approves.',
      example: [
        { type: 'source', label: 'Upload an existing SOP' },
        { type: 'auto', label: 'SI drafts steps and decisions', note: 'Each step cites the source passage' },
        { type: 'exception', label: 'SI flags gaps and contradictions' },
        { type: 'approval', label: 'A process owner reviews and edits' },
        { type: 'end', label: 'Approved version published' }
      ],
      groups: [
        { title: 'Drafting', items: [['Procedure drafts from a prompt', 'planned'], ['Convert documents, notes and transcripts', 'planned'], ['Decision-tree generation', 'planned'], ['SI-assisted rewriting of a step', 'planned']] },
        { title: 'Quality and answers', items: [['Missing-step and edge-case suggestions', 'planned'], ['Contradiction and stale-content detection', 'planned'], ['Test cases for each branch', 'planned'], ['Answers grounded in approved sources, with citations', 'planned'], ['Human review before publishing', 'demo']] }
      ],
      ctaTitle: 'SI drafting is not live yet. Review and approval already are.',
      related: ['knowledge-hub', 'workflow-builder', 'teams-collaboration'], solutions: ['process-documentation', 'knowledge-management'],
      demoHref: '/studio#/approvals', demoLabel: 'See the review workflow'
    }),
    page({
      slug: 'knowledge-hub', title: 'Knowledge Hub', module: 'Module 4 · Knowledge hub',
      navDesc: 'Search procedures, policies and sources',
      description: 'Search procedures and the steps inside them, with folders, ownership and source references attached to each step.',
      lead: 'Knowledge is most useful at the moment of work. The hub keeps procedures, policies and their sources together, and search lands people on the exact step they need.',
      exampleTitle: 'Search that opens the right step', exampleText: 'Searching for “delegate” finds the step that explains what to do when a manager is away, and opens the procedure right there.',
      example: [
        { type: 'action', label: 'Search: “delegate”' },
        { type: 'source', label: 'Match: “Get manager approval”', note: 'Request new equipment · exception text' },
        { type: 'end', label: 'Opened at that step, with its source' }
      ],
      groups: [
        { title: 'Finding knowledge', items: [['Search across procedures and individual steps', 'demo'], ['Folders by team or area', 'demo'], ['Filters and tags', 'planned'], ['Full-text search of uploaded documents', 'planned'], ['Related content suggestions', 'planned']] },
        { title: 'Keeping it trustworthy', items: [['Owner and version on every procedure', 'demo'], ['Source reference per step', 'demo'], ['Review dates and expiry reminders', 'planned'], ['Duplicate and stale-content detection', 'planned'], ['Approved sources ranked first', 'planned']] }
      ],
      related: ['guided-procedures', 'si-procedure-studio', 'security-governance'], solutions: ['knowledge-management'],
      demoHref: '/studio#/search?q=delegate', demoLabel: 'Try step-level search'
    }),
    page({
      slug: 'automation-integrations', title: 'Automation & Integrations', module: 'Module 7 · Automation',
      navDesc: 'Triggers, webhooks and connected systems',
      description: 'Planned: event triggers, webhooks and connected-system actions inside procedures, with retries, logs and human approval for consequential actions.',
      lead: 'Some steps are better done by software: looking up a record, creating a ticket, sending a notice. Automation will let a procedure take those actions, while a person stays in control of anything consequential.',
      exampleTitle: 'Where automation fits', exampleText: 'This is the intended design. No integrations are live yet, and none will be listed as available until they are built and tested.',
      example: [
        { type: 'auto', label: 'Trigger: new starter added in HR system' },
        { type: 'action', label: 'Hiring manager confirms equipment needs' },
        { type: 'approval', label: 'Manager approves the order' },
        { type: 'auto', label: 'Create the order in the IT system', note: 'Retried on failure; logged' },
        { type: 'end', label: 'Starter and manager notified' }
      ],
      groups: [
        { title: 'Triggers and actions', items: [['In-app notifications when a procedure changes', 'demo'], ['Event-triggered workflows', 'planned'], ['APIs and webhooks', 'planned'], ['Email and collaboration integrations', 'planned'], ['Create and update records in connected systems', 'planned'], ['Data lookups and calculations', 'planned']] },
        { title: 'Reliability and control', items: [['Human approval for consequential actions', 'planned'], ['Retry handling', 'planned'], ['Execution logs', 'planned'], ['Integration health and failure alerts', 'planned']] }
      ],
      ctaTitle: 'Tell us which systems your procedures depend on.',
      related: ['workflow-engine', 'security-governance', 'analytics'], solutions: ['enterprise-automation']
    }),
    page({
      slug: 'analytics', title: 'Analytics', module: 'Module 6 · Analytics',
      navDesc: 'Find where people stop or restart',
      description: 'See how procedures are used: starts, completions, restarts, where people stop, and which steps people flag as unclear.',
      lead: 'A procedure that people abandon halfway is telling you something. Analytics show where people stop, restart or flag a step, so owners know what to fix first.',
      exampleTitle: 'Reading the signals', exampleText: 'In the demo, usage is counted in your own browser. Follow a procedure, leave halfway, and the drop-off appears against that step.',
      example: [
        { type: 'action', label: 'People follow “Handle a refund request”' },
        { type: 'exception', label: 'Most stops happen at “Outside the standard window”' },
        { type: 'source', label: 'Flags say the escalation rule is unclear' },
        { type: 'end', label: 'Owner rewrites the step and publishes v2' }
      ],
      groups: [
        { title: 'Usage', items: [['Starts and completions per procedure', 'demo'], ['Drop-off by step', 'demo'], ['Restart counts', 'demo'], ['Feedback flags on steps', 'demo'], ['Execution duration', 'planned'], ['Decision-branch analysis', 'planned']] },
        { title: 'Improvement', items: [['Recent changes alongside usage', 'demo'], ['Searches with poor results', 'planned'], ['Content freshness', 'planned'], ['Before and after comparisons', 'planned'], ['Exportable reports', 'planned']] }
      ],
      related: ['process-maps', 'teams-collaboration', 'knowledge-hub'], solutions: ['operations'],
      demoHref: '/studio#/insights', demoLabel: 'Open demo insights'
    }),
    page({
      slug: 'training', title: 'Training', module: 'Module 8 · Training',
      navDesc: 'Onboarding paths and knowledge checks',
      description: 'Planned: onboarding journeys, role-based learning paths, assignments, knowledge checks and policy acknowledgements built on the same procedures people use at work.',
      lead: 'The best training material is the procedure itself. Training will let teams assign procedures as learning, check understanding and record acknowledgements, without a separate course to maintain.',
      exampleTitle: 'A new starter’s first fortnight', exampleText: 'This is the intended design. Today, new starters can already follow any procedure step by step in the demo.',
      example: [
        { type: 'action', label: 'Assigned: “Handle a refund request”' },
        { type: 'action', label: 'Practise on a sample case' },
        { type: 'form', label: 'Knowledge check: three questions' },
        { type: 'approval', label: 'Acknowledge the refund policy' },
        { type: 'end', label: 'Completion recorded' }
      ],
      groups: [
        { title: 'Learning', items: [['Practise any procedure step by step', 'demo'], ['Onboarding journeys', 'planned'], ['Role-based learning paths', 'planned'], ['Assignments with due dates', 'planned'], ['Guided practice on sample cases', 'planned']] },
        { title: 'Evidence', items: [['Quizzes and knowledge checks', 'planned'], ['Policy acknowledgements', 'planned'], ['Completion records', 'planned'], ['Training reports', 'planned']] }
      ],
      related: ['guided-procedures', 'analytics', 'teams-collaboration'], solutions: ['employee-enablement']
    }),
    page({
      slug: 'teams-collaboration', title: 'Teams & Collaboration', module: 'Module 5 · Teams and collaboration',
      navDesc: 'Drafts, reviews, approvals and versions',
      description: 'Change procedures safely: drafts, side-by-side review, approval or rejection with comments, version history, restore as a new draft, and an audit log.',
      lead: 'Procedures change. Collaboration in Ask Compass makes every change visible, reviewed and reversible, so people can trust the version they follow.',
      exampleTitle: 'A change, from draft to published', exampleText: 'In the demo, switch to the Editor role, change a procedure and submit it. Then switch to Approver to compare and approve.',
      example: [
        { type: 'action', label: 'Editor drafts a change' },
        { type: 'exception', label: 'Checks flag a missing answer' },
        { type: 'approval', label: 'Approver compares old and new', alt: 'Reject → back to the editor with a comment' },
        { type: 'end', label: 'v2 published; users notified' }
      ],
      extraSection: 'studio',
      groups: [
        { title: 'Workflow', items: [['Draft, submitted, rejected and published states', 'demo'], ['Side-by-side comparison of changes', 'demo'], ['Approve or reject with a comment', 'demo'], ['Version history and restore as a new draft', 'demo'], ['Comments and suggested changes on steps', 'planned'], ['Multi-person approvals', 'planned'], ['Archived state', 'planned']] },
        { title: 'People', items: [['Viewer, Editor, Approver and Admin roles (demo switch, not sign-in)', 'demo'], ['Workspaces and departments', 'planned'], ['User invitations', 'planned'], ['Enforced permissions per workspace', 'planned'], ['Reminders and email notifications', 'planned']] }
      ],
      related: ['security-governance', 'workflow-builder', 'analytics'], solutions: ['compliance-governance'],
      demoHref: '/studio#/approvals', demoLabel: 'Try the approval workflow'
    }),
    page({
      slug: 'security-governance', title: 'Security & Governance', module: 'Module 9 · Enterprise governance',
      navDesc: 'Access, audit history and controls',
      description: 'How Ask Compass approaches access control, tenant isolation, audit history and approved content, and what is available today versus planned.',
      lead: 'Governance in Ask Compass means people only follow approved guidance, every change has a history, and each organization’s data stays its own. Here is exactly where that stands today.',
      exampleTitle: 'Where things stand', exampleText: 'The public demo has no accounts and stores data only in your browser. Customer workspaces with enforced sign-in and per-organization isolation are planned and not yet live.',
      example: [
        { type: 'source', label: 'Only approved versions are followed' },
        { type: 'approval', label: 'Every change is reviewed before publishing' },
        { type: 'action', label: 'Every edit, approval and restore is logged' },
        { type: 'end', label: 'Workspace isolation enforced on the server', note: 'Planned' }
      ],
      extraSection: 'trust',
      groups: [
        { title: 'Content governance', items: [['Approved-content control: people follow published versions', 'demo'], ['Approval history', 'demo'], ['Version retention', 'demo'], ['Audit log of changes', 'demo'], ['Data retention and deletion policies', 'planned']] },
        { title: 'Access and isolation', items: [['Sign-in and session management', 'planned'], ['Role-based access enforced on the server', 'planned'], ['Per-organization tenant isolation', 'planned'], ['SSO and MFA', 'planned'], ['Workspace administration', 'planned'], ['Secrets kept server-side', 'planned']] }
      ],
      ctaTitle: 'Questions about security? Ask us directly.',
      related: ['teams-collaboration', 'knowledge-hub', 'automation-integrations'], solutions: ['compliance-governance'],
      demoHref: '/security', demoLabel: 'Read the security page'
    })
  ]
};
