import React, { useState, useEffect, Suspense } from 'react';

// This component demonstrates top-level await with dynamic imports
const LazyDashboard = () => {
  const [chartModule, setChartModule] = useState(null);
  const [analyticsModule, setAnalyticsModule] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);

  useEffect(() => {
    // Simulate complex async module loading with top-level await pattern
    const loadModules = async () => {
      try {
        setIsLoading(true);
        
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Dynamic imports with top-level await pattern
        const [chartModuleImport, analyticsModuleImport, dashboardDataImport] = await Promise.all([
          import('./charts/ChartComponent'),
          import('./analytics/AnalyticsModule'),
          import('../services/dashboardService').then(module => module.fetchDashboardData())
        ]);

        setChartModule(chartModuleImport);
        setAnalyticsModule(analyticsModuleImport);
        setDashboardData(dashboardDataImport);
        setIsLoading(false);
      } catch (err) {
        setError(err.message);
        setIsLoading(false);
      }
    };

    loadModules();
  }, []);

  if (isLoading) {
    return (
      <div data-testid="dashboard-loading" className="dashboard-loading">
        <div className="loading-spinner">Loading dashboard modules...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div data-testid="dashboard-error" className="dashboard-error">
        <h2>Error loading dashboard</h2>
        <p>{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          data-testid="retry-button"
        >
          Retry
        </button>
      </div>
    );
  }

  const ChartComponent = chartModule?.default;
  const AnalyticsComponent = analyticsModule?.default;

  return (
    <div data-testid="dashboard-container" className="dashboard">
      <h1>Dashboard</h1>
      
      <div className="dashboard-grid">
        <div className="dashboard-section">
          <h2>Charts</h2>
          <Suspense fallback={<div data-testid="chart-loading">Loading chart...</div>}>
            {ChartComponent && (
              <ChartComponent 
                data={dashboardData?.chartData} 
                data-testid="chart-component"
              />
            )}
          </Suspense>
        </div>

        <div className="dashboard-section">
          <h2>Analytics</h2>
          <Suspense fallback={<div data-testid="analytics-loading">Loading analytics...</div>}>
            {AnalyticsComponent && (
              <AnalyticsComponent 
                data={dashboardData?.analyticsData}
                data-testid="analytics-component"
              />
            )}
          </Suspense>
        </div>

        <div className="dashboard-section">
          <h2>Quick Stats</h2>
          <div data-testid="quick-stats" className="quick-stats">
            <div className="stat-item">
              <span className="stat-label">Total Users:</span>
              <span className="stat-value" data-testid="total-users">
                {dashboardData?.stats?.totalUsers || 0}
              </span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Revenue:</span>
              <span className="stat-value" data-testid="revenue">
                ${dashboardData?.stats?.revenue || 0}
              </span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Active Sessions:</span>
              <span className="stat-value" data-testid="active-sessions">
                {dashboardData?.stats?.activeSessions || 0}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LazyDashboard;
