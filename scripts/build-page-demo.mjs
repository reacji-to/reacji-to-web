import { build, context } from 'esbuild';
import { readFile, writeFile, mkdir, access } from 'node:fs/promises';
import { resolve, relative, dirname } from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const snapshot = resolve(root, 'shared/extension');
export async function buildPageDemo({ watch = false, check = false, source } = {}) {
  const sibling = resolve(root, '../reactji-to-extension/src');
  if (!source) { try { await access(resolve(sibling, 'reaction-app.js')); source = sibling; } catch { source = snapshot; } }
  source = resolve(source);
  const alias = Object.fromEntries(['reaction-app','web','posts','protocol','emoji-frequency','destinations','destination-registry'].map(name => [`@reacji/${name}`,resolve(source,`${name}.js`)]));
  const output = resolve(root, 'worker/page-demo.js');
  const options = { absWorkingDir: root, entryPoints: ['demo/page-entry.js'], bundle: true, write: false, metafile: true,
    format: 'iife', target: 'chrome120', minify: true, loader: { '.css': 'text' }, alias,
    plugins: [{ name: 'shared-reaction-source', setup(builder) {
      builder.onEnd(async result => {
        if (result.errors.length) return;
        const hashes = {};
        for (const input of Object.keys(result.metafile.inputs).sort()) {
          const path = resolve(root, input), name = relative(source, path);
          if (name.startsWith('..')) continue;
          const contents = await readFile(path);
          hashes[name] = createHash('sha256').update(contents).digest('hex');
          if (!check && source !== snapshot) { await mkdir(dirname(resolve(snapshot,name)), {recursive:true}); await writeFile(resolve(snapshot,name),contents); }
          if (check && source !== snapshot && !contents.equals(await readFile(resolve(snapshot,name)))) throw new Error(`Stale shared source: ${name}. Run npm run build:page-demo.`);
        }
        const manifest = JSON.stringify(hashes, null, 2) + '\n';
        const script = '// Generated from the extension reaction engine. Do not edit.\nexport const pageDemoScript = ' + JSON.stringify(result.outputFiles[0].text) + ';\n';
        if (check) {
          if (await readFile(output,'utf8') !== script || await readFile(resolve(snapshot,'ORIGIN.json'),'utf8') !== manifest) throw new Error('Website reaction bundle is stale. Run npm run build:page-demo.');
          console.log('Shared reaction source and website bundle match.');
        } else {
          await mkdir(snapshot,{recursive:true});
          await writeFile(resolve(snapshot,'ORIGIN.json'),manifest);
          if (await readFile(output,'utf8').catch(()=> '') !== script) await writeFile(output,script);
          console.log('Website reactions built from ' + source);
        }
      });
    } }],
  };
  if (watch) { const ctx = await context(options); await ctx.watch(); return ctx; }
  await build(options);
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await buildPageDemo({check:process.argv.includes('--check'),source:process.env.REACJI_EXTENSION_SOURCE});
}
