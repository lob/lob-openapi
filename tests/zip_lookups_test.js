'use strict'

const test = require('tape')
const Prism = require('./setup.js')

// test specific data
const resource_endpoint = '/us_zip_lookups',
  zip = '94107',
  lobUri = 'https://api.lob.com/v1',
  specFile = './Lob-API-public.yml'

const prism = new Prism(specFile, lobUri, process.env.LOB_API_TEST_TOKEN)

test('lookup a US zip code', async function (t) {
  const response = await prism
    .setup()
    .then((client) =>
      client.post(
        resource_endpoint,
        { zip_code: zip },
        { headers: prism.authHeader }
      )
    )

  t.equal(response.status, 200)
})

test('use an incorrectly formatted zip code', async function (t) {
  const response = await prism
    .setup()
    .then((client) =>
      client.post(
        resource_endpoint,
        { zip_code: '123456' },
        { headers: prism.authHeader }
      )
    )

  t.equal(response.status, 422)
  t.match(response.data.error.message, /zip_code/)
  t.end()
})
