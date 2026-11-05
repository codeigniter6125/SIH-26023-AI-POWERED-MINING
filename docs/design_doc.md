# GeoMine — Design Document (v3.0, "The Core Sample")

**Product:** CMPDI Geological Intelligence & Exploration Records Portal (codename **GeoMine**)
**Problem Statement:** SIH26023 — AI-Powered Geological, Mining and Other Reporting Solution for CMPDI/CIL Subsidiaries
**Team:** Race Condition · **Version:** 3.0 · **Date:** 6 November 2026
**Supersedes:** Design Spec v2.1 (GoI navy portal). The v2.1 compliance rules are kept in Part B.

---

## 0. What changed in v3.0 and why

v2.1 was a correct but forgettable government portal. Judges and Ministry viewers see many of those.
v3.0 splits the frontend into two surfaces that share one backend:

| Surface | Folder | Who it's for | Look |
|---|---|---|---|
| **The Core Sample** (public front door + live demo) | `web/` | Judges, Ministry visitors, new officers | One continuous toon-shaded 3D world, playful, hand-made |
| **Officer Workspace** (daily work) | `frontend/` | Geologists, desk officers, reviewers, DGMS auditors | GIGW 3.0 / NIC light portal (Part B) |

The world never replaces the workspace. It explains the product, runs the live demo (ask a question, see a
discrepancy, see the 3h 40m → 42 s benchmark) and sends signed-in officers into the workspace.

---

# Part A — The Core Sample (3D world)

## A1. Role, users, tone

- **Role of the page:** show what GeoMine does in about 90 seconds of scrolling, then let people try it.
- **Users:** SIH judges, Ministry of Coal and CMPDI visitors, officers seeing GeoMine for the first time.
- **Tone:** confident, plain, a bit funny. We joke about paperwork and old cupboards, never about safety,
  miners or the Ministry. Numbers stay exact.
- **Bar:** it should look made by a design studio, not generated. If a section looks like a template, redo it.

## A2. Core concept: one continuous world

The whole site is **one paper-craft diorama of a coal block, cut open like a slice of cake**. Scrolling lowers the
camera down the drill string, from the rig on the surface to the bedrock. Each stop is a real stratum from
borehole **NK-094** (North Karanpura), with its real depth. Content floats over the cut face as the camera reaches it.

All copy uses drilling language: sections are **runs**, scroll position is **depth**, the CTA is **"Drop the drill"**,
loading is **"Spudding in"**, the footer is the **core shed**.

## A3. Visual style

### Palette (CSS variables in `web/src/styles/tokens.css`)

| Token | Day | Night | Use |
|---|---|---|---|
| `--hivis` (dominant) | `#FFC21A` | `#FFC21A` | Hi-vis yellow: hard hats, sandstone, CTAs, highlights |
| `--paper` | `#F3EEE3` | `#1F1B15` | Page and sticker card background |
| `--ink` | `#17140F` | `#F3EEE3` | Text, 3px outlines, coal |
| `--ink-soft` | `#5B544A` | `#B9B0A2` | Secondary text |
| `--flag` (tiny accent) | `#E5412D` | `#FF5A44` | Discrepancy flags, the survey pin, one doodle per stop at most |

Strata use tints and shades of these colours only (alluvium = darkened paper, sandstone = yellow tints,
coal = ink, interburden = warm grey). **No gradients, no glow, no purple, no glass.**

### Typography

| Role | Font | Notes |
|---|---|---|
| Headings | **Bricolage Grotesque** 800 | `clamp(3rem, 9vw, 8.5rem)`, tracking −0.04em, line-height 0.9 |
| Body | **Atkinson Hyperlegible** 400/700 | Built for low-vision readers, which fits NIC accessibility goals |
| Readouts | **JetBrains Mono** 500 | Depths, coordinates, SHA-256 hashes, docket numbers |

Never Inter, Roboto or Arial.

### 3D look

