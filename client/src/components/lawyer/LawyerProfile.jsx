import { useState, useEffect } from 'react';
import axios from 'axios';

const LawyerProfile = () => {
  const [lawyerData, setLawyerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchLawyerProfile = async () => {
      try {
        const token = localStorage.getItem('lawyerToken'); // Note: lawyerToken
        
        const response = await axios.get('http://localhost:4000/api/lawyers/me', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
  
        setLawyerData(response.data.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch profile');
      } finally {
        setLoading(false);
      }
    };
  
    fetchLawyerProfile();
  }, []);

  if (loading) return <div className="text-center py-8">Loading profile...</div>;
  if (error) return <div className="text-red-500 text-center py-8">{error}</div>;
  if (!lawyerData) return <div className="text-center py-8">No profile data found</div>;

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Your Lawyer Profile</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">Personal Information</h2>
          <div className="space-y-3">
            <p><span className="font-medium">Name:</span> {lawyerData.name}</p>
            <p><span className="font-medium">Email:</span> {lawyerData.email}</p>
            <p><span className="font-medium">Phone:</span> {lawyerData.phone || 'Not provided'}</p>
            <p><span className="font-medium">Bar Association ID:</span> {lawyerData.barAssociationId}</p>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">Professional Details</h2>
          <div className="space-y-3">
            <p><span className="font-medium">Experience:</span> {lawyerData.experience} years</p>
            <p><span className="font-medium">Hourly Rate:</span> ₹{lawyerData.hourlyRate}</p>
            <p><span className="font-medium">Location:</span> {lawyerData.location}</p>
            <p>
              <span className="font-medium">Availability:</span> 
              <span className={`ml-2 px-2 py-1 rounded text-xs ${lawyerData.availability ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {lawyerData.availability ? 'Available' : 'Not Available'}
              </span>
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">Specializations</h2>
          <div className="flex flex-wrap gap-2">
            {lawyerData.specialization.map((spec, index) => (
              <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                {spec}
              </span>
            ))}
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">Languages</h2>
          <div className="flex flex-wrap gap-2">
            {lawyerData.languages?.length > 0 ? (
              lawyerData.languages.map((lang, index) => (
                <span key={index} className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">
                  {lang}
                </span>
              ))
            ) : (
              <p className="text-gray-500">No languages specified</p>
            )}
          </div>
        </div>
      </div>

      <div className="mt-8">
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md transition-colors">
          Edit Profile
        </button>
      </div>
    </div>
  );
};

export default LawyerProfile;