import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

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
    setError('');
    
    try {
      const response = await axios.post('http://localhost:4000/api/lawyer/auth/login', formData);
      
      if (response.data.success) {
        localStorage.setItem('lawyerToken', response.data.token);
        localStorage.setItem('lawyerData', JSON.stringify({
          _id: response.data._id,
          name: response.data.name,
          email: response.data.email,
          role: response.data.role
        }));
        navigate('/lawyer/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div >
      <h2>Lawyer Login</h2>
      {error && <div >{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div >
          <label>Email:</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        
        <div >
          <label>Password:</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            minLength="6"
          />
        </div>
        
        <button type="submit" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
        
        <div className="login-links">
          <Link to="/lawyer/forgot-password">Forgot Password?</Link>
          <span> | </span>
          <Link to="/lawyer/registration">Create Account</Link>
        </div>
      </form>
    </div>
  );
}