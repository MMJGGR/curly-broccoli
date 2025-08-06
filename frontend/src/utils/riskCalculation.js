/**
 * Shared Risk Calculation Utilities
 * Consolidates risk scoring logic to eliminate duplication
 */

/**
 * Calculate risk score from questionnaire responses
 * @param {number[]} questionnaire - Array of 5 answers (1-4 scale)
 * @returns {number|null} Risk score (0-100) or null if invalid
 */
export const calculateRiskScore = (questionnaire) => {
  if (!questionnaire || questionnaire.length !== 5) return null;
  
  const weights = [25, 20, 30, 15, 10]; // Different weights for each question
  let totalScore = 0;
  
  questionnaire.forEach((answer, index) => {
    const normalizedAnswer = (answer - 1) / 3; // Convert 1-4 to 0-1
    totalScore += normalizedAnswer * weights[index];
  });
  
  return Math.round(totalScore);
};

/**
 * Get risk level from score with descriptive information
 * @param {number} score - Risk score (0-100)
 * @returns {Object} Risk level information with styling classes
 */
export const getRiskLevel = (score) => {
  if (score < 20) return { 
    level: 'Very Low', 
    numeric: 1,
    color: 'green', 
    textClass: 'text-green-600',
    bgClass: 'bg-green-500',
    description: 'Conservative investor',
    recommendations: [
      'You prefer stable, predictable returns',
      'Suitable for government bonds and fixed deposits', 
      'Lower potential returns but minimal risk of loss'
    ]
  };
  
  if (score < 40) return { 
    level: 'Low', 
    numeric: 2,
    color: 'blue', 
    textClass: 'text-blue-600',
    bgClass: 'bg-blue-500',
    description: 'Cautious investor',
    recommendations: [
      'You prefer some stability with modest growth',
      'Suitable for conservative mutual funds and bonds',
      'Moderate returns with low risk tolerance'
    ]
  };
  
  if (score < 60) return { 
    level: 'Medium', 
    numeric: 3,
    color: 'yellow', 
    textClass: 'text-yellow-600',
    bgClass: 'bg-yellow-500',
    description: 'Balanced investor',
    recommendations: [
      'You\'re comfortable with balanced risk and return',
      'Suitable for diversified portfolios and balanced funds',
      'Good growth potential with manageable risk'
    ]
  };
  
  if (score < 80) return { 
    level: 'High', 
    numeric: 4,
    color: 'orange', 
    textClass: 'text-orange-600',
    bgClass: 'bg-orange-500',
    description: 'Aggressive investor',
    recommendations: [
      'You\'re willing to take risks for higher returns',
      'Suitable for growth stocks and equity funds',
      'High growth potential but more volatile'
    ]
  };
  
  return { 
    level: 'Very High', 
    numeric: 5,
    color: 'red', 
    textClass: 'text-red-600',
    bgClass: 'bg-red-500',
    description: 'Speculative investor',
    recommendations: [
      'You\'re comfortable with significant volatility',
      'Suitable for speculative investments and startups',
      'Highest growth potential but substantial risk'
    ]
  };
};

/**
 * Validate questionnaire responses
 * @param {number[]} questionnaire - Array of answers
 * @returns {boolean} True if valid
 */
export const validateQuestionnaire = (questionnaire) => {
  return Array.isArray(questionnaire) && 
         questionnaire.length === 5 && 
         questionnaire.every(answer => 
           Number.isInteger(answer) && answer >= 1 && answer <= 4
         );
};

/**
 * Get risk tolerance description for API compatibility
 * @param {number} score - Risk score (0-100)
 * @returns {string} Risk level string
 */
export const getRiskLevelString = (score) => {
  const riskLevel = getRiskLevel(score);
  return riskLevel.level;
};

/**
 * Get numeric risk level for API compatibility
 * @param {number} score - Risk score (0-100) 
 * @returns {number} Numeric risk level (1-5)
 */
export const getRiskLevelNumeric = (score) => {
  const riskLevel = getRiskLevel(score);
  return riskLevel.numeric;
};