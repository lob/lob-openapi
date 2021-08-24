# Distribution Artifacts

Anything in this folder is built automatically on push to github.

## What's Here?

* lob-api-bundled.yml - A single file of the Lob API v1 OpenAPI v3.0 description, organized in the traditional structure.
* lob-api-postman.json - A postman collection created using the [openapi2postmanv2 cli](https://www.npmjs.com/package/openapi-to-postmanv2#command-line-interface).

## For Developers

The CI/CD workflow we're currently using for these artifacts is less than perfect, sorry. If you encounter merge
conflicts in these files while working on a branch, just pick either version of the file and check it in, as the
file will get updated next time you push.

You can generate either of these files at any time using the relevant script in `package.json`.
