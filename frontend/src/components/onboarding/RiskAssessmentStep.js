/**
 * RiskAssessmentStep - Step 2 of onboarding
 * Features:
 * - Real-time risk score calculation
 * - Visual feedback for risk level
 * - Auto-save functionality
 * - Professional questionnaire design
 */
import React, { useState, useEffect } from 'react';
import { useOnboarding } from '../../contexts/OnboardingContext';
import { calculateRiskScore, getRiskLevel } from '../../utils/riskCalculation';

const RiskAssessmentStep = () => {
  const { riskData, updateRiskData, saveStep, saveStatus } = useOnboarding();
  
  // Local state for questionnaire answers
  const [answers, setAnswers] = useState(riskData.questionnaire || []);
  const [calculatedRiskScore, setCalculatedRiskScore] = useState(null);
  const [riskLevel, setRiskLevel] = useState(null);
  
  // Risk assessment questions
  const questions = [
    {
      id: 1,
      text: 'What is your primary investment objective?',
      options: [
        'Capital preservation (keep my money safe)',
        'Income generation (regular returns)',
        'Capital appreciation (grow my money)',
        'Speculation (high risk, high reward)'
      ]
    },
    {
      id: 2,
      text: 'What is your investment time horizon?',
      options: [
        'Less than 1 year',
        '1-3 years',
        '3-5 years',
        'More than 5 years'
      ]
    },
    {
      id: 3,
      text: 'How would you react to a 20% drop in your portfolio value?',
      options: [
        'Sell all investments immediately',
        'Sell some investments to reduce risk',
        'Hold my investments and wait',
        'Buy more investments while prices are low'
      ]
    },
    {
      id: 4,
      text: 'Which best describes your knowledge of investments?',
      options: [
        'None - I am a complete beginner',
        'Limited - I know the basics',
        'Good - I understand most concepts',
        'Extensive - I am very knowledgeable'
      ]
    },
    {
      id: 5,
      text: 'How much of your income are you willing to risk for potentially higher returns?',
      options: [
        'None - I want guaranteed returns',
        'Less than 10% - Very conservative',
        '10-25% - Moderately conservative',
        'More than 25% - Aggressive'
      ]
    }
  ];
  
  // Risk calculation logic moved to shared utility
  
  // Update context and calculate risk when answers change
  useEffect(() => {
    if (answers.length === 5) {
      const score = calculateRiskScore(answers);
      const level = getRiskLevel(score);
      
      setCalculatedRiskScore(score);
      setRiskLevel(level);
      
      updateRiskData({
        questionnaire: answers,
        riskScore: score,
        riskLevel: level.level
      });
    }
  }, [answers]);
  
  // Handle answer selection
  const handleAnswerChange = (questionIndex, optionIndex) => {
    const newAnswers = [...answers];
    newAnswers[questionIndex] = optionIndex + 1; // Convert to 1-4 scale
    setAnswers(newAnswers);
  };
  
  // Manual save
  const handleSaveStep = async () => {
    if (answers.length === 5) {
      const result = await saveStep(2, {
        questionnaire: answers,
        riskScore: calculatedRiskScore,
        riskLevel: riskLevel?.level
      }, true);
      if (result.success) {
        console.log('✅ Risk assessment saved successfully');
      }
    }
  };
  
  // Get progress percentage
  const getProgressPercentage = () => {
    return Math.round((answers.length / 5) * 100);
  };
  
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Risk Assessment</h3>
          <p className="text-sm text-gray-600 mt-1">
            Help us understand your investment preferences and risk tolerance
          </p>
        </div>
        {saveStatus[2] === 'saved' && (
          <div className="flex items-center text-green-600 text-sm">
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Saved automatically
          </div>
        )}
      </div>
      
      {/* Progress indicator */}
      <div className="bg-gray-200 rounded-full h-2">
        <div 
          className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${getProgressPercentage()}%` }}
        ></div>
        <p className="text-sm text-gray-600 mt-2">{answers.length}/5 questions completed</p>
      </div>
      
      {/* Questions */}
      <div className="space-y-8">
        {questions.map((question, questionIndex) => (
          <div key={question.id} className="bg-gray-50 p-4 md:p-6 rounded-lg border border-gray-200">
            <h4 
              className="text-base md:text-lg font-medium text-gray-800 mb-4"
              id={`question-${question.id}-description`}
            >
              Question {question.id}: {question.text}
            </h4>
            
            <div className="space-y-3">
              {question.options.map((option, optionIndex) => (
                <label 
                  key={optionIndex}
                  className="flex items-start cursor-pointer hover:bg-white hover:shadow-sm rounded-md p-4 md:p-3 transition-all min-h-[44px] focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2"
                >
                  <input
                    type="radio"
                    name={`question-${question.id}`}
                    value={optionIndex}
                    checked={answers[questionIndex] === optionIndex + 1}
                    onChange={() => handleAnswerChange(questionIndex, optionIndex)}
                    className="mt-1 mr-3 text-blue-600 focus:ring-blue-500 w-4 h-4"
                    aria-describedby={`question-${question.id}-description`}
                    aria-label={`${option} for question ${question.id}`}
                  />
                  <span className="text-gray-700 flex-1 text-sm md:text-base leading-relaxed">{option}</span>
                  {/* Screen reader support for risk level */}
                  <span className="sr-only">
                    {optionIndex === 0 && 'Low risk option'}
                    {optionIndex === 1 && 'Moderate risk option'}
                    {optionIndex === 2 && 'High risk option'}
                    {optionIndex === 3 && 'Very high risk option'}
                  </span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>
      
      {/* Risk Score Display */}
      {calculatedRiskScore !== null && riskLevel && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h4 className="text-lg font-medium text-gray-800 mb-3">Your Risk Profile</h4>
          
          <div className="flex items-center justify-between mb-4">
            <div>
              <p 
                className="text-2xl font-bold text-gray-800" 
                data-testid="risk-score"
                aria-live="polite"
              >
                {calculatedRiskScore}/100
              </p>
              <p className="text-sm text-gray-600">Risk Score</p>
            </div>
            
            <div className="text-right">
              <p className={`text-lg font-semibold ${riskLevel.textClass}`}>
                {riskLevel.level} Risk
              </p>
              <p className="text-sm text-gray-600">{riskLevel.description}</p>
            </div>
          </div>
          
          {/* Risk score bar */}
          <div className="bg-gray-200 rounded-full h-3 mb-4">
            <div 
              className={`${riskLevel.bgClass} h-3 rounded-full transition-all duration-500 ease-out`}
              style={{ width: `${calculatedRiskScore}%` }}
            ></div>
          </div>
          
          {/* Risk level explanation */}
          <div className="text-sm text-gray-700">
            <p className="font-medium mb-2">What this means:</p>
            <ul className="list-disc list-inside space-y-1">
              {riskLevel.recommendations.map((recommendation, index) => (
                <li key={index}>{recommendation}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
      
      {/* Manual Save Button */}
      {answers.length === 5 && (
        <div className="flex justify-end">
          <button
            onClick={handleSaveStep}
            disabled={saveStatus[2] === 'saving'}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {saveStatus[2] === 'saving' ? 'Saving...' : 'Save Risk Assessment'}
          </button>
        </div>
      )}
      
      {/* Instructions */}
      <div className="text-sm text-gray-500 bg-gray-50 p-4 rounded-lg">
        <p className="font-medium mb-2">How this works:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>Answer all 5 questions honestly based on your current situation</li>
          <li>Your risk score is calculated automatically as you answer</li>
          <li>This helps us recommend suitable investment options for you</li>
          <li>You can always update your risk profile later in your settings</li>
        </ul>
      </div>
    </div>
  );
};

export default RiskAssessmentStep;