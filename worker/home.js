import { setupStyles } from './setup.js';
import { demo, demoStyles } from './home-demo.js';
import { SOURCE_REPOSITORY } from '../shared/config.js';

export const homeStyles = `
@font-face{font-family:Manrope;src:url('/manrope-latin.woff2') format('woff2');font-style:normal;font-weight:400 800;font-display:swap}
@font-face{font-family:Geist;src:url('/geist-400.woff2') format('woff2');font-style:normal;font-weight:400;font-display:swap}
@font-face{font-family:Geist;src:url('/geist-600.woff2') format('woff2');font-style:normal;font-weight:600 800;font-display:swap}
.home{--bg:#f7f8fa;--ink:#202736;--muted:#586174;--surface:#fff;--line:#dde1e9;--accent:#245bdc;--wash:#e9eef8;background:var(--bg);color:var(--ink);font-family:Manrope,system-ui,sans-serif}
.home ::selection{background:#dce5ff;color:#17294f}.home header,.home main,.home footer{max-width:1120px}
.home header{border:0;padding-top:28px;padding-bottom:28px}.home header .brand img{width:44px;height:44px}.home header .brand{font-size:26px;font-weight:800;letter-spacing:-.04em}.home .header-links a{font-weight:600;font-size:13px}
.home main{padding-top:20px}.hero{display:grid;grid-template-columns:1fr 1.1fr;align-items:start;gap:56px;padding:20px 0 64px}
.hero h1{font:800 clamp(30px,3.8vw,51px)/1.12 Manrope,system-ui,sans-serif;letter-spacing:-.04em;margin:0 0 28px;white-space:nowrap}
.hero-copy>p{font-size:17px;line-height:1.6;max-width:460px;color:var(--ink);margin:0 0 24px;text-wrap:pretty}
.hero-copy .hero-promise{font-size:27px;line-height:1.35;color:var(--ink);letter-spacing:-.025em;margin:0 0 24px}.hero-promise strong{font-weight:750}.hero-promise em{font-style:normal;color:inherit}
.hero .cta{padding:15px 24px;margin:0 0 32px;font-size:16px;font-weight:700;background:var(--accent);color:white;border-radius:4px}.hero .cta:hover{background:#1648ba;color:white}
.hero-details{padding-top:0}.hero .hero-details p{font-size:16px;line-height:1.65;color:var(--ink);margin:0 0 20px;text-wrap:pretty}.hero-details strong{font-weight:700;color:var(--ink)}
.hero .uses-label{font-size:13px;font-weight:700;color:var(--ink);margin:22px 0 8px}.hero-uses{list-style:none;padding:0;margin:0;display:flex;flex-wrap:wrap;gap:6px 16px;color:var(--ink);font-size:14px;line-height:1.8}.hero-uses li:last-child{font-style:italic}
.demo-column{min-width:0}.try-site{margin:24px 0 0;padding:24px;background:var(--wash);color:var(--ink);border-radius:4px}.try-site h2{font-size:24px;line-height:1.25;letter-spacing:-.025em;font-weight:800;margin:0 0 10px}.try-site p{margin:0;font-size:16px;line-height:1.65;max-width:34ch}.try-site small{display:block;margin-top:10px;font-size:12px;color:var(--muted)}
.home footer{font-size:13px;border:0;padding-top:24px;padding-bottom:32px}.home footer p{margin:0}.home .foot-links{gap:16px}
@media(max-width:800px){.home main{padding-top:0}.hero{display:flex;flex-direction:column;gap:0;padding:16px 0 32px}.hero-copy{display:contents}.hero h1{font-size:clamp(24px,7.7vw,48px)}.hero-copy>p{max-width:600px}.hero-copy .hero-promise{font-size:24px;max-width:550px}.hero .cta{margin-bottom:24px}.hero-details{max-width:600px;width:100%;order:2;margin:36px auto 0}.demo-column{max-width:600px;width:100%;margin:12px auto 0;order:1}.hero .cta{align-self:flex-start}.home header .brand{font-size:23px}.home header .brand img{width:40px;height:40px}}
@media(prefers-color-scheme:dark){.home{--bg:#171a21;--ink:#edf0f7;--muted:#b2bdcf;--surface:#202631;--line:#364054;--accent:#9ab4ff;--wash:#242f45}.hero .cta{background:#7c9cff;color:#111d3d}.hero .cta:hover{background:#aac0ff;color:#111d3d}}
.home :is(.cta,.copy-setup,.header-links a,.foot-links a){transition:transform 160ms ease,opacity 160ms ease}.home :is(.cta,.copy-setup):active{transform:translateY(2px)}.home :is(.header-links a,.foot-links a):hover{opacity:.7}.home :is(a,button):focus-visible{outline:3px solid var(--accent);outline-offset:4px}
@media(prefers-reduced-motion:no-preference){.hero h1,.hero-promise,.hero-copy>p:not(.hero-promise),.hero .cta,.demo-column{animation:home-enter 480ms cubic-bezier(.16,1,.3,1) both}.hero-promise{animation-delay:50ms}.hero-copy>p:not(.hero-promise){animation-delay:90ms}.hero .cta{animation-delay:130ms}.demo-column{animation-delay:170ms}@keyframes home-enter{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}}
${demoStyles}
${setupStyles}
`;

export const home = `<section class="hero"><div class="hero-copy"><h1>React to anything</h1><p class="hero-promise"><strong>Now you can react to <em>any post anywhere</em> with any emoji you want.</strong></p><p>You know how you can choose any reaction emoji you want in Slack, but most sites only give you a thumb or a star or whatever?</p><a class="cta" href="https://github.com/${SOURCE_REPOSITORY}/releases/latest">Get reacji.to ↗</a><div class="hero-details"><p>And, you can set it up so that <strong>things actually happen</strong> depending on which emoji you use, also just like in Slack!</p><p>Actually, you can stick reacji <strong>anywhere on the web</strong>, on any part of any page.</p><p>You can make them <strong>public</strong>, and other users will see how you reacted, or you can make them <strong>private</strong>. Public ones get committed in our public GitHub repo; private ones go in a private repo of your choosing.</p><p class="uses-label">Potential uses:</p><ul class="hero-uses"><li>bookmarking</li><li>triggering agents</li><li>snark</li><li>whatever you can dream up</li></ul></div></div><div class="demo-column">${demo}<aside class="try-site"><h2>Try it on this site!</h2><p>Hold down <strong>Option</strong> for the blue eyes, then click anywhere on this page to react.</p><small>Use Alt on Windows/Linux. Demo reactions stay in this browser.</small></aside></div></section>
<script src="/home-demo.js" defer></script><script src="/page-demo.js" defer></script>`;
