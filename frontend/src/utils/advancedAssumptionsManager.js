/**
 * Advanced Assumptions Save Strategy for Kenya Financial Planning
 * Hybrid auto-save + "Save as My Defaults" approach with CFA compliance
 */

import { KENYA_MARKET_DATA } from './kenyaReturnRiskModels';

// Default assumption sets for different user profiles
export const DEFAULT_ASSUMPTION_PROFILES = {
  conservative_young_professional: {
    label: "Conservative Young Professional",
    description: "Risk-averse individual in early career (25-35 years)",
    assumptions: {
      demographics: {
        lifeExpectancy: 75,
        retirementAge: 65,
        healthAdjustment: 2,
        dependents: 1
      },
      economic: {
        gdpGrowthRate: 5.0, // Conservative GDP estimate
        inflationVolatility: 0.12,
        currencyStabilityFactor: 0.90
      },
      career: {
        incomeProgressionRate: 0.04, // 4% annual increases
        jobChangeFrequency: 5, // Every 5 years
        industryStabilityScore: 0.85
      },
      lifestyle: {
        lifestyleInflationRate: 0.02,
        discretionarySpendingGrowth: 0.025,
        familySizeGrowthFactor: 1.2 // Expecting family growth
      },
      investment: {
        riskTolerance: 'conservative',
        liquidityPreference: 0.30, // 30% in liquid assets
        domesticBias: 0.80, // 80% domestic investments
        realEstateAllocation: 0.15
      },
      rates: {
        incomeDiscountRate: 11.0, // Conservative discount rate
        expenseDiscountRate: 9.5,
        incomeGrowthRate: 3.5,
        expenseInflationRate: 5.0
      }
    }
  },

  moderate_mid_career: {
    label: "Moderate Mid-Career Professional",
    description: "Balanced approach for established professionals (35-50 years)",
    assumptions: {
      demographics: {
        lifeExpectancy: 73,
        retirementAge: 63,
        healthAdjustment: 1,
        dependents: 2
      },
      economic: {
        gdpGrowthRate: 5.5,
        inflationVolatility: 0.15,
        currencyStabilityFactor: 0.85
      },
      career: {
        incomeProgressionRate: 0.05,
        jobChangeFrequency: 7,
        industryStabilityScore: 0.80
      },
      lifestyle: {
        lifestyleInflationRate: 0.025,
        discretionarySpendingGrowth: 0.035,
        familySizeGrowthFactor: 1.0 // Stable family size
      },
      investment: {
        riskTolerance: 'moderate',
        liquidityPreference: 0.25,
        domesticBias: 0.70,
        realEstateAllocation: 0.25
      },
      rates: {
        incomeDiscountRate: 12.5,
        expenseDiscountRate: 10.5,
        incomeGrowthRate: 3.0,
        expenseInflationRate: 5.5
      }
    }
  },

  aggressive_high_earner: {
    label: "Aggressive High Earner",
    description: "Growth-focused approach for high-income professionals",
    assumptions: {
      demographics: {
        lifeExpectancy: 76,
        retirementAge: 60,
        healthAdjustment: 3,
        dependents: 2
      },
      economic: {
        gdpGrowthRate: 6.0,
        inflationVolatility: 0.18,
        currencyStabilityFactor: 0.82
      },
      career: {
        incomeProgressionRate: 0.065,
        jobChangeFrequency: 4,
        industryStabilityScore: 0.75
      },
      lifestyle: {
        lifestyleInflationRate: 0.03,
        discretionarySpendingGrowth: 0.045,
        familySizeGrowthFactor: 0.9
      },
      investment: {
        riskTolerance: 'aggressive',
        liquidityPreference: 0.15,
        domesticBias: 0.60,
        realEstateAllocation: 0.35
      },
      rates: {
        incomeDiscountRate: 14.0,
        expenseDiscountRate: 11.5,
        incomeGrowthRate: 4.0,
        expenseInflationRate: 6.0
      }
    }
  },

  pre_retirement_conservative: {
    label: "Pre-Retirement Conservative",
    description: "Capital preservation focus for those nearing retirement (50+ years)",
    assumptions: {
      demographics: {
        lifeExpectancy: 72,
        retirementAge: 65,
        healthAdjustment: 0,
        dependents: 1
      },
      economic: {
        gdpGrowthRate: 4.5,
        inflationVolatility: 0.10,
        currencyStabilityFactor: 0.92
      },
      career: {
        incomeProgressionRate: 0.025,
        jobChangeFrequency: 10,
        industryStabilityScore: 0.90
      },
      lifestyle: {
        lifestyleInflationRate: 0.015,
        discretionarySpendingGrowth: 0.02,
        familySizeGrowthFactor: 0.8
      },
      investment: {
        riskTolerance: 'conservative',
        liquidityPreference: 0.40,
        domesticBias: 0.85,
        realEstateAllocation: 0.20
      },
      rates: {
        incomeDiscountRate: 10.5,
        expenseDiscountRate: 9.0,
        incomeGrowthRate: 2.5,
        expenseInflationRate: 4.5
      }
    }
  }
};

