import { useState } from 'react';
import axios from 'axios';

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
    <div className="mt-6">
      <h2 className="text-xl font-semibold mb-4">Find a Lawyer</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Specialization</label>
            <input
              type="text"
              name="specialization"
              value={searchParams.specialization}
              onChange={handleChange}
              placeholder="e.g., Criminal, Family"
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Location</label>
            <input
              type="text"
              name="location"
              value={searchParams.location}
              onChange={handleChange}
              placeholder="City or State"
              className="w-full p-2 border rounded"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Min Experience (years)</label>
            <input
              type="number"
              name="minExperience"
              value={searchParams.minExperience}
              onChange={handleChange}
              min="0"
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Max Hourly Rate (₹)</label>
            <input
              type="number"
              name="maxRate"
              value={searchParams.maxRate}
              onChange={handleChange}
              min="0"
              className="w-full p-2 border rounded"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`px-4 py-2 rounded text-white ${loading ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'}`}
        >
          {loading ? 'Searching...' : 'Search Lawyers'}
        </button>
      </form>

      {error && <div className="text-red-500 mt-2">{error}</div>}

      {lawyers.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">Available Lawyers</h3>
          <div className="space-y-4">
            {lawyers.map(lawyer => (
              <div key={lawyer._id} className="border rounded p-4 hover:bg-gray-50">
                <h4 className="font-bold">{lawyer.name}</h4>
                <p className="text-sm text-gray-600">{lawyer.specialization.join(', ')}</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2 text-sm">
                  <p>Exp: {lawyer.experience} yrs</p>
                  <p>Rate: ₹{lawyer.hourlyRate}/hr</p>
                  <p>Location: {lawyer.location}</p>
                  <p>Languages: {lawyer.languages?.join(', ') || 'N/A'}</p>
                </div>
                <button className="mt-2 text-blue-600 hover:underline">
                  View Profile
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LawyerSearch;