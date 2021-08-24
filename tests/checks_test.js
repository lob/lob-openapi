"use strict";

// standard setup, present in every test
const test = require("ava");
const Prism = require("./setup.js");

// test specific data
const resource_endpoint = "/checks",
  lobUri = "https://api.lob.com/v1",
  specFile = "./lob-api-public.yml";

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
    try {
      // We need a verified bank account to create a check, so let's make that first
      const result = await prism.setup().then((client) =>
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
    } catch (prismError) {
      if (Object.keys(prismError).length > 0) {
        t.fail(JSON.stringify(prismError, null, 2));
      } else {
        t.fail(prismError.toString());
      }
    }

    try {
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
    } catch (prismError) {
      if (Object.keys(prismError).length > 0) {
        t.fail(JSON.stringify(prismError, null, 2));
      } else {
        t.fail(prismError.toString());
      }
    }

    try {
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
            from: "adr_ae04aadb5f417fa6",
            bank_account: t.context.bank_id,
          },
          { headers: prism.authHeader }
        )
      );
      t.assert(t.context.create.status === 200);
    } catch (prismError) {
      if (Object.keys(prismError).length > 0) {
        t.fail(JSON.stringify(prismError, null, 2));
      } else {
        t.fail(prismError.toString());
      }
    }

    try {
      t.context.read = await prism.setup().then((client) =>
        client.get(`${resource_endpoint}/${t.context.create.data.id}`, {
          headers: prism.authHeader,
        })
      );
      t.assert(t.context.read.status === 200);
    } catch (prismError) {
      if (Object.keys(prismError).length > 0) {
        t.fail(JSON.stringify(prismError, null, 2));
      } else {
        t.fail(prismError.toString());
      }
    }
  }
);

test.serial.before(
  "create & validate verified bank account, and create & read a check urlencoded",
  async function (t) {
    try {
      // We need a verified bank account to create a check, so let's make that first
      const result = await prism.setup().then((client) =>
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
    } catch (prismError) {
      if (Object.keys(prismError).length > 0) {
        t.fail(JSON.stringify(prismError, null, 2));
      } else {
        t.fail(prismError.toString());
      }
    }

    try {
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
    } catch (prismError) {
      if (Object.keys(prismError).length > 0) {
        t.fail(JSON.stringify(prismError, null, 2));
      } else {
        t.fail(prismError.toString());
      }
    }

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

    try {
      t.context.create2 = await prism.setup({ errors: false }).then((client) =>
        client.post(resource_endpoint, body, {
          headers: {
            ...prism.authHeader,
            "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
          },
        })
      );
      t.assert(t.context.create2.status === 200);
    } catch (prismError) {
      if (Object.keys(prismError).length > 0) {
        t.fail(JSON.stringify(prismError, null, 2));
      } else {
        t.fail(prismError.toString());
      }
    }

    try {
      t.context.read2 = await prism.setup().then((client) =>
        client.get(`${resource_endpoint}/${t.context.create2.data.id}`, {
          headers: prism.authHeader,
        })
      );
      t.assert(t.context.read2.status === 200);
    } catch (prismError) {
      if (Object.keys(prismError).length > 0) {
        t.fail(JSON.stringify(prismError, null, 2));
      } else {
        t.fail(prismError.toString());
      }
    }
  }
);

test("list check", async function (t) {
  try {
    const list = await prism
      .setup()
      .then((client) =>
        client.get(resource_endpoint, { headers: prism.authHeader })
      );
    t.assert(list.status === 200);
  } catch (prismError) {
    if (Object.keys(prismError).length > 0) {
      t.fail(JSON.stringify(prismError, null, 2));
    } else {
      t.fail(prismError.toString());
    }
  }
});

test("list checks' params", async function (t) {
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

  const limit_body = new URLSearchParams({ limit: 6 });
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

  const date_response = list("date_created%5Blt%5D=2021-05-05");

  /* ################## FULL ################## */

  const full_body = new URLSearchParams({
    limit: 2,
    before:
      "eyJkYXRlT2Zmc2V0IjoiMjAyMS0wNS0wNFQyMzozMzozOC42MTNaIiwiaWRPZmZzZXQiOiJjaGtfNTc5MjQ1YWEwNDk4MjMwYiJ9",
    "include[]": "total_count",
    "metadata[name]": "Harry",
  });

  full_body.append("date_created[lt]", "2021-05-05");

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

    t.assert(finale[0].count <= 6);
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

test.after.always("delete all checks", async function (t) {
  try {
    const remove = await prism.setup().then((client) =>
      client.delete(`${resource_endpoint}/${t.context.read.data.id}`, {
        headers: prism.authHeader,
      })
    );
    t.assert(remove.status === 200);
  } catch (prismError) {
    if (Object.keys(prismError).length > 0) {
      t.fail(JSON.stringify(prismError, null, 2));
    } else {
      t.fail(prismError.toString());
    }
  }

  try {
    const delete_bank_acc = await prism.setup().then((client) =>
      client.delete(`/bank_accounts/${t.context.bank_id}`, {
        headers: prism.authHeader,
      })
    );
    t.assert(delete_bank_acc.status === 200);
  } catch (prismError) {
    if (Object.keys(prismError).length > 0) {
      t.fail(JSON.stringify(prismError, null, 2));
    } else {
      t.fail(prismError.toString());
    }
  }

  try {
    const remove2 = await prism.setup().then((client) =>
      client.delete(`${resource_endpoint}/${t.context.read2.data.id}`, {
        headers: prism.authHeader,
      })
    );
    t.assert(remove2.status === 200);
  } catch (prismError) {
    if (Object.keys(prismError).length > 0) {
      t.fail(JSON.stringify(prismError, null, 2));
    } else {
      t.fail(prismError.toString());
    }
  }

  try {
    const delete_bank_acc2 = await prism.setup().then((client) =>
      client.delete(`/bank_accounts/${t.context.bank_id2}`, {
        headers: prism.authHeader,
      })
    );
    t.assert(delete_bank_acc2.status === 200);
  } catch (prismError) {
    if (Object.keys(prismError).length > 0) {
      t.fail(JSON.stringify(prismError, null, 2));
    } else {
      t.fail(prismError.toString());
    }
  }
});
