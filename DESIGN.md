---
name: "reacji-to website"
description: "A playful neutral-and-lime homepage and quiet public reaction profiles."
colors:
  brand-lime: "#d9f66f"
  brand-lime-hover: "#c9e75d"
  brand-ink: "#17230f"
  site-accent: "#335d10"
  page: "#f6f7f8"
  surface: "#fff"
  ink: "#121417"
  line: "#d3d7dd"
  dark-page: "#111112"
  dark-surface: "#18181a"
  dark-ink: "#ececec"
  dark-muted: "#a1a1a6"
  dark-line: "#39393e"
  muted: "#535b65"
typography:
  display:
    fontFamily: "Geist, system-ui, sans-serif"
    fontSize: "clamp(46px, 6.5vw, 80px)"
    fontWeight: 600
    lineHeight: 1.03
    letterSpacing: "-.04em"
  hero-body:
    fontFamily: "Geist, system-ui, sans-serif"
    fontSize: "19px"
    lineHeight: 1.6
  headline:
    fontFamily: "Geist, system-ui, sans-serif"
    fontSize: "32px"
    lineHeight: 1.2
    letterSpacing: "-.03em"
  profile-title:
    fontFamily: "Geist, system-ui, sans-serif"
    fontSize: "clamp(28px, 5vw, 40px)"
    fontWeight: 600
    lineHeight: 1.15
    letterSpacing: "-.03em"
  body:
    fontFamily: "Geist, system-ui, sans-serif"
    fontSize: "16px"
    lineHeight: 1.6
  demo-quote:
    fontFamily: "Geist, system-ui, sans-serif"
    fontSize: "24px"
    lineHeight: 1.5
    letterSpacing: "-.02em"
  navigation:
    fontFamily: "Geist, system-ui, sans-serif"
    fontSize: "14px"
  profile-emoji:
    fontFamily: "'Apple Color Emoji', 'Segoe UI Emoji', sans-serif"
    fontSize: "36px"
    lineHeight: 1.2
rounded:
  control: "6px"
  placement: "12px"
  demo: "16px"
spacing:
  control-gap: "8px"
  small: "12px"
  medium: "16px"
  page-mobile: "20px"
  page: "24px"
  hero-gap: "30px"
  demo-gap: "60px"
components:
  button-install:
    backgroundColor: "{colors.brand-lime}"
    textColor: "{colors.brand-ink}"
    rounded: "{rounded.control}"
    padding: "15px 22px"
  button-install-hover:
    backgroundColor: "{colors.brand-lime-hover}"
    textColor: "{colors.brand-ink}"
  filter-active:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.page}"
    rounded: "{rounded.control}"
    padding: "5px 12px"
  emoji-choice:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    width: "48px"
    height: "44px"
  demo-excerpt:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.demo}"
    padding: "36px 36px 48px"
  placed-emoji:
    backgroundColor: "{colors.page}"
    textColor: "{colors.ink}"
    rounded: "{rounded.placement}"
    width: "62px"
    height: "52px"
---

# Design System: reacji-to website

## Overview

**Creative North Star: "A small sideways glance, given room"**

The website amplifies the established reacji-to eyes without replacing their identity. A pale neutral page, direct dark type, and a lime download action give the approved photorealistic blue eyes room to be playful. The homepage is spacious and expressive; public profiles retain a quieter reading rhythm built from open, ruled rows.

This document owns the homepage and public profile surfaces in `reacji-to/reacji-to-web`. The compact blue picker and settings belong to the separate extension repository. It records `worker/home.js`, `worker/pages.js`, `public/logo.png`, `public/icon-512.png`, and `public/fonts/`. The approved logo generation prompt is retained at `docs/logo-generation.txt`. Reviewed homepage evidence is `.impeccable/review/home-desktop.png`, `.impeccable/review/home-mobile.png`, and `.impeccable/review/home-dark.png`. Profile guidance below is source-derived and preserves the incumbent reading mode.

**Key Characteristics:**

- Large transparent blue eyes as the homepage's expressive anchor.
- Neutral page surfaces, dark type, lime installation action.
- Spacious homepage and compact ruled profile rows.
- A small interactive emoji example built from native radio controls and CSS.
- Automatic dark mode and reduced-motion-aware hover behavior.

## Colors

Lime identifies the download action, while the neutral palette lets type, emoji, and blue-eyed artwork carry the page.

### Primary

**Brand lime** fills the installation CTA; **brand lime hover** is its hover variant. **Brand ink** supplies the CTA text and text-selection foreground. **Site accent** is the darker green for light-theme link hovers and focus; the dark theme uses brand lime for these roles. Iris blue is part of the approved raster artwork, not a general UI action token.

### Neutral

**Page**, **surface**, **ink**, **muted**, and **line** separate the open canvas, demo excerpt, reading text, secondary copy, and fine rules. Automatic dark mode maps each to its corresponding dark primitive. Profiles use the same page palette, with ink-filled active filters.

**The Accent Rule.** Preserve lime for the clear installation action and contextual focus; let the eye artwork provide the blue expression.

## Typography

The homepage self-hosts Geist from `public/fonts/geist-400.woff2` and `geist-600.woff2`, using `font-display:swap`. The latter face is declared for weights (600–800). Both files are served by the Worker. The shared stack is Geist, system-ui, sans-serif. Current profile pages do not include the homepage's `@font-face` rules, so their requested Geist face depends on the installed environment; document that difference rather than assuming fonts are loaded globally.

