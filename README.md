# hackathon-spec-v1

Working in this repo until we get the first endpoint or two in place.

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

## Style Guide and Linting

Our style guide is an extension of [Spectral's](https://meta.stoplight.io/docs/spectral/README.md) [OpenAPI ruleset](https://meta.stoplight.io/docs/spectral/docs/reference/openapi-rules.md). Spectral's ruleset goes beyond the OpenAPI v3 standard to incorporate a recommended set of best practices.

Spectral runs in CI on push and pull request. You can also run Spectral locally using the Spectral CLI and/or via the [stoplight.spectral](https://marketplace.visualstudio.com/items?itemName=stoplight.spectral) VS Code extension.

Additional linting is provided by [42crunch.vscode-openapi](https://github.com/42Crunch/vscode-openapi). A second linter will be added to CI, as a backup to Spectral.

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

## Compatibility with Community Tooling

A lot of tooling for working with OpenAPI specs does not support the full specification. In particular, many tools do not support multiple files specs. To use such a tool, bundle the spec into a single file using `make bundle`.

The tool used by `make bundle` can do much more than bundle a multiple file spec into a single file. It can convert specs between `YAML` and `JSON`, fully dereference a spec, and more.

## See Also

The API tooling Notion page.
