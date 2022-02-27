describe("ensures introduction links and text are valid", () => {
  // This link leads to the staging docs which are built off main right now.
  // We will change it to the live docs after a new release is created, since
  // some things used in the tests––like the ID––aren't live yet.
  beforeEach(() => {
    cy.visit("https://lob.github.io/lob-openapi/");
  });

  it("contains the right specification and date", () => {
    cy.contains("Specification (1.3.0)");
    cy.contains("Lob API (2020-02-11)");
  });

  it("contains a link to the main Lob page", () => {
    // makes sure the lob.com link goes to the right page
    cy.get('a[id="lob-link"]')
      .should("have.attr", "href")
      .and("include", "https://lob.com");
  });

  it("contains the support link", () => {
    // makes sure the support link goes to the right page
    cy.contains("https://support.lob.com/")
      .should("have.attr", "href")
      .and("include", "https://support.lob.com");
  });

  it("contains the right email", () => {
    // the email should be correct
    cy.contains("lob-openapi@lob.com");
  });

  it("contains the licence link", () => {
    // makes sure the licence link goes to the right page
    cy.contains("MIT")
      .should("have.attr", "href")
      .and("include", "https://mit-license.org");
  });

  it("contains the terms of service link", () => {
    // makes sure the ToS link goes to the right page
    cy.contains("Terms of Service")
      .should("have.attr", "href")
      .and("include", "https://www.lob.com/legal");
  });

  it("contains the previous documentation link", () => {
    // makes sure the previous documentation link goes to the right page
    cy.contains("previous documentation")
      .should("have.attr", "href")
      .and("include", "https://lob.github.io/legacy-docs");
  });

  it("contains the HTTP Basic Auth link", () => {
    // makes sure the basic auth link goes to the right page
    cy.contains("HTTP Basic authentication")
      .should("have.attr", "href")
      .and(
        "include",
        "https://en.wikipedia.org/wiki/Basic_access_authentication"
      );
  });

  it("contains the error codes link", () => {
    // makes sure the error codes link goes to the right page
    cy.contains("error code")
      .should("have.attr", "href")
      .and("include", "#tag/Errors");
  });

  it("contains the dashboard link", () => {
    // makes sure the dashboard link goes to the right page
    cy.contains("Dashboard Settings")
      .should("have.attr", "href")
      .and("include", "dashboard.lob.com");
  });

  it("contains the dashboard settings link again", () => {
    // makes sure the other dashboard link goes to the right page
    cy.contains("Settings")
      .should("have.attr", "href")
      .and("include", "dashboard.lob.com");
  });

  // no choice but to use classes for this
  it("contains the test & live environments link", () => {
    // makes sure the test & live environments link goes to the right page
    // using a class is necessary for this because the element
    // chain goes too deep otherwise
    cy.get('*[class^="sc-iBzEeX sc-cOifOu dFWqin rUYTT redoc-markdown"]')
      .contains("Test and Live Environments")
      .should("have.attr", "href")
      .and("include", "#tag/Test-and-Live-Environments");
  });

  it("contains the Lob.com link", () => {
    // makes sure the dashboard registry link goes to the right page
    cy.contains("Lob.com")
      .should("have.attr", "href")
      .and("include", "https://dashboard.lob.com/#/register");
  });

  it("contains the keys link", () => {
    // makes sure the keys link goes to the right page
    cy.contains("settings")
      .should("have.attr", "href")
      .and("include", "https://dashboard.lob.com/#/settings/keys");
  });

  it("contains the SDK link", () => {
    // makes sure the SDK link goes to the right page
    cy.contains("Lob SDK")
      .should("have.attr", "href")
      .and("include", "#tag/SDKs-and-Tools");
  });

  // sc-hKFxyN dmghQN
  it("contains the Getting Started links", () => {
    // makes sure the SDK link goes to the right page
    cy.get('*[class^="sc-hKFxyN dmghQN"]')
      .contains("Postcards")
      .should("have.attr", "href")
      .and(
        "include",
        "https://www.lob.com/guides?tab=postcards-self-mailers#getting_started"
      );
    cy.get('*[class^="sc-hKFxyN dmghQN"]')
      .contains("Self-Mailers")
      .should("have.attr", "href")
      .and(
        "include",
        "https://www.lob.com/guides?tab=postcards-self-mailers#getting_started_selfmailers"
      );
    cy.get('*[class^="sc-hKFxyN dmghQN"]')
      .contains("Letters")
      .should("have.attr", "href")
      .and(
        "include",
        "https://www.lob.com/guides?tab=letters#getting_started_letters"
      );
    cy.get('*[class^="sc-hKFxyN dmghQN"]')
      .contains("Checks")
      .should("have.attr", "href")
      .and(
        "include",
        "https://www.lob.com/guides?tab=checks#getting_started_checks"
      );
    cy.get('*[class^="sc-hKFxyN dmghQN"]')
      .contains("Address Verification Elements")
      .should("have.attr", "href")
      .and(
        "include",
        "https://www.lob.com/guides?tab=address-verification#av-elements-quickstart"
      );
  });

  // sc-iBzEeX sc-cOifOu dFWqin rUYTT redoc-markdown
  it("contains the language repo links", () => {
    // makes sure the SDK link goes to the right page
    cy.get('div[id="tag/SDKs-and-Tools"]')
      .contains("Ruby")
      .should("have.attr", "href")
      .and("include", "https://github.com/lob/lob-ruby");
    cy.get('div[id="tag/SDKs-and-Tools"]')
      .contains("PHP")
      .should("have.attr", "href")
      .and("include", "https://github.com/lob/lob-php");
    cy.get('div[id="tag/SDKs-and-Tools"]')
      .contains("Node.js")
      .should("have.attr", "href")
      .and("include", "https://github.com/lob/lob-node");
    cy.get('div[id="tag/SDKs-and-Tools"]')
      .contains("Python")
      .should("have.attr", "href")
      .and("include", "https://github.com/lob/lob-python");
    cy.get('div[id="tag/SDKs-and-Tools"]')
      .contains("Java")
      .should("have.attr", "href")
      .and("include", "https://github.com/lob/lob-java");
    cy.get('div[id="tag/SDKs-and-Tools"]')
      .contains("Elixir")
      .should("have.attr", "href")
      .and("include", "https://github.com/lob/lob-elixir");
  });

  it("contains the right intro text", () => {
    cy.contains(
      "Lob’s Print & Mail and Address Verification APIs help companies transform outdated, manual print-and-mail processes; save 1,000s of hours in processing time by sending mail much more quickly; and increase ROI on offline communications."
    );
  });
});
