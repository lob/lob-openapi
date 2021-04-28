"use strict";

// standard setup, present in every test
const test = require("tape");
const Prism = require("./setup.js");

// test specific data
const resource_endpoint = "/bank_accounts",
  lobUri = "https://api.lob.com/v1",
  specFile = "./Lob-API-public.yml";

const prism = new Prism(specFile, lobUri, process.env.LOB_API_TEST_TOKEN);

// contract tests happy path
test("create, list, read, verify, then delete a bank_account", async function (t) {
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
  // note: existing endpoints return 200 on success. All new endpoints should
  // return 201 ("created")
  t.equal(create.status, 200);

  const list = await prism
    .setup()
    .then((client) =>
      client.get(resource_endpoint, { headers: prism.authHeader })
    );
  t.equal(list.status, 200);

  const read = await prism.setup().then((client) =>
    client.get(`${resource_endpoint}/${create.data.id}`, {
      headers: prism.authHeader,
    })
  );
  t.equal(read.status, 200);

  const verify = await prism
    .setup()
    .then((client) =>
      client.post(
        `${resource_endpoint}/${create.data.id}/verify`,
        { amounts: [11, 35] },
        { headers: prism.authHeader }
      )
    );
  t.equal(verify.status, 200);
  t.equal(verify.data.verified, true);

  const remove = await prism.setup().then((client) =>
    client.delete(`${resource_endpoint}/${verify.data.id}`, {
      headers: prism.authHeader,
    })
  );
  t.equal(remove.status, 200);
});
