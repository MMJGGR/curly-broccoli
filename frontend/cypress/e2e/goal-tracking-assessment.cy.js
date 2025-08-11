/**
 * Goal Tracking Assessment Test Suite
 * Testing goal-timeline phase alignment and deviation detection scenarios
 */

describe('Goal Tracking System Assessment', () => {
  beforeEach(() => {
    // Login with test user
    cy.visit('/login');
    cy.get('[data-cy="email-input"]').type('jamal.test@example.com');
    cy.get('[data-cy="password-input"]').type('testpassword123');
    cy.get('[data-cy="login-button"]').click();
    
    // Wait for Timeline to load
    cy.url().should('include', '/timeline');
    cy.get('[data-cy="persona-badge"]').should('be.visible');
  });

  describe('1. Current Goal Tracking Capability', () => {
    it('should display meaningful goal progress calculations', () => {
      cy.get('[data-cy="alignment-score"]').should('be.visible');
      cy.get('[data-cy="alignment-score"]').should('contain', '%');
      
      // Check if alignment score is a meaningful number (not just a static display)
      cy.get('[data-cy="alignment-score"]').then($score => {
        const scoreText = $score.text();
        const scoreNumber = parseInt(scoreText.replace('%', ''));
        expect(scoreNumber).to.be.at.least(0);
        expect(scoreNumber).to.be.at.most(100);
      });
    });

    it('should show actual milestone progress tracking', () => {
      // Switch to Journey view to see milestone progress
      cy.contains('🗺️ Journey').click();
      
      // Look for progress indicators on milestones
      cy.get('[data-cy="milestone-progress"]').should('exist');
      
      // Verify progress shows actual completion percentages
      cy.get('[data-cy="milestone-progress"]').each($milestone => {
        cy.wrap($milestone).should('contain', '%');
        cy.wrap($milestone).should('contain', 'done');
      });
    });

    it('should provide clear feedback on timeline vs goal alignment', () => {
      // Check alignment dashboard for specific feedback
      cy.contains('🎯 Alignment').click();
      
      cy.get('[data-cy="alignment-status"]').should('be.visible');
      cy.get('[data-cy="alignment-insights"]').should('exist');
      
      // Verify there's actual status messaging, not just placeholders
      cy.get('[data-cy="alignment-status"]').should('not.contain', 'Loading');
      cy.get('[data-cy="alignment-status"]').should('not.contain', '--');
    });
  });

  describe('2. Timeline Phase vs Goal Alignment', () => {
    it('should show phase-appropriate goals for user lifecycle stage', () => {
      // Check persona badge shows current phase
      cy.get('[data-cy="persona-badge"]').should('contain', 'Jamal');
      
      // Verify goals are appropriate for young professional (Jamal persona)
      cy.get('[data-cy="next-milestone"]').should('be.visible');
      cy.get('[data-cy="next-milestone"]').should('not.contain', 'Retirement');
      cy.get('[data-cy="next-milestone"]').should('match', /(Emergency|Investment|Savings)/i);
    });

    it('should adjust goal priorities based on lifecycle phase', () => {
      cy.contains('📊 Overview').click();
      
      // Check quick actions are phase-appropriate
      cy.get('[data-cy="quick-actions"]').should('exist');
      cy.get('[data-cy="quick-actions"]').within(() => {
        // For Jamal (young professional), should prioritize investment building
        cy.should('contain', 'Investment').or('contain', 'Emergency').or('contain', 'Budget');
      });
    });

    it('should provide guidance on goal prioritization by phase', () => {
      cy.contains('🎯 Alignment').click();
      
      // Check for persona-specific recommendations
      cy.get('[data-cy="persona-recommendations"]').should('exist');
      cy.get('[data-cy="persona-recommendations"]').should('contain', 'investment');
    });
  });

  describe('3. Deviation Detection Scenarios', () => {
    it('should detect when user is ahead of timeline', () => {
      // Mock a scenario where user has high surplus (ahead of timeline)
      cy.window().then((win) => {
        // Simulate budget context with high surplus
        win.mockBudgetContext = {
          actualSurplus: 150000,
          budgetHealth: 'healthy'
        };
      });
      
      cy.reload();
      cy.get('[data-cy="alignment-score"]').should('be.visible');
      
      // Should show positive deviation indicators
      cy.get('[data-cy="budget-boost"]').should('be.visible');
      cy.contains('surplus').should('be.visible');
    });

    it('should detect when user is behind timeline', () => {
      // Test negative deviation detection
      cy.contains('📊 Overview').click();
      
      // Look for deficit warnings or behind-schedule indicators
      cy.get('body').then($body => {
        if ($body.find('[data-cy="budget-alert"]').length > 0) {
          cy.get('[data-cy="budget-alert"]').should('contain', 'Alert');
        }
      });
    });

    it('should handle phase changes appropriately', () => {
      // Navigate to profile to potentially trigger phase changes
      cy.visit('/profile');
      
      // Verify profile loads and shows current phase
      cy.get('[data-cy="current-phase"]').should('be.visible');
      
      // Go back to timeline to check if goals adjusted
      cy.visit('/timeline');
      cy.get('[data-cy="alignment-score"]').should('be.visible');
    });
  });

  describe('4. Actionable Feedback Quality', () => {
    it('should provide specific corrective actions when off-track', () => {
      cy.contains('📊 Overview').click();
      
      // Check for specific recommendations, not generic advice
      cy.get('[data-cy="recommendations"]').should('exist');
      cy.get('[data-cy="recommendations"]').should('not.contain', 'Review your budget');
      cy.get('[data-cy="recommendations"]').should('contain.oneOf', [
        'Allocate',
        'Increase',
        'Consider',
        'Focus on'
      ]);
    });

    it('should suggest timeline adjustments when goals are unrealistic', () => {
      cy.contains('🎯 Alignment').click();
      
      // Look for timeline adjustment suggestions
      cy.get('body').then($body => {
        const hasAdjustmentSuggestions = $body.text().includes('adjust') || 
                                       $body.text().includes('realistic') ||
                                       $body.text().includes('timeline');
        
        if (hasAdjustmentSuggestions) {
          cy.contains(/adjust|realistic|timeline/i).should('be.visible');
        }
      });
    });

    it('should provide re-balancing guidance when priorities change', () => {
      cy.contains('📊 Overview').click();
      
      // Check for dynamic recommendations based on current financial state
      cy.get('[data-cy="smart-recommendations"]').should('exist');
      cy.get('[data-cy="smart-recommendations"]').within(() => {
        // Should have at least one specific recommendation
        cy.get('[data-cy="recommendation-item"]').should('have.length.at.least', 1);
        
        // Recommendations should be actionable, not just informational
        cy.get('[data-cy="recommendation-item"]').first().should('not.contain', 'Good job');
        cy.get('[data-cy="recommendation-item"]').first().should('match', /(Consider|Allocate|Review|Increase|Focus)/i);
      });
    });

    it('should calculate realistic timeline acceleration from surplus', () => {
      cy.contains('📊 Overview').click();
      
      // If budget integration is working, should show acceleration calculations
      cy.get('body').then($body => {
        if ($body.find('[data-cy="acceleration-calculation"]').length > 0) {
          cy.get('[data-cy="acceleration-calculation"]').should('contain', 'months');
          cy.get('[data-cy="acceleration-calculation"]').should('contain.oneOf', ['accelerate', 'boost']);
        }
      });
    });
  });

  describe('5. Long-term Objective Tracking Effectiveness', () => {
    it('should show meaningful progress toward long-term goals', () => {
      cy.contains('🗺️ Journey').click();
      
      // Verify journey progress calculation is meaningful
      cy.get('[data-cy="journey-progress"]').should('be.visible');
      cy.get('[data-cy="journey-progress"]').should('not.contain', '0%');
      
      // Check that progress calculation considers actual milestone completion
      cy.get('[data-cy="journey-progress"]').then($progress => {
        const progressText = $progress.text();
        const progressNumber = parseInt(progressText.replace('%', ''));
        // Progress should be realistic (not 100% for new user, not 0% for active user)
        expect(progressNumber).to.be.at.least(0);
        expect(progressNumber).to.be.at.most(100);
      });
    });

    it('should provide trajectory analysis for goal achievement', () => {
      cy.contains('🗺️ Journey').click();
      
      // Look for trajectory insights
      cy.get('[data-cy="journey-insights"]').should('exist');
      cy.get('[data-cy="journey-insights"]').within(() => {
        // Should contain analysis of current trajectory
        cy.should('contain.oneOf', ['on track', 'ahead', 'behind', 'excellent', 'good']);
      });
    });

    it('should help users understand if they will achieve long-term success', () => {
      cy.contains('🎯 Alignment').click();
      
      // Check for clear success probability indicators
      cy.get('[data-cy="alignment-score"]').then($score => {
        const scoreText = $score.text();
        const scoreNumber = parseInt(scoreText.replace('%', ''));
        
        // High alignment should correlate with success messaging
        if (scoreNumber >= 70) {
          cy.get('body').should('contain.oneOf', ['excellent', 'on track', 'well-positioned']);
        } else if (scoreNumber >= 40) {
          cy.get('body').should('contain.oneOf', ['progress', 'building', 'momentum']);
        } else {
          cy.get('body').should('contain.oneOf', ['focus', 'getting started', 'optimization']);
        }
      });
    });
  });

  describe('6. System Integration and Data Quality', () => {
    it('should integrate budget data with goal tracking', () => {
      // Check if budget integration affects goal tracking
      cy.get('[data-cy="alignment-score"]').should('be.visible');
      
      // Visit budget page to verify integration exists
      cy.visit('/budget');
      cy.get('body').should('contain', 'Budget');
      
      // Return to timeline and verify budget influence on alignment
      cy.visit('/timeline');
      cy.get('[data-cy="budget-health"]').should('exist');
    });

    it('should maintain consistency across timeline components', () => {
      // Check consistency between different views
      cy.get('[data-cy="alignment-score"]').then($headerScore => {
        const headerScore = $headerScore.text();
        
        cy.contains('🎯 Alignment').click();
        cy.get('[data-cy="alignment-score"]').should('contain', headerScore);
      });
    });

    it('should provide real-time updates for goal progress', () => {
      // Test that the system updates when underlying data changes
      cy.get('[data-cy="alignment-score"]').should('be.visible');
      
      // Reload page and verify data persists
      cy.reload();
      cy.get('[data-cy="alignment-score"]').should('be.visible');
      cy.get('[data-cy="alignment-score"]').should('not.contain', '--');
    });
  });
});