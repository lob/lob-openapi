"use strict";

const tape = require("tape");
const _test = require("tape-promise").default;
const test = _test(tape);
const Prism = require("./setup.js");

const resource_endpoint = "/us_verifications",
  lobUri = "https://api.lob.com/v1",
  specFile = "./Lob-API-public.yml";
const primary_line = "185 BERRY ST";
const city = "SAN FRANCISCO";
const state = "CA";
const zip_code = "94107";
const sla = "185 BERRY ST 94107";

const prism = new Prism(specFile, lobUri, process.env.LOB_API_LIVE_TOKEN);

test("verify a US address given primary line, city, and state", async function (t) {
  const response = await prism
    .setup()
    .then((client) =>
      client.post(
        resource_endpoint,
        { primary_line: primary_line, city: city, state: state },
        { headers: prism.authHeader }
      )
    );

  await t.doesNotReject(Promise.resolve(response));
  t.equal(response.status, 200);
});

test("verify a US address given primary line and zip code", async function (t) {
  const response = await prism
    .setup()
    .then((client) =>
      client.post(
        resource_endpoint,
        { primary_line: primary_line, zip_code: zip_code },
        { headers: prism.authHeader }
      )
    );

  await t.doesNotReject(Promise.resolve(response));
  t.equal(response.status, 200);
});

test("verify a US address given a single-line address", async function (t) {
  const response = await prism
    .setup()
    .then((client) =>
      client.post(
        resource_endpoint,
        { address: sla },
        { headers: prism.authHeader }
      )
    );

  await t.doesNotReject(Promise.resolve(response));
  t.equal(response.status, 200);
});

test("errors when given a primary line without city/state or zip", async function (t) {
  const response = await prism
    .setup({ errors: false })
    .then((client) =>
      client.post(
        resource_endpoint,
        { primary_line: primary_line },
        { headers: prism.authHeader }
      )
    );

  await t.rejects(Promise.reject(response));
  t.equal(response.status, 422);
  t.match(response.data.error.message, /zip_code/);
});

test("errors when not given a primary line", async function (t) {
  const response = await prism
    .setup({ errors: false })
    .then((client) =>
      client.post(
        resource_endpoint,
        { zip_code: zip_code },
        { headers: prism.authHeader }
      )
    );

  await t.rejects(Promise.reject(response));
  t.equal(response.status, 422);
  t.match(response.data.error.message, /primary_line/);
});

test("errors when given a city without state or zip", async function (t) {
  const response = await prism
    .setup({ errors: false })
    .then((client) =>
      client.post(
        resource_endpoint,
        { primary_line: primary_line, city: city },
        { headers: prism.authHeader }
      )
    );

  await t.rejects(Promise.reject(response));
  t.equal(response.status, 422);
  t.match(response.data.error.message, /state/);
});

test("errors when given a state without city or zip", async function (t) {
  const response = await prism
    .setup({ errors: false })
    .then((client) =>
      client.post(
        resource_endpoint,
        { primary_line: primary_line, state: state },
        { headers: prism.authHeader }
      )
    );

  await t.rejects(Promise.reject(response));
  t.equal(response.status, 422);
  t.match(response.data.error.message, /city/);
});

test("errors when given extraneous information alongside a single-line address", async function (t) {
  const response = await prism
    .setup({ errors: false })
    .then((client) =>
      client.post(
        resource_endpoint,
        { address: sla, zip_code: zip_code },
        { headers: prism.authHeader }
      )
    );

  await t.rejects(Promise.reject(response));
  t.equal(response.status, 422);
  t.match(response.data.error.message, /zip_code/);
});
