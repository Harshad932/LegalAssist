import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import LawyerHeader from './LawyerHeader';
import '../../assets/styles/lawyer/CaseRequestDetails.css';

const CaseRequestDetails = () => {
  const { requestId } = useParams();
  const navigate = useNavigate();
  const [request, setRequest] = useState(null);
  const [caseData, setCaseData] = useState(null);
  const [loading, setLoading] = useState({ request: true, case: true, action: false });
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('lawyerToken');
        
        // Fetch request details
        const requestResponse = await axios.get(
          `${process.env.BACKEND}/api/case-requests/${requestId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setRequest(requestResponse.data.data);
        setLoading(prev => ({ ...prev, request: false }));

        // Fetch case details if token exists
        if (requestResponse.data.data.caseToken) {
          const caseResponse = await axios.get(
            `${process.env.BACKEND}/api/cases/by-token/${requestResponse.data.data.caseToken}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          setCaseData(caseResponse.data.data);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch data');
      } finally {
        setLoading({ request: false, case: false, action: false });
      }
    };

    fetchData();
  }, [requestId]);

  const handleRequestAction = async (action) => {
    try {
      setLoading({ ...loading, action: true });
      const token = localStorage.getItem('lawyerToken');
      
      await axios.patch(
        `${process.env.BACKEND}/api/case-requests/${requestId}`,
        { status: action },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      navigate('/lawyer/profile'); // Return to profile after action
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update request');
    } finally {
      setLoading({ ...loading, action: false });
    }
  };

  if (loading.request) {
    return (
      <>
        <LawyerHeader />
        <div className="case-loading-container">
          <div className="case-loading-spinner"></div>
          <p className="case-loading-text">Loading request details...</p>
        </div>
      </>
    );
  }
  
  if (error) {
    return (
      <>
        <LawyerHeader />
        <div className="case-error-container">
          <div className="case-error-icon">⚠️</div>
          <h2 className="case-error-title">Error Occurred</h2>
          <p className="case-error-message">{error}</p>
          <button 
            onClick={() => navigate('/lawyer/profile')}
            className="case-button case-button-secondary"
          >
            Return to Profile
          </button>
        </div>
      </>
    );
  }
  
  if (!request) {
    return (
      <>
        <LawyerHeader />
        <div className="case-not-found-container">
          <h2 className="case-not-found-title">Request Not Found</h2>
          <p className="case-not-found-text">The requested case could not be found or you don't have permission to view it.</p>
          <button 
            onClick={() => navigate('/lawyer/profile')}
            className="case-button case-button-secondary"
          >
            Return to Profile
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <LawyerHeader />
      <div className="case-details-wrapper">
        <div className="case-details-container">
          <div className="case-details-header">
            <div className="case-details-header-content">
              <h1 className="case-details-title">Case Request</h1>
              <div className="case-details-meta">
                <span className="case-details-id">ID: {request.caseToken}</span>
                <span className={`case-details-status case-details-status-${request.status}`}>
                  {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                </span>
              </div>
            </div>
            <button 
              onClick={() => navigate('/lawyer/profile')}
              className="case-button case-button-secondary case-button-with-icon"
            >
              <span className="case-button-icon">←</span> Back to Dashboard
            </button>
          </div>

          <div className="case-details-content">
            <div className="case-details-card case-client-card">
              <div className="case-card-header">
                <h2 className="case-card-title">Client Information</h2>
                <div className="case-card-icon">👤</div>
              </div>
              <div className="case-card-content">
                <div className="case-info-grid">
                  <div className="case-info-item">
                    <span className="case-info-label">Full Name</span>
                    <span className="case-info-value">{request.clientName}</span>
                  </div>
                  <div className="case-info-item">
                    <span className="case-info-label">Email Address</span>
                    <span className="case-info-value">{request.clientEmail}</span>
                  </div>
                  <div className="case-info-item">
                    <span className="case-info-label">Phone Number</span>
                    <span className="case-info-value">{request.clientPhone || 'Not provided'}</span>
                  </div>
                  <div className="case-info-item">
                    <span className="case-info-label">Request Date</span>
                    <span className="case-info-value">{new Date(request.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long', 
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="case-details-card case-description-card">
              <div className="case-card-header">
                <h2 className="case-card-title">Case Description</h2>
                <div className="case-card-icon">📝</div>
              </div>
              <div className="case-card-content">
                <div className="case-description">
                  {request.caseDetails}
                </div>
              </div>
            </div>

            {caseData ? (
              <div className="case-details-card case-information-card">
                <div className="case-card-header">
                  <h2 className="case-card-title">Case Information</h2>
                  <div className="case-card-icon">⚖️</div>
                </div>
                <div className="case-card-content">
                  <div className="case-info-grid case-info-grid-3-col">
                    <div className="case-info-item">
                      <span className="case-info-label">Case Title</span>
                      <span className="case-info-value">{caseData.caseTitle}</span>
                    </div>
                    <div className="case-info-item">
                      <span className="case-info-label">Case Type</span>
                      <span className="case-info-value">{caseData.caseType}</span>
                    </div>
                    <div className="case-info-item">
                      <span className="case-info-label">Court</span>
                      <span className="case-info-value">{caseData.court}</span>
                    </div>
                    <div className="case-info-item">
                      <span className="case-info-label">Status</span>
                      <span className="case-info-value case-status-badge case-status-badge-{caseData.status.toLowerCase()}">{caseData.status}</span>
                    </div>
                    <div className="case-info-item">
                      <span className="case-info-label">Priority</span>
                      <span className="case-info-value case-priority-badge case-priority-{caseData.priority.toLowerCase()}">{caseData.priority}</span>
                    </div>
                    <div className="case-info-item">
                      <span className="case-info-label">Filing Date</span>
                      <span className="case-info-value">{new Date(caseData.filingDate).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Hearings Section */}
                  {caseData.hearings?.length > 0 && (
                    <div className="case-hearings-section">
                      <h3 className="case-hearings-title">Hearing History</h3>
                      <div className="case-timeline">
                        {caseData.hearings.map((hearing, index) => (
                          <div key={index} className="case-timeline-item">
                            <div className="case-timeline-marker"></div>
                            <div className="case-timeline-content">
                              <div className="case-timeline-header">
                                <span className="case-timeline-date">
                                  {new Date(hearing.date).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long', 
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </span>
                                <span className={`case-timeline-status case-timeline-status-${hearing.status.toLowerCase()}`}>
                                  {hearing.status}
                                </span>
                              </div>
                              {hearing.description && (
                                <div className="case-timeline-description">
                                  {hearing.description}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="case-details-card case-alert-card">
                <div className="case-alert-content">
                  <div className="case-alert-icon">ℹ️</div>
                  <div className="case-alert-text">
                    <h3 className="case-alert-title">No Additional Case Information</h3>
                    <p className="case-alert-message">
                      There is no additional case information available for token: {request.caseToken}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            {request.status === 'pending' && (
              <div className="case-details-actions">
                <button
                  onClick={() => handleRequestAction('rejected')}
                  disabled={loading.action}
                  className={`case-button case-button-danger ${
                    loading.action ? 'case-button-disabled' : ''
                  }`}
                >
                  {loading.action ? 'Processing...' : 'Decline Request'}
                </button>
                <button
                  onClick={() => handleRequestAction('accepted')}
                  disabled={loading.action}
                  className={`case-button case-button-primary ${
                    loading.action ? 'case-button-disabled' : ''
                  }`}
                >
                  {loading.action ? 'Processing...' : 'Accept Request'}
                </button>
              </div>
            )}
          </div>
        </div>
        
        <div className="case-details-footer">
          <div className="case-details-footer-content">
            <p>© 2025 LegalAssist Professional Platform. All rights reserved.</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default CaseRequestDetails;