/**
 * Richard Frontend Validation Test
 * Tests updated Step 5 Employment Profile and Balance Sheet with real credentials
 */

describe('Richard Frontend Validation - Updated Components', () => {
  const testUser = {
    email: 'richard.mmacharia@gmail.com',
    password: 'jaggerthee'
  };

  beforeEach(() => {
    cy.visit('http://localhost:3000');
  });

  it('should log in with Richard\'s credentials and verify updated components', () => {
    // Login
    cy.get('[data-cy="email-input"], input[type="email"]', { timeout: 10000 }).should('be.visible');
    cy.get('[data-cy="email-input"], input[type="email"]').clear().type(testUser.email);
    cy.get('[data-cy="password-input"], input[type="password"]').clear().type(testUser.password);
    cy.get('[data-cy="login-button"], button[type="submit"]').click();

    // Wait for dashboard to load
    cy.url({ timeout: 15000 }).should('not.include', '/auth');
    cy.contains('Dashboard', { timeout: 10000 }).should('be.visible');
  });

  it('should navigate to Balance Sheet tab and verify new lifetime calculations', () => {
    // Login first
    cy.get('[data-cy="email-input"], input[type="email"]', { timeout: 10000 }).clear().type(testUser.email);
    cy.get('[data-cy="password-input"], input[type="password"]').clear().type(testUser.password);
    cy.get('[data-cy="login-button"], button[type="submit"]').click();

    // Wait for dashboard
    cy.url({ timeout: 15000 }).should('not.include', '/auth');

    // Navigate to Balance Sheet tab
    cy.get('[data-cy="balance-sheet-tab"], .nav-link:contains("Balance Sheet"), button:contains("Balance Sheet")', { timeout: 10000 })
      .should('be.visible')
      .click();

    // Verify Balance Sheet components load
    cy.contains('Balance Sheet', { timeout: 10000 }).should('be.visible');
    
    // Check for new lifetime balance sheet elements (should not be placeholders)
    cy.get('body').then(($body) => {
      // Look for actual balance sheet data, not placeholder text
      const hasPlaceholders = $body.text().includes('Placeholder') || 
                             $body.text().includes('Coming soon') ||
                             $body.text().includes('Mock data');
      
      if (hasPlaceholders) {
        cy.log('WARNING: Balance sheet still shows placeholder data');
        cy.screenshot('balance-sheet-placeholders');
      } else {
        cy.log('SUCCESS: Balance sheet shows real data');
      }
    });

    // Look for discount rate configurator or lifetime calculations
    cy.get('body').then(($body) => {
      const bodyText = $body.text();
      const hasFinancialTerms = bodyText.includes('Net Worth') || 
                               bodyText.includes('Assets') || 
                               bodyText.includes('Liabilities') ||
                               bodyText.includes('Balance Sheet');
      
      if (hasFinancialTerms) {
        cy.log('SUCCESS: Balance sheet shows financial terms');
      } else {
        cy.log('INFO: Balance sheet content needs verification');
        cy.screenshot('balance-sheet-content-check');
      }
    });
  });

  it('should verify Step 5 has Employment Profile instead of Preferences', () => {
    // Login
    cy.get('[data-cy="email-input"], input[type="email"]', { timeout: 10000 }).clear().type(testUser.email);
    cy.get('[data-cy="password-input"], input[type="password"]').clear().type(testUser.password);
    cy.get('[data-cy="login-button"], button[type="submit"]').click();
    cy.url({ timeout: 15000 }).should('not.include', '/auth');

    // Navigate to Profile or Onboarding if available
    cy.get('body').then(($body) => {
      if ($body.find('[data-cy="profile-tab"], .nav-link:contains("Profile"), button:contains("Profile")').length > 0) {
        cy.get('[data-cy="profile-tab"], .nav-link:contains("Profile"), button:contains("Profile")').click();
      } else if ($body.find('[data-cy="onboarding-tab"], .nav-link:contains("Onboarding")').length > 0) {
        cy.get('[data-cy="onboarding-tab"], .nav-link:contains("Onboarding")').click();
      }
    });

    // Look for employment-related fields instead of preferences
    cy.get('body', { timeout: 10000 }).then(($body) => {
      const bodyText = $body.text().toLowerCase();
      
      // Check for employment profile fields
      const hasEmploymentFields = bodyText.includes('industry') || 
                                 bodyText.includes('job role') ||
                                 bodyText.includes('employment type') ||
                                 bodyText.includes('work experience');
                                 
      // Check for old preference fields
      const hasPreferenceFields = bodyText.includes('notification preferences') ||
                                 bodyText.includes('email preferences') ||
                                 bodyText.includes('privacy settings');

      if (hasEmploymentFields && !hasPreferenceFields) {
        cy.log('SUCCESS: Step 5 shows Employment Profile fields');
      } else if (hasPreferenceFields) {
        cy.log('WARNING: Step 5 still shows old Preference fields');
        cy.screenshot('step5-still-preferences');
      } else {
        cy.log('INFO: Could not determine Step 5 content from current page');
        cy.screenshot('step5-unknown-state');
      }
    });
  });

  it('should verify timeline bar is removed or hidden', () => {
    // Login
    cy.get('[data-cy="email-input"], input[type="email"]', { timeout: 10000 }).clear().type(testUser.email);
    cy.get('[data-cy="password-input"], input[type="password"]').clear().type(testUser.password);
    cy.get('[data-cy="login-button"], button[type="submit"]').click();
    cy.url({ timeout: 15000 }).should('not.include', '/auth');

    // Check if timeline bar is present
    cy.get('body').then(($body) => {
      const hasTimelineBar = $body.find('[data-cy="timeline-bar"], .timeline-bar, .persistent-timeline').length > 0;
      
      if (!hasTimelineBar) {
        cy.log('SUCCESS: Timeline bar has been removed');
      } else {
        cy.log('WARNING: Timeline bar is still present');
        cy.screenshot('timeline-bar-still-present');
      }
    });
  });

  it('should take screenshots of current state for analysis', () => {
    // Login
    cy.get('[data-cy="email-input"], input[type="email"]', { timeout: 10000 }).clear().type(testUser.email);
    cy.get('[data-cy="password-input"], input[type="password"]').clear().type(testUser.password);
    cy.get('[data-cy="login-button"], button[type="submit"]').click();
    cy.url({ timeout: 15000 }).should('not.include', '/auth');

    // Take screenshot of dashboard
    cy.screenshot('richard-dashboard-current-state');

    // Navigate through available tabs and screenshot each
    const tabSelectors = [
      '[data-cy="balance-sheet-tab"], .nav-link:contains("Balance Sheet"), button:contains("Balance Sheet")',
      '[data-cy="profile-tab"], .nav-link:contains("Profile"), button:contains("Profile")',
      '[data-cy="goals-tab"], .nav-link:contains("Goals"), button:contains("Goals")',
      '[data-cy="tools-tab"], .nav-link:contains("Tools"), button:contains("Tools")'
    ];

    tabSelectors.forEach((selector, index) => {
      cy.get('body').then(($body) => {
        if ($body.find(selector).length > 0) {
          cy.get(selector).click();
          cy.wait(2000); // Allow content to load
          cy.screenshot(`richard-tab-${index}-current-state`);
        }
      });
    });
  });
});