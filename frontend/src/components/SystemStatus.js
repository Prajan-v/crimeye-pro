import React, { useState, useEffect } from 'react';
import apiService from '../services/api.service';
import { motion } from 'framer-motion';
import { Tooltip } from 'react-tooltip'; // Assuming react-tooltip is installed or use title attribute
import 'react-tooltip/dist/react-tooltip.css'; // Import tooltip styles if needed

const StatusDot = ({ status, serviceName }) => {
  const isOnline = status === 'online';
  const color = isOnline ? 'var(--accent-green)' : 'var(--accent-red)';
  const tooltipId = `tooltip-${serviceName}`;

  return (
    <>
      <motion.div
        data-tooltip-id={tooltipId}
        data-tooltip-content={isOnline ? `${serviceName}: Online` : `${serviceName}: Offline/Error`}
        style={{
          width: 10, height: 10, borderRadius: '50%',
          marginRight: 8,
          backgroundColor: color,
        }}
        animate={isOnline ? {
          scale: [1, 1.2, 1],
          opacity: [0.7, 1, 0.7],
        } : { scale: 1, opacity: 0.6 }} // Dim offline dots
        transition={isOnline ? {
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut"
        } : { duration: 0 }}
      />
      <Tooltip id={tooltipId} place="bottom" effect="solid" style={{ fontSize: '0.8rem', padding: '4px 8px', backgroundColor: '#333' }}/>
    </>
  );
};

function SystemStatus() {
  const [health, setHealth] = useState({
    database: 'offline', yolo_service: 'offline', ollama_service: 'offline'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const checkHealth = async () => {
      if (!isMounted) return;
      setLoading(true); // Indicate loading on each poll
      try {
        const res = await apiService.getSystemHealth();
        if (isMounted) setHealth(res.data);
      } catch (e) {
        console.warn("Health check failed:", e.message);
        // Keep previous state or reset if preferred
        if (isMounted) setHealth({ database: 'offline', yolo_service: 'offline', ollama_service: 'offline' });
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    checkHealth(); // Initial check
    const interval = setInterval(checkHealth, 7000); // Poll every 7 seconds

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const statusStyle = {
    display: 'flex',
    alignItems: 'center',
    opacity: loading ? 0.5 : 1, // Dim while loading next status
    transition: 'opacity 0.3s ease',
  };

  return (
    <div style={{ display: 'flex', gap: 20, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
      <div style={statusStyle} title={`Database: ${health.database}`}>
        <StatusDot status={health.database} serviceName="Database" /> DB
      </div>
      <div style={statusStyle} title={`YOLO Service: ${health.yolo_service}`}>
        <StatusDot status={health.yolo_service} serviceName="YOLO" /> YOLO
      </div>
      <div style={statusStyle} title={`LLM Analyst: ${health.ollama_service}`}>
        <StatusDot status={health.ollama_service} serviceName="LLM" /> LLM
      </div>
    </div>
  );
}
// Install react-tooltip if you use it: npm install react-tooltip
export default SystemStatus;
