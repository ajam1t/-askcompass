# Ask Compass website and Studio demo

Static site generated with Node (no dependencies) and deployed by Vercel from this folder.

```
node build.mjs            # build every page into public/
node build.mjs --status   # also regenerate ../../docs/CAPABILITY_STATUS.md
node tests/site.test.mjs  # build, then check routes, links, metadata, sitemap and honesty rules
```

Preview locally with any static server pointed at `public/`, for example `npx serve public`.

## Where things live

| Path | What |
|---|---|
| `build.mjs` | Layout (head, header, mega menus, footer, breadcrumbs), page templates, sitemap, robots |
| `src/content/site.mjs` | Navigation, footer, contact details, status labels |
| `src/content/platform.mjs` | Platform overview and the 11 capability pages, with per-feature status |
| `src/content/solutions.mjs` | Solutions overview and the 7 solution pages |
| `src/content/resources.mjs` | Guides and FAQ |
| `src/content/pages.mjs` | Resources, About, Contact, legal, workspace and 404 pages |
| `src/sections/*.html` | Homepage and shared sections (hero, demo, founder, CTA, …) |
| `assets/css/site.css` | Design tokens and homepage styles |
| `assets/css/pages.css` | Inner-page components |
| `assets/js/site.js` | Header, menus, generated diagrams, reveals (every page) |
| `assets/js/home.js`, `compass.js` | Homepage compass labels, demo and the Three.js compass |
| `studio.html`, `assets/js/studio*.js` | Public Studio demo (browser-only data) |
| `app.html` | Legacy prototype, kept for existing links |
| `vercel.json` | Build settings, `/studio` alias and hostname redirects |

To add a capability or solution page, add an entry to the relevant content file and to `NAV` in `site.mjs`;
the template, breadcrumbs, metadata and sitemap entry are generated. Mark every feature honestly as
`demo`, `dev` or `planned`.

See `../../docs/ARCHITECTURE.md` for domains, tenancy and the backend plan.
