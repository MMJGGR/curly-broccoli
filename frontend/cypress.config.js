const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      // Windows Chrome fixes for stability
      on('before:browser:launch', (browser, launchOptions) => {
        if (browser.name === 'chrome') {
          launchOptions.args.push('--disable-gpu');
          launchOptions.args.push('--no-sandbox');
          launchOptions.args.push('--disable-dev-shm-usage');
          launchOptions.args.push('--disable-extensions');
        }
        return launchOptions;
      });
    },
    baseUrl: 'http://localhost:3000',
    supportFile: 'cypress/support/commands.js',
    env: {
      API_BASE_URL: 'http://localhost:8000'
    },
    defaultCommandTimeout: 15000,
    requestTimeout: 15000,
    responseTimeout: 15000,
    pageLoadTimeout: 30000
  },
});