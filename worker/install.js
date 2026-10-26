import { setup, setupScript, setupPrompt } from './setup.js';

export const installStyles = `
.install-body{height:auto;min-height:100dvh;overflow:auto;background:#fcfcfd}
.install-body main{max-width:1120px;padding-top:38px;padding-bottom:96px}
.install-page{--guide-line:#e3e7ee;--guide-wash:#f5f7fa;--guide-accent:#335d10;max-width:1040px;margin:auto;color:var(--ink)}
.install-hero{max-width:820px;padding:20px 0 44px}.install-kicker{margin:0 0 12px;color:var(--guide-accent);font-size:13px;font-weight:800;letter-spacing:.08em;text-transform:uppercase}
.install-page h1{font:800 clamp(42px,7vw,72px)/.98 Manrope,system-ui,sans-serif;letter-spacing:-.055em;margin:0 0 22px;max-width:12ch}
.install-lede{font-size:20px;line-height:1.55;color:var(--ink-soft);max-width:710px;margin:0 0 34px}
.install-disclaimer{font-size:13px;font-weight:650;color:var(--muted);margin:-18px 0 34px}.install-disclaimer a{color:var(--ink);font-weight:750}
.install-page .agent-setup{max-width:820px}.install-page .agent-label{font-size:14px}
.install-layout{display:grid;grid-template-columns:220px minmax(0,720px);gap:72px;align-items:start}
.install-toc{display:block;position:sticky;top:24px;padding:18px 0;border-top:1px solid var(--guide-line);border-bottom:1px solid var(--guide-line)}
.install-toc strong{display:block;font-size:12px;letter-spacing:.08em;text-transform:uppercase;margin-bottom:10px}.install-toc a{display:block;padding:5px 0;color:var(--ink-soft);font-size:13px;line-height:1.35;text-decoration:none}.install-toc a:hover{color:var(--ink)}
.install-content section{scroll-margin-top:24px;padding:0 0 46px;margin:0 0 46px;border-bottom:1px solid var(--guide-line)}.install-content section:last-child{border-bottom:0;margin-bottom:0}
.install-page h2{font:780 clamp(25px,3vw,34px)/1.15 Manrope,system-ui,sans-serif;letter-spacing:-.035em;margin:0 0 16px}.install-page h3{font:750 18px/1.3 Manrope,system-ui,sans-serif;letter-spacing:-.015em;margin:28px 0 9px}
.install-page p,.install-page li,.install-page td,.install-page th{color:var(--ink-soft)}.install-page p{margin:0 0 15px}.install-page strong{color:var(--ink)}.install-page a{font-weight:650}
.install-page ol,.install-page ul{padding-left:22px;margin:12px 0 18px}.install-page li{margin:9px 0;padding-left:4px}.install-page code{font:12.5px/1.5 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;background:var(--guide-wash);border:1px solid var(--guide-line);border-radius:5px;padding:2px 5px;color:var(--ink)}
.guide-callout{margin:22px 0;padding:18px 20px;border-radius:14px;background:var(--guide-wash);border:1px solid var(--guide-line)}.guide-callout p:last-child{margin-bottom:0}.guide-callout strong:first-child{display:block;margin-bottom:4px}
.guide-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px;margin:20px 0}.guide-card{padding:18px;border:1px solid var(--guide-line);border-radius:14px}.guide-card h3{margin:0 0 7px;font-size:16px}.guide-card p{font-size:14px;line-height:1.55;margin:0}
.guide-table{width:100%;border-collapse:collapse;margin:18px 0 22px;font-size:14px}.guide-table th{text-align:left;font-weight:750;color:var(--ink);border-bottom:1px solid var(--guide-line);padding:10px 12px}.guide-table td{border-bottom:1px solid var(--guide-line);padding:11px 12px;vertical-align:top}.guide-table td:first-child{white-space:nowrap;color:var(--ink);font-weight:650}
.decision-list{list-style:none;padding:0!important}.decision-list li{position:relative;padding:14px 16px 14px 44px;margin:10px 0;border:1px solid var(--guide-line);border-radius:12px}.decision-list li:before{content:'□';position:absolute;left:16px;top:12px;color:var(--guide-accent);font-size:20px}
.status-pill{display:inline-flex;align-items:center;gap:7px;padding:5px 10px;border-radius:999px;background:#eef6e7;color:#335d10;font-size:12px;font-weight:750;margin:0 0 12px}.status-pill:before{content:'';width:7px;height:7px;border-radius:50%;background:#5f9f28}
@media(prefers-color-scheme:dark){.install-body{background:#111318}.install-page{--guide-line:#30343b;--guide-wash:#191c21;--guide-accent:#b8e986}.status-pill{background:#1e2a18;color:#b8e986}.status-pill:before{background:#8fcf57}}
@media(max-width:820px){.install-body main{padding-top:24px;padding-bottom:64px}.install-layout{display:block}.install-toc{position:static;margin:0 0 48px;columns:2;column-gap:24px}.install-toc strong{column-span:all}.install-toc a{break-inside:avoid}.guide-grid{grid-template-columns:1fr}}
@media(max-width:500px){.install-page h1{font-size:42px}.install-lede{font-size:18px}.install-toc{columns:1}.guide-table{display:block;overflow-x:auto}.install-page .agent-label{display:block}}
`;

