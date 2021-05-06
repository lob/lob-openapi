"use strict";

const tape = require("tape");
const _test = require("tape-promise").default;
const test = _test(tape);
const Prism = require("./setup.js");

// test specific data
const resource_endpoint = "/us_autocompletions",
  address_prefix = "185 B",
  lobUri = "https://api.lob.com/v1",
  specFile = "./Lob-API-public.yml";

const prism = new Prism(specFile, lobUri, process.env.LOB_API_TEST_TOKEN);

test("autocomplete an address given a prefix", async function (t) {
  const response = await prism
    .setup()
    .then((client) =>
      client.post(
        resource_endpoint,
        { address_prefix: address_prefix },
        { headers: prism.authHeader }
      )
    );

  await t.doesNotReject(Promise.resolve(response));
  t.equal(response.status, 200);
});

test("errors when address_prefix is not passed in", async function (t) {
  const response = await prism
    .setup()
    .then((client) =>
      client.post(resource_endpoint, {}, { headers: prism.authHeader })
    );

  await t.rejects(Promise.reject(response));
  t.equal(response.status, 422);
  t.match(response.data.error.message, /address_prefix/);
});
