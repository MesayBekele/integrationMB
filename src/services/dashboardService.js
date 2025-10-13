// Mock service that simulates API calls for dashboard data
export const fetchDashboardData = async () => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // Simulate potential network errors (10% chance)
  if (Math.random() < 0.1) {
    throw new Error('Network error: Failed to fetch dashboard data');
  }

  return {
    chartData: [
      { label: 'Q1 Sales', value: 85.5, color: 'hsl(200, 70%, 50%)' },
      { label: 'Q2 Sales', value: 92.3, color: 'hsl(120, 70%, 50%)' },
      { label: 'Q3 Sales', value: 78.9, color: 'hsl(60, 70%, 50%)' },
      { label: 'Q4 Sales', value: 95.2, color: 'hsl(300, 70%, 50%)' }
    ],
    analyticsData: {
      pageViews: {
        '7d': { current: 15200, previous: 13800, change: 10.1 },
        '30d': { current: 52000, previous: 48500, change: 7.2 },
        '90d': { current: 145000, previous: 138000, change: 5.1 }
      },
      uniqueVisitors: {
        '7d': { current: 4100, previous: 3700, change: 10.8 },
        '30d': { current: 14500, previous: 13200, change: 9.8 },
        '90d': { current: 42000, previous: 39500, change: 6.3 }
      },
      bounceRate: {
        '7d': { current: 42.1, previous: 45.8, change: -8.1 },
        '30d': { current: 41.2, previous: 44.5, change: -7.4 },
        '90d': { current: 43.1, previous: 46.2, change: -6.7 }
      },
      avgSessionDuration: {
        '7d': { current: 195, previous: 182, change: 7.1 },
        '30d': { current: 201, previous: 188, change: 6.9 },
        '90d': { current: 198, previous: 185, change: 7.0 }
      }
    },
    stats: {
      totalUsers: 25847,
      revenue: 142350,
      activeSessions: 1247
    },
    lastUpdated: new Date().toISOString()
  };
};

export const fetchUserData = async (userId) => {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  if (!userId) {
    throw new Error('User ID is required');
  }

  return {
    id: userId,
    name: `User ${userId}`,
    email: `user${userId}@example.com`,
    role: 'user',
    preferences: {
      theme: 'light',
      notifications: true,
      language: 'en'
    },
    lastLogin: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
  };
};

export const fetchProductData = async (filters = {}) => {
  await new Promise(resolve => setTimeout(resolve, 600));
  
  const allProducts = [
    { id: 1, name: 'Laptop Pro', price: 1299.99, category: 'Electronics', inStock: true },
    { id: 2, name: 'Wireless Headphones', price: 199.99, category: 'Electronics', inStock: true },
    { id: 3, name: 'Coffee Maker', price: 89.99, category: 'Appliances', inStock: false },
    { id: 4, name: 'Desk Chair', price: 249.99, category: 'Furniture', inStock: true },
    { id: 5, name: 'Monitor 4K', price: 399.99, category: 'Electronics', inStock: true },
    { id: 6, name: 'Standing Desk', price: 599.99, category: 'Furniture', inStock: false },
    { id: 7, name: 'Smartphone', price: 799.99, category: 'Electronics', inStock: true },
    { id: 8, name: 'Tablet', price: 329.99, category: 'Electronics', inStock: true }
  ];

  let filteredProducts = allProducts;

  if (filters.category) {
    filteredProducts = filteredProducts.filter(p => p.category === filters.category);
  }

  if (filters.inStock !== undefined) {
    filteredProducts = filteredProducts.filter(p => p.inStock === filters.inStock);
  }

  if (filters.minPrice) {
    filteredProducts = filteredProducts.filter(p => p.price >= filters.minPrice);
  }

  if (filters.maxPrice) {
    filteredProducts = filteredProducts.filter(p => p.price <= filters.maxPrice);
  }

  return {
    products: filteredProducts,
    total: filteredProducts.length,
    filters: filters
  };
};
