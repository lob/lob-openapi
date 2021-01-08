'use strict';

// standard setup, present in every test
const test                  = require('tape');
const { setup, authHeader } = require('./setup.js');

// test specific data
const resource_endpoint = '/addresses';
const adr_id = 'adr_43769b47aed248c2';

// contract tests
test('list addresses', async function(t) {
  const client = await setup();

  t.ok(client.get(resource_endpoint, { headers: authHeader }));
});

test('create an address', async function(t) {
  const client = await setup();

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

  t.ok(client.post(resource_endpoint, params, { headers: authHeader }));
});

test('retrieve an address', async function(t) {
  const client = await setup();

  t.ok(client.get(`${resource_endpoint}/${adr_id}`, { headers: authHeader }));
});

test('delete an address', async function(t) {
  const client = await setup();

  t.ok(client.delete(`${resource_endpoint}/${adr_id}`, { headers: authHeader }));
});
