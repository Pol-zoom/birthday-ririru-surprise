import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 8080;
const DIST = path.join(__dirname, "dist");

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".webp": "image/webp",
  ".woff": "font/woff",
  ".woff2": "font/woff2"
};

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  let filePath = path.join(DIST, url.pathname);

  if (url.pathname === "/health") {
    res.writeHead(200, {
      "Content-Type": "text/plain"
    });
    res.end("OK");
    return;
  }

  if (filePath.endsWith(path.sep)) {
    filePath = path.join(filePath, "index.html");
  }

  fs.stat(filePath, (err, stats) => {
    if (!err && stats.isFile()) {
      const ext = path.extname(filePath);
      const contentType = MIME[ext] || "application/octet-stream";

      res.writeHead(200, {
        "Content-Type": contentType
      });

      fs.createReadStream(filePath).pipe(res);
      return;
    }

    // React SPA fallback
    const indexFile = path.join(DIST, "index.html");

    fs.readFile(indexFile, (error, data) => {
      if (error) {
        res.writeHead(500, {
          "Content-Type": "text/plain; charset=utf-8"
        });

        res.end("Build not found");
        return;
      }

      res.writeHead(200, {
        "Content-Type": "text/html; charset=utf-8"
      });

      res.end(data);
    });
  });
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Birthday Card running on port ${PORT}`);
  console.log(`📁 Serving ${DIST}`);
});
