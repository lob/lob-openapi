"use strict";

const test = require("ava");
const Prism = require("./setup.js");

// test specific data
const resource_endpoint = "/identity_validation",
  company = "Lob HQ",
  primary_line = "210 King St",
  secondary_line = "",
  city = "San Francisco",
  state = "CA",
  zip_code = "94107",
  lobUri = "https://lob-api.lob.com/v1",
  specFile = "./lob-api-public.yml";

const prism = new Prism(specFile, lobUri, process.env.LOB_API_TEST_TOKEN);

test("validate recipient and address", async function (t) {
  try {
    const response = await prism.setup().then((client) =>
      client.post(
        resource_endpoint,
        {
          recipient: company,
          primary_line: primary_line,
          secondary_line: secondary_line,
          city: city,
          state: state,
          zip_code: zip_code,
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

test("validate company and address", async function (t) {
  try {
    const response = await prism.setup().then((client) =>
      client.post(
        resource_endpoint,
        {
          company: company,
          primary_line: primary_line,
          secondary_line: secondary_line,
          city: city,
          state: state,
          zip_code: zip_code,
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

test("absent recipient and company", async function (t) {
  try {
    const response = await prism.setup({ errors: false }).then((client) =>
      client.post(
        resource_endpoint,
        {
          primary_line: primary_line,
          secondary_line: secondary_line,
          city: city,
          state: state,
          zip_code: zip_code,
        },
        { headers: prism.authHeader }
      )
    );

    t.assert(response.status === 422);
    t.assert(response.data.error.message.includes("recipient"));
  } catch (prismError) {
    if (Object.keys(prismError).length > 0) {
      t.fail(JSON.stringify(prismError, null, 2));
    } else {
      t.fail(prismError.toString());
    }
  }
});
