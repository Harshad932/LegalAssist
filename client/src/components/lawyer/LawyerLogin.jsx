import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import LawyerHeader from '../../components/lawyer/LawyerHeader';
import '../../assets/styles/lawyer/LawyerLogin.css';

export default function LawyerLogin() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/lawyer/auth/login`, formData);
      
      if (response.data.success) {
        localStorage.setItem('lawyerToken', response.data.token);
        localStorage.setItem('lawyerData', JSON.stringify({
          id: response.data.id,
          name: response.data.name,
          email: response.data.email,
          role: response.data.role
        }));
        navigate('/lawyer/profile');
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="lawyer-app-container">
      <LawyerHeader />
      
      <div className="lawyer-login-container">
        <div className="lawyer-login-content">
          <div className="lawyer-login-left">
            <div className="lawyer-login-card">
              <div className="lawyer-login-card-inner">
                <div className="lawyer-login-form-header">
                  <h2 className="lawyer-login-heading">Attorney Login</h2>
                  <p className="lawyer-login-subheading">Access your cases and client communications</p>
                </div>
                
                {error && (
                  <div className="lawyer-login-error">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="12" y1="8" x2="12" y2="12"></line>
                      <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                    <span>{error}</span>
                  </div>
                )}
                
                <form onSubmit={handleSubmit} className="lawyer-login-form">
                  <div className="lawyer-login-input-group">
                    <label className="lawyer-login-label">Email Address</label>
                    <div className="lawyer-login-input-wrapper">
                      <svg className="lawyer-login-input-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                        <polyline points="22,6 12,13 2,6"></polyline>
                      </svg>
                      <input
                        className="lawyer-login-input"
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="your@email.com"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="lawyer-login-input-group">
                    <div className="lawyer-login-label-row">
                      <label className="lawyer-login-label">Password</label>
                      <Link to="/lawyer/forgot-password" className="lawyer-login-forgot">Forgot Password?</Link>
                    </div>
                    <div className="lawyer-login-input-wrapper">
                      <svg className="lawyer-login-input-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                      </svg>
                      <input
                        className="lawyer-login-input"
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Your password"
                        required
                        minLength="6"
                      />
                    </div>
                  </div>
                  
                  <div className="lawyer-login-remember">
                    <label className="lawyer-login-checkbox">
                      <input type="checkbox" />
                      <span className="lawyer-login-checkbox-mark"></span>
                      <span>Remember me on this device</span>
                    </label>
                  </div>
                  
                  <button 
                    type="submit" 
                    className={`lawyer-login-button ${loading ? 'lawyer-login-button-loading' : ''}`}
                    disabled={loading}
                  >
                    {loading ? (
                      <span className="lawyer-login-spinner"></span>
                    ) : (
                      <>
                        Sign In
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="5" y1="12" x2="19" y2="12"></line>
                          <polyline points="12 5 19 12 12 19"></polyline>
                        </svg>
                      </>
                    )}
                  </button>
                </form>
                
                <div className="lawyer-login-footer">
                  <p>Don't have an account? <Link to="/lawyer/registration" className="lawyer-login-signup-link">Create Account</Link></p>
                  <div className="lawyer-login-security">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                    </svg>
                    <span>Secure, encrypted connection</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="lawyer-login-right">
            <div className="lawyer-login-features">
              <h3>Welcome to Legal Assist Attorney Portal</h3>
              <div className="lawyer-login-features-list">
                <div className="lawyer-login-feature">
                  <div className="lawyer-login-feature-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                      <polyline points="22 4 12 14.01 9 11.01"></polyline>
                    </svg>
                  </div>
                  <div className="lawyer-login-feature-text">
                    <h4>Secure Client Communications</h4>
                    <p>End-to-end encrypted messaging with your clients</p>
                  </div>
                </div>
                
                <div className="lawyer-login-feature">
                  <div className="lawyer-login-feature-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                      <polyline points="14 2 14 8 20 8"></polyline>
                      <line x1="16" y1="13" x2="8" y2="13"></line>
                      <line x1="16" y1="17" x2="8" y2="17"></line>
                      <polyline points="10 9 9 9 8 9"></polyline>
                    </svg>
                  </div>
                  <div className="lawyer-login-feature-text">
                    <h4>Case Management</h4>
                    <p>Organize all your cases and documents in one place</p>
                  </div>
                </div>
                
                <div className="lawyer-login-feature">
                  <div className="lawyer-login-feature-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                      <line x1="16" y1="2" x2="16" y2="6"></line>
                      <line x1="8" y1="2" x2="8" y2="6"></line>
                      <line x1="3" y1="10" x2="21" y2="10"></line>
                    </svg>
                  </div>
                  <div className="lawyer-login-feature-text">
                    <h4>Scheduling & Reminders</h4>
                    <p>Never miss important dates and deadlines</p>
                  </div>
                </div>
              </div>
              
              <div className="lawyer-login-badge">
                <div className="lawyer-login-badge-icon">🔐</div>
                <div className="lawyer-login-badge-text">
                  <span>ABA Compliant</span>
                  <p>Meeting all security standards for legal professionals</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}