const { defineConfig } = require("cypress")

// Prefer explicit env overrides supplied via Docker Compose when present
const computedBaseUrl = process.env.CYPRESS_baseUrl || process.env.FRONTEND_URL || "http://frontend:3000";

module.exports = defineConfig({
  e2e: {
    baseUrl: computedBaseUrl,
    viewportWidth: 1280,
    viewportHeight: 720,
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 10000,
    
    // Environment-specific configurations
    env: {
      // Test modes
      API_MODE: "mock", // "mock" | "local" | "integration"
      
      // Test user credentials (for integration tests)
      TEST_USER_EMAIL: "richard.macharia@testuser.com",
      TEST_USER_PASSWORD: "TestPassword123!",
      
      // API endpoints
      API_BASE_URL: "http://localhost:8000",
      
      // Test configuration
      SKIP_AUTH: false,
      USE_FIXTURES: true,
      CLEANUP_AFTER_TESTS: true
    },
    
    setupNodeEvents(on, config) {
      // Highest precedence: explicit env override from process (e.g. compose)
      if (process.env.CYPRESS_baseUrl) {
        config.baseUrl = process.env.CYPRESS_baseUrl;
      }

      // Environment-based configuration
      const mode = config.env.API_MODE || 'mock';
      if (mode === 'mock') {
        // For frontend-only tests with mocked data
        config.baseUrl = config.baseUrl || "http://localhost:3000";
        config.env.SKIP_AUTH = true;
      } else if (mode === 'local') {
        // For full-stack local testing
        config.baseUrl = config.baseUrl || "http://localhost:3000";
        config.env.SKIP_AUTH = false;
      } else if (mode === 'integration') {
        // For CI/CD integration testing / dockerized runs
        const frontendUrl = process.env.FRONTEND_URL || config.baseUrl || "http://localhost:3000";
        const apiBase = process.env.API_BASE_URL || "http://localhost:8000";
        config.baseUrl = frontendUrl;
        config.env.API_BASE_URL = apiBase;
      }

      return config;
    },
    
    supportFile: "cypress/support/e2e.js",
    specPattern: "cypress/e2e-cr006/**/*.cy.js",
    
    // Organize tests by type
    excludeSpecPattern: [
      "cypress/e2e/**/*",
      "**/examples/**/*",
      "**/archived/**/*"
    ]
  },
  
  component: {
    devServer: {
      framework: "create-react-app",
      bundler: "webpack",
    },
  },
})
