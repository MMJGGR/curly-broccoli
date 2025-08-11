/**
 * Projection Chart Component
 * Shows goal progress projections over time with confidence intervals
 */

import React, { useRef, useEffect } from 'react';
import predictiveAnalytics from '../../services/predictiveAnalytics';

const ProjectionChart = ({ 
  projections, 
  targetAmount, 
  scenario = 'realistic',
  width = 500, 
  height = 300, 
  className = '' 
}) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!projections || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    
    // Set canvas size for high DPI displays
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(dpr, dpr);
    
    drawChart(ctx);
  }, [projections, targetAmount, scenario, width, height]);

  const drawChart = (ctx) => {
    const margin = { top: 30, right: 30, bottom: 60, left: 80 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    if (!projections || projections.length === 0) return;

    // Prepare data
    const years = projections.map(p => p.year);
    const values = projections.map(p => p.projected_value);
    const confidenceIntervals = projections.map(p => p.confidence_intervals);

    const maxYear = Math.max(...years);
    const maxValue = Math.max(
      ...values, 
      ...projections.flatMap(p => [
        p.confidence_intervals.percentile_90,
        p.confidence_intervals.percentile_75
      ]),
      targetAmount || 0
    );

    const minValue = Math.min(
      0,
      ...projections.flatMap(p => [
        p.confidence_intervals.percentile_10,
        p.confidence_intervals.percentile_25
      ])
    );

    // Create scales
    const xScale = (year) => margin.left + (year / maxYear) * chartWidth;
    const yScale = (value) => margin.top + chartHeight - ((value - minValue) / (maxValue - minValue)) * chartHeight;

    // Draw background grid
    ctx.strokeStyle = '#F3F4F6';
    ctx.lineWidth = 1;
    
    // Vertical grid lines (years)
    for (let year = 1; year <= maxYear; year++) {
      const x = xScale(year);
      ctx.beginPath();
      ctx.moveTo(x, margin.top);
      ctx.lineTo(x, margin.top + chartHeight);
      ctx.stroke();
    }

    // Horizontal grid lines
    const ySteps = 5;
    for (let i = 0; i <= ySteps; i++) {
      const value = minValue + (maxValue - minValue) * (i / ySteps);
      const y = yScale(value);
      ctx.beginPath();
      ctx.moveTo(margin.left, y);
      ctx.lineTo(margin.left + chartWidth, y);
      ctx.stroke();
    }

    // Draw confidence bands
    if (confidenceIntervals.length > 0) {
      // 80% confidence band (10th-90th percentile)
      ctx.fillStyle = 'rgba(59, 130, 246, 0.1)';
      ctx.beginPath();
      ctx.moveTo(xScale(0), yScale(projections[0]?.confidence_intervals?.percentile_10 || minValue));
      
      // Top line (90th percentile)
      projections.forEach((p, i) => {
        ctx.lineTo(xScale(p.year), yScale(p.confidence_intervals.percentile_90));
      });
      
      // Bottom line (10th percentile) - reverse order
      for (let i = projections.length - 1; i >= 0; i--) {
        const p = projections[i];
        ctx.lineTo(xScale(p.year), yScale(p.confidence_intervals.percentile_10));
      }
      
      ctx.closePath();
      ctx.fill();

      // 50% confidence band (25th-75th percentile)
      ctx.fillStyle = 'rgba(59, 130, 246, 0.2)';
      ctx.beginPath();
      ctx.moveTo(xScale(projections[0].year), yScale(projections[0].confidence_intervals.percentile_25));
      
      // Top line (75th percentile)
      projections.forEach((p) => {
        ctx.lineTo(xScale(p.year), yScale(p.confidence_intervals.percentile_75));
      });
      
      // Bottom line (25th percentile) - reverse order
      for (let i = projections.length - 1; i >= 0; i--) {
        const p = projections[i];
        ctx.lineTo(xScale(p.year), yScale(p.confidence_intervals.percentile_25));
      }
      
      ctx.closePath();
      ctx.fill();
    }

    // Draw target amount line
    if (targetAmount) {
      const targetY = yScale(targetAmount);
      ctx.strokeStyle = '#10B981';
      ctx.lineWidth = 2;
      ctx.setLineDash([8, 4]);
      ctx.beginPath();
      ctx.moveTo(margin.left, targetY);
      ctx.lineTo(margin.left + chartWidth, targetY);
      ctx.stroke();
      ctx.setLineDash([]);
      
      // Target label
      ctx.fillStyle = '#10B981';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`Target: ${predictiveAnalytics.formatCurrency(targetAmount)}`, margin.left + 10, targetY - 5);
    }

    // Draw median projection line
    ctx.strokeStyle = '#3B82F6';
    ctx.lineWidth = 3;
    ctx.beginPath();
    
    projections.forEach((p, i) => {
      const x = xScale(p.year);
      const y = yScale(p.confidence_intervals.median);
      
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    
    ctx.stroke();

    // Draw data points
    ctx.fillStyle = '#3B82F6';
    projections.forEach((p) => {
      const x = xScale(p.year);
      const y = yScale(p.confidence_intervals.median);
      
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, 2 * Math.PI);
      ctx.fill();
    });

    // Draw axes
    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 2;
    
    // X-axis
    ctx.beginPath();
    ctx.moveTo(margin.left, margin.top + chartHeight);
    ctx.lineTo(margin.left + chartWidth, margin.top + chartHeight);
    ctx.stroke();
    
    // Y-axis
    ctx.beginPath();
    ctx.moveTo(margin.left, margin.top);
    ctx.lineTo(margin.left, margin.top + chartHeight);
    ctx.stroke();

    // Draw axis labels
    ctx.fillStyle = '#374151';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';

    // X-axis labels (years)
    years.forEach((year) => {
      const x = xScale(year);
      ctx.fillText(`Year ${year}`, x, margin.top + chartHeight + 20);
    });

    // Y-axis labels (values)
    for (let i = 0; i <= ySteps; i++) {
      const value = minValue + (maxValue - minValue) * (i / ySteps);
      const y = yScale(value);
      
      ctx.textAlign = 'right';
      ctx.fillText(
        predictiveAnalytics.formatCurrency(value).replace('KES ', ''),
        margin.left - 10,
        y + 4
      );
    }

    // Chart title and axis labels
    ctx.fillStyle = '#1F2937';
    ctx.font = '14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`Goal Projections - ${scenario.charAt(0).toUpperCase() + scenario.slice(1)} Scenario`, width / 2, 20);

    // Y-axis title
    ctx.save();
    ctx.translate(20, height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Amount (KES)', 0, 0);
    ctx.restore();

    // X-axis title
    ctx.fillStyle = '#6B7280';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Years from Now', width / 2, height - 10);
  };

  const getScenarioColor = (scenario) => {
    switch (scenario) {
      case 'pessimistic': return '#EF4444';
      case 'optimistic': return '#10B981';
      default: return '#3B82F6';
    }
  };

  const getScenarioDescription = (scenario) => {
    switch (scenario) {
      case 'pessimistic': return 'Conservative market assumptions';
      case 'optimistic': return 'Aggressive growth assumptions';
      default: return 'Balanced market assumptions';
    }
  };

  if (!projections || projections.length === 0) {
    return (
      <div className={`projection-chart ${className}`}>
        <div className="no-data">
          <p>No projection data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`projection-chart ${className}`}>
      <canvas 
        ref={canvasRef}
        className="chart-canvas"
      />
      
      {/* Chart legend and summary */}
      <div className="chart-legend">
        <div className="legend-items">
          <div className="legend-item">
            <div className="legend-line median"></div>
            <span>Median Projection</span>
          </div>
          <div className="legend-item">
            <div className="legend-band confidence-50"></div>
            <span>50% Confidence</span>
          </div>
          <div className="legend-item">
            <div className="legend-band confidence-80"></div>
            <span>80% Confidence</span>
          </div>
          {targetAmount && (
            <div className="legend-item">
              <div className="legend-line target"></div>
              <span>Target Amount</span>
            </div>
          )}
        </div>
        
        <div className="scenario-info">
          <div className="scenario-indicator" style={{ backgroundColor: getScenarioColor(scenario) }}></div>
          <div className="scenario-text">
            <div className="scenario-name">{scenario.charAt(0).toUpperCase() + scenario.slice(1)} Scenario</div>
            <div className="scenario-description">{getScenarioDescription(scenario)}</div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .projection-chart {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
        }

        .chart-canvas {
          border: 1px solid #E5E7EB;
          border-radius: 8px;
          background: white;
        }

        .no-data {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 200px;
          color: #6B7280;
        }

        .chart-legend {
          display: flex;
          flex-wrap: wrap;
          justify-content: space-between;
          align-items: center;
          width: 100%;
          gap: 16px;
          font-size: 12px;
        }

        .legend-items {
          display: flex;
          flex-wrap: wrap;
          gap: 16px;
        }

        .legend-item {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .legend-line {
          width: 20px;
          height: 3px;
          border-radius: 2px;
        }

        .legend-line.median {
          background: #3B82F6;
        }

        .legend-line.target {
          background: #10B981;
          background-image: repeating-linear-gradient(
            to right,
            #10B981,
            #10B981 8px,
            transparent 8px,
            transparent 12px
          );
        }

        .legend-band {
          width: 20px;
          height: 12px;
          border-radius: 2px;
        }

        .legend-band.confidence-50 {
          background: rgba(59, 130, 246, 0.2);
          border: 1px solid rgba(59, 130, 246, 0.4);
        }

        .legend-band.confidence-80 {
          background: rgba(59, 130, 246, 0.1);
          border: 1px solid rgba(59, 130, 246, 0.2);
        }

        .scenario-info {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .scenario-indicator {
          width: 12px;
          height: 12px;
          border-radius: 50%;
        }

        .scenario-text {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .scenario-name {
          font-weight: 600;
          color: #1F2937;
        }

        .scenario-description {
          color: #6B7280;
          font-size: 11px;
        }

        @media (max-width: 768px) {
          .chart-legend {
            flex-direction: column;
            align-items: stretch;
          }
          
          .legend-items {
            justify-content: center;
          }
          
          .scenario-info {
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
};

export default ProjectionChart;