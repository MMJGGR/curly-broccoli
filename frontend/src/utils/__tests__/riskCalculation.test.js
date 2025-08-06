/**
 * Risk Calculation Utility Tests
 * Tests the shared risk calculation logic to ensure consistency
 */
import { 
  calculateRiskScore, 
  getRiskLevel, 
  validateQuestionnaire,
  getRiskLevelString,
  getRiskLevelNumeric 
} from '../riskCalculation';

describe('Risk Calculation Utilities', () => {
  describe('calculateRiskScore', () => {
    it('should calculate correct risk score for conservative answers', () => {
      const conservativeAnswers = [1, 1, 1, 1, 1];
      const score = calculateRiskScore(conservativeAnswers);
      expect(score).toBe(0);
    });

    it('should calculate correct risk score for aggressive answers', () => {
      const aggressiveAnswers = [4, 4, 4, 4, 4];
      const score = calculateRiskScore(aggressiveAnswers);
      expect(score).toBe(100);
    });

    it('should calculate correct risk score for mixed answers', () => {
      const mixedAnswers = [3, 2, 4, 3, 2];
      const score = calculateRiskScore(mixedAnswers);
      expect(score).toBeGreaterThan(40);
      expect(score).toBeLessThan(80);
    });

    it('should return null for invalid questionnaire length', () => {
      expect(calculateRiskScore([1, 2, 3])).toBeNull();
      expect(calculateRiskScore([1, 2, 3, 4, 5, 6])).toBeNull();
      expect(calculateRiskScore([])).toBeNull();
    });

    it('should return null for null or undefined input', () => {
      expect(calculateRiskScore(null)).toBeNull();
      expect(calculateRiskScore(undefined)).toBeNull();
    });

    it('should handle edge cases with proper weighting', () => {
      // Question 3 has highest weight (30), so should have most impact
      const highQuestion3 = [1, 1, 4, 1, 1];
      const lowQuestion3 = [1, 1, 1, 1, 1];
      
      const highScore = calculateRiskScore(highQuestion3);
      const lowScore = calculateRiskScore(lowQuestion3);
      
      expect(highScore).toBeGreaterThan(lowScore);
      expect(highScore - lowScore).toBeGreaterThan(25); // Should be significant difference
    });
  });

  describe('getRiskLevel', () => {
    it('should return Very Low for scores < 20', () => {
      const level = getRiskLevel(10);
      expect(level.level).toBe('Very Low');
      expect(level.numeric).toBe(1);
      expect(level.textClass).toBe('text-green-600');
      expect(level.bgClass).toBe('bg-green-500');
      expect(level.description).toBe('Conservative investor');
    });

    it('should return Low for scores 20-39', () => {
      const level = getRiskLevel(30);
      expect(level.level).toBe('Low');
      expect(level.numeric).toBe(2);
      expect(level.textClass).toBe('text-blue-600');
      expect(level.bgClass).toBe('bg-blue-500');
    });

    it('should return Medium for scores 40-59', () => {
      const level = getRiskLevel(50);
      expect(level.level).toBe('Medium');
      expect(level.numeric).toBe(3);
      expect(level.textClass).toBe('text-yellow-600');
      expect(level.bgClass).toBe('bg-yellow-500');
    });

    it('should return High for scores 60-79', () => {
      const level = getRiskLevel(70);
      expect(level.level).toBe('High');
      expect(level.numeric).toBe(4);
      expect(level.textClass).toBe('text-orange-600');
      expect(level.bgClass).toBe('bg-orange-500');
    });

    it('should return Very High for scores >= 80', () => {
      const level = getRiskLevel(90);
      expect(level.level).toBe('Very High');
      expect(level.numeric).toBe(5);
      expect(level.textClass).toBe('text-red-600');
      expect(level.bgClass).toBe('bg-red-500');
    });

    it('should include recommendations for each level', () => {
      const levels = [10, 30, 50, 70, 90];
      levels.forEach(score => {
        const level = getRiskLevel(score);
        expect(level.recommendations).toBeInstanceOf(Array);
        expect(level.recommendations.length).toBeGreaterThan(0);
        level.recommendations.forEach(rec => {
          expect(typeof rec).toBe('string');
          expect(rec.length).toBeGreaterThan(0);
        });
      });
    });

    it('should handle boundary conditions correctly', () => {
      expect(getRiskLevel(19).level).toBe('Very Low');
      expect(getRiskLevel(20).level).toBe('Low');
      expect(getRiskLevel(39).level).toBe('Low');
      expect(getRiskLevel(40).level).toBe('Medium');
      expect(getRiskLevel(59).level).toBe('Medium');
      expect(getRiskLevel(60).level).toBe('High');
      expect(getRiskLevel(79).level).toBe('High');
      expect(getRiskLevel(80).level).toBe('Very High');
    });
  });

  describe('validateQuestionnaire', () => {
    it('should validate correct questionnaire format', () => {
      expect(validateQuestionnaire([1, 2, 3, 4, 1])).toBe(true);
      expect(validateQuestionnaire([4, 4, 4, 4, 4])).toBe(true);
      expect(validateQuestionnaire([1, 1, 1, 1, 1])).toBe(true);
    });

    it('should reject invalid questionnaire formats', () => {
      expect(validateQuestionnaire([1, 2, 3])).toBe(false); // Too short
      expect(validateQuestionnaire([1, 2, 3, 4, 5, 6])).toBe(false); // Too long
      expect(validateQuestionnaire([])).toBe(false); // Empty
      expect(validateQuestionnaire([0, 1, 2, 3, 4])).toBe(false); // Invalid values
      expect(validateQuestionnaire([1, 2, 3, 4, 5])).toBe(false); // Invalid values
      expect(validateQuestionnaire([1.5, 2, 3, 4, 1])).toBe(false); // Non-integers
      expect(validateQuestionnaire(['1', 2, 3, 4, 1])).toBe(false); // String values
      expect(validateQuestionnaire(null)).toBe(false); // Null
      expect(validateQuestionnaire(undefined)).toBe(false); // Undefined
    });
  });

  describe('API Compatibility Functions', () => {
    it('should return correct string for getRiskLevelString', () => {
      expect(getRiskLevelString(10)).toBe('Very Low');
      expect(getRiskLevelString(30)).toBe('Low');
      expect(getRiskLevelString(50)).toBe('Medium');
      expect(getRiskLevelString(70)).toBe('High');
      expect(getRiskLevelString(90)).toBe('Very High');
    });

    it('should return correct numeric for getRiskLevelNumeric', () => {
      expect(getRiskLevelNumeric(10)).toBe(1);
      expect(getRiskLevelNumeric(30)).toBe(2);
      expect(getRiskLevelNumeric(50)).toBe(3);
      expect(getRiskLevelNumeric(70)).toBe(4);
      expect(getRiskLevelNumeric(90)).toBe(5);
    });
  });

  describe('Integration Tests', () => {
    it('should produce consistent results between calculation and level mapping', () => {
      const testCases = [
        { answers: [1, 1, 1, 1, 1], expectedLevel: 'Very Low' },
        { answers: [2, 2, 2, 2, 2], expectedLevel: 'Low' },
        { answers: [3, 3, 3, 3, 3], expectedLevel: 'Medium' },
        { answers: [4, 3, 4, 3, 4], expectedLevel: 'High' },
        { answers: [4, 4, 4, 4, 4], expectedLevel: 'Very High' }
      ];

      testCases.forEach(testCase => {
        const score = calculateRiskScore(testCase.answers);
        const level = getRiskLevel(score);
        expect(level.level).toBe(testCase.expectedLevel);
      });
    });

    it('should maintain consistency between string and numeric level representations', () => {
      const scores = [5, 25, 45, 65, 85];
      scores.forEach(score => {
        const levelObj = getRiskLevel(score);
        const levelString = getRiskLevelString(score);
        const levelNumeric = getRiskLevelNumeric(score);

        expect(levelObj.level).toBe(levelString);
        expect(levelObj.numeric).toBe(levelNumeric);
      });
    });
  });

  describe('Performance Tests', () => {
    it('should calculate risk scores quickly for multiple inputs', () => {
      const startTime = Date.now();
      
      // Calculate 1000 risk scores
      for (let i = 0; i < 1000; i++) {
        const randomAnswers = Array.from({ length: 5 }, () => Math.floor(Math.random() * 4) + 1);
        calculateRiskScore(randomAnswers);
      }
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      expect(duration).toBeLessThan(100); // Should complete in under 100ms
    });
  });
});