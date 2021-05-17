"use strict";

// standard setup, present in every test
const tape = require("tape");
const _test = require("tape-promise").default;
const test = _test(tape);
const Prism = require("./setup.js");

// test specific data
const resource_endpoint = "/letters",
  lobUri = "https://api.lob.com/v1",
  specFile = "./Lob-API-public.yml";

const prism = new Prism(specFile, lobUri, process.env.LOB_API_TEST_TOKEN);

test("create, list, read, then cancel, a letter with no extra services", async function (t) {
  const makeAddress = async (address_data) => {
    let response = await prism
      .setup()
      .then((client) =>
        client.post("/addresses", address_data, { headers: prism.authHeader })
      );
    await t.doesNotReject(Promise.resolve(response));
    return response.data.id;
  };
  const deleteAddress = async (address_id) => {
    const response = await prism
      .setup()
      .then((client) =>
        client.delete(`/addresses/${address_id}`, { headers: prism.authHeader })
      );
    await t.doesNotReject(Promise.resolve(response));
    t.equal(response.status, 200);
    return response;
  };
  const to = await makeAddress({
    company: "Lob (old)",
    address_line1: "185 Berry St",
    address_line2: "# 6100",
    address_city: "San Francisco",
    address_state: "CA",
    address_zip: "94107",
    address_country: "US",
  });
  const from = await makeAddress({
    company: "Lob (new)",
    address_line1: "210 King St",
    address_city: "San Francisco",
    address_state: "CA",
    address_zip: "94107",
    address_country: "US",
  });
  const create = await prism.setup().then((client) =>
    client.post(
      resource_endpoint,
      {
        to: to,
        from: from,
        color: true,
        file: "https://s3-us-west-2.amazonaws.com/public.lob.com/assets/us_letter_1pg.pdf",
      },
      { headers: prism.authHeader }
    )
  );
  await t.doesNotReject(Promise.resolve(create));
  t.equal(create.status, 200);
  t.false(create.data.tracking_number);

  const list = await prism
    .setup()
    .then((client) =>
      client.get(resource_endpoint, { headers: prism.authHeader })
    );
  await t.doesNotReject(Promise.resolve(list));
  t.equal(list.status, 200);

  const read = await prism.setup().then((client) =>
    client.get(`${resource_endpoint}/${create.data.id}`, {
      headers: prism.authHeader,
    })
  );
  await t.doesNotReject(Promise.resolve(read));
  t.equal(read.status, 200);

  const cancel = await prism.setup().then((client) =>
    client.delete(`${resource_endpoint}/${read.data.id}`, {
      headers: prism.authHeader,
    })
  );
  await t.doesNotReject(Promise.resolve(cancel));
  t.equal(cancel.status, 200);

  const deletedTo = await deleteAddress(to);
  await t.doesNotReject(Promise.resolve(deletedTo));
  const deletedFrom = await deleteAddress(from);
  await t.doesNotReject(Promise.resolve(deletedFrom));
});

// add any failure cases you need here
test("create, list, read then cancel a certified letter", async function (t) {
  const create = await prism.setup().then((client) =>
    client.post(
      resource_endpoint,
      {
        to: {
          company: "Lob (old)",
          address_line1: "185 Berry St",
          address_line2: "# 6100",
          address_city: "San Francisco",
          address_state: "CA",
          address_zip: "94107",
          address_country: "US",
        },
        from: {
          company: "Lob (new)",
          address_line1: "210 King St",
          address_city: "San Francisco",
          address_state: "CA",
          address_zip: "94107",
          address_country: "US",
        },
        color: true,
        extra_service: "certified",
        file: "https://s3-us-west-2.amazonaws.com/public.lob.com/assets/us_letter_1pg.pdf",
      },
      { headers: prism.authHeader }
    )
  );
  await t.doesNotReject(Promise.resolve(create));
  t.equal(create.status, 200);
  t.true(create.data.tracking_number);

  const list = await prism
    .setup()
    .then((client) =>
      client.get(resource_endpoint, { headers: prism.authHeader })
    );
  await t.doesNotReject(Promise.resolve(list));
  t.equal(list.status, 200);

  const read = await prism.setup().then((client) =>
    client.get(`${resource_endpoint}/${create.data.id}`, {
      headers: prism.authHeader,
    })
  );
  await t.doesNotReject(Promise.resolve(read));
  t.equal(read.status, 200);

  const cancel = await prism.setup().then((client) =>
    client.delete(`${resource_endpoint}/${read.data.id}`, {
      headers: prism.authHeader,
    })
  );
  await t.doesNotReject(Promise.resolve(cancel));
  t.equal(cancel.status, 200);
});
