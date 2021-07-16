"use strict";

// standard setup, present in every test
const test = require("ava");
const Prism = require("./setup.js");

// test specific data
const resource_endpoint = "/letters",
  lobUri = "https://api.lob.com/v1",
  specFile = "./Lob-API-public.yml";

const prism = new Prism(specFile, lobUri, process.env.LOB_API_TEST_TOKEN);

test("list letters' params", async function (t) {
  const list = async (body) => {
    const response = await prism.setup().then((client) =>
      client.get(`${resource_endpoint}?${body}`, {
        headers: prism.authHeader,
      })
    );
    t.assert(response.status === 200);
    return response.data;
  };

  /* ################## LIMIT ################## */

  const limit_body = new URLSearchParams({ limit: 4 });
  const limit_response = list(limit_body.toString());

  /* ################## BEFORE ################## */

  const before_body = new URLSearchParams({
    before:
      "eyJkYXRlT2Zmc2V0IjoiMjAyMS0wNS0wNFQyMzozMzozOC42MTNaIiwiaWRPZmZzZXQiOiJjaGtfNTc5MjQ1YWEwNDk4MjMwYiJ9",
  });

  const before_response = list(before_body.toString());

  /* ################## AFTER ################## */

  const after_body = new URLSearchParams({
    after:
      "eyJkYXRlT2Zmc2V0IjoiMjAyMS0wNS0wNFQyMzozMzozOC42MTNaIiwiaWRPZmZzZXQiOiJjaGtfNTc5MjQ1YWEwNDk4MjMwYiJ9",
  });

  const after_response = list(after_body.toString());

  /* ################## INCLUDE ################## */

  const include_body = new URLSearchParams({ "include[]": "total_count" });
  const include_response = list(include_body.toString());

  /* ################## METADATA ################## */

  const metadata_body = new URLSearchParams({ "metadata[name]": "Harry" });
  const metadata_response = list(metadata_body.toString());

  /* ################## DATE_CREATED ################## */

  let deepObj = {
    date_created: { lt: "2021-03-30" },
  };

  const date_body = new URLSearchParams({});
  for (const key in deepObj) {
    Object.entries(deepObj[key]).forEach(([innerKey, innerVal]) => {
      date_body.append(`${key}[${innerKey}]`, `${innerVal}`);
    });
  }

  const date_response = list(date_body.toString());

  /* ################## FULL ################## */

  const full_body = new URLSearchParams({
    limit: 2,
    before:
      "eyJkYXRlT2Zmc2V0IjoiMjAyMS0wNS0wNFQyMzozMzozOC42MTNaIiwiaWRPZmZzZXQiOiJjaGtfNTc5MjQ1YWEwNDk4MjMwYiJ9",
    "include[]": "total_count",
    "metadata[name]": "Harry",
  });

  deepObj = { date_created: { lt: "2021-03-30" } };
  for (const key in deepObj) {
    Object.entries(deepObj[key]).forEach(([innerKey, innerVal]) => {
      full_body.append(`${key}[${innerKey}]`, `${innerVal}`);
    });
  }

  const full_response = list(full_body.toString());

  /* ################## RUN EVERYTHING ASYNC ################## */

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
  t.assert(finale[4].count === 0);
  t.assert(finale[5].count === 4);
  t.assert(finale[6].hasOwnProperty("total_count"));
  t.assert(finale[6].count === 0);
});

