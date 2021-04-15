#!/bin/sh

cd /github/workspace || exit

redoc-cli bundle Lob-API-public.yml "$1" \
    -t /template.hbs \
    --options.theme.sidebar.backgroundColor: "#f7f9fa" \
    -o docs/index.html
