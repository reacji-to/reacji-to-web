# Homepage reaction demo

The homepage uses HTML excerpts of real posts, with a local JavaScript demonstration of reacji.to. It never submits a reaction or authenticates a viewer. No native engagement counts or endorsements are invented.

Sources verified October 18, 2026:

- **X — swyx, “The best outcome of Twitter is getting off Twitter” (March 15, 2022).** Original: https://x.com/swyx/status/1503926848073322500. Full text, paragraph breaks, 7:51 PM timestamp, and counts (2 replies, 15 reposts, 70 likes, 5 bookmarks) come from the user's supplied screenshot. The public X page was checked for the source URL, author images, and verification badge. Counts are a fixed screenshot snapshot, not live engagement data. The action row has six evenly spaced slots: Reply, Repost, Like, reacji.to, Bookmark, Share. The post body links to the original.
- **LinkedIn — Andrew Ng, Everyone should learn to code with AI (June 3, 2025).** Original: https://www.linkedin.com/posts/andrewyng_everyone-should-learn-to-code-with-ai-at-activity-7335674367755853826-jdvs. The demo quotes the opening sentence only and labels it an excerpt. The original includes a video, which is not reproduced. Avatar source is the public post's author image.
- **dev-null — nunomaduro, 4,000 users milestone (October 18, 2026).** Original: https://dev-null.sh/@nunomaduro/commits/01a14f9d-76a7-72d9-a92d-48ae9ea999cb. Text, date, and avatar verified from its public page and the trending feed. It was the highest-starred post in the retrieved trending page; this is a community milestone rather than a claim of broad fame.

The animation opens the eyes picker, chooses an emoji, displays a single demonstration reaction, then advances X → LinkedIn → dev-null → Website. The website example opens a context menu on a passage before choosing an emoji; saved webpage reactions have no eyes icon or count. Visitors can pause/play, switch platforms, choose an emoji, toggle Public/Private, change/remove their reaction, and use the keyboard. Manual interaction pauses playback. Reduced motion disables initial autoplay. Playback stops while the demo is offscreen or the document is hidden.

The script is served from `/home-demo.js`; the homepage permits only same-origin scripts. Author and article images load from four explicit source hosts, with initials as fallbacks. Public profile pages retain their no-script policy.

- **Website — ScienceAlert, dogs and the bouba/kiki effect.** Original: https://www.sciencealert.com/dogs-seem-to-agree-with-humans-that-bouba-is-round-and-kiki-is-spiky. Checked October 18, 2026. The headline, byline, and opening paragraph are reproduced from the user-supplied screenshot. Byline: Jess Cockerill. The article photo is loaded from its original ScienceAlert URL and retains its Westend61/Getty Images credit. Right-click the unchanged paragraph or click it to try a local demonstration reaction.

## On-page trial

`demo/page-entry.js` provides a right-click menu across the homepage. `scripts/build-page-demo.mjs` bundles the actual extension content script, picker, placement anchoring, and optimistic reaction UI into `worker/page-demo.js`. The generated header records the extension source hash. Rebuild after extension UI changes.

An injected, lexical browser API adapter stores trial reactions in localStorage under `reacji.to:page-demo:v1:`. It never calls the reaction service, reads extension credentials, or writes GitHub data. Both Public and Private trial choices remain in the browser; the invitation states this. The homepage CSP disallows network connections. Real extension authentication and authorization are not part of this trial.

The website example leaves article text unhighlighted and intact. Its emoji chip is absolutely positioned using the same anchor-relative offset and viewport fallback as the extension, without reserving space or reflowing the paragraph.
