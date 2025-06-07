import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import UserHeader from './UserHeader';
import '../../assets/styles/user/RequestDetails.css';

const RequestDetails = () => {
  const { requestId } = useParams();
  const navigate = useNavigate();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRequestDetails = async () => {
      try {
        const token = localStorage.getItem('userToken');
        const response = await axios.get(`${process.env.BACKEND}/api/requests/${requestId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setRequest(response.data.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch request details');
      } finally {
        setLoading(false);
      }
    };

    fetchRequestDetails();
  }, [requestId]);

  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getStatusBadgeClass = (status) => {
    switch(status) {
      case 'pending':
        return 'request-details-status request-details-status-pending';
      case 'accepted':
        return 'request-details-status request-details-status-accepted';
      case 'rejected':
        return 'request-details-status request-details-status-rejected';
      default:
        return 'request-details-status';
    }
  };

  if (loading) return (
    <>
      <UserHeader />
      <div className="request-details-loading">
        <div className="request-details-loader"></div>
        <p>Loading your case details...</p>
      </div>
    </>
  );

  if (error) return (
    <>
      <UserHeader />
      <div className="request-details-error">
        <div className="request-details-error-icon">!</div>
        <h3>We encountered a problem</h3>
        <p>{error}</p>
        <button 
          onClick={() => navigate('/profile')}
          className="request-details-back-button"
        >
          Return to Profile
        </button>
      </div>
    </>
  );

  if (!request) return (
    <>
      <UserHeader />
      <div className="request-details-not-found">
        <div className="request-details-not-found-icon">?</div>
        <h3>Request Not Found</h3>
        <p>We couldn't locate the request you're looking for.</p>
        <button 
          onClick={() => navigate('/profile')}
          className="request-details-back-button"
        >
          Return to Profile
        </button>
      </div>
    </>
  );

  return (
    <>
      <UserHeader />
      <div className="request-details-container">
        <div className="request-details-header">
          <h1 className="request-details-page-title">Case Details</h1>
          <p className="request-details-subtitle">Review the details of your legal assistance request</p>
        </div>

        <div className="request-details-card">
          <div className="request-details-card-header">
            <button 
              onClick={() => navigate('/profile')}
              className="request-details-back-button"
            >
              <span className="request-details-back-icon">←</span> Back to profile
            </button>

            <div className={getStatusBadgeClass(request.status)}>
              <span className="request-details-status-dot"></span>
              {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
            </div>
          </div>

          <div className="request-details-token">
            <div className="request-details-token-label">Case Token</div>
            <div className="request-details-token-value">{request.caseToken}</div>
          </div>
          
          <div className="request-details-grid">
            {/* Case Information */}
            <div className="request-details-section">
              <h2 className="request-details-section-title">
                <span className="request-details-section-icon">📋</span>
                Case Timeline
              </h2>
              <div className="request-details-info-list">
                <div className="request-details-timeline-item">
                  <div className="request-details-timeline-marker"></div>
                  <div className="request-details-timeline-content">
                    <span className="request-details-timeline-label">Submitted</span>
                    <span className="request-details-timeline-date">{formatDate(request.createdAt)}</span>
                  </div>
                </div>
                
                {request.updatedAt !== request.createdAt && (
                  <div className="request-details-timeline-item">
                    <div className="request-details-timeline-marker"></div>
                    <div className="request-details-timeline-content">
                      <span className="request-details-timeline-label">Last Updated</span>
                      <span className="request-details-timeline-date">{formatDate(request.updatedAt)}</span>
                    </div>
                  </div>
                )}
                
                {request.status === 'accepted' && (
                  <div className="request-details-timeline-item">
                    <div className="request-details-timeline-marker request-details-timeline-marker-active"></div>
                    <div className="request-details-timeline-content">
                      <span className="request-details-timeline-label">Case Accepted</span>
                      <span className="request-details-timeline-date">Lawyer assigned to your case</span>
                    </div>
                  </div>
                )}
                
                {request.status === 'rejected' && (
                  <div className="request-details-timeline-item">
                    <div className="request-details-timeline-marker request-details-timeline-marker-rejected"></div>
                    <div className="request-details-timeline-content">
                      <span className="request-details-timeline-label">Case Declined</span>
                      <span className="request-details-timeline-date">Please submit a new request</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Lawyer Information */}
            <div className="request-details-section">
              <h2 className="request-details-section-title">
                <span className="request-details-section-icon">👨‍⚖️</span>
                Lawyer Information
              </h2>
              {request.lawyer ? (
                <div className="request-details-lawyer-card">
                  <div className="request-details-lawyer-avatar">
                    {request.lawyer.name.charAt(0)}
                  </div>
                  <div className="request-details-lawyer-info">
                    <h3 className="request-details-lawyer-name">{request.lawyer.name}</h3>
                    <div className="request-details-lawyer-specialization">
                      {request.lawyer.specialization?.join(', ') || 'General Practice'}
                    </div>
                    <div className="request-details-lawyer-contact">
                      <div className="request-details-contact-item">
                        <span className="request-details-contact-icon">✉️</span>
                        {request.lawyer.email}
                      </div>
                      {request.lawyer.phone && (
                        <div className="request-details-contact-item">
                          <span className="request-details-contact-icon">📞</span>
                          {request.lawyer.phone}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="request-details-lawyer-pending">
                  <div className="request-details-lawyer-pending-icon">⏳</div>
                  <p>Lawyer assignment pending</p>
                  <p className="request-details-lawyer-pending-note">
                    A qualified legal professional will be assigned to your case shortly.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Case Details */}
          <div className="request-details-section request-details-case-content">
            <h2 className="request-details-section-title">
              <span className="request-details-section-icon">📝</span>
              Your Case Description
            </h2>
            <div className="request-details-case-details">
              {request.caseDetails || 'No case details provided'}
            </div>
          </div>

          {request.status === 'accepted' && (
            <div className="request-details-actions">
              <button 
                onClick={() => navigate(`/client/messages/${request.caseToken}`)}
                className="request-details-message-button"
              >
                <span className="request-details-message-icon">✉</span>
                Message Your Lawyer
              </button>
              <button 
                onClick={() => navigate('/track-case')}
                className="request-details-track-button"
              >
                <span className="request-details-track-icon">📊</span>
                Track Case Progress
              </button>
            </div>
          )}

        </div>
      </div>
    </>
  );
};

export default RequestDetails;