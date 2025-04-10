import { useState, useEffect } from 'react';
import axios from 'axios';
import LawyerSearch from "./LawyerSearch";

const UserProfile = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showLawyerSearch, setShowLawyerSearch] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        setError('');
        
        const token = localStorage.getItem('userToken');
        console.log('Token from storage:', token);
        
        if (!token) {
          throw new Error('No token found in storage');
        }

        const response = await axios.get('http://localhost:4000/api/users/me', {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        console.log('Response data:', response.data);
        setUserData(response.data.data); // Make sure to set the data to state
      } catch (error) {
        console.error('Full error:', error);
        console.error('Error response:', error.response?.data);
        setError(error.response?.data?.message || 'Failed to fetch profile');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  if (loading) return <div>Loading profile...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!userData) return <div>No user data found</div>; // Additional safeguard

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-4">Your Profile</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <h3 className="font-semibold">Name</h3>
            <p>{userData.name}</p>
          </div>
          <div>
            <h3 className="font-semibold">Email</h3>
            <p>{userData.email}</p>
          </div>
          <div>
            <h3 className="font-semibold">Phone</h3>
            <p>{userData.phone || 'Not provided'}</p>
          </div>
          <div>
            <h3 className="font-semibold">Role</h3>
            <p>{userData.role}</p>
          </div>
        </div>

        <button
          onClick={() => setShowLawyerSearch(!showLawyerSearch)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {showLawyerSearch ? 'Hide Lawyer Search' : 'Find a Lawyer'}
        </button>

        {showLawyerSearch && <LawyerSearch />}
      </div>
    </div>
  );
};

export default UserProfile;