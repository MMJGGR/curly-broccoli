/**
 * PersonaAdaptations - Persona-specific interface customizations
 * 
 * Features:
 * - Jamal (Goal-Oriented): Focus on investment milestones and ROI tracking
 * - Aisha (Milestone-Focused): Emphasize family goals and education planning
 * - Samuel (Progress-Tracking): Highlight debt reduction and cash flow stability
 * - Dynamic UI theming and content based on persona
 */
import React from 'react';

// Persona-specific configurations
const PERSONA_CONFIGS = {
  jamal: {
    primaryColor: 'blue',
    secondaryColor: 'indigo',
    personality: 'analytical',
    preferredMetrics: ['roi', 'growth_rate', 'portfolio_value'],
    contentTone: 'professional',
    visualStyle: 'charts',
    callToActionStyle: 'data-driven',
    motivationalMessages: [
      "Your investments are compounding nicely!",
      "Stay the course - your long-term strategy is solid",
      "Consider rebalancing your portfolio for optimal returns"
    ]
  },
  aisha: {
    primaryColor: 'purple',
    secondaryColor: 'pink',
    personality: 'family-focused',
    preferredMetrics: ['savings_rate', 'emergency_fund', 'education_fund'],
    contentTone: 'supportive',
    visualStyle: 'milestones',
    callToActionStyle: 'achievement-based',
    motivationalMessages: [
      "Great job securing your family's future!",
      "Every small step brings you closer to your dreams",
      "Your dedication to your goals is inspiring"
    ]
  },
  samuel: {
    primaryColor: 'green',
    secondaryColor: 'emerald',
    personality: 'stability-focused',
    preferredMetrics: ['debt_reduction', 'monthly_surplus', 'credit_score'],
    contentTone: 'encouraging',
    visualStyle: 'progress-bars',
    callToActionStyle: 'step-by-step',
    motivationalMessages: [
      "Steady progress leads to lasting financial health",
      "You're building a strong financial foundation",
      "Each payment brings you closer to freedom"
    ]
  }
};

