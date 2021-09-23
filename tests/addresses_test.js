"use strict";

// standard setup, present in every test
const test = require("ava");
const Prism = require("./setup.js");

// test specific data
const resource_endpoint = "/addresses",
  lobUri = "https://api.lob.com/v1",
  specFile = "./lob-api-public.yml";

const prism = new Prism(specFile, lobUri, process.env.LOB_API_TEST_TOKEN);

// contract tests
test("list addresses", async function (t) {
  try {
    const response = await prism
      .setup()
      .then((client) =>
        client.get(resource_endpoint, { headers: prism.authHeader })
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

test("list addresses' parameters", async function (t) {
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

  const limit_body = new URLSearchParams({ limit: 8 });

  const limit_response = list(limit_body.toString());

  /* ################## BEFORE ################## */

  const before_body = new URLSearchParams({
    before:
      "eyJkYXRlT2Zmc2V0IjoiMjAyMS0wNy0yMFQxOTozMDoyOC4wNTJaIiwiaWRPZmZzZXQiOiJhZHJfNzQyN2FhZWE0MjVhZTlmMCJ9",
  });

  const before_response = list(before_body.toString());

  /* ################## AFTER ################## */

  const after_body = new URLSearchParams({
    after:
      "eyJkYXRlT2Zmc2V0IjoiMjAyMS0wNy0yMFQxOTozMTowOS4wMjRaIiwiaWRPZmZzZXQiOiJhZHJfNmE5MGY5MzNiODkyNDk4OCJ9",
  });

  const after_response = list(after_body.toString());

  /* ################## INCLUDE ################## */

  const include_body = new URLSearchParams({ "include[]": "total_count" });
  const include_response = list(include_body.toString());

  /* ################## METADATA ################## */

  const metadata_body = new URLSearchParams({ "metadata[name]": "Harry" });
  const metadata_response = list(metadata_body.toString());

  /* ################## DATE_CREATED ################## */

  const date_response = list(
    "date_created%5Bgte%5D=2021-07-19&date_created%5Blte%5D=2021-07-20T19%3A32%3A00.000Z"
  );

  /* ################## FULL ################## */

  const full_body = new URLSearchParams({
    limit: 2,
    before:
      "eyJkYXRlT2Zmc2V0IjoiMjAyMS0wNy0yMFQxOTozMDoyOC4wNTJaIiwiaWRPZmZzZXQiOiJhZHJfNzQyN2FhZWE0MjVhZTlmMCJ9",
    "include[]": "total_count",
    "metadata[name]": "Harry",
  });

  full_body.append("date_created[lt]", "2021-07-20T19:32:00.000Z");

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

    t.assert(finale[0].count <= 8);
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

test("create, retrieve, then delete an address", async function (t) {
  const params = {
    description: "Harry - Office",
    name: "Harry Zhang",
    company: "Lob",
    email: "harry@lob.com",
    phone: "5555555555",
    address_line1: "210 King St",
    address_line2: "# 6100",
    address_city: "San Francisco",
    address_state: "CA",
    address_zip: "94107",
    address_country: "US",
  };

  try {
    let response = await prism
      .setup()
      .then((client) =>
        client.post(resource_endpoint, params, { headers: prism.authHeader })
      );

    t.assert(response.status === 200);

    const adr_id = response.data.id;

    // retrieve
    response = await prism.setup().then((client) =>
      client.get(`${resource_endpoint}/${adr_id}`, {
        headers: prism.authHeader,
      })
    );

    t.assert(response.status === 200);

    // delete
    response = await prism.setup().then((client) =>
      client.delete(`${resource_endpoint}/${adr_id}`, {
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

test("allows creation with just a name", async function (t) {
  const params = {
    description: "Harry - Office",
    name: "Harry Zhang",
    email: "harry@lob.com",
    phone: "5555555555",
    address_line1: "210 King St",
    address_line2: "# 6100",
    address_city: "San Francisco",
    address_state: "CA",
    address_zip: "94107",
    address_country: "US",
  };

  try {
    let response = await prism
      .setup()
      .then((client) =>
        client.post(resource_endpoint, params, { headers: prism.authHeader })
      );

    t.assert(response.status === 200);

    // delete
    const deletion = await prism.setup().then((client) =>
      client.delete(`${resource_endpoint}/${response.data.id}`, {
        headers: prism.authHeader,
      })
    );

    t.assert(deletion.status === 200);
  } catch (prismError) {
    if (Object.keys(prismError).length > 0) {
      t.fail(JSON.stringify(prismError, null, 2));
    } else {
      t.fail(prismError.toString());
    }
  }
});

test("allows creation with just a company", async function (t) {
  const params = {
    description: "Harry - Office",
    company: "Lob",
    email: "harry@lob.com",
    phone: "5555555555",
    address_line1: "210 King St",
    address_line2: "# 6100",
    address_city: "San Francisco",
    address_state: "CA",
    address_zip: "94107",
    address_country: "US",
  };

  try {
    let response = await prism
      .setup()
      .then((client) =>
        client.post(resource_endpoint, params, { headers: prism.authHeader })
      );

    t.assert(response.status === 200);

    // delete
    const deletion = await prism.setup().then((client) =>
      client.delete(`${resource_endpoint}/${response.data.id}`, {
        headers: prism.authHeader,
      })
    );

    t.assert(deletion.status === 200);
  } catch (prismError) {
    if (Object.keys(prismError).length > 0) {
      t.fail(JSON.stringify(prismError, null, 2));
    } else {
      t.fail(prismError.toString());
    }
  }
});

test("correctly creates an international address", async function (t) {
  const params = {
    description: "Harry - Office",
    name: "Harry Zhang",
    email: "harry@lob.com",
    phone: "5555555555",
    address_line1: "370 WATER ST",
    address_line2: "",
    address_city: "SUMMERSIDE",
    address_state: "PRINCE EDWARD ISLAND",
    address_zip: "C1N 1C4",
    address_country: "CA",
  };

  try {
    let response = await prism
      .setup({ errors: false })
      .then((client) =>
        client.post(resource_endpoint, params, { headers: prism.authHeader })
      );

    t.assert(response.status === 200);
    t.assert(response.data.address_country === "CANADA");

    // delete
    const deletion = await prism.setup().then((client) =>
      client.delete(`${resource_endpoint}/${response.data.id}`, {
        headers: prism.authHeader,
      })
    );

    t.assert(deletion.status === 200);
  } catch (prismError) {
    if (Object.keys(prismError).length > 0) {
      t.fail(JSON.stringify(prismError, null, 2));
    } else {
      t.fail(prismError.toString());
    }
  }
});

test("correctly creates an international address with mostly-empty input", async function (t) {
  const params = {
    description: "Harry - Office",
    name: "Harry Zhang",
    email: "harry@lob.com",
    phone: "5555555555",
    address_line1: "370 WATER ST",
    address_country: "CA",
  };

  try {
    let response = await prism
      .setup({ errors: false })
      .then((client) =>
        client.post(resource_endpoint, params, { headers: prism.authHeader })
      );

    t.assert(response.status === 200);
    t.assert(response.data.address_country === "CANADA");

    // delete
    const deletion = await prism.setup().then((client) =>
      client.delete(`${resource_endpoint}/${response.data.id}`, {
        headers: prism.authHeader,
      })
    );

    t.assert(deletion.status === 200);
  } catch (prismError) {
    if (Object.keys(prismError).length > 0) {
      t.fail(JSON.stringify(prismError, null, 2));
    } else {
      t.fail(prismError.toString());
    }
  }
});

test("does not treat input as international without country", async function (t) {
  const params = {
    description: "Harry - Office",
    company: "Lob",
    email: "harry@lob.com",
    phone: "5555555555",
    address_line1: "370 Water St",
    address_line2: "",
    address_city: "Summerside",
    address_state: "Prince Edward Island",
    address_zip: "C1N 1C4",
  };

  try {
    let response = await prism
      .setup({ errors: false })
      .then((client) =>
        client.post(resource_endpoint, params, { headers: prism.authHeader })
      );

    t.assert(response.status === 422);
  } catch (prismError) {
    if (Object.keys(prismError).length > 0) {
      t.fail(JSON.stringify(prismError, null, 2));
    } else {
      t.fail(prismError.toString());
    }
  }
});

test("errors when attempting to create an address with neither name nor company", async function (t) {
  const params = {
    description: "Harry - Office",
    email: "harry@lob.com",
    phone: "5555555555",
    address_line1: "210 King St",
    address_line2: "# 6100",
    address_city: "San Francisco",
    address_state: "CA",
    address_zip: "94107",
    address_country: "US",
  };

  try {
    let response = await prism
      .setup({ errors: false })
      .then((client) =>
        client.post(resource_endpoint, params, { headers: prism.authHeader })
      );

    t.assert(response.status === 422);
    t.assert(response.data.error.message.includes("name"));
  } catch (prismError) {
    if (Object.keys(prismError).length > 0) {
      t.fail(JSON.stringify(prismError, null, 2));
    } else {
      t.fail(prismError.toString());
    }
  }
});

test("errors when attempting to create a US address without city and state", async function (t) {
  const params = {
    description: "Harry - Office",
    email: "harry@lob.com",
    phone: "5555555555",
    address_line1: "210 King St",
    address_line2: "# 6100",
    address_zip: "94107",
    address_country: "US",
  };

  try {
    let response = await prism
      .setup({ errors: false })
      .then((client) =>
        client.post(resource_endpoint, params, { headers: prism.authHeader })
      );

    t.assert(response.status === 422);
    t.assert(response.data.error.message.includes("address_city"));
  } catch (prismError) {
    if (Object.keys(prismError).length > 0) {
      t.fail(JSON.stringify(prismError, null, 2));
    } else {
      t.fail(prismError.toString());
    }
  }
});

test("errors at the promise level", async function (t) {
  const params = {
    description: "Harry - Office",
    name: "Harry Zhang",
    email: "harry@lob.com",
    phone: "5555555555",
    address_line1: "210 King St",
    address_line2: "# 6100",
    address_city: "San Francisco",
    address_state: "CA",
    address_zip: "94107",
    address_country: "US",
  };

  try {
    let response = await prism
      .setup()
      .then((client) =>
        client.post("/addressos", params, { headers: prism.authHeader })
      );

    t.assert(response.status === 200);
  } catch (err) {
    t.assert(err["detail"].includes("route"));
  }
});
