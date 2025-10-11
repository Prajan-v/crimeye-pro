import React, { useState } from 'react';
import API from '../api';

export default function Login({ onLogin }) {
    const [email, setEmail] = useState('admin@crimeye.com');
    const [password, setPassword] = useState('admin123');
    const [error, setError] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await API.post('/users/login', { email, password });
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
            onLogin(response.data.user);
        } catch (err) {
            setError('Login failed: ' + (err.response?.data?.error || 'Unknown error'));
        }
    };

    return (
        <div className="login-container">
            <div className="login-box">
                <h1 style={{ color: '#d4af37' }}>CrimeEye-Pro</h1>
                <h2>Login to Dashboard</h2>
                {error && <p className="error">{error}</p>}
                <form onSubmit={handleLogin}>
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <button type="submit">Login</button>
                </form>
                <p style={{ marginTop: '20px', textAlign: 'center', color: '#999', fontSize: '12px' }}>
                    Demo: admin@crimeye.com / admin123
                </p>
            </div>
        </div>
    );
}
