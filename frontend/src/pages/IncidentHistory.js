import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import AuthService from '../services/auth.service';
import ApiService from '../services/api.service';
import './IncidentHistory.css'; // New CSS for this page
import './Dashboard.css'; // Re-use Sidebar, Status, and Card styles

const IncidentHistory = () => {
  const navigate = useNavigate();
  const [detections, setDetections] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const ITEMS_PER_PAGE = 20; // You can make this configurable

  // --- Handle Logout ---
  const handleLogout = () => {
    AuthService.logout();
    navigate('/login');
  };

  // --- Fetch Detections ---
  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      setError('');
      try {
        // Assuming your backend /api/analysis/detections endpoint supports pagination
        const res = await ApiService.getDetections(ITEMS_PER_PAGE, currentPage);
        setDetections(res.data.detections); // Adjust based on your API response structure
        setTotalPages(res.data.totalPages); // Adjust based on your API response structure
      } catch (err) {
        console.error("Failed to fetch incident history:", err.response ? err.response.data : err);
        setError('Failed to load incident history. Please try again.');
        setDetections([]);
        setTotalPages(1);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [currentPage]); // Re-fetch when page changes

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  return (
    <div className="dashboard-layout"> {/* Re-use dashboard layout for consistency */}
      <Sidebar onLogout={handleLogout} />

      <main className="main-content">
        <header className="dashboard-header">
          <h1>Incident History</h1>
        </header>

        <div className="history-panel">
          {loading ? (
            <p className="loading-message">Loading incidents...</p>
          ) : error ? (
            <p className="error-message">{error}</p>
          ) : detections.length === 0 ? (
            <p className="no-incidents-message">No past incidents found.</p>
          ) : (
            <>
              <div className="history-list">
                {detections.map(det => (
                  <IncidentCard key={det.id} detection={det} /> // Re-use IncidentCard from Dashboard
                ))}
              </div>
              <div className="pagination-controls">
                <button 
                  onClick={() => handlePageChange(currentPage - 1)} 
                  disabled={currentPage === 1}
                  className="pagination-button"
                >
                  Previous
                </button>
                <span className="pagination-info">Page {currentPage} of {totalPages}</span>
                <button 
                  onClick={() => handlePageChange(currentPage + 1)} 
                  disabled={currentPage === totalPages}
                  className="pagination-button"
                >
                  Next
                </button>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

// Re-using Sidebar and IncidentCard from Dashboard.js
const Sidebar = ({ onLogout }) => {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sidebar">
      <div className="sidebar-logo">
        🛡️ CrimeEye-Pro
      </div>
      <div className="nav-menu">
        <Link to="/dashboard" className={`nav-item ${isActive('/dashboard') ? 'active' : ''}`}>
          <span>🏠</span> Live Dashboard
        </Link>
        <Link to="/history" className={`nav-item ${isActive('/history') ? 'active' : ''}`}>
          <span>📚</span> Incident History
        </Link>
      </div>
      <button onClick={onLogout} className="logout-button">
        <span>🚪</span> Logout
      </button>
    </nav>
  );
};

const IncidentCard = ({ detection }) => (
  <div className={`incident-card ${detection.threat_level || 'NONE'}`}>
    <img 
      src={detection.image_path ? `${process.env.REACT_APP_API_URL || 'http://localhost:5001'}/${detection.image_path}` : 'https://via.placeholder.com/100x60?text=No+Image'} 
      alt="detection snapshot" 
      className="incident-snapshot"
      onError={(e) => { e.target.onError = null; e.target.src = 'https://via.placeholder.com/100x60?text=Image+Failed'; e.target.style.display = 'block'; }}
    />
    <div className="incident-info">
      <h4>{detection.camera_id}</h4>
      <div className="timestamp">
        {new Date(detection.timestamp).toLocaleString()}
      </div>
      <p className="report-summary">
        {detection.llm_report || 'No detailed report available.'}
      </p>
      {/* Future: Add Incident Management buttons here (View Details, Change Status) */}
    </div>
  </div>
);

export default IncidentHistory;