const toc = [
  ['quick-start', 'Quick start'], ['before', 'Before you install'], ['use', 'Using reacji.to'],
  ['names', 'Emoji names'], ['privacy', 'Privacy and local storage'], ['backup', 'Private backup'],
  ['actions', 'Emoji actions'], ['updates', 'Updates and migration'], ['troubleshooting', 'Troubleshooting'],
  ['agent', 'Agent checklist'], ['decisions', 'Things to decide'],
].map(([id, label]) => `<a href="#${id}">${label}</a>`).join('');

export const install = `<article class="install-page">
<div class="install-hero"><p class="install-kicker">Installation &amp; configuration guide</p><h1>Make reacji.to work your way.</h1>
<p class="install-lede">Install the extension, give your emoji names you remember, and add only the private backup or per-emoji actions you actually want. Everything begins private and local.</p>
<p class="install-disclaimer">Written by AI for AI, human content is on <a href="/">reacji.to</a></p>
<p><a href="/install/agent.txt" type="text/plain">Read as plain text</a></p>
${setup}</div>
<div class="install-layout"><nav class="install-toc" aria-label="On this page"><strong>On this page</strong>${toc}</nav><div class="install-content">

<section id="quick-start"><h2>Quick start</h2><ol>
<li>Open the <a href="https://github.com/reacji-to/reacji-to/releases/latest">latest reacji.to release</a>, download the extension ZIP, and extract it to a folder you will keep.</li>
<li>Open your browser’s extensions page, enable developer mode, choose <strong>Load unpacked</strong>, and select the extracted folder.</li>
<li>Pin reacji.to if you want quick access to settings. Reload any pages that were already open.</li>
<li>On a normal webpage, hold <strong>Option</strong> on macOS or <strong>Alt</strong> on Windows and Linux, then click text or a post. The emoji picker opens ready for typing.</li>
<li>Choose an emoji. Revisit the page and confirm the reaction reappears in the same place.</li></ol>
<div class="guide-callout"><strong>Want an agent to do the setup?</strong><p>Copy the instruction at the top of this page. The agent should inspect your current installation first, preserve your local data, and ask only for choices it cannot infer.</p></div></section>

<section id="before"><h2>Before you install</h2><p>Choose the browser profile where you do your everyday work. Extension storage belongs to that browser profile, so a work profile and a personal profile have separate reactions, labels, and actions.</p>
<div class="guide-grid"><div class="guide-card"><h3>Pick a permanent folder</h3><p>Developer-mode browsers load the extension from the extracted folder. Moving or deleting that folder disables the installation until you load it again.</p></div><div class="guide-card"><h3>Preserve an existing setup</h3><p>If reacji.to is already installed, update that installation instead of removing it. Removing an unpacked extension can also remove its local browser storage.</p></div><div class="guide-card"><h3>Know the page limits</h3><p>Browser settings, extension galleries, PDF viewers, and some protected pages do not allow extensions to modify their content.</p></div><div class="guide-card"><h3>Start with one browser</h3><p>Test the workflow in one profile before repeating it elsewhere. Each separate installation has its own local data unless you deliberately restore a backup.</p></div></div>
<p>reacji.to allows <strong>one reaction per target</strong>. Choosing a new emoji replaces the existing one for that passage or post. Removing a reaction removes the local marker; it does not reverse an external action that already ran.</p></section>

<section id="use"><h2>Using reacji.to</h2><h3>React to anything on a page</h3><p>Hold Option or Alt and click the content you want to mark. Start typing as soon as the picker appears. Search accepts emoji, standard emoji names, and your own labels. Use the arrow keys to move, Return to choose, and Escape to close.</p>
<h3>React to a post</h3><p>On supported social or feed layouts, click the eyes beside the post. The control is styled to sit with the page’s native actions. Your reaction occupies the same action slot, so changing it does not shift the surrounding controls.</p>
<h3>Change or remove a reaction</h3><p>Open the existing reaction to choose a replacement, or use its remove control to clear it. A page redesign can prevent a saved target from matching temporarily; the saved reaction may still exist locally even when its marker is hidden.</p>
<div class="guide-callout"><strong>What is saved</strong><p>A webpage reaction can include the page URL, placement information, and a short visible excerpt. This lets the extension find the same content when you return. Form values are excluded.</p></div></section>

<section id="names"><h2>Name the emoji you use</h2><p>Labels turn your own words into fast emoji shortcuts. In extension settings, add a name and the emoji it should suggest. The picker then autocompletes the emoji as soon as you type that name.</p>
<table class="guide-table"><thead><tr><th>Label</th><th>Emoji</th><th>Possible meaning</th></tr></thead><tbody><tr><td>design</td><td>🎨</td><td>Visual review, polish, or design work</td></tr><tr><td>read</td><td>📚</td><td>Return to this when there is time to read</td></tr><tr><td>question</td><td>❓</td><td>Something to clarify or investigate</td></tr><tr><td>ship</td><td>🚀</td><td>Ready to release or trigger a shipping action</td></tr><tr><td>important</td><td>⭐</td><td>A durable favorite or priority item</td></tr></tbody></table>
<p>Use short, distinct names. Add multiple labels to the same emoji when that matches how you think, such as <code>design</code> and <code>visual</code> for 🎨. Avoid giving the same label to different emoji because the first match will feel unpredictable.</p>
<p>Labels are categories only in your vocabulary. Services such as Raycast are configured as actions on a particular emoji; they do not appear as picker categories.</p></section>

<section id="privacy"><h2>Privacy and local storage</h2><p><span class="status-pill">Private and local by default</span></p><p>Reactions, emoji labels, and Raycast mappings stay in this browser’s extension storage. The public extension does not publish a profile or share your reaction feed.</p>
<h3>What “local” means</h3><ul><li>Another browser, profile, or computer cannot see the data automatically.</li><li>Browser sync should not be treated as a backup unless you have verified it for this exact extension installation.</li><li>Private or incognito windows may have separate access rules and can clear data differently.</li><li>Resetting the browser profile or removing the unpacked extension can destroy local data.</li></ul>
<h3>Content sensitivity</h3><p>The stored excerpt may contain text from the page you marked. Before reacting to confidential material, consider whether the browser profile, computer account, and any optional backup are appropriate places for that text.</p>
<p>No external connection is required for ordinary reactions. Configure a service only when its behavior is useful and you understand what that specific action sends.</p></section>

<section id="backup"><h2>Optional private backup</h2><p>A private GitHub repository can protect against losing browser storage and give you version history. It is optional; local reactions continue to work when the backup is unavailable.</p>
<ol><li>Create a dedicated <strong>private</strong> repository, or choose an existing private repository used only for this data.</li><li>In extension settings, connect GitHub and grant the reacji.to GitHub App access to <strong>only that repository</strong>.</li><li>Select the repository, save the setting, create or change a test reaction, and confirm a backup commit appears.</li><li>Keep the local browser as the working copy. Treat the repository as recovery data, not a public feed.</li></ol>
<h3>Things to consider</h3><ul><li>Repository owners and collaborators can read the backed-up URLs, excerpts, emoji, and history.</li><li>Deleting a value in the latest file does not erase it from Git history.</li><li>Organization repositories may apply retention, audit, or access policies beyond reacji.to.</li><li>If access expires or the repository is renamed, local saves should continue but backup attempts can fail until reconfigured.</li></ul>
<div class="guide-callout"><strong>Public sharing is currently off</strong><p>The supported setup is local storage with an optional private repository. Do not make the backup repository public unless you deliberately want its contents exposed.</p></div></section>

<section id="actions"><h2>Optional emoji actions</h2><p>An action runs when you choose its mapped emoji. Configure actions one emoji at a time, test them with non-sensitive content, and remember that removing a reaction later does not undo what the action already did.</p>
<h3>Raycast</h3><ol><li>In Raycast, choose the command you want, open its action panel, and copy its deeplink.</li><li>In reacji.to settings, add the reaction emoji, a clear action name, and the deeplink.</li><li>Use that emoji on a test page. Your browser or Raycast may ask before opening the command.</li></ol>
<p>Deeplink arguments are passed exactly as saved. Check whether the Raycast command writes files, sends messages, or changes external data before attaching it to a frequently used emoji.</p>
<h3>Slack</h3><p>Slack actions are experimental and are <strong>not included in the public release</strong>. If you are testing a separate development branch, restrict the Slack app to <code>emoji:read</code> and an incoming webhook for one chosen channel. Page titles, links, and a short visible excerpt can be sent to that channel. Keep that branch and its backend separate from the public extension until it is reviewed for release.</p>
<h3>Adding another action</h3><p>Define the exact emoji, destination, data sent, credentials used, and failure behavior. Prefer the smallest permissions and a single-purpose destination. The default should remain a local save when the external service is unavailable.</p></section>

<section id="updates"><h2>Updates and migration</h2><p>For an unpacked installation, download the new release into the same permanent folder or replace its files, then use <strong>Reload</strong> on the browser’s extensions page. Reload open webpages so their content script matches the updated background process.</p>
<ul><li>Check your emoji labels and actions after a major update.</li><li>Create a private backup before moving to a new computer or browser profile.</li><li>Keep the old profile intact until the new installation shows the expected reactions.</li><li>If the browser assigns a different extension identity, local storage may not follow automatically.</li></ul>
<p>When handing an update to an agent, ask it to inspect the installed version and existing folder before changing anything. It should verify a saved reaction, a custom label, and every configured action afterward.</p></section>

<section id="troubleshooting"><h2>Troubleshooting</h2><table class="guide-table"><thead><tr><th>Problem</th><th>What to check</th></tr></thead><tbody>
<tr><td>The eyes do not appear</td><td>Reload the page after installing or reloading the extension. Confirm the page is not a protected browser page and that the extension is enabled for the site.</td></tr>
<tr><td>Option-click does nothing</td><td>Try regular page text, release other modifier keys, and check whether the operating system or another extension has captured the shortcut.</td></tr>
<tr><td>A reaction disappeared</td><td>Confirm you are in the same browser profile and at the same URL. The page may have changed enough that its saved placement no longer matches.</td></tr>
<tr><td>A label is not suggested</td><td>Check spelling and saved settings, then reopen the picker. Use distinct labels and verify the emoji field contains the intended emoji.</td></tr>
<tr><td>Raycast does not open</td><td>Test the deeplink directly, confirm Raycast is installed, and allow the browser’s external-app prompt. Then verify the mapping uses the same emoji you selected.</td></tr>
<tr><td>Private backup stopped</td><td>Confirm GitHub authorization, repository access, repository name, and privacy. Make a test reaction and inspect both extension status and repository history.</td></tr>
<tr><td>Data is missing after reinstall</td><td>Do not remove the old profile. Re-enable the original unpacked folder if possible, or restore from the private repository after verifying its contents.</td></tr></tbody></table></section>

<section id="agent"><h2>What your agent should verify</h2><ol><li>Find the existing extension installation and preserve its browser profile and storage.</li><li>Install or update from the official reacji.to release and reload open pages.</li><li>Keep all reactions private and local unless you explicitly ask for a private backup.</li><li>Add the emoji labels you choose and test autocomplete from the picker’s initial focus.</li><li>Configure only the per-emoji actions you name. Do not enable Slack, Raycast, or another service by assumption.</li><li>For a private backup, use a dedicated private repository and the narrowest repository access.</li><li>Test one ordinary reaction, one named emoji, the private backup if selected, and each selected emoji action.</li><li>Report what was changed, where data is stored, and any step that still needs your browser approval.</li></ol></section>

<section id="decisions"><h2>Things to decide</h2><p>You do not need every option. Make the smallest setup that matches how you work.</p><ul class="decision-list"><li><strong>Which browser profile?</strong> Choose the profile where the reactions should live.</li><li><strong>Which emoji vocabulary?</strong> List the labels you will remember and the emoji each should suggest.</li><li><strong>Do you need recovery?</strong> If yes, choose a dedicated private GitHub repository and its allowed collaborators.</li><li><strong>Which emoji should trigger actions?</strong> Name the exact emoji and what each action may do.</li><li><strong>What content is too sensitive?</strong> Decide where you will avoid storing page excerpts or sending them to services.</li><li><strong>How will you verify updates?</strong> Keep a small test page, label, and action you can check after every update.</li></ul>
<div class="guide-callout"><strong>A complete basic setup is intentionally small.</strong><p>One browser profile, a permanent extension folder, a few memorable emoji labels, and a successful local reaction are enough. Add backup or actions only when you want them.</p></div></section>

</div></div></article><script src="/install.js" defer></script>`;

