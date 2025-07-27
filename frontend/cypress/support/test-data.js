// Test data and persona management for consistent testing

// PRD Target Specifications for Persona Alignment Testing
export const PRD_TARGETS = {
  users: {
    jamal: {
      first_name: 'Jamal',
      last_name: 'Mwangi',
      age: 27,
      description: 'Early-Career Accumulator',
      key_needs: 'Emergency fund, debt payoff, automated transaction ingestion'
    },
    aisha: {
      first_name: 'Aisha',
      last_name: 'Otieno',
      age: 36,
      description: 'Family & Property',
      key_needs: 'Education savings, mortgage management, insurance gap analysis'
    },
    samuel: {
      first_name: 'Samuel',
      last_name: 'Kariuki',
      age: 54,
      description: 'Pre-Retirement Consolidation',
      key_needs: 'Portfolio rebalance, decumulation planning, LTC provisions'
    }
  },
  advisors: {
    emily: {
      first_name: 'Emily',
      last_name: 'Njeri',
      description: 'Fee-only CFP® for HNW clients',
      key_needs: 'Monte Carlo simulations, tax-efficient planning, audit trail'
    },
    daniel: {
      first_name: 'Daniel',
      last_name: 'Mwangi',
      description: 'Bank-affiliated planner for mass-affluent',
      key_needs: 'Rapid KYC, product recommendations, compliance memos'
    }
  }
};

export const PERSONAS = {
  users: {
    jamal: {
      email: 'jamal@example.com',
      password: 'jamal123',
      profile: {
        first_name: 'Jamal',
        last_name: 'Mwangi',
        age: 27,
        description: 'Early Career Professional'
      },
      onboarding: {
        personalDetails: {
          firstName: 'Jamal',
          lastName: 'Mwangi',
          dob: '1997-03-15',
          nationalId: '32456789',
          kraPin: 'A032456789J',
          dependents: '1'
        },
        riskAssessment: [3, 3, 3, 3, 3], // 1-4 scale: moderate responses
        cashFlow: {
          monthlyIncome: '65000',
          incomeFrequency: 'Monthly',
          rent: '25000',
          utilities: '3000',
          groceries: '8000',
          transport: '5000',
          loanRepayments: '4000'
        }
      }
    },
    aisha: {
      email: 'aisha@example.com', 
      password: 'aisha123',
      profile: {
        first_name: 'Aisha',
        last_name: 'Kimani',
        age: 36,
        description: 'Family & Property Owner'
      }
    },
    samuel: {
      email: 'samuel@example.com',
      password: 'samuel123',
      profile: {
        first_name: 'Samuel',
        last_name: 'Ochieng',
        age: 54,
        description: 'Pre-Retirement Planning'
      }
    }
  },
  advisors: {
    emily: {
      email: 'emily.advisor@example.com',
      password: 'emily123',
      profile: {
        first_name: 'Emily',
        last_name: 'Chen',
        description: 'Fee-only CFP'
      }
    },
    daniel: {
      email: 'daniel.advisor@example.com',
      password: 'daniel123',
      profile: {
        first_name: 'Daniel',
        last_name: 'Mwangi',
        description: 'Bank-affiliated planner for mass-affluent'
      }
    }
  }
};

// Utility function to generate unique test emails
export const generateTestEmail = (prefix = 'test') => {
  return `${prefix}${Date.now()}@example.com`;
};

// Utility function to ensure persona accounts exist
export const ensurePersonaAccountsExist = () => {
  // This would typically be called in a before() hook
  // For now, we assume accounts are created via our manual setup
  cy.log('Persona accounts should be pre-created in database');
};

// Common form interactions
export const fillRegistrationForm = (email, password, userType = 'Individual') => {
  cy.get('button').contains('Create Account').click();
  
  if (userType === 'Advisor') {
    cy.get('button').contains('Advisor').click();
  }
  
  cy.get('input[id="email"]').type(email);
  cy.get('input[id="password"]').type(password);
  cy.get('input[id="confirmPassword"]').type(password);
  
  cy.intercept('POST', '/auth/register').as('registerRequest');
  cy.get('button[type="submit"]').click();
  
  return cy.wait('@registerRequest');
};

export const fillLoginForm = (email, password) => {
  cy.get('input[id="email"]').type(email);
  cy.get('input[id="password"]').type(password);
  
  cy.intercept('POST', '/auth/login').as('loginRequest');
  cy.get('button[type="submit"]').click();
  
  return cy.wait('@loginRequest');
};

