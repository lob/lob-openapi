"use strict";

// standard setup, present in every test
const test = require("ava");
const Prism = require("./setup.js");

// test specific data
const resource_endpoint = "/templates";
const lobUri = "https://api.lob.com/v1";
const specFile = "./Lob-API-public.yml";

const prism = new Prism(specFile, lobUri, process.env.LOB_API_TEST_TOKEN);

test.serial.before("create template and endpoints", async function (t) {
  try {
    const response = await prism.setup().then((client) =>
      client.post(
        resource_endpoint,
        {
          description: "Compile Test Template",
          html: "<html>HTML Compile for {{name}}</html>",
        },
        { headers: prism.authHeader }
      )
    );

    t.assert(response.status === 200);

    t.context.tmpl_endpoint = `${resource_endpoint}/${response.data.id}`;
    t.context.tmpl_compile_endpoint = `${resource_endpoint}/${response.data.id}/compile`;
  } catch (prismError) {
    console.error(prismError);
    t.assert(false);
  }
});

test.serial("compile a template", async function (t) {
  try {
    const response = await prism.setup().then((client) =>
      client.get(
        `${t.context.tmpl_compile_endpoint}?merge_vars=${encodeURIComponent(
          JSON.stringify({
            name: "compile test",
          })
        )}`,
        { headers: prism.authHeader }
      )
    );

    t.assert(response.status === 200);
    t.assert(response.data === "<html>HTML Compile for compile test</html>");
  } catch (prismError) {
    console.error(prismError);
    t.assert(false);
  }
});

// contract tests
test.serial("delete a template", async function (t) {
  try {
    let response = await prism
      .setup()
      .then((client) =>
        client.delete(t.context.tmpl_endpoint, { headers: prism.authHeader })
      );

    t.assert(response.status === 200);
  } catch (prismError) {
    console.error(prismError);
    t.assert(false);
  }
});
