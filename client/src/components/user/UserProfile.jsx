import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import LawyerSearch from "./LawyerSearch";
import '../../assets/styles/user/UserProfile.css';

const UserProfile = () => {
  const [userData, setUserData] = useState(null);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState({
    profile: true,
    requests: true
  });
  const [error, setError] = useState('');
  const [showLawyerSearch, setShowLawyerSearch] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('userToken');
        
        // Fetch user profile
        const profileResponse = await axios.get('http://localhost:4000/api/users/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUserData(profileResponse.data.data);

        // Fetch user's requests
        const requestsResponse = await axios.get('http://localhost:4000/api/users/requests', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setRequests(requestsResponse.data.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch data');
      } finally {
        setLoading({ profile: false, requests: false });
      }
    };

    fetchData();
  }, []);

  if (loading.profile) return <div className="user-profile-loading">Loading profile...</div>;
  if (error) return <div className="user-profile-error">{error}</div>;
  if (!userData) return <div className="user-profile-not-found">No user data found</div>;

  return (
    <div className="user-profile-container">
      {/* Profile Section */}
      <div className="user-profile-card">
        <div className="user-profile-header">
          <h1>Your Profile</h1>
          <p className="user-profile-subtitle">Welcome back, {userData.name}</p>
        </div>
        
        <div className="user-profile-details">
          <div className="user-profile-detail-item">
            <h3>Name</h3>
            <p>{userData.name}</p>
          </div>
          <div className="user-profile-detail-item">
            <h3>Email</h3>
            <p>{userData.email}</p>
          </div>
          <div className="user-profile-detail-item">
            <h3>Phone</h3>
            <p>{userData.phone || 'Not provided'}</p>
          </div>
          <div className="user-profile-detail-item">
            <h3>Role</h3>
            <p>{userData.role}</p>
          </div>
        </div>

        <div className="user-profile-action">
          <button
            onClick={() => setShowLawyerSearch(!showLawyerSearch)}
            className="user-profile-find-lawyer-btn"
          >
            {showLawyerSearch ? 'Hide Lawyer Search' : 'Find a Lawyer'}
          </button>
        </div>

        {showLawyerSearch && <div className="user-profile-lawyer-search"><LawyerSearch /></div>}
      </div>

      {/* Case Requests Section */}
      <div className="user-profile-requests-card">
        <div className="user-profile-requests-header">
          <h2>Your Case Requests</h2>
        </div>
        
        {loading.requests ? (
          <div className="user-profile-loading">Loading requests...</div>
        ) : requests.length === 0 ? (
          <div className="user-profile-no-requests">
            <p>No requests found</p>
            <p className="user-profile-hint">Use the "Find a Lawyer" button to create your first case request</p>
          </div>
        ) : (
          <div className="user-profile-requests-list">
            {requests.map(request => (
              <div 
                key={request._id} 
                className="user-profile-request-item"
                onClick={() => navigate(`/requests/${request._id}`)}
              >
                <div className="user-profile-request-content">
                  <div className="user-profile-request-info">
                    <h3>Case Token: {request.caseToken}</h3>
                    <p className="user-profile-lawyer-name">
                      Lawyer: {request.lawyer?.name || 'Unknown'}
                    </p>
                    <p className="user-profile-status">
                      Status: <span className={`user-profile-status-${request.status}`}>
                        {request.status}
                      </span>
                    </p>
                  </div>
                  <div className="user-profile-request-action">
                    <button className="user-profile-view-details-btn">
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;