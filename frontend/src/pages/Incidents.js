import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import apiService from '../services/api.service';
import styles from '../styles/Incidents.module.css';
import SystemStatus from '../components/SystemStatus'; // Re-use status component
import { AlertCircle } from 'react-feather'; // Icon for errors

// Consistent threat colors
const threatColors = {
  CRITICAL: 'var(--accent-red)',
  HIGH: 'var(--accent-orange)',
  MEDIUM: 'var(--accent-gold)',
  LOW: 'var(--text-secondary)',
  NONE: 'var(--accent-green)',
  UNKNOWN: '#555',
};

// Component for a single incident card in the grid
function IncidentCard({ det, index }) {
  const cardVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { delay: index * 0.04, duration: 0.4, ease: "easeOut" } } // Staggered fade-in
  };
  const isHighThreat = ['CRITICAL', 'HIGH'].includes(det.threat_level);

  return (
    <motion.div
      className={styles.card}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      layout // Enable smooth layout changes for filtering/sorting later
    >
      <img
        src={`http://localhost:5001/${det.image_path}`} // Correct backend port
        alt={`Snapshot for ${det.camera_id} at ${new Date(det.timestamp).toLocaleTimeString()}`}
        className={styles.image}
        onClick={() => window.open(`http://localhost:5001/${det.image_path}`)}
        loading="lazy" // Improve performance for long lists
      />
      <div className={styles.content}>
        <div className={styles.contentHeader}>
          <strong>{det.camera_id}</strong>
          <span
            className="threat-badge"
             style={{
               backgroundColor: threatColors[det.threat_level],
               color: isHighThreat || det.threat_level === 'UNKNOWN' ? '#fff' : '#000'
             }}
          >
            {det.threat_level}
          </span>
        </div>
        <p className={styles.timestamp}>{new Date(det.timestamp).toLocaleString()}</p>
        <p className={styles.report}>{det.llm_report || "No analysis available."}</p>
      </div>
    </motion.div>
  );
}

// Main Incident History Page Component
function Incidents() {
  const [detections, setDetections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const isMountedRef = useRef(true); // Track mount status

  useEffect(() => {
    isMountedRef.current = true;
    setError(null); // Clear previous errors
    setLoading(true);

    apiService.getDetections(50) // Fetch up to 50 incidents for history
      .then(res => {
        if (isMountedRef.current) setDetections(res.data);
      })
      .catch(err => {
        console.error("Failed to fetch incident history:", err);
        if (isMountedRef.current) setError("Failed to load incident history. Please try again later.");
      })
      .finally(() => {
        if (isMountedRef.current) setLoading(false);
      });

    return () => { isMountedRef.current = false }; // Cleanup on unmount
  }, []); // Run only once on mount

  return (
    <div>
      {/* Page Header */}
      <div className={styles.header}>
        <h1>Incident History</h1>
        <SystemStatus />
      </div>

      {/* Loading State */}
      {loading && (
        <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className={styles.loadingText}
        >
            Loading incident history...
        </motion.p>
      )}

      {/* Error State */}
      {error && (
        <motion.p
           initial={{ opacity: 0 }} animate={{ opacity: 1 }}
           className={styles.errorText}
        >
           <AlertCircle size={18} style={{ marginRight: 8 }}/> {error}
        </motion.p>
      )}

      {/* Content Grid (only show if not loading and no error) */}
      {!loading && !error && (
        <div className={styles.grid}>
          {/* Use AnimatePresence to animate items appearing */}
          <AnimatePresence>
            {detections.length === 0 ? (
              <motion.p layout key="no-incidents" className={styles.noIncidentsText} initial={{opacity:0}} animate={{opacity:1}}>
                No incidents found in the database.
              </motion.p>
            ) : (
              detections.map((det, i) => (
                <IncidentCard key={det.id} det={det} index={i} />
              ))
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

export default Incidents;
