"use strict";

// standard setup, present in every test
const test = require("ava");
const Prism = require("./setup.js");

// test specific data
const resource_endpoint = "/templates",
  lobUri = "https://api.lob.com/v1",
  specFile = "./Lob-API-public.yml";

const prism = new Prism(specFile, lobUri, process.env.LOB_API_TEST_TOKEN);

test.serial.before("fill out context", async function (t) {
  t.context.response = await prism.setup().then((client) =>
    client.post(
      resource_endpoint,
      {
        description: "Test Template",
        html: "<html>HTML for {{name}}</html>",
      },
      { headers: prism.authHeader }
    )
  );
});

// guaranteed to run after the first one
test.serial.before("fill out template endpoint", async function (t) {
  t.context.tmpl_endpoint = `${resource_endpoint}/${t.context.response.data.id}`;
});

test.serial("retrieve template", async function (t) {
  t.plan(1);
  let response = await prism
    .setup()
    .then((client) =>
      client.get(t.context.tmpl_endpoint, { headers: prism.authHeader })
    );

  t.assert(response.status === 200);
});

test.serial("create and update template", async function (t) {
  t.plan(2);
  // create new version
  let response = await prism.setup().then((client) =>
    client.post(
      `${t.context.tmpl_endpoint}/versions`,
      {
        description: "Newer Template",
        html: "<html>Updated HTML for {{name}}</html>",
      },
      { headers: prism.authHeader }
    )
  );
  // check creation, since original was done in non-test before hook
  t.assert(response.status === 200);
  const updated_version = response.data.id;

  // update template
  response = await prism.setup().then((client) =>
    client.post(
      t.context.tmpl_endpoint,
      {
        description: "Updated Template",
        published_version: updated_version,
      },
      { headers: prism.authHeader }
    )
  );
  t.assert(response.status === 200);
});

test.serial("list templates", async function (t) {
  t.plan(1);
  // list
  let response = await prism
    .setup()
    .then((client) =>
      client.get(resource_endpoint, { headers: prism.authHeader })
    );

  t.assert(response.status === 200);
});

// contract tests
test.serial("delete a template", async function (t) {
  t.plan(1);
  // delete
  let response = await prism
    .setup()
    .then((client) =>
      client.delete(t.context.tmpl_endpoint, { headers: prism.authHeader })
    );

  t.assert(response.status === 200);
});
