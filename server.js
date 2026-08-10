import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 8080;
const DIST_DIR = path.join(__dirname, "dist");

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".mjs": "application/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".webp": "image/webp",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".txt": "text/plain; charset=utf-8"
};

function sendFile(res, filePath) {
  fs.readFile(filePath, (error, data) => {
    if (error) {
      res.writeHead(500, {
        "Content-Type": "text/plain; charset=utf-8"
      });

      res.end("Internal Server Error");
      return;
    }

    const extension = path.extname(filePath).toLowerCase();

    res.writeHead(200, {
      "Content-Type": MIME_TYPES[extension] || "application/octet-stream",
      "Cache-Control": extension === ".html"
        ? "no-cache"
        : "public, max-age=31536000"
    });

    res.end(data);
  });
}

const server = http.createServer((req, res) => {
  if (req.method !== "GET" && req.method !== "HEAD") {
    res.writeHead(405, {
      "Content-Type": "text/plain; charset=utf-8"
    });

    res.end("Method Not Allowed");
    return;
  }

  let requestPath;

  try {
    requestPath = decodeURIComponent(new URL(req.url, `http://${req.headers.host}`).pathname);
  } catch {
    res.writeHead(400);
    res.end("Bad Request");
    return;
  }

  // Railway health check
  if (requestPath === "/health") {
    res.writeHead(200, {
      "Content-Type": "text/plain; charset=utf-8"
    });

    res.end("OK");
    return;
  }

  // Remove trailing slash except for root
  if (requestPath.length > 1 && requestPath.endsWith("/")) {
    requestPath = requestPath.slice(0, -1);
  }

  const requestedFile = path.join(DIST_DIR, requestPath);

  // Security: prevent access outside dist
  const normalizedDist = path.resolve(DIST_DIR);
  const normalizedRequested = path.resolve(requestedFile);

  if (!normalizedRequested.startsWith(normalizedDist + path.sep)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  fs.stat(normalizedRequested, (error, stats) => {
    if (!error && stats.isFile()) {
      if (req.method === "HEAD") {
        const extension = path.extname(normalizedRequested).toLowerCase();

        res.writeHead(200, {
          "Content-Type": MIME_TYPES[extension] || "application/octet-stream"
        });

        res.end();
      } else {
        sendFile(res, normalizedRequested);
      }

      return;
    }

    // React Router / SPA fallback
    const indexFile = path.join(DIST_DIR, "index.html");

    fs.access(indexFile, fs.constants.F_OK, (indexError) => {
      if (indexError) {
        res.writeHead(500, {
          "Content-Type": "text/plain; charset=utf-8"
        });

        res.end("dist/index.html not found. Run npm run build first.");
        return;
      }

      if (req.method === "HEAD") {
        res.writeHead(200, {
          "Content-Type": "text/html; charset=utf-8"
        });

        res.end();
      } else {
        sendFile(res, indexFile);
      }
    });
  });
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Birthday Card server started`);
  console.log(`Listening on 0.0.0.0:${PORT}`);
  console.log(`Serving: ${DIST_DIR}`);
});
