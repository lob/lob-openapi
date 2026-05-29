const DEPLOYED_DOCS_URL = "https://lob.github.io/lob-openapi/";
const SEGMENT_SCRIPT_URL = "https://cdn.segment.com/**";
const REDOCLY_SCRIPT_URL =
  "https://cdn.redocly.com/redoc/**/redoc.standalone.js";

Cypress.Commands.add("visitDocs", () => {
  // These smoke tests validate prerendered docs content and styles. Keep
  // third-party scripts inert so failures are tied to docs content changes.
  cy.intercept("GET", SEGMENT_SCRIPT_URL, {
    headers: { "content-type": "text/javascript" },
    body: "",
  });

  cy.intercept("GET", REDOCLY_SCRIPT_URL, {
    headers: { "content-type": "text/javascript" },
    body: "window.Redoc = { hydrate: function() {} };",
  });

  cy.visit(Cypress.env("docsUrl") || DEPLOYED_DOCS_URL);
});
