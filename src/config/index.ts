export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';
export const WEBSOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5001';
console.log('[Config] API Base URL set to: ${API_BASE_URL}');
console.log('[Config] WebSocket URL set to: ${WEBSOCKET_URL}');