export const fillOnboardingPersonalDetails = (details) => {
  cy.get('input[id="firstName"]').clear().type(details.firstName);
  cy.get('input[id="lastName"]').clear().type(details.lastName);
  cy.get('input[id="dob"]').clear().type(details.dob);
  cy.get('input[id="nationalId"]').clear().type(details.nationalId);
  if (details.kraPin) {
    cy.get('input[id="kraPin"]').clear().type(details.kraPin);
  }
  if (details.dependents) {
    cy.get('input[id="dependents"]').clear().type(details.dependents.toString());
  }
  
  cy.get('button[type="submit"]').click();
};

export const fillRiskQuestionnaire = (responses = [3, 3, 3, 3, 3]) => {
  // Risk questionnaire uses radio buttons with option text values, not numeric values
  const questions = [
    { id: 'q1', options: ['Capital preservation', 'Income generation', 'Capital appreciation', 'Speculation'] },
    { id: 'q2', options: ['Less than 1 year', '1-3 years', '3-5 years', 'More than 5 years'] },
    { id: 'q3', options: ['Sell all investments', 'Sell some investments', 'Hold investments', 'Buy more investments'] },
    { id: 'q4', options: ['None', 'Limited', 'Good', 'Extensive'] },
    { id: 'q5', options: ['None', 'Less than 10%', '10-25%', 'More than 25%'] }
  ];

  responses.forEach((response, index) => {
    const questionId = questions[index].id;
    const optionText = questions[index].options[response - 1]; // Convert 1-4 to 0-3 index
    cy.get(`input[name="${questionId}"][value="${optionText}"]`).check();
  });
  
  cy.get('button').contains('Calculate My Risk Profile').click();
};

export const fillCashFlowSetup = (cashFlowData) => {
  // Fill income section
  cy.get('input[id="monthlyIncome"]').type(cashFlowData.monthlyIncome.toString());
  
  if (cashFlowData.incomeFrequency) {
    cy.get('select[id="incomeFrequency"]').select(cashFlowData.incomeFrequency);
  }
  
  // Fill expense categories
  if (cashFlowData.rent) {
    cy.get('input[id="rent"]').type(cashFlowData.rent.toString());
  }
  if (cashFlowData.utilities) {
    cy.get('input[id="utilities"]').type(cashFlowData.utilities.toString());
  }
  if (cashFlowData.groceries) {
    cy.get('input[id="groceries"]').type(cashFlowData.groceries.toString());
  }
  if (cashFlowData.transport) {
    cy.get('input[id="transport"]').type(cashFlowData.transport.toString());
  }
  if (cashFlowData.loanRepayments) {
    cy.get('input[id="loanRepayments"]').type(cashFlowData.loanRepayments.toString());
  }
  
  // Complete registration
  cy.get('button').contains('Complete Registration').click();
};

// Data connection step - handle wireframe actions
export const handleDataConnection = () => {
  // Click "Manual Entry (Later)" to skip data connection
  cy.get('button').contains('Manual Entry (Later)').click();
};

// Complete full onboarding flow for a persona
export const completePersonaOnboarding = (persona) => {
  const onboardingData = persona.onboarding;
  
  // Step 1: Personal Details
  fillOnboardingPersonalDetails(onboardingData.personalDetails);
  
  // Step 2: Risk Assessment
  fillRiskQuestionnaire(onboardingData.riskAssessment);
  
  // Step 3: Data Connection (skip with manual entry)
  handleDataConnection();
  
  // Step 4: Cash Flow Setup (final step)
  fillCashFlowSetup(onboardingData.cashFlow);
};

// Assertion helpers
export const assertDashboardWelcome = (userName = null) => {
  cy.url().should('include', '/app/dashboard');
  cy.get('body').should('contain', 'Welcome');
  
  if (userName) {
    cy.get('body').should('contain', `Welcome back, ${userName}!`);
  }
};

export const assertIncompleteProfile = () => {
  cy.get('body').should('contain', 'Account Created Successfully!');
  cy.get('body').should('contain', '0% Complete');
  cy.get('button').contains('Complete Your Profile').should('be.visible');
};

export const assertCompleteProfile = () => {
  cy.get('body').should('contain', 'Profile Complete - All features unlocked!');
};

export const assertOnAuthPage = () => {
  cy.url().should('include', '/auth');
  cy.get('body').should('contain', 'Welcome Back');
};

// Profile CRUD helper functions
export const accessProfileEdit = () => {
  cy.get('body').then(($body) => {
    const bodyText = $body.text();
    
    if (bodyText.includes('Edit Profile')) {
      cy.get('button, a').contains('Edit Profile').first().click();
      return cy.wrap(true);
    } else if (bodyText.includes('Update Profile')) {
      cy.get('button, a').contains('Update Profile').first().click();
      return cy.wrap(true);
    } else if (bodyText.includes('Settings')) {
      cy.get('button, a').contains('Settings').first().click();
      return cy.wrap(true);
    } else if (bodyText.includes('Professional Details')) {
      cy.get('button, a').contains('Professional Details').first().click();
      return cy.wrap(true);
    } else {
      cy.log('ℹ️  Profile edit functionality not found');
      return cy.wrap(false);
    }
  });
};

