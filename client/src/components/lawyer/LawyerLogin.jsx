import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../../assets/styles/lawyer/LawyerLogin.css'; 
// Make sure to create this CSS file

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
      const response = await axios.post('http://localhost:4000/api/lawyer/auth/login', formData);
      
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
    <div className="lawyer-login-container">
      <div className="lawyer-login-card">
        <div className="lawyer-login-logo">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="#1A365D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 17L12 22L22 17" stroke="#1A365D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 12L12 17L22 12" stroke="#1A365D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <h1 className="lawyer-login-app-name">Legal Assist</h1>
        </div>
        
        <h2 className="lawyer-login-heading">Lawyer Login</h2>
        
        {error && <div className="lawyer-login-error">{error}</div>}
        
        <form onSubmit={handleSubmit} className="lawyer-login-form">
          <div className="lawyer-login-input-group">
            <label className="lawyer-login-label">Email</label>
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
          
          <div className="lawyer-login-input-group">
            <label className="lawyer-login-label">Password</label>
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
          
          <button 
            type="submit" 
            className={`lawyer-login-button ${loading ? 'lawyer-login-button-loading' : ''}`}
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
          
          <div className="lawyer-login-links">
            <Link to="/lawyer/forgot-password" className="lawyer-login-link">Forgot Password?</Link>
            <span className="lawyer-login-separator">|</span>
            <Link to="/lawyer/registration" className="lawyer-login-link">Create Account</Link>
          </div>
        </form>
      </div>
    </div>
  );
}