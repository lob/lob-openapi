"use strict";

// TODO:
// Need to add subscription features to the lob open api token used to
// run CI and contract tests in order to cancel, use certified, etc.

// standard setup, present in every test
const test = require("tape");
const Prism = require("./setup.js");

// test specific data
const resource_endpoint = "/letters",
  lobUri = "https://api.lob.com/v1",
  specFile = "./Lob-API-public.yml";

const prism = new Prism(specFile, lobUri, process.env.LOB_API_TEST_TOKEN);

// contract tests happy path
test("create, list, read then cancel a letter", async function (t) {
  // create to and from addresses to use in create
  let response = await prism.setup().then((client) =>
    client.post(
      "/addresses",
      {
        company: "Lob (old)",
        address_line1: "185 Berry St",
        address_line2: "# 6100",
        address_city: "San Francisco",
        address_state: "CA",
        address_zip: "94107",
        address_country: "US",
      },
      { headers: prism.authHeader }
    )
  );
  t.equal(response.status, 200);
  const to = response.data.id;

  response = await prism.setup().then((client) =>
    client.post(
      "/addresses",
      {
        company: "Lob (new)",
        address_line1: "210 King St",
        address_city: "San Francisco",
        address_state: "CA",
        address_zip: "94107",
        address_country: "US",
      },
      { headers: prism.authHeader }
    )
  );
  t.equal(response.status, 200);
  const from = response.data.id;

  // create
  response = await prism.setup().then((client) =>
    client.post(
      resource_endpoint,
      {
        to: to,
        from: from,
        color: true,
        //        send_date: new Date(),
        file:
          "https://s3-us-west-2.amazonaws.com/public.lob.com/assets/us_letter_1pg.pdf",
      },
      { headers: prism.authHeader }
    )
  );
  t.equal(response.status, 200);

  // read and cancel created endpoint
  const ltr_endpoint = `${resource_endpoint}/${response.data.id}`;

  // list
  response = await prism
    .setup()
    .then((client) =>
      client.get(resource_endpoint, { headers: prism.authHeader })
    );
  t.equal(response.status, 200);

  // read
  response = await prism
    .setup()
    .then((client) => client.get(ltr_endpoint, { headers: prism.authHeader }));
  t.equal(response.status, 200);

  /*  // cancel
  response = await prism
    .setup()
    .then((client) =>
      client.delete(ltr_endpoint, { headers: prism.authHeader })
    );
  t.equal(response.status, 200);

  // delete addresses, too
  response = await prism
    .setup()
    .then((client) =>
      client.delete(`/addresses/{to}`, { headers: prism.authHeader })
    );
  t.equal(response.status, 200);
  response = await prism
    .setup()
    .then((client) =>
      client.delete(`/addresses/{from}`, { headers: prism.authHeader })
    );
  t.equal(response.status, 200); */
});

// add any failure cases you need here
// cancel letter w/o send_date header
