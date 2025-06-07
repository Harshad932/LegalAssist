import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import '../../assets/styles/user/UserRegistration.css';
import UserHeader from '../../components/user/UserHeader';

export default function UserRegistration() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear error when user starts typing after an error
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:4000/api/user/auth/register', formData);
      if (response.data.success) {
        navigate('/user/login');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="user-registration-container">
      <UserHeader />
      <div className="user-registration-card">
        <div className="user-registration-header">
          <h2>Create Your Account</h2>
          <p className="user-registration-subtitle">Join Legal Assist to get connected with trusted legal professionals</p>
        </div>
        
        {error && (
          <div className="user-registration-error">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FF6B6B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="user-registration-form">
          <div className="user-registration-form-group">
            <label htmlFor="name">Full Name</label>
            <input
              id="name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="user-registration-input"
              placeholder="Enter your full name"
            />
          </div>
          
          <div className="user-registration-form-group">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="user-registration-input"
              placeholder="Enter your email address"
            />
          </div>
          
          <div className="user-registration-form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength="6"
              className="user-registration-input"
              placeholder="Create a password (min. 6 characters)"
            />
            <span className="user-registration-hint">Password must be at least 6 characters</span>
          </div>
          
          <div className="user-registration-form-group">
            <label htmlFor="phone">
              Phone Number <span className="user-registration-optional">(Optional)</span>
            </label>
            <input
              id="phone"
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="user-registration-input"
              placeholder="Enter your phone number"
            />
          </div>
          
          <div className="user-registration-terms">
            By registering, you agree to our <Link to="/terms" className="user-registration-link">Terms of Service</Link> and <Link to="/privacy" className="user-registration-link">Privacy Policy</Link>
          </div>
          
          <button 
            type="submit" 
            className="user-registration-button"
            disabled={loading}
          >
            {loading ? (
              <span>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'spin 1s linear infinite', marginRight: '8px', display: 'inline-block' }}>
                  <circle cx="12" cy="12" r="10" opacity="0.25"></circle>
                  <circle cx="12" cy="12" r="10" strokeDasharray="30 65"></circle>
                </svg>
                Processing...
              </span>
            ) : (
              'Create Account'
            )}
          </button>
        </form>
        
        <div className="user-registration-footer">
          Already have an account? <Link to="/user/login" className="user-registration-link">Sign in</Link>
        </div>
      </div>
    </div>
  );
}