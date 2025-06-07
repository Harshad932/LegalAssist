import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import '../assets/styles/AdminLogin.css';

const AdminLogin = () => {
  const [publicUser, setPublicUser] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ message: '', type: '' });
  const [animation, setAnimation] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Trigger animation after component mounts
    setTimeout(() => {
      setAnimation(true);
    }, 100);
  }, []);

  const handlePublicInputChange = (e) => {
    const { name, value } = e.target;
    setPublicUser({ ...publicUser, [name]: value });
  };
  
  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setNotification({ message: '', type: '' });

    // Add login animation
    setAnimation(false);
    setTimeout(() => setAnimation(true), 300);

    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/admin/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(publicUser),
        credentials: "include",
      });

      if (response.ok) {
        setNotification({ message: 'Login successful! Redirecting...', type: 'success' });
        setTimeout(() => {
          navigate('/admin-dashboard');
        }, 1000);
      } else {
        setNotification({ message: 'Invalid username or password. Please try again.', type: 'error' });
        setLoading(false);
      }
    } catch (err) {
      setNotification({ message: "Login error: " + err.message, type: 'error' });
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    navigate("/admin/forgot-password");
  };

  return (
    <>
      <Header />
      
      <div className="admin-login-container">
        <div className="admin-login-bg-animation">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="admin-login-cube"></div>
          ))}
        </div>
        
        <div className={`admin-login-form-container ${animation ? 'animate-in' : ''}`}>
          <div className="admin-login-card-wrapper">
            <div className="admin-login-card">
              <div className="admin-login-header">
                <div className="admin-login-icon">⚖️</div>
                <h1 className="admin-login-title">
                  Admin <span className="admin-login-title-accent">Portal</span>
                </h1>
                <p className="admin-login-subtitle">Secure access for authorized personnel</p>
              </div>
              
              {notification.message && (
                <div className={`admin-login-notification admin-login-notification-${notification.type}`}>
                  <div className="admin-login-notification-icon">
                    {notification.type === 'success' ? '✓' : '!'}
                  </div>
                  <p>{notification.message}</p>
                </div>
              )}
              
              <form className="admin-login-form" onSubmit={handleSubmit}>
                <div className="admin-login-form-group">
                  <label className="admin-login-label" htmlFor="username">Username</label>
                  <div className="admin-login-input-container">
                    <div className="admin-login-input-icon">👤</div>
                    <input
                      className="admin-login-input"
                      type="text"
                      id="username"
                      name="username"
                      value={publicUser.username}
                      onChange={handlePublicInputChange}
                      required
                      placeholder="Enter your username"
                    />
                    <div className="admin-login-input-focus-effect"></div>
                  </div>
                </div>
                
                <div className="admin-login-form-group">
                  <label className="admin-login-label" htmlFor="password">Password</label>
                  <div className="admin-login-input-container">
                    <div className="admin-login-input-icon">🔒</div>
                    <input
                      className="admin-login-input"
                      type="password"
                      id="password"
                      name="password"
                      value={publicUser.password}
                      onChange={handlePublicInputChange}
                      required
                      placeholder="Enter your password"
                    />
                    <div className="admin-login-input-focus-effect"></div>
                  </div>
                </div>
                
                <button className="admin-login-submit-btn" type="submit" disabled={loading}>
                  {loading ? 
                    <div className="admin-login-spinner"></div> : 
                    <span className="admin-login-btn-text">Sign In <span className="admin-login-btn-arrow">→</span></span>
                  }
                </button>
              </form>
              
              <div className="admin-login-footer">
                <div className="admin-login-forgot-password" onClick={handleForgotPassword}>
                  Forgot password?
                </div>
                <div className="admin-login-back-link" onClick={() => navigate('/')}>
                  <span className="admin-login-back-icon">←</span> Back to main site
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminLogin;