#!/usr/bin/env node

const fs = require("fs");
const http = require("http");
const os = require("os");
const path = require("path");
const { spawn, spawnSync } = require("child_process");

const root = path.resolve(__dirname, "..");
const docsRoot = fs.mkdtempSync(path.join(os.tmpdir(), "lob-openapi-docs-"));
const docsFile = path.join(docsRoot, "index.html");
const publicAssetRoots = [
  { requestPrefix: "/docs/chunks/", directory: path.join(root, "docs/chunks") },
  { requestPrefix: "/docs/js/", directory: path.join(root, "docs/js") },
];

const cleanup = () => {
  fs.rmSync(docsRoot, { recursive: true, force: true });
};

const isPathWithin = (parent, child) => {
  const relativePath = path.relative(parent, child);

  return (
    relativePath &&
    !relativePath.startsWith("..") &&
    !path.isAbsolute(relativePath)
  );
};

const contentTypes = {
  ".css": "text/css",
  ".html": "text/html",
  ".js": "text/javascript",
  ".json": "application/json",
  ".map": "application/json",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};

const server = http.createServer((request, response) => {
  const requestPath = decodeURIComponent(
    new URL(request.url, "http://127.0.0.1").pathname
  );
  const isGeneratedDocs = requestPath === "/docs/index.html";
  const assetRoot = publicAssetRoots.find(({ requestPrefix }) =>
    requestPath.startsWith(requestPrefix)
  );
  let filePath = null;

  if (isGeneratedDocs) {
    filePath = docsFile;
  } else if (assetRoot) {
    filePath = path.join(root, requestPath);
  }

  if (
    !filePath ||
    (assetRoot && !isPathWithin(assetRoot.directory, filePath))
  ) {
    response.writeHead(403);
    response.end("Forbidden");
    return;
  }

  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, "index.html");
  }

  fs.readFile(filePath, (error, content) => {
    if (error) {
      response.writeHead(error.code === "ENOENT" ? 404 : 500);
      response.end(error.code === "ENOENT" ? "Not found" : "Server error");
      return;
    }

    response.writeHead(200, {
      "Content-Type": contentTypes[path.extname(filePath)] || "text/plain",
    });
    response.end(content);
  });
});

const shutdown = ({ code, signal } = {}) => {
  const finalize = () => {
    cleanup();

    if (signal) {
      process.kill(process.pid, signal);
      return;
    }

    process.exit(code ?? 1);
  };

  if (server.listening) {
    server.close(finalize);
    return;
  }

  finalize();
};

const npmBin = process.platform === "win32" ? "npm.cmd" : "npm";
const redoc = spawnSync(npmBin, ["run", "redoc"], {
  cwd: root,
  env: {
    ...process.env,
    REDOC_OUTPUT: docsFile,
  },
  stdio: "inherit",
});

if (redoc.status !== 0) {
  shutdown({ code: redoc.status ?? 1 });
}

server.listen(0, "127.0.0.1", () => {
  const { port } = server.address();
  const cypressBin = process.platform === "win32" ? "npx.cmd" : "npx";
  const cypress = spawn(
    cypressBin,
    [
      "cypress",
      "run",
      "--spec",
      "cypress/e2e/*",
      "--env",
      `docsUrl=http://127.0.0.1:${port}/docs/index.html`,
    ],
    {
      cwd: root,
      stdio: "inherit",
    }
  );

  cypress.on("error", (error) => {
    console.error(error);
    shutdown({ code: 1 });
  });

  cypress.on("exit", (code, signal) => {
    shutdown({ code, signal });
  });
});
