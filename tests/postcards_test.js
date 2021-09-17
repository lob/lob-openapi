"use strict";

// standard setup, present in every test
const test = require("ava");
const fs = require("fs");
const path = require("path");
const Prism = require("./setup.js");

// test specific data
const resource_endpoint = "/postcards",
  lobUri = "https://api.lob.com/v1",
  specFile = "./lob-api-public.yml";

const prism = new Prism(specFile, lobUri, process.env.LOB_API_TEST_TOKEN);

// contract tests happy path
test("list postcards' params", async function (t) {
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

  const limit_body = new URLSearchParams({ limit: 4 });
  const limit_response = list(limit_body.toString());

  /* ################## BEFORE ################## */

  const before_body = new URLSearchParams({
    before:
      "eyJkYXRlT2Zmc2V0IjoiMjAyMS0wNS0wM1QxOTowNDowMS40OThaIiwiaWRPZmZzZXQiOiJwc2NfZjA1OTQ2N2FkZjJhMDk3MyJ9",
  });

  const before_response = list(before_body.toString());

  /* ################## AFTER ################## */

  const after_body = new URLSearchParams({
    after:
      "eyJkYXRlT2Zmc2V0IjoiMjAyMS0wNS0wM1QxOTowNDowMS40OThaIiwiaWRPZmZzZXQiOiJwc2NfZjA1OTQ2N2FkZjJhMDk3MyJ9",
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
    "date_created%5Bgt%5D=2021-05-03T04%3A30%3A00.000Z&date_created%5Blt%5D=2021-05-03T05%3A00%3A00.000Z"
  );

  /* ################## FULL ################## */

  const full_body = new URLSearchParams({
    limit: 2,
    after:
      "eyJkYXRlT2Zmc2V0IjoiMjAyMS0wNS0wNFQyMzozMzozOC42MTNaIiwiaWRPZmZzZXQiOiJjaGtfNTc5MjQ1YWEwNDk4MjMwYiJ9",
    "include[]": "total_count",
    "metadata[name]": "Harry",
    "metadata[age]": 30,
    "metadata[employee]": true,
  });

  full_body.append("date_created[gt]", "2021-05-03T04:30:00.000Z");
  full_body.append("date_created[lt]", "2021-05-03T05:00:00.000Z");

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

    t.assert(finale[0].count <= 4);
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

test.serial.before(
  "create a postcardd, postcard with full payload, and postcard using remote template",
  async function (t) {
    // NORMAL POSTCARD
    const makeAddress = async (address_data) => {
      try {
        let response = await prism.setup().then((client) =>
          client.post("/addresses", address_data, {
            headers: prism.authHeader,
          })
        );
        t.assert(response.status === 200);
        return response.data.id;
      } catch (prismError) {
        console.error(prismError);
        t.assert(false);
        return prismError;
      }
    };
    t.context.to = await makeAddress({
      company: "Lob (old)",
      address_line1: "185 Berry St",
      address_line2: "# 6100",
      address_city: "San Francisco",
      phone: "5555555555",
      address_state: "CA",
      address_zip: "94107",
    });
    t.context.from = await makeAddress({
      company: "Lob (new)",
      address_line1: "210 King St",
      address_city: "San Francisco",
      address_state: "CA",
      address_zip: "94107",
      address_country: "US",
    });

    try {
      // template type: remote upload
      const create = await prism.setup().then((client) =>
        client.post(
          resource_endpoint,
          {
            to: t.context.to,
            from: t.context.from,
            front:
              "https://s3-us-west-2.amazonaws.com/public.lob.com/assets/templates/4x6_pc_template.pdf",
            back: "https://s3-us-west-2.amazonaws.com/public.lob.com/assets/templates/4x6_pc_template.pdf",
          },
          { headers: prism.authHeader }
        )
      );
      t.assert(create.status === 200);
      t.context.normal_id = create.data.id;
    } catch (prismError) {
      if (Object.keys(prismError).length > 0) {
        t.fail(JSON.stringify(prismError, null, 2));
      } else {
        t.fail(prismError.toString());
      }
    }

    // FULL PAYLOAD POSTCARD
    const date = new Date();
    date.setDate(date.getDate() + 1); // adding a day to today's date so clearly within 180 days of today
    t.context.to_full = await makeAddress({
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
    t.context.from_full = await makeAddress({
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
    try {
      const create = await prism.setup().then((client) =>
        client.post(
          resource_endpoint,
          {
            description: "Demo Postcard",
            to: t.context.to_full,
            from: t.context.from_full,
            send_date: date.toISOString(),
            front:
              "https://s3-us-west-2.amazonaws.com/public.lob.com/assets/templates/6x11_pc_template.pdf",
            back: "https://s3-us-west-2.amazonaws.com/public.lob.com/assets/templates/6x11_pc_template.pdf",
            size: "6x11",
            mail_type: "usps_standard",
            merge_variables: { name: "Harry" },
          },
          { headers: prism.authHeader }
        )
      );
      t.assert(create.status === 200);
      t.context.full_id = create.data.id;
    } catch (prismError) {
      if (Object.keys(prismError).length > 0) {
        t.fail(JSON.stringify(prismError, null, 2));
      } else {
        t.fail(prismError.toString());
      }
    }
  }
);

test.serial("list, read then cancel a postcard", async function (t) {
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
      client.get(`${resource_endpoint}/${t.context.normal_id}`, {
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
    const cancel = await prism.setup().then((client) =>
      client.delete(`${resource_endpoint}/${t.context.normal_id}`, {
        headers: prism.authHeader,
      })
    );
    t.assert(cancel.status === 200);
  } catch (prismError) {
    if (Object.keys(prismError).length > 0) {
      t.fail(JSON.stringify(prismError, null, 2));
    } else {
      t.fail(prismError.toString());
    }
  }
});

test.serial(
  "list, read then cancel a postcard with full payload",
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
        client.get(`${resource_endpoint}/${t.context.full_id}`, {
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
      const cancel = await prism.setup().then((client) =>
        client.delete(`${resource_endpoint}/${t.context.full_id}`, {
          headers: prism.authHeader,
        })
      );
      t.assert(cancel.status === 200);
    } catch (prismError) {
      if (Object.keys(prismError).length > 0) {
        t.fail(JSON.stringify(prismError, null, 2));
      } else {
        t.fail(prismError.toString());
      }
    }
  }
);

test("creates a postcard given a local filepath as the front & back", async function (t) {
  function streamToString(stream) {
    const chunks = [];
    return new Promise((resolve, reject) => {
      stream.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
      stream.on("error", (err) => reject(err));
      stream.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    });
  }

  const files = fs.createReadStream(
    path.resolve(
      "tests/assets/customer-thank-you-postcard-template-4x6-front.html"
    )
  );
  try {
    const frontBack = await streamToString(files);

    // template type: local upload
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
          },
          from: {
            company: "Lob (new)",
            address_line1: "210 King St",
            address_city: "San Francisco",
            address_state: "CA",
            address_zip: "94107",
            address_country: "US",
          },
          front: frontBack,
          back: frontBack,
        },
        { headers: prism.authHeader }
      )
    );
    t.assert(create.status === 200);

    const cancel = await prism.setup().then((client) =>
      client.delete(`${resource_endpoint}/${create.data.id}`, {
        headers: prism.authHeader,
      })
    );
    t.assert(cancel.status === 200);
  } catch (prismError) {
    if (Object.keys(prismError).length > 0) {
      t.fail(JSON.stringify(prismError, null, 2));
    } else {
      t.fail(prismError.toString());
    }
  }
});

test("creates a postcard given an html string as the front & back", async function (t) {
  try {
    const create = await prism.setup().then((client) =>
      client.post(
        resource_endpoint,
        {
          description: "Demo Postcard",
          to: {
            company: "Lob (old)",
            address_line1: "185 Berry St",
            address_line2: "# 6100",
            address_city: "San Francisco",
            address_state: "CA",
            address_zip: "94107",
          },
          from: {
            company: "Lob (new)",
            address_line1: "210 King St",
            address_city: "San Francisco",
            address_state: "CA",
            address_zip: "94107",
            address_country: "US",
          },
          front:
            "<html style='padding: 1in; font-size: 50;'>Front HTML for {{name}}</html>",
          back: "<html style='padding: 1in; font-size: 20;'>Back HTML for {{name}}</html>",
          size: "6x11",
          mail_type: "usps_standard",
          merge_variables: { name: "Harry" },
        },
        { headers: prism.authHeader }
      )
    );
    t.assert(create.status === 200);

    const cancel = await prism.setup().then((client) =>
      client.delete(`${resource_endpoint}/${create.data.id}`, {
        headers: prism.authHeader,
      })
    );
    t.assert(cancel.status === 200);
  } catch (prismError) {
    if (Object.keys(prismError).length > 0) {
      t.fail(JSON.stringify(prismError, null, 2));
    } else {
      t.fail(prismError.toString());
    }
  }
});

test("creates a postcard given template IDs for the front & back", async function (t) {
  try {
    const create = await prism.setup().then((client) =>
      client.post(
        resource_endpoint,
        {
          description: "Demo Postcard",
          to: {
            company: "Lob (old)",
            address_line1: "185 Berry St",
            address_line2: "# 6100",
            address_city: "San Francisco",
            address_state: "CA",
            address_zip: "94107",
          },
          from: {
            company: "Lob (new)",
            address_line1: "210 King St",
            address_city: "San Francisco",
            address_state: "CA",
            address_zip: "94107",
            address_country: "US",
          },
          front: "tmpl_55ba9d8ff619cef",
          back: "tmpl_65eed611c85b650",
          size: "6x11",
          mail_type: "usps_standard",
          merge_variables: { name: "Harry" },
        },
        { headers: prism.authHeader }
      )
    );
    t.assert(create.status === 200);

    const cancel = await prism.setup().then((client) =>
      client.delete(`${resource_endpoint}/${create.data.id}`, {
        headers: prism.authHeader,
      })
    );
    t.assert(cancel.status === 200);
  } catch (prismError) {
    if (Object.keys(prismError).length > 0) {
      t.fail(JSON.stringify(prismError, null, 2));
    } else {
      t.fail(prismError.toString());
    }
  }
});

// select failure cases:
test("throws errors when input is not validated", async function (t) {
  // errors when one of the required fields (state) is missing
  try {
    const create_domestic = await prism
      .setup({ errors: false })
      .then((client) =>
        client.post(
          resource_endpoint,
          {
            to: {
              company: "Lob (old)",
              address_line1: "185 Berry St",
              address_line2: "# 6100",
              address_city: "San Francisco",
              address_zip: "94107",
            },
            from: {
              company: "Lob (new)",
              address_line1: "210 King St",
              address_city: "San Francisco",
              address_state: "CA",
              address_zip: "94107",
              address_country: "US",
            },
            front:
              "https://s3-us-west-2.amazonaws.com/public.lob.com/assets/templates/4x6_pc_template.pdf",
            back: "https://s3-us-west-2.amazonaws.com/public.lob.com/assets/templates/4x6_pc_template.pdf",
          },
          { headers: prism.authHeader }
        )
      );
    t.assert(create_domestic.status === 422);
  } catch (prismError) {
    if (Object.keys(prismError).length > 0) {
      t.fail(JSON.stringify(prismError, null, 2));
    } else {
      t.fail(prismError.toString());
    }
  }

  // errors when no country is provided for international address
  try {
    const create_intl = await prism.setup({ errors: false }).then((client) =>
      client.post(
        resource_endpoint,
        {
          to: {
            company: "Lobster House",
            address_line1: "370 Water St",
            address_city: "Summerside",
            address_state: "Prince Edward Island",
            address_zip: "C1N 1C4",
          },
          from: {
            company: "Lob (new)",
            address_line1: "210 King St",
            address_city: "San Francisco",
            address_state: "CA",
            address_zip: "94107",
            address_country: "US",
          },
          front:
            "https://s3-us-west-2.amazonaws.com/public.lob.com/assets/templates/4x6_pc_template.pdf",
          back: "https://s3-us-west-2.amazonaws.com/public.lob.com/assets/templates/4x6_pc_template.pdf",
        },
        { headers: prism.authHeader }
      )
    );
    t.assert(create_intl.status === 422);
  } catch (prismError) {
    if (Object.keys(prismError).length > 0) {
      t.fail(JSON.stringify(prismError, null, 2));
    } else {
      t.fail(prismError.toString());
    }
  }
});

test("throws error when metadata is not string, number, or boolean", async function (t) {
  try {
    const create = await prism.setup({ errors: false }).then((client) =>
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
          },
          from: {
            company: "Lob (new)",
            address_line1: "210 King St",
            address_city: "San Francisco",
            address_state: "CA",
            address_zip: "94107",
            address_country: "US",
          },
          front:
            "https://s3-us-west-2.amazonaws.com/public.lob.com/assets/templates/4x6_pc_template.pdf",
          back: "https://s3-us-west-2.amazonaws.com/public.lob.com/assets/templates/4x6_pc_template.pdf",
          metadata: {
            name: "Harry",
            maps: {
              key1: "This isn't a valid metadata object",
            },
          },
        },
        { headers: prism.authHeader }
      )
    );
    t.assert(create.status === 422);
    t.assert(create.data.error.message.includes("metadata"));
  } catch (prismError) {
    if (Object.keys(prismError).length > 0) {
      t.fail(JSON.stringify(prismError, null, 2));
    } else {
      t.fail(prismError.toString());
    }
  }
});

test.after.always("delete addresses", async function (t) {
  const deleteAddress = async (address_id) => {
    try {
      const response = await prism.setup().then((client) =>
        client.delete(`/addresses/${address_id}`, {
          headers: prism.authHeader,
        })
      );

      t.assert(response.status === 200);
      return response;
    } catch (prismError) {
      if (Object.keys(prismError).length > 0) {
        t.fail(JSON.stringify(prismError, null, 2));
      } else {
        t.fail(prismError.toString());
        return prismError;
      }
    }
  };
  await deleteAddress(t.context.to);
  await deleteAddress(t.context.to_full);
  await deleteAddress(t.context.from);
  await deleteAddress(t.context.from_full);
});
