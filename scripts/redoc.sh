#!/usr/bin/env bash

set -euo pipefail

npx redoc-cli@0.11.2 bundle Lob-API-public.yml -t actions/redoc/template.hbs -o dist/Lob-API-static.html
