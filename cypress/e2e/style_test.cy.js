describe("ensures CSS styling is valid", () => {
  beforeEach(() => {
    cy.visitDocs();
  });

  it("uses the right font for the Lob brand link", () => {
    // makes sure the lob.com link goes to the right page
    cy.get('a[id="lob-link"]').should(
      "have.css",
      "font-family",
      "Larsseit, sans-serif"
    );
  });

  it("uses the configured light background for request samples", () => {
    cy.contains("h3", "Request samples")
      .parents()
      .then(($parents) => {
        const hasLightPanel = [...$parents].some(
          (element) =>
            getComputedStyle(element).backgroundColor === "rgb(247, 249, 250)"
        );

        expect(hasLightPanel).to.eq(true);
      });
  });
});
