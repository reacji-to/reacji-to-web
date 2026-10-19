import http from 'node:http';
import { publicPage } from '../worker/pages.js';
const host = '127.0.0.1', port = Number(process.env.PORT || 4173);
http.createServer(async (request, response) => {
  try {
    const page = await publicPage(new URL(request.url, `http://${host}:${port}`));
    response.writeHead(page.status, { ...Object.fromEntries(page.headers), 'Cache-Control': 'no-store' });
    response.end(Buffer.from(await page.arrayBuffer()));
  } catch (error) {
    console.error('Preview request failed:', error.message);
    response.writeHead(500, { 'Content-Type': 'text/plain' });
    response.end('Preview could not load. Check the preview server log.');
  }
}).listen(port, host, () => console.log(`Local preview: http://${host}:${port}`));
