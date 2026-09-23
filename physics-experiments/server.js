const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 5005;
const ROOT_DIR = path.join(__dirname, 'src');

const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject',
  '.mp3': 'audio/mpeg',
};

const server = http.createServer((req, res) => {
  console.log(`Request: ${req.method} ${req.url}`);
  
  // Parse URL to handle query parameters and hashes
  const parsedUrl = new URL(req.url, 'http://localhost');
  let pathname = parsedUrl.pathname;
  
  // Normalize /src prefix if present
  if (pathname.startsWith('/src/')) {
    pathname = pathname.substring(4);
  } else if (pathname === '/src') {
    pathname = '/index.html';
  }
  
  if (pathname === '/' || pathname === '') {
    pathname = '/index.html';
  }
  
  const filePath = path.join(ROOT_DIR, pathname);
  const extname = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[extname] || 'application/octet-stream';
  
  fs.readFile(filePath, (err, content) => {
    if (err) {
      console.log(`Error reading ${filePath}: ${err.code}`);
      if (err.code === 'ENOENT') {
        // Only fallback to index.html for page navigation requests (HTML or extensionless)
        if (extname === '.html' || extname === '') {
          fs.readFile(path.join(ROOT_DIR, 'index.html'), (err, content) => {
            if (err) {
              res.writeHead(404, { 'Content-Type': 'text/html' });
              res.end('<h1>404 - Page Not Found</h1>', 'utf-8');
            } else {
              res.writeHead(200, { 'Content-Type': 'text/html' });
              res.end(content, 'utf-8');
            }
          });
        } else {
          // Static assets (js, css, images, fonts) must return 404 to avoid parsing HTML as JS
          res.writeHead(404, { 'Content-Type': 'text/plain' });
          res.end(`404 Not Found: ${pathname}`, 'utf-8');
        }
      } else {
        res.writeHead(500);
        res.end(`Server Error: ${err.code}`, 'utf-8');
      }
    } else {
      console.log(`Serving: ${filePath} (${contentType})`);
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

server.listen(PORT, () => {
  console.log(`\n========================================`);
  console.log(`🚀 Server is running!`);
  console.log(`📁 Serving files from: ${ROOT_DIR}`);
  console.log(`🌐 Open in browser: http://localhost:${PORT}`);
  console.log(`========================================\n`);
});
