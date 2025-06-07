import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import UserHeader from '../../components/user/UserHeader';
import '../../assets/styles/user/LawyerProfileView.css';

const LawyerProfileView = () => {
  const { lawyerId } = useParams();
  const navigate = useNavigate();
  const [lawyer, setLawyer] = useState(null);
  const [loading, setLoading] = useState({
    profile: true,
    validation: false,
    submission: false
  });
  const [error, setError] = useState('');
  const [validation, setValidation] = useState({
    isValidCase: null,
  });
  const [formData, setFormData] = useState({
    caseToken: '',
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    caseDetails: ''
  });
  const [tokenError, setTokenError] = useState('');

  useEffect(() => {
    const fetchLawyerDetails = async () => {
      try {
        const token = localStorage.getItem('userToken');
        const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/lawyers/${lawyerId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setLawyer(response.data.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch lawyer details');
      } finally {
        setLoading(prev => ({ ...prev, profile: false }));
      }
    };
    fetchLawyerDetails();
  }, [lawyerId]);

  const validateCaseToken = async () => {
    if (!formData.caseToken.trim()) return;
    
    try {
      setLoading(prev => ({ ...prev, validation: true }));
      setTokenError('');
      
      const token = localStorage.getItem('userToken');
      await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/api/user/cases/by-token/${formData.caseToken}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
  
      setValidation({ isValidCase: true });
    } catch (err) {
      setValidation({ isValidCase: false });
      if (err.response?.status === 404) {
        setTokenError('Case not found with this token number');
      } else {
        setTokenError('Error validating token');
      }
    } finally {
      setLoading(prev => ({ ...prev, validation: false }));
    }
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Reset validation when case token changes
    if (name === 'caseToken') {
      setValidation({ isValidCase: null });
      setTokenError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Final validation before submission
    if (!validation.isValidCase) {
      setError('Please enter a valid case token');
      return;
    }
    
    try {
      setLoading(prev => ({ ...prev, submission: true }));
      const token = localStorage.getItem('userToken');
      
      await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/case-requests`, {
        lawyerId,
        ...formData
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      alert('Request sent successfully!');
      navigate('/user/profile');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send request');
    } finally {
      setLoading(prev => ({ ...prev, submission: false }));
    }
  };

  if (loading.profile) return (
    <>
      <UserHeader />
      <div className="lawyer-profile-loading">
        <div className="lawyer-profile-loading-spinner"></div>
        <p>Loading lawyer profile...</p>
      </div>
    </>
  );
  
  if (!lawyer) return (
    <>
      <UserHeader />
      <div className="lawyer-profile-not-found">
        <div className="lawyer-profile-not-found-icon">⚠️</div>
        <h2>Lawyer Not Found</h2>
        <p>The lawyer profile you're looking for doesn't exist or may have been removed.</p>
        <button onClick={() => navigate('/lawyers')} className="lawyer-profile-back-button">
          Browse Lawyers
        </button>
      </div>
    </>
  );

  return (
    <>
      <UserHeader />
      <div className="lawyer-profile-container">
        <div className="lawyer-profile-header">
          <div className="lawyer-profile-header-content">
            <div className="lawyer-profile-avatar">
              {lawyer.name.charAt(0)}
            </div>
            <div className="lawyer-profile-title-container">
              <h1 className="lawyer-profile-name">{lawyer.name}</h1>
              <div className="lawyer-profile-badges">
                <span className="lawyer-profile-badge lawyer-profile-badge-specialty">
                  {lawyer.specialization.join(', ')}
                </span>
                <span className="lawyer-profile-badge lawyer-profile-badge-experience">
                  {lawyer.experience}+ years experience
                </span>
                <span className="lawyer-profile-badge lawyer-profile-badge-rate">
                  ₹{lawyer.hourlyRate}/hour
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="lawyer-profile-content">
          <div className="lawyer-profile-sidebar">
            <div className="lawyer-profile-card">
              <h2 className="lawyer-profile-card-title">Professional Details</h2>
              <div className="lawyer-profile-detail-item">
                <span className="lawyer-profile-detail-icon">🏛️</span>
                <div className="lawyer-profile-detail-content">
                  <span className="lawyer-profile-detail-label">Bar Association ID</span>
                  <span className="lawyer-profile-detail-value">{lawyer.barAssociationId}</span>
                </div>
              </div>
              <div className="lawyer-profile-detail-item">
                <span className="lawyer-profile-detail-icon">📍</span>
                <div className="lawyer-profile-detail-content">
                  <span className="lawyer-profile-detail-label">Location</span>
                  <span className="lawyer-profile-detail-value">{lawyer.location}</span>
                </div>
              </div>
              <div className="lawyer-profile-detail-item">
                <span className="lawyer-profile-detail-icon">
                  {lawyer.availability ? '✅' : '⏱️'}
                </span>
                <div className="lawyer-profile-detail-content">
                  <span className="lawyer-profile-detail-label">Availability</span>
                  <span className="lawyer-profile-detail-value lawyer-profile-availability">
                    {lawyer.availability ? 
                      <span className="lawyer-profile-available">Available</span> : 
                      <span className="lawyer-profile-unavailable">Not Available</span>
                    }
                  </span>
                </div>
              </div>
            </div>

            <div className="lawyer-profile-card">
              <h2 className="lawyer-profile-card-title">Languages</h2>
              <div className="lawyer-profile-languages">
                {lawyer.languages?.map((lang, i) => (
                  <span key={i} className="lawyer-profile-language-tag">
                    {lang}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="lawyer-profile-main">
            <div className="lawyer-profile-form-container">
              <div className="lawyer-profile-form-header">
                <h2 className="lawyer-profile-form-title">Request Consultation</h2>
                <p className="lawyer-profile-form-subtitle">
                  Fill out the form below to request a consultation with {lawyer.name.split(' ')[0]}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="lawyer-profile-form">
                <div className="lawyer-profile-form-group">
                  <label className="lawyer-profile-form-label">
                    Case Token Number<span className="lawyer-profile-required">*</span>
                  </label>
                  <div className="lawyer-profile-form-input-wrapper">
                    <input
                      type="text"
                      name="caseToken"
                      value={formData.caseToken}
                      onChange={handleChange}
                      onBlur={validateCaseToken}
                      required
                      className={`lawyer-profile-form-input ${
                        validation.isValidCase === true ? 'lawyer-profile-input-valid' :
                        validation.isValidCase === false ? 'lawyer-profile-input-error' : ''
                      }`}
                      placeholder="Enter your case token"
                    />
                    {loading.validation && (
                      <div className="lawyer-profile-input-spinner"></div>
                    )}
                    {validation.isValidCase === true && (
                      <div className="lawyer-profile-input-check">✓</div>
                    )}
                  </div>
                  {validation.isValidCase === false && (
                    <div className="lawyer-profile-input-feedback lawyer-profile-input-error-message">
                      {tokenError || 'Invalid case token'}
                    </div>
                  )}
                  {validation.isValidCase === true && (
                    <div className="lawyer-profile-input-feedback lawyer-profile-input-success-message">
                      Case token verified successfully
                    </div>
                  )}
                </div>

                <div className="lawyer-profile-form-row">
                  <div className="lawyer-profile-form-group">
                    <label className="lawyer-profile-form-label">
                      Your Name<span className="lawyer-profile-required">*</span>
                    </label>
                    <input
                      type="text"
                      name="clientName"
                      value={formData.clientName}
                      onChange={handleChange}
                      required
                      className="lawyer-profile-form-input"
                      placeholder="Full name"
                    />
                  </div>

                  <div className="lawyer-profile-form-group">
                    <label className="lawyer-profile-form-label">
                      Your Email<span className="lawyer-profile-required">*</span>
                    </label>
                    <input
                      type="email"
                      name="clientEmail"
                      value={formData.clientEmail}
                      onChange={handleChange}
                      required
                      className="lawyer-profile-form-input"
                      placeholder="email@example.com"
                    />
                  </div>
                </div>

                <div className="lawyer-profile-form-group">
                  <label className="lawyer-profile-form-label">
                    Your Phone
                  </label>
                  <input
                    type="tel"
                    name="clientPhone"
                    value={formData.clientPhone}
                    onChange={handleChange}
                    className="lawyer-profile-form-input"
                    placeholder="+91 9876543210"
                  />
                </div>

                <div className="lawyer-profile-form-group">
                  <label className="lawyer-profile-form-label">
                    Case Details<span className="lawyer-profile-required">*</span>
                  </label>
                  <textarea
                    name="caseDetails"
                    value={formData.caseDetails}
                    onChange={handleChange}
                    rows="5"
                    required
                    className="lawyer-profile-form-textarea"
                    placeholder="Provide a brief description of your case..."
                  />
                </div>

                {error && <div className="lawyer-profile-form-error">{error}</div>}

                <div className="lawyer-profile-form-footer">
                  <button
                    type="submit"
                    disabled={loading.submission || !validation.isValidCase}
                    className="lawyer-profile-submit-button"
                  >
                    {loading.submission ? (
                      <>
                        <span className="lawyer-profile-button-spinner"></span>
                        Sending Request...
                      </>
                    ) : (
                      <>
                        Send Consultation Request
                        <span className="lawyer-profile-button-arrow">→</span>
                      </>
                    )}
                  </button>
                  <p className="lawyer-profile-form-disclaimer">
                    By submitting this form, you agree to our <a href="/terms">Terms of Service</a> and <a href="/privacy">Privacy Policy</a>
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default LawyerProfileView;