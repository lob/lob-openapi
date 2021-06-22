"use strict";

// standard setup, present in every test
const test = require("ava");
const Prism = require("./setup.js");

// test specific data
const resource_endpoint = "/bank_accounts",
  lobUri = "https://api.lob.com/v1",
  specFile = "./Lob-API-public.yml";

const prism = new Prism(specFile, lobUri, process.env.LOB_API_TEST_TOKEN);

// contract tests happy path
test("create, list, read, verify, then delete a bank_account", async function (t) {
  t.plan(6);
  const create = await prism.setup().then((client) =>
    client.post(
      resource_endpoint,
      {
        description: "Test Bank Account",
        routing_number: "322271627",
        account_number: "123456789",
        signatory: "Jane Doe",
        account_type: "individual",
      },
      { headers: prism.authHeader }
    )
  );
  t.assert(create.status === 200);

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

  const verify = await prism
    .setup()
    .then((client) =>
      client.post(
        `${resource_endpoint}/${create.data.id}/verify`,
        { amounts: [11, 35] },
        { headers: prism.authHeader }
      )
    );
  t.assert(verify.status === 200);
  t.assert(verify.data.verified);

  const remove = await prism.setup().then((client) =>
    client.delete(`${resource_endpoint}/${verify.data.id}`, {
      headers: prism.authHeader,
    })
  );
  t.assert(remove.status === 200);
});
