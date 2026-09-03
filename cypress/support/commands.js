const DEPLOYED_DOCS_URL = "https://lob.github.io/lob-openapi/";
const SEGMENT_SCRIPT_URL = "https://cdn.segment.com/**";
const REDOCLY_SCRIPT_URL =
  "https://cdn.redocly.com/redoc/**/redoc.standalone.js";

Cypress.Commands.add("visitDocs", ({ hydrate = false } = {}) => {
  const docsUrl = Cypress.expose("docsUrl") || DEPLOYED_DOCS_URL;

  // These smoke tests validate prerendered docs content and styles. Keep
  // analytics inert so failures are tied to docs content changes.
  cy.intercept("GET", SEGMENT_SCRIPT_URL, {
    headers: { "content-type": "text/javascript" },
    body: "",
  });

  if (!hydrate) {
    cy.intercept("GET", REDOCLY_SCRIPT_URL, {
      headers: { "content-type": "text/javascript" },
      body: "window.Redoc = { hydrate: function() {} };",
    });

    // The redoc script tag carries a Subresource Integrity hash for the real
    // bundle. Since we stub that script's body above, the browser's SRI
    // check would reject it and leave window.Redoc undefined, so strip the
    // integrity/crossorigin attributes from just that tag before it loads.
    cy.intercept("GET", docsUrl, (req) => {
      req.continue((res) => {
        res.body = res.body.replace(
          /<script([^>]*\bsrc="https:\/\/cdn\.redocly\.com\/redoc\/[^"]*")[^>]*>/,
          "<script$1>"
        );
      });
    });
  }

  cy.visit(docsUrl);
});
