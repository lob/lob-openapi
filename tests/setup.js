'use strict';

const { getHttpOperationsFromSpec }  = require('@stoplight/prism-cli/dist/operations');
const { createClientFromOperations } = require('@stoplight/prism-http/dist/client');
const { URL }                        = require('url');

const lobUri = 'https://api.lob.com/v1';
const clientOptions = {
  mock: false,
  validateRequest: true,
  validateResponse: true,
  checkSecurity: false,
  errors: false,
  baseurl: lobUri,
  upstream: new URL(lobUri),
};

const specFile = './Lob-API-public.yml';

module.exports.setup = async (override = {}) => {
  const operations = await getHttpOperationsFromSpec(specFile);
  return createClientFromOperations(operations, { ...clientOptions, ...override });
}

const testSecret = 'Basic dGVzdF8wZGM4ZDUxZTBhY2ZmY2IxODgwZTBmMTljNzliMmY1YjBjYzo='
module.exports.authHeader = { Authorization: testSecret };
