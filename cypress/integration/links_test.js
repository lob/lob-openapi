describe("My First Test", () => {
  beforeEach(() => {
    cy.visit("https://docs.lob.com/");
  });

  it("contains a link to the main Lob page", () => {
    // makes sure the lob.com link goes to the right page
    cy.get('*[class^="brand w-nav-brand"]')
      .should("have.attr", "href")
      .and("include", "https://lob.com");
  });

  it("contains the support link", () => {
    // makes sure the support link goes to the right page
    cy.get('*[class^="sc-gsWcmt gCgqqY"]')
      .contains("https://support.lob.com/")
      .should("have.attr", "href")
      .and("include", "https://support.lob.com");
  });

  it("contains the right email", () => {
    // the email should be correct
    cy.contains("lob-openapi@lob.com");
  });

  it("contains the licence link", () => {
    // makes sure the support link goes to the right page
    cy.get('*[class^="sc-gsWcmt gCgqqY"]')
      .contains("MIT")
      .should("have.attr", "href")
      .and("include", "https://mit-license.org");
  });

  it("contains the terms of service link", () => {
    // makes sure the support link goes to the right page
    cy.get('*[class^="sc-gsWcmt gCgqqY"]')
      .contains("Terms of Service")
      .should("have.attr", "href")
      .and("include", "https://www.lob.com/legal");
  });

  it("contains the previous documentation link", () => {
    // makes sure the support link goes to the right page
    cy.get('*[class^="sc-iBzEeX sc-cOifOu dFWqin rUYTT"]')
      .contains("previous documentation")
      .should("have.attr", "href")
      .and("include", "https://lob.github.io/legacy-docs");
  });

  it("contains the HTTP Basic Auth link", () => {
    // makes sure the support link goes to the right page
    cy.get('*[class^="sc-iBzEeX sc-cOifOu dFWqin rUYTT redoc-markdown"]')
      .contains("HTTP Basic authentication")
      .should("have.attr", "href")
      .and(
        "include",
        "https://en.wikipedia.org/wiki/Basic_access_authentication"
      );
  });

  it("contains the error codes link", () => {
    // makes sure the support link goes to the right page
    cy.get('*[class^="sc-iBzEeX sc-cOifOu dFWqin rUYTT redoc-markdown"]')
      .contains("error code")
      .should("have.attr", "href")
      .and("include", "#tag/Errors");
  });

  it("contains the dashboard link", () => {
    // makes sure the support link goes to the right page
    cy.get('*[class^="sc-iBzEeX sc-cOifOu dFWqin rUYTT redoc-markdown"]')
      .contains("Dashboard Settings")
      .should("have.attr", "href")
      .and("include", "dashboard.lob.com");
  });

  it("contains the dashboard settings link again", () => {
    // makes sure the support link goes to the right page
    cy.get('*[class^="sc-iBzEeX sc-cOifOu dFWqin rUYTT redoc-markdown"]')
      .contains("Settings")
      .should("have.attr", "href")
      .and("include", "dashboard.lob.com");
  });

  it("contains the test & live environments link", () => {
    // makes sure the support link goes to the right page
    cy.get('*[class^="sc-iBzEeX sc-cOifOu dFWqin rUYTT redoc-markdown"]')
      .contains("Test and Live Environments")
      .should("have.attr", "href")
      .and("include", "#tag/Test-and-Live-Environments");
  });
});

// cy.contains("Lob’s Print & Mail and Address Verification APIs help companies transform outdated, manual print-and-mail processes; save 1,000s of hours in processing time by sending mail much more quickly; and increase ROI on offline communications.");
