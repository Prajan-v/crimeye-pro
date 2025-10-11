import React, { useEffect, useState } from 'react';
import API from '../api';
import { AlertCircle, Plus, LogOut } from 'lucide-react';
import LiveCamera from './LiveCamera';

export default function Dashboard({ user, onLogout }) {
    const [incidents, setIncidents] = useState([]);
    const [alerts, setAlerts] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [severity, setSeverity] = useState('medium');

    useEffect(() => {
        fetchIncidents();
        fetchAlerts();
    }, []);

    const fetchIncidents = async () => {
        try {
            const response = await API.get('/incidents');
            setIncidents(response.data);
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const fetchAlerts = async () => {
        try {
            const response = await API.get('/alerts');
            setAlerts(response.data);
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const handleCreateIncident = async (e) => {
        e.preventDefault();
        try {
            await API.post('/incidents', { title, description, severity, location: 'Campus', reported_by: user.id });
            setTitle('');
            setDescription('');
            setShowForm(false);
            fetchIncidents();
        } catch (error) {
            console.error('Error:', error);
        }
    };

    return (
        <div className="dashboard">
         <LiveCamera />
            <header className="header">
                <div>
                    <h1 style={{ color: '#d4af37' }}>CrimeEye-Pro Dashboard</h1>
                    <p style={{ color: '#999' }}>Welcome, {user.username}</p>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={() => setShowForm(!showForm)} className="btn-primary">
                        <Plus size={20} /> New Incident
                    </button>
                    <button onClick={onLogout} className="btn-primary" style={{ backgroundColor: '#d32f2f' }}>
                        <LogOut size={20} /> Logout
                    </button>
                </div>
            </header>

            {showForm && (
                <form onSubmit={handleCreateIncident} className="incident-form">
                    <h3 style={{ color: '#d4af37' }}>Create New Incident</h3>
                    <input type="text" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
                    <textarea placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} required rows="4"></textarea>
                    <select value={severity} onChange={(e) => setSeverity(e.target.value)}>
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                    </select>
                    <button type="submit">Create</button>
                    <button type="button" onClick={() => setShowForm(false)}>Cancel</button>
                </form>
            )}

            <div className="dashboard-grid">
                <div className="card">
                    <h2>Alerts ({alerts.length})</h2>
                    {alerts.slice(0, 5).map((a) => (
                        <div key={a.id} style={{ background: '#2a2a2a', padding: '10px', margin: '10px 0', borderLeft: '3px solid #d4af37' }}>
                            <strong>{a.alert_type}</strong>
                            <p>{a.message}</p>
                        </div>
                    ))}
                </div>
                <div className="card">
                    <h2>Incidents ({incidents.length})</h2>
                    {incidents.slice(0, 5).map((i) => (
                        <div key={i.id} style={{ background: '#2a2a2a', padding: '10px', margin: '10px 0' }}>
                            <strong>{i.title}</strong>
                            <p>{i.severity}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
