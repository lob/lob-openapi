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
        description: "Test Template Versions",
        html: "<html>HTML for other</html>",
      },
      { headers: prism.authHeader }
    )
  )
  .then((result) => {
    const tmpl_endpoint = `/templates/${result.data.id}`;
    const resource_endpoint = `${tmpl_endpoint}/versions`;

    test("list, create, retrieve, update then delete a new template version", async function (t) {
      // list version created when template was created
      let response = await prism
        .setup()
        .then((client) =>
          client.get(resource_endpoint, { headers: prism.authHeader })
        );

      t.equal(response.status, 200);

      // create new version
      response = await prism.setup().then((client) =>
        client.post(
          resource_endpoint,
          {
            description: "Updated Template",
            html: "<html>Updated HTML</html>",
          },
          { headers: prism.authHeader }
        )
      );

      t.equal(response.status, 200);
      const vrsn_endpoint = `${resource_endpoint}/${response.data.id}`;

      // retrieve
      response = await prism.setup().then((client) =>
        client.get(vrsn_endpoint, {
          headers: prism.authHeader,
        })
      );

      t.equal(response.status, 200);

      // update
      response = await prism
        .setup()
        .then((client) =>
          client.post(
            vrsn_endpoint,
            { description: "new description " },
            { headers: prism.authHeader }
          )
        );

      t.equal(response.status, 200);

      // delete
      response = await prism.setup().then((client) =>
        client.delete(vrsn_endpoint, {
          headers: prism.authHeader,
        })
      );

      t.equal(response.status, 200);

      // clean up template too!
      prism.setup().then((client) =>
        client.delete(tmpl_endpoint, {
          headers: prism.authHeader,
        })
      );
    });
  });
