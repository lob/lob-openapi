# Redoc (redoc-cli) Github Action

Runs redoc-cli via docker to produce a zero dependency version of the API docs

The action invokes `redoc-cli bundle` on `Lob-API-public.yml` with template `template.hbs` and
saves the output in `docs/index.html`.

## Inputs

### `opts`

Any options to be provided to `redoc-cli` in addition to those described above.

## Outputs

No outputs.

## Example Usage

This action is used in [cd.yml](.github/workflows/cd.yml)
