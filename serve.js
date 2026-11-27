const http = require('http');
const fs = require('fs');
const path = require('path');
const port = 8080;
const base = path.resolve(__dirname);

const server = http.createServer((req, res) => {
  let filePath = path.join(base, decodeURIComponent(req.url.split('?')[0]));
  if (filePath.endsWith('/')) filePath += 'index.html';
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, {'Content-Type': 'text/plain'});
      res.end('Not found');
    } else {
      const ext = path.extname(filePath).toLowerCase();
      const mime = {
        '.html': 'text/html',
        '.css': 'text/css',
        '.js': 'application/javascript',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.gif': 'image/gif',
        '.mp4': 'video/mp4',
        '.webm': 'video/webm'
      }[ext] || 'application/octet-stream';
      res.writeHead(200, {'Content-Type': mime});
      res.end(data);
    }
  });
});

server.listen(port, () => {
  console.log(`Static server running at http://localhost:${port}/`);
});
