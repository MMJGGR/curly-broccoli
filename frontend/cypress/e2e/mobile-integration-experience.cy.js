/**
 * Mobile Integration Experience Test
 * Validates complete mobile experience across all integrated systems
 */

describe('Mobile Integration Experience', () => {
  const mobileViewports = [
    { name: 'iPhone SE', width: 375, height: 667 },
    { name: 'iPhone 12', width: 390, height: 844 },
    { name: 'Samsung Galaxy S21', width: 360, height: 800 },
    { name: 'iPad Mini', width: 768, height: 1024 }
  ];

  beforeEach(() => {
    // Setup test data and login
    cy.exec('cd api && python -c "from tests.mobile_test_data import setup; setup()"');
    cy.login('mobile.test@example.com', 'password123');
  });

  describe('Mobile Navigation and Core Functionality', () => {
    mobileViewports.forEach(viewport => {
      it(`validates core mobile experience on ${viewport.name}`, () => {
        cy.viewport(viewport.width, viewport.height);

        // Test 1: Mobile Landing and Navigation
        cy.visit('/timeline');
        
        // Verify mobile-optimized timeline dashboard
        cy.get('[data-cy="mobile-timeline-dashboard"]').should('be.visible');
        cy.get('[data-cy="mobile-nav-bar"]').should('be.visible');
        cy.get('[data-cy="mobile-phase-indicator"]').should('be.visible');

        // Test mobile navigation
        cy.get('[data-cy="mobile-nav-budget"]').click();
        cy.url().should('include', '/budget');
        cy.get('[data-cy="mobile-budget-overview"]').should('be.visible');

        // Test 2: Mobile Transaction Management
        cy.get('[data-cy="mobile-nav-transactions"]').click();
        cy.url().should('include', '/transactions');
        
        // Verify mobile transaction interface
        cy.get('[data-cy="mobile-transaction-list"]').should('be.visible');
        cy.get('[data-cy="mobile-add-transaction-fab"]').should('be.visible');

        // Test adding transaction on mobile
        cy.get('[data-cy="mobile-add-transaction-fab"]').click();
        cy.get('[data-cy="mobile-transaction-form"]').should('be.visible');
        
        cy.get('[data-cy="transaction-description"]').type('Mobile Test Transaction');
        cy.get('[data-cy="transaction-amount"]').type('-5000');
        cy.get('[data-cy="transaction-category"]').select('Food');
        cy.get('[data-cy="save-transaction"]').click();

        // Verify transaction appears in mobile list
        cy.get('[data-cy="mobile-transaction-item"]').should('contain', 'Mobile Test Transaction');

        // Test 3: Mobile Budget Interface
        cy.get('[data-cy="mobile-nav-budget"]').click();
        
        // Test mobile budget cards
        cy.get('[data-cy="mobile-budget-cards"]').should('be.visible');
        cy.get('[data-cy="mobile-surplus-indicator"]').should('be.visible');

        // Test swipe gestures on budget cards
        if (viewport.width < 768) { // Phone only
          cy.get('[data-cy="budget-card"]').first().swipe('left');
          cy.get('[data-cy="budget-actions"]').should('be.visible');
        }

        // Test mobile budget editing
        cy.get('[data-cy="mobile-edit-budget"]').click();
        cy.get('[data-cy="mobile-budget-slider"]').should('be.visible');

        // Test 4: Mobile Analytics Experience
        cy.get('[data-cy="mobile-nav-analytics"]').click();
        cy.url().should('include', '/analytics');
        
        // Verify mobile-optimized analytics
        cy.get('[data-cy="mobile-analytics-cards"]').should('be.visible');
        cy.get('[data-cy="mobile-goal-progress"]').should('be.visible');

        // Test mobile goal analytics
        cy.get('[data-cy="mobile-goal-card"]').first().click();
        cy.get('[data-cy="mobile-goal-details"]').should('be.visible');
        cy.get('[data-cy="mobile-success-probability"]').should('be.visible');

        // Test 5: Mobile Timeline Integration
        cy.get('[data-cy="mobile-nav-timeline"]').click();
        
        // Verify mobile timeline status indicators
        cy.get('[data-cy="mobile-timeline-status"]').should('be.visible');
        cy.get('[data-cy="mobile-alignment-score"]').should('be.visible');
        cy.get('[data-cy="mobile-quick-actions"]').should('be.visible');

        // Test mobile contextual guidance
        cy.get('[data-cy="mobile-guidance-widget"]').should('be.visible');
        cy.get('[data-cy="mobile-recommendations"]').should('exist');

        // Test 6: Mobile Profile Management
        cy.get('[data-cy="mobile-menu-toggle"]').click();
        cy.get('[data-cy="mobile-menu"]').should('be.visible');
        cy.get('[data-cy="mobile-profile-link"]').click();
        
        cy.get('[data-cy="mobile-profile-cards"]').should('be.visible');
        cy.get('[data-cy="mobile-edit-profile"]').should('be.visible');
      });
    });
  });

  describe('Mobile Touch Interactions and Gestures', () => {
    beforeEach(() => {
      cy.viewport('iphone-x');
    });

    it('validates mobile touch interactions across all features', () => {
      cy.visit('/timeline');

      // Test 1: Touch Navigation
      cy.get('[data-cy="mobile-nav-bar"]').should('be.visible');
      
      // Test tap interactions
      cy.get('[data-cy="mobile-nav-budget"]').tap();
      cy.url().should('include', '/budget');

      // Test 2: Swipe Gestures on Budget Cards
      cy.get('[data-cy="budget-card"]').should('have.length.greaterThan', 0);
      
      // Test left swipe for actions
      cy.get('[data-cy="budget-card"]').first().swipe('left');
      cy.get('[data-cy="card-actions"]').should('be.visible');
      
      // Test right swipe to dismiss actions
      cy.get('[data-cy="budget-card"]').first().swipe('right');
      cy.get('[data-cy="card-actions"]').should('not.be.visible');

      // Test 3: Pull-to-Refresh on Transaction List
      cy.visit('/transactions');
      cy.get('[data-cy="mobile-transaction-list"]').pullToRefresh();
      cy.get('[data-cy="refresh-indicator"]').should('be.visible');
      cy.get('[data-cy="transaction-updated"]').should('be.visible');

      // Test 4: Long Press Interactions
      cy.get('[data-cy="transaction-item"]').first().longPress();
      cy.get('[data-cy="context-menu"]').should('be.visible');
      cy.get('[data-cy="edit-transaction"]').should('be.visible');
      cy.get('[data-cy="delete-transaction"]').should('be.visible');

      // Test 5: Pinch to Zoom on Analytics Charts
      cy.visit('/analytics');
      cy.get('[data-cy="analytics-chart"]').first().pinchZoom(1.5);
      cy.get('[data-cy="chart-zoomed"]').should('have.attr', 'data-zoom', 'true');

      // Test 6: Drag and Drop Budget Allocation
      cy.visit('/budget');
      cy.get('[data-cy="budget-allocator"]').should('be.visible');
      
      // Test dragging budget slider
      cy.get('[data-cy="housing-slider"]')
        .trigger('touchstart', { which: 1 })
        .trigger('touchmove', { clientX: 200 })
        .trigger('touchend');
      
      cy.get('[data-cy="housing-amount"]').should('not.contain', '0');
    });

    it('validates mobile keyboard and input handling', () => {
      cy.visit('/transactions');

      // Test mobile form inputs
      cy.get('[data-cy="mobile-add-transaction-fab"]').click();
      
      // Test numeric keyboard for amounts
      cy.get('[data-cy="transaction-amount"]').click();
      cy.get('[data-cy="transaction-amount"]').should('have.attr', 'inputmode', 'decimal');
      
      // Test description input with autocomplete
      cy.get('[data-cy="transaction-description"]').type('Groc');
      cy.get('[data-cy="autocomplete-suggestions"]').should('be.visible');
      cy.get('[data-cy="suggestion-grocery"]').click();
      cy.get('[data-cy="transaction-description"]').should('have.value', 'Grocery');

      // Test category selection with mobile picker
      cy.get('[data-cy="transaction-category"]').click();
      cy.get('[data-cy="mobile-category-picker"]').should('be.visible');
      cy.get('[data-cy="category-food"]').click();
      cy.get('[data-cy="transaction-category"]').should('contain', 'Food');

      // Test date picker on mobile
      cy.get('[data-cy="transaction-date"]').click();
      cy.get('[data-cy="mobile-date-picker"]').should('be.visible');
      cy.get('[data-cy="date-today"]').click();

      // Save and verify
      cy.get('[data-cy="save-transaction"]').click();
      cy.get('[data-cy="transaction-saved"]').should('be.visible');
    });
  });

  describe('Mobile Offline and Performance', () => {
    beforeEach(() => {
      cy.viewport('iphone-x');
    });

    it('validates mobile offline functionality', () => {
      cy.visit('/timeline');
      
      // Verify online state
      cy.get('[data-cy="connection-status"]').should('contain', 'Online');

      // Simulate offline
      cy.window().then(win => {
        win.navigator.onLine = false;
        win.dispatchEvent(new Event('offline'));
      });

      // Verify offline indicator
      cy.get('[data-cy="offline-banner"]').should('be.visible');
      cy.get('[data-cy="offline-mode-active"]').should('be.visible');

      // Test offline functionality
      cy.visit('/transactions');
      cy.get('[data-cy="cached-transactions"]').should('be.visible');
      cy.get('[data-cy="offline-notice"]').should('contain', 'Showing cached data');

      // Test adding transaction offline
      cy.get('[data-cy="mobile-add-transaction-fab"]').click();
      cy.get('[data-cy="transaction-description"]').type('Offline Transaction');
      cy.get('[data-cy="transaction-amount"]').type('-1000');
      cy.get('[data-cy="save-transaction"]').click();

      // Verify queued for sync
      cy.get('[data-cy="sync-queue"]').should('contain', '1 pending');

      // Simulate back online
      cy.window().then(win => {
        win.navigator.onLine = true;
        win.dispatchEvent(new Event('online'));
      });

      // Verify sync
      cy.get('[data-cy="syncing-data"]').should('be.visible');
      cy.get('[data-cy="sync-complete"]', { timeout: 10000 }).should('be.visible');
      cy.get('[data-cy="sync-queue"]').should('contain', '0 pending');
    });

    it('validates mobile performance with large datasets', () => {
      // Create large dataset for testing
      cy.exec('cd api && python -c "from tests.create_large_mobile_dataset import create; create()"');

      cy.visit('/transactions');
      
      // Test virtual scrolling performance
      cy.get('[data-cy="virtual-list"]').should('be.visible');
      
      // Measure scroll performance
      cy.window().then(win => {
        win.performance.mark('scroll-start');
      });

      // Scroll through large list
      cy.get('[data-cy="mobile-transaction-list"]').scrollTo('bottom', { duration: 2000 });
      
      cy.window().then(win => {
        win.performance.mark('scroll-end');
        win.performance.measure('scroll-duration', 'scroll-start', 'scroll-end');
        
        const measure = win.performance.getEntriesByName('scroll-duration')[0];
        expect(measure.duration).to.be.lessThan(3000); // Should complete in under 3 seconds
      });

      // Test search performance
      cy.get('[data-cy="search-input"]').type('salary');
      
      // Verify search results appear quickly
      cy.get('[data-cy="search-results"]', { timeout: 1000 }).should('be.visible');
      cy.get('[data-cy="search-results"]').should('have.length.greaterThan', 0);

      // Test analytics loading with large dataset
      cy.visit('/analytics');
      
      // Verify progressive loading
      cy.get('[data-cy="analytics-skeleton"]').should('be.visible');
      cy.get('[data-cy="analytics-loaded"]', { timeout: 15000 }).should('be.visible');
      
      // Verify charts render properly
      cy.get('[data-cy="mobile-chart"]').should('be.visible');
      cy.get('[data-cy="chart-data-points"]').should('have.length.greaterThan', 0);
    });
  });

  describe('Mobile Accessibility and Usability', () => {
    beforeEach(() => {
      cy.viewport('iphone-x');
    });

    it('validates mobile accessibility features', () => {
      cy.visit('/timeline');

      // Test screen reader compatibility
      cy.get('[data-cy="main-content"]').should('have.attr', 'role', 'main');
      cy.get('[data-cy="mobile-nav"]').should('have.attr', 'role', 'navigation');

      // Test touch target sizes
      cy.get('[data-cy="mobile-nav-button"]').then($buttons => {
        $buttons.each((index, button) => {
          const rect = button.getBoundingClientRect();
          expect(rect.width).to.be.at.least(44); // iOS minimum
          expect(rect.height).to.be.at.least(44);
        });
      });

      // Test keyboard navigation on mobile
      cy.get('[data-cy="mobile-nav-budget"]').focus();
      cy.focused().should('have.attr', 'data-cy', 'mobile-nav-budget');
      
      cy.focused().type('{rightarrow}');
      cy.focused().should('have.attr', 'data-cy', 'mobile-nav-transactions');

      // Test high contrast mode
      cy.get('[data-cy="accessibility-menu"]').click();
      cy.get('[data-cy="high-contrast-toggle"]').click();
      
      cy.get('body').should('have.class', 'high-contrast');
      cy.get('[data-cy="mobile-budget-card"]').should('have.css', 'border-width', '2px');

      // Test font scaling
      cy.get('[data-cy="text-size-large"]').click();
      cy.get('body').should('have.class', 'text-large');
      cy.get('[data-cy="mobile-text"]').should('have.css', 'font-size').and('match', /^(1\.[2-9]|[2-9])/); // At least 1.2em
    });

    it('validates mobile form usability and validation', () => {
      cy.visit('/budget');

      // Test form validation on mobile
      cy.get('[data-cy="mobile-edit-budget"]').click();
      
      // Test required field validation
      cy.get('[data-cy="housing-budget"]').clear();
      cy.get('[data-cy="save-budget"]').click();
      
      cy.get('[data-cy="validation-error"]').should('be.visible');
      cy.get('[data-cy="housing-budget"]').should('have.class', 'error');

      // Test numeric validation
      cy.get('[data-cy="housing-budget"]').type('invalid');
      cy.get('[data-cy="housing-budget"]').should('have.attr', 'aria-invalid', 'true');

      // Test mobile-friendly error messages
      cy.get('[data-cy="error-message"]').should('be.visible');
      cy.get('[data-cy="error-message"]').should('have.class', 'mobile-friendly');

      // Test successful form submission
      cy.get('[data-cy="housing-budget"]').clear().type('50000');
      cy.get('[data-cy="save-budget"]').click();
      
      cy.get('[data-cy="success-toast"]').should('be.visible');
      cy.get('[data-cy="budget-updated"]').should('be.visible');
    });
  });

  describe('Mobile Cross-Feature Integration', () => {
    beforeEach(() => {
      cy.viewport('iphone-x');
    });

    it('validates seamless mobile workflow across all features', () => {
      // Complete mobile workflow: View status -> Add transaction -> Check impact -> Adjust budget
      
      // Step 1: Check current status
      cy.visit('/timeline');
      cy.get('[data-cy="mobile-alignment-score"]').then($score => {
        const initialScore = parseInt($score.text());
        cy.wrap(initialScore).as('initialScore');
      });

      cy.get('[data-cy="mobile-surplus-amount"]').then($surplus => {
        const initialSurplus = parseFloat($surplus.text().replace(/[^\d.-]/g, ''));
        cy.wrap(initialSurplus).as('initialSurplus');
      });

      // Step 2: Add expense transaction
      cy.get('[data-cy="mobile-quick-add-transaction"]').click();
      cy.get('[data-cy="transaction-description"]').type('Emergency Car Repair');
      cy.get('[data-cy="transaction-amount"]').type('-25000');
      cy.get('[data-cy="transaction-category"]').select('Transportation');
      cy.get('[data-cy="save-transaction"]').click();

      // Step 3: Verify immediate impact across systems
      // Check timeline impact
      cy.get('[data-cy="mobile-alignment-score"]').then($newScore => {
        cy.get('@initialScore').then(initialScore => {
          const newScore = parseInt($newScore.text());
          expect(newScore).to.be.lessThan(initialScore); // Should decrease
        });
      });

      // Check budget impact
      cy.get('[data-cy="mobile-nav-budget"]').click();
      cy.get('[data-cy="transportation-overspent"]').should('be.visible');
      cy.get('[data-cy="monthly-surplus-decreased"]').should('be.visible');

      // Step 4: Check analytics update
      cy.get('[data-cy="mobile-nav-analytics"]').click();
      cy.wait(2000); // Allow analytics to recalculate
      
      cy.get('[data-cy="budget-impact-alert"]').should('be.visible');
      cy.get('[data-cy="goal-timeline-affected"]').should('be.visible');

      // Step 5: Adjust budget to compensate
      cy.get('[data-cy="mobile-nav-budget"]').click();
      cy.get('[data-cy="optimize-budget"]').click();
      
      // AI-suggested adjustments
      cy.get('[data-cy="suggested-adjustments"]').should('be.visible');
      cy.get('[data-cy="reduce-entertainment"]').click(); // Reduce entertainment budget
      cy.get('[data-cy="apply-suggestions"]').click();

      // Step 6: Verify optimization improved situation
      cy.get('[data-cy="mobile-nav-timeline"]').click();
      cy.get('[data-cy="budget-optimized"]').should('be.visible');
      cy.get('[data-cy="mobile-alignment-score"]').then($optimizedScore => {
        cy.get('@initialScore').then(initialScore => {
          const optimizedScore = parseInt($optimizedScore.text());
          // Should be closer to initial score after optimization
          expect(Math.abs(optimizedScore - initialScore)).to.be.lessThan(10);
        });
      });
    });

    it('validates mobile notification and alert system', () => {
      cy.visit('/timeline');

      // Test budget alert notifications
      cy.window().then(win => {
        // Mock push notification permission
        win.Notification = {
          permission: 'granted',
          requestPermission: cy.stub().resolves('granted')
        };
      });

      // Trigger budget alert condition
      cy.visit('/transactions');
      cy.get('[data-cy="mobile-add-transaction-fab"]').click();
      cy.get('[data-cy="transaction-description"]').type('Large Unexpected Expense');
      cy.get('[data-cy="transaction-amount"]').type('-100000');
      cy.get('[data-cy="transaction-category"]').select('Other');
      cy.get('[data-cy="save-transaction"]').click();

      // Verify mobile alert appears
      cy.get('[data-cy="mobile-alert-banner"]').should('be.visible');
      cy.get('[data-cy="budget-exceeded-alert"]').should('contain', 'Budget Alert');

      // Test goal progress notification
      cy.visit('/accounts');
      cy.get('[data-cy="investment-account"]').click();
      cy.get('[data-cy="add-balance"]').click();
      cy.get('[data-cy="balance-increase"]').type('50000');
      cy.get('[data-cy="reason"]').select('Investment Growth');
      cy.get('[data-cy="save-balance"]').click();

      // Verify goal progress notification
      cy.get('[data-cy="goal-progress-notification"]').should('be.visible');
      cy.get('[data-cy="milestone-closer"]').should('be.visible');

      // Test notification interaction
      cy.get('[data-cy="goal-progress-notification"]').click();
      cy.url().should('include', '/analytics');
      cy.get('[data-cy="updated-goal-progress"]').should('be.visible');
    });
  });
});