test("create, list, read, then cancel, a letter with no extra services", async function (t) {
  t.plan(9);
  const makeAddress = async (address_data) => {
    let response = await prism
      .setup()
      .then((client) =>
        client.post("/addresses", address_data, { headers: prism.authHeader })
      );
    t.assert(response.status === 200);
    return response.data.id;
  };
  const deleteAddress = async (address_id) => {
    const response = await prism
      .setup()
      .then((client) =>
        client.delete(`/addresses/${address_id}`, { headers: prism.authHeader })
      );

    t.assert(response.status === 200);
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
  t.assert(create.status === 200);
  t.assert(!create.data.tracking_number);

  const list = await prism
    .setup()
    .then((client) =>
      client.get(resource_endpoint, { headers: prism.authHeader })
    );
  t.assert(list.status === 200);

  const read = await prism.setup().then((client) =>
    client.get(`${resource_endpoint}/${create.data.id}`, {
      headers: prism.authHeader,
    })
  );
  t.assert(read.status === 200);

  const cancel = await prism.setup().then((client) =>
    client.delete(`${resource_endpoint}/${read.data.id}`, {
      headers: prism.authHeader,
    })
  );
  t.assert(cancel.status === 200);

  await deleteAddress(to);
  await deleteAddress(from);
});

test("create, list, read, then cancel, a letter with no extra services and full payload", async function (t) {
  t.plan(9);
  const makeAddress = async (address_data) => {
    let response = await prism
      .setup()
      .then((client) =>
        client.post("/addresses", address_data, { headers: prism.authHeader })
      );
    t.assert(response.status === 200);
    return response.data.id;
  };
  const deleteAddress = async (address_id) => {
    const response = await prism
      .setup()
      .then((client) =>
        client.delete(`/addresses/${address_id}`, { headers: prism.authHeader })
      );

    t.assert(response.status === 200);
    return response;
  };
  const to = await makeAddress({
    description: "Harry - Old Office",
    name: "Harry Zhang",
    company: "Lob (old)",
    address_line1: "185 Berry St",
    address_line2: "# 6100",
    address_city: "San Francisco",
    address_state: "CA",
    address_zip: "94107",
    address_country: "US",
    phone: "5555555555",
    email: "harry.zhang@lob.com",
  });
  const from = await makeAddress({
    description: "Harry - New Office",
    name: "Harry Zhang",
    company: "Lob (new)",
    address_line1: "210 King St",
    address_city: "San Francisco",
    address_state: "CA",
    address_zip: "94107",
    address_country: "US",
    phone: "5555555555",
    email: "harry.zhang@lob.com",
  });

  const date = new Date();
  date.setDate(date.getDate() + 1); // adding a day to today's date so clearly within 180 days of today

  const create = await prism.setup().then((client) =>
    client.post(
      resource_endpoint,
      {
        description: "Demo Letter",
        to: to,
        from: from,
        send_date: date.toISOString(),
        color: true,
        file: "https://s3-us-west-2.amazonaws.com/public.lob.com/assets/us_letter_1pg.pdf",
        double_sided: false,
        address_placement: "insert_blank_page",
        mail_type: "usps_first_class",
        extra_service: "registered",
        return_envelope: true,
        perforated_page: 1,
        custom_envelope: null,
        merge_variables: { name: "Harry" },
      },
      { headers: prism.authHeader }
    )
  );
  t.assert(create.status === 200);
  t.assert(!create.data.tracking_number);

  const list = await prism
    .setup()
    .then((client) =>
      client.get(resource_endpoint, { headers: prism.authHeader })
    );
  t.assert(list.status === 200);

  const read = await prism.setup().then((client) =>
    client.get(`${resource_endpoint}/${create.data.id}`, {
      headers: prism.authHeader,
    })
  );
  t.assert(read.status === 200);

  const cancel = await prism.setup().then((client) =>
    client.delete(`${resource_endpoint}/${read.data.id}`, {
      headers: prism.authHeader,
    })
  );
  t.assert(cancel.status === 200);

  await deleteAddress(to);
  await deleteAddress(from);
});

// add any failure cases you need here
test("create, list, read then cancel a certified letter", async function (t) {
  t.plan(5);
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
  t.assert(create.status === 200);
  t.assert(create.data.tracking_number);

  const list = await prism
    .setup()
    .then((client) =>
      client.get(resource_endpoint, { headers: prism.authHeader })
    );
  t.assert(list.status === 200);

  const read = await prism.setup().then((client) =>
    client.get(`${resource_endpoint}/${create.data.id}`, {
      headers: prism.authHeader,
    })
  );
  t.assert(read.status === 200);

  const cancel = await prism.setup().then((client) =>
    client.delete(`${resource_endpoint}/${read.data.id}`, {
      headers: prism.authHeader,
    })
  );
  t.assert(cancel.status === 200);
});
