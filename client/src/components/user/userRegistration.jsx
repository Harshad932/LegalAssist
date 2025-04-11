import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import '../../assets/styles/user/UserRegistration.css';

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
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="user-registration-container">
      <div className="user-registration-card">
        <div className="user-registration-header">
          <h2>Create Your Account</h2>
          <p className="user-registration-subtitle">Join Legal Assist to get connected with legal professionals</p>
        </div>
        
        {error && <div className="user-registration-error">{error}</div>}
        
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
            <label htmlFor="phone">Phone Number <span className="user-registration-optional">(Optional)</span></label>
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
            By registering, you agree to our <a href="#" className="user-registration-link">Terms of Service</a> and <a href="#" className="user-registration-link">Privacy Policy</a>
          </div>
          
          <button 
            type="submit" 
            className="user-registration-button"
            disabled={loading}
          >
            {loading ? 'Processing...' : 'Create Account'}
          </button>
        </form>
        
        <div className="user-registration-footer">
          Already have an account? <Link to="/user/login" className="user-registration-link">Sign in</Link>
        </div>
      </div>
    </div>
  );
}