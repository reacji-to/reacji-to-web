# reacji.to design

## Homepage

The homepage is one light screen with no page scroll: a short promise, the agent install command, and a working browser. The blue accents echo the approved eyes artwork. Preserve the native X, LinkedIn, dev-null, and ScienceAlert examples as separate source surfaces. Design rules follow the shared consensus of Anthropic's frontend-design skill, Impeccable, taste-skill, and Vercel's Web Interface Guidelines: one typeface, one accent, a shadow only on what floats, few words, and no ornament.

- Page: `#fcfcfd`; ink: `#14161b`; soft ink: `#3c424e`; muted: `#646b78`; rules: `#e7e9ee`; wash: `#f1f3f7`.
- Action blue: `#2456e8`, hover `#1a44c6`; white text.
- Command surface: `#13151b`, text `#e8ecf5`.
- Dark homepage: `#111318`, ink `#eef1f6`, muted `#9aa3b2`, rules `#2b303b`, accent `#6f93ff`. The demo browser stays light.
- Type: self-hosted Manrope, weights 400–800 (SIL Open Font License, `public/fonts/Manrope-OFL.txt`). Monospace appears only in the command. Geist remains bundled for the dev-null reproduction and extension picker.
- Heading: “Reacjis, anywhere.” Weight 800, 42–66px desktop, at most two lines, tracking -.04em, balanced. Promise: 18–21px / 1.45, weight 500, soft ink.

## Hierarchy and layout

The page is a flex column of `100dvh`: header, hero, one-line footer. The hero has two columns (copy, then demo) and stacks below 800px. The browser demo absorbs leftover height and scrolls inside its own viewport. When the screen is too short (under 620px on desktop or 600px on phones), the page falls back to normal scrolling rather than clipping.

The copy column holds the heading, the promise, the agent setup command, a plain download link, and the Option invitation. The agent command is the primary action and the page's single shining element: a dark command surface with a slow light sweeping its border and a blue glow. It shows the exact setup prompt, selectable, with a blue Copy button. Success changes only the button label to “Copied!”. Clipboard failure selects the text and explains manual copying. Reduced motion stops the sweep.

The Option invitation shows a keycap and “Hold Option and click anything to try it on this site.” It says Alt outside Apple platforms, presses in while the key is held, and becomes a tap hint on touch screens. Phones hide it and the command label to fit one screen.

The header carries the eyes mark and a GitHub icon link. The eyes are the approved artwork split into empty eyeballs (`public/eyes-blank.png`) and the original iris (`public/eyes-iris.png`). The irises follow the pointer anywhere on the page, with both pupils locked to one shared gaze vector toward the cursor. The white interiors are clean beneath the moving irises; the mark stays upright so the gaze remains aligned. Profile pages keep the static logo.

## Demo browser

The demo sits in a light browser window: grey window dots, one tab per platform with its real favicon (X and LinkedIn marks, dev-null's favicon.svg, ScienceAlert's hosted favicon over a globe fallback), an address bar showing the current post's URL, and the reacji.to eyes as the toolbar extension. Narrow windows show labels only on the selected tab. Play/Pause is an icon button at the end of the tab strip.

Each scripted reaction triggers a pretend automation, shown as a toast under the extension icon: a spinner with the working text, then a green check with the result.

- X, 🔖: “Bookmarking…” → “Bookmarked”, “Added to your reading list”.
- LinkedIn, 📣: “Sharing with your team…” → “Shared with your team”.
- dev-null, 🧵: “Summarizing thread…” → “Summary created:” with a link-styled note path.
- ScienceAlert, 🐶: “Saving to Dog file…” → “Saved to Dog file”.

## Interaction

The native post demonstration pauses on user interaction and respects reduced motion. It cycles X → LinkedIn → dev-null → Website. Social posts show one reaction per person and visibility: your emoji replaces the eyes in the existing action slot, without a count or a separate reaction row. Clicking your emoji removes it and restores the eyes. Source links open the original content. Website reactions show just a gray emoji box, no eyes or visible count.

Both the whole-page trial and the native post examples bundle the actual extension reaction engine with a browser-local storage adapter. There is one shared picker and reaction renderer. Its picker, anchors, and optimistic rendering use that source. No GitHub credentials or service writes are used. Build with `npm run build:page-demo` after extension changes. Profile pages remain script-free.

## Branding and retained constraints

Use “reacji.to” in visible copy. Preserve the photorealistic blue-eyed artwork in the header and browser toolbar. Social post triggers use the shared extension’s monochrome native eyes, matching each site’s icon height, color, weight, and drawing style while preserving the 232:180 eyes-emoji aspect ratio. Action glyph centers are evenly spaced, independent of label and count widths. No giant eyes illustration or search box. Keep one GitHub icon in the footer followed by spaced Extension, Website, Data, and MIT items without dot separators.

Profiles retain their existing neutral palette, compact feed typography, and 780px frame; homepage refinement should not reshape profile reading surfaces.

## Placement movement

Your placed page reactions can be dragged by their gray chip. A click still opens the picker; movement starts after five pixels and Escape cancels. A drop captures the underlying DOM element with normalized coordinates and `mode: point`, so the chip stays over the chosen point without changing document flow. Existing placements keep their original below-element positioning until moved.

Moving is optimistic. Saves run in order in the background; a failed latest move restores the last committed position and offers Retry. A move creates a new placement ID and removes only the verified actor from the source in one commit. Other users and the other visibility scope are preserved. Public profile entries move in the same commit. The website trial uses the same extension content bundle, saving only to browser storage.

There is no reaction context menu on either surface. Hold down Option (Alt on Windows/Linux) and click to place a reaction.
