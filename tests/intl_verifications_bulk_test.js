"use strict";

// standard setup, present in every test
const test = require("ava");
const Prism = require("./setup.js");

// test specific data
const resource_endpoint = "/bulk/intl_verifications",
  lobUri = "https://lob-api.lob.com/v1",
  specFile = "./lob-api-public.yml";

const address = {
  primary_line: "370 Water St",
  city: "Summerside",
  state: "Prince Edwards Island",
  postal_code: "C1N 1C4",
  country: "CA",
};

const prism = new Prism(specFile, lobUri, process.env.LOB_API_LIVE_TOKEN);

test("verify list of valid international addresses", async function (t) {
  try {
    const response = await prism.setup().then((client) =>
      client.post(
        resource_endpoint,
        {
          addresses: [address],
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

test("verify list of valid international addresses with full payload", async function (t) {
  try {
    const response = await prism.setup().then((client) =>
      client.post(
        resource_endpoint,
        {
          addresses: [
            {
              ...address,
              recipient: "John Doe",
              secondary_line: "",
            },
          ],
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

test("errors when given an empty array", async function (t) {
  try {
    const response = await prism.setup({ errors: false }).then((client) =>
      client.post(
        resource_endpoint,
        {
          addresses: [],
        },
        { headers: prism.authHeader }
      )
    );

    t.assert(response.status === 422);
    t.assert(response.data.error.message.includes("items"));
  } catch (prismError) {
    if (Object.keys(prismError).length > 0) {
      t.fail(JSON.stringify(prismError, null, 2));
    } else {
      t.fail(prismError.toString());
    }
  }
});

test("errors when given more than 10 addresses", async function (t) {
  try {
    const addresses = Array(21).fill(address);

    const response = await prism.setup({ errors: false }).then((client) =>
      client.post(
        resource_endpoint,
        {
          addresses: addresses,
        },
        { headers: prism.authHeader }
      )
    );

    t.assert(response.status === 422);
    t.assert(response.data.error.message.includes("items"));
  } catch (prismError) {
    if (Object.keys(prismError).length > 0) {
      t.fail(JSON.stringify(prismError, null, 2));
    } else {
      t.fail(prismError.toString());
    }
  }
});
