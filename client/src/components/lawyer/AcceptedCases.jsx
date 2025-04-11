import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../../assets/styles/lawyer/AcceptedCases.css';

const AcceptedCases = () => {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAcceptedCases = async () => {
      try {
        const token = localStorage.getItem('lawyerToken');
        const response = await axios.get('http://localhost:4000/api/lawyer/accepted-cases', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCases(response.data.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch accepted cases');
      } finally {
        setLoading(false);
      }
    };

    fetchAcceptedCases();
  }, []);

  const viewCaseDetails = (caseToken) => {
    navigate(`/lawyer/case-details/${caseToken}`);
  };

  if (loading) return (
    <div className="accepted-cases-loading">
      <div className="accepted-cases-spinner"></div>
      <p>Loading accepted cases...</p>
    </div>
  );
  
  if (error) return (
    <div className="accepted-cases-error">
      <i className="accepted-cases-error-icon">!</i>
      <p>{error}</p>
    </div>
  );

  return (
    <div className="accepted-cases-container">
      <div className="accepted-cases-header">
        <h1>Your Accepted Cases</h1>
        <p className="accepted-cases-subtitle">Manage and review your current client cases</p>
      </div>
      
      {cases.length === 0 ? (
        <div className="accepted-cases-empty">
          <div className="accepted-cases-empty-icon">📁</div>
          <p>You haven't accepted any cases yet</p>
          <button 
            onClick={() => navigate('/lawyer/available-cases')}
            className="accepted-cases-empty-action"
          >
            Browse Available Cases
          </button>
        </div>
      ) : (
        <div className="accepted-cases-table-container">
          <div className="accepted-cases-table-wrapper">
            <table className="accepted-cases-table">
              <thead>
                <tr>
                  <th>Case ID</th>
                  <th>Title</th>
                  <th>Client</th>
                  <th>Status</th>
                  <th colSpan="2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {cases.map((caseItem) => (
                  <tr key={caseItem._id}>
                    <td className="accepted-cases-token">{caseItem.caseToken}</td>
                    <td className="accepted-cases-title">{caseItem.caseDetails?.caseTitle || 'N/A'}</td>
                    <td className="accepted-cases-client">
                      <div className="accepted-cases-client-name">{caseItem.clientName}</div>
                      <div className="accepted-cases-client-email">{caseItem.clientEmail}</div>
                    </td>
                    <td>
                      <span className={`accepted-cases-status accepted-cases-status-${caseItem.status}`}>
                        {caseItem.status}
                      </span>
                    </td>
                    <td className="accepted-cases-actions">
                      <button
                        onClick={() => viewCaseDetails(caseItem.caseToken)}
                        className="accepted-cases-view-btn"
                      >
                        View Details
                      </button>
                    </td>
                    <td className="accepted-cases-message">
                      <button 
                        onClick={() => navigate(`/lawyer/messages/${caseItem.caseToken}`)}
                        className="accepted-cases-message-btn"
                      >
                        Message
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AcceptedCases;