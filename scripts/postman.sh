#!/usr/bin/env bash

set -euo pipefail

make bundle

npx openapi-to-postmanv2 --pretty --spec dist/Lob-API-public-bundled.yml --output dist/Lob-API-postman.txt
