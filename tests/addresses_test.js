'use strict';

// standard setup, present in every test
const test                  = require('tape');
const { setup, authHeader } = require('./setup.js');

// test specific data
const resource_endpoint = '/addresses';
const me = authHeader(process.env.LOB_API_TEST_TOKEN);

// contract tests
test('list addresses', async function(t) {
  const response = await setup()
    .then(client => client.get(resource_endpoint, { headers: me }));

  t.equal(response.status, 200);
});

test('create, retrieve, then delete an address', async function(t) {
  const params = {
    description:     'Harry - Office',
    name:            'Harry Zhang',
    company:         'Lob',
    email:           'harry@lob.com',
    phone:           '5555555555',
    address_line1:   '185 Berry St',
    address_line2:   '# 6100',
    address_city:    'San Francisco',
    address_state:   'CA',
    address_zip:     '94107',
    address_country: 'US',
  }

  let response = await setup()
    .then(client => client.post(resource_endpoint, params, { headers: me }));

  t.equal(response.status, 200);

  const adr_id = response.data.id;

  // retrieve
  response = await setup().
    then(client => client.get(`${resource_endpoint}/${adr_id}`, { headers: me }));

  t.equal(response.status, 200);

  // delete
  response = await setup()
    .then(client => client.delete(`${resource_endpoint}/${adr_id}`, { headers: me }));

  t.equal(response.status, 200);
});
