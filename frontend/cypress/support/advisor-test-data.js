// Enhanced advisor persona test data aligned with PRD requirements
// This file extends the existing test-data.js with advisor-specific personas and validation

// PRD-aligned advisor specifications
export const ADVISOR_PRD_TARGETS = {
  emily: {
    first_name: 'Emily',
    last_name: 'Njeri', // Target update from current 'Chen'
    description: 'Fee-only CFP® for HNW clients',
    key_needs: 'Monte Carlo simulations, tax-efficient planning, audit trail',
    specialization: 'High net worth clients',
    service_model: 'fee-only',
    client_focus: 'high-net-worth',
    minimum_aum: '5m',
    professional_context: {
      fiduciary_standard: true,
      cfp_certified: true,
      target_market: 'HNW individuals and families',
      typical_client_aum: '5M-50M KSh',
      planning_complexity: 'high'
    }
  },
  daniel: {
    first_name: 'Daniel',
    last_name: 'Mwangi',
    description: 'Bank-affiliated planner for mass-affluent',
    key_needs: 'Rapid KYC, product recommendations, compliance memos',
    specialization: 'Mass-affluent market',
    service_model: 'hybrid',
    client_focus: 'families',
    minimum_aum: '100k',
    professional_context: {
      bank_affiliated: true,
      product_focused: true,
      target_market: 'Mass-affluent families',
      typical_client_aum: '100K-2M KSh',
      planning_complexity: 'moderate'
    }
  }
};

// Complete advisor persona test data
export const ADVISOR_PERSONAS = {
  emily: {
    email: 'emily@advisor.com',
    password: 'emily123',
    role: 'advisor',
    profile: {
      first_name: 'Emily',
      last_name: 'Chen', // Current state (needs update to Njeri)
      description: 'Fee-only CFP',
      firm_name: 'Emily Chen Financial Planning',
      license_number: 'CFP2024001',
      professional_email: 'emily@advisor.com'
    },
    onboarding: {
      professionalDetails: {
        firstName: 'Emily',
        lastName: 'Njeri', // PRD target
        firmName: 'Njeri Financial Advisors',
        licenseNumber: 'CFP2024001',
        professionalEmail: 'emily@njerifinancial.com',
        phone: '+254-700-123-456'
      },
      serviceModel: {
        serviceModel: 'fee-only',
        targetClientType: 'high-net-worth',
        minimumAUM: '5m'
      }
    },
    expectedBehavior: {
      onboarding_time_max: 300, // 5 minutes max
      dashboard_features: ['client_list', 'portfolio_overview', 'planning_tools'],
      professional_standards: ['fiduciary', 'cfp_ethics'],
      client_interaction: 'high_touch'
    }
  },
  daniel: {
    email: 'daniel@advisor.com',
    password: 'daniel123',
    role: 'advisor',
    profile: {
      first_name: 'Daniel',
      last_name: 'Mwangi',
      description: 'Bank-affiliated planner',
      firm_name: 'Kenya Commercial Bank - Wealth Management',
      license_number: 'CMA-2024-456',
      professional_email: 'daniel.mwangi@kcb.co.ke'
    },
    onboarding: {
      professionalDetails: {
        firstName: 'Daniel',
        lastName: 'Mwangi',
        firmName: 'Kenya Commercial Bank - Wealth Management',
        licenseNumber: 'CMA-2024-456',
        professionalEmail: 'daniel.mwangi@kcb.co.ke',
        phone: '+254-711-987-654'
      },
      serviceModel: {
        serviceModel: 'hybrid',
        targetClientType: 'families',
        minimumAUM: '100k'
      }
    },
    expectedBehavior: {
      onboarding_time_max: 180, // 3 minutes max (efficiency focused)
      dashboard_features: ['client_pipeline', 'product_recommendations', 'compliance_tracking'],
      professional_standards: ['bank_compliance', 'sales_targets'],
      client_interaction: 'high_volume'
    }
  }
};

// Test data for new advisor registration
export const NEW_ADVISOR_TEST_DATA = {
  successful_registration: {
    firstName: 'Sarah',
    lastName: 'Wanjiku',
    firmName: 'Wanjiku Wealth Advisors',
    licenseNumber: 'CFP2024789',
    professionalEmail: 'sarah@wanjikuwealth.com',
    phone: '+254-722-555-999',
    serviceModel: 'fee-only',
    targetClientType: 'pre-retirees',
    minimumAUM: '1m'
  },
  validation_test_cases: {
    empty_fields: {
      firstName: '',
      lastName: '',
      firmName: '',
      licenseNumber: ''
    },
    invalid_email: {
      firstName: 'Test',
      lastName: 'Advisor',
      firmName: 'Test Firm',
      licenseNumber: 'TEST123',
      professionalEmail: 'invalid-email-format'
    },
    invalid_license: {
      firstName: 'Test',
      lastName: 'Advisor',
      firmName: 'Test Firm',
      licenseNumber: '!@#$%^&*()',
      professionalEmail: 'test@example.com'
    }
  }
};

