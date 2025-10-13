import React, { useState, useEffect, useContext } from 'react';
import { UserContext } from '../context/UserContext';
import { fetchUserData } from '../services/dashboardService';

const UserProfile = () => {
  const { user, setUser } = useContext(UserContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    preferences: {
      theme: 'light',
      notifications: true,
      language: 'en'
    }
  });

  useEffect(() => {
    if (!user) {
      loadUserData();
    } else {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        preferences: user.preferences || {
          theme: 'light',
          notifications: true,
          language: 'en'
        }
      });
    }
  }, [user]);

  const loadUserData = async () => {
    try {
      setLoading(true);
      setError(null);
      const userData = await fetchUserData(1); // Mock user ID
      setUser(userData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.startsWith('preferences.')) {
      const prefKey = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        preferences: {
          ...prev.preferences,
          [prefKey]: type === 'checkbox' ? checked : value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const updatedUser = {
        ...user,
        ...formData
      };
      
      setUser(updatedUser);
      setEditing(false);
    } catch (err) {
      setError('Failed to save user data');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      preferences: user?.preferences || {
        theme: 'light',
        notifications: true,
        language: 'en'
      }
    });
    setEditing(false);
  };

  if (loading && !user) {
    return (
      <div data-testid="profile-loading" className="profile-loading">
        <div className="loading-spinner">Loading user profile...</div>
      </div>
    );
  }

  if (error && !user) {
    return (
      <div data-testid="profile-error" className="profile-error">
        <h2>Error loading profile</h2>
        <p>{error}</p>
        <button onClick={loadUserData} data-testid="retry-profile-button">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div data-testid="user-profile" className="user-profile">
      <div className="profile-header">
        <h1>User Profile</h1>
        {!editing && (
          <button 
            onClick={() => setEditing(true)} 
            data-testid="edit-profile-button"
            className="edit-button"
          >
            Edit Profile
          </button>
        )}
      </div>

      <div className="profile-content">
        {editing ? (
          <form data-testid="profile-form" className="profile-form">
            <div className="form-group">
              <label htmlFor="name">Name:</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                data-testid="name-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email:</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                data-testid="email-input"
              />
            </div>

            <div className="form-section">
              <h3>Preferences</h3>
              
              <div className="form-group">
                <label htmlFor="theme">Theme:</label>
                <select
                  id="theme"
                  name="preferences.theme"
                  value={formData.preferences.theme}
                  onChange={handleInputChange}
                  data-testid="theme-select"
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                  <option value="auto">Auto</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="notifications">
                  <input
                    type="checkbox"
                    id="notifications"
                    name="preferences.notifications"
                    checked={formData.preferences.notifications}
                    onChange={handleInputChange}
                    data-testid="notifications-checkbox"
                  />
                  Enable Notifications
                </label>
              </div>

              <div className="form-group">
                <label htmlFor="language">Language:</label>
                <select
                  id="language"
                  name="preferences.language"
                  value={formData.preferences.language}
                  onChange={handleInputChange}
                  data-testid="language-select"
                >
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                  <option value="de">German</option>
                </select>
              </div>
            </div>

            <div className="form-actions">
              <button
                type="button"
                onClick={handleSave}
                disabled={loading}
                data-testid="save-button"
                className="save-button"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                disabled={loading}
                data-testid="cancel-button"
                className="cancel-button"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div data-testid="profile-display" className="profile-display">
            <div className="profile-info">
              <div className="info-item">
                <strong>Name:</strong>
                <span data-testid="display-name">{user?.name || 'N/A'}</span>
              </div>
              <div className="info-item">
                <strong>Email:</strong>
                <span data-testid="display-email">{user?.email || 'N/A'}</span>
              </div>
              <div className="info-item">
                <strong>Role:</strong>
                <span data-testid="display-role">{user?.role || 'N/A'}</span>
              </div>
              <div className="info-item">
                <strong>Last Login:</strong>
                <span data-testid="display-last-login">
                  {user?.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'N/A'}
                </span>
              </div>
            </div>

            <div className="preferences-display">
              <h3>Preferences</h3>
              <div className="info-item">
                <strong>Theme:</strong>
                <span data-testid="display-theme">
                  {user?.preferences?.theme || 'light'}
                </span>
              </div>
              <div className="info-item">
                <strong>Notifications:</strong>
                <span data-testid="display-notifications">
                  {user?.preferences?.notifications ? 'Enabled' : 'Disabled'}
                </span>
              </div>
              <div className="info-item">
                <strong>Language:</strong>
                <span data-testid="display-language">
                  {user?.preferences?.language || 'en'}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div data-testid="profile-save-error" className="error-message">
          {error}
        </div>
      )}
    </div>
  );
};

export default UserProfile;
