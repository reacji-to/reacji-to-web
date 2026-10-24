import { setup, setupScript } from './setup.js';

export const aboutStyles = `
.about-body{height:auto;min-height:100dvh;overflow:auto}
.about-body main{max-width:860px;padding-top:44px;padding-bottom:72px}
.about-page{max-width:720px;margin:auto}.about-page h1{font:800 clamp(38px,7vw,64px)/1.04 Manrope,system-ui,sans-serif;letter-spacing:-.045em;margin-bottom:18px}
.about-lede{font-size:19px;line-height:1.55;color:var(--ink-soft);margin-bottom:36px}.about-page .agent-setup{margin:28px 0 42px}.about-page .agent-label{font-size:14px}
.about-page h2{font:750 24px/1.2 Manrope,system-ui,sans-serif;letter-spacing:-.02em;margin:38px 0 12px}.about-page p,.about-page li{color:var(--ink-soft)}
.about-page ol,.about-page ul{padding-left:22px}.about-page li{margin:8px 0}.about-page strong{color:var(--ink)}
@media(max-width:800px){.about-body{height:auto;overflow:auto}.about-body main{padding-top:28px;padding-bottom:48px}.about-page .agent-label{display:block}}
`;

export const about = `<article class="about-page">
<h1>Make reacji.to yours.</h1>
<p class="about-lede">Copy one instruction into your agent. It can install the extension, give emoji names you remember, add a private backup, and connect actions to specific emoji.</p>
${setup}
<h2>What your agent should do</h2>
<ol><li><strong>Install or update reacji.to</strong> in your regular Chrome or Helium profile.</li><li><strong>Create your emoji vocabulary</strong>, such as <code>design</code> → 🎨 or <code>read</code> → 📚.</li><li><strong>Keep reactions local</strong> unless you ask for a private GitHub backup.</li><li><strong>Attach actions to emoji</strong>, such as a Raycast command on 🚀, rather than creating service categories in the picker.</li><li><strong>Test the result</strong> by opening the eyes picker, typing the label, and choosing the suggested emoji.</li></ol>
<h2>How it works</h2>
<p>Hold <strong>Option</strong> on macOS or <strong>Alt</strong> on Windows and Linux, then click a post or passage. Start typing immediately. Your one reaction is stored in this browser and returns when you revisit the target.</p>
<p>A private GitHub repository is optional. It gives you recovery and history without publishing reactions.</p>
</article><script src="/about.js" defer></script>`;

export const aboutScript = setupScript;
