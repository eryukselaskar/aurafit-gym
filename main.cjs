const { app, BrowserWindow, shell } = require('electron');
const path = require('path');
const http = require('http');
const fs = require('fs');

let server;
let serverPort = 0;
let savedState = '';

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
  '.ico': 'image/x-icon'
};

function startLocalServer(callback) {
  server = http.createServer((req, res) => {
    // İstek yolunu sorgu dizesinden ayır. Eskiden req.url doğrudan dosya yoluna
    // ekleniyordu, bu yüzden "/desktop-login.html?port=...&state=..." isteği
    // "dist/desktop-login.html?port=...&state=..." dosyasını arıyor, bulamayınca
    // SPA yedeğine düşüp index.html döndürüyordu. Masaüstü giriş akışı bu yüzden
    // tarayıcıda uygulamanın kendisini açıyor ve hiç tamamlanmıyordu.
    const { pathname } = new URL(req.url || '/', 'http://localhost');

    // Handle CORS preflight options
    if (req.method === 'OPTIONS') {
      res.writeHead(204, {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      });
      res.end();
      return;
    }

    // Intercept External Login Trigger
    if (pathname === '/api/open-external-login') {
      savedState = Math.random().toString(36).substring(2);
      const loginUrl = `http://localhost:${serverPort}/desktop-login.html?port=${serverPort}&state=${savedState}`;
      shell.openExternal(loginUrl);
      
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'opened' }));
      return;
    }

    // Intercept Auth Callback from system browser
    if (pathname === '/api/auth-callback' && req.method === 'POST') {
      let body = '';
      req.on('data', chunk => { body += chunk; });
      req.on('end', () => {
        try {
          const authData = JSON.parse(body);
          if (authData.state === savedState) {
            // Find active browser window, bring to front, focus, and execute JS callback
            const win = BrowserWindow.getAllWindows()[0];
            if (win) {
              if (win.isMinimized()) win.restore();
              win.show();
              win.focus();
              
              // Safe Base64 encoding to prevent JSON string template parsing/escaping errors
              const base64Data = Buffer.from(JSON.stringify(authData)).toString('base64');
              win.webContents.executeJavaScript(`if (window.handleExternalAuth) { window.handleExternalAuth(JSON.parse(atob("${base64Data}"))); }`);
            }
            res.writeHead(200, { 
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*'
            });
            res.end(JSON.stringify({ status: 'ok' }));
          } else {
            res.writeHead(400, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
            res.end(JSON.stringify({ error: 'Invalid state parameter' }));
          }
        } catch (e) {
          res.writeHead(500, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
          res.end(JSON.stringify({ error: e.message }));
        }
      });
      return;
    }

    // Decode URI to handle potential special chars in paths
    const reqPath = decodeURIComponent(pathname);
    const filePath = path.join(__dirname, 'dist', reqPath === '/' ? 'index.html' : reqPath);
    
    // Safety check to prevent directory traversal
    if (!filePath.startsWith(path.join(__dirname, 'dist'))) {
      res.statusCode = 403;
      res.end('Forbidden');
      return;
    }

    const ext = path.extname(filePath);
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    fs.readFile(filePath, (err, content) => {
      if (err) {
        if (err.code === 'ENOENT') {
          // If file not found, fallback to index.html for SPA routing
          fs.readFile(path.join(__dirname, 'dist', 'index.html'), (err2, indexContent) => {
            if (err2) {
              res.statusCode = 500;
              res.end('Error loading index.html fallback');
            } else {
              res.writeHead(200, { 'Content-Type': 'text/html' });
              res.end(indexContent, 'utf-8');
            }
          });
        } else {
          res.statusCode = 500;
          res.end(`Server Error: ${err.code}`);
        }
      } else {
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content, 'utf-8');
      }
    });
  });

  // Listen on port 0 to let the OS assign a random available port on loopback
  // MUST bind to 'localhost' (not '127.0.0.1') so it matches the origin used by Firebase authorized domains
  server.listen(0, 'localhost', () => {
    serverPort = server.address().port;
    console.log(`Local server running at http://localhost:${serverPort}`);
    callback();
  });
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    title: 'AuraFit',
    icon: path.join(__dirname, 'build', 'icon.ico'),
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    }
  });

  // Load via localhost to authorize Google Sign-In domain checks
  win.loadURL(`http://localhost:${serverPort}`);
}

app.whenReady().then(() => {
  startLocalServer(() => {
    createWindow();
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('will-quit', () => {
  if (server) {
    server.close();
  }
});