- `MeshToonMaterial` with a 4-step gradient map (`web/src/scene/toon.ts`), flat colours.
- Thick black outlines via drei `<Outlines>` (thickness 0.035 world units).
- Paper grain: a static SVG noise overlay at 7% opacity over the whole page.
- Hand-made details: wobbly SVG underline under one key word per heading, doodles (stars, arrows, scribbles),
  small paper tags on objects ("RIG 7", "SEAM IX").

### UI cards = stickers

Paper background, 3px ink border, hard offset shadow `6px 6px 0 var(--ink)`, rotated −2° to 2°,
tilt in 3D on hover (max 8°). Spacing on an 8px grid. Layouts alternate left/right with uneven columns.

## A4. Camera path, stop by stop

Scroll progress 0 → 1 maps to a Catmull-Rom curve (`web/src/config/world.ts`). A damped spring
(stiffness 120, damping 14) follows the target, so the camera eases in with a slight overshoot.

| # | Stop (world name) | Depth | Page job | Camera | Main content |
|---|---|---|---|---|---|
| 0 | **Spudding in** | — | Loader | Wide, high | Strata stack up one by one, depth counter runs 0 → 312 m |
| 1 | **Collar** | 0 m | Hero | Three-quarter view of the surface | "Three hours of digging through files. Forty-two seconds of answers." CTA: Drop the drill |
| 2 | **Alluvium** | 0–42 m | How it works | Drops to the cut face, slides left | Four runs: Scan it → Log it → Check it → Sign it |
| 3 | **Sandstone** | 42–114 m | Features | Swings right, closer | Report Studio modes, PQ Fast-Response, Conflict Timeline, Evidence Viewer, Block Map |
| 4 | **Seam IX** | 114.3–122.7 m | Live demo | Close on the coal band | "Ask the core" query box (real `/api/v1/query/`), live benchmark clock |
| 5 | **Interburden** | 122.7–131 m | Verification | Pans across | MECL 1998 says 6.80 m, CMPDI 2021 says 8.42 m. Real `/api/v1/discrepancies/` data |
| 6 | **Seam X** | 131–139 m | Join / access | Pulls back a little | "Pick your hard hat": four roles, each opens the workspace |
| 7 | **Bedrock** | 139–312 m | FAQ | Deep, slow | Sticker accordion |
| 8 | **Core shed** | — | Footer | Pull out to whole block | Credits, docs links, SIH26023 |

Mobile: the camera goes straight down with no side swings, and half the props are hidden.

## A5. Characters and objects (12)

Each has an idle animation, a speech bubble and a cursor reaction. Clicking opens a **Field Note** sticker.
Every object is also in the stop's "Poke around" chip list, so keyboard and screen-reader users get the same content.

| # | Object | Stop | Idle | Cursor / click | Bubble |
|---|---|---|---|---|---|
| 1 | **Rig 7** (drill rig) | Collar | Drill bit spins | Click: drill plunges | "Spudding in since 06:00." |
| 2 | **Mukho** (chief geologist) | Collar | Breathes, shifts weight | Head follows cursor, waves on hover | "Seam IX is 8.42 m. I have receipts." |
| 3 | **Priya** (desk officer) | Collar | Taps paper stack | Jumps on hover | "PQ due at 11. It is 10:59." |
| 4 | **Dumper** (truck) | Collar | Drives a loop | Honks (sound) on click | "Beep. Wrong department." |
| 5 | **Theo the theodolite** | Collar | Slow scan | Turns to cursor | "Looking at you. In WGS84." |
| 6 | **Archive box 1998** | Alluvium | Lid rattles | Jumps on hover | "I've been in a cupboard since 1998." |
| 7 | **Scanner mole** | Alluvium | Digs, pops up | Looks at cursor | "Page 12, Table 3, Row 4. Got it." |
| 8 | **Glossopteris fossil** | Sandstone | Leaf sways | Click: fun fact | "Your coal was me, 270 million years ago." |
| 9 | **Lumpy** (coal lump, G7) | Seam IX | Bounces | Squishes on click | "5,420 kcal/kg and proud of it." |
| 10 | **Two rulers** (MECL / CMPDI) | Interburden | Lean at each other | Click: they shake hands | "6.80!" / "8.42!" |
| 11 | **Hat rack** | Seam X | Hats wobble | Hovered hat lifts | "One for each kind of busy." |
| 12 | **Bedrock tortoise** | Bedrock | Blinks | Pulls head in | "Slow questions. Solid answers." |

