const { defineConfig } = require("cypress")

module.exports = defineConfig({
  e2e: {
    baseUrl: "http://localhost:3000",
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
      // Environment-based configuration
      if (config.env.API_MODE === 'mock') {
        // For frontend-only tests with mocked data
        config.baseUrl = "http://localhost:3000"
        config.env.SKIP_AUTH = true
      } else if (config.env.API_MODE === 'local') {
        // For full-stack local testing
        config.baseUrl = "http://localhost:3000"
        config.env.SKIP_AUTH = false
      } else if (config.env.API_MODE === 'integration') {
        // For CI/CD integration testing
        config.baseUrl = process.env.FRONTEND_URL || "http://localhost:3000"
        config.env.API_BASE_URL = process.env.API_BASE_URL || "http://localhost:8000"
      }
      
      return config;
    },
    
    supportFile: "cypress/support/e2e.js",
    specPattern: "cypress/e2e/**/*.cy.js",
    
    // Organize tests by type
    excludeSpecPattern: [
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