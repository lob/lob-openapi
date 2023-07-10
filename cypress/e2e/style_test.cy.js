describe("ensures CSS styling is valid", () => {
  beforeEach(() => {
    cy.visit("https://lob.github.io/lob-openapi/");
  });

  it("uses the right font for the feedback button", () => {
    // makes sure the lob.com link goes to the right page
    cy.get('a[id="lob-link"]').should(
      "have.css",
      "font-family",
      "Larsseit, sans-serif"
    );
  });
});
