export const setupPrompt = 'Use https://github.com/reacji-to/reacji-to/blob/main/SETUP.md to set up reacji.to.';

export const setup = `<section class="agent-setup" aria-label="Set up with your agent"><div class="agent-setup-inner">
<p>Give this to your agent to get set up with reacji.to:</p>
<div class="agent-command"><code id="setup-prompt">${setupPrompt}</code><button type="button" class="copy-setup" aria-label="Copy setup instructions">Copy</button></div>
<p class="setup-status" role="status" aria-live="polite"></p>
</div></section>`;

export const setupStyles = `
.agent-setup{background:#e9eef8;color:#253353}
.agent-setup-inner{max-width:1120px;margin:auto;padding:16px 24px 18px}
.agent-setup p:first-child{font-size:13px;font-weight:700;line-height:1.5;margin:0 0 9px;max-width:none}
.agent-command{display:flex;align-items:stretch;gap:10px}
.agent-command code{flex:1;min-width:0;display:block;padding:12px 14px;border:0;border-radius:4px;background:#fff;font:13px/1.65 ui-monospace,SFMono-Regular,Consolas,monospace;overflow-wrap:anywhere;user-select:all;color:#202736}
.copy-setup{flex:none;font-family:inherit;font-size:13px;font-weight:700;padding:10px 20px;min-height:44px;background:#d6e0f3;color:#202736;border:0;border-radius:4px}
.copy-setup:hover{background:#c6d5ef}
.agent-setup .setup-status{font-size:12px;line-height:1.5;margin:6px 0 0;max-width:none}.agent-setup .setup-status:empty{display:none}
@media(max-width:500px){.agent-setup-inner{padding:14px 20px}.agent-command{gap:8px}.agent-command code{font-size:12px;padding:10px}.copy-setup{padding:8px 12px}}
@media(prefers-color-scheme:dark){.agent-setup{background:#1e293e;color:#d4e0fc;border-color:#354560}.agent-command code{background:#151d2c;color:#d4e0fc;border-color:#465978}.copy-setup{background:#7c9cff;color:#111d3d;border-color:#7c9cff}.copy-setup:hover{background:#aac0ff}}
`;

function wireSetupCopy() {
  const button = document.querySelector('.copy-setup');
  const prompt = document.querySelector('#setup-prompt');
  const status = document.querySelector('.setup-status');
  if (!button || !prompt || !status) return;
  button.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(prompt.textContent);
      button.textContent = 'Copied!';
      status.textContent = '';
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
