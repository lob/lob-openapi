'use strict';

const test                  = require('tape');
const { setup, authHeader } = require('./setup.js');

const resource_endpoint = '/us_zip_lookups';
const zip = '94107';

test('lookup a US zip code', async function(t) {
  const response = await setup()
    .then(client => client.post(resource_endpoint, { zip_code: zip }, { headers: authHeader }));

    t.equal(response.status, 200);
  });

// I could not figure out how to get t.throws to take an async function
test('use an incorrectly formatted zip code', async function(t) {
  const response = await setup()
    .then(client => client.post(resource_endpoint, { zip_code: '123456' }, { headers: authHeader }));

  t.equal(response.status, 422);
  t.match(response.data.error.message, /zip_code/);
  t.end();
});
