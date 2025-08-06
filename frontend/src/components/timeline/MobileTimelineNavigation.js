/**
 * MobileTimelineNavigation - Mobile-optimized Timeline navigation
 * 
 * Features:
 * - Swipe gestures for Timeline navigation
 * - Bottom sheet for milestone details
 * - Touch-friendly interaction zones
 * - Optimized for small screens
 */
import React, { useState, useCallback } from 'react';
import { useTimeline } from '../../contexts/TimelineContext';

const MobileTimelineNavigation = () => {
  const {
    timelineData,
    selectedMilestone,
    selectMilestone,
    currentView,
    setTimelineView,
    TIMELINE_VIEWS,
    getPersonaConfig
  } = useTimeline();

  const [showBottomSheet, setShowBottomSheet] = useState(false);
  const personaConfig = getPersonaConfig();

  // Handle milestone tap
  const handleMilestoneTap = useCallback((milestone) => {
    selectMilestone(milestone);
    setShowBottomSheet(true);
  }, [selectMilestone]);

  // Close bottom sheet
  const closeBottomSheet = useCallback(() => {
    setShowBottomSheet(false);
    selectMilestone(null);
  }, [selectMilestone]);

  // Render view tabs
  const renderViewTabs = () => {
    const views = [
      { key: TIMELINE_VIEWS.OVERVIEW, label: 'Overview', icon: '🏠' },
      { key: TIMELINE_VIEWS.ALIGNMENT, label: 'Score', icon: '🎯' },
      { key: TIMELINE_VIEWS.JOURNEY, label: 'Journey', icon: '🗺️' }
    ];

    return (
      <div className="fixed bottom-20 left-4 right-4 bg-white rounded-full shadow-lg border border-gray-200 p-2 z-30">
        <div className="flex justify-around">
          {views.map((view) => (
            <button
              key={view.key}
              onClick={() => setTimelineView(view.key)}
              className={`flex-1 py-2 px-3 rounded-full text-center transition-colors ${
                currentView === view.key
                  ? `bg-${personaConfig?.color || 'blue'}-600 text-white`
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <div className="text-lg mb-1">{view.icon}</div>
              <div className="text-xs font-medium">{view.label}</div>
            </button>
          ))}
        </div>
      </div>
    );
  };

  // Render milestone bottom sheet
  const renderBottomSheet = () => {
    if (!showBottomSheet || !selectedMilestone) return null;

    return (
      <>
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-black/30 z-40"
          onClick={closeBottomSheet}
        />
        
        {/* Bottom Sheet */}
        <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl z-50 max-h-96 overflow-hidden">
          {/* Handle */}
          <div className="flex justify-center py-3">
            <div className="w-12 h-1 bg-gray-300 rounded-full" />
          </div>
          
          {/* Content */}
          <div className="px-6 pb-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-800 mb-1">
                  {selectedMilestone.title}
                </h3>
                <p className="text-gray-600 text-sm">
                  {selectedMilestone.description}
                </p>
              </div>
              
              {/* Status badge */}
              <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                selectedMilestone.status === 'completed' ? 'bg-green-100 text-green-800' :
                selectedMilestone.status === 'in_progress' ? `bg-${personaConfig?.color || 'blue'}-100 text-${personaConfig?.color || 'blue'}-800` :
                'bg-gray-100 text-gray-800'
              }`}>
                {selectedMilestone.status === 'completed' ? 'Completed' :
                 selectedMilestone.status === 'in_progress' ? 'In Progress' :
                 'Not Started'}
              </div>
            </div>

            {/* Progress */}
            {selectedMilestone.progress && (
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Progress</span>
                  <span className={`font-bold text-${personaConfig?.color || 'blue'}-600`}>
                    {selectedMilestone.progress}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`bg-${personaConfig?.color || 'blue'}-600 h-2 rounded-full transition-all duration-500`}
                    style={{ width: `${selectedMilestone.progress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Target amount */}
            {selectedMilestone.target_amount && (
              <div className="mb-4">
                <div className="text-sm text-gray-600">Target Amount</div>
                <div className="text-lg font-bold text-green-600">
                  KES {selectedMilestone.target_amount.toLocaleString()}
                </div>
              </div>
            )}

            {/* Target date */}
            {selectedMilestone.target_date && (
              <div className="mb-4">
                <div className="text-sm text-gray-600">Target Date</div>
                <div className="text-lg font-semibold text-gray-800">
                  {new Date(selectedMilestone.target_date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 mt-6">
              {selectedMilestone.status !== 'completed' && (
                <button className={`flex-1 py-3 px-4 rounded-xl font-medium text-white bg-${personaConfig?.color || 'blue'}-600 hover:bg-${personaConfig?.color || 'blue'}-700 transition-colors`}>
                  Update Progress
                </button>
              )}
              <button 
                onClick={closeBottomSheet}
                className="px-4 py-3 rounded-xl font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </>
    );
  };

  // Render timeline milestones for mobile
  const renderMobileMilestones = () => {
    if (!timelineData.milestones || timelineData.milestones.length === 0) return null;

    return (
      <div className="px-4 py-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Your Milestones</h3>
        <div className="space-y-3">
          {timelineData.milestones.map((milestone, index) => (
            <button
              key={milestone.id}
              onClick={() => handleMilestoneTap(milestone)}
              className="w-full bg-white rounded-xl shadow-sm border border-gray-200 p-4 text-left hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-800 mb-1">
                    {milestone.title}
                  </h4>
                  <p className="text-sm text-gray-600 mb-2">
                    {milestone.description}
                  </p>
                  
                  {/* Progress bar */}
                  {milestone.progress && (
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                        <div 
                          className={`bg-${personaConfig?.color || 'blue'}-600 h-1.5 rounded-full transition-all duration-300`}
                          style={{ width: `${milestone.progress}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500">
                        {milestone.progress}%
                      </span>
                    </div>
                  )}
                </div>
                
                {/* Status indicator */}
                <div className={`w-4 h-4 rounded-full ml-4 ${
                  milestone.status === 'completed' ? 'bg-green-500' :
                  milestone.status === 'in_progress' ? `bg-${personaConfig?.color || 'blue'}-500` :
                  'bg-gray-300'
                }`}>
                  {milestone.status === 'completed' && (
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Mobile view tabs */}
      {renderViewTabs()}
      
      {/* Mobile milestone list (for overview) */}
      {currentView === TIMELINE_VIEWS.OVERVIEW && renderMobileMilestones()}
      
      {/* Bottom sheet for milestone details */}
      {renderBottomSheet()}
    </>
  );
};

export default MobileTimelineNavigation;