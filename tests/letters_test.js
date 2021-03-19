"use strict";

// standard setup, present in every test
const test = require("tape");
const Prism = require("./setup.js");

// test specific data
const resource_endpoint = "/letters",
  lobUri = "https://api.lob.com/v1",
  specFile = "./Lob-API-public.yml";

const prism = new Prism(specFile, lobUri, process.env.LOB_API_TEST_TOKEN);

// contract tests happy path
test("create, list, read, replace, update, then delete a letter", async function (t) {
  // create
  let response = await prism.setup().then((client) =>
    client.post(
      resource_endpoint,
      {
        // your writable properties here
      },
      { headers: prism.authHeader }
    )
  );
  t.equal(response.status, 200);

  // read, replace, update and delete created endpoint
  const ltr_endpoint = `${resource_endpoint}/${response.data.id}`;

  // list
  response = await prism
    .setup()
    .then((client) =>
      client.get(resource_endpoint, { headers: prism.authHeader })
    );
  t.equal(response.status, 200);

  // read
  response = await prism
    .setup()
    .then((client) => client.get(ltr_endpoint, { headers: prism.authHeader }));
  t.equal(response.status, 200);

  // cancel
  response = await prism
    .setup()
    .then((client) =>
      client.delete(ltr_endpoint, { headers: prism.authHeader })
    );
  t.equal(response.status, 200);
});

// add any failure cases you need here
// cancel letter w/o send_date header
