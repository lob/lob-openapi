#!/usr/bin/env node

const fs = require("fs");
const http = require("http");
const os = require("os");
const path = require("path");
const { spawn, spawnSync } = require("child_process");

const root = path.resolve(__dirname, "..");
const docsRoot = fs.mkdtempSync(path.join(os.tmpdir(), "lob-openapi-docs-"));
const docsFile = path.join(docsRoot, "index.html");
const npmBin = process.platform === "win32" ? "npm.cmd" : "npm";
const cypressBin = process.platform === "win32" ? "npx.cmd" : "npx";
// Keep this list closed so request paths never become filesystem paths.
const publicFileSpecs = [
  {
    requestPath: "/docs/index.html",
    filePath: docsFile,
    contentType: "text/html",
  },
  {
    requestPath: "/docs/chunks/bundle.js",
    filePath: path.join(root, "docs/chunks/bundle.js"),
    contentType: "text/javascript",
  },
  {
    requestPath: "/docs/chunks/styles.min.css",
    filePath: path.join(root, "docs/chunks/styles.min.css"),
    contentType: "text/css",
  },
  {
    requestPath: "/docs/js/determine_widget.js",
    filePath: path.join(root, "docs/js/determine_widget.js"),
    contentType: "text/javascript",
  },
  {
    requestPath: "/docs/js/map_old_links.js",
    filePath: path.join(root, "docs/js/map_old_links.js"),
    contentType: "text/javascript",
  },
];
let server;

function cleanup() {
  fs.rmSync(docsRoot, { recursive: true, force: true });
}

function shutdown({ code, signal } = {}) {
  const finalize = () => {
    cleanup();

    if (signal) {
      process.kill(process.pid, signal);
      return;
    }

    process.exit(code ?? 1);
  };

  if (server?.listening) {
    server.close(finalize);
    return;
  }

  finalize();
}

function buildDocs() {
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
}

function loadPublicFiles() {
  return new Map(
    publicFileSpecs.map(({ requestPath, filePath, contentType }) => [
      requestPath,
      {
        content: fs.readFileSync(filePath),
        contentType,
      },
    ])
  );
}

function createDocsServer(publicFiles) {
  return http.createServer((request, response) => {
    const requestPath = new URL(request.url, "http://127.0.0.1").pathname;
    const publicFile = publicFiles.get(requestPath);

    if (!publicFile) {
      response.writeHead(403);
      response.end("Forbidden");
      return;
    }

    response.writeHead(200, {
      "Content-Type": publicFile.contentType,
    });
    response.end(publicFile.content);
  });
}

function runCypress(port) {
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
}

function main() {
  buildDocs();

  try {
    const publicFiles = loadPublicFiles();
    server = createDocsServer(publicFiles);
  } catch (error) {
    console.error(error);
    shutdown({ code: 1 });
  }

  server.listen(0, "127.0.0.1", () => {
    const { port } = server.address();
    runCypress(port);
  });
}

main();
