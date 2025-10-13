import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import UserProfile from './components/UserProfile';
import LazyDashboard from './components/LazyDashboard';
import ProductList from './components/ProductList';
import { UserProvider } from './context/UserContext';
import './App.css';

function App() {
  const [theme, setTheme] = useState('light');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate app initialization
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  if (isLoading) {
    return (
      <div className="loading-container" data-testid="loading-spinner">
        <div className="spinner">Loading...</div>
      </div>
    );
  }

  return (
    <UserProvider>
      <Router>
        <div className={`app ${theme}`} data-testid="app-container">
          <header className="app-header">
            <nav>
              <Link to="/" data-testid="home-link">Home</Link>
              <Link to="/profile" data-testid="profile-link">Profile</Link>
              <Link to="/dashboard" data-testid="dashboard-link">Dashboard</Link>
              <Link to="/products" data-testid="products-link">Products</Link>
            </nav>
            <button 
              onClick={toggleTheme} 
              data-testid="theme-toggle"
              className="theme-toggle"
            >
              Switch to {theme === 'light' ? 'dark' : 'light'} mode
            </button>
          </header>

          <main className="app-main">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/profile" element={<UserProfile />} />
              <Route path="/dashboard" element={<LazyDashboard />} />
              <Route path="/products" element={<ProductList />} />
            </Routes>
          </main>
        </div>
      </Router>
    </UserProvider>
  );
}

const Home = () => (
  <div data-testid="home-page">
    <h1>Welcome to the Complex React App</h1>
    <p>This app demonstrates various testing scenarios including lazy loading, context, and complex interactions.</p>
  </div>
);

export default App;
