/**
 * Probability Gauge Component
 * Displays success probability as an interactive circular gauge
 */

import React from 'react';
import { useAnalytics } from '../../contexts/AnalyticsContext';

const ProbabilityGauge = ({ 
  probability, 
  size = 'medium', 
  showLabel = true, 
  animated = true,
  className = '' 
}) => {
  const analytics = useAnalytics();
  // Size configurations
  const sizeConfig = {
    small: { radius: 40, strokeWidth: 6, fontSize: 14 },
    medium: { radius: 60, strokeWidth: 8, fontSize: 18 },
    large: { radius: 80, strokeWidth: 10, fontSize: 24 }
  };

  const config = sizeConfig[size] || sizeConfig.medium;
  const { radius, strokeWidth, fontSize } = config;
  
  // Calculate circle properties
  const normalizedRadius = radius - strokeWidth * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDasharray = `${circumference} ${circumference}`;
  const strokeDashoffset = circumference - (probability * circumference);
  
  // Get color based on probability
  const getColor = (prob) => {
    if (prob >= 0.8) return '#10B981'; // Green
    if (prob >= 0.6) return '#F59E0B'; // Yellow
    if (prob >= 0.4) return '#F97316'; // Orange
    return '#EF4444'; // Red
  };

  const color = getColor(probability);
  const percentage = Math.round(probability * 100);
  const description = analytics.getRiskLevelColor ? undefined : undefined;
  // Use context for formatting; keep description with service's color mapping replacement
  const formattedPercentage = analytics.formatPercentage(probability);

  return (
    <div className={`probability-gauge ${size} ${className}`}>
      <div className="gauge-container">
        <svg
          height={radius * 2}
          width={radius * 2}
          className="gauge-svg"
        >
          {/* Background circle */}
          <circle
            stroke="#E5E7EB"
            fill="transparent"
            strokeWidth={strokeWidth}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
          
          {/* Progress circle */}
          <circle
            stroke={color}
            fill="transparent"
            strokeWidth={strokeWidth}
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            r={normalizedRadius}
            cx={radius}
            cy={radius}
            className={animated ? 'animated-stroke' : ''}
            style={{
              transform: 'rotate(-90deg)',
              transformOrigin: '50% 50%'
            }}
          />
        </svg>
        
        {/* Center content */}
        <div className="gauge-content">
          <div className="percentage" style={{ fontSize: `${fontSize}px`, color }}>
            {percentage}%
          </div>
          {showLabel && (
            <div className="description" style={{ fontSize: `${fontSize * 0.5}px` }}>
              {/* Keep a generic label if no description in context */}
              {`Success`}
            </div>
          )}
        </div>
      </div>
      
      {/* Additional metrics */}
      <div className="gauge-details">
        <div className="confidence-level">
          <span className="label">Success Probability:</span>
          <span className="value" style={{ color }}>
            {formattedPercentage}
          </span>
        </div>
      </div>

      <style jsx>{`
        .probability-gauge {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
        }

        .gauge-container {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .gauge-svg {
          transform: rotate(-90deg);
        }

        .animated-stroke {
          transition: stroke-dashoffset 1s ease-in-out;
        }

        .gauge-content {
          position: absolute;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
        }

        .percentage {
          font-weight: 700;
          line-height: 1;
          margin-bottom: 4px;
        }

        .description {
          color: #6B7280;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          line-height: 1;
        }

        .gauge-details {
          text-align: center;
        }

        .confidence-level {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .confidence-level .label {
          color: #6B7280;
          font-size: 12px;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .confidence-level .value {
          font-size: 16px;
          font-weight: 600;
        }

        /* Size-specific adjustments */
        .probability-gauge.small .gauge-details {
          font-size: 12px;
        }

        .probability-gauge.small .confidence-level .value {
          font-size: 14px;
        }

        .probability-gauge.large .gauge-details {
          margin-top: 16px;
        }

        .probability-gauge.large .confidence-level .label {
          font-size: 14px;
        }

        .probability-gauge.large .confidence-level .value {
          font-size: 18px;
        }

        /* Animation for when probability changes */
        .gauge-container:hover .gauge-content {
          transform: scale(1.05);
          transition: transform 0.2s ease;
        }

        /* Responsive adjustments */
        @media (max-width: 768px) {
          .probability-gauge.large {
            transform: scale(0.8);
          }
          
          .probability-gauge.medium {
            transform: scale(0.9);
          }
        }
      `}</style>
    </div>
  );
};

export default ProbabilityGauge;
