export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';
export const WEBSOCKET_URL = process.env.REACT_APP_WS_URL || 'ws://localhost:8000/ws';
export const FASTAPI_URL = process.env.REACT_APP_FASTAPI_URL || 'http://localhost:8000';
console.log(`[Config] API Base URL set to: ${API_BASE_URL}`);
console.log(`[Config] WebSocket URL set to: ${WEBSOCKET_URL}`);
console.log(`[Config] FastAPI URL set to: ${FASTAPI_URL}`);
