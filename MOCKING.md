# Mocking your API

TL;DR Stand up a mock server using the contract defined in your OpenAPI v3
specification by running `npm run mock`. The mock server can then be used to
respond to API calls when developing any service which consumes the API.

The mock server includes [limited support for mocking callbacks.](https://meta.stoplight.io/docs/prism/docs/guides/04-callbacks.md)

## Working with the Prism mock server

The mock server [validates requests](https://meta.stoplight.io/docs/prism/docs/guides/02-request-validation.md) and
[generates responses.](https://meta.stoplight.io/docs/prism/docs/guides/01-mocking.md#response-generation)

By default, the mock server uses [static response generation](https://meta.stoplight.io/docs/prism/docs/guides/01-mocking.md#static-response-generation), constructing responses from the examples in the spec, falling back to the
definitions when no example is available. The server respects content negotiation and gives preference to a response example
if it exists. You can also include multiple examples for a response and select one by name. Note that rich example sets are picked
up by the documentation generator and improve our customers' experience.

Prism also supports [dynamic response generation.](https://meta.stoplight.io/docs/prism/docs/guides/01-mocking.md#dynamic-response-generation)
By default, Prism generates responses based on the type and format of properties. You can use the `x-faker` extension
to exert direct control over the [Faker.js](https://github.com/marak/Faker.js) methods used to generate values for specific
properties. To run the mock server in dynamic mode, reconfigure it to be dynamic: `npm config set lob-openapi:--dynamic true`

Once the mock server is running, you can issue requests to the server
at the configured port, by default `http://127.0.0.1:4010`.

Running the mock server locally on demand is useful for design and
debugging. For test suites, we will be extracting a test harness
that will support running tests using the mock server in a later update.

## References

- [HTTP Mocking](https://meta.stoplight.io/docs/prism/docs/guides/01-mocking.md)
- [Request Validation](https://meta.stoplight.io/docs/prism/docs/guides/02-request-validation.md)
- [Mocking Callbacks](https://meta.stoplight.io/docs/prism/docs/guides/04-callbacks.md)
