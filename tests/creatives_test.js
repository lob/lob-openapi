"use strict";

// standard setup, present in every test
const test = require("ava");
const Prism = require("./setup.js");
const fs = require("fs");

// test specific data
const resource_endpoint = "/creatives",
  lobUri = "https://api.lob.com/v1",
  specFile = "./lob-api-public.yml";

const prism = new Prism(specFile, lobUri, process.env.LOB_API_TEST_TOKEN);

test.serial.before("create campaign", async function (t) {
  try {
    const result = await prism.setup().then((client) =>
      client.post(
        "/campaigns",
        {
          name: "lob-openapi creatives campaign",
          schedule_type: "immediate",
        },
        { headers: prism.authHeader }
      )
    );

    t.context.cmp_id = result.data.id;
  } catch (prismError) {
    if (Object.keys(prismError).length > 0) {
      t.fail(JSON.stringify(prismError, null, 2));
    } else {
      t.fail(prismError.toString());
    }
  }
});

test("create, retrieve, and update a creative", async function (t) {
  try {
    // create
    let response = await prism.setup().then((client) =>
      client.post(
        resource_endpoint,
        {
          campaign_id: "cmp_60c33dc5d6674b22",
          resource_type: "letter",
          details: {
            color: true,
          },
          description: "lob-openapi creative",
          from: {
            company: "Lob (old)",
            address_line1: "210 King St",
            address_line2: "# 6100",
            address_city: "San Francisco",
            address_state: "CA",
            address_zip: "94107",
            address_country: "US",
          },
          file: fs.readFile("tests/assets/us_letter_1pg.pdf", (err, data) => {
            if (err) throw err;
            return data;
          }),
          metadata: {
            name: "Harry Zhang",
          },
        },
        {
          headers: { ...prism.authHeader, "x-lang-output": "match" },
        }
      )
    );

    t.assert(response.status === 200);

    const crv_id = response.data.id;

    // retrieve
    response = await prism.setup().then((client) =>
      client.get(`${resource_endpoint}/${crv_id}`, {
        headers: prism.authHeader,
      })
    );

    t.assert(response.status === 200);

    // update
    response = await prism.setup().then((client) =>
      client.patch(
        `${resource_endpoint}/${crv_id}`,
        {
          description: "lob-openapi Updated creative",
        },
        {
          headers: prism.authHeader,
        }
      )
    );

    t.assert(response.status === 200);
    t.assert(response.data.description === "lob-openapi Updated creative");
  } catch (prismError) {
    if (Object.keys(prismError).length > 0) {
      t.fail(JSON.stringify(prismError, null, 2));
    } else {
      t.fail(prismError.toString());
    }
  }
});

test("errors when details is not passed in", async function (t) {
  try {
    const response = await prism.setup({ errors: false }).then((client) =>
      client.post(
        resource_endpoint,
        {
          campaign_id: t.context.cmp_id,
          resource_type: "letter",
        },
        { headers: prism.authHeader }
      )
    );

    t.assert(response.status === 422);
    t.assert(response.data.error.message.includes("details"));
  } catch (prismError) {
    if (Object.keys(prismError).length > 0) {
      t.fail(JSON.stringify(prismError, null, 2));
    } else {
      t.fail(prismError.toString());
    }
  }
});

test.after.always("delete campaign", async function (t) {
  try {
    const deleted_campaign = await prism.setup().then((client) =>
      client.delete(`/campaigns/${t.context.cmp_id}`, {
        headers: prism.authHeader,
      })
    );
    t.assert(deleted_campaign.status === 200);
  } catch (prismError) {
    if (Object.keys(prismError).length > 0) {
      t.fail(JSON.stringify(prismError, null, 2));
    } else {
      t.fail(prismError.toString());
    }
  }
});
