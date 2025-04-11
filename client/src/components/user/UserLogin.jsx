import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../../assets/styles/user/UserLogin.css'; // Import the CSS file

export default function UserLogin() {
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
    setError('');
    
    try {
      const response = await axios.post('http://localhost:4000/api/user/auth/login', formData);
      
      if (response.data.success) {
        // Store token and user data
        localStorage.setItem('userToken', response.data.token);
        localStorage.setItem('userData', JSON.stringify({
          _id: response.data._id,
          name: response.data.name,
          email: response.data.email,
          role: response.data.role
        }));
        console.log("Success");
        // Redirect based on role
        navigate('/user/profile');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="user-login-container">
      <div className="user-login-card">
        <div className="user-login-header">
          <h2>User Login</h2>
          <p className="user-login-subtitle">Access your Legal Assist account</p>
        </div>
        
        {error && <div className="user-login-error">{error}</div>}
        
        <form onSubmit={handleSubmit} className="user-login-form">
          <div className="user-login-form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="user-login-input"
              placeholder="Enter your email"
            />
          </div>
          
          <div className="user-login-form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength="6"
              className="user-login-input"
              placeholder="Enter your password"
            />
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className="user-login-button"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
          
          <div className="user-login-links">
            <Link to="/user/forgot-password" className="user-login-link">Forgot Password?</Link>
            <span className="user-login-divider">|</span>
            <Link to="/user/registration" className="user-login-link">Create Account</Link>
          </div>
        </form>

        <div className="user-login-footer">
          <p>Need assistance? Contact our support team</p>
        </div>
      </div>
    </div>
  );
}