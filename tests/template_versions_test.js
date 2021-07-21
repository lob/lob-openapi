"use strict";

// standard setup, present in every test
const test = require("ava");
const Prism = require("./setup.js");

// test specific data
const lobUri = "https://api.lob.com/v1",
  specFile = "./Lob-API-public.yml";

const prism = new Prism(specFile, lobUri, process.env.LOB_API_TEST_TOKEN);

let vrsn_endpoint = "";

test.serial.before(
  "create and update templates & endpoints to use in tests",
  async function (t) {
    t.plan(1);
    // create a template to use for test
    let result = await prism.setup().then((client) =>
      client.post(
        "/templates",
        {
          description: "Test Template Versions",
          html: "<html>HTML for other</html>",
        },
        { headers: prism.authHeader }
      )
    );

    // ADDED THESE IN HERE
    t.context.tmpl_endpoint = `/templates/${result.data.id}`;
    t.context.resource_endpoint = `${t.context.tmpl_endpoint}/versions`;

    let response = await prism.setup().then((client) =>
      client.post(
        t.context.resource_endpoint,
        {
          description: "Updated Template",
          html: "<html>Updated HTML</html>",
        },
        { headers: prism.authHeader }
      )
    );

    t.assert(response.status === 200);
    t.context.vrsn_endpoint = `${t.context.resource_endpoint}/${response.data.id}`;
  }
);

test.serial("retrieve a new template version", async function (t) {
  t.plan(1);
  let response = await prism.setup().then((client) =>
    client.get(t.context.vrsn_endpoint, {
      headers: prism.authHeader,
    })
  );

  t.assert(response.status === 200);
});

test.serial("update a new template version", async function (t) {
  t.plan(1);
  let response = await prism
    .setup()
    .then((client) =>
      client.post(
        t.context.vrsn_endpoint,
        { description: "new description " },
        { headers: prism.authHeader }
      )
    );

  t.assert(response.status === 200);
});

test.serial("list template versions", async function (t) {
  t.plan(1);
  let response = await prism
    .setup()
    .then((client) =>
      client.get(t.context.resource_endpoint, { headers: prism.authHeader })
    );

  t.assert(response.status === 200);
});

test.serial("delete template", async function (t) {
  t.plan(1);
  // delete
  let response = await prism.setup().then((client) =>
    client.delete(t.context.vrsn_endpoint, {
      headers: prism.authHeader,
    })
  );

  t.assert(response.status === 200);
});

test.after.always("clean up template", async function (t) {
  // clean up template too!
  let clean_up = await prism.setup().then((client) =>
    client.delete(t.context.tmpl_endpoint, {
      headers: prism.authHeader,
    })
  );
  t.assert(clean_up.status === 200);
});
