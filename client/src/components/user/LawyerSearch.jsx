import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../../assets/styles/user/LawyerSearch.css';

const LawyerSearch = () => {
  const [searchParams, setSearchParams] = useState({
    specialization: '',
    location: '',
    minExperience: '',
    maxRate: ''
  });
  const [lawyers, setLawyers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setSearchParams({
      ...searchParams,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
  
    try {
      const token = localStorage.getItem('userToken');
      
      // Clean search parameters before sending
      const cleanedParams = {
        specialization: searchParams.specialization,
        location: searchParams.location.replace(/,/g, '+'), // Replace commas with +
        minExperience: searchParams.minExperience,
        maxRate: searchParams.maxRate
      };
      
      console.log('Sending search params:', cleanedParams); // Debug
      
      const response = await axios.get('http://localhost:4000/api/lawyers/search', {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        params: cleanedParams,
        paramsSerializer: params => {
          return Object.entries(params)
            .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
            .join('&');
        }
      });
      
      setLawyers(response.data);
    } catch (err) {
      console.error('Search error details:', {
        message: err.message,
        response: err.response?.data,
        stack: err.stack
      });
      setError(err.response?.data?.message || 'Search failed. Please try different criteria.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="lawyer-search-container">
      <div className="lawyer-search-header">
        <h2>Find a Lawyer</h2>
        <p className="lawyer-search-subtitle">Search for qualified legal professionals based on your needs</p>
      </div>
      
      <form onSubmit={handleSubmit} className="lawyer-search-form">
        <div className="lawyer-search-form-row">
          <div className="lawyer-search-form-group">
            <label htmlFor="specialization">Specialization</label>
            <input
              id="specialization"
              type="text"
              name="specialization"
              value={searchParams.specialization}
              onChange={handleChange}
              placeholder="e.g., Criminal, Family, Corporate"
              className="lawyer-search-input"
            />
          </div>
          <div className="lawyer-search-form-group">
            <label htmlFor="location">Location</label>
            <input
              id="location"
              type="text"
              name="location"
              value={searchParams.location}
              onChange={handleChange}
              placeholder="City or State"
              className="lawyer-search-input"
            />
          </div>
        </div>

        <div className="lawyer-search-form-row">
          <div className="lawyer-search-form-group">
            <label htmlFor="minExperience">Min Experience (years)</label>
            <input
              id="minExperience"
              type="number"
              name="minExperience"
              value={searchParams.minExperience}
              onChange={handleChange}
              min="0"
              placeholder="e.g., 5"
              className="lawyer-search-input"
            />
          </div>
          <div className="lawyer-search-form-group">
            <label htmlFor="maxRate">Max Hourly Rate (₹)</label>
            <input
              id="maxRate"
              type="number"
              name="maxRate"
              value={searchParams.maxRate}
              onChange={handleChange}
              min="0"
              placeholder="e.g., 5000"
              className="lawyer-search-input"
            />
          </div>
        </div>

        <div className="lawyer-search-button-container">
          <button
            type="submit"
            disabled={loading}
            className="lawyer-search-button"
          >
            {loading ? 'Searching...' : 'Search Lawyers'}
          </button>
        </div>
      </form>

      {error && <div className="lawyer-search-error">{error}</div>}

      {lawyers.length > 0 && (
        <div className="lawyer-search-results">
          <h3>Available Lawyers</h3>
          <div className="lawyer-search-results-list">
            {lawyers.map(lawyer => (
              <div key={lawyer._id} className="lawyer-search-result-card">
                <div className="lawyer-search-result-header">
                  <h4>{lawyer.name}</h4>
                  <p className="lawyer-search-specialization">{lawyer.specialization.join(', ')}</p>
                </div>
                <div className="lawyer-search-result-details">
                  <div className="lawyer-search-detail-item">
                    <span className="lawyer-search-detail-label">Experience:</span>
                    <span className="lawyer-search-detail-value">{lawyer.experience} years</span>
                  </div>
                  <div className="lawyer-search-detail-item">
                    <span className="lawyer-search-detail-label">Rate:</span>
                    <span className="lawyer-search-detail-value">₹{lawyer.hourlyRate}/hr</span>
                  </div>
                  <div className="lawyer-search-detail-item">
                    <span className="lawyer-search-detail-label">Location:</span>
                    <span className="lawyer-search-detail-value">{lawyer.location}</span>
                  </div>
                  <div className="lawyer-search-detail-item">
                    <span className="lawyer-search-detail-label">Languages:</span>
                    <span className="lawyer-search-detail-value">{lawyer.languages?.join(', ') || 'N/A'}</span>
                  </div>
                </div>
                <div className="lawyer-search-result-actions">
                  <button 
                    onClick={() => navigate(`/user/lawyer-profile/${lawyer._id}`)}
                    className="lawyer-search-view-profile"
                  >
                    View Profile
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {lawyers.length === 0 && !loading && !error && (
        <div className="lawyer-search-no-results">
          <p>Use the search form above to find lawyers that match your needs.</p>
        </div>
      )}
    </div>
  );
};

export default LawyerSearch;