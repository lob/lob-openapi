"use strict";

// standard setup, present in every test
const tape = require("tape");
const _test = require("tape-promise").default;
const test = _test(tape);
const Prism = require("./setup.js");

// test specific data
const resource_endpoint = "/templates",
  lobUri = "https://api.lob.com/v1",
  specFile = "./Lob-API-public.yml";

const prism = new Prism(specFile, lobUri, process.env.LOB_API_TEST_TOKEN);

// contract tests
test("create, list, retrieve, update, then delete a template", async function (t) {
  // create
  let response = await prism.setup().then((client) =>
    client.post(
      resource_endpoint,
      {
        description: "Test Template",
        html: "<html>HTML for {{name}}</html>",
      },
      { headers: prism.authHeader }
    )
  );

  await t.doesNotReject(Promise.resolve(response));
  t.equal(response.status, 200);
  const tmpl_endpoint = `${resource_endpoint}/${response.data.id}`;

  // list
  response = await prism
    .setup()
    .then((client) =>
      client.get(resource_endpoint, { headers: prism.authHeader })
    );

  await t.doesNotReject(Promise.resolve(response));
  t.equal(response.status, 200);

  // retrieve
  response = await prism
    .setup()
    .then((client) => client.get(tmpl_endpoint, { headers: prism.authHeader }));

  await t.doesNotReject(Promise.resolve(response));
  t.equal(response.status, 200);

  // update
  // create new version
  response = await prism.setup().then((client) =>
    client.post(
      `${tmpl_endpoint}/versions`,
      {
        description: "Newer Template",
        html: "<html>Updated HTML for {{name}}</html>",
      },
      { headers: prism.authHeader }
    )
  );
  const updated_version = response.data.id;

  // update template
  response = await prism.setup().then((client) =>
    client.post(
      tmpl_endpoint,
      {
        description: "Updated Template",
        published_version: updated_version,
      },
      { headers: prism.authHeader }
    )
  );

  await t.doesNotReject(Promise.resolve(response));
  t.equal(response.status, 200);

  // delete
  response = await prism
    .setup()
    .then((client) =>
      client.delete(tmpl_endpoint, { headers: prism.authHeader })
    );

  await t.doesNotReject(Promise.resolve(response));
  t.equal(response.status, 200);
});
