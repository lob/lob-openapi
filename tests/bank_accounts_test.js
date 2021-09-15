"use strict";

// standard setup, present in every test
const test = require("ava");
const Prism = require("./setup.js");

// test specific data
const resource_endpoint = "/bank_accounts",
  lobUri = "https://api-v17.lob-staging.com/v1",
  specFile = "./lob-api-public.yml";

const prism = new Prism(specFile, lobUri, process.env.LOB_API_TEST_TOKEN);

const payload = {
  description: "Test Bank Account",
  routing_number: "322271627",
  account_number: "123456789",
  signatory: "Jane Doe",
  account_type: "individual",
};

test("list bank accounts' params", async function (t) {
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
      "eyJkYXRlT2Zmc2V0IjoiMjAyMS0wNS0wNFQyMzozMjo1NC4xNzlaIiwiaWRPZmZzZXQiOiJiYW5rXzY3YTI5MzU5NTY3ODUwZCJ9",
  });

  const before_response = list(before_body.toString());

  /* ################## AFTER ################## */

  const after_body = new URLSearchParams({
    after:
      "eyJkYXRlT2Zmc2V0IjoiMjAyMS0wNS0wNFQyMzozMjo1NC4xNzlaIiwiaWRPZmZzZXQiOiJiYW5rXzY3YTI5MzU5NTY3ODUwZCJ9",
  });

  const after_response = list(after_body.toString());

  /* ################## INCLUDE ################## */

  const include_body = new URLSearchParams({ "include[]": "total_count" });
  const include_response = list(include_body.toString());

  /* ################## METADATA ################## */

  const metadata_body = new URLSearchParams({ "metadata[name]": "Harry" });
  const metadata_response = list(metadata_body.toString());

  /* ################## DATE_CREATED ################## */

  const date_response = list("date_created%5Blt%5D=2021-06-01");

  /* ################## FULL ################## */

  const full_body = new URLSearchParams({
    limit: 2,
    before:
      "eyJkYXRlT2Zmc2V0IjoiMjAyMS0wNS0wNFQyMzozMjo1NC4xNzlaIiwiaWRPZmZzZXQiOiJiYW5rXzY3YTI5MzU5NTY3ODUwZCJ9",
    "include[]": "total_count",
    "metadata[name]": "Harry",
  });

  full_body.append("date_created[lt]", "2021-07-21T18:00:00.000Z");

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
    t.assert(finale[6].count <= 2);
    t.assert(finale[6].hasOwnProperty("total_count"));
  } catch (prismError) {
    if (Object.keys(prismError).length > 0) {
      t.fail(JSON.stringify(prismError, null, 2));
    } else {
      t.fail(prismError.toString());
    }
  }
});

test.serial.before(
  "create a bank account (json and urlencoded)",
  async function (t) {
    try {
      const create = await prism
        .setup()
        .then((client) =>
          client.post(resource_endpoint, payload, { headers: prism.authHeader })
        );
      t.assert(create.status === 200);
      t.context.create = create.data.id;
    } catch (prismError) {
      if (Object.keys(prismError).length > 0) {
        t.fail(JSON.stringify(prismError, null, 2));
      } else {
        t.fail(prismError.toString());
      }
    }

    const body = new URLSearchParams(payload).toString();
    try {
      const create = await prism.setup().then((client) =>
        client.post(resource_endpoint, body, {
          headers: {
            ...prism.authHeader,
            "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
          },
        })
      );
      t.assert(create.status === 200);
      t.context.create_urlencoded = create.data.id;
    } catch (prismError) {
      if (Object.keys(prismError).length > 0) {
        t.fail(JSON.stringify(prismError, null, 2));
      } else {
        t.fail(prismError.toString());
      }
    }
  }
);

// contract tests happy path
test.serial(
  "create, list, read, verify, then delete a bank_account",
  async function (t) {
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

    try {
      const read = await prism.setup().then((client) =>
        client.get(`${resource_endpoint}/${t.context.create}`, {
          headers: prism.authHeader,
        })
      );
      t.assert(read.status === 200);
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
            `${resource_endpoint}/${t.context.create}/verify`,
            { amounts: [11, 35] },
            { headers: prism.authHeader }
          )
        );
      t.assert(verify.status === 200);
      t.assert(verify.data.verified);

      const remove = await prism.setup().then((client) =>
        client.delete(`${resource_endpoint}/${verify.data.id}`, {
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
  }
);

test.serial(
  "create, list, read, verify, then delete a bank_account urlencoded",
  async function (t) {
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

    try {
      const read = await prism.setup().then((client) =>
        client.get(`${resource_endpoint}/${t.context.create_urlencoded}`, {
          headers: prism.authHeader,
        })
      );
      t.assert(read.status === 200);
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
            `${resource_endpoint}/${t.context.create_urlencoded}/verify`,
            { amounts: [11, 35] },
            { headers: prism.authHeader }
          )
        );
      t.assert(verify.status === 200);
      t.assert(verify.data.verified);

      const remove = await prism.setup().then((client) =>
        client.delete(`${resource_endpoint}/${verify.data.id}`, {
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
  }
);
