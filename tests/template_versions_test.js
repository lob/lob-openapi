"use strict";

// standard setup, present in every test
const test = require("tape");
const Prism = require("./setup.js");

// test specific data
const lobUri = "https://api.lob.com/v1",
  specFile = "./Lob-API-public.yml";

const prism = new Prism(specFile, lobUri, process.env.LOB_API_TEST_TOKEN);

// create a template to use for test
prism
  .setup()
  .then((client) =>
    client.post(
      "/templates",
      {
        description: "Test Template",
        html: "<html>HTML for {{name}}</html>",
      },
      { headers: prism.authHeader }
    )
  )
  .then((result) => {
    const tmpl_id = result.data.id;
    const resource_endpoint = `/templates/${tmpl_id}/versions`;

    // contract tests
    test("list the template version", async function (t) {
      const response = await prism
        .setup()
        .then((client) =>
          client.get(resource_endpoint, { headers: prism.authHeader })
        );

      t.equal(response.status, 200);
    });

    test("create, retrieve, then delete a new template version", async function (t) {
      const params = {
        description: "Updated Template",
        html: "<html>Updated HTML for {{name}}</html>",
      };

      // create
      let response = await prism
        .setup()
        .then((client) =>
          client.post(resource_endpoint, params, { headers: prism.authHeader })
        );

      t.equal(response.status, 200);
      const vrsn_id = response.data.id;

      // retrieve
      response = await prism.setup().then((client) =>
        client.get(`${resource_endpoint}/${vrsn_id}`, {
          headers: prism.authHeader,
        })
      );

      t.equal(response.status, 200);

      // delete
      response = await prism.setup().then((client) =>
        client.delete(`${resource_endpoint}/${vrsn_id}`, {
          headers: prism.authHeader,
        })
      );

      t.equal(response.status, 200);
    });

    // clean up template too!
    prism.setup().then((client) =>
      client.delete(`${resource_endpoint}/${tmpl_id}`, {
        headers: prism.authHeader,
      })
    );
  });
