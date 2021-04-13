#!/usr/bin/env bash

set -euo pipefail

npx redoc-cli@0.11.2 bundle Lob-API-public.yml \
    -t actions/redoc/template.hbs \
    --options.theme.sidebar.backgroundColor: "#f7f9fa" \
    -o docs/index.html
