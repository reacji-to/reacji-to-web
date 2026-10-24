export const setupPrompt = 'Set up or change reacji.to for me using https://reacji.to/about. Keep my reactions private and local by default, help me name the emoji I use, and configure only the private backup or emoji actions I ask for.';

export const setup = `<section class="agent-setup" aria-label="Set up with your agent">
<p class="agent-label">Give this to your agent</p>
<div class="agent-command"><code id="setup-prompt" translate="no">${setupPrompt}</code><button type="button" class="copy-setup" aria-label="Copy setup instructions" title="Copy setup instructions"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><g class="copy-glyph"><rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V4a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v11a1 1 0 0 0 1 1h4"/></g><path class="copied-glyph" d="m5 12 4 4L19 6"/></svg></button></div>
<p class="setup-status" role="status" aria-live="polite"></p>
</section>`;

// The one shining element on the page: a slow light sweeping the command's border.
export const setupStyles = `
@property --shine{syntax:'<angle>';inherits:false;initial-value:200deg}
.agent-setup{margin:0}
.agent-label{font-size:13px;font-weight:700;line-height:1.4;margin:0 0 10px;color:var(--ink)}
.agent-command{position:relative;display:flex;align-items:center;gap:12px;padding:7px 7px 7px 18px;border:1.5px solid transparent;border-radius:16px;
background:linear-gradient(var(--code-bg),var(--code-bg)) padding-box,conic-gradient(from var(--shine),#dce2ed,#c9d6f4 30deg,#fff 50deg,#c9d6f4 70deg,#dce2ed 110deg,#e7e9ee 200deg,#dce2ed) border-box;
box-shadow:0 2px 8px rgb(17 24 39/.04);transition:box-shadow 200ms ease}
.agent-command:hover{box-shadow:0 3px 12px rgb(17 24 39/.07)}
.agent-command:before{content:'›';flex:none;align-self:flex-start;margin-top:7px;font:700 18px/1 ui-monospace,SFMono-Regular,Menlo,monospace;color:#8fb0ff}
.agent-command code{flex:1;min-width:0;display:block;padding:7px 0;margin-left:-4px;font:13px/1.6 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;color:var(--code-ink);background:none;overflow-wrap:anywhere;user-select:all}
.copy-setup{flex:none;display:grid;place-items:center;align-self:center;width:44px;height:44px;padding:0;background:transparent;color:var(--muted);border:0;border-radius:10px;cursor:pointer;transition:background-color 160ms ease,color 160ms ease,transform 120ms ease}
.copy-setup:hover{background:var(--wash);color:var(--ink)}.copy-setup:active{transform:scale(.97)}
.copy-setup .copied-glyph,.copy-setup[data-copied] .copy-glyph{display:none}.copy-setup[data-copied] .copied-glyph{display:block}
.agent-setup .setup-status{font-size:12px;line-height:1.5;margin:8px 0 0;color:var(--muted)}.agent-setup .setup-status:empty{display:none}
@media(prefers-reduced-motion:no-preference){.agent-command{animation:shine 7s linear infinite}@keyframes shine{to{--shine:560deg}}}
@media(max-width:500px){.agent-command{gap:8px;padding:5px 5px 5px 14px;border-radius:14px}.agent-command:before{font-size:16px;margin-top:6px}.agent-command code{font-size:12px;line-height:1.5;padding:5px 0}.copy-setup{border-radius:9px}}
`;

function wireSetupCopy() {
  const button = document.querySelector('.copy-setup');
  const prompt = document.querySelector('#setup-prompt');
  const status = document.querySelector('.setup-status');
  if (!button || !prompt || !status) return;
  button.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(prompt.textContent);
      button.dataset.copied = '';
      button.title = 'Copied!';
      status.textContent = 'Copied!';
      setTimeout(() => { delete button.dataset.copied; button.title = 'Copy setup instructions'; if (status.textContent === 'Copied!') status.textContent = ''; }, 2000);
    } catch {
      const range = document.createRange();
      range.selectNodeContents(prompt);
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
      status.textContent = 'Select and copy the instruction above, then paste it into your agent.';
    }
  });
}
export const setupScript = `(${wireSetupCopy.toString()})();`;
