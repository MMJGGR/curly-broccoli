/**
 * Timeline Visualization - Main Timeline interface (70% screen)
 * Interactive Timeline with milestones, confidence bands, and persona-based styling
 */
import React, { useState, useRef } from 'react';
import { useTimeline } from '../../contexts/TimelineContext';

const TimelineVisualization = () => {
  const {
    milestones = [],
    currentAge,
    personaTheme,
    confidenceBands,
    timelineSpan,
    loading,
    error
  } = useTimeline();

  const [selectedMilestone, setSelectedMilestone] = useState(null);
  const [timelineScale, setTimelineScale] = useState(1);
  const timelineRef = useRef(null);

  // Calculate Timeline dimensions
  const startAge = timelineSpan?.start_age || currentAge || 25;
  const endAge = timelineSpan?.end_age || startAge + 40;
  const totalYears = endAge - startAge;

  // Calculate position for age on Timeline
  const getPositionForAge = (age) => {
    return ((age - startAge) / totalYears) * 100;
  };

  // Handle milestone click
  const handleMilestoneClick = (milestone) => {
    setSelectedMilestone(milestone);
  };

  // Handle Timeline zoom
  const handleZoom = (delta) => {
    const newScale = Math.max(0.5, Math.min(3, timelineScale + delta));
    setTimelineScale(newScale);
  };

  // Loading state
  if (loading) {
    return (
      <div className="timeline-visualization h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your Timeline...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="timeline-visualization h-full flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <svg className="h-12 w-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-gray-600">Failed to load Timeline</p>
          <p className="text-sm text-gray-500 mt-2">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="timeline-visualization h-full w-full relative overflow-x-auto overflow-y-hidden"
      ref={timelineRef}
      style={{ backgroundColor: personaTheme?.secondary || '#f8fafc' }}
    >
      {/* Timeline Header */}
      <div className="timeline-header p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">
              Your Financial Journey
            </h2>
            <p className="text-sm text-gray-600">
              {currentAge ? `Age ${currentAge} - ${endAge}` : 'Timeline View'}
            </p>
          </div>
          
          {/* Timeline Controls */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleZoom(-0.2)}
              className="px-3 py-1 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Zoom Out
            </button>
            <button
              onClick={() => handleZoom(0.2)}
              className="px-3 py-1 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Zoom In
            </button>
          </div>
        </div>
      </div>

      {/* Timeline Container */}
      <div className="timeline-container relative h-full p-6" style={{ minWidth: `${timelineScale * 100}%` }}>
        
        {/* Confidence Bands Background */}
        {confidenceBands && (
          <div className="confidence-bands absolute inset-0 pointer-events-none">
            {/* Optimistic band */}
            <div
              className="absolute h-12 rounded-lg opacity-20"
              style={{
                backgroundColor: personaTheme?.primary || '#2563eb',
                top: '40%',
                left: '0%',
                right: '0%'
              }}
            />
            {/* Realistic band */}
            <div
              className="absolute h-8 rounded-lg opacity-30"
              style={{
                backgroundColor: personaTheme?.primary || '#2563eb',
                top: '42%',
                left: '0%',
                right: '0%'
              }}
            />
            {/* Pessimistic band */}
            <div
              className="absolute h-4 rounded-lg opacity-40"
              style={{
                backgroundColor: personaTheme?.primary || '#2563eb',
                top: '44%',
                left: '0%',
                right: '0%'
              }}
            />
          </div>
        )}

        {/* Timeline Axis */}
        <div className="timeline-axis relative h-full">
          {/* Main Timeline Line */}
          <div
            className="absolute h-1 rounded-full"
            style={{
              backgroundColor: personaTheme?.primary || '#2563eb',
              top: '50%',
              left: '0%',
              right: '0%',
              transform: 'translateY(-50%)'
            }}
          />

          {/* Current Age Marker */}
          {currentAge && (
            <div
              className="absolute flex flex-col items-center"
              style={{
                left: `${getPositionForAge(currentAge)}%`,
                top: '40%',
                transform: 'translateX(-50%)'
              }}
            >
              <div
                className="w-4 h-4 rounded-full border-4 border-white shadow-lg"
                style={{ backgroundColor: personaTheme?.accent || '#1d4ed8' }}
              />
              <div className="mt-2 text-xs font-semibold text-gray-700">
                NOW
              </div>
              <div className="text-xs text-gray-500">
                Age {currentAge}
              </div>
            </div>
          )}

          {/* Milestone Markers */}
          {milestones.map((milestone, index) => {
            const position = getPositionForAge(milestone.age);
            const isFuture = milestone.age > currentAge;
            const isSelected = selectedMilestone?.id === milestone.id;

            return (
              <div
                key={milestone.id || index}
                className={`absolute flex flex-col items-center cursor-pointer transition-all duration-200 ${
                  isSelected ? 'scale-110 z-10' : 'hover:scale-105'
                }`}
                style={{
                  left: `${position}%`,
                  top: isFuture ? '20%' : '70%',
                  transform: 'translateX(-50%)'
                }}
                onClick={() => handleMilestoneClick(milestone)}
              >
                {/* Milestone Icon */}
                <div
                  className={`w-8 h-8 rounded-full border-4 border-white shadow-lg flex items-center justify-center ${
                    isFuture ? 'opacity-70' : 'opacity-100'
                  }`}
                  style={{
                    backgroundColor: getMilestoneColor(milestone.category, personaTheme)
                  }}
                >
                  {getMilestoneIcon(milestone.category)}
                </div>

                {/* Milestone Label */}
                <div className={`mt-2 text-center ${isSelected ? 'bg-white p-2 rounded-lg shadow-lg' : ''}`}>
                  <div className="text-xs font-semibold text-gray-800 max-w-20 truncate">
                    {milestone.title}
                  </div>
                  <div className="text-xs text-gray-500">
                    Age {milestone.age}
                  </div>
                  {milestone.target_amount && (
                    <div className="text-xs text-green-600 font-medium">
                      ${formatAmount(milestone.target_amount)}
                    </div>
                  )}
                  {milestone.progress !== undefined && (
                    <div className="text-xs text-gray-500">
                      {Math.round(milestone.progress)}% done
                    </div>
                  )}
                </div>

                {/* Connection Line to Timeline */}
                <div
                  className="absolute w-px bg-gray-300"
                  style={{
                    height: isFuture ? '120px' : '100px',
                    top: isFuture ? '32px' : '-100px',
                    left: '50%',
                    transform: 'translateX(-50%)'
                  }}
                />
              </div>
            );
          })}

          {/* Age Markers */}
          {Array.from({ length: Math.ceil(totalYears / 5) }, (_, i) => {
            const age = startAge + (i * 5);
            const position = getPositionForAge(age);

            return (
              <div
                key={age}
                className="absolute flex flex-col items-center"
                style={{
                  left: `${position}%`,
                  top: '48%',
                  transform: 'translateX(-50%)'
                }}
              >
                <div className="w-px h-4 bg-gray-400" />
                <div className="text-xs text-gray-500 mt-1">
                  {age}
                </div>
              </div>
            );
          })}
        </div>

        {/* Milestone Detail Panel */}
        {selectedMilestone && (
          <div className="absolute top-4 right-4 w-80 bg-white rounded-lg shadow-xl p-6 border border-gray-200 z-20">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                {selectedMilestone.title}
              </h3>
              <button
                onClick={() => setSelectedMilestone(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Target Age:</span>
                <span className="text-sm font-medium">{selectedMilestone.age}</span>
              </div>
              
              {selectedMilestone.target_amount && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Target Amount:</span>
                  <span className="text-sm font-medium text-green-600">
                    ${formatAmount(selectedMilestone.target_amount)}
                  </span>
                </div>
              )}

              {selectedMilestone.progress !== undefined && (
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-gray-600">Progress:</span>
                    <span className="text-sm font-medium">{Math.round(selectedMilestone.progress)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="h-2 rounded-full"
                      style={{
                        backgroundColor: personaTheme?.primary || '#2563eb',
                        width: `${selectedMilestone.progress}%`
                      }}
                    />
                  </div>
                </div>
              )}

              {selectedMilestone.timeline_impact && (
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-sm text-blue-800">{selectedMilestone.timeline_impact}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Helper functions
const getMilestoneColor = (category, theme) => {
  const colors = {
    emergency: '#ef4444',
    investment: theme?.primary || '#2563eb',
    education: '#8b5cf6',
    housing: '#f59e0b',
    retirement: '#059669',
    healthcare: '#ec4899',
    general: theme?.accent || '#6b7280'
  };
  return colors[category] || colors.general;
};

const getMilestoneIcon = (category) => {
  const icons = {
    emergency: '🛡️',
    investment: '📈',
    education: '🎓',
    housing: '🏠',
    retirement: '🏖️',
    healthcare: '⚕️',
    general: '🎯'
  };
  return icons[category] || icons.general;
};

const formatAmount = (amount) => {
  if (amount >= 1000000) {
    return `${(amount / 1000000).toFixed(1)}M`;
  } else if (amount >= 1000) {
    return `${(amount / 1000).toFixed(0)}K`;
  }
  return amount.toLocaleString();
};

export default TimelineVisualization;