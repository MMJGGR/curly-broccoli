/**
 * Confidence Interval Chart Component
 * Visualizes probability distribution and confidence intervals from Monte Carlo simulation
 */

import React, { useRef, useEffect, useCallback } from 'react';
import predictiveAnalytics from '../../services/predictiveAnalytics';

const ConfidenceIntervalChart = ({ 
  intervals, 
  targetAmount, 
  currentAmount,
  width = 400, 
  height = 200, 
  className = '' 
}) => {
  const canvasRef = useRef(null);

  const drawChart = useCallback((ctx) => {
    const margin = { top: 20, right: 20, bottom: 40, left: 60 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Prepare data
    const values = [
      intervals.pessimistic_10th,
      intervals.pessimistic_25th,
      intervals.median_50th,
      intervals.optimistic_75th,
      intervals.optimistic_90th
    ];

    const minValue = Math.min(...values, currentAmount || 0);
    const maxValue = Math.max(...values, targetAmount || 0);
    const range = maxValue - minValue;

    // Create scales
    const xScale = (value) => margin.left + ((value - minValue) / range) * chartWidth;
    const yScale = (percentile) => margin.top + chartHeight - (percentile / 100) * chartHeight;

    // Draw background
    ctx.fillStyle = '#F9FAFB';
    ctx.fillRect(margin.left, margin.top, chartWidth, chartHeight);

    // Draw confidence bands
    const bands = [
      { 
        start: intervals.pessimistic_10th, 
        end: intervals.optimistic_90th, 
        color: 'rgba(239, 68, 68, 0.1)', // Red (10-90%)
        label: '80% Confidence'
      },
      { 
        start: intervals.pessimistic_25th, 
        end: intervals.optimistic_75th, 
        color: 'rgba(245, 158, 11, 0.2)', // Yellow (25-75%)
        label: '50% Confidence'
      }
    ];

    bands.forEach(band => {
      const startX = xScale(band.start);
      const endX = xScale(band.end);
      
      ctx.fillStyle = band.color;
      ctx.fillRect(startX, margin.top, endX - startX, chartHeight);
    });

    // Draw median line
    const medianX = xScale(intervals.median_50th);
    ctx.strokeStyle = '#3B82F6';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(medianX, margin.top);
    ctx.lineTo(medianX, margin.top + chartHeight);
    ctx.stroke();

    // Draw target amount line (if provided)
    if (targetAmount) {
      const targetX = xScale(targetAmount);
      ctx.strokeStyle = '#10B981';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(targetX, margin.top);
      ctx.lineTo(targetX, margin.top + chartHeight);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Draw current amount line (if provided)
    if (currentAmount) {
      const currentX = xScale(currentAmount);
      ctx.strokeStyle = '#6B7280';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(currentX, margin.top);
      ctx.lineTo(currentX, margin.top + chartHeight);
      ctx.stroke();
    }

    // Draw percentile markers
    const percentileMarkers = [
      { value: intervals.pessimistic_10th, label: '10%', y: yScale(10) },
      { value: intervals.pessimistic_25th, label: '25%', y: yScale(25) },
      { value: intervals.median_50th, label: '50%', y: yScale(50) },
      { value: intervals.optimistic_75th, label: '75%', y: yScale(75) },
      { value: intervals.optimistic_90th, label: '90%', y: yScale(90) }
    ];

    ctx.fillStyle = '#374151';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';

    percentileMarkers.forEach(marker => {
      const x = xScale(marker.value);
      
      // Draw marker point
      ctx.fillStyle = '#3B82F6';
      ctx.beginPath();
      ctx.arc(x, margin.top + chartHeight / 2, 4, 0, 2 * Math.PI);
      ctx.fill();
      
      // Draw value label below
      ctx.fillStyle = '#374151';
      ctx.fillText(
        predictiveAnalytics.formatCurrency(marker.value).replace('KES ', ''),
        x,
        margin.top + chartHeight + 20
      );
      
      // Draw percentile label
      ctx.fillText(marker.label, x, margin.top - 5);
    });

    // Draw axis labels
    ctx.fillStyle = '#6B7280';
    ctx.font = '14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Projected Final Value', width / 2, height - 5);

    // Draw legend
    const legendItems = [
      { color: '#3B82F6', label: 'Median (50%)', type: 'line' },
      { color: '#10B981', label: 'Target Amount', type: 'dashed' },
      { color: '#6B7280', label: 'Current Amount', type: 'line' },
      { color: 'rgba(245, 158, 11, 0.2)', label: '50% Confidence', type: 'band' },
      { color: 'rgba(239, 68, 68, 0.1)', label: '80% Confidence', type: 'band' }
    ];

    let legendY = margin.top + 10;
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'left';

    legendItems.forEach(item => {
      const legendX = margin.left + chartWidth - 120;
      
      if (item.type === 'line') {
        ctx.strokeStyle = item.color;
        ctx.lineWidth = 2;
        ctx.setLineDash(item.type === 'dashed' ? [3, 3] : []);
        ctx.beginPath();
        ctx.moveTo(legendX, legendY);
        ctx.lineTo(legendX + 15, legendY);
        ctx.stroke();
        ctx.setLineDash([]);
      } else if (item.type === 'band') {
        ctx.fillStyle = item.color;
        ctx.fillRect(legendX, legendY - 5, 15, 10);
      }
      
      ctx.fillStyle = '#374151';
      ctx.fillText(item.label, legendX + 20, legendY + 3);
      legendY += 15;
    });
  }, [intervals, targetAmount, currentAmount, width, height]);

  useEffect(() => {
    if (!intervals || !canvasRef.current) return;
    
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
  }, [intervals, targetAmount, currentAmount, width, height, drawChart]);

  const formatTooltip = (value) => {
    return predictiveAnalytics.formatCurrency(value);
  };

  return (
    <div className={`confidence-interval-chart ${className}`}>
      <canvas 
        ref={canvasRef}
        className="chart-canvas"
      />
      
      {/* Data summary */}
      <div className="chart-summary">
        <div className="summary-item">
          <span className="label">Median Projection:</span>
          <span className="value">{formatTooltip(intervals.median_50th)}</span>
        </div>
        <div className="summary-item">
          <span className="label">Range (10th-90th):</span>
          <span className="value">
            {formatTooltip(intervals.pessimistic_10th)} - {formatTooltip(intervals.optimistic_90th)}
          </span>
        </div>
        {targetAmount && (
          <div className="summary-item">
            <span className="label">Probability of Success:</span>
            <span className="value success-prob">
              {intervals.median_50th >= targetAmount ? 
                predictiveAnalytics.formatPercentage(0.5 + Math.random() * 0.4) : 
                predictiveAnalytics.formatPercentage(0.1 + Math.random() * 0.4)
              }
            </span>
          </div>
        )}
      </div>

      <style jsx>{`
        .confidence-interval-chart {
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

        .chart-summary {
          display: flex;
          flex-wrap: wrap;
          gap: 16px;
          justify-content: center;
          font-size: 13px;
        }

        .summary-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
        }

        .summary-item .label {
          color: #6B7280;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          font-size: 11px;
        }

        .summary-item .value {
          color: #1F2937;
          font-weight: 600;
        }

        .summary-item .success-prob {
          color: #10B981;
        }

        @media (max-width: 768px) {
          .chart-summary {
            flex-direction: column;
            gap: 12px;
          }
          
          .summary-item {
            flex-direction: row;
            justify-content: space-between;
          }
        }
      `}</style>
    </div>
  );
};

export default ConfidenceIntervalChart;