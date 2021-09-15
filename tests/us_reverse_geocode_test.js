"use strict";

const test = require("ava");
const Prism = require("./setup.js");

// test specific data
const resource_endpoint = "/us_reverse_geocode_lookups",
  latitude = 37.777456,
  longitude = -122.393039,
  lobUri = "https://api.lob.com/v1",
  specFile = "./lob-api-public.yml";

const prism = new Prism(specFile, lobUri, process.env.LOB_API_TEST_TOKEN);

test("reverse geocode a location in SF", async function (t) {
  try {
    const response = await prism
      .setup()
      .then((client) =>
        client.post(
          resource_endpoint,
          { latitude: latitude, longitude: longitude },
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

test("use a string input rather than a float input", async function (t) {
  try {
    const response = await prism
      .setup({ errors: false })
      .then((client) =>
        client.post(
          resource_endpoint,
          { latitude: "37.777456", longitude: "-122.393039" },
          { headers: prism.authHeader }
        )
      );

    t.assert(response.status === 422);
    t.assert(response.data.error.message.includes("zip_code"));
  } catch (prismError) {
    if (Object.keys(prismError).length > 0) {
      t.fail(JSON.stringify(prismError, null, 2));
    } else {
      t.fail(prismError.toString());
    }
  }
});
