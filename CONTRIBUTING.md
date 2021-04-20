# Contributing Guide

- [Introduction](#introduction)
- [Documentation Style](#documentation-style)
- [Adding a Form Factor (aka Resource)](#adding-a-form-factor-aka-resource)
  - [Generating a Resource Skeleton](#generating-a-resource-skeleton)
  - [Resource IDs](#resource-ids)
  - [Resource Structure](#resource-structure)
- [Adding a new route](#adding-a-new-route)
- [Contract Testing](#contract-testing)

## Introduction

To contribute, whether adding / modifying an endpoint or working on the tooling,
start by making a branch. (As we build out the full tooling in the roadmap,
everything will key off of the branch name, although that is not currently
relevant.)

`git checkout -b <name_of_branch>`

If you are adding or modifying endpoints, keep your work in the branch until the
feature is shipped in `lob-api`. Before the feature ships, you can generate a
[mock server](MOCKING.md) to assist in development.

This project uses CI/CD; as you push your branch to github, github actions will run tests and, if
those tests pass, build release artifacts (bundled spec, postman collection, ...) and push them
to your branch on github under the `dist/` directory. Because the CI/CD cycle on github pushes
additional commits to your branch, you will either need to pull those commits or force push (`git push -f`)
when pushing additional work to the branch. Don't be afraid to force push: the actions build each
artifact anew on each push.

## Documentation Style

The generated docs are in html, but the documentation is written in the `yml` files. In order to add things like lists, code highlighting, or hyperlinks, you need to use the markdown style of [CommonMark](https://commonmark.org/).

## Adding a Form Factor (aka Resource)

### Generating a Resource Skeleton

You can use the [Lob OpenAPI Generator](https://github.com/lob/generator-lob-openapi) to create the basic file structure needed to create a resource. The generator is built off of [Yeoman's](https://github.com/yeoman/yo) generator. This is how to set up the Lob OpenAPI generator the first time you use it:

1. `cd` out of your `lob-openapi` directory and run `git clone git@github.com:lob/generator-lob-openapi.git`.
2. Enter the generator repo: `cd generator-lob-openapi`.
3. Run `npm link` (you may see an error telling you that you are missing `husky` or another dependency; in which case, run `npm install`)
4. Go back to your OpenAPI repo: `cd /path/to/lob-openapi`
5. Run `npm link generator-lob-openapi`, which will connect the generator to OpenAPI locally
6. Run `yo lob-openapi:resource <resource_name>` and fill in the subsequent prompts with the pertinent information.

Below is an example of what running the `yo` command will produce when creating a sample resource, checks:

```bash
$ yo lob-openapi:resource checks
? Resource path? /checks
? Prefix in id? <enter for none> chk
   create shared/attributes/model_ids/chk_id.yml
   create resources/checks/models/check_editable.yml
   create resources/checks/models/check_updatable.yml
   create resources/checks/models/check.yml
   create resources/checks/responses/check.yml
   create resources/checks/responses/all_checks.yml
   create resources/checks/checks.yml
   create resources/checks/check.yml
   create tests/checks_test.js
checks scaffolded. Add paths to your spec file.
You will need to review the files added and customize them to your endpoint as needed.
```

### Resource IDs

These are unique identifiers which are associated with specific resources, such as letters or addresses. As shown in the previous section, resource IDs contain a prefix, which should be specified in [the docs](https://docs.lob.com/) under the relevant header. Resource IDs are stored as shared attributes, since they can be used in multiple places; there is a `model_ids` folder within `shared/attributes`. Here is an example of how a resource ID pattern is structured for postcard:

`pattern: "^psc_[a-zA-Z0-9]+$"`

### Resource Structure

Many resources have CREATE, RETRIEVE, DELETE/cancel, LIST, and/or UPDATE properties. Start by writing out create, then work on list/retrieve/update, and finish with list/cancel. For this section we will use the [Check resource documentation](https://docs.lob.com/#checks) as a reference.

The object described at the very beginning of the Checks section in the docs is what you will be returning (in the retrieve endpoint). Compare this to the check creation payload parameters so that you can find the commonalities between the two sets of properties. Then turn those commonalities into a `check_base.yml` file. For example, both the returned object and the creation parameters contain `to` and `from` fields, so they would be placed in `resources/checks/models/check_base.yml`.

The next step is to create `resources/checks/models/check_editable.yml`, which will contain all the properties unique to the check creation payload parameters list. Use the structure

```yaml
allOf:
  - $ref: "check_base.yml"
```

at the very top of the `check_editable.yml` file in order to import all the common properties you had previously extrapolated into the base file.

Repeat this process for `resources/checks/models/check.yml`, which will contain all the fields described only in the [check object at the top of the docs section](https://docs.lob.com/#checks_object).

Then navigate to the top-level `resources/checks/checks.yml`. It might initially seem confusing that there are both `check.yml` and `checks.yml` in the same place. `checks/checks.yml` should contain a `GET` and a `POST`––the `GET` is for retrieving a list of postcards, and the `POST` is for check creation. This latter part is what you should fill out first. For an example of how the creation `POST` request spec should look, check out `resources/checks/models/postcards.yml`.

LIST, RETRIEVE, and DELETE will follow similar patterns for most resources, so check out how they're organised in `resources/checks/models/postcards.yml` and `resources/checks/models/postcard.yml` in order to proceed with this.

In between adding to your resource, you should run `spectral lint Lob-API-public.yml` quite frequently. That way, you can catch linting errors easily rather than wasting an entire day poking around the code to hunt down a persistent error before discovering that it was an indentation issue (no, I'm not bitter or anything, why do you ask?).

## Adding a new Route

Sometimes you only need to add a new route to an existing resource. You will need to create a new file in the appropriate folder in `resources/`.

The response to that route will go into that resources `responses/` folder.

You then want to make sure that you add the new path in `Lob-API-public.yml` that will reference your new file, making sure that more specific paths happen first in the order they are listed..

## Documentation

## Contract Testing

We use [Prism](https://meta.stoplight.io/docs/prism/README.md) for contract testing, using the [Prism client](https://meta.stoplight.io/docs/prism/docs/guides/http-client.md). To run the existing tests locally:

- add a valid Lob test token to your environment as `LOB_API_TEST_TOKEN`. You can access test tokens in your [Dashboard settings](dashboard.lob.com).
- run `npm test`.

To manually add a test, look in the `tests/` directory for a file named for the resource with
the endpoint in question. If you used the generator, you can skip this step––the test file should already be present within `tests/`.

If you're using any local file inputs within your tests, place them in the `tests/assets/` folder. This is how I read from a local file within `postcards_test.js`:

```js
function streamToString(stream) {
  const chunks = [];
  return new Promise((resolve, reject) => {
    stream.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
    stream.on("error", (err) => reject(err));
    stream.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
  });
}

const files = fs.createReadStream(
  path.resolve(
    "tests/assets/customer-thank-you-postcard-template-4x6-front.html"
  )
);
const frontBack = await streamToString(files);
```

The contract tests run on github whenever you push to github and/or open a pull request.

During development of the spec for existing endpoints, you can run Prism as a [validation proxy](https://meta.stoplight.io/docs/prism/docs/getting-started/03-cli.md#proxy) by running `npm run proxy`.

```bash
$ npm run proxy
[1:20:53 PM] › [CLI] …  awaiting  Starting Prism…
[1:20:53 PM] › [CLI] ℹ  info      GET        http://127.0.0.1:4010/addresses/adr_D9V2vWn
[1:20:53 PM] › [CLI] ℹ  info      GET        http://127.0.0.1:4010/addresses?Limit=55
[1:20:53 PM] › [CLI] ▶  start     Prism is listening on http://127.0.0.1:4010
```

Once Prism is listening, you can issue http requests to the proxy port, in this
case `http://127.0.0.1:4010` using the client of your choice. I like
[httpie](https://httpie.io/docs#main-features), a user friendly client.

```bash
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
