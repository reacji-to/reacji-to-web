# reacji.to design

## Homepage

The homepage is a cool, quiet canvas for a working emoji demo. The blue accents echo the approved eyes artwork. Preserve the native X, LinkedIn, dev-null, and ScienceAlert examples as separate source surfaces.

- Page: `#f7f8fa`; ink: `#202736`; supporting text: `#586174`; rules: `#dde1e9`.
- Action blue: `#245bdc`, hover `#1648ba`; white text.
- Setup banner: `#e9eef8`, text `#253353`, white command box, quiet filled Copy button.
- Dark homepage: `#171a21`, ink `#edf0f7`, supporting text `#b2bdcf`, rules `#364054`, accent `#9ab4ff`.
- Homepage type: self-hosted Manrope, weights 400–800. Source: Google Fonts, SIL Open Font License in `public/fonts/Manrope-OFL.txt`.
- Heading: weight 800, fluid 30–51px desktop, one line, tracking -.04em. Mobile scales to fit.
- Intro: 17px / 1.6. Main promise: 27px / 1.35 (24px on phones), bold in full ink. Supporting details: 16px / 1.65 with selective bold phrases.
- Native demo typography remains platform-specific. Geist remains bundled for the dev-null reproduction and extension picker.

## Hierarchy and layout

The agent setup banner is first, above the header. It contains the exact setup prompt in its own selectable command box and a Copy button. Success changes only the button label to “Copied!”; no extra success sentence appears. Clipboard failure selects the text and explains manual copying.

The content frame is 1120px with 24px side padding, reducing to 20px on phones. The hero uses two columns with a 56px gap, stacking below 800px. The copy column contains the one-line heading, emphasized promise, introduction, download action, and compact supporting copy. On phones the demo comes before the longer supporting copy. Potential uses form a wrapping text list.

The demo column contains the four platform tabs and scripted examples. Below it, a pale blue invitation headed “Try it on this site!” invites visitors to hold down Option (Alt on Windows/Linux) and click anywhere to place a reaction. Keep this invitation visible; it is the route to the real interactive trial.

## Interaction

The native post demonstration pauses on user interaction and respects reduced motion. It cycles X → LinkedIn → dev-null → Website. Source links open the original content. Website reactions show just a gray emoji box, no eyes or visible count.

Both the whole-page trial and the native post examples bundle the actual extension reaction engine with a browser-local storage adapter. There is one shared picker and reaction renderer. Its picker, anchors, and optimistic rendering use that source. No GitHub credentials or service writes are used. Build with `npm run build:page-demo` after extension changes. Profile pages remain script-free.

## Branding and retained constraints

Use “reacji.to” in visible copy. Preserve the photorealistic blue-eyed logo in the header and native picker triggers. No giant eyes illustration, search box, or removed marketing sections. Keep one GitHub icon in the footer followed by spaced Extension, Website, Data, and MIT items without dot separators.

Profiles retain their existing neutral palette, compact feed typography, and 780px frame; homepage refinement should not reshape profile reading surfaces.

## Placement movement

Your placed page reactions can be dragged by their gray chip. A click still opens the picker; movement starts after five pixels and Escape cancels. A drop captures the underlying DOM element with normalized coordinates and `mode: point`, so the chip stays over the chosen point without changing document flow. Existing placements keep their original below-element positioning until moved.

Moving is optimistic. Saves run in order in the background; a failed latest move restores the last committed position and offers Retry. A move creates a new placement ID and removes only the verified actor from the source in one commit. Other users and the other visibility scope are preserved. Public profile entries move in the same commit. The website trial uses the same extension content bundle, saving only to browser storage.

There is no reaction context menu on either surface. Hold down Option (Alt on Windows/Linux) and click to place a reaction.
