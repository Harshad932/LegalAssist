import React, { useState, useEffect } from 'react';
import { Link ,useNavigate} from 'react-router-dom';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faHome,
  faSignOutAlt,
  faInfoCircle,
  faBalanceScale,
  faExclamationTriangle,
  faExclamationCircle,
  faExclamation,
  faCheckCircle,
  faFolderOpen,
  faSearch,
  faCalendarAlt,
  faUserTie,
  faFlag,
  faHashtag,
  faEye,
  faEdit,
  faRobot,
  faSyncAlt
} from '@fortawesome/free-solid-svg-icons';
import '../assets/styles/AdminDashboard.css';

const AdminDashboard = () => {
  // State variables
  const [cases, setCases] = useState([]);
  const [filteredCases, setFilteredCases] = useState([]);
  const [currentFilter, setCurrentFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [toast, setToast] = useState({ show: false, message: '' });
  const [loading, setLoading] = useState(true);
  const [prioritizing, setPrioritizing] = useState(false);
  const [casesToPrioritize, setCasesToPrioritize] = useState(10);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1, limit: 20 });
  const navigate = useNavigate();
  
  // Load cases from API
  useEffect(() => {
    fetchCases();
  }, [page]);
  
  const fetchCases = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:4000/admin/cases`, { 
        withCredentials: true 
      });
      setCases(response.data.cases);
      setPagination(response.data.pagination);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching cases:', error);
      showToast('Error loading cases');
      setLoading(false);
    }
  };
  
  // Update filtered cases when cases, search, or filter changes
  useEffect(() => {
    applyFilters();
  }, [cases, searchTerm, currentFilter]);

  // Show toast message
  const showToast = (message) => {
    setToast({ show: true, message });
    setTimeout(() => {
      setToast({ show: false, message: '' });
    }, 3000);
  };

  // Apply filters
  const applyFilters = () => {
    setFilteredCases(cases.filter(caseItem => {
      // Convert priority values to match your filter values
      const priorityValue = caseItem.priority?.toLowerCase() || '';
      
      // Apply priority filter
      if (currentFilter !== 'all') {
        if (currentFilter.toLowerCase() !== priorityValue) {
          return false;
        }
      }
      
      // Apply search filter
      if (searchTerm) {
        return (
          (caseItem.caseTitle || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
          (caseItem.caseType || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
          (caseItem.hearings?.[0]?.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
          (caseItem.judge || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
          (caseItem.tokenNumber || '').toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      
      return true;
    }));
  };

  // Prioritize cases with OpenAI
  const prioritizeCases = async () => {
    if (casesToPrioritize <= 0) {
      showToast('Please enter a valid number of cases');
      return;
    }
    
    try {
      setPrioritizing(true);
      showToast(`Prioritizing ${casesToPrioritize} cases...`);
      
      const response = await axios.post('http://localhost:4000/admin/prioritize-cases', {
        numberOfCases: casesToPrioritize
      }, { withCredentials: true });
      
      showToast(`Successfully prioritized ${response.data.processedCases.length} cases`);
      fetchCases(); // Reload cases
      setPrioritizing(false);
    } catch (error) {
      console.error('Error prioritizing cases:', error);
      showToast('Error prioritizing cases');
      setPrioritizing(false);
    }
  };

  // View case details
  const viewDetails = async (token) => {
    showToast(`Viewing details for Case #${token}`);
    try {
      const response = await axios.get(`http://localhost:4000/case/${token}`);
      console.log("Response Data:", response.data);  // Debugging

      navigate("/case-details", { state: { caseData: response.data } });
    } catch (err) {
      console.error("Error fetching case details:", err);
    }
  };

  // Edit case
  const editCase = (id) => {
    showToast(`Editing Case #${id}`);
    // Implement actual edit case functionality here
  };

  // Logout handler
  const handleLogout = () => {
    showToast('Logging out...');
    setTimeout(() => {
      // Redirect to login page
      // Replace with proper auth logout logic
      window.location.href = '/admin-login';
    }, 1000);
  };

  // Calculate counts
  const criticalPriorityCount = cases.filter(c => c.priority?.toLowerCase() === 'critical').length;
  const highPriorityCount = cases.filter(c => c.priority?.toLowerCase() === 'high').length;
  const mediumPriorityCount = cases.filter(c => c.priority?.toLowerCase() === 'medium').length;
  const lowPriorityCount = cases.filter(c => c.priority?.toLowerCase() === 'low').length;
  const unprioritizedCount = cases.filter(c => !c.priority).length;
  const totalCasesCount = cases.length;

  // Handle pagination
  const handleNextPage = () => {
    if (page < pagination.pages) {
      setPage(page + 1);
    }
  };

  const handlePrevPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  return (
    <>
      <header>
        <div className="container">
          <nav>
            <Link to="/" className="logo">Legal<span>Assist</span> Admin</Link>
            <div>
              <Link to="/" className="btn">
                <FontAwesomeIcon icon={faHome} /> Main Site
              </Link>
              <button className="btn btn-accent" onClick={handleLogout}>
                <FontAwesomeIcon icon={faSignOutAlt} /> Logout
              </button>
            </div>
          </nav>
        </div>
      </header>

      <div className={`toast ${toast.show ? 'show' : ''}`}>
        <FontAwesomeIcon icon={faInfoCircle} />
        <span>{toast.message}</span>
      </div>

      <div className="container admin-dashboard">
        <div className="admin-header">
          <h2><FontAwesomeIcon icon={faBalanceScale} /> Case Prioritization Dashboard</h2>
          <div className="priority-legend">
            <span className="priority-indicator priority-critical">Critical Priority</span>
            <span className="priority-indicator priority-high">High Priority</span>
            <span className="priority-indicator priority-medium">Medium Priority</span>
            <span className="priority-indicator priority-low">Low Priority</span>
          </div>
        </div>

        <div className="prioritization-controls">
          <div className="prioritization-input">
            <label htmlFor="casesToPrioritize">Number of cases to prioritize:</label>
            <input 
              type="number" 
              id="casesToPrioritize"
              min="1"
              max="100"
              value={casesToPrioritize}
              onChange={(e) => setCasesToPrioritize(e.target.value)}
            />
            <button 
              className="btn btn-primary"
              onClick={prioritizeCases}
              disabled={prioritizing}
            >
              <FontAwesomeIcon icon={faSyncAlt} spin={prioritizing} />
              {prioritizing ? 'Processing...' : 'Prioritize Cases with AI'}
            </button>
          </div>
          <p className="prioritization-info">
            <FontAwesomeIcon icon={faRobot} /> AI will analyze and prioritize the specified number of cases
          </p>
        </div>

        <div className="dashboard-stats">
          <div className="stat-card">
            <FontAwesomeIcon icon={faExclamationTriangle} />
            <h3>{criticalPriorityCount}</h3>
            <p>Critical Priority</p>
          </div>
          <div className="stat-card">
            <FontAwesomeIcon icon={faExclamationCircle} />
            <h3>{highPriorityCount}</h3>
            <p>High Priority</p>
          </div>
          <div className="stat-card">
            <FontAwesomeIcon icon={faExclamation} />
            <h3>{mediumPriorityCount}</h3>
            <p>Medium Priority</p>
          </div>
          <div className="stat-card">
            <FontAwesomeIcon icon={faCheckCircle} />
            <h3>{lowPriorityCount}</h3>
            <p>Low Priority</p>
          </div>
          <div className="stat-card">
            <FontAwesomeIcon icon={faFolderOpen} />
            <h3>{totalCasesCount}</h3>
            <p>Total Cases</p>
          </div>
        </div>

        <div className="filter-controls">
          <div className="search-bar">
            <FontAwesomeIcon icon={faSearch} />
            <input 
              type="text" 
              placeholder="Search cases..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="filter-group">
            <button 
              className={`btn btn-sm ${currentFilter === 'all' ? 'active' : ''}`} 
              onClick={() => setCurrentFilter('all')}
            >
              All Cases
            </button>
            <button 
              className={`btn btn-sm btn-critical ${currentFilter === 'critical' ? 'active' : ''}`} 
              onClick={() => setCurrentFilter('critical')}
            >
              Critical Priority
            </button>
            <button 
              className={`btn btn-sm btn-high ${currentFilter === 'high' ? 'active' : ''}`} 
              onClick={() => setCurrentFilter('high')}
            >
              High Priority
            </button>
            <button 
              className={`btn btn-sm btn-medium ${currentFilter === 'medium' ? 'active' : ''}`} 
              onClick={() => setCurrentFilter('medium')}
            >
              Medium Priority
            </button>
            <button 
              className={`btn btn-sm btn-low ${currentFilter === 'low' ? 'active' : ''}`} 
              onClick={() => setCurrentFilter('low')}
            >
              Low Priority
            </button>
          </div>
        </div>

        <div className="priority-list">
          {loading ? (
            <div className="loading-indicator">
              <div className="spinner"></div>
              <p>Loading cases...</p>
            </div>
          ) : filteredCases.length === 0 ? (
            <div className="no-cases-found">
              <FontAwesomeIcon icon={faSearch} />
              <h3>No cases found</h3>
              <p>Try adjusting your search or filters</p>
            </div>
          ) : (
            filteredCases.map(caseItem => {
              const priorityClass = !caseItem.priority ? 'priority-unknown' : 
                caseItem.priority.toLowerCase() === 'critical' ? 'priority-critical' : 
                `priority-${caseItem.priority.toLowerCase()}`;
              
              const priorityBadgeClass = !caseItem.priority ? 'badge-unknown' : 
                caseItem.priority.toLowerCase() === 'critical' ? 'badge-critical' : 
                `badge-${caseItem.priority.toLowerCase()}`;
              
              const priorityDisplay = !caseItem.priority ? 'UNPROCESSED' : caseItem.priority.toUpperCase();
              
              return (
                <div className={`case-card ${priorityClass}`} key={caseItem._id || caseItem.id}>
                  <div className="case-header">
                    <h3>{caseItem.caseTitle}</h3>
                    <span className="case-type">{caseItem.caseType}</span>
                  </div>
                  <p className="case-description">
                    {caseItem.hearings && caseItem.hearings.length > 0 ? 
                      caseItem.hearings[0].description : "No description available"}
                  </p>
                  <div className="case-meta">
                    <span>
                      <FontAwesomeIcon icon={faCalendarAlt} /> 
                      {caseItem.filingDate ? new Date(caseItem.filingDate).toLocaleDateString() : "No date"}
                    </span>
                    <span>
                      <FontAwesomeIcon icon={faUserTie} /> 
                      {caseItem.judge || "Unassigned"}
                    </span>
                  </div>
                  <div className="case-meta">
                    <span>
                      <FontAwesomeIcon icon={faFlag} /> Priority:
                      <span className={`badge ${priorityBadgeClass}`}>
                        {priorityDisplay}
                      </span>
                    </span>
                    <span>
                      <FontAwesomeIcon icon={faHashtag} /> 
                      Case #{caseItem.tokenNumber}
                    </span>
                  </div>
                  <div className="case-actions">
                    <div className="case-action-info">
                      {caseItem.priority && (
                        <span className="priority-info">
                          <FontAwesomeIcon icon={faRobot} /> AI-assigned priority
                        </span>
                      )}
                    </div>
                    <div className="case-actions-right">
                      <button 
                        className="btn btn-sm" 
                        onClick={() => viewDetails(caseItem.tokenNumber || caseItem.id)}
                      >
                        <FontAwesomeIcon icon={faEye} />
                      </button>
                      <button 
                        className="btn btn-sm" 
                        onClick={() => navigate(`/admin/case/edit/${caseItem.tokenNumber || caseItem.id}`)}
                      >
                        <FontAwesomeIcon icon={faEdit} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
        
        {pagination.pages > 1 && (
          <div className="pagination-controls">
            <button 
              className="btn btn-sm" 
              onClick={handlePrevPage} 
              disabled={page === 1 || loading}
            >
              Previous
            </button>
            <span className="page-indicator">
              Page {page} of {pagination.pages}
            </span>
            <button 
              className="btn btn-sm" 
              onClick={handleNextPage} 
              disabled={page === pagination.pages || loading}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default AdminDashboard;