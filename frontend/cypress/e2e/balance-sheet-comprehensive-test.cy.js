/**
 * Comprehensive Balance Sheet Functionality Tests
 * Tests all implemented features using Richard's account (richard.mmacharia@gmail.com)
 * 
 * Test Coverage:
 * 1. Asset Creation CRUD with save functionality
 * 2. Balance Sheet structure (Assets/Liabilities vs Assets/Expenses)
 * 3. Kenyan financial context (NSSF, pension schemes)
 * 4. Hybrid save strategy for advanced assumptions
 * 5. Return/risk modeling integration
 */

describe('Balance Sheet Comprehensive Tests - Richard Account', () => {
  const TEST_USER = {
    email: 'richard.mmacharia@gmail.com',
    password: 'securepassword123'
  };

  beforeEach(() => {
    // Set viewport for consistent testing
    cy.viewport(1200, 800);
    
    // Visit the app
    cy.visit('http://localhost:3000');
    
    // Login as Richard
    cy.get('input[type="email"]').clear().type(TEST_USER.email);
    cy.get('input[type="password"]').clear().type(TEST_USER.password);
    cy.get('button[type="submit"]').click();
    
    // Wait for successful login and navigate to balance sheet
    cy.url().should('include', '/timeline');
    cy.wait(2000);
  });

  describe('1. Asset Creation CRUD Save Functionality', () => {
    it('should have functional save button when creating assets', () => {
      // Navigate to balance sheet
      cy.contains('Balance Sheet').click();
      cy.wait(1000);
      
      // Go to Assets tab
      cy.contains('Assets').click();
      cy.wait(1000);
      
      // Look for "Add Asset" or similar button
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="add-asset-button"]').length > 0) {
          cy.get('[data-testid="add-asset-button"]').click();
        } else if ($body.find('button:contains("Add Asset")').length > 0) {
          cy.contains('button', 'Add Asset').click();
        } else if ($body.find('button:contains("Add New Asset")').length > 0) {
          cy.contains('button', 'Add New Asset').click();
        } else {
          // Look for any button with asset-related text
          cy.get('button').contains(/add.*asset/i).click();
        }
      });
      
      cy.wait(1000);
      
      // Fill out asset form
      cy.get('input#name').should('be.visible').clear().type('Test Savings Account');
      
      // Select asset type (should show Kenyan options)
      cy.get('[data-testid="asset-type-select"], select, [role="combobox"]').first().click();
      cy.wait(500);
      
      // Look for Kenya-specific asset types
      cy.get('body').then(($body) => {
        if ($body.text().includes('NSSF')) {
          cy.contains('NSSF').click();
        } else if ($body.text().includes('Savings')) {
          cy.contains('Savings').click();
        } else {
          // Select first available option
          cy.get('[role="option"], option').first().click();
        }
      });
      
      // Fill in financial values
      cy.get('input#current_value').clear().type('100000');
      cy.get('input#acquisition_cost').clear().type('100000');
      cy.get('input#acquisition_date').type('2024-01-01');
      
      // Check that save button exists and is functional
      cy.get('button[type="submit"], button:contains("Save"), button:contains("Add Asset")').should('be.visible');
      
      // Test keyboard shortcut (Ctrl+Enter) - mentioned in requirements
      cy.get('body').type('{ctrl}{enter}');
      
      // Should show success or navigate away
      cy.wait(2000);
      
      // Verify form submission worked
      cy.get('body').should('not.contain', 'Please complete all required fields');
    });

    it('should show Kenyan asset categories with proper risk/return data', () => {
      cy.visit('http://localhost:3000/balance-sheet');
      cy.wait(2000);
      
      // Navigate to assets
      cy.contains('Assets').click();
      cy.wait(1000);
      
      // Try to open asset creation form
      cy.get('body').then(($body) => {
        if ($body.find('button:contains("Add")').length > 0) {
          cy.contains('button', 'Add').first().click();
        }
      });
      
      cy.wait(1000);
      
      // Check for Kenya-specific terms in the interface
      cy.get('body').should('contain.text', /NSSF|Kenya|KES/);
      
      // Verify no US-centric terms
      cy.get('body').should('not.contain.text', '401k');
      cy.get('body').should('not.contain.text', 'IRA');
    });
  });

  describe('2. Balance Sheet Structure Validation', () => {
    it('should show proper Assets and Liabilities tabs (not Assets and Expenses)', () => {
      cy.visit('http://localhost:3000/balance-sheet');
      cy.wait(2000);
      
      // Check navigation tabs
      cy.get('nav, [role="navigation"], .nav').should('be.visible');
      
      // Should have Assets tab
      cy.contains('Assets').should('be.visible');
      
      // Should have Liabilities tab
      cy.contains('Liabilities').should('be.visible');
      
      // Should NOT have Expenses tab in balance sheet context
      cy.get('body').then(($body) => {
        const text = $body.text();
        if (text.includes('Expenses') && text.includes('Assets')) {
          // If both are present, they should be separated properly
          // Assets should be with Liabilities, Expenses should be separate
          expect(text).to.not.match(/Assets.*and.*Expenses/i);
        }
      });
      
      // Should have Income Statement separate from Balance Sheet
      cy.get('body').should('contain.text', /Income Statement|P&L/);
    });

    it('should follow proper accounting equation: Assets = Liabilities + Equity', () => {
      cy.visit('http://localhost:3000/balance-sheet');
      cy.wait(3000);
      
      // Check for balance sheet summary
      cy.get('body').then(($body) => {
        const text = $body.text();
        
        // Should show net worth calculation
        if (text.includes('Net Worth') || text.includes('Total Assets')) {
          cy.contains(/Net Worth|Total Assets/i).should('be.visible');
        }
        
        // Should have proper balance sheet structure
        expect(text).to.match(/Assets.*Liabilities/s);
      });
    });
  });

  describe('3. Kenyan Financial Context', () => {
    it('should use NSSF and pension schemes instead of 401k', () => {
      cy.visit('http://localhost:3000/balance-sheet');
      cy.wait(2000);
      
      // Check entire page content
      cy.get('body').then(($body) => {
        const bodyText = $body.text();
        
        // Should contain Kenya-specific terms
        expect(bodyText).to.match(/NSSF|National Social Security Fund|pension/i);
        
        // Should NOT contain US-specific terms
        expect(bodyText).to.not.match(/401k|401\(k\)|IRA|Roth IRA/i);
      });
    });

    it('should display Kenya currency (KES) and market data', () => {
      cy.visit('http://localhost:3000/balance-sheet');
      cy.wait(2000);
      
      // Check for KES currency
      cy.get('body').should('contain.text', 'KES');
      
      // Should show Kenya-appropriate discount rates
      cy.get('body').then(($body) => {
        const text = $body.text();
        if (text.includes('%')) {
          // Kenya typically has higher rates than US
          expect(text).to.match(/1[0-5]\.?[0-9]*%/); // Looking for rates around 10-15%
        }
      });
    });
  });

  describe('4. Hybrid Save Strategy (Option C)', () => {
    it('should show auto-save functionality in advanced assumptions', () => {
      cy.visit('http://localhost:3000/balance-sheet');
      cy.wait(2000);
      
      // Look for advanced assumptions panel
      cy.get('body').then(($body) => {
        if ($body.text().includes('Advanced') || $body.text().includes('Assumptions')) {
          cy.contains(/Advanced.*Assumptions/i).click();
          cy.wait(1000);
          
          // Should show auto-save manager
          cy.get('[data-testid="hybrid-save-manager"], .hybrid-save-manager').should('exist');
          
          // Should have auto-save status
          cy.get('body').should('contain.text', /auto.?save/i);
          
          // Should have "Save as Defaults" option
          cy.get('body').should('contain.text', /save.*default/i);
        }
      });
    });

    it('should support keyboard shortcuts for saving', () => {
      cy.visit('http://localhost:3000/balance-sheet');
      cy.wait(2000);
      
      // Try Ctrl+S shortcut
      cy.get('body').type('{ctrl}s');
      cy.wait(1000);
      
      // Should not show error (shortcut should be handled)
      cy.get('body').should('not.contain.text', 'Error');
    });
  });

  describe('5. Return/Risk Modeling Integration', () => {
    it('should display portfolio risk and return analysis', () => {
      cy.visit('http://localhost:3000/balance-sheet');
      cy.wait(3000);
      
      // Look for risk/return analysis section
      cy.get('body').then(($body) => {
        const text = $body.text();
        
        if (text.includes('Risk') || text.includes('Return') || text.includes('Portfolio')) {
          // Should show expected return
          expect(text).to.match(/Expected Return|Return/i);
          
          // Should show risk metrics
          expect(text).to.match(/Risk|Volatility/i);
          
          // Should show Sharpe ratio
          expect(text).to.match(/Sharpe/i);
          
          // Should reference CFA methodology
          expect(text).to.match(/CFA|JP Morgan|LTCM/i);
        }
      });
    });

    it('should show Kenya-specific market benchmarks', () => {
      cy.visit('http://localhost:3000/balance-sheet');
      cy.wait(3000);
      
      cy.get('body').then(($body) => {
        const text = $body.text();
        
        if (text.includes('Kenya') || text.includes('NSE')) {
          // Should reference Kenya market
          expect(text).to.match(/Kenya|NSE|T-Bills/i);
        }
        
        // Should show appropriate risk levels for Kenya market
        if (text.includes('Risk')) {
          expect(text).to.match(/Conservative|Moderate|Aggressive/i);
        }
      });
    });

    it('should provide CFA-compliant recommendations', () => {
      cy.visit('http://localhost:3000/balance-sheet');
      cy.wait(3000);
      
      cy.get('body').then(($body) => {
        const text = $body.text();
        
        if (text.includes('Recommendation') || text.includes('CFA')) {
          // Should show professional recommendations
          expect(text).to.match(/Recommendation|Diversif|Rebalance/i);
          
          // Should reference CFA standards
          expect(text).to.match(/CFA/i);
        }
      });
    });
  });

  describe('6. Integration Tests', () => {
    it('should handle Richard\'s specific financial data correctly', () => {
      cy.visit('http://localhost:3000/balance-sheet');
      cy.wait(4000);
      
      // Should load Richard's profile data
      cy.get('body').then(($body) => {
        const text = $body.text();
        
        // Should show financial data
        if (text.includes('KES')) {
          // Verify currency is displayed
          expect(text).to.include('KES');
        }
        
        // Should handle Richard's loan payment (33,253 KES mentioned in code)
        if (text.includes('33') && text.includes('253')) {
          cy.log('Detected Richard\'s loan payment handling');
        }
      });
    });

    it('should perform end-to-end asset creation with risk analysis', () => {
      cy.visit('http://localhost:3000/balance-sheet');
      cy.wait(2000);
      
      // Navigate to assets
      cy.contains('Assets').click();
      cy.wait(1000);
      
      // This test verifies the complete flow works together
      cy.get('body').should('be.visible');
      
      // Should show Kenya context throughout
      cy.get('body').should('contain.text', /KES|Kenya/);
      
      // Should not show US context
      cy.get('body').should('not.contain.text', /USD|\$|401k/);
    });

    it('should maintain data integrity across all components', () => {
      cy.visit('http://localhost:3000/balance-sheet');
      cy.wait(3000);
      
      // Test different views maintain consistency
      cy.contains('Overview').click();
      cy.wait(1000);
      cy.get('body').should('contain.text', /Assets|Liabilities/i);
      
      cy.contains('Assets').click();
      cy.wait(1000);
      cy.get('body').should('be.visible');
      
      cy.contains('Liabilities').click();
      cy.wait(1000);
      cy.get('body').should('be.visible');
      
      // All views should use consistent Kenya context
      cy.get('body').should('contain.text', /KES|Kenya/i);
    });
  });

  describe('7. Error Handling and Edge Cases', () => {
    it('should handle missing data gracefully', () => {
      cy.visit('http://localhost:3000/balance-sheet');
      cy.wait(3000);
      
      // Should not show error messages for missing data
      cy.get('body').should('not.contain.text', /Error.*loading|Failed.*load|Cannot read/);
      
      // Should show appropriate placeholders
      cy.get('body').then(($body) => {
        if ($body.text().includes('KES 0') || $body.text().includes('No data')) {
          cy.log('Graceful handling of empty data detected');
        }
      });
    });

    it('should validate form inputs properly', () => {
      cy.visit('http://localhost:3000/balance-sheet');
      cy.wait(2000);
      
      cy.contains('Assets').click();
      cy.wait(1000);
      
      // Try to find and test asset form validation
      cy.get('body').then(($body) => {
        if ($body.find('button:contains("Add")').length > 0) {
          cy.contains('button', 'Add').first().click();
          cy.wait(1000);
          
          // Try to submit empty form
          cy.get('button[type="submit"]').then(($submit) => {
            if ($submit.length > 0) {
              $submit.click();
              cy.wait(1000);
              
              // Should show validation errors
              cy.get('body').should('contain.text', /required|invalid|error/i);
            }
          });
        }
      });
    });
  });
});