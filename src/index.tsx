import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { store } from './app/store';
import App from './app/App';
import { GlobalStyles } from './common/styles/GlobalStyles';
import { ThemeProvider } from 'styled-components';
import { theme } from './common/styles/theme';
import { Tooltip } from 'react-tooltip';
import 'react-tooltip/dist/react-tooltip.css';
import './styled.d.ts'; // Import the type definition file

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Failed to find the root element');
const root = ReactDOM.createRoot(rootElement);
root.render(
// <React.StrictMode> // Disabled for dev
<Provider store={store}>
<ThemeProvider theme={theme}>
<GlobalStyles />
<App />
<Tooltip id="global-tooltip" style={{ zIndex: 9999 }} />
</ThemeProvider>
</Provider>
// </React.StrictMode>
);
