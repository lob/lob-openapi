"use strict";

// standard setup, present in every test
const test = require("ava");
const Prism = require("./setup.js");

// test specific data
const resource_endpoint = "/billing_groups",
  lobUri = "https://api.lob.com/v1",
  specFile = "./Lob-API-public.yml";

const prism = new Prism(specFile, lobUri, process.env.LOB_API_TEST_TOKEN);
const payload = {
  name: "OpenAPI Test",
  description: "OpenAPI testing for Billing Groups",
};
let create = null;

// contract tests happy path
test("create, list, read, replace, update, then delete a billing_group", async function (t) {
  create = await prism
    .setup()
    .then((client) =>
      client.post(resource_endpoint, payload, { headers: prism.authHeader })
    );
  t.assert(create.status === 200);
  t.assert(create.data.name === payload.name);
  t.assert(create.data.description === payload.description);

  const list = await prism
    .setup()
    .then((client) =>
      client.get(resource_endpoint, { headers: prism.authHeader })
    );
  t.assert(list.status === 200);

  const read = await prism.setup().then((client) =>
    client.get(`${resource_endpoint}/${create.data.id}`, {
      headers: prism.authHeader,
    })
  );
  t.assert(read.status === 200);
  t.assert(create.data.name === payload.name);
  t.assert(create.data.description === payload.description);

  const replace = await prism.setup().then((client) =>
    client.post(
      `${resource_endpoint}/${create.data.id}`,
      {
        name: "Update Open Api Test",
      },
      { headers: prism.authHeader }
    )
  );
  t.assert(replace.status === 200);
  t.assert(replace.data.name === "Update Open Api Test");
});

// add any failure cases you need here
test("billing_group failure tests", async function (t) {
  // not sending required parameters
  const emptyCreatePayload = await prism
    .setup()
    .then((client) =>
      client.post(resource_endpoint, {}, { headers: prism.authHeader })
    );
  t.assert(emptyCreatePayload.status === 422);

  // sending wrong params to create
  const wrongParamCreate = await prism.setup().then((client) =>
    client.post(
      resource_endpoint,
      {
        foo: "bar",
      },
      { headers: prism.authHeader }
    )
  );
  t.assert(wrongParamCreate.status === 422);

  // sending wrong params to update
  const replace = await prism.setup().then((client) =>
    client.post(
      `${resource_endpoint}/${create.data.id}`,
      {
        foo: "bar",
      },
      { headers: prism.authHeader }
    )
  );
  t.assert(replace.status === 422);
});
