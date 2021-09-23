"use strict";

const test = require("ava");
const Prism = require("./setup.js");

const resource_endpoint = "/us_verifications",
  lobUri = "https://api.lob.com/v1",
  specFile = "./lob-api-public.yml";
const primary_line = "210 KING ST";
const city = "SAN FRANCISCO";
const state = "CA";
const zip_code = "94107";
const sla = "210 KING ST 94107";

const prism = new Prism(specFile, lobUri, process.env.LOB_API_LIVE_TOKEN);

test("verify a US address given primary line, city, and state", async function (t) {
  try {
    const response = await prism
      .setup()
      .then((client) =>
        client.post(
          resource_endpoint,
          { primary_line: primary_line, city: city, state: state },
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

test("verify a US address given primary line and zip code", async function (t) {
  try {
    const response = await prism
      .setup()
      .then((client) =>
        client.post(
          resource_endpoint,
          { primary_line: primary_line, zip_code: zip_code },
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

test("verify a US address given a single-line address", async function (t) {
  try {
    const response = await prism
      .setup()
      .then((client) =>
        client.post(
          resource_endpoint,
          { address: sla },
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

test("verify a US address with full payload", async function (t) {
  try {
    const response = await prism.setup().then((client) =>
      client.post(
        resource_endpoint,
        {
          recipient: "Harry Zhang",
          primary_line: primary_line,
          secondary_line: "",
          city: city,
          state: state,
          zip_code: "94107",
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

// tests request validation
test("errors when not given a primary line", async function (t) {
  try {
    await prism
      .setup()
      .then((client) =>
        client.post(
          resource_endpoint,
          { zip_code: zip_code },
          { headers: prism.authHeader }
        )
      );
  } catch (err) {
    const firstError = err.additional.validation[0]["message"];
    t.assert(firstError.includes("required"));
  }
});

// set prism error-surfacing to false for these tests, to gauge the endpoint's response
test("errors when given a primary line without city/state or zip", async function (t) {
  try {
    const response = await prism
      .setup({ errors: false })
      .then((client) =>
        client.post(
          resource_endpoint,
          { primary_line: primary_line },
          { headers: prism.authHeader }
        )
      );

    t.assert(response.status === 422);
    t.assert(response.data.error.message.includes("zip_code"));
  } catch (prismError) {
    if (Object.keys(prismError).length > 0) {
      t.fail(JSON.stringify(prismError, null, 2));
    } else {
      t.fail(prismError.toString());
    }
  }
});

test("errors when given a city without state or zip", async function (t) {
  try {
    const response = await prism
      .setup({ errors: false })
      .then((client) =>
        client.post(
          resource_endpoint,
          { primary_line: primary_line, city: city },
          { headers: prism.authHeader }
        )
      );

    t.assert(response.status === 422);
    t.assert(response.data.error.message.includes("state"));
  } catch (prismError) {
    if (Object.keys(prismError).length > 0) {
      t.fail(JSON.stringify(prismError, null, 2));
    } else {
      t.fail(prismError.toString());
    }
  }
});

test("errors when given a state without city or zip", async function (t) {
  try {
    const response = await prism
      .setup({ errors: false })
      .then((client) =>
        client.post(
          resource_endpoint,
          { primary_line: primary_line, state: state },
          { headers: prism.authHeader }
        )
      );

    t.assert(response.status === 422);
    t.assert(response.data.error.message.includes("city"));
  } catch (prismError) {
    if (Object.keys(prismError).length > 0) {
      t.fail(JSON.stringify(prismError, null, 2));
    } else {
      t.fail(prismError.toString());
    }
  }
});

test("errors when given extraneous information alongside a single-line address", async function (t) {
  try {
    const response = await prism
      .setup({ errors: false })
      .then((client) =>
        client.post(
          resource_endpoint,
          { address: sla, zip_code: zip_code },
          { headers: prism.authHeader }
        )
      );

    t.assert(response.status === 422);
    t.assert(response.data.error.message.includes("zip_code"));
  } catch (prismError) {
    if (Object.keys(prismError).length > 0) {
      t.fail(JSON.stringify(prismError, null, 2));
    } else {
      t.fail(prismError.toString());
    }
  }
});
