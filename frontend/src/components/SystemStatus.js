import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Database, Zap, Cpu, AlertTriangle, CheckCircle, Loader } from 'react-feather';
import { Tooltip } from 'react-tooltip';
import apiService from '../services/api.service';
import '../styles/SystemStatus.css'; // Will create this next

const serviceMap = {
    database: { icon: Database, color: 'var(--accent-blue)' },
    yolo_service: { icon: Zap, color: 'var(--threat-high)' },
    ollama_service: { icon: Cpu, color: 'var(--accent-gold)' },
};

const getStatusIcon = (status) => {
    switch (status) {
        case 'online':
            return <CheckCircle size={18} color="var(--accent-green)" />;
        case 'offline':
            return <AlertTriangle size={18} color="var(--threat-critical)" />;
        default:
            return <Loader size={18} color="var(--text-secondary)" className="spin" />;
    }
};

const SystemStatus = () => {
    const [health, setHealth] = useState({});
    const [loading, setLoading] = useState(true);

    const fetchHealth = async () => {
        setLoading(true);
        const data = await apiService.getSystemHealth();
        setHealth(data);
        setLoading(false);
    };

    useEffect(() => {
        fetchHealth();
        const interval = setInterval(fetchHealth, 10000); // Poll every 10 seconds
        return () => clearInterval(interval);
    }, []);

    return (
        <>
            <motion.div 
                className="system-status-container"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
            >
                {Object.entries(serviceMap).map(([key, { icon: Icon, color }]) => (
                    <motion.div 
                        key={key} 
                        className="status-item"
                        data-tooltip-id="status-tooltip"
                        data-tooltip-content={\`${key.toUpperCase().replace('_', ' ')} is \${health[key] || 'checking...'}\`}
                    >
                        <Icon size={20} color={color} />
                        <span style={{ color: health[key] === 'online' ? 'var(--accent-green)' : health[key] === 'offline' ? 'var(--threat-critical)' : 'var(--text-secondary)' }}>
                            {key.toUpperCase().split('_')[0]}
                        </span>
                        {getStatusIcon(health[key])}
                    </motion.div>
                ))}
            </motion.div>
            <Tooltip id="status-tooltip" effect="solid" />
        </>
    );
};

export default SystemStatus;
