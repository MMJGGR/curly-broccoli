/**
 * Alignment Dashboard - Alignment score insights and recommendations
 * Displays daily alignment score with trend analysis and persona-specific recommendations
 */
import React, { useState, useEffect } from 'react';
import { useTimeline } from '../../contexts/TimelineContext';

const AlignmentDashboard = () => {
  const {
    alignmentScore,
    alignmentTrend,
    alignmentStatus,
    personaTheme,
    loading,
    error,
    loadAlignmentDetails
  } = useTimeline();

  const [selectedPeriod, setSelectedPeriod] = useState('week');

  // Load alignment details on mount
  useEffect(() => {
    loadAlignmentDetails();
  }, [loadAlignmentDetails]);

  // Loading state
  if (loading) {
    return (
      <div className="alignment-dashboard p-4 h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3"></div>
          <p className="text-gray-600 text-sm">Loading alignment data...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="alignment-dashboard p-4 h-full flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-3">
            <svg className="h-8 w-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-gray-600 text-sm">Unable to load alignment data</p>
          <button
            onClick={loadAlignmentDetails}
            className="mt-2 px-3 py-1 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="alignment-dashboard p-4 h-full overflow-y-auto">
      
      {/* Current Alignment Score */}
      <div className="alignment-score-card mb-6">
        <div className="text-center">
          <div 
            className="text-4xl font-bold mb-2"
            style={{ color: personaTheme?.primary || '#2563eb' }}
          >
            {alignmentScore ? Math.round(alignmentScore) : '--'}%
          </div>
          <div className="text-sm text-gray-600 mb-1">Daily Alignment Score</div>
          
          {/* Trend indicator */}
          {alignmentTrend && (
            <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
              alignmentTrend === 'improving' ? 'bg-green-100 text-green-800' :
              alignmentTrend === 'declining' ? 'bg-red-100 text-red-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {alignmentTrend === 'improving' && '↗️'}
              {alignmentTrend === 'declining' && '↘️'}
              {alignmentTrend === 'stable' && '➡️'}
              <span className="ml-1 capitalize">{alignmentTrend}</span>
            </div>
          )}
        </div>
      </div>

      {/* Alignment Status */}
      {alignmentStatus && (
        <div className="alignment-status mb-6">
          <h4 className="font-medium text-gray-800 mb-3">Current Status</h4>
          <div 
            className="p-4 rounded-lg border-l-4"
            style={{ 
              backgroundColor: personaTheme?.secondary || '#dbeafe',
              borderLeftColor: personaTheme?.primary || '#2563eb'
            }}
          >
            <div className="font-medium text-gray-800 mb-1">
              {getStatusTitle(alignmentScore)}
            </div>
            <div className="text-sm text-gray-600">
              {getStatusDescription(alignmentScore)}
            </div>
          </div>
        </div>
      )}

      {/* Period Toggle */}
      <div className="period-toggle mb-4">
        <div className="flex bg-gray-100 rounded-lg p-1">
          {['week', 'month', 'quarter'].map((period) => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              className={`flex-1 py-2 px-3 text-sm rounded-md transition-colors ${
                selectedPeriod === period 
                  ? 'bg-white text-blue-700 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              {period === 'week' && 'This Week'}
              {period === 'month' && 'This Month'}
              {period === 'quarter' && 'This Quarter'}
            </button>
          ))}
        </div>
      </div>

      {/* Alignment Insights */}
      <div className="alignment-insights mb-6">
        <h4 className="font-medium text-gray-800 mb-3">Key Insights</h4>
        <div className="space-y-3">
          {getAlignmentInsights(alignmentScore, selectedPeriod).map((insight, index) => (
            <div key={index} className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="flex items-start space-x-3">
                <div className="text-2xl">{insight.icon}</div>
                <div>
                  <div className="font-medium text-gray-800 mb-1">{insight.title}</div>
                  <div className="text-sm text-gray-600">{insight.description}</div>
                  {insight.impact && (
                    <div className="mt-2">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        insight.impact === 'high' ? 'bg-red-100 text-red-800' :
                        insight.impact === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {insight.impact} impact
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recommendations */}
      <div className="recommendations">
        <h4 className="font-medium text-gray-800 mb-3">Recommendations</h4>
        <div className="space-y-2">
          {getPersonaRecommendations(alignmentScore).map((recommendation, index) => (
            <div key={index} className="bg-blue-50 p-3 rounded-lg">
              <div className="flex items-start space-x-3">
                <div className="text-blue-600 mt-0.5">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div className="text-sm text-blue-800">{recommendation}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

// Helper functions
const getStatusTitle = (score) => {
  if (score >= 80) return "Excellent Alignment";
  if (score >= 60) return "Good Progress";
  if (score >= 40) return "Building Momentum";
  return "Getting Started";
};

const getStatusDescription = (score) => {
  const descriptions = {
    'Jamal': {
      high: "Your investment strategy is perfectly aligned with your goals. Keep up the great work!",
      medium: "You're making solid progress towards your investment objectives.",
      low: "Focus on building your investment foundation step by step."
    },
    'Aisha': {
      high: "Your family financial plan is on track. All major goals are progressing well.",
      medium: "Good balance between family needs and long-term planning.",
      low: "Consider prioritizing your family's most important financial goals."
    },
    'Samuel': {
      high: "Your retirement planning is excellent. You're well-positioned for your goals.",
      medium: "Steady progress towards retirement security.",
      low: "Focus on consistent retirement contributions and debt reduction."
    }
  };

  const level = score >= 70 ? 'high' : score >= 40 ? 'medium' : 'low';
  return descriptions['Jamal']?.[level] || "Keep working towards your financial goals with consistent actions.";
};

const getAlignmentInsights = (score, period) => {
  // Mock insights - in real implementation, these would come from API
  const baseInsights = [
    {
      icon: '💰',
      title: 'Savings Rate',
      description: `Your savings rate this ${period} is above your target`,
      impact: 'high'
    },
    {
      icon: '📈',
      title: 'Investment Growth',
      description: 'Portfolio performance is meeting expectations',
      impact: 'medium'
    },
    {
      icon: '🎯',
      title: 'Goal Progress',
      description: 'On track to meet your next milestone',
      impact: 'low'
    }
  ];

  return baseInsights;
};

const getPersonaRecommendations = (score) => {
  const recommendations = {
    'Jamal': [
      "Consider increasing your investment allocation by 5%",
      "Review your portfolio diversification quarterly",
      "Set up automated investment increases with salary raises"
    ],
    'Aisha': [
      "Build your emergency fund to 6 months of expenses",
      "Start education savings for your children",
      "Review your family insurance coverage"
    ],
    'Samuel': [
      "Maximize your retirement contributions this year",
      "Consider catch-up contributions if eligible",
      "Review your estate planning documents"
    ]
  };

  return recommendations['Jamal'] || [
    "Set up automatic savings transfers",
    "Review your budget monthly",
    "Track your progress towards major goals"
  ];
};

export default AlignmentDashboard;