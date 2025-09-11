// Import commands.js using ES2015 syntax:
import './commands'

// Global configuration and utilities
Cypress.on('uncaught:exception', (err, runnable) => {
  // Ignore specific errors that don't affect testing
  if (err.message.includes('ResizeObserver loop limit exceeded')) {
    return false
  }
  if (err.message.includes('Non-Error promise rejection')) {
    return false
  }
  
  // For development mode, ignore API connection errors
  if (Cypress.env('API_MODE') === 'mock' && 
      err.message.includes('Network Error')) {
    return false
  }
  
  // Allow the error to fail the test in other cases
  return true
})

// Global hooks for test setup and teardown
beforeEach(() => {
  // Clear localStorage and sessionStorage
  cy.clearLocalStorage()
  cy.clearCookies()
  
  // Set up API interceptors based on mode
  if (Cypress.env('API_MODE') === 'mock') {
    cy.setupMockAPI()
  }
})

afterEach(() => {
  // Cleanup after each test if configured
  if (Cypress.env('CLEANUP_AFTER_TESTS')) {
    cy.cleanup()
  }
})