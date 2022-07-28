"use strict";

// standard setup, present in every test
const test = require("ava");
const Prism = require("./setup.js");
const fs = require("fs");
const FormData = require("form-data");

// test specific data
const resource_endpoint = "/uploads",
  lobUri = "https://api.lob.com/v1",
  specFile = "./lob-api-public.yml";

const prism = new Prism(specFile, lobUri, process.env.LOB_API_TEST_TOKEN);

test.serial.before("create campaign", async function (t) {
  try {
    const result = await prism.setup().then((client) =>
      client.post(
        "/campaigns",
        {
          name: "lob-openapi uploads campaign",
          schedule_type: "immediate",
        },
        { headers: prism.authHeader }
      )
    );

    t.context.cmp_id = result.data.id;
  } catch (prismError) {
    if (Object.keys(prismError).length > 0) {
      t.fail(JSON.stringify(prismError, null, 2));
    } else {
      t.fail(prismError.toString());
    }
  }
});

test("create, retrieve, update upload, create export, retrieve export, delete upload", async function (t) {
  try {
    // create
    let response = await prism.setup().then((client) =>
      client.post(
        resource_endpoint,
        {
          campaignId: t.context.cmp_id,
          columnMapping: {
            name: "recipient",
            address_line1: "primary line",
          },
        },
        { headers: prism.authHeader }
      )
    );

    t.assert(response.status === 201);

    const upl_id = response.data.id;

    // retrieve
    response = await prism.setup().then((client) =>
      client.get(`${resource_endpoint}/${upl_id}`, {
        headers: prism.authHeader,
      })
    );

    t.assert(response.status === 200);

    // update
    response = await prism.setup().then((client) =>
      client.patch(
        `${resource_endpoint}/${upl_id}`,
        {
          columnMapping: {
            address_zip: "zip_code",
            address_state: "state",
            address_city: "city",
          },
        },
        {
          headers: prism.authHeader,
        }
      )
    );

    t.assert(response.status === 200);
    t.assert(response.data.columnMapping.name === "recipient");
    t.assert(response.data.columnMapping.address_zip === "zip_code");

    /* commented because can't get it to work with prism/javascript */
    // // upload file
    // // const form = new FormData();
    // // form.append('file', fs.createReadStream("tests/assets/lobster-family.csv"));
    // response = await prism.setup().then((client) =>
    //   client.post(
    //     `${resource_endpoint}/${upl_id}/file`,
    //     // form,
    //     {
    //       file: fs.readFile("tests/assets/lobster-family.csv", (err, data) => {
    //         if (err) throw err;
    //         return data;
    //       }),
    //     },
    //     {
    //       // headers: {...prism.authHeader, "content-type": `multipart/form-data; boundary=${form._boundary}`},
    //       headers: prism.authHeader
    //     }
    //   )
    // );
    //
    // t.assert(response.status === 202);

    // create export
    response = await prism.setup().then((client) =>
      client.post(
        `${resource_endpoint}/${upl_id}/exports`,
        {
          type: "all",
        },
        {
          headers: prism.authHeader,
        }
      )
    );

    t.assert(response.status === 200);
    const ex_id = response.data.exportId;

    // retrieve export
    response = await prism.setup().then((client) =>
      client.get(`${resource_endpoint}/${upl_id}/exports/${ex_id}`, {
        headers: prism.authHeader,
      })
    );

    t.assert(response.status === 200);

    // delete
    response = await prism.setup().then((client) =>
      client.delete(`${resource_endpoint}/${upl_id}`, {
        headers: prism.authHeader,
      })
    );

    t.assert(response.status === 204);
  } catch (prismError) {
    if (Object.keys(prismError).length > 0) {
      t.fail(JSON.stringify(prismError, null, 2));
    } else {
      t.fail(prismError.toString());
    }
  }
});

test("list uploads", async function (t) {
  try {
    const response = await prism.setup().then((client) =>
      client.get(
        `${resource_endpoint}?${new URLSearchParams({
          campaignId: t.context.cmp_id,
        }).toString()}`,
        {
          headers: prism.authHeader,
        }
      )
    );
    if (response.status !== 200) console.log(response);
    t.assert(response.status === 200);
    return response.data;
  } catch (prismError) {
    if (Object.keys(prismError).length > 0) {
      t.fail(JSON.stringify(prismError, null, 2));
    } else {
      t.fail(prismError.toString());
    }
  }
});

test("errors when columnMapping is not passed in", async function (t) {
  try {
    const response = await prism.setup({ errors: false }).then((client) =>
      client.post(
        resource_endpoint,
        {
          campaignId: t.context.cmp_id,
        },
        { headers: prism.authHeader }
      )
    );

    t.assert(response.status === 400);
    t.assert(response.data.message.includes("Invalid body"));
  } catch (prismError) {
    if (Object.keys(prismError).length > 0) {
      t.fail(JSON.stringify(prismError, null, 2));
    } else {
      t.fail(prismError.toString());
    }
  }
});

test.after.always("delete campaign", async function (t) {
  try {
    const deleted_campaign = await prism.setup().then((client) =>
      client.delete(`/campaigns/${t.context.cmp_id}`, {
        headers: prism.authHeader,
      })
    );
    t.assert(deleted_campaign.status === 200);
  } catch (prismError) {
    if (Object.keys(prismError).length > 0) {
      t.fail(JSON.stringify(prismError, null, 2));
    } else {
      t.fail(prismError.toString());
    }
  }
});
