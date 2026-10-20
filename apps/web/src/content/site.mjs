/* Site-wide settings, navigation and footer. Edit copy here. */
// Contact details are kept here but are not shown anywhere on the site for now.
// The contact form still delivers enquiries to `email` through the visitor's email app.
export const SITE = {
  origin: 'https://www.askcompass.in',      // askcompass.in redirects here
  email: 'amit01071994@gmail.com',
  phone: '+91 88983 72628',
  phoneHref: 'tel:+918898372628',
  whatsapp: 'https://wa.me/918898372628',
  linkedin: 'https://www.linkedin.com/in/ajam1t'
};

/* Every capability carries one of these. Keep them honest:
   "demo" means it works in the public Studio demo (browser-only, sample data). */
export const STATUS = {
  demo: { label: 'In the demo', desc: 'works today in the public Studio demo (runs in your browser, sample data)' },
  dev: { label: 'In development', desc: 'being built now, not yet available' },
  planned: { label: 'Planned', desc: 'on the roadmap, not available yet' }
};

export const NAV = {
  platform: {
    mega: true,
    overview: { label: 'Platform overview', href: '/platform' },
    items: [
      { label: 'Workflow Engine', href: '/platform/workflow-engine', desc: 'Run repeatable, versioned workflows' },
      { label: 'Workflow Builder', href: '/platform/workflow-builder', desc: 'Design steps, decisions and branches' },
      { label: 'Guided Procedures', href: '/platform/guided-procedures', desc: 'Step-by-step execution with checklists' },
      { label: 'Process Maps', href: '/platform/process-maps', desc: 'Maps and decision trees from one definition' },
      { label: 'SI Procedure Studio', href: '/platform/si-procedure-studio', desc: 'Draft procedures from documents, with review' },
      { label: 'Knowledge Hub', href: '/platform/knowledge-hub', desc: 'Search procedures, policies and sources' },
      { label: 'Automation & Integrations', href: '/platform/automation-integrations', desc: 'Triggers, webhooks and connected systems' },
      { label: 'Analytics', href: '/platform/analytics', desc: 'Find where people stop or restart' },
      { label: 'Training', href: '/platform/training', desc: 'Onboarding paths and knowledge checks' },
      { label: 'Teams & Collaboration', href: '/platform/teams-collaboration', desc: 'Drafts, reviews, approvals and versions' },
      { label: 'Security & Governance', href: '/platform/security-governance', desc: 'Access, audit history and controls' }
    ]
  },
  solutions: {
    mega: true,
    overview: { label: 'All solutions', href: '/solutions' },
    items: [
      { label: 'Business Operations', href: '/solutions/operations', desc: 'Consistent SOPs and clean handoffs' },
      { label: 'Employee Enablement', href: '/solutions/employee-enablement', desc: 'Onboarding and role-based guidance' },
      { label: 'Customer Support', href: '/solutions/customer-support', desc: 'Troubleshooting and escalation paths' },
      { label: 'Process Documentation', href: '/solutions/process-documentation', desc: 'Capture and maintain procedures' },
      { label: 'Knowledge Management', href: '/solutions/knowledge-management', desc: 'Knowledge tied to the work it supports' },
      { label: 'Compliance & Governance', href: '/solutions/compliance-governance', desc: 'Approved, reviewable procedures' },
      { label: 'Enterprise Automation', href: '/solutions/enterprise-automation', desc: 'Orchestrate systems with human checks' }
    ]
  },
  resources: {
    overview: { label: 'Resources library', href: '/resources' },
    items: [
      { label: 'Guides & Insights', href: '/resources/guides', desc: 'Practical guides to procedures and workflows' },
      { label: 'FAQ', href: '/faq', desc: 'What works today, and what is coming' }
    ]
  }
};

export const FOOTER = [
  { title: 'Platform', links: [{ label: 'Overview', href: '/platform' }, ...NAV.platform.items.slice(0, 6)] },
  { title: 'Solutions', links: [{ label: 'Overview', href: '/solutions' }, ...NAV.solutions.items] },
  { title: 'Resources', links: [{ label: 'Library', href: '/resources' }, { label: 'Guides & Insights', href: '/resources/guides' }, { label: 'FAQ', href: '/faq' }] },
  { title: 'Company', links: [{ label: 'About', href: '/about' }, { label: 'Contact', href: '/contact' }] },
  { title: 'Product', links: [{ label: 'Open Studio demo', href: '/studio' }, { label: 'Workspace sign-in', href: '/workspace' }, { label: 'Security', href: '/security' }] }
];
