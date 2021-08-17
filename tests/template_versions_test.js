"use strict";

// standard setup, present in every test
const test = require("ava");
const Prism = require("./setup.js");

// test specific data
const lobUri = "https://api.lob.com/v1",
  specFile = "./Lob-API-public.yml";

const prism = new Prism(specFile, lobUri, process.env.LOB_API_TEST_TOKEN);

let vrsn_endpoint = "/templates/tmpl_bdaadfdffd1938e/versions";

test.serial.before(
  "create and update templates & endpoints to use in tests",
  async function (t) {
    try {
      // create a template to use for test
      const result = await prism.setup().then((client) =>
        client.post(
          "/templates",
          {
            description: "Test Template Versions",
            html: "<html>HTML for other</html>",
          },
          { headers: prism.authHeader }
        )
      );

      t.context.tmpl_endpoint = `/templates/${result.data.id}`;
      t.context.resource_endpoint = `${t.context.tmpl_endpoint}/versions`;

      const response = await prism.setup().then((client) =>
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
    } catch (prismError) {
      if (Object.keys(prismError).length > 0) {
        t.fail(JSON.stringify(prismError, null, 2));
      } else {
        t.fail(prismError.toString());
      }
    }
  }
);

test.serial("retrieve a new template version", async function (t) {
  try {
    const response = await prism.setup().then((client) =>
      client.get(t.context.vrsn_endpoint, {
        headers: prism.authHeader,
      })
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

test.serial("update a new template version", async function (t) {
  try {
    const response = await prism
      .setup()
      .then((client) =>
        client.post(
          t.context.vrsn_endpoint,
          { description: "new description " },
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

test.serial("list template versions", async function (t) {
  try {
    const response = await prism
      .setup()
      .then((client) =>
        client.get(t.context.resource_endpoint, { headers: prism.authHeader })
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

test.serial("list template versions' params", async function (t) {
  const list = async (body) => {
    try {
      const response = await prism.setup().then((client) =>
        client.get(`${vrsn_endpoint}?${body}`, {
          headers: prism.authHeader,
        })
      );
      t.assert(response.status === 200);
      return response.data;
    } catch (prismError) {
      if (Object.keys(prismError).length > 0) {
        t.fail(JSON.stringify(prismError, null, 2));
      } else {
        t.fail(prismError.toString());
        return prismError;
      }
    }
  };

  /* ################## LIMIT ################## */

  const limit_body = new URLSearchParams({ limit: 6 });
  const limit_response = list(limit_body.toString());

  /* ################## BEFORE ################## */

  const before_body = new URLSearchParams({
    before:
      "eyJkYXRlT2Zmc2V0IjoiMjAyMS0wNy0yMVQwODowMzo0Ny42NThaIiwiaWRPZmZzZXQiOiJ0bXBsXzM1MGQxNDZlZjhiMDI1NCJ9",
  });

  const before_response = list(before_body.toString());

  /* ################## AFTER ################## */

  const after_body = new URLSearchParams({
    after:
      "eyJkYXRlT2Zmc2V0IjoiMjAyMS0wNy0yMVQxMzowNjo0MC45NjdaIiwiaWRPZmZzZXQiOiJ0bXBsX2QwZjdkODExYWQxYWQyZCJ9",
  });

  const after_response = list(after_body.toString());

  /* ################## INCLUDE ################## */

  const include_body = new URLSearchParams({ "include[]": "total_count" });
  const include_response = list(include_body.toString());

  /* ################## DATE_CREATED ################## */

  const date_response = list(
    "date_created%5Bgte%5D=2021-07-21T11%3A10%3A00.000Z"
  );

  /* ################## FULL ################## */

  const full_body = new URLSearchParams({
    limit: 2,
    before:
      "eyJkYXRlT2Zmc2V0IjoiMjAyMS0wNy0yMVQwODowMzo0Ny42NThaIiwiaWRPZmZzZXQiOiJ0bXBsXzM1MGQxNDZlZjhiMDI1NCJ9",
    "include[]": "total_count",
  });

  full_body.append("date_created[lt]", "2021-07-21T11:32:00.000Z");

  const full_response = list(full_body.toString());

  /* ################## RUN EVERYTHING ASYNC ################## */

  try {
    const finale = await Promise.all([
      limit_response,
      before_response,
      after_response,
      include_response,
      date_response,
      full_response,
    ]);

    t.assert(finale[0].count <= 6);
    t.assert(finale[1].count === 1);
    t.assert(finale[2].count === 1);
    t.assert(finale[3].hasOwnProperty("total_count"));
    t.assert(finale[4].count === 0);
    t.assert(finale[5].count === 1);
    t.assert(finale[5].hasOwnProperty("total_count"));
  } catch (prismError) {
    if (Object.keys(prismError).length > 0) {
      t.fail(JSON.stringify(prismError, null, 2));
    } else {
      t.fail(prismError.toString());
    }
  }
});

test.serial("delete template version", async function (t) {
  // delete
  try {
    let response = await prism.setup().then((client) =>
      client.delete(t.context.vrsn_endpoint, {
        headers: prism.authHeader,
      })
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

test.after.always("clean up template", async function (t) {
  // clean up template too!
  try {
    let clean_up = await prism.setup().then((client) =>
      client.delete(t.context.tmpl_endpoint, {
        headers: prism.authHeader,
      })
    );
    t.assert(clean_up.status === 200);
  } catch (prismError) {
    if (Object.keys(prismError).length > 0) {
      t.fail(JSON.stringify(prismError, null, 2));
    } else {
      t.fail(prismError.toString());
    }
  }
});
