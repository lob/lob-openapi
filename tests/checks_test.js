"use strict";

// standard setup, present in every test
const test = require("ava");
const Prism = require("./setup.js");

// test specific data
const resource_endpoint = "/checks",
  lobUri = "https://api.lob.com/v1",
  specFile = "./Lob-API-public.yml";

const prism = new Prism(specFile, lobUri, process.env.LOB_API_TEST_TOKEN);

const payload = {
  description: "Demo Check",
  amount: 101.01,
  memo: "poodles",
  message: "End Racism",
};

// TODO: add full payload req
test.serial.before(
  "create & validate verified bank account, and create & read a check",
  async function (t) {
    t.plan(3);
    // We need a verified bank account to create a check, so let's make that first
    let result = await prism.setup().then((client) =>
      client.post(
        "/bank_accounts",
        {
          description: "Test Bank Account",
          routing_number: "322271627",
          account_number: "123456789",
          signatory: "Jane Doe",
          account_type: "individual",
        },
        { headers: prism.authHeader }
      )
    );

    t.context.bank_id = result.data.id;

    const verify = await prism
      .setup()
      .then((client) =>
        client.post(
          `/bank_accounts/${t.context.bank_id}/verify`,
          { amounts: [42, 12] },
          { headers: prism.authHeader }
        )
      );
    t.assert(verify.status === 200);

    t.context.create = await prism.setup({ errors: false }).then((client) =>
      client.post(
        resource_endpoint,
        {
          ...payload,
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
          bank_account: t.context.bank_id,
        },
        { headers: prism.authHeader }
      )
    );
    t.assert(t.context.create.status === 200);

    t.context.read = await prism.setup().then((client) =>
      client.get(`${resource_endpoint}/${t.context.create.data.id}`, {
        headers: prism.authHeader,
      })
    );
    t.assert(t.context.read.status === 200);
  }
);

test.serial.before(
  "create & validate verified bank account, and create & read a check urlencoded",
  async function (t) {
    t.plan(3);
    // We need a verified bank account to create a check, so let's make that first
    let result = await prism.setup().then((client) =>
      client.post(
        "/bank_accounts",
        {
          description: "Test Bank Account",
          routing_number: "322271627",
          account_number: "123456789",
          signatory: "Jane Doe",
          account_type: "individual",
        },
        { headers: prism.authHeader }
      )
    );

    t.context.bank_id2 = result.data.id;

    const verify = await prism
      .setup()
      .then((client) =>
        client.post(
          `/bank_accounts/${t.context.bank_id2}/verify`,
          { amounts: [42, 12] },
          { headers: prism.authHeader }
        )
      );
    t.assert(verify.status === 200);

    let body = new URLSearchParams({
      ...payload,
      bank_account: t.context.bank_id2,
    });

    const deepObjs = {
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
    };
    for (const key in deepObjs) {
      Object.entries(deepObjs[key]).forEach(([innerKey, innerVal]) => {
        body.append(`${key}[${innerKey}]`, `${innerVal}`);
      });
    }
    body = body.toString();

    t.context.create2 = await prism.setup({ errors: false }).then((client) =>
      client.post(resource_endpoint, body, {
        headers: {
          ...prism.authHeader,
          "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
        },
      })
    );
    t.assert(t.context.create2.status === 200);

    t.context.read2 = await prism.setup().then((client) =>
      client.get(`${resource_endpoint}/${t.context.create2.data.id}`, {
        headers: prism.authHeader,
      })
    );
    t.assert(t.context.read2.status === 200);
  }
);

test("list check", async function (t) {
  const list = await prism
    .setup()
    .then((client) =>
      client.get(resource_endpoint, { headers: prism.authHeader })
    );
  t.assert(list.status === 200);
});

test.after.always("delete all checks", async function (t) {
  const remove = await prism.setup().then((client) =>
    client.delete(`${resource_endpoint}/${t.context.read.data.id}`, {
      headers: prism.authHeader,
    })
  );
  t.assert(remove.status === 200);
  prism.setup().then((client) =>
    client.delete(`/bank_accounts/${t.context.bank_id}`, {
      headers: prism.authHeader,
    })
  );

  const remove2 = await prism.setup().then((client) =>
    client.delete(`${resource_endpoint}/${t.context.read2.data.id}`, {
      headers: prism.authHeader,
    })
  );
  t.assert(remove2.status === 200);
  prism.setup().then((client) =>
    client.delete(`/bank_accounts/${t.context.bank_id2}`, {
      headers: prism.authHeader,
    })
  );
});