export const installScript = setupScript;

// Keep both formats on the same guide, following Posthole's /install/agent.txt pattern.
export const installText = install
  .replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, '')
  .replace(/<nav\b[^>]*>[\s\S]*?<\/nav>/g, '')
  .replace(/<section class="agent-setup"[\s\S]*?<\/section>/g, `\n\nGive this to your agent:\n${setupPrompt}\n\n`)
  .replace(/<p><a href="\/install\/agent\.txt"[^>]*>Read as plain text<\/a><\/p>/g, '')
  .replace(/<h([123])\b[^>]*>([\s\S]*?)<\/h\1>/g, (_, level, text) => `\n\n${'#'.repeat(Number(level))} ${text}\n\n`)
  .replace(/<a\b[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g, (_, href, text) => `${text} (${new URL(href, 'https://reacji.to').href})`)
  .replace(/<li\b[^>]*>/g, '\n- ')
  .replace(/<p\b[^>]*>/g, '\n\n')
  .replace(/<tr\b[^>]*>/g, '\n| ')
  .replace(/<\/(?:td|th)>/g, ' | ')
  .replace(/<\/(?:p|ol|ul|section|div|table)>/g, '\n\n')
  .replace(/<[^>]*>/g, '')
  .replace(/&(amp|lt|gt|quot|#39);/g, (_, entity) => ({ amp: '&', lt: '<', gt: '>', quot: '"', '#39': "'" }[entity]))
  .replace(/[ \t]+\n/g, '\n')
  .replace(/\n{3,}/g, '\n\n')
  .trim() + '\n';
