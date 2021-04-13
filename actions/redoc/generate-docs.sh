#!/bin/sh

cd /github/workspace || exit

redoc-cli bundle Lob-API-public.yml -t template.hbs "$1" -o docs/index.html
