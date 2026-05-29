// ***********************************************************
// This example support/e2e.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import "./commands";

// Alternatively you can use CommonJS syntax:
// require('./commands')

// The Redoc search index (lunr.js) throws "Out of order word insertion" as an
// unhandled promise rejection when building its client-side index. This is a
// known lunr issue with the word ordering in the generated index and does not
// affect page functionality or any assertion made by these tests.
Cypress.on("uncaught:exception", (err) => {
  if (err.message.includes("Out of order word insertion")) {
    return false;
  }
});
