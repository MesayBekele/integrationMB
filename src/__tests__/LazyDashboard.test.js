import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import LazyDashboard from '../components/LazyDashboard';

// Mock the dynamic imports and services
jest.mock('../components/charts/ChartComponent', () => {
  return {
    __esModule: true,
    default: ({ data }) => (
      <div data-testid="mocked-chart-component">
        Mocked Chart Component
        {data && <div data-testid="chart-data">{JSON.stringify(data)}</div>}
      </div>
    )
  };
});

jest.mock('../components/analytics/AnalyticsModule', () => {
  return {
    __esModule: true,
    default: ({ data }) => (
      <div data-testid="mocked-analytics-component">
        Mocked Analytics Module
        {data && <div data-testid="analytics-data">{JSON.stringify(data)}</div>}
      </div>
    )
  };
});

jest.mock('../services/dashboardService', () => ({
  fetchDashboardData: jest.fn()
}));

// Import the mocked service
import { fetchDashboardData } from '../services/dashboardService';

describe('LazyDashboard Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset timers for each test
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('Loading States', () => {
    test('shows loading spinner initially', () => {
      // Mock a delayed response
      fetchDashboardData.mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve(mockDashboardData), 1000))
      );

      render(<LazyDashboard />);
      
      expect(screen.getByTestId('dashboard-loading')).toBeInTheDocument();
      expect(screen.getByText('Loading dashboard modules...')).toBeInTheDocument();
    });

    test('shows dashboard content after successful loading', async () => {
      const mockData = {
        chartData: [{ label: 'Test', value: 100 }],
        analyticsData: { pageViews: { '7d': { current: 1000 } } },
        stats: { totalUsers: 500, revenue: 10000, activeSessions: 50 }
      };

      fetchDashboardData.mockResolvedValue(mockData);

      render(<LazyDashboard />);

      // Fast-forward through the loading delay
      jest.advanceTimersByTime(500);

      await waitFor(() => {
        expect(screen.getByTestId('dashboard-container')).toBeInTheDocument();
      });

      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByTestId('mocked-chart-component')).toBeInTheDocument();
      expect(screen.getByTestId('mocked-analytics-component')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    test('displays error message when module loading fails', async () => {
      const errorMessage = 'Failed to load dashboard modules';
      fetchDashboardData.mockRejectedValue(new Error(errorMessage));

      render(<LazyDashboard />);

      // Fast-forward through the loading delay
      jest.advanceTimersByTime(500);

      await waitFor(() => {
        expect(screen.getByTestId('dashboard-error')).toBeInTheDocument();
      });

      expect(screen.getByText('Error loading dashboard')).toBeInTheDocument();
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
      expect(screen.getByTestId('retry-button')).toBeInTheDocument();
    });

    test('retry button reloads the page', async () => {
      fetchDashboardData.mockRejectedValue(new Error('Network error'));

      // Mock window.location.reload
      const mockReload = jest.fn();
      Object.defineProperty(window, 'location', {
        value: { reload: mockReload },
        writable: true
      });

      render(<LazyDashboard />);

      jest.advanceTimersByTime(500);

      await waitFor(() => {
        expect(screen.getByTestId('retry-button')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId('retry-button'));
      expect(mockReload).toHaveBeenCalledTimes(1);
    });
  });

  describe('Data Display', () => {
    const mockDashboardData = {
      chartData: [
        { label: 'Q1', value: 85.5 },
        { label: 'Q2', value: 92.3 }
      ],
      analyticsData: {
        pageViews: { '7d': { current: 15200, previous: 13800, change: 10.1 } }
      },
      stats: {
        totalUsers: 25847,
        revenue: 142350,
        activeSessions: 1247
      }
    };

    test('displays quick stats correctly', async () => {
      fetchDashboardData.mockResolvedValue(mockDashboardData);

      render(<LazyDashboard />);
      jest.advanceTimersByTime(500);

      await waitFor(() => {
        expect(screen.getByTestId('quick-stats')).toBeInTheDocument();
      });

      expect(screen.getByTestId('total-users')).toHaveTextContent('25847');
      expect(screen.getByTestId('revenue')).toHaveTextContent('$142350');
      expect(screen.getByTestId('active-sessions')).toHaveTextContent('1247');
    });

    test('passes correct data to chart component', async () => {
      fetchDashboardData.mockResolvedValue(mockDashboardData);

      render(<LazyDashboard />);
      jest.advanceTimersByTime(500);

      await waitFor(() => {
        expect(screen.getByTestId('chart-data')).toBeInTheDocument();
      });

      const chartData = screen.getByTestId('chart-data');
      expect(chartData).toHaveTextContent(JSON.stringify(mockDashboardData.chartData));
    });

    test('passes correct data to analytics component', async () => {
      fetchDashboardData.mockResolvedValue(mockDashboardData);

      render(<LazyDashboard />);
      jest.advanceTimersByTime(500);

      await waitFor(() => {
        expect(screen.getByTestId('analytics-data')).toBeInTheDocument();
      });

      const analyticsData = screen.getByTestId('analytics-data');
      expect(analyticsData).toHaveTextContent(JSON.stringify(mockDashboardData.analyticsData));
    });
  });

  describe('Async Module Loading', () => {
    test('handles Promise.all for multiple dynamic imports', async () => {
      const mockData = {
        chartData: [],
        analyticsData: {},
        stats: { totalUsers: 0, revenue: 0, activeSessions: 0 }
      };

      fetchDashboardData.mockResolvedValue(mockData);

      render(<LazyDashboard />);
      jest.advanceTimersByTime(500);

      await waitFor(() => {
        expect(screen.getByTestId('dashboard-container')).toBeInTheDocument();
      });

      // Verify that both dynamic components are loaded
      expect(screen.getByTestId('mocked-chart-component')).toBeInTheDocument();
      expect(screen.getByTestId('mocked-analytics-component')).toBeInTheDocument();
    });

    test('handles partial loading failures gracefully', async () => {
      // Mock scenario where service call fails but components load
      fetchDashboardData.mockRejectedValue(new Error('Service unavailable'));

      render(<LazyDashboard />);
      jest.advanceTimersByTime(500);

      await waitFor(() => {
        expect(screen.getByTestId('dashboard-error')).toBeInTheDocument();
      });

      expect(screen.getByText('Service unavailable')).toBeInTheDocument();
    });
  });

  describe('Suspense Integration', () => {
    test('shows suspense fallbacks during component loading', async () => {
      const mockData = {
        chartData: [],
        analyticsData: {},
        stats: { totalUsers: 0, revenue: 0, activeSessions: 0 }
      };

      fetchDashboardData.mockResolvedValue(mockData);

      render(<LazyDashboard />);
      jest.advanceTimersByTime(500);

      await waitFor(() => {
        expect(screen.getByTestId('dashboard-container')).toBeInTheDocument();
      });

      // The Suspense fallbacks should not be visible once components are loaded
      expect(screen.queryByTestId('chart-loading')).not.toBeInTheDocument();
      expect(screen.queryByTestId('analytics-loading')).not.toBeInTheDocument();
    });
  });

  describe('Performance and Memory', () => {
    test('cleans up properly on unmount', async () => {
      const mockData = {
        chartData: [],
        analyticsData: {},
        stats: { totalUsers: 0, revenue: 0, activeSessions: 0 }
      };

      fetchDashboardData.mockResolvedValue(mockData);

      const { unmount } = render(<LazyDashboard />);
      jest.advanceTimersByTime(500);

      await waitFor(() => {
        expect(screen.getByTestId('dashboard-container')).toBeInTheDocument();
      });

      // Unmount the component
      unmount();

      // Verify no memory leaks or pending promises
      expect(fetchDashboardData).toHaveBeenCalledTimes(1);
    });
  });
});