The homepage display scale is fluid, tightly tracked, and balanced. At the homepage breakpoint it becomes (48px). Hero body text reduces from its documented scale to (17px). The demo heading uses the headline role; lower informational headings are (26px) with (-.02em) tracking. The demo quote reduces to (22px) on narrow screens. Homepage wordmark is (26px), weight (650), reducing to (23px). Body paragraphs cap at (65ch); hero copy additionally caps at (430px).

Profiles retain the fluid profile-title role, (20px) secondary headings, (14px) navigation, (13px) metadata, and tabular dates. Their emoji reduce to (30px) below the narrow profile breakpoint. Handles, excerpts, URLs, and identifiers wrap safely.

## Layout

Shared profile header, main, and footer have a centered (780px) maximum width and (24px) horizontal padding. Profile main starts (56px) below its top edge. Rows use a (64px) emoji column, flexible content, and a date column, with (18px) gaps and (22px) vertical padding. At (500px) and below, horizontal padding becomes (20px), main top padding becomes (36px), the emoji column becomes (44px), and dates move under the content. Filter navigation wraps.

The homepage widens the shared frame to (1120px). Its hero uses a (1.3fr 1fr) split, (30px) gap, and (470px) minimum height. The eyes cap at (400px). Demo and informational sections use two equal columns separated by (60px), with thin top rules and generous vertical padding. Footer copy and repository links share a row.

At (700px) and below, homepage sections become single-column. The (220px) eye artwork moves above the headline. The demo uses (36px) gaps, its excerpt gains compact padding, and the footer stacks. At (500px), the shared (20px) gutters also apply. The homepage has a clear download link, installation guidance, demo, and explanatory sections; it has no profile search box. Do not generalize that surface choice into a ban on all inputs.

## Elevation & Depth

The website is flat: rules, surface color, and whitespace establish hierarchy, with no declared box shadows. The photorealistic mark has its own internal material shading. A rotated emoji tab slightly overlaps the demo excerpt to show an attached reaction without making the whole page a card system.

The hero eyes rotate (-5deg) and rise (8px) on hover over (350ms); demo choices rise (3px) over (180ms). Both use `cubic-bezier(.16,1,.3,1)`. Under reduced motion the transitions and hover transforms are disabled. The demo tab keeps its static (-8deg) rotation.

## Shapes

Controls and profile filters use the control radius. The demo excerpt has a softer demo radius; its attached emoji has the intermediate placement radius. Borders are (1px), and profiles remain open ruled rows rather than enclosed cards.

The approved mark is two separate tall, glossy off-white oval eyeballs looking left with finely detailed vivid blue irises and black pupils, on transparency. Preserve the artwork, proportions, highlights, gaze, and cutout edges. `public/logo.png` supplies compact branding; `public/icon-512.png` supplies the large `/eyes-blue.png` hero asset. The homepage header displays eyes at (44 × 44px), reducing to (40 × 40px); profiles retain (36 × 36px). The large hero has descriptive alt text, while the linked wordmark makes its adjacent decorative image redundant.

## Components

### Download action and navigation

The primary lime link uses the frontmatter's homepage padding, weight (600), and the darker hover fill. The header offers a simple underlined Get the extension link. Shared focus treatment is a (2px) accent outline offset (5px). Footer links connect the Extension, Website, and Data repositories beside MIT text.

### Interactive emoji demonstration

The four choices are native radio inputs paired with visible emoji labels, each (48 × 44px). The selected label uses an ink border and page background; hover lifts it, and keyboard focus outlines the label with (4px) offset. CSS `:has()` changes the attached emoji between blue heart, fire, eyes, and exploding head. The default is blue heart. The legend explicitly says nothing is posted. The controls do not save reactions or impersonate the extension's full picker.

The excerpt is a bordered surface with generous inset and a (24px) quote. Its decorative attached tab is (62 × 52px), placed (22px) below the card edge and (36px) from the right. The tab is hidden from accessibility APIs; the native radio state carries the user's choice.

### Public profile filters and feed

Profiles are reading surfaces. Filters are links labeled All, dev-null, X, LinkedIn, and Web; the current filter uses ink fill, page text, and `aria-current="true"`. Feed rows show an emoji, platform post link or webpage hostname, identifier or saved excerpt, and UTC date. Items are newest first, (50) per page; Newer / Older links appear as needed. Public count and GitHub profile link sit beneath the handle.

Empty, missing-profile, unavailable, and not-found states reuse the same restrained frame. Empty filtered states point to All; unavailable states offer retry. The stylesheet retains old generic form rules, but no profile-search form is rendered on the homepage. Those dormant rules are not current components.

## Do's and Don'ts

### Do:

- **Do** preserve the approved transparent blue-eye artwork and reacji-to wordmark.
- **Do** keep the homepage expressive through scale, clear type, and the small emoji interaction.
- **Do** retain neutral surfaces, lime download actions, visible focus, and dark-mode mappings.
- **Do** preserve the quieter ruled reading layout for public profiles.
- **Do** keep the demo's native radio semantics and reduced-motion behavior.

### Don't:

- **Don't** recolor the eye asset, add an opaque tile, or replace it with a generic icon.
- **Don't** reintroduce the removed homepage profile-search box.
- **Don't** spread homepage hero scale or demo cards into profile feed rows.
- **Don't** show private reactions or private counts on public profiles.
- **Don't** imply the local emoji demo posts a reaction.
