"use strict";

const test = require("ava");
const Prism = require("./setup.js");

// test specific data
const resource_endpoint = "/us_autocompletions",
  address_prefix = "185 B",
  lobUri = "https://api.lob.com/v1",
  specFile = "./lob-api-public.yml";

const prism = new Prism(specFile, lobUri, process.env.LOB_API_TEST_TOKEN);

test("autocomplete an address given a prefix", async function (t) {
  try {
    const response = await prism
      .setup()
      .then((client) =>
        client.post(
          resource_endpoint,
          { address_prefix: address_prefix },
          { headers: prism.authHeader }
        )
      );

    t.assert(response.status === 200);
  } catch (prismError) {
    if (Object.keys(prismError).length > 0) {
      t.fail(JSON.stringify(prismError, null, 2));
    } else {
      t.fail(prismError.toString());
    }
  }
});

test("autocomplete an address given a prefix with full payload", async function (t) {
  try {
    const response = await prism.setup().then((client) =>
      client.post(
        resource_endpoint,
        {
          address_prefix: address_prefix,
          city: "San Francisco",
          state: "CA",
          zip_code: "94107",
          geo_ip_sort: false,
        },
        { headers: prism.authHeader }
      )
    );

    t.assert(response.status === 200);
  } catch (prismError) {
    if (Object.keys(prismError).length > 0) {
      t.fail(JSON.stringify(prismError, null, 2));
    } else {
      t.fail(prismError.toString());
    }
  }
});

test("autocomplete an address given a prefix with full payload urlencoded", async function (t) {
  try {
    const payload = new URLSearchParams({
      address_prefix: address_prefix,
      city: "San Francisco",
      state: "CA",
      zip_code: "94107",
      geo_ip_sort: false,
    }).toString();

    const response = await prism.setup().then((client) =>
      client.post(resource_endpoint, payload, {
        headers: {
          ...prism.authHeader,
          "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
        },
      })
    );

    t.assert(response.status === 200);
  } catch (prismError) {
    if (Object.keys(prismError).length > 0) {
      t.fail(JSON.stringify(prismError, null, 2));
    } else {
      t.fail(prismError.toString());
    }
  }
});

test("errors when address_prefix is not passed in", async function (t) {
  try {
    const response = await prism
      .setup({ errors: false })
      .then((client) =>
        client.post(resource_endpoint, {}, { headers: prism.authHeader })
      );

    t.assert(response.status === 422);
    t.assert(response.data.error.message.includes("address_prefix"));
  } catch (prismError) {
    if (Object.keys(prismError).length > 0) {
      t.fail(JSON.stringify(prismError, null, 2));
    } else {
      t.fail(prismError.toString());
    }
  }
});
