# ![CI](https://github.com/lob/lob-openapi/workflows/CI/badge.svg) ![CD](https://github.com/lob/lob-openapi/workflows/CD/badge.svg) Lob [OpenAPI v3](https://github.com/OAI/OpenAPI-Specification) Specification

- [ Lob OpenAPI v3 Specification](#--lob-openapi-v3-specification)
  - [What is this project?](#what-is-this-project)
  - [Contributing](#contributing)
  - [Design](#design)
  - [OpenAPI Style Guide and linting](#openapi-style-guide-and-linting)
  - [Readability](#readability)
  - [OAS v3.1 compatibility](#oas-v31-compatibility)
  - [Previewing changes](#previewing-changes)
  - [Contributing to this repo](#contributing-to-this-repo)
  - [E2E Testing](#e2e-testing)
  - [Bundled spec](#bundled-spec)
  - [Postman Collection](#postman-collection)
  - [How to bump version](#how-to-bump-version)

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
├── lob-api-public.yml            # base file (metadata, tags, servers, ...)
├── resources
│   ├── postcards                 # elements specific to postcards
│   │   ├── postcards.yml         # operations on /postcards
│   │   ├── postcard.yml           # operations on /postcards/{id}
│   │   ├── attributes
│   │   │   └── ...
│   │   ├── models
│   │   │   └── postcard.yml
│   │   └── responses
│   │       ├── postcard.yml
│   │       └── all_postcards.yml
│   └── letters                 # elements specific to letters
│       ├── letters.yml         # operations on /letters
│       ├── letter.yml          # operations on /letters/{id}
│       └── ...
├── shared                        # elements used by multiple resources
│   ├── attributes                # properties not of type `object`
│   ├── headers
│   ├── models                    # properties of type `object`
│   ├── parameters
│   └── responses
|
├── actions                       # private github actions or resources needed by actions
│   ├── contract_tests
│   └── redoc
├── dist                          # contents created during CD by github actions
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

Spectral runs in CI on push and pull request.

## Readability

We use [Prettier](https://prettier.io/) to ensure that all our code follows a consist format for
maximum readability. If you have been given the green light to create a PR, you can run `prettier` as
you work via `npm run pretty` and/or through [editor integrations](https://prettier.io/docs/en/editors.html) for many major editors.

In addition, a pre-commit githook runs `prettier --check .` (the same check run in CI).

## OAS v3.1 compatibility

On February 15, 2021, the [OpenAPI Initiative](https://www.openapis.org/) published [OpenAPI v3.1](https://spec.openapis.org/oas/v3.1.0).
OAS 3.1 includes many [extremely useful changes](https://github.com/OAI/OpenAPI-Specification/releases/tag/3.1.0-rc0), including full JSON schema compatibility and the ability to extend discriminators with specification extensions.

We will move to v3.1 as soon as is practical. In the meantime, we're working to minimize the changes we'll need to make.

## Previewing changes

If you've changed the css and js, you need to run `npm run build` to
create the uglified js and css files that your local docs will depend on.
The new chunks will show up in `docs/chunks`.

You can then generate documentation for the API from the spec by running
`npm run redoc`, which uses [redoc](https://github.com/Redocly/redoc). The
generated docs will apppear in `docs/index.html`. Then you can point
your browser to the absolute path of that file to review your local
version of the docs.

## Contributing to this repo

When you try to commit your changes, a pre-commit hook with run. It will:

1. Check linting
2. Run tests

If your tests fail, it is because your hook is looking for specific keys in your environment. In order to commit your changes and test on Github, you will need to pass `--no-verify` after your commit.

## E2E Testing

You can run the currently available end-to-end tests with the command `npm run docsTest`.

## Bundled spec

A lot of tooling for working with OpenAPI specs does not support the full
specification. In particular, many tools do not support multiple file specs.
We maintain a single file 'bundled' version of the spec for use with such
tools. The bundled version is generated as part of CI/CD, and can be found
on github at `dist/lob-api-bundled.yml` on the `deployment` branch.

## Postman Collection

You can generate a big JSON representing a Postman Collection for this spec
locally with `npm run postman`. The resulting `dist/lob-api-postman.json` can be
imported into Postman so that you can get started on making requests to Lob API.
[Here](https://www.youtube.com/watch?v=JDrxdzqghuQ)'s a video tutorial on that.

## How to bump version

Run `npm run bump-version <<newversion> | major | minor | patch>`

When bumping the version there are three key areas where the `version` should be bumped. Verify that these versions are updated after running the script
1. `package.json`
2. `package-lock.json`
3. `lob-api-public.yml` 

Ensure you run `npm run bundle && npm run pretty && npm run redoc` to actually appply changes to package and package-lock. You will need to change lob-api-public.yml manually.

## Deployment
The last step is to [create a new release](https://github.com/lob/lob-openapi/releases/new). Create a new tag to match the version you're deploying and provide a brief description. You can monitor the deployment at the [Deploy to Netlify Action](https://github.com/lob/lob-openapi/actions/workflows/deploy.yml).

[Video Tutorial](https://www.notion.so/lob/Deploying-Lob-OpenAPI-Docs-28f349ae90b4498a8b862881db6a834e)