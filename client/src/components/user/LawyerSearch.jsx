import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import UserHeader from '../../components/user/UserHeader';
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
  const [searchPerformed, setSearchPerformed] = useState(false);
  const navigate = useNavigate();

  // Common specializations for dropdown
  const specializations = [
    'Criminal',
    'Family',
    'Corporate',
    'Real Estate',
    'Intellectual Property',
    'Tax',
    'Immigration',
    'Personal Injury',
    'Employment',
    'Estate Planning'
  ];

  // Popular locations for dropdown
  const popularLocations = [
    'Mumbai',
    'Delhi',
    'Bangalore',
    'Chennai',
    'Kolkata',
    'Hyderabad',
    'Pune',
    'Ahmedabad'
  ];

  const handleChange = (e) => {
    setSearchParams({
      ...searchParams,
      [e.target.name]: e.target.value
    });
    
    // Clear error when user changes input
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSearchPerformed(true);
  
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
      
      const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/lawyers/search`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        params: cleanedParams,
        paramsSerializer: params => {
          return Object.entries(params)
            .filter(([_, value]) => value !== '') // Remove empty params
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

  // Generate random rating for demo purposes
  const getRandomRating = () => {
    return (Math.random() * 2 + 3).toFixed(1); // Random between 3.0 and 5.0
  };

  // Render star rating component
  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const stars = [];
    
    // Full stars
    for (let i = 0; i < fullStars; i++) {
      stars.push(<span key={`full-${i}`}>★</span>);
    }
    
    // Half star
    if (hasHalfStar) {
      stars.push(<span key="half">★</span>);
    }
    
    // Empty stars
    const emptyStars = 5 - stars.length;
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<span key={`empty-${i}`} style={{ opacity: 0.3 }}>★</span>);
    }
    
    return stars;
  };

  return (
    <div className="lawyer-search-page">
      <UserHeader />
      <div className="lawyer-search-container">
        <div className="lawyer-search-header">
          <h2>Find Your Legal Expert</h2>
          <p className="lawyer-search-subtitle">Connect with qualified legal professionals tailored to your specific needs</p>
        </div>
        
        <form onSubmit={handleSubmit} className="lawyer-search-form">
          <div className="lawyer-search-form-row">
            <div className="lawyer-search-form-group">
              <label htmlFor="specialization">Legal Specialization</label>
              <input
                id="specialization"
                list="specialization-list"
                type="text"
                name="specialization"
                value={searchParams.specialization}
                onChange={handleChange}
                placeholder="e.g., Criminal, Family, Corporate"
                className="lawyer-search-input"
              />
              <datalist id="specialization-list">
                {specializations.map((spec) => (
                  <option key={spec} value={spec} />
                ))}
              </datalist>
            </div>
            <div className="lawyer-search-form-group">
              <label htmlFor="location">Location</label>
              <input
                id="location"
                list="location-list"
                type="text"
                name="location"
                value={searchParams.location}
                onChange={handleChange}
                placeholder="City or State"
                className="lawyer-search-input"
              />
              <datalist id="location-list">
                {popularLocations.map((loc) => (
                  <option key={loc} value={loc} />
                ))}
              </datalist>
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
              {loading ? (
                <>
                  <span className="lawyer-search-loading"></span>
                  Searching...
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  </svg>
                  Search Lawyers
                </>
              )}
            </button>
          </div>
        </form>

        {error && (
          <div className="lawyer-search-error">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FF6B6B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '10px' }}>
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            {error}
          </div>
        )}

        {lawyers.length > 0 && (
          <div className="lawyer-search-results">
            <h3>Available Legal Experts ({lawyers.length})</h3>
            <div className="lawyer-search-results-list">
              {lawyers.map(lawyer => {
                const rating = getRandomRating();
                
                return (
                  <div key={lawyer._id} className="lawyer-search-result-card">
                    <div className="lawyer-search-result-header">
                      <h4>{lawyer.name}</h4>
                      <p className="lawyer-search-specialization">
                        {lawyer.specialization.join(', ')}
                      </p>
                      <div className="lawyer-search-rating">
                        <div className="lawyer-search-stars">
                          {renderStars(rating)}
                        </div>
                        <span className="lawyer-search-rating-count">
                          {rating} ({Math.floor(Math.random() * 50) + 5} reviews)
                        </span>
                      </div>
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
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M5 12h14"></path>
                          <path d="M12 5l7 7-7 7"></path>
                        </svg>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {lawyers.length === 0 && searchPerformed && !loading && !error && (
          <div className="lawyer-search-no-results">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#15B097" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '16px' }}>
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              <line x1="8" y1="11" x2="14" y2="11"></line>
            </svg>
            <p>No lawyers match your search criteria. Try adjusting your filters.</p>
          </div>
        )}

        {!searchPerformed && !loading && !error && (
          <div className="lawyer-search-no-results" style={{ background: 'rgba(10, 36, 99, 0.05)' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#0A2463" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '16px', opacity: 0.7 }}>
              <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <path d="M12 18v-6"></path>
              <path d="M9 15h6"></path>
            </svg>
            <p style={{ color: '#0A2463' }}>Use the search form above to find legal experts that match your requirements.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LawyerSearch;