/**
 * Advanced Assumptions Manager Class
 * Handles auto-save, user defaults, and assumption persistence
 */
class AdvancedAssumptionsManager {
  constructor() {
    this.autoSaveEnabled = true;
    this.autoSaveInterval = 30000; // 30 seconds
    this.autoSaveTimer = null;
    this.sessionAssumptions = {};
    this.userDefaults = this.loadUserDefaults();
    this.pendingChanges = new Set();
    
    // Bind methods
    this.autoSave = this.autoSave.bind(this);
    this.startAutoSave = this.startAutoSave.bind(this);
    this.stopAutoSave = this.stopAutoSave.bind(this);
  }

  /**
   * Initialize assumptions manager
   * @param {object} initialAssumptions - Starting assumptions
   * @param {boolean} enableAutoSave - Whether to enable auto-save
   */
  initialize(initialAssumptions = {}, enableAutoSave = true) {
    // Merge with user defaults or system defaults
    const baseAssumptions = this.userDefaults || 
      DEFAULT_ASSUMPTION_PROFILES.moderate_mid_career.assumptions;
    
    this.sessionAssumptions = this.deepMerge(baseAssumptions, initialAssumptions);
    this.autoSaveEnabled = enableAutoSave;
    
    if (enableAutoSave) {
      this.startAutoSave();
    }

    // Validate assumptions on initialization
    this.validateAssumptions(this.sessionAssumptions);
    
    return this.sessionAssumptions;
  }

  /**
   * Update assumptions with automatic validation and conflict detection
   * @param {object} updates - Partial assumption updates
   * @param {boolean} triggerAutoSave - Whether to trigger auto-save
   */
  updateAssumptions(updates, triggerAutoSave = true) {
    const oldAssumptions = { ...this.sessionAssumptions };
    
    try {
      // Deep merge updates
      this.sessionAssumptions = this.deepMerge(this.sessionAssumptions, updates);
      
      // Validate updated assumptions
      const validationResult = this.validateAssumptions(this.sessionAssumptions);
      if (!validationResult.isValid) {
        throw new Error(`Assumption validation failed: ${validationResult.errors.join(', ')}`);
      }

      // Check for conflicts and auto-resolve
      const conflicts = this.detectConflicts(oldAssumptions, this.sessionAssumptions);
      if (conflicts.length > 0) {
        this.sessionAssumptions = this.resolveConflicts(this.sessionAssumptions, conflicts);
      }

      // Track pending changes
      Object.keys(updates).forEach(key => this.pendingChanges.add(key));
      
      // Trigger auto-save if enabled
      if (triggerAutoSave && this.autoSaveEnabled) {
        this.scheduleAutoSave();
      }

      return {
        success: true,
        assumptions: this.sessionAssumptions,
        conflicts: conflicts,
        warnings: validationResult.warnings || []
      };
      
    } catch (error) {
      // Revert on error
      this.sessionAssumptions = oldAssumptions;
      
      return {
        success: false,
        error: error.message,
        assumptions: this.sessionAssumptions
      };
    }
  }