export const PersonaHeader = ({ persona, alignmentScore }) => {
  const config = PERSONA_CONFIGS[persona?.toLowerCase()] || PERSONA_CONFIGS.jamal;
  
  const getPersonaGreeting = () => {
    const hour = new Date().getHours();
    const timeGreeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
    
    switch (persona?.toLowerCase()) {
      case 'jamal':
        return `${timeGreeting}, Jamal! Ready to optimize your portfolio today?`;
      case 'aisha':
        return `${timeGreeting}, Aisha! Let's check on your family's financial journey.`;
      case 'samuel':
        return `${timeGreeting}, Samuel! Time to review your progress toward stability.`;
      default:
        return `${timeGreeting}! Let's continue your financial journey.`;
    }
  };

  const getPersonaMotivation = () => {
    const messages = config.motivationalMessages;
    const randomIndex = Math.floor(Math.random() * messages.length);
    return messages[randomIndex];
  };

  return (
    <div className={`bg-gradient-to-r from-${config.primaryColor}-600 to-${config.secondaryColor}-600 text-white rounded-xl p-6 mb-6`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h1 className="text-2xl font-bold mb-2">{getPersonaGreeting()}</h1>
          <p className="text-white/90">{getPersonaMotivation()}</p>
        </div>
        
        {/* Quick Alignment Badge */}
        <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 text-center">
          <div className="text-2xl font-bold">{alignmentScore?.current || 0}</div>
          <div className="text-xs text-white/80">Alignment</div>
        </div>
      </div>
    </div>
  );
};

export const PersonaMetrics = ({ persona, dashboardData }) => {
  const config = PERSONA_CONFIGS[persona?.toLowerCase()] || PERSONA_CONFIGS.jamal;
  
  const getPersonaMetrics = () => {
    const baseMetrics = dashboardData?.keyMetrics || [];
    
    // Filter and prioritize metrics based on persona
    return baseMetrics
      .filter(metric => config.preferredMetrics.includes(metric.type))
      .sort((a, b) => {
        const aIndex = config.preferredMetrics.indexOf(a.type);
        const bIndex = config.preferredMetrics.indexOf(b.type);
        return aIndex - bIndex;
      })
      .slice(0, 3); // Show top 3 metrics
  };

  const formatMetricValue = (metric) => {
    switch (metric.type) {
      case 'roi':
      case 'growth_rate':
        return `${metric.value}%`;
      case 'portfolio_value':
      case 'emergency_fund':
      case 'education_fund':
        return `KES ${metric.value?.toLocaleString()}`;
      case 'savings_rate':
        return `${metric.value}%`;
      case 'debt_reduction':
        return `KES ${metric.value?.toLocaleString()} paid`;
      case 'monthly_surplus':
        return `KES ${metric.value?.toLocaleString()}/month`;
      case 'credit_score':
        return metric.value;
      default:
        return metric.value;
    }
  };

  const getMetricIcon = (type) => {
    const icons = {
      roi: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      ),
      growth_rate: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      portfolio_value: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
        </svg>
      ),
      savings_rate: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      emergency_fund: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      debt_reduction: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
        </svg>
      )
    };
    
    return icons[type] || icons.portfolio_value;
  };

  const metrics = getPersonaMetrics();

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {metrics.map((metric, index) => (
        <div
          key={metric.type}
          className={`bg-white rounded-lg shadow-lg p-4 border-l-4 border-${config.primaryColor}-500`}
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h3 className="font-semibold text-gray-800 capitalize">
                {metric.label || metric.type.replace('_', ' ')}
              </h3>
              <div className={`text-2xl font-bold text-${config.primaryColor}-600 mt-1`}>
                {formatMetricValue(metric)}
              </div>
              {metric.change && (
                <div className={`text-sm ${metric.change >= 0 ? 'text-green-600' : 'text-red-600'} mt-1`}>
                  {metric.change >= 0 ? '↗' : '↘'} {Math.abs(metric.change)}%
                </div>
              )}
            </div>
            <div className={`text-${config.primaryColor}-600`}>
              {getMetricIcon(metric.type)}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export const PersonaActionCards = ({ persona, nextActions }) => {
  const config = PERSONA_CONFIGS[persona?.toLowerCase()] || PERSONA_CONFIGS.jamal;
  
  const getPersonaActions = () => {
    if (!nextActions || !Array.isArray(nextActions)) return [];
    
    // Prioritize actions based on persona focus
    const personaPriorities = {
      jamal: ['invest', 'rebalance', 'tax', 'analyze'],
      aisha: ['save', 'family', 'education', 'emergency'],
      samuel: ['debt', 'budget', 'stability', 'track']
    };
    
    const priorities = personaPriorities[persona?.toLowerCase()] || [];
    
    return nextActions
      .sort((a, b) => {
        const aScore = priorities.findIndex(p => a.type?.includes(p) || a.title?.toLowerCase().includes(p));
        const bScore = priorities.findIndex(p => b.type?.includes(p) || b.title?.toLowerCase().includes(p));
        return (aScore === -1 ? 999 : aScore) - (bScore === -1 ? 999 : bScore);
      })
      .slice(0, 4);
  };

  const getActionStyle = (priority) => {
    const styles = {
      high: `bg-${config.primaryColor}-50 border-${config.primaryColor}-200 text-${config.primaryColor}-800`,
      medium: `bg-${config.secondaryColor}-50 border-${config.secondaryColor}-200 text-${config.secondaryColor}-800`,
      low: 'bg-gray-50 border-gray-200 text-gray-800'
    };
    return styles[priority] || styles.medium;
  };

  const actions = getPersonaActions();

  if (!actions.length) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6 text-center">
        <div className={`w-16 h-16 mx-auto mb-4 bg-${config.primaryColor}-100 rounded-full flex items-center justify-center`}>
          <svg className={`w-8 h-8 text-${config.primaryColor}-600`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">All Caught Up!</h3>
        <p className="text-gray-600">No immediate actions needed. Great job staying on track!</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-xl font-bold text-gray-800 mb-4">
        Recommended Actions for You
      </h3>
      <div className="space-y-3">
        {actions.map((action, index) => (
          <div
            key={action.id || index}
            className={`p-4 rounded-lg border-2 ${getActionStyle(action.priority)} transition-all duration-200 hover:shadow-md cursor-pointer`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="font-semibold mb-1">{action.title}</h4>
                <p className="text-sm opacity-80 mb-2">{action.description}</p>
                {action.estimated_time && (
                  <div className="text-xs opacity-70">
                    Estimated time: {action.estimated_time}
                  </div>
                )}
              </div>
              
              {action.priority === 'high' && (
                <div className={`ml-3 px-2 py-1 text-xs font-bold rounded-full bg-${config.primaryColor}-600 text-white`}>
                  Priority
                </div>
              )}
            </div>
            
            {/* Action Button */}
            <div className="mt-3 flex gap-2">
              <button className={`text-sm px-4 py-2 rounded-lg font-medium transition-colors bg-${config.primaryColor}-600 text-white hover:bg-${config.primaryColor}-700`}>
                {config.callToActionStyle === 'data-driven' ? 'Analyze' :
                 config.callToActionStyle === 'achievement-based' ? 'Achieve' :
                 'Start'}
              </button>
              <button className={`text-sm px-4 py-2 rounded-lg font-medium transition-colors bg-${config.primaryColor}-100 text-${config.primaryColor}-700 hover:bg-${config.primaryColor}-200`}>
                Learn More
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const PersonaInsights = ({ persona, insights }) => {
  const config = PERSONA_CONFIGS[persona?.toLowerCase()] || PERSONA_CONFIGS.jamal;
  
  const getPersonaInsightStyle = () => {
    switch (config.visualStyle) {
      case 'charts':
        return 'border-l-4 border-blue-500 bg-blue-50';
      case 'milestones':
        return 'border-l-4 border-purple-500 bg-purple-50';
      case 'progress-bars':
        return 'border-l-4 border-green-500 bg-green-50';
      default:
        return 'border-l-4 border-gray-500 bg-gray-50';
    }
  };

  const getInsightTone = (insight) => {
    switch (config.contentTone) {
      case 'professional':
        return `Based on your data, ${insight}`;
      case 'supportive':
        return `You're doing great! ${insight}`;
      case 'encouraging':
        return `Keep it up! ${insight}`;
      default:
        return insight;
    }
  };

  if (!insights || !insights.length) return null;

  return (
    <div className="space-y-4">
      {insights.slice(0, 2).map((insight, index) => (
        <div
          key={insight.id || index}
          className={`p-4 rounded-lg ${getPersonaInsightStyle()}`}
        >
          <h4 className={`font-semibold text-${config.primaryColor}-800 mb-2`}>
            {insight.title}
          </h4>
          <p className={`text-${config.primaryColor}-700 text-sm`}>
            {getInsightTone(insight.summary)}
          </p>
        </div>
      ))}
    </div>
  );
};

// Main PersonaAdaptations component that coordinates all persona-specific elements
const PersonaAdaptations = ({ 
  persona, 
  alignmentScore, 
  dashboardData, 
  nextActions, 
  insights,
  children 
}) => {

  return (
    <div className={`persona-${persona?.toLowerCase()} space-y-6`}>
      <PersonaHeader persona={persona} alignmentScore={alignmentScore} />
      
      <PersonaMetrics persona={persona} dashboardData={dashboardData} />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PersonaActionCards persona={persona} nextActions={nextActions} />
        <div>
          <PersonaInsights persona={persona} insights={insights} />
        </div>
      </div>
      
      {/* Render any child components */}
      {children}
    </div>
  );
};

export default PersonaAdaptations;