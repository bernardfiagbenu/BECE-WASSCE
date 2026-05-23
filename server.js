const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;

const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf'
};

const server = http.createServer((req, res) => {
  // Normalize and parse URL path, removing query params and trailing slashes
  let urlPath = req.url.split('?')[0];
  
  // Strip trailing slash if it's not the root path
  if (urlPath !== '/' && urlPath.endsWith('/')) {
    urlPath = urlPath.slice(0, -1);
  }
  
  // Default fallback to index.html for root or empty path
  if (urlPath === '/' || urlPath === '') {
    urlPath = '/index.html';
  }

  // Handle paths that don't have extension but might map to a file or index.html in a directory
  let targetPath = path.join(__dirname, urlPath);

  // Prevent path traversal outside root folder
  if (!targetPath.startsWith(__dirname)) {
    res.statusCode = 403;
    res.setHeader('Content-Type', 'text/plain');
    res.end('403 Forbidden');
    return;
  }

  // Helper check if path exists and we should serve it or fallback
  fs.stat(targetPath, (err, stats) => {
    if (err) {
      // If file not found, try appending .html (e.g., /exam-select -> /exam-select.html)
      const htmlPath = targetPath + '.html';
      fs.stat(htmlPath, (htmlErr, htmlStats) => {
        if (!htmlErr && htmlStats.isFile()) {
          serveFile(htmlPath, res);
        } else {
          // Serve index.html as fallback or 404
          res.statusCode = 404;
          res.setHeader('Content-Type', 'text/plain');
          res.end('404 Not Found');
        }
      });
      return;
    }

    if (stats.isDirectory()) {
      // Look for index.html inside directory
      const indexPath = path.join(targetPath, 'index.html');
      fs.stat(indexPath, (indexErr, indexStats) => {
        if (!indexErr && indexStats.isFile()) {
          serveFile(indexPath, res);
        } else {
          res.statusCode = 404;
          res.setHeader('Content-Type', 'text/plain');
          res.end('404 Not Found Directory');
        }
      });
    } else if (stats.isFile()) {
      serveFile(targetPath, res);
    } else {
      res.statusCode = 404;
      res.setHeader('Content-Type', 'text/plain');
      res.end('404 Not Found');
    }
  });
});

function serveFile(absolutePath, res) {
  const ext = path.extname(absolutePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  res.statusCode = 200;
  res.setHeader('Content-Type', contentType);
  // Add basic caching headers for static content in dev but allow revalidation
  res.setHeader('Cache-Control', 'no-cache');

  const stream = fs.createReadStream(absolutePath);
  stream.on('error', (err) => {
    console.error('Stream error:', err);
    if (!res.headersSent) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'text/plain');
      res.end('500 Internal Server Error');
    }
  });
  stream.pipe(res);
}

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Development Server listening on port ${PORT}`);
});
