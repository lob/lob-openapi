# Mock server: Prism

This file documents **Prism**, the HTTP mock server engine used by the `api-mocker` service defined in the [`Dockerfile`](Dockerfile).

---

## The Mock Server used - Prism

[Prism](https://docs.stoplight.io/docs/prism/674b27b261c3c-prism-overview) is a set of open-source packages for **API mocking** and **contract testing** OpenAPI v3.x and Postman Collections. Self-hosted Prism runs from the command line and provides mock servers, request validation, and content negotiation.

[Prism online documentation](https://docs.stoplight.io/docs/prism/674b27b261c3c-prism-overview) describes in detail how the tool works and how to use it.

---

## How Prism mocks HTTP responses

Prism’s mock server simulates an HTTP API using the routes and rules defined in your OpenAPI document, so clients can integrate before a real backend exists. Behavior aligns with Stoplight’s [HTTP mocking](https://docs.stoplight.io/docs/prism/83dbbd75532cf-http-mocking) documentation and Prism’s [mocking guide](https://github.com/stoplightio/prism/blob/master/docs/guides/01-mocking.md):

- **Routing and validation** — Incoming requests are matched to operations in the spec; Prism can validate requests against the document’s schemas and constraints.
- **Content negotiation** — Responses respect `Accept` and `Content-Type` similarly to a real API when multiple media types exist.
- **Choosing a response** — Prism follows a fixed decision flow: confirm the route exists, validate when applicable, then select status code and body (including negotiation for examples vs schema-derived bodies).
- **Examples vs schemas** — When a response defines **examples**, Prism prefers those. When examples are missing or not selected, it derives bodies from **JSON schemas** (following `$ref`s), using static or dynamic generation depending on mode (see below).

---

## Static and dynamic response generation

By default, Prism uses a **static** generation strategy: it favors documented examples and otherwise fills fields from the schema with deterministic placeholder-style values (see Prism’s [HTTP mocking](https://docs.stoplight.io/docs/prism/83dbbd75532cf-http-mocking) guide).

**Dynamic** generation varies values per request using schema types, formats, and related metadata. Prism delegates much of that to [JSON Schema Faker](https://github.com/json-schema-faker/json-schema-faker) and [Faker](https://github.com/faker-js/faker); see [Dynamic response generation with Faker](https://docs.stoplight.io/docs/prism/9528b5a8272c0-dynamic-response-generation-with-faker) and Prism’s upstream [dynamic response guide](https://github.com/stoplightio/prism/blob/master/docs/guides/11-dynamic-response-with-faker.md).

**Important:** The mock image used here starts Prism **without** the `-d` / `--dynamic` CLI flag. That means **dynamic generation is off globally** unless you either:

1. Start Prism with **`-d`** (would require changing the image `ENTRYPOINT` / Dockerfile on [`platform/local-api-mocking-server`](https://github.com/lob/lob-openapi/tree/platform/local-api-mocking-server)), or  
2. Send **`Prefer: dynamic=true`** on individual requests while the server remains in static mode.

If Prism were started in global dynamic mode, per-request `Prefer` headers can still tune behavior (see Prism docs for details).

### `x-faker` on schema properties

In **dynamic** mode, you can steer generated values by adding the **`x-faker`** extension to a property in your OpenAPI schema. The value is usually a **string** naming a Faker API path (dot notation), for example `name.firstName` or `image.imageUrl`. If the method does not exist, Prism falls back to JSON Schema Faker for that property.

Example schema fragment (adapted from Prism’s documentation):

```yaml
Pet:
  type: object
  properties:
    id:
      type: integer
      format: int64
    name:
      type: string
      x-faker: name.firstName
      example: doggie
    photoUrls:
      type: array
      items:
        type: string
        x-faker: image.imageUrl
```

With dynamic generation enabled for the request, two calls to the same URL can return different bodies; values for `name` and each `photoUrls` entry come from Faker instead of static placeholders:

```bash
curl -sS "http://127.0.0.1:4010/pets/123" -H "Prefer: dynamic=true"
```

Example response shape (values will differ each run):

```json
{
  "id": 12608726,
  "name": "Addison",
  "photoUrls": [
    "http://lorempixel.com/640/480",
    "http://lorempixel.com/640/480"
  ]
}
```

Richer schemas (types, `format`, constraints) generally produce more realistic mocks in both static and dynamic modes.

### Passing arguments to Faker via `x-faker`

When a Faker method takes options, **`x-faker` can be an object**: keys are method paths; values are named option objects or positional arrays, depending on the Faker API.

Named parameters (example from Prism’s docs):

```yaml
example:
  type: object
  properties:
    ten-or-eleven:
      type: number
      example: 10
      x-faker:
        datatype.number:
          min: 10
          max: 11
    slug:
      type: string
      example: two-words
      x-faker:
        helpers.slugify: ["two words"]
```

Positional arguments use a YAML list under the method name, for example:

```yaml
amount:
  type: string
  x-faker:
    finance.amount:
      - 100
      - 10000
      - 2
      - "$"
```

For string dates, Faker returns a human-readable string by default; combining **`x-faker`** with Open **`format`** (for example `date-time`) changes the serialized shape:

```yaml
due_date:
  type: string
  x-faker: date.past
  format: date-time
```

Example value:

```json
{
  "due_date": "2021-11-18T00:00:00.0Z"
}
```

### Spec-wide JSON Schema Faker options

At the **root** of the OpenAPI document you can set **`x-json-schema-faker`** to tune JSON Schema Faker (locale, array lengths, optional field probability, `fillProperties`, and other [documented options](https://github.com/json-schema-faker/json-schema-faker/tree/master/docs#available-options)). Prism also overrides some JSON Schema Faker defaults internally; see Prism’s [dynamic response guide](https://github.com/stoplightio/prism/blob/master/docs/guides/11-dynamic-response-with-faker.md) for the list.

### Faker version notes

Prism pins a **Faker v6**–compatible dependency range; minor version differences can change generated strings or URLs between machines. JSON Schema Faker bundles its own Faker dependency as well, which can affect fallback behavior when an `x-faker` method is invalid.

### Supported Faker methods

Use [Faker’s API reference](https://v6.fakerjs.dev/api/address.html) (v6 matches Prism’s documented range) to choose method names. Unknown or mistyped methods fall back to generic JSON Schema Faker generation for that property.
