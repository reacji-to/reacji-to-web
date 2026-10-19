# reacji-to web

The [reacji.to](https://reacji.to) website and Cloudflare Worker. MIT licensed.

- [Extension](https://github.com/reacji-to/reacji-to): Chrome / Helium picker, page placements, GitHub OAuth, and dev-null following filter.
- **This repository:** landing page, public profiles, and authenticated commit service.
- [Data](https://github.com/reacji-to/reacji-to-data): public JSON reaction files and profile indexes.

## Run and deploy

Requires Node 24+.

```sh
npm ci
npm test
npx playwright install chromium
npm run test:e2e
npm run dev
npm run deploy
```

`wrangler.jsonc` deploys the `reacji-to` Worker to `reacji.to`. The app key is a Worker secret, never a source file. See [GitHub App setup](docs/github-app.md). Existing secrets survive code deployments.

The organization-owned GitHub App is installed on **only reacji-to/reacji-to-data**, with Contents read/write and Metadata read. Installation scope and token access were verified on October 18, 2026. A live reaction commit through the extension still needs verification. `/health` reports credential presence, not installation access or a verified live write.

## Storage and authorization

The Worker verifies the user’s GitHub OAuth token against `/user`. Public targets are pinned to numeric repository ID `1424709515`. Private targets must remain private, personally owned by the user, and writable through that user’s app authorization.

Installation tokens are narrowed to exactly one repository with Contents write. Public writes atomically commit a post/page file and the actor’s profile index using the Git Data API. Private writes use SHA-conditional file updates. A Durable Object serializes writes per repository, rate limits to 30 per actor/repo/minute, and retains idempotency receipts for 24 hours. It stores timestamps and counters, not reaction documents or tokens.

Webpage files contain placements with validated element paths, excerpts, and relative coordinates. URLs must be ordinary HTTP/HTTPS URLs whose SHA-256 matches the document identity. The Worker never fetches those URLs. Public profiles render escaped, validated data only. Private data never enters public profile indexes.

The website serves its own logo and OFL-licensed Geist fonts, with no third-party font requests. The interactive landing-page trial uses the same reaction engine as the extension. It saves only to localStorage and posts nothing to GitHub.

## Shared contract

`shared/` is a snapshot of the extension’s validation/data modules and logo. Export deliberately from the extension repo with:

```sh
node scripts/export-web-core.mjs ../reacji-to-web
```

`shared/ORIGIN.json` records the source commit and SHA-256 hashes. After exporting, run `npm run build:assets`, tests, and a dry-run deployment. Do not edit generated shared files independently.

Tests mock writes and cover permission narrowing, identity matching, conflict recovery, atomic profiles, web placements, and safe public rendering. No test submits reactions on real social posts.

## Shared reaction UI and local preview

Run `npm run preview` and open http://127.0.0.1:4173. Hold down Option (Alt on Windows/Linux) and click content, or use the example-post eyes buttons. The preview watches the sibling extension’s source imports, rebuilds the trial bundle, and restarts the server automatically; refresh the page after an edit.

`../devnull/src/reaction-app.js` owns all reaction behavior. The extension entry point passes its runtime; this site's `demo/page-entry.js` passes a browser-local runtime and sample-post discovery. `demo/showcase.js` only drives the example presentation. There is no second picker implementation.

`npm run build:page-demo` refreshes the bundle and `shared/extension/` snapshot. `npm run check:shared` verifies every imported source file and the resulting bundle. It runs before browser tests and deployment. Without the sibling extension checkout, builds use the tracked snapshot, so CI and deployments are self-contained. Set `REACJI_EXTENSION_SOURCE` to use another extension `src` directory. Never edit generated sources directly; see AGENTS.md in both repositories.
