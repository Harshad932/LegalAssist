import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
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
          `http://localhost:4000/api/case-requests/${requestId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setRequest(requestResponse.data.data);
        setLoading(prev => ({ ...prev, request: false }));

        // Fetch case details if token exists
        if (requestResponse.data.data.caseToken) {
          const caseResponse = await axios.get(
            `http://localhost:4000/api/cases/by-token/${requestResponse.data.data.caseToken}`,
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
        `http://localhost:4000/api/case-requests/${requestId}`,
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
    return <div className="case-request-details-loading">Loading request details...</div>;
  }
  
  if (error) {
    return <div className="case-request-details-error">{error}</div>;
  }
  
  if (!request) {
    return <div className="case-request-details-empty">Request not found</div>;
  }

  return (
    <div className="case-request-details-container">
      <div className="case-request-details-card">
        <div className="case-request-details-header">
          <h1 className="case-request-details-title">
            Case Request: {request.caseToken}
          </h1>

          <button 
            onClick={() => navigate('/lawyer/profile')}
            className="case-request-details-back-button"
          >
            <span className="case-request-details-back-icon">←</span> Back to requests
          </button>
        </div>

        {/* Client Information */}
        <div className="case-request-details-section">
          <h2 className="case-request-details-section-header">Client Information</h2>
          <div className="case-request-details-info-grid">
            <div className="case-request-details-info-item">
              <span className="case-request-details-label">Name:</span> {request.clientName}
            </div>
            <div className="case-request-details-info-item">
              <span className="case-request-details-label">Email:</span> {request.clientEmail}
            </div>
            <div className="case-request-details-info-item">
              <span className="case-request-details-label">Phone:</span> {request.clientPhone || 'Not provided'}
            </div>
            <div className="case-request-details-info-item">
              <span className="case-request-details-label">Request Date:</span> {new Date(request.createdAt).toLocaleString()}
            </div>
          </div>
        </div>

        {/* Case Details from Form */}
        <div className="case-request-details-section">
          <h2 className="case-request-details-section-header">Case Description</h2>
          <div className="case-request-details-description">
            {request.caseDetails}
          </div>
        </div>

        {/* Case Information from Database */}
        {caseData ? (
          <div className="case-request-details-section">
            <h2 className="case-request-details-section-header">Case Information</h2>
            <div className="case-request-details-info-grid">
              <div className="case-request-details-info-item">
                <span className="case-request-details-label">Case Title:</span> {caseData.caseTitle}
              </div>
              <div className="case-request-details-info-item">
                <span className="case-request-details-label">Case Type:</span> {caseData.caseType}
              </div>
              <div className="case-request-details-info-item">
                <span className="case-request-details-label">Court:</span> {caseData.court}
              </div>
              <div className="case-request-details-info-item">
                <span className="case-request-details-label">Status:</span> {caseData.status}
              </div>
              <div className="case-request-details-info-item">
                <span className="case-request-details-label">Priority:</span> {caseData.priority}
              </div>
              <div className="case-request-details-info-item">
                <span className="case-request-details-label">Filing Date:</span> {new Date(caseData.filingDate).toLocaleDateString()}
              </div>
            </div>

            {/* Hearings */}
            {caseData.hearings?.length > 0 && (
              <div className="case-request-details-hearings">
                <h3 className="case-request-details-hearing-title">Hearing History</h3>
                <div className="case-request-details-hearing-list">
                  {caseData.hearings.map((hearing, index) => (
                    <div key={index} className="case-request-details-hearing-item">
                      <div>
                        <span className="case-request-details-hearing-date">
                          {new Date(hearing.date).toLocaleString()}
                        </span>
                        <span className="case-request-details-hearing-status">
                          {hearing.status}
                        </span>
                      </div>
                      {hearing.description && (
                        <div className="case-request-details-hearing-notes">
                          {hearing.description}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="case-request-details-alert">
            <p className="case-request-details-alert-text">
              No additional case information found for token: {request.caseToken}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        {request.status === 'pending' && (
          <div className="case-request-details-actions">
            <button
              onClick={() => handleRequestAction('rejected')}
              disabled={loading.action}
              className={`case-request-details-button case-request-details-button-reject ${
                loading.action ? 'case-request-details-button-disabled' : ''
              }`}
            >
              {loading.action ? 'Processing...' : 'Reject Request'}
            </button>
            <button
              onClick={() => handleRequestAction('accepted')}
              disabled={loading.action}
              className={`case-request-details-button case-request-details-button-accept ${
                loading.action ? 'case-request-details-button-disabled' : ''
              }`}
            >
              {loading.action ? 'Processing...' : 'Accept Request'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CaseRequestDetails;