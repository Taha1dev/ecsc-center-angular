import { createServer } from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { workspaceApps } from './workspace-apps.mjs';
const center = process.argv[2];
const apps = workspaceApps();
const app = apps.find((entry) => entry.id === center);
if (!app) throw new Error('Choose ' + apps.map((entry) => entry.id).join(', '));
const root = app.output;
if (!fs.existsSync(path.join(root, 'index.html'))) throw new Error(`Build ${center} first`);
const mime = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
};
createServer((request, response) => {
  const url = new URL(request.url ?? '/', 'http://localhost');
  let file = path.resolve(root, '.' + decodeURIComponent(url.pathname));
  if (file !== root && !file.startsWith(root + path.sep)) {
    response.writeHead(403).end();
    return;
  }
  if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) {
    if (path.extname(url.pathname)) {
      response.writeHead(404).end();
      return;
    }
    file = path.join(root, 'index.html');
  }
  response.writeHead(200, {
    'Content-Type': mime[path.extname(file)] ?? 'application/octet-stream',
    'Cache-Control': 'no-cache',
  });
  fs.createReadStream(file).pipe(response);
}).listen(app.previewPort, '127.0.0.1', () =>
  console.log(`${center}: http://127.0.0.1:${app.previewPort}`),
);
