/* NYOTAA brand and URL configuration: the single place to change the brand,
   the domain and every external link. Nothing in the NYOTAA site hardcodes a domain.

   Moving to the permanent domain:
   1. Set NYOTAA_SITE_URL (for example https://www.nyotaa.com) in the hosting
      environment, or change `siteUrl` below.
   2. Set NYOTAA_INDEXABLE=true when the site should appear in search results.
   3. Rebuild and deploy. In-page links are relative, and links the page builds
      in the browser (preview and share links) use the address it is opened on.

   Values can be overridden by environment variables at build time, so different
   deployments (preview, staging, production) need no code changes. */
const env = (typeof process !== 'undefined' && process.env) || {};
const bool = (v, d) => (v === undefined ? d : /^(1|true|yes)$/i.test(v));

export const BRAND = {
  name: 'NYOTAA',
  tagline: 'Make Every Moment an Occasion.',
  category: 'Premium Digital Invitations & Experiences',
  description: 'NYOTAA creates premium digital invitations for weddings, birthdays, anniversaries, cultural celebrations and corporate events. Choose a design, personalise it and share it with your guests.',
  // Brand palette and type. These become CSS custom properties, so a change here restyles the site.
  colors: {
    ivory: '#FBF7F0', paper: '#F5EEE3', sand: '#E9DFCF', gold: '#B8924A', goldLight: '#D9BC84', goldDeep: '#8C6A2C',
    charcoal: '#1F1C19', ink: '#3B3631', muted: '#7A7066', line: '#E3D8C6', night: '#191613'
  },
  fonts: {
    // Google Fonts families, loaded with display=swap.
    display: { family: 'Cormorant Garamond', weights: '400;500;600;700', italic: true },
    body: { family: 'Manrope', weights: '400;500;600;700' },
    script: { family: 'Pinyon Script', weights: '400' }
  },
  // The logo mark is an eight-point star (nyota means "star" in Swahili) drawn inline; see render.mjs.
  logo: { wordmark: 'NYOTAA', markTitle: 'NYOTAA star' }
};

export const SITE = {
  // Where the site lives. Used only where an absolute URL is required (canonical, Open Graph, structured data).
  siteUrl: (env.NYOTAA_SITE_URL || '').replace(/\/$/, ''),
  // Path the homepage is served from on this deployment ('' when it is the site root).
  basePath: (env.NYOTAA_BASE_PATH ?? '/nyotaa').replace(/\/$/, ''),
  // Temporary deployments stay out of search results until the permanent domain is live.
  indexable: bool(env.NYOTAA_INDEXABLE, false),
  locale: 'en_IN'
};

/* Links for features that are not live yet. They stay empty until each service exists;
   all of them are environment-dependent so preview, staging and production differ by config only. */
export const INTEGRATIONS = {
  // Pattern for a guest-facing invitation link. {base} is the site address, {slug} the invitation's id.
  // Until invitations are stored on a server, shareable previews encode the design in the link instead.
  invitationUrl: env.NYOTAA_INVITATION_URL || '{base}/i/{slug}',
  authCallbackUrl: env.NYOTAA_AUTH_CALLBACK_URL || '',
  paymentWebhookUrl: env.NYOTAA_PAYMENT_WEBHOOK_URL || '',
  emailLinkBase: env.NYOTAA_EMAIL_LINK_BASE || ''
};

// Contact and social links are shown only when they are set, so nothing is invented.
export const CONTACT = {
  email: env.NYOTAA_CONTACT_EMAIL || '',
  social: {
    instagram: env.NYOTAA_INSTAGRAM_URL || '',
    pinterest: env.NYOTAA_PINTEREST_URL || '',
    facebook: env.NYOTAA_FACEBOOK_URL || '',
    linkedin: env.NYOTAA_LINKEDIN_URL || ''
  }
};

// The subset the browser needs, written to config.json next to the page.
export const PUBLIC_CONFIG = {
  name: BRAND.name, tagline: BRAND.tagline, basePath: SITE.basePath,
  invitationUrl: INTEGRATIONS.invitationUrl
};
