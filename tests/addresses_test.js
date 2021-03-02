"use strict";

// standard setup, present in every test
const test = require("tape");
const Prism = require("./setup.js");

// test specific data
const resource_endpoint = "/addresses",
  lobUri = "https://api.lob.com/v1",
  specFile = "./Lob-API-public.yml";

const prism = new Prism(specFile, lobUri, process.env.LOB_API_TEST_TOKEN);

// contract tests
test("list addresses", async function (t) {
  const response = await prism
    .setup()
    .then((client) =>
      client.get(resource_endpoint, { headers: prism.authHeader })
    );

  t.equal(response.status, 200);
});

test("create, retrieve, then delete an address", async function (t) {
  const params = {
    description: "Harry - Office",
    name: "Harry Zhang",
    company: "Lob",
    email: "harry@lob.com",
    phone: "5555555555",
    address_line1: "185 Berry St",
    address_line2: "# 6100",
    address_city: "San Francisco",
    address_state: "CA",
    address_zip: "94107",
    address_country: "US",
  };

  let response = await prism
    .setup()
    .then((client) =>
      client.post(resource_endpoint, params, { headers: prism.authHeader })
    );

  t.equal(response.status, 200);

  const adr_id = response.data.id;

  // retrieve
  response = await prism.setup().then((client) =>
    client.get(`${resource_endpoint}/${adr_id}`, {
      headers: prism.authHeader,
    })
  );

  t.equal(response.status, 200);

  // delete
  response = await prism.setup().then((client) =>
    client.delete(`${resource_endpoint}/${adr_id}`, {
      headers: prism.authHeader,
    })
  );

  t.equal(response.status, 200);
});

test("allows creation with just a name", async function (t) {
  const params = {
    description: "Harry - Office",
    name: "Harry Zhang",
    email: "harry@lob.com",
    phone: "5555555555",
    address_line1: "185 Berry St",
    address_line2: "# 6100",
    address_city: "San Francisco",
    address_state: "CA",
    address_zip: "94107",
    address_country: "US",
  };

  let response = await prism
    .setup()
    .then((client) =>
      client.post(resource_endpoint, params, { headers: prism.authHeader })
    );

  t.equal(response.status, 200);
});

test("allows creation with just a company", async function (t) {
  const params = {
    description: "Harry - Office",
    company: "Lob",
    email: "harry@lob.com",
    phone: "5555555555",
    address_line1: "185 Berry St",
    address_line2: "# 6100",
    address_city: "San Francisco",
    address_state: "CA",
    address_zip: "94107",
    address_country: "US",
  };

  let response = await prism
    .setup()
    .then((client) =>
      client.post(resource_endpoint, params, { headers: prism.authHeader })
    );

  t.equal(response.status, 200);
});

test("errors when attempting to create an address with neither name nor company", async function (t) {
  const params = {
    description: "Harry - Office",
    email: "harry@lob.com",
    phone: "5555555555",
    address_line1: "185 Berry St",
    address_line2: "# 6100",
    address_city: "San Francisco",
    address_state: "CA",
    address_zip: "94107",
    address_country: "US",
  };

  let response = await prism
    .setup()
    .then((client) =>
      client.post(resource_endpoint, params, { headers: prism.authHeader })
    );

  t.equal(response.status, 422);
  t.match(response.data.error.message, /name/);
});
