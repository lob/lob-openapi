"use strict";

const test = require("ava");
const Prism = require("./setup.js");

// test specific data
const resource_endpoint = "/us_zip_lookups",
  zip = "94107",
  lobUri = "https://lob-api.lob.com/v1",
  specFile = "./lob-api-public.yml";

const prism = new Prism(specFile, lobUri, process.env.LOB_API_TEST_TOKEN);

test("lookup a US zip code", async function (t) {
  try {
    const response = await prism
      .setup()
      .then((client) =>
        client.post(
          resource_endpoint,
          { zip_code: zip },
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

test("use an incorrectly formatted zip code", async function (t) {
  try {
    const response = await prism
      .setup({ errors: false })
      .then((client) =>
        client.post(
          resource_endpoint,
          { zip_code: "123456" },
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
