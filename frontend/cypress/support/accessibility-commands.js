/**
 * Accessibility Testing Commands
 * Custom Cypress commands for comprehensive accessibility testing
 */

// Install axe-core for automated accessibility testing
Cypress.Commands.add('injectAxe', () => {
  cy.window({ log: false }).then((window) => {
    if (window.axe) {
      return;
    }
    
    const script = window.document.createElement('script');
    script.src = 'https://unpkg.com/axe-core@4.8.2/axe.min.js';
    script.async = true;
    window.document.head.appendChild(script);
    
    return new Cypress.Promise((resolve) => {
      script.onload = () => {
        resolve();
      };
    });
  });
});

// Check accessibility with custom configuration
Cypress.Commands.add('checkA11y', (context, options, violationCallback) => {
  cy.window({ log: false }).then((window) => {
    if (!window.axe) {
      throw new Error('axe-core not loaded. Call cy.injectAxe() first.');
    }
    
    const defaultOptions = {
      runOnly: {
        type: 'tag',
        values: ['wcag2a', 'wcag2aa', 'wcag21aa']
      },
      rules: {
        'color-contrast': { enabled: true },
        'keyboard': { enabled: true },
        'aria-required-attr': { enabled: true },
        'aria-roles': { enabled: true },
        'aria-valid-attr': { enabled: true },
        'button-name': { enabled: true },
        'form-field-multiple-labels': { enabled: true },
        'input-image-alt': { enabled: true },
        'label': { enabled: true },
        'link-name': { enabled: true },
        'list': { enabled: true },
        'listitem': { enabled: true },
        'image-alt': { enabled: true },
        'focus-order-semantics': { enabled: true },
        'heading-order': { enabled: true },
        'landmark-one-main': { enabled: true },
        'page-has-heading-one': { enabled: true },
        'region': { enabled: true }
      }
    };
    
    const mergedOptions = { ...defaultOptions, ...options };
    
    return window.axe.run(context || window.document, mergedOptions).then((results) => {
      if (results.violations.length > 0) {
        if (violationCallback) {
          violationCallback(results.violations);
        } else {
          // Default violation handling
          results.violations.forEach((violation) => {
            cy.log(`❌ A11y Violation: ${violation.id}`);
            cy.log(`Description: ${violation.description}`);
            cy.log(`Impact: ${violation.impact}`);
            cy.log(`Help URL: ${violation.helpUrl}`);
            
            violation.nodes.forEach((node, index) => {
              cy.log(`Element ${index + 1}: ${node.target.join(' ')}`);
              if (node.failureSummary) {
                cy.log(`Failure: ${node.failureSummary}`);
              }
            });
          });
          
          throw new Error(`${results.violations.length} accessibility violations found`);
        }
      } else {
        cy.log('✅ No accessibility violations found');
      }
      
      return results;
    });
  });
});

// Test keyboard navigation
Cypress.Commands.add('tab', { prevSubject: 'optional' }, (subject) => {
  if (subject) {
    cy.wrap(subject).trigger('keydown', { key: 'Tab', keyCode: 9 });
  } else {
    cy.get('body').trigger('keydown', { key: 'Tab', keyCode: 9 });
  }
  return cy.focused();
});

Cypress.Commands.add('shiftTab', { prevSubject: 'optional' }, (subject) => {
  if (subject) {
    cy.wrap(subject).trigger('keydown', { key: 'Tab', keyCode: 9, shiftKey: true });
  } else {
    cy.get('body').trigger('keydown', { key: 'Tab', keyCode: 9, shiftKey: true });
  }
  return cy.focused();
});

// Test for focus trap in modals
Cypress.Commands.add('testFocusTrap', (modalSelector = '[role="dialog"]') => {
  cy.get(modalSelector).should('exist').within(() => {
    // Get all focusable elements
    const focusableSelector = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    
    cy.get(focusableSelector).then(($focusableElements) => {
      if ($focusableElements.length === 0) {
        cy.log('⚠️  No focusable elements found in modal');
        return;
      }
      
      const firstElement = $focusableElements.first();
      const lastElement = $focusableElements.last();
      
      // Focus first element
      cy.wrap(firstElement).focus();
      cy.focused().should('be', firstElement);
      
      // Tab through all elements
      for (let i = 0; i < $focusableElements.length - 1; i++) {
        cy.tab();
      }
      
      // Should be on last element
      cy.focused().should('be', lastElement);
      
      // Tab once more should cycle back to first
      cy.tab();
      cy.focused().should('be', firstElement);
      
      // Shift+Tab should go to last
      cy.shiftTab();
      cy.focused().should('be', lastElement);
    });
  });
});

// Test heading hierarchy
Cypress.Commands.add('testHeadingHierarchy', () => {
  cy.get('h1, h2, h3, h4, h5, h6').then(($headings) => {
    const headings = Array.from($headings).map((heading) => ({
      level: parseInt(heading.tagName.charAt(1)),
      text: heading.textContent.trim(),
      element: heading
    }));
    
    if (headings.length === 0) {
      cy.log('⚠️  No headings found on page');
      return;
    }
    
    // Should start with h1
    expect(headings[0].level).to.equal(1, 'Page should start with h1');
    
    // Check for logical progression
    for (let i = 1; i < headings.length; i++) {
      const currentLevel = headings[i].level;
      const previousLevel = headings[i - 1].level;
      const levelDiff = currentLevel - previousLevel;
      
      // Should not skip levels (can jump down multiple levels but not up)
      if (levelDiff > 1) {
        cy.log(`⚠️  Heading level skip: h${previousLevel} to h${currentLevel}`);
        cy.log(`Text: "${headings[i - 1].text}" to "${headings[i].text}"`);
      }
    }
    
    cy.log(`✅ Heading hierarchy checked: ${headings.length} headings`);
  });
});

