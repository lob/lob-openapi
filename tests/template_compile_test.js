"use strict";

// standard setup, present in every test
const test = require("tape");
const Prism = require("./setup.js");

// test specific data
const resource_endpoint = "/templates";
const lobUri = "https://api.lob.com/v1";
const specFile = "./Lob-API-public.yml";

const prism = new Prism(specFile, lobUri, process.env.LOB_API_TEST_TOKEN);

// contract tests
test("create, compile, then delete a template", async function (t) {
  // create
  let response = await prism.setup().then((client) =>
    client.post(
      resource_endpoint,
      {
        description: "Compile Test Template",
        html: "<html>HTML Compile for {{name}}</html>",
      },
      { headers: prism.authHeader }
    )
  );

  t.equal(response.status, 200);
  const tmpl_endpoint = `${resource_endpoint}/${response.data.id}`;
  const tmpl_compile_endpoint = `${resource_endpoint}/${response.data.id}/compile`;

  // compile
  response = await prism.setup().then((client) =>
    client.get(
      `${tmpl_compile_endpoint}?merge_vars=${encodeURIComponent(
        JSON.stringify({
          name: "compile test",
        })
      )}`,
      { headers: prism.authHeader }
    )
  );

  t.equal(response.status, 200);
  t.equal(response.data, "<html>HTML Compile for compile test</html>");

  // delete - clean up template
  response = await prism
    .setup()
    .then((client) =>
      client.delete(tmpl_endpoint, { headers: prism.authHeader })
    );

  t.equal(response.status, 200);
});
