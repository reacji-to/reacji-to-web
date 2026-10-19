# Shared reaction UI — required

The extension repository (`../devnull`, GitHub `reacji-to/reacji-to`) owns the reaction implementation. `src/reaction-app.js` is the engine; `src/content.js` is only the extension entry point. The website imports that engine through `demo/page-entry.js`.

- Never implement or copy a second picker, shortcut, chip renderer, placement resolver, drag interaction, or reaction controller in website code. Change the extension source, then rebuild the website.
- `demo/browser-api.js` adapts storage to browser-local trial data; `demo/samples.js` identifies the example posts; `demo/showcase.js` controls presentation timing only. Keep all reaction behavior in the shared engine.
- Run `npm run build:page-demo` after any extension reaction change. It bundles the extension import graph and refreshes the tracked `shared/extension/` source snapshot and hashes. Do not hand-edit that snapshot or `worker/page-demo.js`.
- Run `npm run check:shared` and the relevant browser tests before handing off, committing, or deploying. The check must pass. When the sibling extension checkout is available it checks against that source too; CI checks the committed snapshot and bundle.
- Use `npm run preview` for local review. It watches extension dependencies and rebuilds/restarts the loopback server automatically. Refresh the browser after edits. `REACJI_EXTENSION_SOURCE` can point the build CLI at a different extension `src` directory.
- Commit the refreshed shared snapshot, its ORIGIN.json, and generated bundle with website changes. If changing the extension in another checkout, also update the website checkout before calling the work complete.
- Website trial saves stay in localStorage. Never wire this demo to real GitHub writes or credentials just to match the extension UI.

Page placement uses hold-down Option (Alt on Windows/Linux) plus click on both surfaces. Do not reintroduce a reaction context menu. Existing eyes buttons beside posts stay available.
