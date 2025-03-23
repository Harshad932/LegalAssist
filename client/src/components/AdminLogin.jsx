import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
      const response = await fetch("http://localhost:4000/admin/login", {
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
    <div className="login-container">
      <div className="login-bg-animation">
        {[...Array(10)].map((_, i) => (
          <div key={i} className="login-cube"></div>
        ))}
      </div>
      
      <div className="login-header">
        <div className="login-logo">
          <span className="logo-text">Legal</span>
          <span className="logo-highlight">Assist</span>
        </div>
        <div className="login-back-link" onClick={() => navigate('/')}>
          <i className="login-back-icon">←</i> Back to Main Site
        </div>
      </div>
      
      <div className={`login-form-container ${animation ? 'animate-in' : ''}`}>
        <div className="login-card-3d-wrapper">
          <div className="login-card-front">
            <div className="login-title">Admin Portal</div>
            
            {notification.message && (
              <div className={`login-notification login-notification-${notification.type}`}>
                {notification.message}
              </div>
            )}
            
            <form className="login-form" onSubmit={handleSubmit}>
              <div className="login-form-group">
                <label className="login-label" htmlFor="username">Username</label>
                <div className="login-input-container">
                  <input
                    className="login-input"
                    type="text"
                    id="username"
                    name="username"
                    value={publicUser.username}
                    onChange={handlePublicInputChange}
                    required
                  />
                  <div className="login-input-focus-effect"></div>
                </div>
              </div>
              
              <div className="login-form-group">
                <label className="login-label" htmlFor="password">Password</label>
                <div className="login-input-container">
                  <input
                    className="login-input"
                    type="password"
                    id="password"
                    name="password"
                    value={publicUser.password}
                    onChange={handlePublicInputChange}
                    required
                  />
                  <div className="login-input-focus-effect"></div>
                </div>
              </div>
              
              <button className="login-submit-btn" type="submit" disabled={loading}>
                {loading ? 
                  <div className="login-spinner"></div> : 
                  <span className="login-btn-text">Sign In</span>
                }
              </button>
            </form>
            
            <div className="login-forgot-password" onClick={handleForgotPassword}>
              Forgot password?
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;