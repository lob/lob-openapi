"use strict";

const {
  getHttpOperationsFromSpec,
} = require("@stoplight/prism-cli/dist/operations");
const {
  createClientFromOperations,
} = require("@stoplight/prism-http/dist/client");
const { URL } = require("url");
const btoa = require("btoa");

const defaultClientOptions = {
  mock: false,
  validateRequest: true,
  validateResponse: true,
  checkSecurity: false,
  errors: true,
};

const configurePrism = (baseurl, options = {}) => {
  let result = { ...defaultClientOptions, ...options };
  result.baseurl = baseurl;
  result.upstream = new URL(baseurl);
  return result;
};

const authHeader = (token) => {
  return {
    Authorization: `Basic ${btoa(`${token}:`)}`,
    "content-type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS, PUT, PATCH, DELETE",
    "Access-Control-Allow-Headers": "X-Requested-With,content-type",
    "Access-Control-Allow-Credentials": true,
  };

};

module.exports = class Prism {
  constructor(specFile, baseurl, token, options = {}) {
    this.specFile = specFile;
    this.authHeader = authHeader(token);
    this.options = configurePrism(baseurl, options);
  }

  async setup(override = {}) {
    const operations = await getHttpOperationsFromSpec(this.specFile);
    return createClientFromOperations(operations, {
      ...this.options,
      ...override,
    });
  }
};
