import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
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
        const response = await axios.get(`http://localhost:4000/api/lawyers/${lawyerId}`, {
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
        `http://localhost:4000/api/user/cases/by-token/${formData.caseToken}`,
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
      
      await axios.post('http://localhost:4000/api/case-requests', {
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

  if (loading.profile) return <div className="lawyer-profile-view-loading">Loading lawyer details...</div>;
  if (!lawyer) return <div className="lawyer-profile-view-loading">Lawyer not found</div>;

  return (
    <div className="lawyer-profile-view-container">
      <div className="lawyer-profile-view-card">
        {/* Lawyer Profile Header */}
        <div className="lawyer-profile-view-header">
          <h1 className="lawyer-profile-view-title">{lawyer.name}</h1>
          <div className="lawyer-profile-view-badge-container">
            <div className="lawyer-profile-view-badge lawyer-profile-view-badge-primary">
              {lawyer.specialization.join(', ')}
            </div>
            <div className="lawyer-profile-view-badge lawyer-profile-view-badge-success">
              {lawyer.experience}+ years experience
            </div>
            <div className="lawyer-profile-view-badge lawyer-profile-view-badge-accent">
              ₹{lawyer.hourlyRate}/hour
            </div>
          </div>
        </div>

        <div className="lawyer-profile-view-content">
          {/* Lawyer Details Column */}
          <div>
            <div className="lawyer-profile-view-section">
              <h2 className="lawyer-profile-view-section-title">Professional Details</h2>
              <div>
                <p className="lawyer-profile-view-detail">
                  <span className="lawyer-profile-view-detail-label">Bar Association ID:</span> 
                  {lawyer.barAssociationId}
                </p>
                <p className="lawyer-profile-view-detail">
                  <span className="lawyer-profile-view-detail-label">Location:</span> 
                  {lawyer.location}
                </p>
                <p className="lawyer-profile-view-detail">
                  <span className="lawyer-profile-view-detail-label">Availability:</span> 
                  {lawyer.availability ? 'Available' : 'Not Available'}
                </p>
              </div>
            </div>

            <div className="lawyer-profile-view-section">
              <h2 className="lawyer-profile-view-section-title">Languages</h2>
              <div className="lawyer-profile-view-tags">
                {lawyer.languages?.map((lang, i) => (
                  <span key={i} className="lawyer-profile-view-tag">
                    {lang}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Request Form Column */}
          <div className="lawyer-profile-view-form">
            <h2 className="lawyer-profile-view-form-title">Request Consultation</h2>
            <form onSubmit={handleSubmit}>
              <div className="lawyer-profile-view-form-group">
                <label className="lawyer-profile-view-form-label">Case Token Number*</label>
                <div className="lawyer-profile-view-form-input-wrapper">
                  <input
                    type="text"
                    name="caseToken"
                    value={formData.caseToken}
                    onChange={handleChange}
                    onBlur={validateCaseToken}
                    required
                    className="lawyer-profile-view-form-input"
                  />
                  {loading.validation && (
                    <div className="lawyer-profile-view-form-spinner"></div>
                  )}
                </div>
                {formData.caseToken && (
                  <div className={`lawyer-profile-view-feedback ${
                    validation.isValidCase ? 'lawyer-profile-view-feedback-success' : 'lawyer-profile-view-feedback-error'
                  }`}>
                    {validation.isValidCase === true && '✓ Valid case token'}
                    {validation.isValidCase === false && `✗ ${tokenError || 'Invalid case token'}`}
                  </div>
                )}
              </div>

              <div className="lawyer-profile-view-form-group">
                <label className="lawyer-profile-view-form-label">Your Name*</label>
                <input
                  type="text"
                  name="clientName"
                  value={formData.clientName}
                  onChange={handleChange}
                  required
                  className="lawyer-profile-view-form-input"
                />
              </div>

              <div className="lawyer-profile-view-form-group">
                <label className="lawyer-profile-view-form-label">Your Email*</label>
                <input
                  type="email"
                  name="clientEmail"
                  value={formData.clientEmail}
                  onChange={handleChange}
                  required
                  className="lawyer-profile-view-form-input"
                />
              </div>

              <div className="lawyer-profile-view-form-group">
                <label className="lawyer-profile-view-form-label">Your Phone</label>
                <input
                  type="tel"
                  name="clientPhone"
                  value={formData.clientPhone}
                  onChange={handleChange}
                  className="lawyer-profile-view-form-input"
                />
              </div>

              <div className="lawyer-profile-view-form-group">
                <label className="lawyer-profile-view-form-label">Case Details*</label>
                <textarea
                  name="caseDetails"
                  value={formData.caseDetails}
                  onChange={handleChange}
                  rows="5"
                  required
                  className="lawyer-profile-view-form-textarea"
                />
              </div>

              {error && <div className="lawyer-profile-view-error">{error}</div>}

              <button
                type="submit"
                disabled={loading.submission || !validation.isValidCase}
                className="lawyer-profile-view-submit-button"
              >
                {loading.submission ? 'Sending...' : 'Send Request'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LawyerProfileView;