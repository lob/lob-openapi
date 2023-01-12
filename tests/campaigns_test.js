"use strict";

// standard setup, present in every test
const test = require("ava");
const Prism = require("./setup.js");

// test specific data
const resource_endpoint = "/campaigns",
  lobUri = "https://api.lob.com/v1",
  specFile = "./lob-api-public.yml";

const prism = new Prism(specFile, lobUri, process.env.LOB_API_TEST_TOKEN);

test.serial.before("create billing group", async function (t) {
  try {
    const result = await prism.setup().then((client) =>
      client.post(
        "/billing_groups",
        {
          name: "lob-openapi campaign billing group",
        },
        { headers: prism.authHeader }
      )
    );

    t.context.bg_id = result.data.id;
  } catch (prismError) {
    if (Object.keys(prismError).length > 0) {
      t.fail(JSON.stringify(prismError, null, 2));
    } else {
      t.fail(prismError.toString());
    }
  }
});

test("create, retrieve, update, then delete a campaign", async function (t) {
  try {
    // create
    let response = await prism.setup().then((client) =>
      client.post(
        resource_endpoint,
        {
          name: "Harry Zhang",
          schedule_type: "immediate",
          billing_group_id: t.context.bg_id,
          description: "lob-openapi Campaign description",
          target_delivery_date: null,
          send_date: null,
          cancel_window_campaign_minutes: 60,
          metadata: {
            name: "Harry Zhang",
          },
          auto_cancel_if_ncoa: false,
          use_type: "marketing",
        },
        {
          headers: { ...prism.authHeader, "x-lang-output": "match" },
        }
      )
    );

    t.assert(response.status === 200);

    const cmp_id = response.data.id;

    // retrieve
    response = await prism.setup().then((client) =>
      client.get(`${resource_endpoint}/${cmp_id}`, {
        headers: prism.authHeader,
      })
    );

    t.assert(response.status === 200);

    // update
    response = await prism.setup().then((client) =>
      client.patch(
        `${resource_endpoint}/${cmp_id}`,
        {
          name: "Harry II",
          description: "lob-openapi Updated campaign",
        },
        {
          headers: prism.authHeader,
        }
      )
    );

    t.assert(response.status === 200);
    t.assert(response.data.description === "lob-openapi Updated campaign");

    // delete
    response = await prism.setup().then((client) =>
      client.delete(`${resource_endpoint}/${cmp_id}`, {
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

test("list campaigns params", async function (t) {
  const list = async (body) => {
    try {
      const response = await prism.setup().then((client) =>
        client.get(`${resource_endpoint}?${body}`, {
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

  /* ################## FULL ################## */

  const full_body = new URLSearchParams({
    limit: 2,
    after:
      "eyJkYXRlT2Zmc2V0IjoiMjAyMS0wNy0yMVQxMjo0MDo0NS43NjNaIiwiaWRPZmZzZXQiOiJ0bXBsXzEwOWQ4YzZlZGIwNDgwOSJ9",
    "include[]": "total_count",
  });

  const full_response = list(full_body.toString());

  /* ################## RUN EVERYTHING ASYNC ################## */

  try {
    const finale = await Promise.all([
      limit_response,
      before_response,
      after_response,
      include_response,
      full_response,
    ]);

    t.assert(finale[0].count <= 4);
    t.assert(finale[3].hasOwnProperty("total_count"));
    t.assert(finale[4].hasOwnProperty("total_count"));
    t.assert(finale[4].count <= 2);
  } catch (prismError) {
    if (Object.keys(prismError).length > 0) {
      t.fail(JSON.stringify(prismError, null, 2));
    } else {
      t.fail(prismError.toString());
    }
  }
});

test("errors when schedule_type is not passed in", async function (t) {
  try {
    const response = await prism.setup({ errors: false }).then((client) =>
      client.post(
        resource_endpoint,
        {
          name: "lob-openapi failed campaign",
        },
        { headers: prism.authHeader }
      )
    );

    t.assert(response.status === 422);
    t.assert(response.data.error.message.includes("schedule_type"));
  } catch (prismError) {
    if (Object.keys(prismError).length > 0) {
      t.fail(JSON.stringify(prismError, null, 2));
    } else {
      t.fail(prismError.toString());
    }
  }
});
