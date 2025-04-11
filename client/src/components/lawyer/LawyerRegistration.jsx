import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import '../../assets/styles/lawyer/LawyerRegistration.css';

export default function LawyerRegistration() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    specialization: [],
    experience: 0,
    barAssociationId: '',
    location: '',
    languages: [],
    hourlyRate: 0
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleArrayChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value.split(',').map(item => item.trim())
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await axios.post('http://localhost:4000/api/lawyer/auth/register', formData);
      
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
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="lawyer-registration-container">
      <div className="lawyer-registration-card">
        <div className="lawyer-registration-header">
          <div className="lawyer-registration-logo">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="#1A365D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 17L12 22L22 17" stroke="#1A365D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 12L12 17L22 12" stroke="#1A365D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <h1 className="lawyer-registration-app-name">Legal Assist</h1>
          </div>
          <h2 className="lawyer-registration-heading">Lawyer Registration</h2>
          <p className="lawyer-registration-subtitle">Join our network of legal professionals</p>
        </div>

        {error && <div className="lawyer-registration-error">{error}</div>}
        
        <form onSubmit={handleSubmit} className="lawyer-registration-form">
          <div className="lawyer-registration-form-section">
            <h3 className="lawyer-registration-section-title">Personal Information</h3>
            <div className="lawyer-registration-form-row">
              <div className="lawyer-registration-input-group">
                <label className="lawyer-registration-label">Full Name</label>
                <input
                  className="lawyer-registration-input"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  required
                />
              </div>
              
              <div className="lawyer-registration-input-group">
                <label className="lawyer-registration-label">Email</label>
                <input
                  className="lawyer-registration-input"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="email@example.com"
                  required
                />
              </div>
            </div>
            
            <div className="lawyer-registration-form-row">
              <div className="lawyer-registration-input-group">
                <label className="lawyer-registration-label">Password</label>
                <input
                  className="lawyer-registration-input"
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Minimum 6 characters"
                  required
                  minLength="6"
                />
                <span className="lawyer-registration-input-hint">Must be at least 6 characters</span>
              </div>
              
              <div className="lawyer-registration-input-group">
                <label className="lawyer-registration-label">Phone</label>
                <input
                  className="lawyer-registration-input"
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="(555) 123-4567"
                />
              </div>
            </div>
          </div>
          
          <div className="lawyer-registration-form-section">
            <h3 className="lawyer-registration-section-title">Professional Information</h3>
            <div className="lawyer-registration-form-row">
              <div className="lawyer-registration-input-group lawyer-registration-input-group-full">
                <label className="lawyer-registration-label">Specializations (comma separated)</label>
                <input
                  className="lawyer-registration-input"
                  type="text"
                  name="specialization"
                  onChange={handleArrayChange}
                  placeholder="e.g., Criminal, Family Law, Corporate"
                  required
                />
              </div>
            </div>
            
            <div className="lawyer-registration-form-row">
              <div className="lawyer-registration-input-group">
                <label className="lawyer-registration-label">Years of Experience</label>
                <input
                  className="lawyer-registration-input"
                  type="number"
                  name="experience"
                  value={formData.experience}
                  onChange={handleChange}
                  min="0"
                  required
                />
              </div>
              
              <div className="lawyer-registration-input-group">
                <label className="lawyer-registration-label">Bar Association ID</label>
                <input
                  className="lawyer-registration-input"
                  type="text"
                  name="barAssociationId"
                  value={formData.barAssociationId}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            
            <div className="lawyer-registration-form-row">
              <div className="lawyer-registration-input-group">
                <label className="lawyer-registration-label">Location</label>
                <input
                  className="lawyer-registration-input"
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="City, State"
                  required
                />
              </div>
              
              <div className="lawyer-registration-input-group">
                <label className="lawyer-registration-label">Hourly Rate ($)</label>
                <input
                  className="lawyer-registration-input"
                  type="number"
                  name="hourlyRate"
                  value={formData.hourlyRate}
                  onChange={handleChange}
                  min="0"
                  required
                />
              </div>
            </div>
            
            <div className="lawyer-registration-form-row">
              <div className="lawyer-registration-input-group lawyer-registration-input-group-full">
                <label className="lawyer-registration-label">Languages (comma separated)</label>
                <input
                  className="lawyer-registration-input"
                  type="text"
                  name="languages"
                  onChange={handleArrayChange}
                  placeholder="e.g., English, Spanish, French"
                />
              </div>
            </div>
          </div>
          
          <div className="lawyer-registration-form-actions">
            <button 
              type="submit" 
              className="lawyer-registration-button"
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Create Account'}
            </button>
            
            <div className="lawyer-registration-login-link">
              Already have an account? <Link to="/lawyer/login">Login here</Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}