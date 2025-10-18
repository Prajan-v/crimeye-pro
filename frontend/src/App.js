import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import LLMDetectionTest from './components/LLMDetectionTest'; // <-- ADD THIS IMPORT

function App() {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
            setUser(JSON.parse(savedUser));
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
    };

    return (
        <div className="App">
            {user ? (
                <>
                    <Dashboard user={user} onLogout={handleLogout} />
                    {/* Add the LLM Deduction Test below the dashboard or wherever you want */}
                    <LLMDetectionTest />
                </>
            ) : (
                <Login onLogin={setUser} />
            )}
        </div>
    );
}

export default App;
