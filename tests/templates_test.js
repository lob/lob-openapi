"use strict";

// standard setup, present in every test
const test = require("ava");
const Prism = require("./setup.js");

// test specific data
const resource_endpoint = "/templates",
  lobUri = "https://lob-api.lob.com/v1",
  specFile = "./lob-api-public.yml";

const prism = new Prism(specFile, lobUri, process.env.LOB_API_TEST_TOKEN);

test.serial.before("fill out context", async function (t) {
  try {
    const response = await prism.setup().then((client) =>
      client.post(
        resource_endpoint,
        {
          description: "Test Template",
          html: "<html>HTML for {{name}}</html>",
        },
        { headers: prism.authHeader }
      )
    );
    t.context.tmpl_endpoint = `${resource_endpoint}/${response.data.id}`;
  } catch (prismError) {
    if (Object.keys(prismError).length > 0) {
      t.fail(JSON.stringify(prismError, null, 2));
    } else {
      t.fail(prismError.toString());
    }
  }
});

test.serial("retrieve template", async function (t) {
  try {
    let response = await prism
      .setup()
      .then((client) =>
        client.get(t.context.tmpl_endpoint, { headers: prism.authHeader })
      );

    t.assert(response.status === 200);
  } catch (prismError) {
    if (Object.keys(prismError).length > 0) {
      t.fail(JSON.stringify(prismError, null, 2));
    } else {
      t.fail(prismError.toString());
    }
  }
});

test.serial("create and update template", async function (t) {
  try {
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
  } catch (prismError) {
    if (Object.keys(prismError).length > 0) {
      t.fail(JSON.stringify(prismError, null, 2));
    } else {
      t.fail(prismError.toString());
    }
  }
});

test.serial("list templates", async function (t) {
  // list
  try {
    const response = await prism
      .setup()
      .then((client) =>
        client.get(resource_endpoint, { headers: prism.authHeader })
      );

    t.assert(response.status === 200);
  } catch (prismError) {
    if (Object.keys(prismError).length > 0) {
      t.fail(JSON.stringify(prismError, null, 2));
    } else {
      t.fail(prismError.toString());
    }
  }
});

test("list templates' params", async function (t) {
  const list = async (body) => {
    try {
      const response = await prism.setup().then((client) =>
        client.get(`${resource_endpoint}?${body}`, {
          headers: prism.authHeader,
        })
      );
      if (response.status === 422) console.log(response);
      t.assert(response.status === 200);
      return response.data;
    } catch (prismError) {
      if (Object.keys(prismError).length > 0) {
        t.fail(JSON.stringify(prismError, null, 2));
      } else {
        t.fail(prismError.toString());
      }
    }
  };

  /* ################## LIMIT ################## */

  const limit_body = new URLSearchParams({ limit: 4 });
  const limit_response = list(limit_body.toString());

  /* ################## BEFORE ################## */

  const before_body = new URLSearchParams({
    before:
      "eyJkYXRlT2Zmc2V0IjoiMjAyMS0wNy0yMVQxMjo0MDo0NS43NjNaIiwiaWRPZmZzZXQiOiJ0bXBsXzEwOWQ4YzZlZGIwNDgwOSJ9",
  });

  const before_response = list(before_body.toString());

  /* ################## AFTER ################## */

  const after_body = new URLSearchParams({
    after:
      "eyJkYXRlT2Zmc2V0IjoiMjAyMS0wNy0yMVQxMjo0MDo0NS43NjNaIiwiaWRPZmZzZXQiOiJ0bXBsXzEwOWQ4YzZlZGIwNDgwOSJ9",
  });

  const after_response = list(after_body.toString());

  /* ################## INCLUDE ################## */

  const include_body = new URLSearchParams({ "include[]": "total_count" });
  const include_response = list(include_body.toString());

  /* ################## METADATA ################## */

  const metadata_body = new URLSearchParams({ "metadata[name]": "Harry" });
  const metadata_response = list(metadata_body.toString());

  /* ################## DATE_CREATED ################## */

  const date_response = list(
    "date_created%5Blt%5D=2021-07-21T09%3A00%3A00.000Z&date_created%5Bgt%5D=2021-07-21T08%3A00%3A00.000Z"
  );

  /* ################## FULL ################## */

  const full_body = new URLSearchParams({
    limit: 2,
    after:
      "eyJkYXRlT2Zmc2V0IjoiMjAyMS0wNy0yMVQxMjo0MDo0NS43NjNaIiwiaWRPZmZzZXQiOiJ0bXBsXzEwOWQ4YzZlZGIwNDgwOSJ9",
    "include[]": "total_count",
    "metadata[name]": "Harry",
  });

  full_body.append("date_created[lt]", "2021-07-09T16:00:00.000Z");

  const full_response = list(full_body.toString());

  /* ################## RUN EVERYTHING ASYNC ################## */

  try {
    const finale = await Promise.all([
      limit_response,
      before_response,
      after_response,
      include_response,
      metadata_response,
      date_response,
      full_response,
    ]);

    t.assert(finale[0].count <= 4);
    t.assert(finale[3].hasOwnProperty("total_count"));
    t.assert(finale[6].hasOwnProperty("total_count"));
    t.assert(finale[6].count <= 2);
  } catch (prismError) {
    if (Object.keys(prismError).length > 0) {
      t.fail(JSON.stringify(prismError, null, 2));
    } else {
      t.fail(prismError.toString());
    }
  }
});

// contract tests
test.after.always("delete a template", async function (t) {
  // delete
  try {
    const response = await prism
      .setup()
      .then((client) =>
        client.delete(t.context.tmpl_endpoint, { headers: prism.authHeader })
      );

    t.assert(response.status === 200);
  } catch (prismError) {
    if (Object.keys(prismError).length > 0) {
      t.fail(JSON.stringify(prismError, null, 2));
    } else {
      t.fail(prismError.toString());
    }
  }
});