// Test color contrast manually for specific elements
Cypress.Commands.add('testColorContrast', (selector, options = {}) => {
  cy.get(selector).each(($element) => {
    cy.wrap($element).then(($el) => {
      const element = $el[0];
      const styles = window.getComputedStyle(element);
      
      const backgroundColor = styles.backgroundColor;
      const color = styles.color;
      
      // Only test if we have both colors
      if (backgroundColor !== 'rgba(0, 0, 0, 0)' && color !== 'rgba(0, 0, 0, 0)') {
        // This is a simplified check - in production, use a proper contrast library
        const bgLuminance = getRelativeLuminance(backgroundColor);
        const textLuminance = getRelativeLuminance(color);
        
        const contrastRatio = (Math.max(bgLuminance, textLuminance) + 0.05) / 
                             (Math.min(bgLuminance, textLuminance) + 0.05);
        
        const minRatio = options.large ? 3 : 4.5; // WCAG AA requirements
        
        if (contrastRatio < minRatio) {
          cy.log(`⚠️  Poor contrast ratio: ${contrastRatio.toFixed(2)} (min: ${minRatio})`);
          cy.log(`Element: ${selector}`);
          cy.log(`Colors: ${color} on ${backgroundColor}`);
        } else {
          cy.log(`✅ Good contrast ratio: ${contrastRatio.toFixed(2)}`);
        }
      }
    });
  });
});

// Test for proper ARIA labels
Cypress.Commands.add('testAriaLabels', () => {
  // Interactive elements that need labels
  const interactiveSelectors = [
    'button:not([aria-label]):not([aria-labelledby])',
    'input:not([aria-label]):not([aria-labelledby]):not([type="hidden"])',
    'select:not([aria-label]):not([aria-labelledby])',
    'textarea:not([aria-label]):not([aria-labelledby])',
    'a[href]:not([aria-label]):not([aria-labelledby])'
  ];
  
  interactiveSelectors.forEach((selector) => {
    cy.get(selector).each(($element) => {
      const tagName = $element.prop('tagName').toLowerCase();
      const type = $element.attr('type') || tagName;
      
      // Check for associated label
      const id = $element.attr('id');
      let hasLabel = false;
      
      if (id) {
        cy.get(`label[for="${id}"]`).then(($labels) => {
          hasLabel = $labels.length > 0;
        });
      }
      
      // Check for parent label
      if (!hasLabel) {
        hasLabel = $element.closest('label').length > 0;
      }
      
      // Check for title attribute
      if (!hasLabel) {
        hasLabel = $element.attr('title') && $element.attr('title').trim().length > 0;
      }
      
      if (!hasLabel) {
        cy.log(`⚠️  Element missing label: ${type} element`);
        cy.log(`Element text: "${$element.text().trim()}"`);
      }
    });
  });
});

// Helper function for luminance calculation (simplified)
function getRelativeLuminance(color) {
  // This is a simplified version - use a proper color library in production
  const rgb = color.match(/\d+/g);
  if (!rgb) return 0;
  
  const [r, g, b] = rgb.map(c => {
    c = parseInt(c) / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

// Test screen reader announcements
Cypress.Commands.add('testScreenReaderContent', () => {
  // Check for live regions
  cy.get('[aria-live], [role="status"], [role="alert"]').should('exist');
  
  // Check for proper headings
  cy.testHeadingHierarchy();
  
  // Check for landmark regions
  cy.get('main, [role="main"]').should('have.length.at.least', 1);
  cy.get('nav, [role="navigation"]').should('exist');
  
  // Check for skip links
  cy.get('a[href="#main"], a[href="#content"], a[href*="skip"]').should('exist');
});

// Test mobile accessibility
Cypress.Commands.add('testMobileAccessibility', () => {
  cy.viewport(375, 667); // Mobile viewport
  
  // Test touch target sizes
  cy.get('button, a[href], input[type="checkbox"], input[type="radio"], [role="button"]').each(($element) => {
    cy.wrap($element).then(($el) => {
      const rect = $el[0].getBoundingClientRect();
      const minSize = 44; // WCAG recommendation
      
      if (rect.width < minSize || rect.height < minSize) {
        const styles = window.getComputedStyle($el[0]);
        const paddingX = parseFloat(styles.paddingLeft) + parseFloat(styles.paddingRight);
        const paddingY = parseFloat(styles.paddingTop) + parseFloat(styles.paddingBottom);
        
        const effectiveWidth = rect.width + paddingX;
        const effectiveHeight = rect.height + paddingY;
        
        if (effectiveWidth < minSize || effectiveHeight < minSize) {
          cy.log(`⚠️  Small touch target: ${Math.round(effectiveWidth)}x${Math.round(effectiveHeight)}px`);
        }
      }
    });
  });
  
  // Test that content doesn't require horizontal scrolling
  cy.window().then((win) => {
    const bodyWidth = win.document.body.scrollWidth;
    const viewportWidth = win.innerWidth;
    
    if (bodyWidth > viewportWidth + 20) { // 20px tolerance
      cy.log(`⚠️  Horizontal scroll required: ${bodyWidth}px content in ${viewportWidth}px viewport`);
    }
  });
});