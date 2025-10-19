import { io } from 'socket.io-client';

// Use environment variable or default
const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5001';

class SocketService {
  socket;

  connect() {
    // Prevent multiple connections
    if (this.socket && this.socket.connected) {
      // console.log('Socket.IO already connected.');
      return;
    }
    // Disconnect if socket exists but isn't connected properly
    if (this.socket) {
        this.socket.disconnect();
    }

    console.log(`Attempting Socket.IO connection to ${SOCKET_URL}...`);
    this.socket = io(SOCKET_URL, {
      reconnectionAttempts: 5,
      timeout: 10000,
      // transports: ['websocket'], // Optionally force websocket
    });

    this.socket.on('connect', () => {
      console.log(`✅ Socket.IO connected: ${this.socket.id}`);
    });

    this.socket.on('disconnect', (reason) => {
      console.warn(`🔌 Socket.IO disconnected: ${reason}`);
      // Handle potential need to reconnect manually or notify user
      if (reason === 'io server disconnect') {
        // The server intentionally disconnected the socket
        // Consider attempting reconnection after a delay
        // setTimeout(() => this.connect(), 5000);
      }
      // else the socket will automatically try to reconnect based on defaults
    });

    this.socket.on('connect_error', (err) => {
      console.error(`🚨 Socket.IO connection error: ${err.message}`);
    });
  }

  disconnect() {
    if (this.socket) {
      console.log('🔌 Disconnecting Socket.IO...');
      this.socket.disconnect();
      this.socket = null; // Clean up the instance
    }
  }

  // Generic listener function
  on(eventName, callback) {
     if (!this.socket) this.connect(); // Ensure connection exists
     console.log(`👂 Adding listener for WebSocket event: ${eventName}`);
     this.socket.off(eventName); // Remove existing listener first to prevent duplicates
     this.socket.on(eventName, callback);
  }

  // Specific listener for new detections
  onNewDetection(callback) {
    this.on('new_detection', (detection) => {
      // console.log('Received new_detection via WebSocket:', detection);
      callback(detection);
    });
  }

  // Generic function to remove listener
  off(eventName) {
    if (this.socket) {
      console.log(`👂 Removing listener for WebSocket event: ${eventName}`);
      this.socket.off(eventName);
    }
  }
}
// Export a singleton instance
export default new SocketService();
