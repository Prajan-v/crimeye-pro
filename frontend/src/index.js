import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css'; // Import global styles FIRST
import App from './App'; // Import the main App component

// Ensure the root element exists in your public/index.html
const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Failed to find the root element');

// Create the React root
const root = ReactDOM.createRoot(rootElement);

// Render the application
root.render(
  // StrictMode can cause useEffects to run twice in DEVELOPMENT
  // Comment it out if you see double webcam initializations or API calls
  // <React.StrictMode>
    <App />
  // </React.StrictMode>
);
