# Ask Compass design system

The website's visual language in one page. Tokens live in `apps/web/assets/css/site.css` (`:root`);
homepage-only styles live in `assets/css/home.css`.

## Idea

Navigation at night: a dark sky, one bright compass, and a lit trail to the next step. Light sections are
where the work happens. They are calm, readable, and drawn like a blueprint. Dark sections are for
moments of direction (hero, capabilities, industries).

## Colour

| Token | Value | Use |
|---|---|---|
| `--navy` | `#10284C` | Headings on light, primary buttons, brand mark |
| `--deep` | `#173F73` | Secondary ink, eyebrows |
| `--blue` | `#2563EB` | Links, focus, active states, highlighted words |
| `--blue-bright` / `--cyan` | `#4C9AFF` / `#5FD0FF` | Glow and light on dark surfaces only |
| `--gold` | `#EFB64A` | North marker, sparing warm accent |
| `--night` | `#050B1C` | Dark sections |
| `--bg` / `--bg-blue` | `#FAFAF7` / `#EEF5FC` | Light sections |
| `--ink` / `--ink-2` | `#17263E` / `#5E6C82` | Body text |

Highlighted words in headlines use a blue to teal gradient on light (`#2563EB → #0B87B6 → #0E8A80`) and
cyan to blue on dark. Purple is not part of the palette.

## Type

Geist for text, Geist Mono for labels, statuses, numbers and blueprint annotations.
Display headings are 650–700 weight with tight tracking (-0.035em to -0.045em). Body text is 16–17px
with a line height of 1.6–1.65. Mono labels are uppercase with 0.08–0.14em tracking.

## Surfaces

- **Solid light cards:** white, 1px `--line` border, soft navy shadow.
- **Dark cards:** `#0A1430`, with an edge tinted by the card's own colour. On hover, the edge turns iridescent and a light follows the pointer.
- **Glass:** used only for floating controls (the hero labels and the use-case tab bar), never for whole sections.
- **Blueprint panels:** pale blue grid, thin blue line drawings and mono annotations. They explain how things work.

## Motion

| Kind | Duration | Easing |
|---|---|---|
| Hover, focus, press | 0.2–0.35s | `--ease` (`cubic-bezier(.22,1,.36,1)`) |
| Indicators, panels | 0.35–0.5s | `--ease-spatial` (`cubic-bezier(.16,1,.3,1)`) |
| Headline word reveal | 0.7–0.8s, 45–80ms stagger | `--ease-spatial` |
| Line drawing | 1s, 110ms stagger | `--ease` |
| Auto-advance (tabs) | 7s per tab, only while on screen and before any interaction | linear progress |

Rules:
- Nothing moves before the content can be read.
- Loops run only while on screen and stop when the tab is hidden.
- With `prefers-reduced-motion`, every animation is removed or reduced to a fade, nothing advances on
  its own, and all content stays reachable.
- Hover is never the only way to reach something. The tabs also work by click, tap and arrow keys.

## Styles in use, and where

| Style | Where |
|---|---|
| Wireframe and 3D, particles, gradient mesh, restrained neon | Hero: 3D compass, constellation canvas, night sky, glowing trail |
| Kinetic typography | Hero headline; use-case headlines (word by word) |
| Liquid morph | Use-case tab indicator (its edges stretch toward the next tab) |
| Holographic | Use-case panel edge and sheen; capability card edges |
| Glassmorphism | Hero labels, tab bar |
| Blueprint | Use-case drawings; the Studio preview canvas |
| Split-flap | Industries band ("Built for …") |
| Bauhaus grid, neo-brutalist accents | Layout structure and section rhythm |

Not used on the main site (reserved for campaigns or experiments): comic, VHS, pixel art, ASCII, clay 3D,
halftone, Art Deco.

## Words

Use **SI** for intelligence features in all user-facing copy ("SI Procedure Studio", "SI-assisted answers").
Keep "AI" only when referring to external products or categories by their own name. Mark every feature honestly
as *In the demo* or *Planned*. Sample data is always labelled.
