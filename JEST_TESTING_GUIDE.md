# Jest React Testing Guide - Complex App with Lazy Loading

This guide demonstrates comprehensive Jest testing strategies for React applications, including complex scenarios like lazy loading, async operations, context management, and integration testing.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run only unit tests
npm run test:unit

# Run only integration tests
npm run test:integration

# Run tests related to lazy loading
npm run test:lazy
```

## 📁 Project Structure

```
src/
├── __tests__/                    # Test files
│   ├── LazyDashboard.test.js     # Component tests with lazy loading
│   └── integration/              # Integration tests
│       └── App.integration.test.js
├── __mocks__/                    # Mock files
│   └── fileMock.js              # Static asset mocks
├── components/                   # React components
│   ├── LazyDashboard.js         # Component with dynamic imports
│   ├── UserProfile.js           # Component with context
│   ├── charts/
│   │   └── ChartComponent.js    # Lazy-loaded component
│   └── analytics/
│       └── AnalyticsModule.js   # Another lazy-loaded component
├── context/
│   └── UserContext.js           # React context
├── services/
│   └── dashboardService.js      # API services
├── setupTests.js                # Jest setup
└── App.js                       # Main app component
```

## 🧪 Testing Strategies Covered

### 1. **Lazy Loading & Dynamic Imports**

The `LazyDashboard` component demonstrates testing components that use:
- Top-level `await` with dynamic imports
- `Promise.all()` for multiple async operations
- Error handling for failed imports
- Loading states during module resolution

```javascript
// Example from LazyDashboard.test.js
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
```

### 2. **Mocking Dynamic Imports**

```javascript
// Mock dynamic imports at the top of test files
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
```

### 3. **Async Operations & Timers**

```javascript
beforeEach(() => {
  jest.useFakeTimers();
});

afterEach(() => {
  jest.runOnlyPendingTimers();
  jest.useRealTimers();
});

test('shows loading spinner initially', () => {
  fetchDashboardData.mockImplementation(() => 
    new Promise(resolve => setTimeout(() => resolve(mockData), 1000))
  );

  render(<LazyDashboard />);
  
  expect(screen.getByTestId('dashboard-loading')).toBeInTheDocument();
  
  // Fast-forward through the loading delay
  jest.advanceTimersByTime(500);
});
```

### 4. **Error Handling**

```javascript
test('displays error message when module loading fails', async () => {
  const errorMessage = 'Failed to load dashboard modules';
  fetchDashboardData.mockRejectedValue(new Error(errorMessage));

  render(<LazyDashboard />);
  jest.advanceTimersByTime(500);

  await waitFor(() => {
    expect(screen.getByTestId('dashboard-error')).toBeInTheDocument();
  });

  expect(screen.getByText('Error loading dashboard')).toBeInTheDocument();
  expect(screen.getByText(errorMessage)).toBeInTheDocument();
});
```

### 5. **Integration Testing**

The integration tests demonstrate:
- Full app navigation flow
- Context state management across components
- Theme persistence across routes
- Error recovery scenarios

```javascript
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
  jest.advanceTimersByTime(500);
  
  await waitFor(() => {
    expect(screen.getByTestId('dashboard-container')).toBeInTheDocument();
  });
});
```

### 6. **Context Testing**

```javascript
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
```

## 🔧 Key Testing Utilities

### Mock Setup

```javascript
// Global mocks in setupTests.js
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
};

// Service mocks
jest.mock('../services/dashboardService', () => ({
  fetchDashboardData: jest.fn(),
  fetchUserData: jest.fn(),
  fetchProductData: jest.fn()
}));
```

### Custom Test Utilities

```javascript
// Global test utilities in setupTests.js
global.testUtils = {
  waitForAsync: (ms = 0) => new Promise(resolve => setTimeout(resolve, ms)),
  
  createMockService: (defaultResolveValue = {}) => ({
    mockResolvedValue: jest.fn().mockResolvedValue(defaultResolveValue),
    mockRejectedValue: jest.fn().mockRejectedValue(new Error('Mock error')),
    mockImplementation: jest.fn()
  })
};
```

## 📊 Coverage Configuration

```javascript
// jest.config.js
coverageThreshold: {
  global: {
    branches: 70,
    functions: 70,
    lines: 70,
    statements: 70
  }
}
```

## 🎯 Best Practices Demonstrated

### 1. **Test Organization**
- Separate unit and integration tests
- Group related tests with `describe` blocks
- Use descriptive test names

### 2. **Mock Management**
- Clear mocks between tests
- Use realistic mock data
- Mock at the appropriate level (service vs component)

### 3. **Async Testing**
- Use `waitFor` for async operations
- Control timers with `jest.useFakeTimers()`
- Test loading states and error conditions

### 4. **Accessibility Testing**
- Test keyboard navigation
- Verify focus management
- Check ARIA attributes

### 5. **Performance Testing**
- Test component unmounting
- Verify cleanup of event listeners
- Check for memory leaks

## 🚨 Common Pitfalls & Solutions

### 1. **Dynamic Import Issues**
```javascript
// ❌ Wrong - doesn't mock properly
jest.mock('./LazyComponent');

// ✅ Correct - mock with __esModule
jest.mock('./LazyComponent', () => ({
  __esModule: true,
  default: () => <div>Mocked Component</div>
}));
```

### 2. **Timer Management**
```javascript
// ❌ Wrong - can cause test timeouts
test('async test', async () => {
  // ... test code without timer management
});

// ✅ Correct - proper timer cleanup
beforeEach(() => jest.useFakeTimers());
afterEach(() => {
  jest.runOnlyPendingTimers();
  jest.useRealTimers();
});
```

### 3. **Context Testing**
```javascript
// ❌ Wrong - testing context in isolation
render(<ComponentThatUsesContext />);

// ✅ Correct - wrap with provider
render(
  <UserProvider>
    <ComponentThatUsesContext />
  </UserProvider>
);
```

## 🔍 Advanced Scenarios

### Testing Suspense Boundaries
```javascript
test('shows suspense fallbacks during component loading', async () => {
  render(<LazyDashboard />);
  
  // Suspense fallbacks should be visible initially
  expect(screen.getByTestId('chart-loading')).toBeInTheDocument();
  
  await waitFor(() => {
    expect(screen.getByTestId('chart-component')).toBeInTheDocument();
  });
  
  // Fallbacks should be gone after loading
  expect(screen.queryByTestId('chart-loading')).not.toBeInTheDocument();
});
```

### Testing Error Boundaries
```javascript
test('error boundary catches component errors', () => {
  const ThrowError = () => {
    throw new Error('Test error');
  };
  
  render(
    <ErrorBoundary>
      <ThrowError />
    </ErrorBoundary>
  );
  
  expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
});
```

## 📚 Additional Resources

- [React Testing Library Documentation](https://testing-library.com/docs/react-testing-library/intro/)
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Testing Async Components](https://kentcdodds.com/blog/fix-the-not-wrapped-in-act-warning)
- [Mocking ES6 Modules](https://jestjs.io/docs/es6-class-mocks)

## 🎉 Running the Examples

1. Clone this repository
2. Install dependencies: `npm install`
3. Run tests: `npm test`
4. Explore the test files to see all examples in action!

This setup provides a comprehensive foundation for testing complex React applications with Jest, including all the scenarios you mentioned: lazy loading, dynamic imports, context management, and integration testing.
