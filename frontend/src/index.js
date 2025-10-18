import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css'; // Import global styles FIRST
import App from './App'; // Import the main App component

// Create the React root element
const root = ReactDOM.createRoot(document.getElementById('root'));

// Render the application
root.render(
  // StrictMode can cause useEffects to run twice in DEVELOPMENT
  // Comment it out if you see double webcam initializations or API calls
  // <React.StrictMode>
    <App />
  // </React.StrictMode>
);
