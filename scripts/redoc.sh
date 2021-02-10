#!/usr/bin/env bash

set -euo pipefail

# redoc-cli bundles into a file called redoc-static.html, hard-coded
npx redoc-cli@0.10.3 bundle Lob-API-public.yml -t actions/redoc/template.hbs

echo "moving redoc-static.html to dist/"
mv redoc-static.html dist/Lob-API-static.html
