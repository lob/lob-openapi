"use strict";

// standard setup, present in every test
const test = require("ava");
const Prism = require("./setup.js");

// test specific data
const resource_endpoint = "/bulk/us_verifications",
  lobUri = "https://api.lob.com/v1",
  specFile = "./Lob-API-public.yml";

const address = {
  primary_line: "185 BERRY ST",
  city: "SAN FRANCISCO",
  state: "CA",
  zip_code: "94107",
};

const prism = new Prism(specFile, lobUri, process.env.LOB_API_LIVE_TOKEN);

test("verify list of valid US addresses", async function (t) {
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
});

test("verify list of valid US addresses with full payload", async function (t) {
  const response = await prism.setup().then((client) =>
    client.post(
      resource_endpoint,
      {
        addresses: [
          {
            recipient: "Walgreens",
            primary_line: "Ave Wilson Churchill 123",
            secondary_line: "",
            urbanization: "URB FAIR OAKS",
            city: "RIO PIEDRAS",
            state: "PR",
            zip_code: "00926",
          },
        ],
      },
      { headers: prism.authHeader }
    )
  );

  t.assert(response.status === 200);
});

test("errors when given an empty array", async function (t) {
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
});

test("errors when given more than 10 addresses", async function (t) {
  const addresses = Array(11).fill(address);

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
});