// Custom commands for mobile testing
Cypress.Commands.add('tap', { prevSubject: 'element' }, (subject) => {
  cy.wrap(subject).click();
});

Cypress.Commands.add('swipe', { prevSubject: 'element' }, (subject, direction) => {
  const element = subject[0];
  const rect = element.getBoundingClientRect();
  const startX = rect.left + rect.width / 2;
  const startY = rect.top + rect.height / 2;
  
  let endX = startX;
  let endY = startY;
  
  switch (direction) {
    case 'left':
      endX = startX - rect.width / 2;
      break;
    case 'right':
      endX = startX + rect.width / 2;
      break;
    case 'up':
      endY = startY - rect.height / 2;
      break;
    case 'down':
      endY = startY + rect.height / 2;
      break;
  }

  cy.wrap(subject)
    .trigger('touchstart', { touches: [{ clientX: startX, clientY: startY }] })
    .trigger('touchmove', { touches: [{ clientX: endX, clientY: endY }] })
    .trigger('touchend', { touches: [] });
});

Cypress.Commands.add('longPress', { prevSubject: 'element' }, (subject) => {
  cy.wrap(subject)
    .trigger('touchstart')
    .wait(1000) // Long press duration
    .trigger('touchend');
});

Cypress.Commands.add('pullToRefresh', { prevSubject: 'element' }, (subject) => {
  cy.wrap(subject)
    .trigger('touchstart', { touches: [{ clientX: 200, clientY: 100 }] })
    .trigger('touchmove', { touches: [{ clientX: 200, clientY: 300 }] })
    .wait(500)
    .trigger('touchend', { touches: [] });
});

Cypress.Commands.add('pinchZoom', { prevSubject: 'element' }, (subject, scale) => {
  const element = subject[0];
  const rect = element.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  
  const initialDistance = 100;
  const finalDistance = initialDistance * scale;
  
  cy.wrap(subject)
    .trigger('touchstart', {
      touches: [
        { clientX: centerX - initialDistance / 2, clientY: centerY },
        { clientX: centerX + initialDistance / 2, clientY: centerY }
      ]
    })
    .trigger('touchmove', {
      touches: [
        { clientX: centerX - finalDistance / 2, clientY: centerY },
        { clientX: centerX + finalDistance / 2, clientY: centerY }
      ]
    })
    .trigger('touchend', { touches: [] });
});