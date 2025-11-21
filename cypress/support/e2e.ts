// Cypress E2E Support File
// This file is processed and loaded automatically before your test files

// Import commands
import './commands';

// Disable uncaught exception handling for development
Cypress.on('uncaught:exception', (err, runnable) => {
  // Return false to prevent Cypress from failing the test
  return false;
});

// Global test configuration
beforeEach(() => {
  // Clear localStorage before each test
  cy.clearLocalStorage();
  
  // Set viewport to mobile
  cy.viewport(375, 812);
});

afterEach(() => {
  // Log test completion
  cy.log('Test completed');
});
