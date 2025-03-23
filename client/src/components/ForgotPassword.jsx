import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import '../assets/styles/ForgotPassword.css';

function ForgotPassword() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ username: '', email: '' });
  const [errors, setErrors] = useState({ username: '', email: '' });
  const [loading, setLoading] = useState(false);
  const [animation, setAnimation] = useState(false);

  useEffect(() => {
    // Trigger entrance animation after component mounts
    setTimeout(() => {
      setAnimation(true);
    }, 100);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: '' }); // Clear error messages on input change
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Add animation effect
    setAnimation(false);
    setTimeout(() => setAnimation(true), 300);

    try {
      const response = await fetch('http://localhost:4000/admin/forgotPassword', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert('Check your email for further instructions.');
        navigate("/admin-login");
      } else {
        const error = await response.json();
        setErrors({ ...errors, [error.field]: error.message }); // Display field-specific errors
      }
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-container">
      <div className="forgot-bg-animation">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="forgot-cube"></div>
        ))}
      </div>
      
      <div className="forgot-header">
        <div className="forgot-logo">
          <span className="logo-text">Legal</span>
          <span className="logo-highlight">Assist</span>
        </div>
        <div className="forgot-back-link" onClick={() => navigate('/admin-login')}>
          <i className="forgot-back-icon">←</i> Back to Login
        </div>
      </div>
      
      <div className={`forgot-form-wrapper ${animation ? 'animate-in' : ''}`}>
        <div className="forgot-card-3d-wrapper">
          <div className="forgot-card-front">
            <h2 className="forgot-form-title">Forgot Password</h2>
            
            <form onSubmit={handleSubmit}>
              <div className="forgot-form-group">
                <label className="forgot-label" htmlFor="username">Username:</label>
                <div className="forgot-input-container">
                  <input
                    className="forgot-input"
                    type="text"
                    id="username"
                    name="username"
                    placeholder="Enter Username"
                    value={formData.username}
                    onChange={handleInputChange}
                    required
                  />
                  <div className="forgot-input-focus-effect"></div>
                </div>
                {errors.username && <span className="forgot-error-message">{errors.username}</span>}
              </div>
              
              <div className="forgot-form-group">
                <label className="forgot-label" htmlFor="email">Email:</label>
                <div className="forgot-input-container">
                  <input
                    className="forgot-input"
                    type="email"
                    id="email"
                    name="email"
                    placeholder="eg: xyz@gmail.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                  <div className="forgot-input-focus-effect"></div>
                </div>
                {errors.email && <span className="forgot-error-message">{errors.email}</span>}
              </div>
              
              <button type="submit" className="forgot-submit-button" disabled={loading}>
                {loading ? 
                  <div className="forgot-spinner"></div> : 
                  <span className="forgot-btn-text">Reset Password</span>
                }
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;