# Developer Documentation

This directory contains a zero-dependency, single file version of our new developer docs for Lob API v1.

## Github Pages

The copy in main is served by Github pages at https://lob.github.io/lob-openapi.

## How it is built

The docs are generated from the OpenAPI v3 description in this repo using `redoc-cli`. See also the `redoc` script in
`package.json`. The file is updated on each push to github.

You can generate the file yourself at any time by running `npm run redoc`.

## Dealing with merge conflicts

You may occasionally encounter merge conflicts in this file. You may safely ignore such conflicts, choosing either version of the file, as the file is generated anew on each push to github.
