# ![CI](https://github.com/lob/lob-openapi/workflows/CI/badge.svg) ![CD](https://github.com/lob/lob-openapi/workflows/CD/badge.svg) Lob [OpenAPI v3](https://github.com/OAI/OpenAPI-Specification) Specification

- [What is this project?](#what-is-this-project)
- [Contributing](#contributing)
- [Design](#design)
- [OpenAPI Style Guide and linting](#openapi-style-guide-and-linting)
- [Readability](#readability)
- [OAS v3.1 compatibility](#oas-v31-compatibility)
- [Previewing the spec as docs (aka QAing your work)](#previewing-the-spec-as-docs-aka-qaing-your-work)
- [Bundled spec](#bundled-spec)
- [See also](#see-also)

## What is this project?

We're writing an OpenAPI v3 authored specification for the current [Lob API](https://docs.lob.com/).
This repo contains the spec as well as a growing set of tooling for working with OpenAPI v3 specs.

## Contributing

[Contributing Guide](CONTRIBUTING.md)

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
docs are pushed to `docs/index.html` in the branch.

In addition to the file generated on push to github, you can
generate the same single file version of the documentation
(`docs/index.html`) at any time locally by running `make redoc`.

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

## See also

- [Lob API docs generated from this spec (DRAFT)](https://lob.github.io/lob-openapi/)
- [Full Lob API documentation (LIVE)](https://docs.lob.com/)
- [Lobsters](https://www.lob.com/careers) only
  - [Notion: Lob API OpenAPI Project](https://www.notion.so/lob/Lob-API-v1-OpenAPI-spec-d6c3229d31bc45329d18e01905117fda)
  - [Notion: OpenAPI tooling](https://www.notion.so/lob/OpenAPI-tooling-e17f5a864a4a48d1886dcd95b53cf694)
