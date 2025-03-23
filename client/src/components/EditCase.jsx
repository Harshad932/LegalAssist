import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../assets/styles/EditCase.css';

const EditCasePage = () => {
  const { tokenNumber } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [caseData, setCaseData] = useState({
    tokenNumber: '',
    caseTitle: '',
    caseType: '',
    court: '',
    judge: '',
    petitioner: '',
    respondent: '',
    firNumber: '',
    filingDate: '',
    status: 'Pending',
    priority: 'Medium',
    hearings: []
  });

  // State for new hearing
  const [newHearing, setNewHearing] = useState({
    date: '',
    description: '',
    judgeRemarks: '',
    status: 'Scheduled'
  });

  // Fetch case data
  useEffect(() => {
    const fetchCase = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:4000/case/${tokenNumber}`);
        
        // Format date for input field
        const formattedData = {
          ...response.data,
          filingDate: response.data.filingDate ? new Date(response.data.filingDate).toISOString().split('T')[0] : '',
          hearings: response.data.hearings ? response.data.hearings.map(hearing => ({
            ...hearing,
            date: hearing.date ? new Date(hearing.date).toISOString().split('T')[0] : ''
          })) : []
        };
        
        setCaseData(formattedData);
        setLoading(false);
      } catch (err) {
        setError('Failed to load case data');
        setLoading(false);
        console.error(err);
      }
    };

    if (tokenNumber) {
      fetchCase();
    }
  }, [tokenNumber]);

  // Handle case data changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setCaseData({
      ...caseData,
      [name]: value
    });
  };

  // Handle new hearing changes
  const handleHearingChange = (e) => {
    const { name, value } = e.target;
    setNewHearing({
      ...newHearing,
      [name]: value
    });
  };

  // Handle existing hearing changes
  const handleExistingHearingChange = (index, field, value) => {
    const updatedHearings = [...caseData.hearings];
    updatedHearings[index] = {
      ...updatedHearings[index],
      [field]: value
    };
    
    setCaseData({
      ...caseData,
      hearings: updatedHearings
    });
  };

  // Add new hearing
  const addHearing = () => {
    // Only validate if user has started filling out the hearing form
    if ((newHearing.date || newHearing.description) && 
        (!newHearing.date || !newHearing.description)) {
      alert('Both hearing date and description are required to add a hearing');
      return;
    }
    
    // Only add if both required fields are filled
    if (newHearing.date && newHearing.description) {
      setCaseData({
        ...caseData,
        hearings: [...caseData.hearings, newHearing]
      });
      
      // Reset new hearing form
      setNewHearing({
        date: '',
        description: '',
        judgeRemarks: '',
        status: 'Scheduled'
      });
    }
  };

  // Remove hearing
  const removeHearing = (index) => {
    const updatedHearings = caseData.hearings.filter((_, i) => i !== index);
    setCaseData({
      ...caseData,
      hearings: updatedHearings
    });
  };

  // Save the case updates
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check if user has partially filled hearing info without adding it
    if (newHearing.date || newHearing.description || newHearing.judgeRemarks) {
      const confirmSubmit = window.confirm('You have unsaved hearing information. Do you want to add this hearing before saving?');
      if (confirmSubmit) {
        // If user confirms, try to add the hearing first
        if (!newHearing.date || !newHearing.description) {
          alert('Both hearing date and description are required to add a hearing');
          return;
        }
        addHearing();
      }
      // If they decline, we'll just submit the form without adding the hearing
    }
    
    try {
      setLoading(true);
      await axios.put(`http://localhost:4000/admin/case/edit/${tokenNumber}`, caseData);
      setLoading(false);
      alert('Case updated successfully');
      navigate('/admin-dashboard');
    } catch (err) {
      setError('Failed to update case');
      setLoading(false);
      console.error(err);
    }
  };

  if (loading) return <div className="edit-loading-container">Loading case data...</div>;
  if (error) return <div className="edit-error-message">{error}</div>;

  return (
    <div className="edit-container">
      <h2 className="edit-page-title">Edit Case: {caseData.caseTitle}</h2>
      <form onSubmit={handleSubmit} className="edit-form">
        <div className="edit-card">
          <div className="edit-card-header">
            <h3 className="edit-section-title">Case Details</h3>
          </div>
          <div className="edit-card-body">
            <div className="edit-row">
              <div className="edit-column">
                <label className="edit-label">Token Number</label>
                <input
                  type="text"
                  className="edit-input edit-readonly"
                  name="tokenNumber"
                  value={caseData.tokenNumber}
                  onChange={handleChange}
                  readOnly
                />
              </div>
              <div className="edit-column">
                <label className="edit-label">Case Title</label>
                <input
                  type="text"
                  className="edit-input"
                  name="caseTitle"
                  value={caseData.caseTitle}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="edit-row">
              <div className="edit-column">
                <label className="edit-label">Case Type</label>
                <input
                  type="text"
                  className="edit-input"
                  name="caseType"
                  value={caseData.caseType}
                  onChange={handleChange}
                />
              </div>
              <div className="edit-column">
                <label className="edit-label">Court</label>
                <input
                  type="text"
                  className="edit-input"
                  name="court"
                  value={caseData.court}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="edit-row">
              <div className="edit-column">
                <label className="edit-label">Judge</label>
                <input
                  type="text"
                  className="edit-input"
                  name="judge"
                  value={caseData.judge}
                  onChange={handleChange}
                />
              </div>
              <div className="edit-column">
                <label className="edit-label">FIR Number</label>
                <input
                  type="text"
                  className="edit-input"
                  name="firNumber"
                  value={caseData.firNumber}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="edit-row">
              <div className="edit-column">
                <label className="edit-label">Petitioner</label>
                <input
                  type="text"
                  className="edit-input"
                  name="petitioner"
                  value={caseData.petitioner}
                  onChange={handleChange}
                />
              </div>
              <div className="edit-column">
                <label className="edit-label">Respondent</label>
                <input
                  type="text"
                  className="edit-input"
                  name="respondent"
                  value={caseData.respondent}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="edit-row">
              <div className="edit-column edit-column-third">
                <label className="edit-label">Filing Date</label>
                <input
                  type="date"
                  className="edit-input"
                  name="filingDate"
                  value={caseData.filingDate}
                  onChange={handleChange}
                />
              </div>
              <div className="edit-column edit-column-third">
                <label className="edit-label">Status</label>
                <select
                  className="edit-select"
                  name="status"
                  value={caseData.status}
                  onChange={handleChange}
                >
                  <option value="Pending">Pending</option>
                  <option value="Active">Active</option>
                  <option value="Disposed">Disposed</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>
              <div className="edit-column edit-column-third">
                <label className="edit-label">Priority</label>
                <select
                  className="edit-select"
                  name="priority"
                  value={caseData.priority}
                  onChange={handleChange}
                >
                  <option value="Critical">Critical</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Hearings Section */}
        <div className="edit-card">
          <div className="edit-card-header">
            <h3 className="edit-section-title">Hearings (Optional)</h3>
          </div>
          <div className="edit-card-body">
            {/* Existing Hearings */}
            {caseData.hearings && caseData.hearings.length > 0 ? (
              <div className="edit-hearings-section">
                <h4 className="edit-subsection-title">Existing Hearings</h4>
                <div className="edit-table-container">
                  <table className="edit-table">
                    <thead className="edit-table-header">
                      <tr className="edit-table-row">
                        <th className="edit-table-cell edit-table-header-cell">Date</th>
                        <th className="edit-table-cell edit-table-header-cell">Description</th>
                        <th className="edit-table-cell edit-table-header-cell">Judge Remarks</th>
                        <th className="edit-table-cell edit-table-header-cell">Status</th>
                        <th className="edit-table-cell edit-table-header-cell">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="edit-table-body">
                      {caseData.hearings.map((hearing, index) => (
                        <tr key={index} className="edit-table-row">
                          <td className="edit-table-cell">
                            <input
                              type="date"
                              className="edit-input edit-table-input"
                              value={hearing.date}
                              onChange={(e) => handleExistingHearingChange(index, 'date', e.target.value)}
                            />
                          </td>
                          <td className="edit-table-cell">
                            <input
                              type="text"
                              className="edit-input edit-table-input"
                              value={hearing.description}
                              onChange={(e) => handleExistingHearingChange(index, 'description', e.target.value)}
                            />
                          </td>
                          <td className="edit-table-cell">
                            <input
                              type="text"
                              className="edit-input edit-table-input"
                              value={hearing.judgeRemarks}
                              onChange={(e) => handleExistingHearingChange(index, 'judgeRemarks', e.target.value)}
                            />
                          </td>
                          <td className="edit-table-cell">
                            <select
                              className="edit-select edit-table-select"
                              value={hearing.status}
                              onChange={(e) => handleExistingHearingChange(index, 'status', e.target.value)}
                            >
                              <option value="Scheduled">Scheduled</option>
                              <option value="Completed">Completed</option>
                              <option value="Postponed">Postponed</option>
                              <option value="Cancelled">Cancelled</option>
                            </select>
                          </td>
                          <td className="edit-table-cell">
                            <button
                              type="button"
                              className="edit-button edit-button-danger"
                              onClick={() => removeHearing(index)}
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="edit-no-hearings-message">No hearings have been added yet.</div>
            )}

            {/* Add New Hearing */}
            <div className="edit-add-hearing-section">
              <h4 className="edit-subsection-title">Add New Hearing (Optional)</h4>
              <div className="edit-row">
                <div className="edit-column edit-column-quarter">
                  <label className="edit-label">Date</label>
                  <input
                    type="date"
                    className="edit-input"
                    name="date"
                    value={newHearing.date}
                    onChange={handleHearingChange}
                  />
                </div>
                <div className="edit-column edit-column-quarter">
                  <label className="edit-label">Description</label>
                  <input
                    type="text"
                    className="edit-input"
                    name="description"
                    value={newHearing.description}
                    onChange={handleHearingChange}
                    placeholder="Hearing description"
                  />
                </div>
                <div className="edit-column edit-column-quarter">
                  <label className="edit-label">Judge Remarks</label>
                  <input
                    type="text"
                    className="edit-input"
                    name="judgeRemarks"
                    value={newHearing.judgeRemarks}
                    onChange={handleHearingChange}
                    placeholder="Judge remarks (optional)"
                  />
                </div>
                <div className="edit-column edit-column-quarter">
                  <label className="edit-label">Status</label>
                  <select
                    className="edit-select"
                    name="status"
                    value={newHearing.status}
                    onChange={handleHearingChange}
                  >
                    <option value="Scheduled">Scheduled</option>
                    <option value="Completed">Completed</option>
                    <option value="Postponed">Postponed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
              <button
                type="button"
                className="edit-button edit-button-primary edit-add-hearing-button"
                onClick={addHearing}
                disabled={!newHearing.date || !newHearing.description}
              >
                Add Hearing
              </button>
              <div className="edit-helper-text">
                * Adding hearings is optional. You can submit the form without adding any hearings.
              </div>
            </div>
          </div>
        </div>

        <div className="edit-actions">
          <button
            type="button"
            className="edit-button edit-button-secondary"
            onClick={() => navigate('/admin/cases')}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="edit-button edit-button-success" 
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditCasePage;