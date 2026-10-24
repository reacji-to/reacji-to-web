import { setup, setupStyles, setupScript } from './setup.js';
import { demo, demoStyles } from './home-demo.js';
import { eyesStyles, eyesScript } from './eyes.js';
import { SOURCE_REPOSITORY } from '../shared/config.js';

// One screen: header, a two-column hero, and a one-line footer. The browser demo absorbs
// leftover height and scrolls inside its own viewport. Very short screens fall back to page scroll.
export const homeStyles = `
@font-face{font-family:Manrope;src:url('/manrope-latin.woff2') format('woff2');font-style:normal;font-weight:400 800;font-display:swap}
@font-face{font-family:Geist;src:url('/geist-400.woff2') format('woff2');font-style:normal;font-weight:400;font-display:swap}
@font-face{font-family:Geist;src:url('/geist-600.woff2') format('woff2');font-style:normal;font-weight:600 800;font-display:swap}
.home{--bg:#fcfcfd;--ink:#14161b;--ink-soft:#3c424e;--muted:#646b78;--surface:#fff;--line:#e7e9ee;--accent:#2456e8;--accent-hover:#1a44c6;--wash:#f1f3f7;--code-bg:#f6f7fa;--code-ink:#3c424e;background:var(--bg);color:var(--ink);font-family:Manrope,system-ui,sans-serif;height:100vh;height:100dvh;display:flex;flex-direction:column;overflow:hidden}
.home ::selection{background:#d6e1ff;color:#0e1a3d}
.home header,.home main,.home footer{width:100%;max-width:1320px;margin:0 auto;padding-inline:40px}
.home header{flex:none;border:0;padding-top:18px;padding-bottom:6px}
.home .brand{gap:10px;font-size:25px;font-weight:800;letter-spacing:-.035em}.home .brand:hover{color:inherit}
.home .header-links a{display:grid;place-items:center;width:40px;height:40px;border-radius:10px;color:var(--ink-soft);transition:background-color 160ms ease,color 160ms ease}.home .header-links a:hover{background:var(--wash);color:var(--ink)}.home .header-links .github-mark{width:22px;height:22px}
.home main{flex:1;min-height:0;padding-top:8px;padding-bottom:8px}
.hero{display:grid;grid-template-columns:minmax(320px,1fr) minmax(0,1.25fr);gap:clamp(36px,5vw,80px);align-items:center;height:100%}
.hero-copy{max-width:520px}
.hero h1{font:800 clamp(42px,4.7vw,66px)/1.02 Manrope,system-ui,sans-serif;letter-spacing:-.04em;margin:0 0 18px;text-wrap:balance}
.hero-copy .hero-promise{font-size:clamp(18px,1.5vw,21px);line-height:1.45;font-weight:500;color:var(--ink-soft);letter-spacing:-.01em;margin:0 0 36px;max-width:28ch;text-wrap:balance}
.install-alt{margin:16px 0 0;font-size:14px;line-height:1.5;color:var(--muted)}
.hero .cta{display:inline;margin:0;padding:0;background:none;color:var(--ink);font-weight:700;border-radius:0;text-decoration:underline;text-decoration-color:var(--line);text-decoration-thickness:2px;text-underline-offset:4px;transition:text-decoration-color 160ms ease}
.hero .cta:hover{background:none;color:var(--ink);text-decoration-color:var(--accent)}
.browser-link{color:inherit;text-decoration:underline;text-decoration-color:var(--line);text-underline-offset:3px;transition:text-decoration-color 160ms ease,color 160ms ease}.browser-link:hover{color:var(--ink);text-decoration-color:var(--accent)}
.try-site{display:flex;align-items:center;gap:14px;margin-top:36px;padding-top:24px;border-top:1px solid var(--line)}
.try-site p{margin:0;font-size:15px;line-height:1.45;color:var(--ink)}.try-site small{display:block;font-size:12.5px;color:var(--muted)}
.try-key{display:grid;place-items:center;flex:none;min-width:52px;height:46px;padding:0 10px;border-radius:10px;background:var(--surface);color:var(--ink);font:600 22px/1 Manrope,system-ui,sans-serif;box-shadow:inset 0 0 0 1px var(--line),0 3px 0 var(--line);transition:transform 90ms ease,box-shadow 90ms ease}
.try-site[data-pressed] .try-key{transform:translateY(3px);box-shadow:inset 0 0 0 1px var(--accent),0 0 0 var(--line);color:var(--accent)}
.try-site kbd{font:inherit;font-weight:700}
.try-touch{display:none}
.demo-column{position:relative;height:100%;min-height:0;display:flex;align-items:center;padding-block:4px}
.home footer{flex:none;border:0;padding-top:8px;padding-bottom:16px;font-size:12.5px;color:var(--muted)}.home footer p{margin:0}.home .foot-links{gap:16px}.home .foot-links a{text-decoration:none}.home .foot-links a:hover{color:var(--ink)}
.home :is(a,button):focus-visible{outline:3px solid var(--accent);outline-offset:3px}
${eyesStyles}
${demoStyles}
${setupStyles}
@media(max-width:1100px) and (min-width:801px){.home header,.home main,.home footer{padding-inline:28px}.hero{grid-template-columns:minmax(300px,.9fr) minmax(0,1.1fr);gap:36px}.hero h1{font-size:clamp(38px,4.8vw,50px)}.hero-copy .hero-promise{margin-bottom:28px}.try-site{margin-top:28px;padding-top:20px}}
@media(max-width:800px){
.home header,.home main,.home footer{padding-inline:16px}
.home header{padding-top:10px;padding-bottom:2px}.home .brand{font-size:22px}.home .eyes{width:50px}
.home main{padding-top:6px;padding-bottom:4px}
.hero{display:flex;flex-direction:column;align-items:stretch;gap:18px}
.hero-copy{flex:none;max-width:none}
.hero h1{font-size:clamp(32px,9.4vw,46px);margin-bottom:8px}
.hero-copy .hero-promise{font-size:16px;margin-bottom:16px;max-width:none}
.agent-label{display:none}
.install-alt{margin-top:10px;font-size:13px}
.try-site{display:none}
.demo-column{flex:1;height:auto;padding:0 0 4px;align-items:stretch}
.home footer{padding-top:4px;padding-bottom:max(10px,env(safe-area-inset-bottom));font-size:12px}
}
@media(max-width:800px) and (max-height:720px){.home .eyes{width:44px}.home .brand{font-size:20px}.hero{gap:14px}.hero h1{font-size:30px}.hero-copy .hero-promise{font-size:15px;margin-bottom:12px}.install-alt{margin-top:8px}}
@media(hover:none){.try-mouse{display:none}.try-touch{display:block}}
@media(min-width:801px) and (max-height:620px),(max-width:800px) and (max-height:600px){.home{height:auto;min-height:100dvh;overflow:visible}.demo-column{height:auto;flex:none}.reaction-demo{height:560px}}
@media(prefers-color-scheme:dark){.home{--bg:#111318;--ink:#eef1f6;--ink-soft:#c3cad6;--muted:#9aa3b2;--surface:#1a1d24;--line:#2b303b;--accent:#6f93ff;--accent-hover:#93afff;--wash:#1c2029;--code-bg:#20242d;--code-ink:#e8ecf5}.home .reaction-demo{box-shadow:0 0 0 1px rgb(255 255 255/.08),0 24px 56px -16px rgb(0 0 0/.6)}}
`;

export const home = `<section class="hero"><div class="hero-copy"><h1>Reacjis, anywhere.</h1><p class="hero-promise">Trigger automations, bookmark things, kick off agents.</p>${setup}<p class="install-alt">Or <a class="cta" href="https://github.com/${SOURCE_REPOSITORY}/releases/latest">download the extension</a> for Chrome and <a class="browser-link" href="https://helium.computer/">Helium</a>.</p><aside class="try-site" aria-label="Try it on this site"><span class="try-key" aria-hidden="true">⌥</span><p class="try-mouse">Hold <kbd class="try-key-name">Option</kbd> and click anything to try it on this site.<small>Your test reactions stay in this browser.</small></p><p class="try-touch">Tap the eyes on a post to try it.</p></aside></div><div class="demo-column">${demo}</div></section>
<script src="/home-demo.js" defer></script><script src="/page-demo.js" defer></script>`;

// Option is Alt outside Apple platforms. The keycap mirrors the real key while it is held.
function wireTryKey() {
  const hint = document.querySelector('.try-site');
  if (!hint) return;
  if (!/mac|iphone|ipad/i.test(navigator.userAgentData?.platform || navigator.platform || '')) {
    hint.querySelector('.try-key').textContent = 'Alt';
    hint.querySelector('.try-key-name').textContent = 'Alt';
  }
  addEventListener('keydown', event => { if (event.key === 'Alt') hint.dataset.pressed = ''; });
  addEventListener('keyup', event => { if (event.key === 'Alt') delete hint.dataset.pressed; });
  addEventListener('blur', () => delete hint.dataset.pressed);
}
export const homeScript = `${setupScript}\n${eyesScript}\n(${wireTryKey.toString()})();`;
