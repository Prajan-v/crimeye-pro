import React, { useState } from 'react';
import API from '../api';
import { Camera, AlertTriangle, CheckCircle } from 'lucide-react';

export default function DetectionTest() {
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);

    const testDetection = async (scenario) => {
        setLoading(true);
        setResult(null);

        const testData = {
            camera_id: 'CAM-001',
            scene_context: {
                time_of_day: scenario === 'night' ? 'night' : 'day',
                crowd_density: 'low',
                weather: 'clear'
            },
            detections: scenario === 'weapon' ? [
                { class: 'person', confidence: 0.94, bbox: [100, 150, 80, 200] },
                { class: 'weapon', confidence: 0.87, bbox: [120, 180, 30, 40] }
            ] : scenario === 'night' ? [
                { class: 'person', confidence: 0.91, bbox: [100, 150, 80, 200] },
                { class: 'backpack', confidence: 0.85, bbox: [110, 170, 40, 60] }
            ] : [
                { class: 'person', confidence: 0.88, bbox: [100, 150, 80, 200] }
            ],
            frame_base64: null
        };

        try {
            const response = await API.post('/detections/analyze', testData);
            setResult(response.data);
        } catch (error) {
            setResult({ error: error.message });
        }
        setLoading(false);
    };

    return (
        <div className="card">
            <h2><Camera size={24} /> Detection Test (LLM Analysis)</h2>
            
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                <button 
                    onClick={() => testDetection('normal')} 
                    disabled={loading}
                    style={{ flex: 1, padding: '12px', background: '#4caf50', border: 'none', borderRadius: '5px', color: '#fff', cursor: 'pointer' }}
                >
                    Test Normal Detection
                </button>
                <button 
                    onClick={() => testDetection('night')} 
                    disabled={loading}
                    style={{ flex: 1, padding: '12px', background: '#ff9800', border: 'none', borderRadius: '5px', color: '#fff', cursor: 'pointer' }}
                >
                    Test Suspicious (Night)
                </button>
                <button 
                    onClick={() => testDetection('weapon')} 
                    disabled={loading}
                    style={{ flex: 1, padding: '12px', background: '#d32f2f', border: 'none', borderRadius: '5px', color: '#fff', cursor: 'pointer' }}
                >
                    Test Weapon Detection
                </button>
            </div>

            {loading && (
                <div style={{ textAlign: 'center', padding: '20px' }}>
                    <p>🤖 LLM is analyzing detection...</p>
                </div>
            )}

            {result && !result.error && (
                <div style={{ background: '#1a1a1a', padding: '20px', borderRadius: '8px', border: `2px solid ${
                    result.analysis.threat_level === 'CRITICAL' ? '#d32f2f' :
                    result.analysis.threat_level === 'HIGH' ? '#ff5722' :
                    result.analysis.threat_level === 'MEDIUM' ? '#ff9800' :
                    '#4caf50'
                }` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                        {result.analysis.alert_security ? (
                            <AlertTriangle size={32} color="#ff5722" />
                        ) : (
                            <CheckCircle size={32} color="#4caf50" />
                        )}
                        <div>
                            <h3 style={{ color: '#d4af37', margin: 0 }}>
                                Threat Level: {result.analysis.threat_level}
                            </h3>
                            <p style={{ margin: '5px 0 0 0', color: '#999' }}>
                                Confidence: {(result.analysis.confidence * 100).toFixed(1)}%
                            </p>
                        </div>
                    </div>

                    <div style={{ marginBottom: '15px' }}>
                        <strong style={{ color: '#d4af37' }}>Description:</strong>
                        <p style={{ margin: '5px 0', lineHeight: '1.6' }}>{result.analysis.description}</p>
                    </div>

                    <div style={{ marginBottom: '15px' }}>
                        <strong style={{ color: '#d4af37' }}>LLM Reasoning:</strong>
                        <p style={{ margin: '5px 0', lineHeight: '1.6', color: '#ccc' }}>{result.analysis.reasoning}</p>
                    </div>

                    {result.analysis.recommended_actions && result.analysis.recommended_actions.length > 0 && (
                        <div style={{ marginBottom: '15px' }}>
                            <strong style={{ color: '#d4af37' }}>Recommended Actions:</strong>
                            <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
                                {result.analysis.recommended_actions.map((action, idx) => (
                                    <li key={idx} style={{ marginBottom: '5px' }}>{action}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {result.incident_created && (
                        <div style={{ background: '#d32f2f', padding: '10px', borderRadius: '5px', marginTop: '15px' }}>
                            <strong>🚨 INCIDENT CREATED</strong>
                            <p style={{ margin: '5px 0 0 0' }}>Incident ID: {result.incident_id}</p>
                        </div>
                    )}
                </div>
            )}

            {result && result.error && (
                <div style={{ background: '#d32f2f', padding: '15px', borderRadius: '5px' }}>
                    <strong>Error:</strong> {result.error}
                    <p style={{ margin: '10px 0 0 0', fontSize: '14px' }}>
                        Make sure LM Studio is running on port 1234
                    </p>
                </div>
            )}
        </div>
    );
}