  /**
   * Save current assumptions as user defaults
   * @param {string} profileName - Optional name for the profile
   */
  async saveAsDefaults(profileName = null) {
    try {
      const token = localStorage.getItem('jwt');
      
      const payload = {
        profileName: profileName || 'My Custom Defaults',
        assumptions: this.sessionAssumptions,
        createdAt: new Date().toISOString(),
        version: '1.0'
      };

      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/v1/user-assumptions/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error('Failed to save user defaults');
      }

      // Update local cache
      this.userDefaults = this.sessionAssumptions;
      this.saveUserDefaults();

      // Clear pending changes
      this.pendingChanges.clear();

      return {
        success: true,
        message: 'Assumptions saved as your defaults',
        profileName: profileName
      };

    } catch (error) {
      console.error('Error saving user defaults:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Load predefined assumption profile
   * @param {string} profileKey - Key from DEFAULT_ASSUMPTION_PROFILES
   */
  loadProfile(profileKey) {
    const profile = DEFAULT_ASSUMPTION_PROFILES[profileKey];
    if (!profile) {
      throw new Error(`Unknown profile: ${profileKey}`);
    }

    const oldAssumptions = this.sessionAssumptions;
    this.sessionAssumptions = { ...profile.assumptions };
    
    // Mark all as pending changes
    Object.keys(profile.assumptions).forEach(key => this.pendingChanges.add(key));
    
    if (this.autoSaveEnabled) {
      this.scheduleAutoSave();
    }

    return {
      success: true,
      profile: profile,
      assumptions: this.sessionAssumptions,
      changesFromPrevious: this.calculateChanges(oldAssumptions, this.sessionAssumptions)
    };
  }

  /**
   * Auto-save functionality (saves to session storage)
   */
  autoSave() {
    if (this.pendingChanges.size === 0) return;

    try {
      // Save to session storage for immediate recovery
      sessionStorage.setItem('financial_assumptions_session', JSON.stringify({
        assumptions: this.sessionAssumptions,
        timestamp: Date.now(),
        pendingChanges: Array.from(this.pendingChanges)
      }));

      console.log(`Auto-saved ${this.pendingChanges.size} assumption changes`);
      
      // Optionally, save to server in background (non-blocking)
      this.backgroundSyncToServer();
      
    } catch (error) {
      console.warn('Auto-save failed:', error);
    }
  }

  /**
   * Background sync to server (non-blocking)
   */
  async backgroundSyncToServer() {
    try {
      const token = localStorage.getItem('jwt');
      if (!token) return; // User not logged in

      await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/v1/user-assumptions/session`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionAssumptions: this.sessionAssumptions,
          timestamp: Date.now()
        })
      });

    } catch (error) {
      // Fail silently for background sync
      console.debug('Background sync failed:', error);
    }
  }

  /**
   * Schedule auto-save (debounced)
   */
  scheduleAutoSave() {
    if (this.autoSaveTimer) {
      clearTimeout(this.autoSaveTimer);
    }
    
    this.autoSaveTimer = setTimeout(this.autoSave, this.autoSaveInterval);
  }

  /**
   * Start auto-save timer
   */
  startAutoSave() {
    if (this.autoSaveEnabled && !this.autoSaveTimer) {
      this.scheduleAutoSave();
    }
  }

  /**
   * Stop auto-save timer
   */
  stopAutoSave() {
    if (this.autoSaveTimer) {
      clearTimeout(this.autoSaveTimer);
      this.autoSaveTimer = null;
    }
  }

  /**
   * Validate assumptions against CFA standards and Kenya market reality
   */
  validateAssumptions(assumptions) {
    const errors = [];
    const warnings = [];

    // Demographics validation
    if (assumptions.demographics) {
      const { lifeExpectancy, retirementAge } = assumptions.demographics;
      
      if (lifeExpectancy < 60 || lifeExpectancy > 85) {
        warnings.push(`Life expectancy ${lifeExpectancy} is outside typical Kenya range (65-75)`);
      }
      
      if (retirementAge < 55 || retirementAge > 70) {
        warnings.push(`Retirement age ${retirementAge} is outside typical Kenya range (60-65)`);
      }
      
      if (retirementAge >= lifeExpectancy) {
        errors.push('Retirement age cannot be greater than or equal to life expectancy');
      }
    }

    // Economic assumptions validation
    if (assumptions.economic) {
      const { gdpGrowthRate, inflationVolatility } = assumptions.economic;
      
      if (gdpGrowthRate < 0.02 || gdpGrowthRate > 0.12) {
        warnings.push(`GDP growth rate ${(gdpGrowthRate * 100).toFixed(1)}% is outside reasonable range (2-12%)`);
      }
      
      if (inflationVolatility > 0.30) {
        warnings.push(`Inflation volatility ${(inflationVolatility * 100).toFixed(1)}% seems excessive`);
      }
    }

    // Rates validation against Kenya market
    if (assumptions.rates) {
      const { incomeDiscountRate, expenseDiscountRate } = assumptions.rates;
      const marketRate = KENYA_MARKET_DATA.riskFreeRate;
      
      if (incomeDiscountRate < marketRate * 0.8) {
        warnings.push(`Income discount rate ${incomeDiscountRate}% seems low vs. market rate ${(marketRate * 100).toFixed(1)}%`);
      }
      
      if (expenseDiscountRate > incomeDiscountRate) {
        errors.push('Expense discount rate cannot be higher than income discount rate');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Detect conflicts between assumption changes
   */
  detectConflicts(oldAssumptions, newAssumptions) {
    const conflicts = [];

    // Check for demographic conflicts
    if (newAssumptions.demographics && oldAssumptions.demographics) {
      const newDemo = newAssumptions.demographics;
      
      // Retirement age vs life expectancy conflict
      if (newDemo.retirementAge >= newDemo.lifeExpectancy) {
        conflicts.push({
          type: 'demographic_conflict',
          message: 'Retirement age conflicts with life expectancy',
          affected: ['demographics.retirementAge', 'demographics.lifeExpectancy'],
          suggestion: 'Adjust retirement age to be at least 5 years before life expectancy'
        });
      }
    }

    // Check for rate conflicts
    if (newAssumptions.rates && oldAssumptions.rates) {
      const newRates = newAssumptions.rates;
      
      if (newRates.expenseDiscountRate > newRates.incomeDiscountRate) {
        conflicts.push({
          type: 'rate_conflict',
          message: 'Expense discount rate exceeds income discount rate',
          affected: ['rates.expenseDiscountRate', 'rates.incomeDiscountRate'],
          suggestion: 'Expense rates should typically be lower than income rates'
        });
      }
    }

    return conflicts;
  }

  /**
   * Auto-resolve conflicts using CFA-compliant logic
   */
  resolveConflicts(assumptions, conflicts) {
    const resolved = { ...assumptions };

    conflicts.forEach(conflict => {
      switch (conflict.type) {
        case 'demographic_conflict':
          // Auto-adjust retirement age to be 5 years before life expectancy
          if (resolved.demographics.retirementAge >= resolved.demographics.lifeExpectancy) {
            resolved.demographics.retirementAge = Math.max(55, resolved.demographics.lifeExpectancy - 5);
          }
          break;
          
        case 'rate_conflict':
          // Auto-adjust expense rate to be 1% lower than income rate
          if (resolved.rates.expenseDiscountRate >= resolved.rates.incomeDiscountRate) {
            resolved.rates.expenseDiscountRate = Math.max(8.0, resolved.rates.incomeDiscountRate - 1.0);
          }
          break;
        default:
          break;
      }
    });

    return resolved;
  }

  /**
   * Calculate changes between assumption sets
   */
  calculateChanges(oldAssumptions, newAssumptions) {
    const changes = [];
    
    const compareObjects = (oldObj, newObj, prefix = '') => {
      Object.keys(newObj).forEach(key => {
        const fullKey = prefix ? `${prefix}.${key}` : key;
        
        if (typeof newObj[key] === 'object' && newObj[key] !== null && !Array.isArray(newObj[key])) {
          compareObjects(oldObj[key] || {}, newObj[key], fullKey);
        } else if (oldObj[key] !== newObj[key]) {
          changes.push({
            field: fullKey,
            oldValue: oldObj[key],
            newValue: newObj[key],
            type: typeof newObj[key]
          });
        }
      });
    };
    
    compareObjects(oldAssumptions, newAssumptions);
    return changes;
  }

  /**
   * Deep merge objects
   */
  deepMerge(target, source) {
    const result = { ...target };
    
    Object.keys(source).forEach(key => {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        result[key] = this.deepMerge(target[key] || {}, source[key]);
      } else {
        result[key] = source[key];
      }
    });
    
    return result;
  }

  /**
   * Load user defaults from localStorage
   */
  loadUserDefaults() {
    try {
      const stored = localStorage.getItem('user_financial_defaults');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }

  /**
   * Save user defaults to localStorage
   */
  saveUserDefaults() {
    try {
      localStorage.setItem('user_financial_defaults', JSON.stringify(this.userDefaults));
    } catch (error) {
      console.warn('Failed to save user defaults to localStorage:', error);
    }
  }

  /**
   * Get current assumptions
   */
  getCurrentAssumptions() {
    return { ...this.sessionAssumptions };
  }

  /**
   * Check if there are pending changes
   */
  hasPendingChanges() {
    return this.pendingChanges.size > 0;
  }

  /**
   * Get available profiles
   */
  getAvailableProfiles() {
    return Object.keys(DEFAULT_ASSUMPTION_PROFILES).map(key => ({
      key,
      ...DEFAULT_ASSUMPTION_PROFILES[key]
    }));
  }

  /**
   * Restore from session storage (for page refresh recovery)
   */
  restoreFromSession() {
    try {
      const stored = sessionStorage.getItem('financial_assumptions_session');
      if (stored) {
        const { assumptions, timestamp, pendingChanges } = JSON.parse(stored);
        
        // Only restore if less than 1 hour old
        if (Date.now() - timestamp < 3600000) {
          this.sessionAssumptions = assumptions;
          this.pendingChanges = new Set(pendingChanges || []);
          return true;
        }
      }
    } catch (error) {
      console.warn('Failed to restore from session:', error);
    }
    
    return false;
  }

  /**
   * Clean up resources
   */
  cleanup() {
    this.stopAutoSave();
    
    // Final auto-save
    if (this.pendingChanges.size > 0) {
      this.autoSave();
    }
  }
}

// Export singleton instance
export const assumptionsManager = new AdvancedAssumptionsManager();

const advancedAssumptionsExports = {
  AdvancedAssumptionsManager,
  assumptionsManager,
  DEFAULT_ASSUMPTION_PROFILES
};

export default advancedAssumptionsExports;
