import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Clock, Camera, AlertTriangle, Search, X } from 'react-feather';
import apiService from '../services/api.service';

const Incidents = () => {
    const [detections, setDetections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDetection, setSelectedDetection] = useState(null);

    const fetchDetections = async () => {
        setLoading(true);
        const data = await apiService.getDetectionHistory(100);
        setDetections(data);
        setLoading(false);
    };

    useEffect(() => {
        fetchDetections();
    }, []);

    const getThreatColor = (level) => {
        switch (level) {
            case 'CRITICAL': return 'var(--threat-critical)';
            case 'HIGH': return 'var(--threat-high)';
            case 'MEDIUM': return 'var(--threat-medium)';
            case 'LOW': return 'var(--threat-low)';
            default: return 'var(--threat-none)';
        }
    };

    const listItemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: i => ({
            opacity: 1,
            y: 0,
            transition: { delay: i * 0.05, duration: 0.4 }
        }),
    };

    return (
        <>
            <h1><FileText size={30} style={{ marginRight: 10 }} /> Detection History & Analysis</h1>
            
            <div className="card" style={{ padding: '20px' }}>
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '50px' }}><Loader size={30} className="spin" /> Loading historical data...</div>
                ) : (
                    <div style={{ display: 'grid', gap: '15px' }}>
                        <AnimatePresence>
                            {detections.map((d, index) => (
                                <motion.div 
                                    key={d.id} 
                                    className="incident-item card"
                                    variants={listItemVariants}
                                    initial="hidden"
                                    animate="visible"
                                    custom={index}
                                    style={{
                                        borderLeft: `5px solid ${getThreatColor(d.threat_level)}`,
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        cursor: 'pointer'
                                    }}
                                    whileHover={{ scale: 1.01 }}
                                    onClick={() => setSelectedDetection(d)}
                                >
                                    <div>
                                        <div style={{ fontWeight: 'bold', fontSize: '1.1rem', color: getThreatColor(d.threat_level) }}>
                                            <AlertTriangle size={16} style={{ marginRight: 8 }} />
                                            {d.threat_level} Alert - {d.camera_id}
                                        </div>
                                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '5px' }}>
                                            {d.llm_report.substring(0, 80)}...
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                                        <Clock size={12} style={{ marginRight: 5 }} /> 
                                        {new Date(d.timestamp).toLocaleString()}
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>

            {/* Modal for Detailed View */}
            <AnimatePresence>
                {selectedDetection && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="modal-backdrop"
                        onClick={() => setSelectedDetection(null)}
                    >
                        <motion.div
                            className="modal-content"
                            initial={{ y: -50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 50, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
                        >
                            <button className="modal-close-btn" onClick={() => setSelectedDetection(null)}><X size={24} /></button>
                            
                            <h2 style={{ color: getThreatColor(selectedDetection.threat_level) }}>{selectedDetection.threat_level} Incident Report</h2>
                            
                            <div style={{ display: 'flex', gap: '20px', marginTop: '20px' }}>
                                <div style={{ flex: 1 }}>
                                    <img 
                                        src={selectedDetection.image_url} 
                                        alt="Captured Frame" 
                                        style={{ width: '100%', borderRadius: '8px', border: \`1px solid \${getThreatColor(selectedDetection.threat_level)}\` }} 
                                    />
                                    <p style={{ margin: '10px 0 0', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                                        <Camera size={14} style={{ marginRight: 5 }} /> Camera ID: <strong>{selectedDetection.camera_id}</strong>
                                    </p>
                                </div>
                                
                                <div style={{ flex: 2 }}>
                                    <h3>LLM Analysis & Deduction</h3>
                                    <div className="card" style={{ backgroundColor: 'var(--bg-light)', padding: '15px' }}>
                                        <p style={{ fontWeight: 'bold', color: 'var(--accent-gold)' }}>Summary:</p>
                                        <p>{selectedDetection.llm_report}</p>
                                        
                                        <p style={{ fontWeight: 'bold', color: 'var(--accent-blue)', marginTop: '15px' }}>Raw YOLO Alerts:</p>
                                        <ul style={{ paddingLeft: '20px', margin: 0 }}>
                                            {JSON.parse(selectedDetection.yolo_alerts).map((alert, i) => (
                                                <li key={i} style={{ fontSize: '0.9rem' }}>{alert}</li>
                                            ))}
                                        </ul>
                                    </div>
                                    <p style={{ marginTop: '20px', fontSize: '0.85rem' }}>
                                        <Clock size={14} style={{ marginRight: 5 }} /> Timestamp: {new Date(selectedDetection.timestamp).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Modal Styles (Append to global CSS or define here) */}
            <style jsx global>{`
                .modal-backdrop {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.8);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    z-index: 1000;
                }
                .modal-content {
                    background: var(--bg-card);
                    padding: 30px;
                    border-radius: 12px;
                    width: 80%;
                    max-width: 1200px;
                    max-height: 90vh;
                    overflow-y: auto;
                    position: relative;
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.9);
                    border: 1px solid var(--bg-surface);
                }
                .modal-close-btn {
                    position: absolute;
                    top: 15px;
                    right: 15px;
                    background: none;
                    border: none;
                    color: var(--text-secondary);
                    cursor: pointer;
                }
                .modal-close-btn:hover {
                    color: var(--accent-red);
                }
            `}</style>
        </>
    );
};

export default Incidents;