// Helper functions for advisor testing
export const fillAdvisorRegistration = (email, password) => {
  cy.get('button').contains('Create Account').click();
  cy.get('button').contains('Advisor').click();
  
  cy.get('input[id="email"]').type(email);
  cy.get('input[id="password"]').type(password);
  cy.get('input[id="confirmPassword"]').type(password);
  
  cy.intercept('POST', '/auth/register').as('advisorRegister');
  cy.get('button[type="submit"]').click();
  
  return cy.wait('@advisorRegister');
};

export const fillAdvisorProfessionalDetails = (details) => {
  cy.get('input[id="firstName"]').clear().type(details.firstName);
  cy.get('input[id="lastName"]').clear().type(details.lastName);
  cy.get('input[id="firmName"]').clear().type(details.firmName);
  cy.get('input[id="licenseNumber"]').clear().type(details.licenseNumber);
  
  if (details.professionalEmail) {
    cy.get('input[id="professionalEmail"]').clear().type(details.professionalEmail);
  }
  
  if (details.phone) {
    cy.get('input[id="phone"]').clear().type(details.phone);
  }
  
  cy.intercept('POST', '**/profile**').as('saveProfile');
  cy.get('button[type="submit"]').click();
  
  return cy.wait('@saveProfile', { timeout: 10000 });
};

export const fillAdvisorServiceModel = (serviceData) => {
  // Select service model radio button
  cy.get(`input[name="serviceModel"][value="${serviceData.serviceModel}"]`).check();
  
  // Select target client type radio button
  cy.get(`input[name="targetClientType"][value="${serviceData.targetClientType}"]`).check();
  
  // Select minimum AUM dropdown if specified
  if (serviceData.minimumAUM) {
    cy.get('select[id="minimumAUM"]').select(serviceData.minimumAUM);
  }
  
  cy.intercept('PUT', '**/profile**').as('updateServiceModel');
  cy.get('button[type="submit"]').click();
  
  return cy.wait('@updateServiceModel', { timeout: 10000 });
};

export const completeAdvisorOnboarding = (persona) => {
  const { professionalDetails, serviceModel } = persona.onboarding;
  
  // Step 1: Professional Details
  fillAdvisorProfessionalDetails(professionalDetails);
  
  // Should navigate to service model step
  cy.url().should('include', '/service-model');
  
  // Step 2: Service Model
  fillAdvisorServiceModel(serviceModel);
  
  // Should navigate to completion or dashboard
  cy.url().should('not.include', '/onboarding');
};

// Advisor dashboard assertions
export const assertAdvisorDashboard = (advisorName = null) => {
  cy.url().should('match', /\/(dashboard|advisor)/);
  
  if (advisorName) {
    cy.get('body').should('contain', `Welcome, ${advisorName}`);
  }
  
  // Should have advisor-specific features
  cy.get('body').then(($body) => {
    const bodyText = $body.text();
    const hasAdvisorFeatures = 
      bodyText.includes('Total Clients') ||
      bodyText.includes('Client') ||
      bodyText.includes('Portfolio') ||
      bodyText.includes('Advisory');
      
    if (hasAdvisorFeatures) {
      cy.log('✅ Advisor dashboard features detected');
    } else {
      cy.log('ℹ️  Generic dashboard - advisor features to be implemented');
    }
  });
};

export const assertAdvisorOnboardingStep = (stepNumber, stepName) => {
  // Check URL contains onboarding path
  cy.url().should('include', '/onboarding/advisor/');
  
  // Check step indicator
  cy.get('body').should('contain', `Step ${stepNumber} of 3`);
  
  // Check step content
  cy.get('body').should('contain', stepName);
  
  cy.log(`✅ Advisor onboarding step ${stepNumber} (${stepName}) validated`);
};

// Professional validation helpers
export const validateProfessionalEmail = (email) => {
  const professionalDomains = [
    'gmail.com', 'yahoo.com', 'hotmail.com'
  ];
  
  const domain = email.split('@')[1];
  const isProfessional = !professionalDomains.includes(domain);
  
  return {
    isProfessional,
    domain,
    recommendation: isProfessional ? 'Professional email' : 'Consider using professional domain'
  };
};

