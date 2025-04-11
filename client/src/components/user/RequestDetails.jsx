import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
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
        const response = await axios.get(`http://localhost:4000/api/requests/${requestId}`, {
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

  if (loading) return <div className="request-details-loading">Loading request details...</div>;
  if (error) return <div className="request-details-error">{error}</div>;
  if (!request) return <div className="request-details-not-found">Request not found</div>;

  return (
    <div className="request-details-container">
      <div className="request-details-card">
        <button 
          onClick={() => navigate('/profile')}
          className="request-details-back-button"
        >
          <span className="request-details-back-icon">←</span> Back to profile
        </button>

        <h1 className="request-details-title">Request Details</h1>
        
        <div className="request-details-grid">
          {/* Case Information */}
          <div className="request-details-section">
            <h2 className="request-details-section-title">Case Information</h2>
            <div className="request-details-info-list">
              <div className="request-details-info-item">
                <span className="request-details-info-label">Token Number:</span>
                <span className="request-details-info-value">{request.caseToken}</span>
              </div>
              <div className="request-details-info-item">
                <span className="request-details-info-label">Status:</span>
                <span className={getStatusBadgeClass(request.status)}>
                  {request.status}
                </span>
              </div>
              <div className="request-details-info-item">
                <span className="request-details-info-label">Submitted:</span>
                <span className="request-details-info-value">{formatDate(request.createdAt)}</span>
              </div>
              {request.updatedAt !== request.createdAt && (
                <div className="request-details-info-item">
                  <span className="request-details-info-label">Last Updated:</span>
                  <span className="request-details-info-value">{formatDate(request.updatedAt)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Lawyer Information */}
          <div className="request-details-section">
            <h2 className="request-details-section-title">Lawyer Information</h2>
            {request.lawyer ? (
              <div className="request-details-info-list">
                <div className="request-details-info-item">
                  <span className="request-details-info-label">Name:</span>
                  <span className="request-details-info-value">{request.lawyer.name}</span>
                </div>
                <div className="request-details-info-item">
                  <span className="request-details-info-label">Specialization:</span>
                  <span className="request-details-info-value">
                    {request.lawyer.specialization?.join(', ') || 'Not specified'}
                  </span>
                </div>
                <div className="request-details-info-item">
                  <span className="request-details-info-label">Email:</span>
                  <span className="request-details-info-value">{request.lawyer.email}</span>
                </div>
                {request.lawyer.phone && (
                  <div className="request-details-info-item">
                    <span className="request-details-info-label">Phone:</span>
                    <span className="request-details-info-value">{request.lawyer.phone}</span>
                  </div>
                )}
              </div>
            ) : (
              <p className="request-details-info-value">Lawyer information not available</p>
            )}
          </div>
        </div>

        {/* Case Details */}
        <div className="request-details-section request-details-case-content">
          <h2 className="request-details-section-title">Your Case Description</h2>
          <div className="request-details-case-details">
            {request.caseDetails || 'No case details provided'}
          </div>
        </div>

        {request.status === 'accepted' && (
          <button 
            onClick={() => navigate(`/client/messages/${request.caseToken}`)}
            className="request-details-message-button"
          >
            <span className="request-details-message-icon">✉</span>
            Message Lawyer
          </button>
        )}

      </div>
    </div>
  );
};

export default RequestDetails;