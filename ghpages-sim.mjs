// Simulates GitHub Pages: serves dist/ at /TableRush/ subpath
import { createServer } from 'http';
import { readFileSync, existsSync } from 'fs';
import { join, extname } from 'path';

const DIST = '/home/user/TableRush/dist';
const PORT = 8080;
const PREFIX = '/TableRush';

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.json': 'application/json',
};

createServer((req, res) => {
  let urlPath = req.url.split('?')[0];

  if (urlPath === PREFIX) {
    res.writeHead(301, { Location: PREFIX + '/' });
    res.end();
    return;
  }

  if (urlPath.startsWith(PREFIX + '/')) {
    urlPath = urlPath.slice(PREFIX.length);
  } else {
    res.writeHead(404); res.end('Not found at prefix');
    return;
  }

  if (urlPath === '/' || urlPath === '') urlPath = '/index.html';

  const file = join(DIST, urlPath);
  if (existsSync(file)) {
    const mime = MIME[extname(file)] || 'application/octet-stream';
    res.writeHead(200, {
      'Content-Type': mime,
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'no-cache',
    });
    res.end(readFileSync(file));
  } else {
    console.log(`404: ${urlPath}`);
    res.writeHead(404); res.end(`File not found: ${urlPath}`);
  }
}).listen(PORT, () => {
  console.log(`GitHub Pages simulation: http://localhost:${PORT}${PREFIX}/`);
});