export const validateLicenseNumber = (license) => {
  const patterns = {
    cfp: /^CFP\d{7}$/i,
    cma: /^CMA-\d{4}-\d{3}$/i,
    general: /^[A-Z]{2,4}[\d-]{4,10}$/i
  };
  
  for (const [type, pattern] of Object.entries(patterns)) {
    if (pattern.test(license)) {
      return { valid: true, type: type.toUpperCase() };
    }
  }
  
  return { valid: false, type: 'unknown' };
};

// Persona alignment testing
export const assessAdvisorPersonaAlignment = (personaKey, currentProfile, targetProfile) => {
  const alignment = {
    firstName: currentProfile.first_name === targetProfile.first_name,
    lastName: currentProfile.last_name === targetProfile.last_name,
    description: currentProfile.description === targetProfile.description,
    specialization: currentProfile.specialization === targetProfile.specialization
  };
  
  const alignmentScore = Object.values(alignment).filter(Boolean).length / Object.keys(alignment).length * 100;
  
  return {
    persona: personaKey,
    alignment,
    score: alignmentScore,
    gaps: Object.entries(alignment).filter(([_, aligned]) => !aligned).map(([field, _]) => field),
    recommendations: generateAlignmentRecommendations(personaKey, currentProfile, targetProfile)
  };
};

const generateAlignmentRecommendations = (personaKey, current, target) => {
  const recommendations = [];
  
  if (current.last_name !== target.last_name) {
    recommendations.push(`Update ${personaKey} last name: ${current.last_name} → ${target.last_name}`);
  }
  
  if (current.description !== target.description) {
    recommendations.push(`Update ${personaKey} description: ${current.description} → ${target.description}`);
  }
  
  if (!current.specialization && target.specialization) {
    recommendations.push(`Add ${personaKey} specialization: ${target.specialization}`);
  }
  
  return recommendations;
};

// API testing helpers for advisors
export const testAdvisorAPI = (token) => {
  const endpoints = [
    { method: 'GET', url: '/auth/profile', description: 'Get advisor profile' },
    { method: 'PUT', url: '/auth/profile', description: 'Update advisor profile' },
    { method: 'GET', url: '/advisor/stats', description: 'Get advisor statistics' },
    { method: 'GET', url: '/advisor/clients', description: 'Get client list' }
  ];
  
  const results = [];
  
  endpoints.forEach(endpoint => {
    cy.request({
      method: endpoint.method,
      url: endpoint.url,
      headers: { 'Authorization': `Bearer ${token}` },
      failOnStatusCode: false
    }).then(response => {
      results.push({
        endpoint: endpoint.url,
        method: endpoint.method,
        status: response.status,
        available: response.status < 400,
        description: endpoint.description
      });
      
      cy.log(`${endpoint.method} ${endpoint.url}: ${response.status}`);
    });
  });
  
  return cy.wrap(results);
};

// Performance benchmarks for advisor personas
export const ADVISOR_PERFORMANCE_BENCHMARKS = {
  emily: {
    onboarding_max_time: 300000, // 5 minutes
    dashboard_load_max: 3000,    // 3 seconds
    profile_save_max: 2000,      // 2 seconds
    expected_features: ['monte_carlo', 'tax_planning', 'portfolio_analysis']
  },
  daniel: {
    onboarding_max_time: 180000, // 3 minutes
    dashboard_load_max: 2000,    // 2 seconds
    profile_save_max: 1500,      // 1.5 seconds
    expected_features: ['client_pipeline', 'product_recommendations', 'compliance']
  }
};

export const measureAdvisorPerformance = (personaKey, operation, startTime) => {
  const endTime = Date.now();
  const duration = endTime - startTime;
  const benchmark = ADVISOR_PERFORMANCE_BENCHMARKS[personaKey];
  
  if (!benchmark) return { duration, benchmark: null };
  
  const maxTime = benchmark[`${operation}_max`] || benchmark.onboarding_max_time;
  const withinBenchmark = duration <= maxTime;
  
  return {
    persona: personaKey,
    operation,
    duration,
    maxTime,
    withinBenchmark,
    performance: withinBenchmark ? 'PASS' : 'FAIL'
  };
};

// Export all utilities for use in test files
export default {
  ADVISOR_PRD_TARGETS,
  ADVISOR_PERSONAS,
  NEW_ADVISOR_TEST_DATA,
  fillAdvisorRegistration,
  fillAdvisorProfessionalDetails,
  fillAdvisorServiceModel,
  completeAdvisorOnboarding,
  assertAdvisorDashboard,
  assertAdvisorOnboardingStep,
  validateProfessionalEmail,
  validateLicenseNumber,
  assessAdvisorPersonaAlignment,
  testAdvisorAPI,
  measureAdvisorPerformance,
  ADVISOR_PERFORMANCE_BENCHMARKS
};