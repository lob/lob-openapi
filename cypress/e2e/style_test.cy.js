describe("ensures CSS styling is valid", () => {
  beforeEach(() => {
    cy.visitDocs();
  });

  it("uses the right font for the Lob brand link", () => {
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

describe("ensures Redoc runtime is valid", () => {
  it("hydrates generated docs without runtime errors", () => {
    const uncaughtErrors = [];

    cy.on("uncaught:exception", (error) => {
      uncaughtErrors.push(error.message);
      return false;
    });

    cy.visitDocs({ hydrate: true });

    cy.window().should((win) => {
      expect(win.Redoc?.hydrate?.toString()).not.to.eq("function() {}");
      expect(uncaughtErrors).to.deep.eq([]);
    });
  });
});
