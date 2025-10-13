import React, { useState, useEffect } from 'react';
import { fetchProductData } from '../services/dashboardService';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    category: '',
    inStock: undefined,
    minPrice: '',
    maxPrice: ''
  });

  useEffect(() => {
    loadProducts();
  }, [filters]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchProductData(filters);
      setProducts(data.products);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  if (loading) {
    return (
      <div data-testid="products-loading" className="products-loading">
        Loading products...
      </div>
    );
  }

  if (error) {
    return (
      <div data-testid="products-error" className="products-error">
        <h2>Error loading products</h2>
        <p>{error}</p>
        <button onClick={loadProducts} data-testid="retry-products-button">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div data-testid="product-list" className="product-list">
      <h1>Products</h1>
      
      <div className="filters" data-testid="product-filters">
        <div className="filter-group">
          <label htmlFor="category">Category:</label>
          <select
            id="category"
            name="category"
            value={filters.category}
            onChange={handleFilterChange}
            data-testid="category-filter"
          >
            <option value="">All Categories</option>
            <option value="Electronics">Electronics</option>
            <option value="Furniture">Furniture</option>
            <option value="Appliances">Appliances</option>
          </select>
        </div>

        <div className="filter-group">
          <label>
            <input
              type="checkbox"
              name="inStock"
              checked={filters.inStock || false}
              onChange={handleFilterChange}
              data-testid="in-stock-filter"
            />
            In Stock Only
          </label>
        </div>

        <div className="filter-group">
          <label htmlFor="minPrice">Min Price:</label>
          <input
            type="number"
            id="minPrice"
            name="minPrice"
            value={filters.minPrice}
            onChange={handleFilterChange}
            data-testid="min-price-filter"
          />
        </div>

        <div className="filter-group">
          <label htmlFor="maxPrice">Max Price:</label>
          <input
            type="number"
            id="maxPrice"
            name="maxPrice"
            value={filters.maxPrice}
            onChange={handleFilterChange}
            data-testid="max-price-filter"
          />
        </div>
      </div>

      <div className="products-grid" data-testid="products-grid">
        {products.length === 0 ? (
          <div data-testid="no-products" className="no-products">
            No products found matching your criteria.
          </div>
        ) : (
          products.map(product => (
            <div 
              key={product.id} 
              data-testid={`product-${product.id}`}
              className={`product-card ${!product.inStock ? 'out-of-stock' : ''}`}
            >
              <h3 data-testid={`product-name-${product.id}`}>
                {product.name}
              </h3>
              <p className="product-category" data-testid={`product-category-${product.id}`}>
                {product.category}
              </p>
              <p className="product-price" data-testid={`product-price-${product.id}`}>
                ${product.price.toFixed(2)}
              </p>
              <p className={`product-stock ${product.inStock ? 'in-stock' : 'out-of-stock'}`}>
                <span data-testid={`product-stock-${product.id}`}>
                  {product.inStock ? 'In Stock' : 'Out of Stock'}
                </span>
              </p>
              <button 
                disabled={!product.inStock}
                data-testid={`add-to-cart-${product.id}`}
                className="add-to-cart-button"
              >
                {product.inStock ? 'Add to Cart' : 'Unavailable'}
              </button>
            </div>
          ))
        )}
      </div>

      <div className="products-summary" data-testid="products-summary">
        <p>Showing {products.length} products</p>
      </div>
    </div>
  );
};

export default ProductList;
