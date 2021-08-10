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

// contract tests happy path
test.serial.before("create a billing_group", async function (t) {
  t.plan(3);
  // JSON.stringify(slackError, null, 2)
  const create = await prism
    .setup({ errors: false })
    .then((client) =>
      client.post(resource_endpoint, payload, { headers: prism.authHeader })
    );
  t.assert(create.status === 200);
  t.assert(create.data.name === payload.name);
  t.assert(create.data.description === payload.description);

  t.context.create_id = create.data.id;
});

test.serial.before("list billing_groups", async function (t) {
  t.plan(1);
  const list = await prism
    .setup({ errors: false })
    .then((client) =>
      client.get(resource_endpoint, { headers: prism.authHeader })
    );
  t.assert(list.status === 200);
});

test.serial.before("read a billing_group", async function (t) {
  t.plan(3);
  const read = await prism.setup({ errors: false }).then((client) =>
    client.get(`${resource_endpoint}/${t.context.create_id}`, {
      headers: prism.authHeader,
    })
  );
  t.assert(read.status === 200);
  t.assert(read.data.name === payload.name);
  t.assert(read.data.description === payload.description);
});

test.serial.before("update a billing_group", async function (t) {
  t.plan(2);
  const update = await prism.setup({ errors: false }).then((client) =>
    client.post(
      `${resource_endpoint}/${t.context.create_id}`,
      {
        name: "Update Open Api Test",
      },
      { headers: prism.authHeader }
    )
  );
  t.assert(update.status === 200);
  t.assert(update.data.name === "Update Open Api Test");
});

// add any failure cases you need here
test.serial("billing_group failure tests", async function (t) {
  t.plan(1);
  // not sending required parameters
  const emptyCreatePayload = await prism
    .setup({ errors: false })
    .then((client) =>
      client.post(resource_endpoint, {}, { headers: prism.authHeader })
    );
  t.assert(emptyCreatePayload.status === 422);
  // t.assert(emptyCreatePayload.status === 422);
});
