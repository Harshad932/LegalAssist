import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import LawyerHeader from './LawyerHeader';
import '../../assets/styles/lawyer/LawyerCaseDetail.css';

const CaseDetails = () => {
  const { caseToken } = useParams();
  const [caseData, setCaseData] = useState(null);
  const [requestData, setRequestData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCaseDetails = async () => {
      try {
        const token = localStorage.getItem('lawyerToken');
        const response = await axios.get(`http://localhost:4000/api/cases/${caseToken}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCaseData(response.data.data.case);
        setRequestData(response.data.data.request);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch case details');
      } finally {
        setLoading(false);
      }
    };

    fetchCaseDetails();
  }, [caseToken]);

  const handleMessageClient = () => {
    navigate(`/lawyer/messages/${caseToken}`);
  };

  const handleBack = () => {
    navigate('/lawyer/accepted-cases');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', 
      month: 'long', 
      day: 'numeric'
    });
  };

  if (loading) return (
    <>
      <LawyerHeader />
      <div className="lawyer-case-detail-container">
        <div className="lawyer-case-detail-loading">
          <div className="lawyer-case-detail-spinner"></div>
          <p>Loading case details...</p>
        </div>
      </div>
    </>
  );
  
  if (error) return (
    <>
      <LawyerHeader />
      <div className="lawyer-case-detail-container">
        <div className="lawyer-case-detail-error">
          <div className="lawyer-case-detail-error-icon">!</div>
          <p>{error}</p>
          <button 
            onClick={handleBack}
            className="lawyer-case-detail-back-btn"
          >
            Return to Cases
          </button>
        </div>
      </div>
    </>
  );
  
  if (!caseData || !requestData) return (
    <>
      <LawyerHeader />
      <div className="lawyer-case-detail-container">
        <div className="lawyer-case-detail-not-found">
          <div className="lawyer-case-detail-not-found-icon">?</div>
          <p>No case details found for this token</p>
          <button 
            onClick={handleBack}
            className="lawyer-case-detail-back-btn"
          >
            Return to Cases
          </button>
        </div>
      </div>
    </>
  );

  return (
    <>
      <LawyerHeader />
      <div className="lawyer-case-detail-container">
        <div className="lawyer-case-detail-header">
          <div className="lawyer-case-detail-title-section">
            <button 
              onClick={handleBack}
              className="lawyer-case-detail-back-link"
            >
              ← Back to Cases
            </button>
            <h1 className="lawyer-case-detail-title">Case: {caseData.caseTitle || caseToken}</h1>
            <div className="lawyer-case-detail-case-token">Reference ID: {caseToken}</div>
          </div>
          <div className="lawyer-case-detail-actions">
            <button 
              onClick={handleMessageClient}
              className="lawyer-case-detail-message-btn"
            >
              Message Client
            </button>
          </div>
        </div>
        
        <div className="lawyer-case-detail-summary-grid">
          {/* Case Information */}
          <div className="lawyer-case-detail-card">
            <div className="lawyer-case-detail-card-header">
              <h2>Case Information</h2>
              <span className={`lawyer-case-detail-status lawyer-case-detail-status-${caseData.status.toLowerCase()}`}>
                {caseData.status}
              </span>
            </div>
            <div className="lawyer-case-detail-card-content">
              <div className="lawyer-case-detail-info-grid">
                <div className="lawyer-case-detail-info-item">
                  <div className="lawyer-case-detail-info-label">Type</div>
                  <div className="lawyer-case-detail-info-value">{caseData.caseType || 'N/A'}</div>
                </div>
                <div className="lawyer-case-detail-info-item">
                  <div className="lawyer-case-detail-info-label">Court</div>
                  <div className="lawyer-case-detail-info-value">{caseData.court || 'N/A'}</div>
                </div>
                <div className="lawyer-case-detail-info-item">
                  <div className="lawyer-case-detail-info-label">Judge</div>
                  <div className="lawyer-case-detail-info-value">{caseData.judge || 'N/A'}</div>
                </div>
                <div className="lawyer-case-detail-info-item">
                  <div className="lawyer-case-detail-info-label">Priority</div>
                  <div className="lawyer-case-detail-info-value">
                    <span className={`lawyer-case-detail-priority lawyer-case-detail-priority-${caseData.priority.toLowerCase()}`}>
                      {caseData.priority}
                    </span>
                  </div>
                </div>
                <div className="lawyer-case-detail-info-item">
                  <div className="lawyer-case-detail-info-label">Filing Date</div>
                  <div className="lawyer-case-detail-info-value">{formatDate(caseData.filingDate)}</div>
                </div>
                <div className="lawyer-case-detail-info-item">
                  <div className="lawyer-case-detail-info-label">FIR Number</div>
                  <div className="lawyer-case-detail-info-value lawyer-case-detail-fir">{caseData.firNumber || 'N/A'}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Client Information */}
          <div className="lawyer-case-detail-card">
            <div className="lawyer-case-detail-card-header">
              <h2>Client Information</h2>
            </div>
            <div className="lawyer-case-detail-card-content">
              <div className="lawyer-case-detail-client-info">
                <div className="lawyer-case-detail-client-name">{requestData.clientName}</div>
                <div className="lawyer-case-detail-client-contact">
                  <div className="lawyer-case-detail-client-email">
                    <span className="lawyer-case-detail-info-label">Email:</span> {requestData.clientEmail}
                  </div>
                  <div className="lawyer-case-detail-client-phone">
                    <span className="lawyer-case-detail-info-label">Phone:</span> {requestData.clientPhone || 'N/A'}
                  </div>
                </div>
                
                <div className="lawyer-case-detail-case-description">
                  <div className="lawyer-case-detail-info-label">Case Description</div>
                  <div className="lawyer-case-detail-description-content">
                    {requestData.caseDetails}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Hearings */}
        <div className="lawyer-case-detail-card lawyer-case-detail-hearings-card">
          <div className="lawyer-case-detail-card-header">
            <h2>Hearings</h2>
            <span className="lawyer-case-detail-hearings-count">
              {caseData.hearings?.length || 0} Total
            </span>
          </div>
          <div className="lawyer-case-detail-card-content">
            {caseData.hearings?.length > 0 ? (
              <div className="lawyer-case-detail-table-wrapper">
                <table className="lawyer-case-detail-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Description</th>
                      <th>Judge Remarks</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {caseData.hearings.map((hearing, index) => (
                      <tr key={index}>
                        <td className="lawyer-case-detail-date-cell">{formatDate(hearing.date)}</td>
                        <td>{hearing.description}</td>
                        <td>{hearing.judgeRemarks || 'N/A'}</td>
                        <td>
                          <span className={`lawyer-case-detail-hearing-status lawyer-case-detail-hearing-status-${hearing.status.toLowerCase()}`}>
                            {hearing.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="lawyer-case-detail-no-hearings">
                <div className="lawyer-case-detail-no-hearings-icon">📅</div>
                <p>No hearings scheduled yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default CaseDetails;