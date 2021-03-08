"use strict";

// standard setup, present in every test
const test = require("tape");
const Prism = require("./setup.js");

// test specific data
const resource_endpoint = "/templates",
  lobUri = "https://api.lob.com/v1",
  specFile = "./Lob-API-public.yml";

const prism = new Prism(specFile, lobUri, process.env.LOB_API_TEST_TOKEN);

// contract tests
test("create, list, retrieve, then delete a template", async function (t) {
  const params = {
    description: "Test Template",
    html: "<html>HTML for {{name}}</html>",
  };

  // create
  let response = await prism
    .setup()
    .then((client) =>
      client.post(resource_endpoint, params, { headers: prism.authHeader })
    );

  t.equal(response.status, 200);
  const tmpl_id = response.data.id;

  // list
  response = await prism
    .setup()
    .then((client) =>
      client.get(resource_endpoint, { headers: prism.authHeader })
    );

  t.equal(response.status, 200);

  // retrieve
  response = await prism.setup().then((client) =>
    client.get(`${resource_endpoint}/${tmpl_id}`, {
      headers: prism.authHeader,
    })
  );

  t.equal(response.status, 200);

  // delete
  response = await prism.setup().then((client) =>
    client.delete(`${resource_endpoint}/${tmpl_id}`, {
      headers: prism.authHeader,
    })
  );

  t.equal(response.status, 200);
});
