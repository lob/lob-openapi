# ![CI](https://github.com/lob/lob-openapi/workflows/CI/badge.svg) ![CD](https://github.com/lob/lob-openapi/workflows/CD/badge.svg) Lob [OpenAPI v3](https://github.com/OAI/OpenAPI-Specification) Specification

- [What is this project?](#what-is-this-project)
- [Design](#design)
- [Bundled spec](#bundled-spec)
- [Contributing / Workflow](#contributing--workflow)
- [OpenAPI Style Guide and linting](#openapi-style-guide-and-linting)
- [Readability](#readability)
- [OAS v3.1 compatibility](#oas-v31-compatibility)
- [Previewing the spec as docs (aka QAing your work)](#previewing-the-spec-as-docs-aka-qaing-your-work)
- [Contract testing](#contract-testing)
- [See also](#see-also)

## What is this project?

We're writing an OpenAPI v3 authored specification for the current [Lob API](https://docs.lob.com/).
This repo contains the spec as well as a growing set of tooling for working with OpenAPI v3 specs.

## Design

Our spec is a multifile spec organized semantically, by _resource_, instead of syntactically, by OpenAPI element. Organizing the spec semantically reduces cognitive friction, helping developers reason from _interaction_ (endpoints) to data (and process) design. As developers from multiple teams work with the spec, the design surfaces business semantics rather than presenting the canonical wall-o-yaml (or json-schema) that typifies the traditional API spec.

```
.
.
├── Lob-API-public.yml            # base file (metadata, tags, servers, ...)
├── resources
│   ├── addresses                 # elements specific to addresses
│   │   ├── addresses.yml         # operations on /addresses
│   │   ├── address.yml           # operations on /addresses/{id}
│   │   ├── attributes
│   │   │   └── ...
│   │   ├── models
│   │   │   └── address.yml
│   │   └── responses
│   │       ├── address.yml
│   │       └── all_addresses.yml
│   └── postcards                 # elements specific to postcards
│       ├── postcards.yml         # operations on /postcards
│       ├── postcard.yml          # operations on /postcards/{id}
│       └── ...
├── shared                        # elements used by multiple resources
│   ├── attributes                # properties not of type `object`
│   ├── headers
│   ├── models                    # properties of type `object`
│   ├── parameters
│   └── responses
|
├── Makefile                      # gnu make commands
├── actions                       # private github actions or resources needed by actions
│   ├── contract_tests
│   └── redoc
├── dist                          # contents created during CD by github actions
├── scripts                       # scripts used by `Makefile`
└── tests                         # contract tests
    ├── setup.js                  # contract test framework
    ├── addresses_test.js         # tests for addresses resource
    ├── us_verifications.test.js  # tests for us_verifications resource...
    └── ...
```

## Bundled spec

A lot of tooling for working with OpenAPI specs does not support the full
specification. In particular, many tools do not support multiple file specs.
We maintain a single file 'bundled' version of the spec for use with such
tools. The bundled version is generated as part of CI/CD, and can be found
on github at `dist/Lob-API-bundled.yml` in each branch.

You can also generate a bundled version locally at any time using `make bundle`.

The CLI tool used by `make bundle` can do much more than bundle a multiple file spec
into a single file. It can convert specs between `YAML` and `JSON`, fully
dereference a spec, and more.

## Contributing / Workflow

To contribute, whether adding / modifying an endpoint or working on the tooling, start by making
a branch. (As we build out the full tooling in the roadmap, everything will key off of the branch
name, although that is not currently relevant.)

If you are adding a new endpoint, keep your work in the branch until the feature is shipped in `lob-api` (talk to DevEx about details - we're working through this process and would like to discuss workflow details!) We're actively building out tooling to support API driven design at present. Take a look at the [mock](MOCKING.md) server documentation.

Whether for a new or an existing endpoint, you'll want to add contract tests (discussed briefly below).

This project uses CI/CD; as you push your branch to github, github actions will run tests and, if
those tests pass, build release artifacts (bundled spec, postman collection, ...) and push them
to your branch on github under the `dist/` directory. Because the CI/CD cycle on github pushes
additional commits to your branch, you will either need to pull those commits or force push (`git push -f`)
when pushing additional work to the branch. Don't be afraid to force push: the actions build each
artifact anew on each push.

## OpenAPI Style Guide and linting

Our OpenAPI style guide is an extension of
[Spectral's](https://meta.stoplight.io/docs/spectral/README.md) [OpenAPI
ruleset](https://meta.stoplight.io/docs/spectral/docs/reference/openapi-rules.md). Spectral's
ruleset goes beyond the OpenAPI v3 standard to incorporate a recommended set of
best practices.

Spectral runs in CI on push and pull request. You can also run Spectral locally
via `npm run lint`. VS Code users can use the
[stoplight.spectral](https://marketplace.visualstudio.com/items?itemName=stoplight.spectral)
VS Code extension.

## Readability

We use [Prettier](https://prettier.io/) to ensure that all our code follows a consist format for
maximum readability. You can run `prettier` as you work via `npm run pretty` and/or through [editor integrations](https://prettier.io/docs/en/editors.html) for many major editors.

In addition, a pre-commit githook runs `prettier --check .` (the same check run in CI).

## OAS v3.1 compatibility

On February 15, 2021, the [OpenAPI Initiative](https://www.openapis.org/) published [OpenAPI v3.1](https://spec.openapis.org/oas/v3.1.0).
OAS 3.1 includes many [extremely useful changes](https://github.com/OAI/OpenAPI-Specification/releases/tag/3.1.0-rc0), including full JSON schema compatibility and the ability to extend discriminators with specification extensions.

We will move to v3.1 as soon as is practical. In the meantime, we're working to minimize the changes we'll need to make. Some changes, like switching from `nullable` to `null`, are both unavoidable and easy. Others, like using `ReadOnly` and `WriteOnly` with `required`, can and should be avoided.

## Previewing the spec as docs (aka QAing your work)

Each time a commit is pushed to github, we generate documentation for the
API from the spec using [redoc](https://github.com/Redocly/redoc). The generated
docs are pushed to `dist/Lob-API-static.html` in the branch. We're currently
using bare bones redoc: no customizations, no styling, etc. The generated docs are
provided so team members can use them for development and review and to get a sense
of what redoc can do.

In addition to the file generated on push to github, you can
generate the same single file version of the documentation
(`dist/Lob-API-static.html`) at any time locally by running `make redoc`.

If you are editing with VS Code, you can view your changes on the fly using an extension:

1. install [42crunch.vscode-openapi](https://github.com/42Crunch/vscode-openapi) in VS Code
2. go to `Settings => Extenstions => OpenAPI`
3. set `Default Preview Renderer` to `redoc`
4. open `Lob-API-public.yml`
5. click on the preview icon at the upper right hand corner of the panel.

- Drill down into the documentation to make sure that your examples are populating correctly.
- Run the examples to be sure they are correct.
- Compare the response you get to the example response.

## Contract testing

We use [Prism](https://meta.stoplight.io/docs/prism/README.md) for contract testing, using the [Prism client](https://meta.stoplight.io/docs/prism/docs/guides/http-client.md). To run the existing tests locally:

- add a valid Lob test token to your environment as `LOB_API_TEST_TOKEN`
- run `npm test`.

To add a test, look in the `tests/` directory for a file named for the resource with
the endpoint in question.

The contract tests run on github whenever you push to github and/or open a pull request.

During development of the spec for existing endpoints, you can run Prism as a [validation proxy](https://meta.stoplight.io/docs/prism/docs/getting-started/03-cli.md#proxy) by running `npm run proxy`.

```
$ npm run proxy
[1:20:53 PM] › [CLI] …  awaiting  Starting Prism…
[1:20:53 PM] › [CLI] ℹ  info      GET        http://127.0.0.1:4010/addresses/adr_D9V2vWn
[1:20:53 PM] › [CLI] ℹ  info      GET        http://127.0.0.1:4010/addresses?Limit=55
[1:20:53 PM] › [CLI] ▶  start     Prism is listening on http://127.0.0.1:4010
```

Once Prism is listening, you can issue http requests to the proxy port, in this
case `http://127.0.0.1:4010` using the client of your choice. I like
[httpie](https://httpie.io/docs#main-features), a user friendly client.

```
$ http -a $LOB_API_SECRET_TEST: -v GET http://127.0.0.1:4010/addresses Accept-Encoding:
GET /addresses HTTP/1.1
Accept: */*
Authorization: Basic <REDACTED>
Connection: keep-alive
Host: 127.0.0.1:4010
User-Agent: HTTPie/1.0.3



HTTP/1.1 200 OK
Access-Control-Allow-Credentials: true
Access-Control-Allow-Headers: *
Access-Control-Allow-Origin: *
Access-Control-Expose-Headers: *
Connection: keep-alive
Content-Length: 73
Keep-Alive: timeout=5
accept-ranges: bytes
cache-control: no-cache
content-type: application/json; charset=utf-8
date: Wed, 16 Dec 2020 21:54:33 GMT
vary: origin,accept-encoding

{
    "count": 0,
    "data": [],
    "next_url": null,
    "object": "list",
    "previous_url": null
}
```

The `Accept-Encoding:` header included in the request unsets `httpie`'s default
header `Accept-Encoding: gzip, deflate`.

Any contract violations will be returned in a `s1-violations` header, which will
contain a JSON object with all violations found in the response. You can also
use the `--errors` flag which will turn any request or response violation found
into a [RFC7807](https://tools.ietf.org/html/rfc7807) machine readable error.

You can also run Prism as a mock server using the spec for new endpoints.
Mocking is discussed in depth in a separate [guide](MOCKING.md).

## See also

- [Lob API docs generated from this spec (DRAFT)](https://lob.github.io/lob-openapi/)
- [Full Lob API documentation (LIVE)](https://docs.lob.com/)
- [Lobsters](https://www.lob.com/careers) only
  - [Notion: Lob API OpenAPI Project](https://www.notion.so/lob/Lob-API-v1-OpenAPI-spec-d6c3229d31bc45329d18e01905117fda)
  - [Notion: OpenAPI tooling](https://www.notion.so/lob/OpenAPI-tooling-e17f5a864a4a48d1886dcd95b53cf694)
