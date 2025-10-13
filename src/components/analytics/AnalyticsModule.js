import React, { useState, useEffect } from 'react';

const AnalyticsModule = ({ data }) => {
  const [analytics, setAnalytics] = useState(null);
  const [selectedMetric, setSelectedMetric] = useState('pageViews');
  const [timeRange, setTimeRange] = useState('7d');

  useEffect(() => {
    // Simulate analytics data processing
    const processAnalytics = () => {
      const mockAnalytics = data || {
        pageViews: {
          '7d': { current: 12500, previous: 11200, change: 11.6 },
          '30d': { current: 45000, previous: 42000, change: 7.1 },
          '90d': { current: 125000, previous: 118000, change: 5.9 }
        },
        uniqueVisitors: {
          '7d': { current: 3200, previous: 2900, change: 10.3 },
          '30d': { current: 12000, previous: 11500, change: 4.3 },
          '90d': { current: 35000, previous: 33000, change: 6.1 }
        },
        bounceRate: {
          '7d': { current: 45.2, previous: 48.1, change: -6.0 },
          '30d': { current: 43.8, previous: 46.2, change: -5.2 },
          '90d': { current: 44.5, previous: 47.0, change: -5.3 }
        },
        avgSessionDuration: {
          '7d': { current: 185, previous: 172, change: 7.6 },
          '30d': { current: 192, previous: 180, change: 6.7 },
          '90d': { current: 188, previous: 175, change: 7.4 }
        }
      };
      
      setAnalytics(mockAnalytics);
    };

    processAnalytics();
  }, [data]);

  const formatValue = (metric, value) => {
    switch (metric) {
      case 'pageViews':
      case 'uniqueVisitors':
        return value.toLocaleString();
      case 'bounceRate':
        return `${value.toFixed(1)}%`;
      case 'avgSessionDuration':
        return `${Math.floor(value / 60)}m ${value % 60}s`;
      default:
        return value;
    }
  };

  const getChangeColor = (change) => {
    if (selectedMetric === 'bounceRate') {
      return change < 0 ? 'green' : 'red'; // Lower bounce rate is better
    }
    return change > 0 ? 'green' : 'red';
  };

  if (!analytics) {
    return (
      <div data-testid="analytics-loading" className="analytics-loading">
        Loading analytics...
      </div>
    );
  }

  const currentData = analytics[selectedMetric]?.[timeRange];

  return (
    <div data-testid="analytics-container" className="analytics-container">
      <div className="analytics-controls">
        <div className="metric-selector">
          <label htmlFor="metric-select">Metric:</label>
          <select
            id="metric-select"
            data-testid="metric-selector"
            value={selectedMetric}
            onChange={(e) => setSelectedMetric(e.target.value)}
          >
            <option value="pageViews">Page Views</option>
            <option value="uniqueVisitors">Unique Visitors</option>
            <option value="bounceRate">Bounce Rate</option>
            <option value="avgSessionDuration">Avg Session Duration</option>
          </select>
        </div>

        <div className="time-range-selector">
          <label htmlFor="time-range-select">Time Range:</label>
          <select
            id="time-range-select"
            data-testid="time-range-selector"
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
        </div>
      </div>

      <div className="analytics-display">
        <div className="metric-card" data-testid="metric-card">
          <h3 className="metric-title">
            {selectedMetric.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
          </h3>
          
          <div className="metric-value" data-testid="metric-value">
            {formatValue(selectedMetric, currentData?.current || 0)}
          </div>
          
          <div className="metric-comparison" data-testid="metric-comparison">
            <span>vs previous period: </span>
            <span 
              className={`change ${getChangeColor(currentData?.change || 0)}`}
              data-testid="metric-change"
            >
              {currentData?.change > 0 ? '+' : ''}{currentData?.change?.toFixed(1) || 0}%
            </span>
          </div>
          
          <div className="metric-details" data-testid="metric-details">
            <div>Current: {formatValue(selectedMetric, currentData?.current || 0)}</div>
            <div>Previous: {formatValue(selectedMetric, currentData?.previous || 0)}</div>
          </div>
        </div>

        <div className="analytics-summary" data-testid="analytics-summary">
          <h4>Summary for {timeRange}</h4>
          <ul>
            {Object.entries(analytics).map(([metric, data]) => (
              <li key={metric} data-testid={`summary-${metric}`}>
                <strong>{metric.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:</strong>
                {' '}
                {formatValue(metric, data[timeRange]?.current || 0)}
                {' '}
                <span className={getChangeColor(data[timeRange]?.change || 0)}>
                  ({data[timeRange]?.change > 0 ? '+' : ''}{data[timeRange]?.change?.toFixed(1) || 0}%)
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsModule;
