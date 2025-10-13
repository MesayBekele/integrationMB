import React from 'react';
import { render, screen, waitFor, fireEvent, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import App from '../../App';

// Mock all the services and components that make external calls
jest.mock('../../services/dashboardService', () => ({
  fetchDashboardData: jest.fn(),
  fetchUserData: jest.fn(),
  fetchProductData: jest.fn()
}));

jest.mock('../../components/charts/ChartComponent', () => {
  return {
    __esModule: true,
    default: ({ data }) => (
      <div data-testid="chart-component">
        Chart loaded with {data?.length || 0} items
      </div>
    )
  };
});

jest.mock('../../components/analytics/AnalyticsModule', () => {
  return {
    __esModule: true,
    default: ({ data }) => (
      <div data-testid="analytics-component">
        Analytics loaded
      </div>
    )
  };
});

import { fetchDashboardData, fetchUserData, fetchProductData } from '../../services/dashboardService';

describe('App Integration Tests', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    
    // Setup default mocks
    fetchDashboardData.mockResolvedValue({
      chartData: [{ label: 'Test', value: 100 }],
      analyticsData: { pageViews: { '7d': { current: 1000 } } },
      stats: { totalUsers: 500, revenue: 10000, activeSessions: 50 }
    });

    fetchUserData.mockResolvedValue({
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      role: 'admin'
    });

    fetchProductData.mockResolvedValue({
      products: [
        { id: 1, name: 'Laptop', price: 999.99, category: 'Electronics', inStock: true }
      ],
      total: 1
    });
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('App Initialization and Loading', () => {
    test('shows loading spinner during app initialization', () => {
      render(<App />);
      
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    test('shows main app after loading completes', async () => {
      render(<App />);
      
      // Fast-forward through the initialization delay
      jest.advanceTimersByTime(1000);
      
      await waitFor(() => {
        expect(screen.getByTestId('app-container')).toBeInTheDocument();
      });

      expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
      expect(screen.getByTestId('home-page')).toBeInTheDocument();
    });
  });

  describe('Navigation Integration', () => {
    test('navigates between different routes', async () => {
      render(<App />);
      
      jest.advanceTimersByTime(1000);
      
      await waitFor(() => {
        expect(screen.getByTestId('app-container')).toBeInTheDocument();
      });

      // Test navigation to profile
      await user.click(screen.getByTestId('profile-link'));
      await waitFor(() => {
        expect(screen.getByTestId('user-profile')).toBeInTheDocument();
      });

      // Test navigation to dashboard
      await user.click(screen.getByTestId('dashboard-link'));
      jest.advanceTimersByTime(500); // Dashboard loading delay
      
      await waitFor(() => {
        expect(screen.getByTestId('dashboard-container')).toBeInTheDocument();
      });

      // Test navigation back to home
      await user.click(screen.getByTestId('home-link'));
      await waitFor(() => {
        expect(screen.getByTestId('home-page')).toBeInTheDocument();
      });
    });

    test('maintains theme state across navigation', async () => {
      render(<App />);
      
      jest.advanceTimersByTime(1000);
      
      await waitFor(() => {
        expect(screen.getByTestId('app-container')).toBeInTheDocument();
      });

      const appContainer = screen.getByTestId('app-container');
      expect(appContainer).toHaveClass('light');

      // Toggle theme
      await user.click(screen.getByTestId('theme-toggle'));
      expect(appContainer).toHaveClass('dark');

      // Navigate to different page
      await user.click(screen.getByTestId('profile-link'));
      await waitFor(() => {
        expect(screen.getByTestId('user-profile')).toBeInTheDocument();
      });

      // Theme should persist
      expect(appContainer).toHaveClass('dark');
    });
  });

  describe('Dashboard Integration with Lazy Loading', () => {
    test('loads dashboard with all components successfully', async () => {
      render(<App />);
      
      jest.advanceTimersByTime(1000);
      
      await waitFor(() => {
        expect(screen.getByTestId('app-container')).toBeInTheDocument();
      });

      // Navigate to dashboard
      await user.click(screen.getByTestId('dashboard-link'));
      
      // Should show loading initially
      expect(screen.getByTestId('dashboard-loading')).toBeInTheDocument();
      
      // Fast-forward through dashboard loading
      jest.advanceTimersByTime(500);
      
      await waitFor(() => {
        expect(screen.getByTestId('dashboard-container')).toBeInTheDocument();
      });

      // Verify all dashboard components are loaded
      expect(screen.getByTestId('chart-component')).toBeInTheDocument();
      expect(screen.getByTestId('analytics-component')).toBeInTheDocument();
      expect(screen.getByTestId('quick-stats')).toBeInTheDocument();
      
      // Verify service was called
      expect(fetchDashboardData).toHaveBeenCalledTimes(1);
    });

    test('handles dashboard loading errors gracefully', async () => {
      fetchDashboardData.mockRejectedValue(new Error('Network error'));

      render(<App />);
      
      jest.advanceTimersByTime(1000);
      
      await waitFor(() => {
        expect(screen.getByTestId('app-container')).toBeInTheDocument();
      });

      await user.click(screen.getByTestId('dashboard-link'));
      jest.advanceTimersByTime(500);
      
      await waitFor(() => {
        expect(screen.getByTestId('dashboard-error')).toBeInTheDocument();
      });

      expect(screen.getByText('Network error')).toBeInTheDocument();
      expect(screen.getByTestId('retry-button')).toBeInTheDocument();
    });
  });

  describe('User Context Integration', () => {
    test('user context is available across components', async () => {
      render(<App />);
      
      jest.advanceTimersByTime(1000);
      
      await waitFor(() => {
        expect(screen.getByTestId('app-container')).toBeInTheDocument();
      });

      // Navigate to profile to test context
      await user.click(screen.getByTestId('profile-link'));
      
      await waitFor(() => {
        expect(screen.getByTestId('user-profile')).toBeInTheDocument();
      });

      // The UserProfile component should have access to context
      expect(fetchUserData).toHaveBeenCalled();
    });
  });

  describe('Theme Integration', () => {
    test('theme toggle works correctly', async () => {
      render(<App />);
      
      jest.advanceTimersByTime(1000);
      
      await waitFor(() => {
        expect(screen.getByTestId('app-container')).toBeInTheDocument();
      });

      const appContainer = screen.getByTestId('app-container');
      const themeToggle = screen.getByTestId('theme-toggle');

      // Initial state
      expect(appContainer).toHaveClass('light');
      expect(themeToggle).toHaveTextContent('Switch to dark mode');

      // Toggle to dark
      await user.click(themeToggle);
      expect(appContainer).toHaveClass('dark');
      expect(themeToggle).toHaveTextContent('Switch to light mode');

      // Toggle back to light
      await user.click(themeToggle);
      expect(appContainer).toHaveClass('light');
      expect(themeToggle).toHaveTextContent('Switch to dark mode');
    });
  });

  describe('Error Boundaries and Recovery', () => {
    test('app continues to work when individual components fail', async () => {
      // Make dashboard fail but keep other components working
      fetchDashboardData.mockRejectedValue(new Error('Dashboard service down'));

      render(<App />);
      
      jest.advanceTimersByTime(1000);
      
      await waitFor(() => {
        expect(screen.getByTestId('app-container')).toBeInTheDocument();
      });

      // Dashboard should fail
      await user.click(screen.getByTestId('dashboard-link'));
      jest.advanceTimersByTime(500);
      
      await waitFor(() => {
        expect(screen.getByTestId('dashboard-error')).toBeInTheDocument();
      });

      // But other routes should still work
      await user.click(screen.getByTestId('profile-link'));
      
      await waitFor(() => {
        expect(screen.getByTestId('user-profile')).toBeInTheDocument();
      });

      // And home should work
      await user.click(screen.getByTestId('home-link'));
      
      await waitFor(() => {
        expect(screen.getByTestId('home-page')).toBeInTheDocument();
      });
    });
  });

  describe('Performance and Memory Management', () => {
    test('components unmount cleanly when navigating', async () => {
      render(<App />);
      
      jest.advanceTimersByTime(1000);
      
      await waitFor(() => {
        expect(screen.getByTestId('app-container')).toBeInTheDocument();
      });

      // Navigate to dashboard
      await user.click(screen.getByTestId('dashboard-link'));
      jest.advanceTimersByTime(500);
      
      await waitFor(() => {
        expect(screen.getByTestId('dashboard-container')).toBeInTheDocument();
      });

      // Navigate away
      await user.click(screen.getByTestId('home-link'));
      
      await waitFor(() => {
        expect(screen.getByTestId('home-page')).toBeInTheDocument();
      });

      // Dashboard should be unmounted
      expect(screen.queryByTestId('dashboard-container')).not.toBeInTheDocument();
    });
  });

  describe('Accessibility Integration', () => {
    test('navigation is accessible via keyboard', async () => {
      render(<App />);
      
      jest.advanceTimersByTime(1000);
      
      await waitFor(() => {
        expect(screen.getByTestId('app-container')).toBeInTheDocument();
      });

      const profileLink = screen.getByTestId('profile-link');
      
      // Focus and activate via keyboard
      profileLink.focus();
      expect(profileLink).toHaveFocus();
      
      fireEvent.keyDown(profileLink, { key: 'Enter', code: 'Enter' });
      
      await waitFor(() => {
        expect(screen.getByTestId('user-profile')).toBeInTheDocument();
      });
    });

    test('theme toggle is accessible', async () => {
      render(<App />);
      
      jest.advanceTimersByTime(1000);
      
      await waitFor(() => {
        expect(screen.getByTestId('app-container')).toBeInTheDocument();
      });

      const themeToggle = screen.getByTestId('theme-toggle');
      
      // Should be focusable
      themeToggle.focus();
      expect(themeToggle).toHaveFocus();
      
      // Should work with keyboard
      fireEvent.keyDown(themeToggle, { key: 'Enter', code: 'Enter' });
      
      const appContainer = screen.getByTestId('app-container');
      expect(appContainer).toHaveClass('dark');
    });
  });
});
