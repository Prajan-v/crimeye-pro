import React, { useEffect, useState } from 'react';
import API from '../api';
import { Image, X, Download } from 'lucide-react';

export default function PhotoGallery() {
    const [frames, setFrames] = useState([]);
    const [selectedFrame, setSelectedFrame] = useState(null);

    useEffect(() => {
        fetchFrames();
    }, []);

    const fetchFrames = async () => {
        try {
            const response = await API.get('/frames');
            setFrames(response.data);
        } catch (error) {
            console.error('Error fetching frames:', error);
        }
    };

    const getFrameUrl = (frameId) => {
        return `${process.env.REACT_APP_API_URL}/frames/${frameId}/image?token=${localStorage.getItem('token')}`;
    };

    return (
        <div className="card" style={{ gridColumn: '1 / -1' }}>
            <h2><Image size={24} /> Captured Frames Gallery ({frames.length})</h2>
            
            <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', 
                gap: '15px',
                marginTop: '20px'
            }}>
                {frames.map((frame) => (
                    <div 
                        key={frame.id}
                        style={{ 
                            background: '#2a2a2a', 
                            borderRadius: '8px', 
                            overflow: 'hidden',
                            cursor: 'pointer',
                            border: '2px solid #444',
                            transition: 'border-color 0.3s'
                        }}
                        onClick={() => setSelectedFrame(frame)}
                        onMouseEnter={(e) => e.currentTarget.style.borderColor = '#d4af37'}
                        onMouseLeave={(e) => e.currentTarget.style.borderColor = '#444'}
                    >
                        <img 
                            src={getFrameUrl(frame.id)} 
                            alt={`Frame ${frame.id}`}
                            style={{ width: '100%', height: '150px', objectFit: 'cover' }}
                        />
                        <div style={{ padding: '10px' }}>
                            <p style={{ margin: 0, fontSize: '12px', color: '#d4af37' }}>
                                {frame.camera_id}
                            </p>
                            <p style={{ margin: '5px 0 0 0', fontSize: '11px', color: '#999' }}>
                                {new Date(frame.captured_at).toLocaleString()}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            {selectedFrame && (
                <div 
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0,0,0,0.9)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000
                    }}
                    onClick={() => setSelectedFrame(null)}
                >
                    <div style={{ position: 'relative', maxWidth: '90%', maxHeight: '90%' }}>
                        <button
                            style={{
                                position: 'absolute',
                                top: '10px',
                                right: '10px',
                                background: '#d32f2f',
                                border: 'none',
                                borderRadius: '50%',
                                width: '40px',
                                height: '40px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                            onClick={(e) => {
                                e.stopPropagation();
                                setSelectedFrame(null);
                            }}
                        >
                            <X size={24} color="#fff" />
                        </button>
                        <img 
                            src={getFrameUrl(selectedFrame.id)} 
                            alt="Full size"
                            style={{ maxWidth: '100%', maxHeight: '90vh', borderRadius: '8px' }}
                            onClick={(e) => e.stopPropagation()}
                        />
                        <div style={{
                            position: 'absolute',
                            bottom: '20px',
                            left: '20px',
                            background: 'rgba(0,0,0,0.8)',
                            padding: '15px',
                            borderRadius: '8px'
                        }}>
                            <p style={{ margin: 0, color: '#d4af37' }}>{selectedFrame.camera_id}</p>
                            <p style={{ margin: '5px 0 0 0', fontSize: '14px', color: '#999' }}>
                                {new Date(selectedFrame.captured_at).toLocaleString()}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