Repeated props (trees, rocks, pebbles in strata) use `<Instances>`.

## A6. Interaction

- **Scroll:** Lenis smooth scroll drives GSAP ScrollTrigger; ScrollTrigger writes progress into a ref the camera reads.
- **Parallax:** pointer position offsets the camera by up to 0.6 units. Dragging on empty canvas looks around (±12°).
- **Cards:** tilt on hover, lift on focus, press-in on active, "Drilling…" loading state on async buttons.
- **Cursor:** dot by default; ring with label on 3D objects ("poke"); bit icon on buttons; I-beam on inputs.
  Hidden on touch and for reduced motion.
- **Magnetic buttons:** pull up to 10px toward the pointer.
- **Day/night:** the toggle sets `data-theme` on `<html>`. CSS variables and scene lights both read it. At night the helmet
  lamps turn on.
- **Sound:** soft synthesized clicks (WebAudio, no files). **Muted by default.**

## A7. Fallbacks, performance, accessibility

- **Flat mode:** `prefers-reduced-motion`, no WebGL, or a low-power device (≤4 cores and ≤4 GB) → 2D strata column in CSS,
  same content, no camera. A toggle in the header switches modes by hand.
- **Performance:** the scene is lazy-loaded (`React.lazy`), DPR capped at 2 (1.5 on mobile), no shadows, instanced repeats, about 150 draw calls (outlines double the mesh count), target 60 fps.
- **Accessibility:** skip link, visible 3px focus rings, AA contrast in both themes, `aria-label` on the canvas,
  `aria-live` on query results, every 3D fact reachable from HTML chips, all icons as inline SVG with titles.

## A8. Copy rules

- Specific over general: "Seam IX, 8.42 m, sonic caliper, 2021", not "accurate data".
- Banned words: seamless, revolutionize, unlock, empower, leverage, cutting-edge, next-gen.
- No emoji as icons. No lorem ipsum. Real names of blocks, agencies and standards. Fictional people only.

---

# Part B — Officer Workspace (kept from v2.1)

The workspace in `frontend/` keeps the GIGW 3.0 / NIC design system. Summary of the rules that still apply:

- **Palette:** `#0C2340` navy primary, `#F8F9FD` canvas, `#137333` verified, `#B06000` under review, `#C5221F` conflict, `#007A87` GIS.
- **Type:** Public Sans for UI, IBM Plex Mono for coordinates, hashes and docket numbers.
- **Navigation:** Dashboard · Borehole Directory · Block Exploration Maps · Geological Reports · Verification Queue · National Data Repository.
- **Compliance:** GIGW 3.0 (emblems, bilingual Hindi/English, statutory footer), WCAG 2.1 AA (≥4.8:1 contrast, A-/A/A+),
  DGMS CMR 2017 Reg. 113 badges, UNFC 111 reserve badges, SHA-256 hash on every citation.
- **Modules:** GIS + cross-section (FR-12, FR-17), borehole dossier, discrepancy reconciliation with sign-off (FR-5, FR-8, FR-15),
  Report Studio with 4 modes + PQ (FR-1, FR-9, FR-10), ingestion desk with bounding-box viewer (FR-4, FR-13).

The data contracts (`BoreholeRecord`, `LithologicalInterval`, `FactEvidenceCitation`) are unchanged; see
[database.md](database.md) and [api.md](api.md).

## Handover between surfaces

The **Seam X / "Pick your hard hat"** stop links each role to the workspace route it lands on (see [auth.md](auth.md)).
The world reuses the same `/api/v1` endpoints, so the demo never shows numbers the workspace would not.
