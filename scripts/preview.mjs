import { spawn } from 'node:child_process';
import { buildPageDemo } from './build-page-demo.mjs';
// Build before accepting requests, then watch the real extension's complete import graph.
const source = process.env.REACJI_EXTENSION_SOURCE;
await buildPageDemo({source});
const builder = await buildPageDemo({watch:true,source});
const args = process.argv.includes('--worker')
  ? ['node_modules/wrangler/bin/wrangler.js','dev','--ip','127.0.0.1']
  : ['--watch','scripts/preview-server.mjs'];
const server = spawn(process.execPath,args,{stdio:'inherit'});
async function stop() { server.kill('SIGTERM'); await builder.dispose(); }
process.on('SIGINT',()=>void stop());
process.on('SIGTERM',()=>void stop());
server.on('exit',async code=>{await builder.dispose();process.exit(code||0);});
