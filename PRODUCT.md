# reacji-to website

<!-- impeccable:product-schema 1 -->

## Platform
web

## Users
People discovering the Chrome / Helium extension, and readers of public GitHub-identity reaction profiles.

## Purpose
Explain how to react anywhere on the web, provide the extension download, and show public reactions at /GITHUB_HANDLE.

## Product facts
Users right-click page content, place any Unicode emoji, and choose Public or Private. GitHub device OAuth supplies identity; commits store reactions. Public storage is reacji-to/reacji-to-data; private storage is a private repo selected by its owner. Viewer filtering can show everyone or only dev-null follows. The extension is reacji-to/reacji-to, this website/Worker is reacji-to/reacji-to-web. All three repos use MIT.

## User direction
Use Impeccable to make the homepage nicer and a little more fun. Make the blue-eyes logo bigger. Remove the search box. The approved mark is photorealistic emoji eyes with piercing blue irises on transparency. Preserve Public / Private semantics, GitHub identity, and a clear extension download action.

## Architecture
Cloudflare Worker at reacji.to, server-rendered HTML, script-free landing demo and public profiles. Public profile indexes are keyed by immutable GitHub ID. Backend uses selected-repository GitHub App Contents write and mandatory Metadata read, no Issues. Every reaction change is a Git commit. No arbitrary URL fetching, no private profile leakage.
