"use strict";

// standard setup, present in every test
const tape = require("tape");
const _test = require("tape-promise").default;
const test = _test(tape);
const Prism = require("./setup.js");

// test specific data
const resource_endpoint = "/checks",
  lobUri = "https://api.lob.com/v1",
  specFile = "./Lob-API-public.yml";

const prism = new Prism(specFile, lobUri, process.env.LOB_API_TEST_TOKEN);

// We need a verified bank account to create a check, so let's make that first
prism
  .setup()
  .then((client) =>
    client.post(
      "/bank_accounts",
      {
        description: "Test Bank Account",
        routing_number: "322271627",
        account_number: "123456789",
        signatory: "Jane Doe",
        account_type: "individual",
      },
      { headers: prism.authHeader }
    )
  )
  .then((result) => {
    const bank_id = result.data.id;

    test("validate bank account to use for checks", async function (t) {
      const verify = await prism
        .setup()
        .then((client) =>
          client.post(
            `/bank_accounts/${bank_id}/verify`,
            { amounts: [42, 12] },
            { headers: prism.authHeader }
          )
        );
      await t.doesNotReject(Promise.resolve(verify));
      t.equal(verify.status, 200);
    });

    test("create, list, read then delete a check", async function (t) {
      const create = await prism.setup().then((client) =>
        client.post(
          resource_endpoint,
          {
            description: "Demo Check",
            to: {
              company: "Lob (old)",
              address_line1: "185 Berry St",
              address_line2: "# 6100",
              address_city: "San Francisco",
              address_state: "CA",
              address_zip: "94107",
              address_country: "US",
            },
            from: {
              company: "Lob (new)",
              address_line1: "210 King St",
              address_city: "San Francisco",
              address_state: "CA",
              address_zip: "94107",
              address_country: "US",
            },
            bank_account: bank_id,
            amount: 101.01,
            memo: "poodles",
          },
          { headers: prism.authHeader }
        )
      );
      t.equal(create.status, 200);

      await t.doesNotReject(Promise.resolve(create));
      t.equal(create.status, 200);

      const list = await prism
        .setup()
        .then((client) =>
          client.get(resource_endpoint, { headers: prism.authHeader })
        );
      t.equal(list.status, 200);

      await t.doesNotReject(Promise.resolve(list));
      t.equal(list.status, 200);

      const read = await prism.setup().then((client) =>
        client.get(`${resource_endpoint}/${create.data.id}`, {
          headers: prism.authHeader,
        })
      );
      t.equal(read.status, 200);

      await t.doesNotReject(Promise.resolve(read));
      t.equal(read.status, 200);

      const remove = await prism.setup().then((client) =>
        client.delete(`${resource_endpoint}/${read.data.id}`, {
          headers: prism.authHeader,
        })
      );
      t.equal(remove.status, 200);

      await t.doesNotReject(Promise.resolve(remove));
      t.equal(remove.status, 200);

      prism.setup().then((client) =>
        client.delete(`/bank_accounts/${bank_id}`, {
          headers: prism.authHeader,
        })
      );
    });
  });
