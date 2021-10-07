describe("ensures CSS styling is valid", () => {
  beforeEach(() => {
    cy.visit("https://lob.github.io/lob-openapi/");
  });

  it("uses the right font for the feedback button", () => {
    // makes sure the lob.com link goes to the right page
    cy.get('button[id="feedback"]').should(
      "have.css",
      "font-family",
      "Larsseit, sans-serif"
    );
  });

  // *[class^="sc-hKFxyN dmghQN"]
  // button[id="collapse-button"]
  it("the collapsers are the right colour", () => {
    // makes sure the lob.com link goes to the right page
    cy.get('button[id="collapse-button"]').should(
      "have.css",
      "color",
      "rgb(0, 0, 0)"
    );
  });
});