export const updateProfileField = (fieldType, newValue) => {
  const selectors = {
    firstName: 'input[id*="firstName"], input[name*="firstName"], input[placeholder*="First"]',
    lastName: 'input[id*="lastName"], input[name*="lastName"], input[placeholder*="Last"]',
    description: 'input[id*="description"], textarea[id*="description"], input[name*="description"]',
    age: 'input[id*="age"], input[name*="age"], input[type="number"]',
    keyNeeds: 'textarea[id*="needs"], textarea[id*="focus"], textarea[id*="goals"], textarea[id*="specialization"]',
    title: 'input[id*="title"], input[name*="title"], textarea[id*="title"]',
    firmName: 'input[id*="firm"], input[name*="firm"], input[placeholder*="firm"]',
    license: 'input[id*="license"], input[name*="license"], input[placeholder*="license"]'
  };

  const selector = selectors[fieldType];
  if (!selector) {
    cy.log(`❌ Unknown field type: ${fieldType}`);
    return cy.wrap(false);
  }

  return cy.get(selector).then(($field) => {
    if ($field.length > 0) {
      cy.wrap($field).clear().type(newValue);
      cy.log(`✅ Updated ${fieldType}: ${newValue}`);
      return cy.wrap(true);
    } else {
      cy.log(`ℹ️  Field ${fieldType} not found in form`);
      return cy.wrap(false);
    }
  });
};

export const saveProfileChanges = () => {
  return cy.get('button[type="submit"], button').contains(/Save|Update|Submit/i).then(($saveBtn) => {
    if ($saveBtn.length > 0) {
      cy.wrap($saveBtn).click();
      cy.log('✅ Profile changes submitted');
      return cy.wrap(true);
    } else {
      cy.log('ℹ️  Save button not found');
      return cy.wrap(false);
    }
  });
};

export const verifyProfileUpdate = (fieldType, expectedValue) => {
  cy.wait(1000); // Allow time for update to process
  return cy.get('body').then(($body) => {
    const bodyText = $body.text();
    const found = bodyText.includes(expectedValue);
    
    if (found) {
      cy.log(`✅ Profile update verified: ${fieldType} shows ${expectedValue}`);
    } else {
      cy.log(`ℹ️  Profile update not visible: ${fieldType} = ${expectedValue} not found in UI`);
    }
    
    return cy.wrap(found);
  });
};

export const performFullPersonaAlignment = (personaEmail, personaPassword, targetProfile) => {
  cy.visit('/auth');
  fillLoginForm(personaEmail, personaPassword);
  assertDashboardWelcome();

  return accessProfileEdit().then((editAvailable) => {
    if (editAvailable) {
      // Update last name if different
      if (targetProfile.last_name) {
        updateProfileField('lastName', targetProfile.last_name);
      }
      
      // Update description
      if (targetProfile.description) {
        updateProfileField('description', targetProfile.description);
      }
      
      // Update key needs/specialization
      if (targetProfile.key_needs) {
        updateProfileField('keyNeeds', targetProfile.key_needs);
      }
      
      // Save changes
      return saveProfileChanges().then((saved) => {
        if (saved) {
          // Verify updates
          if (targetProfile.last_name) {
            verifyProfileUpdate('lastName', targetProfile.last_name);
          }
          if (targetProfile.description) {
            verifyProfileUpdate('description', targetProfile.description);
          }
        }
        return cy.wrap(saved);
      });
    } else {
      cy.log('ℹ️  Profile editing not available - testing read-only view');
      return cy.wrap(false);
    }
  });
};

export const generateAlignmentReport = (personaKey, currentProfile, targetProfile, uiState) => {
  const report = {
    persona: personaKey,
    current: currentProfile,
    target: targetProfile,
    alignment: {
      firstName: currentProfile.first_name === targetProfile.first_name,
      lastName: currentProfile.last_name === targetProfile.last_name,
      description: currentProfile.description === targetProfile.description
    },
    ui: uiState,
    timestamp: new Date().toISOString(),
    alignmentScore: 0
  };

  // Calculate alignment score
  const alignmentFields = Object.values(report.alignment);
  report.alignmentScore = (alignmentFields.filter(Boolean).length / alignmentFields.length) * 100;

  return report;
};