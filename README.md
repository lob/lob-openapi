# Lob [OpenAPI v3](https://github.com/OAI/OpenAPI-Specification) Specification

- [How the spec is organized](#how-the-spec-is-organized)
  - [Bundled spec](#bundled-spec)
- [Style Guide and linting](#style-guide-and-linting)
- [Future proofing](#future-proofing)
- [Previewing the spec as docs (aka QAing your work)](#previewing-the-spec-as-docs-aka-qaing-your-work)
- [Contract testing](#contract-testing)
- [See also](#see-also)

## How the spec is organized

Our spec is organized semantically, by *resource*, instead of syntactically, by OpenAPI element.

```
.
├── Lob-API-public.yml            # base file (metadata, tags, servers, ...)
└── resources
    ├── addresses                 # elements specific to addresses
    │   ├── addresses.yml         # operations on /addresses
    │   ├── address.yml           # operations on /addresses/{id}
    │   ├── attributes
    │   │   ├── adr_id.yml
    │   │   └── ...
    │   ├── models
    │   │   └── address.yml
    │   └── responses
    │       ├── address.yml
    │       └── all_addresses.yml
    ├── postcards                 # elements specific to postcards
    │   ├── postcards.yml         # operations on /postcards
    │   ├── postcard.yml          # operations on /postcards/{id}
    │   └── ...
    └── shared                    # elements shared by multiple resources
        ├── headers.yml
        ├── parameters.yml
        └── models
            └── list.yml
```

### Bundled spec

A lot of tooling for working with OpenAPI specs does not support the full
specification. In particular, many tools do not support multiple file specs.
We maintain a single file 'bundled' version of the spec for use with such
tools. The bundled version is generated as part of CI/CD, and can be found
on github at `dist/Lob-API-bundled.yml` in each branch.

You can also generate a bundled version locally at any time using `make bundle`.

The CLI tool used by `make bundle` can do much more than bundle a multiple file spec
into a single file. It can convert specs between `YAML` and `JSON`, fully
dereference a spec, and more.

## Style Guide and linting

Our style guide is an extension of
[Spectral's](https://meta.stoplight.io/docs/spectral/README.md) [OpenAPI
ruleset](https://meta.stoplight.io/docs/spectral/docs/reference/openapi-rules.md). Spectral's
ruleset goes beyond the OpenAPI v3 standard to incorporate a recommended set of
best practices.

Spectral runs in CI on push and pull request. You can also run Spectral locally
using the Spectral CLI and/or via the
[stoplight.spectral](https://marketplace.visualstudio.com/items?itemName=stoplight.spectral)
VS Code extension.

For those editing in VS Code, additional linting can be provided by
[42crunch.vscode-openapi](https://github.com/42Crunch/vscode-openapi). A second
linter will be added to CI, as a backup to Spectral.

## Future proofing

As of January 2021, OpenAPI v3.1 is in [rc1](https://www.openapis.org/blog) with final expected any day. 3.1 includes many [extremely useful changes](https://github.com/OAI/OpenAPI-Specification/releases/tag/3.1.0-rc0), including full JSON schema compatibility and the ability to extend discriminators with specification extensions. As we anticipate moving to v3.1 soon after release, we're working to minimize the changes we'll need to make. Some changes, like switching from `nullable` to `null`, are both unavoidable and easy. Others, like using `ReadOnly` and `WriteOnly` with `required`, can and should be avoided.

## Previewing the spec as docs (aka QAing your work)

To preview the spec using redoc:
1. install [42crunch.vscode-openapi](https://github.com/42Crunch/vscode-openapi) in VS Code
2. go to `Settings => Extenstions => OpenAPI`
3. set `Default Preview Renderer` to `redoc`
4. open `Lob-API-public.yml`
5. click on the preview icon at the upper right hand corner of the panel.

* Drill down into the documentation to make sure that your examples are populating correctly.
* Run the code samples to be sure they are correct.
* Compare the response you get to the example response.

## Contract testing

We use [Prism](https://meta.stoplight.io/docs/prism/README.md) for contract testing, using the [Prism client](https://meta.stoplight.io/docs/prism/docs/guides/http-client.md). To run the existing tests, run `npm test`. To add
tests, look in the `test/` directory for a file named for the resource with
the endpoint in question. At present, the contract tests use the test user token listed on the
developer docs website. An upcoming change will switch to pulling the access tokens from
environment variables.

The contract tests are not yet in CI, so be sure to run the contract tests when reviewing PRs!

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
Please see the Prism website until we encapsulate that mode in a `make` command.

## See also

* [Lob API documentation](https://docs.lob.com/)
* [Lobsters](https://www.lob.com/careers) only
  * [Notion: Lob API OpenAPI Project](https://www.notion.so/lob/Lob-API-v1-OpenAPI-spec-d6c3229d31bc45329d18e01905117fda)
  * [Notion: OpenAPI tooling](https://www.notion.so/lob/OpenAPI-tooling-e17f5a864a4a48d1886dcd95b53cf694)
