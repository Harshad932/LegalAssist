import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import LawyerHeader from './LawyerHeader';
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
  const [currentStep, setCurrentStep] = useState(1);
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
      const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/lawyer/auth/register`, formData);
      
      if (response.data.success) {
        localStorage.setItem('lawyerToken', response.data.token);
        localStorage.setItem('lawyerData', JSON.stringify({
          _id: response.data._id,
          name: response.data.name,
          email: response.data.email,
          role: response.data.role
        }));
        navigate('/lawyer/login');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  return (
    <div className="lawyer-registration-page">
      <LawyerHeader />
      
      <div className="lawyer-registration-container">
        <div className="lawyer-registration-sidebar">
          <div className="lawyer-registration-sidebar-content">
            <h2 className="lawyer-registration-sidebar-title">Join Our Network of Legal Experts</h2>
            <p className="lawyer-registration-sidebar-text">
              Connect with clients seeking your expertise and grow your practice with Legal<span className="lawyer-registration-accent">Assist</span>.
            </p>
            
            <div className="lawyer-registration-benefits">
              <div className="lawyer-registration-benefit">
                <div className="lawyer-registration-benefit-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" stroke="#15B097" strokeWidth="2" />
                    <path d="M15 9L10.5 14L9 12.5" stroke="#15B097" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <span>Expand your client base</span>
              </div>
              
              <div className="lawyer-registration-benefit">
                <div className="lawyer-registration-benefit-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" stroke="#15B097" strokeWidth="2" />
                    <path d="M15 9L10.5 14L9 12.5" stroke="#15B097" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <span>Set your own schedule</span>
              </div>
              
              <div className="lawyer-registration-benefit">
                <div className="lawyer-registration-benefit-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" stroke="#15B097" strokeWidth="2" />
                    <path d="M15 9L10.5 14L9 12.5" stroke="#15B097" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <span>Receive secure payments</span>
              </div>
              
              <div className="lawyer-registration-benefit">
                <div className="lawyer-registration-benefit-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" stroke="#15B097" strokeWidth="2" />
                    <path d="M15 9L10.5 14L9 12.5" stroke="#15B097" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <span>Maximize your billable hours</span>
              </div>
            </div>
            
            <div className="lawyer-registration-testimonial">
              <div className="lawyer-registration-quote">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10 11.25H6.75C6.1 11.25 5.5 10.901 5.5 10.25C5.5 8.901 6.51 7.75 7.87 7.75H8.25C8.9 7.75 9.5 7.149 9.5 6.5C9.5 5.851 9 5.25 8.25 5.25H7.5C4.5 5.25 2 7.75 2 10.75V15.25C2 17.45 3.8 19.25 6 19.25H10C12.2 19.25 14 17.45 14 15.25V15.25C14 13.05 12.2 11.25 10 11.25Z" fill="rgba(10, 36, 99, 0.15)" />
                  <path d="M22 15.25V10.75C22 8.55 20.2 6.75 18 6.75H14C11.8 6.75 10 8.55 10 10.75V15.25C10 17.45 11.8 19.25 14 19.25H18C20.2 19.25 22 17.45 22 15.25Z" fill="rgba(10, 36, 99, 0.15)" />
                </svg>
              </div>
              <p className="lawyer-registration-testimonial-text">
                Legal Assist has been transformative for my practice. The platform's intuitive design and client matching algorithm have helped me grow my business by 40% in just six months.
              </p>
              <div className="lawyer-registration-testimonial-author">
                <span className="lawyer-registration-testimonial-name">Sarah Chen, Esq.</span>
                <span className="lawyer-registration-testimonial-role">Family Law Specialist</span>
              </div>
            </div>
          </div>
        </div>

        <div className="lawyer-registration-main">
          <div className="lawyer-registration-card">
            <div className="lawyer-registration-progress">
              <div className="lawyer-registration-progress-step">
                <div className={`lawyer-registration-step-indicator ${currentStep >= 1 ? 'active' : ''}`}>1</div>
                <span className="lawyer-registration-step-label">Account</span>
              </div>
              <div className="lawyer-registration-progress-line"></div>
              <div className="lawyer-registration-progress-step">
                <div className={`lawyer-registration-step-indicator ${currentStep >= 2 ? 'active' : ''}`}>2</div>
                <span className="lawyer-registration-step-label">Professional</span>
              </div>
            </div>

            <div className="lawyer-registration-header">
              <h2 className="lawyer-registration-heading">
                {currentStep === 1 ? 'Create Your Account' : 'Professional Details'}
              </h2>
              <p className="lawyer-registration-subtitle">
                {currentStep === 1 
                  ? 'Join our network of legal professionals' 
                  : 'Tell us about your practice and expertise'}
              </p>
            </div>

            {error && <div className="lawyer-registration-error">{error}</div>}
            
            <form onSubmit={handleSubmit} className="lawyer-registration-form">
              {currentStep === 1 && (
                <div className="lawyer-registration-form-section">
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
                  </div>
                  
                  <div className="lawyer-registration-form-row">
                    <div className="lawyer-registration-input-group">
                      <label className="lawyer-registration-label">Email Address</label>
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
                  </div>
                  
                  <div className="lawyer-registration-form-row">
                    <div className="lawyer-registration-input-group">
                      <label className="lawyer-registration-label">Phone Number</label>
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
              )}
              
              {currentStep === 2 && (
                <div className="lawyer-registration-form-section">
                  <div className="lawyer-registration-form-row">
                    <div className="lawyer-registration-input-group">
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
                  
                  <div className="lawyer-registration-form-row lawyer-registration-form-row-split">
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
                  
                  <div className="lawyer-registration-form-row lawyer-registration-form-row-split">
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
                    <div className="lawyer-registration-input-group">
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
              )}
              
              <div className="lawyer-registration-form-actions">
                {currentStep === 1 ? (
                  <button 
                    type="button" 
                    className="lawyer-registration-button"
                    onClick={nextStep}
                  >
                    Continue
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                ) : (
                  <div className="lawyer-registration-buttons-row">
                    <button 
                      type="button" 
                      className="lawyer-registration-button-secondary"
                      onClick={prevStep}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Back
                    </button>
                    
                    <button 
                      type="submit" 
                      className="lawyer-registration-button"
                      disabled={loading}
                    >
                      {loading ? 'Processing...' : 'Create Account'}
                    </button>
                  </div>
                )}
                
                <div className="lawyer-registration-login-link">
                  Already have an account? <Link to="/lawyer/login">Sign in here</Link>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}