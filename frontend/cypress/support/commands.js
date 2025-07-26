Cypress.Commands.add('hideWebpackOverlay', () => {
  // Wait a short period for the overlay to potentially appear
  cy.wait(500); // Give it some time to render

  // Check if the overlay iframe exists and remove it
  cy.get('body', { log: false }).then($body => {
    const $iframe = $body.find('iframe#webpack-dev-server-client-overlay');
    if ($iframe.length) {
      cy.wrap($iframe, { log: false }).invoke('remove');
      Cypress.log({
        name: 'hideWebpackOverlay',
        message: 'Webpack dev server overlay removed.',
      });
    } else {
      Cypress.log({
        name: 'hideWebpackOverlay',
        message: 'Webpack dev server overlay not found (no action taken).',
      });
    }
  });
});
