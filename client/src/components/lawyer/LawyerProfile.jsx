import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../../assets/styles/lawyer/LawyerProfile.css';

const LawyerProfile = () => {
  const [lawyerData, setLawyerData] = useState(null);
  const [requests, setRequests] = useState([]);
  const navigate = useNavigate();
  const [loading, setLoading] = useState({
    profile: true,
    requests: true,
    action: false
  });
  const [error, setError] = useState('');

  // Fetch lawyer profile and requests
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('lawyerToken');
        
        // Fetch lawyer profile
        const profileResponse = await axios.get('http://localhost:4000/api/lawyers/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setLawyerData(profileResponse.data.data);

        // Fetch pending requests
        const requestsResponse = await axios.get('http://localhost:4000/api/lawyers/my/requests', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setRequests(requestsResponse.data.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch data');
      } finally {
        setLoading({ profile: false, requests: false, action: false });
      }
    };

    fetchData();
  }, []);

  if (loading.profile) return (
    <div className="lawyer-profile-loading">
      <div className="lawyer-profile-loading-spinner"></div>
      <p>Loading profile...</p>
    </div>
  );
  
  if (error) return (
    <div className="lawyer-profile-error">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
        <path d="M12 8V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <circle cx="12" cy="16" r="1" fill="currentColor"/>
      </svg>
      <p>{error}</p>
    </div>
  );
  
  if (!lawyerData) return (
    <div className="lawyer-profile-empty">
      <p>No profile data found</p>
    </div>
  );

  return (
    <div className="lawyer-profile-container">
      <header className="lawyer-profile-header">
        <div className="lawyer-profile-logo">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="#1A365D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 17L12 22L22 17" stroke="#1A365D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 12L12 17L22 12" stroke="#1A365D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span>Legal Assist</span>
        </div>
        <nav className="lawyer-profile-nav">
          <button className="lawyer-profile-nav-button">Dashboard</button>
          <button className="lawyer-profile-nav-button lawyer-profile-nav-button-active">My Profile</button>
          <button className="lawyer-profile-nav-button">Messages</button>
          <button className="lawyer-profile-nav-button">Settings</button>
        </nav>
      </header>

      <main className="lawyer-profile-main">
        {/* Lawyer Profile Card */}
        <section className="lawyer-profile-card">
          <div className="lawyer-profile-card-header">
            <div className="lawyer-profile-avatar">
              {lawyerData.name.charAt(0)}
            </div>
            <div className="lawyer-profile-title">
              <h1>{lawyerData.name}</h1>
              <p>
                <span className={`lawyer-profile-status ${lawyerData.availability ? 'lawyer-profile-status-available' : 'lawyer-profile-status-unavailable'}`}>
                  {lawyerData.availability ? 'Available for new cases' : 'Not accepting new cases'}
                </span>
              </p>
            </div>
            <button className="lawyer-profile-edit-button">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M18.5 2.5C18.8978 2.10217 19.4374 1.87868 20 1.87868C20.5626 1.87868 21.1022 2.10217 21.5 2.5C21.8978 2.89782 22.1213 3.43739 22.1213 4C22.1213 4.56261 21.8978 5.10217 21.5 5.5L12 15L8 16L9 12L18.5 2.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Edit Profile
            </button>
          </div>

          <div className="lawyer-profile-grid">
            <div className="lawyer-profile-info-section">
              <h2>Personal Information</h2>
              <div className="lawyer-profile-info-grid">
                <div className="lawyer-profile-info-item">
                  <span className="lawyer-profile-info-label">Email</span>
                  <span className="lawyer-profile-info-value">{lawyerData.email}</span>
                </div>
                <div className="lawyer-profile-info-item">
                  <span className="lawyer-profile-info-label">Phone</span>
                  <span className="lawyer-profile-info-value">{lawyerData.phone || 'Not provided'}</span>
                </div>
                <div className="lawyer-profile-info-item">
                  <span className="lawyer-profile-info-label">Bar Association ID</span>
                  <span className="lawyer-profile-info-value">{lawyerData.barAssociationId}</span>
                </div>
                <div className="lawyer-profile-info-item">
                  <span className="lawyer-profile-info-label">Location</span>
                  <span className="lawyer-profile-info-value">{lawyerData.location}</span>
                </div>
              </div>
            </div>

            <div className="lawyer-profile-info-section">
              <h2>Professional Details</h2>
              <div className="lawyer-profile-info-grid">
                <div className="lawyer-profile-info-item">
                  <span className="lawyer-profile-info-label">Experience</span>
                  <span className="lawyer-profile-info-value">{lawyerData.experience} years</span>
                </div>
                <div className="lawyer-profile-info-item">
                  <span className="lawyer-profile-info-label">Hourly Rate</span>
                  <span className="lawyer-profile-info-value">₹{lawyerData.hourlyRate}</span>
                </div>
              </div>
            </div>

            <div className="lawyer-profile-info-section lawyer-profile-info-section-full">
              <h2>Specializations</h2>
              <div className="lawyer-profile-tags">
                {lawyerData.specialization.map((spec, index) => (
                  <span key={index} className="lawyer-profile-tag lawyer-profile-tag-specialization">
                    {spec}
                  </span>
                ))}
              </div>
            </div>

            <div className="lawyer-profile-info-section lawyer-profile-info-section-full">
              <h2>Languages</h2>
              <div className="lawyer-profile-tags">
                {lawyerData.languages?.length > 0 ? (
                  lawyerData.languages.map((lang, index) => (
                    <span key={index} className="lawyer-profile-tag lawyer-profile-tag-language">
                      {lang}
                    </span>
                  ))
                ) : (
                  <p className="lawyer-profile-empty-message">No languages specified</p>
                )}
              </div>
            </div>
          </div>
        </section>

        <div className="lawyer-profile-action-buttons">
          <button 
            className="lawyer-profile-action-button lawyer-profile-action-button-cases"
            onClick={() => navigate('/lawyer/accepted-cases')}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22 12H16L14 15H10L8 12H2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M5.5 5.5L2 12V19C2 19.5304 2.21071 20.0391 2.58579 20.4142C2.96086 20.7893 3.46957 21 4 21H20C20.5304 21 21.0391 20.7893 21.4142 20.4142C21.7893 20.0391 22 19.5304 22 19V12L18.5 5.5C18.3374 5.19056 18.0861 4.94037 17.7742 4.76889C17.4623 4.59742 17.1036 4.50946 16.74 4.51H7.26C6.8963 4.50946 6.53773 4.59742 6.22581 4.76889C5.91389 4.94037 5.66264 5.19056 5.5 5.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            View Accepted Cases
          </button>
          <button className="lawyer-profile-action-button lawyer-profile-action-button-calendar">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 4H5C3.89543 4 3 4.89543 3 6V20C3 21.1046 3.89543 22 5 22H19C20.1046 22 21 21.1046 21 20V6C21 4.89543 20.1046 4 19 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M16 2V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M8 2V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M3 10H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Manage Calendar
          </button>
          <button className="lawyer-profile-action-button lawyer-profile-action-button-document">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M16 13H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M16 17H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M10 9H9H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            My Documents
          </button>
        </div>

        {/* Case Requests Section */}
        <section className="lawyer-profile-requests">
          <div className="lawyer-profile-requests-header">
            <h2>Case Requests</h2>
            <div className="lawyer-profile-requests-actions">
              <select className="lawyer-profile-requests-filter">
                <option value="all">All Requests</option>
                <option value="pending">Pending</option>
                <option value="accepted">Accepted</option>
                <option value="rejected">Rejected</option>
              </select>
              <button className="lawyer-profile-requests-refresh">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1 4V10H7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M23 20V14H17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M20.49 9C19.9828 7.56678 19.1209 6.2854 17.9845 5.27542C16.8482 4.26543 15.4745 3.55976 13.9917 3.22426C12.5089 2.88877 10.9652 2.93436 9.50481 3.35679C8.04437 3.77922 6.71475 4.56473 5.64 5.64L1 10M23 14L18.36 18.36C17.2853 19.4353 15.9556 20.2208 14.4952 20.6432C13.0348 21.0656 11.4911 21.1112 10.0083 20.7757C8.52547 20.4402 7.1518 19.7346 6.01547 18.7246C4.87913 17.7146 4.01717 16.4332 3.51 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Refresh
              </button>
            </div>
          </div>
          
          {loading.requests ? (
            <div className="lawyer-profile-loading lawyer-profile-loading-inline">
              <div className="lawyer-profile-loading-spinner"></div>
              <p>Loading requests...</p>
            </div>
          ) : requests.length === 0 ? (
            <div className="lawyer-profile-empty-state">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22 12H16L14 15H10L8 12H2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M5.5 5.5L2 12V19C2 19.5304 2.21071 20.0391 2.58579 20.4142C2.96086 20.7893 3.46957 21 4 21H20C20.5304 21 21.0391 20.7893 21.4142 20.4142C21.7893 20.0391 22 19.5304 22 19V12L18.5 5.5C18.3374 5.19056 18.0861 4.94037 17.7742 4.76889C17.4623 4.59742 17.1036 4.50946 16.74 4.51H7.26C6.8963 4.50946 6.53773 4.59742 6.22581 4.76889C5.91389 4.94037 5.66264 5.19056 5.5 5.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <p>No pending case requests</p>
              <span>New client requests will appear here</span>
            </div>
          ) : (
            <div className="lawyer-profile-requests-list">
              {requests.map(request => (
                <div key={request._id} className="lawyer-profile-request-item">
                  <div className="lawyer-profile-request-info">
                    <div className="lawyer-profile-request-primary">
                      <h3>Case Token: {request.caseToken}</h3>
                      <span className={`lawyer-profile-request-status lawyer-profile-request-status-${request.status}`}>
                        {request.status}
                      </span>
                    </div>
                    <div className="lawyer-profile-request-details">
                      <p>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        {request.clientName}
                      </p>
                      <p>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M22 12H16L14 15H10L8 12H2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M5.5 5.5L2 12V19C2 19.5304 2.21071 20.0391 2.58579 20.4142C2.96086 20.7893 3.46957 21 4 21H20C20.5304 21 21.0391 20.7893 21.4142 20.4142C21.7893 20.0391 22 19.5304 22 19V12L18.5 5.5C18.3374 5.19056 18.0861 4.94037 17.7742 4.76889C17.4623 4.59742 17.1036 4.50946 16.74 4.51H7.26C6.8963 4.50946 6.53773 4.59742 6.22581 4.76889C5.91389 4.94037 5.66264 5.19056 5.5 5.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        Case Request
                      </p>
                      <p>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M12 6V12L16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        {new Date().toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="lawyer-profile-request-actions">
                    <button 
                      onClick={() => navigate(`/lawyer/case-requests/${request._id}`)}
                      className="lawyer-profile-request-view-button"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default LawyerProfile;