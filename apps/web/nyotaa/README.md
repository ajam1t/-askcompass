# NYOTAA

The NYOTAA homepage is a separate brand built by `apps/web/build.mjs` into `public/nyotaa/`.
It shares no copy, styles or scripts with the ASK COMPASS pages.

## Files

| File | What it holds |
| --- | --- |
| `brand.config.mjs` | Brand name, tagline, colours, fonts, site address, integration links, contact and social links. The only place a domain may appear. |
| `render.mjs` | Homepage sections, the privacy and terms drafts, and the page head (SEO, Open Graph, structured data). |
| `assets/invite.js` | The invitation engine: occasions, the ten designs, the card and guest-page markup, share-link encoding. Used by the build and the browser. |
| `assets/invite.css` | Invitation card, phone frame and guest page styles. |
| `assets/nyotaa.css`, `assets/nyotaa.js` | Homepage styles and behaviour (filters, preview, customise, guest view, menu). |

## Configuration

Every value can be set as an environment variable in the hosting project (Vercel → Settings → Environment Variables), so preview, staging and production differ by config only.

| Variable | Default | Purpose |
| --- | --- | --- |
| `NYOTAA_SITE_URL` | empty | Absolute address, e.g. `https://www.nyotaa.com`. Used only for canonical, Open Graph and structured data. |
| `NYOTAA_BASE_PATH` | `/nyotaa` | Path the homepage is served from. Set to an empty value when NYOTAA is the site root. |
| `NYOTAA_INDEXABLE` | `false` | `true` lets search engines index the site and adds the canonical link. |
| `NYOTAA_INVITATION_URL` | `{base}/i/{slug}` | Pattern for stored guest invitation links, once invitations are saved on a server. |
| `NYOTAA_AUTH_CALLBACK_URL` | empty | Sign-in callback, once accounts exist. |
| `NYOTAA_PAYMENT_WEBHOOK_URL` | empty | Payment webhook, once payments exist. |
| `NYOTAA_EMAIL_LINK_BASE` | empty | Base address for links in emails. |
| `NYOTAA_CONTACT_EMAIL` | empty | Shown in the FAQ and footer only when set. |
| `NYOTAA_INSTAGRAM_URL`, `NYOTAA_PINTEREST_URL`, `NYOTAA_FACEBOOK_URL`, `NYOTAA_LINKEDIN_URL` | empty | Social links, shown only when set. |

All in-page links are relative. Preview and share links are built in the browser from the address the page is opened on, so they follow whatever domain serves the site.

## Moving to the permanent domain

1. Add the new domain to the Vercel project and point DNS at it.
2. Set `NYOTAA_SITE_URL` to the new address and `NYOTAA_INDEXABLE=true`. If NYOTAA becomes the site root, set `NYOTAA_BASE_PATH` to empty.
3. Redeploy. Add a host rule in `apps/web/vercel.json` for the new domain like the existing `nyotaa.askcompass.in` ones, or serve NYOTAA from its own Vercel project.

No source file names the temporary domain except `vercel.json`'s host rules.
