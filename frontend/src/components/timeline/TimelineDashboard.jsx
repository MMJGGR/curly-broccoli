/**
 * Timeline Dashboard - Main dashboard replacement with Timeline-first design
 * 70% Timeline, 30% contextual information
 */
import React, { useState, useEffect } from 'react';
import { useTimeline } from '../../contexts/TimelineContext';
import TimelineVisualization from './TimelineVisualization';
import AlignmentDashboard from './AlignmentDashboard';

const TimelineDashboard = () => {
  const {
    loading,
    error,
    persona,
    personaTheme,
    personaWelcome,
    currentAge,
    currentPhase,
    nextMilestone,
    nextMilestoneDistance,
    alignmentScore,
    quickActions = [],
    isTimelineReady,
    loadTimelineJourney,
  } = useTimeline();

  const [activeView, setActiveView] = useState('overview');
  const [showMobilePanel, setShowMobilePanel] = useState(false);

  // Refresh data on mount
  useEffect(() => {
    if (!isTimelineReady) {
      loadTimelineJourney();
    }
  }, [isTimelineReady, loadTimelineJourney]);

  // Loading state
  if (loading) {
    return (
      <div className="timeline-dashboard h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700">Loading your Timeline...</h2>
          <p className="text-gray-500 mt-2">Preparing your personalized financial journey</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="timeline-dashboard h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <svg className="h-16 w-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Timeline Unavailable</h2>
          <p className="text-gray-500 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="timeline-dashboard flex flex-col bg-gray-50" style={{ height: 'calc(100vh - 4rem)' }}>
      {/* Header with persona welcome and alignment score */}
      <div 
        className="dashboard-header p-4 shadow-sm border-b border-gray-200"
        style={{ backgroundColor: personaTheme?.secondary || '#f8fafc' }}
      >
        <div className="flex items-center justify-between">
          {/* Welcome Message */}
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              {personaWelcome || `Welcome to your Timeline`}
            </h1>
            <div className="flex items-center space-x-4 mt-1">
              <span className="text-sm text-gray-600">
                {currentPhase} • Age {currentAge}
              </span>
              {persona && (
                <span 
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white"
                  style={{ backgroundColor: personaTheme?.primary }}
                >
                  {persona} Profile
                </span>
              )}
            </div>
          </div>

          {/* Alignment Score & Controls */}
          <div className="flex items-center space-x-4">
            {/* Alignment Score */}
            <div className="text-center">
              <div className="text-sm text-gray-600">Alignment Score</div>
              <div 
                className="text-2xl font-bold"
                style={{ color: personaTheme?.primary }}
              >
                {alignmentScore ? Math.round(alignmentScore) : '--'}%
              </div>
            </div>

            {/* View Toggle */}
            <div className="flex bg-white rounded-lg p-1 border border-gray-200">
              <button
                onClick={() => setActiveView('overview')}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  activeView === 'overview' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveView('journey')}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  activeView === 'journey' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Journey
              </button>
              <button
                onClick={() => setActiveView('alignment')}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  activeView === 'alignment' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Alignment
              </button>
            </div>

            {/* Mobile Panel Toggle */}
            <button
              onClick={() => setShowMobilePanel(!showMobilePanel)}
              className="md:hidden p-2 text-gray-600 hover:text-gray-800"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="dashboard-content flex-1 flex overflow-hidden">
        
        {/* Timeline Area (70% on desktop, full on mobile) */}
        <div className={`timeline-area ${showMobilePanel ? 'hidden md:flex' : 'flex'} md:w-7/10 w-full flex-col`}>
          <TimelineVisualization />
        </div>

        {/* Context Panel (30% on desktop, overlay on mobile) */}
        <div className={`
          context-panel bg-white border-l border-gray-200
          ${showMobilePanel ? 'fixed inset-y-0 right-0 w-80 shadow-xl z-50 md:relative md:inset-auto md:w-3/10 md:shadow-none' : 'hidden md:flex md:w-3/10'}
          flex flex-col
        `}>
          
          {/* Panel Header */}
          <div className="panel-header p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-800">
                {activeView === 'overview' && 'Overview'}
                {activeView === 'journey' && 'Journey Details'}  
                {activeView === 'alignment' && 'Alignment Insights'}
              </h3>
              <button
                onClick={() => setShowMobilePanel(false)}
                className="md:hidden text-gray-400 hover:text-gray-600"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Panel Content */}
          <div className="panel-content flex-1 overflow-y-auto">
            
            {/* Overview Panel */}
            {activeView === 'overview' && (
              <div className="p-4 space-y-6">
                
                {/* Next Milestone */}
                {nextMilestone && (
                  <div className="next-milestone">
                    <h4 className="font-medium text-gray-800 mb-3">Next Milestone</h4>
                    <div 
                      className="p-4 rounded-lg"
                      style={{ backgroundColor: personaTheme?.secondary }}
                    >
                      <div className="font-medium text-gray-800">{nextMilestone.title}</div>
                      <div className="text-sm text-gray-600 mt-1">
                        {nextMilestoneDistance}
                      </div>
                      {nextMilestone.target_amount && (
                        <div className="text-lg font-semibold text-green-600 mt-2">
                          ${nextMilestone.target_amount.toLocaleString()}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Quick Actions */}
                {quickActions.length > 0 && (
                  <div className="quick-actions">
                    <h4 className="font-medium text-gray-800 mb-3">Quick Actions</h4>
                    <div className="space-y-2">
                      {quickActions.map((action, index) => (
                        <button
                          key={index}
                          className="w-full text-left p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                        >
                          <div className="font-medium text-gray-800">{action.title}</div>
                          <div className="text-sm text-gray-600">{action.category}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Persona Insights */}
                <div className="persona-insights">
                  <h4 className="font-medium text-gray-800 mb-3">
                    {persona} Insights
                  </h4>
                  <div 
                    className="p-4 rounded-lg text-sm"
                    style={{ 
                      backgroundColor: personaTheme?.secondary,
                      color: personaTheme?.primary 
                    }}
                  >
                    {getPersonaInsightText(persona)}
                  </div>
                </div>

              </div>
            )}

            {/* Journey Panel */}
            {activeView === 'journey' && (
              <div className="p-4">
                <div className="text-center text-gray-600 py-8">
                  <div className="text-4xl mb-4">🗺️</div>
                  <p>Detailed journey analytics coming soon...</p>
                  <p className="text-sm mt-2">View your complete financial journey with milestones and progress tracking.</p>
                </div>
              </div>
            )}

            {/* Alignment Panel */}
            {activeView === 'alignment' && (
              <AlignmentDashboard />
            )}

          </div>
        </div>

        {/* Mobile Panel Backdrop */}
        {showMobilePanel && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
            onClick={() => setShowMobilePanel(false)}
          />
        )}

      </div>
    </div>
  );
};

// Helper functions
const getPersonaInsightText = (persona) => {
  const insights = {
    'Jamal': 'Focus on building your investment foundation. Start with emergency funds and gradually increase your investment portfolio.',
    'Aisha': 'Balance your family goals with long-term planning. Education savings and family insurance are key priorities.',
    'Samuel': 'Optimize your path to retirement. Focus on wealth preservation and healthcare planning.'
  };
  
  return insights[persona] || 'Build your financial timeline step by step with personalized milestones.';
};

export default TimelineDashboard;