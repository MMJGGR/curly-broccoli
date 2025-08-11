/**
 * Recommendation Panel Component
 * Displays AI-driven recommendations and actionable insights
 */

import React, { useState } from 'react';

const RecommendationPanel = ({ 
  recommendations = [], 
  analyticsRecommendations = [],
  actionItems = [],
  nextReviewDate,
  onActionComplete,
  className = '' 
}) => {
  const [completedActions, setCompletedActions] = useState(new Set());
  const [expandedRecommendation, setExpandedRecommendation] = useState(null);

  // Combine all recommendations with priorities
  const allRecommendations = [
    ...recommendations.map(rec => ({ 
      id: `sim_${Math.random()}`, 
      text: rec, 
      type: 'simulation',
      priority: getPriorityFromText(rec)
    })),
    ...analyticsRecommendations.map(rec => ({ 
      id: `ana_${Math.random()}`, 
      text: rec, 
      type: 'analytics',
      priority: getPriorityFromText(rec)
    })),
    ...actionItems.map(item => ({ 
      id: item.id || `act_${Math.random()}`, 
      text: item.description || item, 
      type: 'action',
      priority: item.priority || 'medium',
      dueDate: item.due_date
    }))
  ];

  // Sort by priority
  const sortedRecommendations = allRecommendations.sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    return priorityOrder[b.priority] - priorityOrder[a.priority];
  });

  function getPriorityFromText(text) {
    const lowerText = text.toLowerCase();
    if (lowerText.includes('critical') || lowerText.includes('urgent') || lowerText.includes('low success')) {
      return 'high';
    } else if (lowerText.includes('consider') || lowerText.includes('recommend')) {
      return 'medium';
    }
    return 'low';
  }

  const handleActionComplete = (actionId) => {
    setCompletedActions(prev => new Set([...prev, actionId]));
    if (onActionComplete) {
      onActionComplete(actionId);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return '#EF4444';
      case 'medium': return '#F59E0B';
      case 'low': return '#10B981';
      default: return '#6B7280';
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'high': return '⚠️';
      case 'medium': return '💡';
      case 'low': return '✅';
      default: return '💡';
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case 'simulation': return 'Monte Carlo Analysis';
      case 'analytics': return 'Trend Analysis';
      case 'action': return 'Action Item';
      default: return 'Recommendation';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return null;
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return null;
    }
  };

  const getActionableSteps = (text) => {
    // Extract specific numbers and actionable steps from recommendations
    const steps = [];
    
    // Look for specific amounts
    const amountMatch = text.match(/KES\s*([\d,]+)/i);
    if (amountMatch) {
      steps.push(`Specific Amount: ${amountMatch[0]}`);
    }
    
    // Look for time periods
    const timeMatch = text.match(/(\d+)\s*(months?|years?)/i);
    if (timeMatch) {
      steps.push(`Timeline: ${timeMatch[0]}`);
    }
    
    // Look for percentage changes
    const percentMatch = text.match(/(\d+)%/);
    if (percentMatch) {
      steps.push(`Target: ${percentMatch[0]} improvement`);
    }
    
    return steps;
  };

  if (sortedRecommendations.length === 0) {
    return (
      <div className={`recommendation-panel empty ${className}`}>
        <div className="empty-state">
          <div className="empty-icon">📊</div>
          <h3>All Set!</h3>
          <p>Your goal is on track. No immediate actions required.</p>
          {nextReviewDate && (
            <p className="next-review">Next review: {formatDate(nextReviewDate)}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`recommendation-panel ${className}`}>
      <div className="panel-header">
        <h3>AI-Powered Recommendations</h3>
        <div className="recommendation-count">
          {sortedRecommendations.length} insights
        </div>
      </div>

      <div className="recommendations-list">
        {sortedRecommendations.map((rec, index) => {
          const isCompleted = completedActions.has(rec.id);
          const isExpanded = expandedRecommendation === rec.id;
          const actionableSteps = getActionableSteps(rec.text);

          return (
            <div 
              key={rec.id} 
              className={`recommendation-item ${rec.priority} ${isCompleted ? 'completed' : ''}`}
            >
              <div className="recommendation-header">
                <div className="priority-indicator">
                  <span 
                    className="priority-icon"
                    style={{ color: getPriorityColor(rec.priority) }}
                  >
                    {getPriorityIcon(rec.priority)}
                  </span>
                  <span className="priority-label">{rec.priority.toUpperCase()}</span>
                </div>
                
                <div className="type-badge">
                  {getTypeLabel(rec.type)}
                </div>
              </div>

              <div className="recommendation-content">
                <p className="recommendation-text">{rec.text}</p>
                
                {actionableSteps.length > 0 && (
                  <div className="actionable-steps">
                    <h5>Key Details:</h5>
                    <ul>
                      {actionableSteps.map((step, i) => (
                        <li key={i}>{step}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {rec.dueDate && (
                  <div className="due-date">
                    <span className="due-label">Due:</span>
                    <span className="due-value">{formatDate(rec.dueDate)}</span>
                  </div>
                )}
              </div>

              <div className="recommendation-actions">
                {rec.type === 'action' && !isCompleted && (
                  <button 
                    className="complete-action-btn"
                    onClick={() => handleActionComplete(rec.id)}
                  >
                    Mark Complete
                  </button>
                )}
                
                <button 
                  className="expand-btn"
                  onClick={() => setExpandedRecommendation(isExpanded ? null : rec.id)}
                >
                  {isExpanded ? 'Less' : 'More'} Info
                </button>
              </div>

              {isExpanded && (
                <div className="recommendation-details">
                  <div className="impact-analysis">
                    <h5>Potential Impact:</h5>
                    <p>
                      {rec.priority === 'high' 
                        ? 'High impact on goal achievement. Immediate attention recommended.'
                        : rec.priority === 'medium'
                        ? 'Moderate impact on goal achievement. Consider implementing soon.'
                        : 'Low to moderate impact. Implement when convenient.'
                      }
                    </p>
                  </div>
                  
                  <div className="implementation-tips">
                    <h5>Implementation Tips:</h5>
                    <ul>
                      {rec.text.includes('increase') && (
                        <li>Set up automatic transfers to maintain consistency</li>
                      )}
                      {rec.text.includes('risk') && (
                        <li>Review your risk tolerance and investment mix</li>
                      )}
                      {rec.text.includes('timeline') && (
                        <li>Consider if timeline adjustment is realistic given your situation</li>
                      )}
                      <li>Track progress monthly to ensure you stay on course</li>
                    </ul>
                  </div>
                </div>
              )}

              {isCompleted && (
                <div className="completion-indicator">
                  <span className="completion-icon">✅</span>
                  <span className="completion-text">Completed</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {nextReviewDate && (
        <div className="panel-footer">
          <div className="next-review">
            <span className="review-label">Next Review:</span>
            <span className="review-date">{formatDate(nextReviewDate)}</span>
          </div>
        </div>
      )}

      <style jsx>{`
        .recommendation-panel {
          background: white;
          border: 1px solid #E5E7EB;
          border-radius: 8px;
          overflow: hidden;
        }

        .recommendation-panel.empty {
          padding: 40px 20px;
        }

        .empty-state {
          text-align: center;
          color: #6B7280;
        }

        .empty-icon {
          font-size: 48px;
          margin-bottom: 16px;
        }

        .empty-state h3 {
          margin: 0 0 8px 0;
          color: #1F2937;
        }

        .empty-state p {
          margin: 0 0 8px 0;
        }

        .next-review {
          font-size: 14px;
          color: #3B82F6;
        }

        .panel-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px;
          background: #F9FAFB;
          border-bottom: 1px solid #E5E7EB;
        }

        .panel-header h3 {
          margin: 0;
          color: #1F2937;
          font-size: 18px;
          font-weight: 600;
        }

        .recommendation-count {
          background: #3B82F6;
          color: white;
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 500;
        }

        .recommendations-list {
          display: flex;
          flex-direction: column;
        }

        .recommendation-item {
          padding: 20px;
          border-bottom: 1px solid #F3F4F6;
          transition: all 0.2s ease;
          position: relative;
        }

        .recommendation-item:hover {
          background: #F9FAFB;
        }

        .recommendation-item.completed {
          opacity: 0.7;
          background: #F0FDF4;
        }

        .recommendation-item.high {
          border-left: 4px solid #EF4444;
        }

        .recommendation-item.medium {
          border-left: 4px solid #F59E0B;
        }

        .recommendation-item.low {
          border-left: 4px solid #10B981;
        }

        .recommendation-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .priority-indicator {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .priority-icon {
          font-size: 16px;
        }

        .priority-label {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.5px;
          color: #6B7280;
        }

        .type-badge {
          background: #E5E7EB;
          color: #374151;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 11px;
          font-weight: 500;
        }

        .recommendation-content {
          margin-bottom: 16px;
        }

        .recommendation-text {
          margin: 0 0 12px 0;
          color: #1F2937;
          line-height: 1.5;
        }

        .actionable-steps {
          background: #F0F9FF;
          border: 1px solid #BAE6FD;
          border-radius: 6px;
          padding: 12px;
          margin: 12px 0;
        }

        .actionable-steps h5 {
          margin: 0 0 8px 0;
          color: #1E40AF;
          font-size: 13px;
          font-weight: 600;
        }

        .actionable-steps ul {
          margin: 0;
          padding-left: 20px;
          color: #1E40AF;
        }

        .actionable-steps li {
          margin: 4px 0;
          font-size: 13px;
        }

        .due-date {
          display: flex;
          gap: 8px;
          align-items: center;
          margin-top: 8px;
        }

        .due-label {
          color: #6B7280;
          font-size: 12px;
          font-weight: 500;
        }

        .due-value {
          color: #DC2626;
          font-size: 12px;
          font-weight: 600;
        }

        .recommendation-actions {
          display: flex;
          gap: 8px;
          align-items: center;
        }

        .complete-action-btn {
          background: #10B981;
          color: white;
          border: none;
          padding: 6px 12px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .complete-action-btn:hover {
          background: #059669;
        }

        .expand-btn {
          background: transparent;
          color: #3B82F6;
          border: 1px solid #3B82F6;
          padding: 6px 12px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .expand-btn:hover {
          background: #3B82F6;
          color: white;
        }

        .recommendation-details {
          margin-top: 16px;
          padding-top: 16px;
          border-top: 1px solid #E5E7EB;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .impact-analysis, .implementation-tips {
          background: #F8FAFC;
          padding: 12px;
          border-radius: 6px;
        }

        .impact-analysis h5, .implementation-tips h5 {
          margin: 0 0 8px 0;
          color: #1F2937;
          font-size: 13px;
          font-weight: 600;
        }

        .impact-analysis p {
          margin: 0;
          color: #4B5563;
          font-size: 13px;
          line-height: 1.4;
        }

        .implementation-tips ul {
          margin: 0;
          padding-left: 20px;
          color: #4B5563;
        }

        .implementation-tips li {
          margin: 4px 0;
          font-size: 13px;
          line-height: 1.4;
        }

        .completion-indicator {
          position: absolute;
          top: 20px;
          right: 20px;
          display: flex;
          align-items: center;
          gap: 4px;
          background: #DCFCE7;
          padding: 4px 8px;
          border-radius: 12px;
        }

        .completion-icon {
          font-size: 12px;
        }

        .completion-text {
          color: #166534;
          font-size: 11px;
          font-weight: 500;
        }

        .panel-footer {
          padding: 16px 20px;
          background: #F9FAFB;
          border-top: 1px solid #E5E7EB;
        }

        .panel-footer .next-review {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .review-label {
          color: #6B7280;
          font-size: 14px;
          font-weight: 500;
        }

        .review-date {
          color: #3B82F6;
          font-size: 14px;
          font-weight: 600;
        }

        @media (max-width: 768px) {
          .panel-header {
            flex-direction: column;
            align-items: stretch;
            gap: 12px;
          }

          .recommendation-header {
            flex-direction: column;
            align-items: stretch;
            gap: 8px;
          }

          .recommendation-actions {
            justify-content: stretch;
          }

          .complete-action-btn,
          .expand-btn {
            flex: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default RecommendationPanel;