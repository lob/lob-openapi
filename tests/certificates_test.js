"use strict";

// standard setup, present in every test
const tape = require("tape");
const _test = require("tape-promise").default;
const test = _test(tape);
const Prism = require("./setup.js");

// test specific data
const resource_endpoint = "/certificates",
  lobUri = "https://api.lob.com/v1",
  specFile = "./Lob-API-public.yml";

const prism = new Prism(specFile, lobUri, process.env.LOB_API_TEST_TOKEN);

// contract tests
test("create, list, retrieve, update, then delete a certificate", async function (t) {
  // create
  let response = await prism.setup().then((client) =>
    client.post(
      resource_endpoint,
      {
        name: "Lob PEM Key",
        description: "Test PEM Key",
        cert: "--Key--",
      },
      { headers: prism.authHeader }
    )
  );

  await t.doesNotReject(Promise.resolve(response));
  t.equal(response.status, 201);
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

  // update certificate
  response = await prism.setup().then((client) =>
    client.patch(
      tmpl_endpoint,
      {
        description: "Updated PEM Key",
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
