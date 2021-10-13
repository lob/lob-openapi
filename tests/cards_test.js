"use strict";

// standard setup, present in every test
const test = require("ava");
const Prism = require("./setup.js");

// test specific data
const resource_endpoint = "/cards",
  lobUri = "https://api.lob.com/v1",
  specFile = "./lob-api-public.yml";

const prism = new Prism(specFile, lobUri, process.env.LOB_API_TEST_TOKEN);
/* NOTE: DELETE ANY TESTS THAT DON'T APPLY TO YOUR RESOURCE */

// contract tests happy path
test("perform action on card", async function (t) {
  try {
    t.context.create = await prism.setup().then((client) =>
      client.post(
        resource_endpoint,
        {
          // your editable properties here
        },
        { headers: prism.authHeader }
      )
    );
    t.assert(t.context.create.status === 200);
  } catch (prismError) {
    if (Object.keys(prismError).length > 0) { // if the error has properties, it can be JSON.stringified
      t.fail(JSON.stringify(prismError, null, 2));
    } else {
      t.fail(prismError.toString());
    }
  }
});

// add any tests checking input variations here

// add any failure cases you need here
