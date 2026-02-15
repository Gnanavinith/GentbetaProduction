// WebSocket Service for Real-time Notifications
class WebSocketService {
  constructor() {
    this.socket = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
    this.listeners = new Map();
    this.isConnecting = false;
    this.messageQueue = [];
    
    // WebSocket configuration
    this.config = {
      url: import.meta.env.VITE_WS_URL || 'ws://localhost:5000',
      protocols: [],
      reconnect: true,
      heartbeat: true,
      heartbeatInterval: 30000, // 30 seconds
      maxMessageSize: 1024 * 1024 // 1MB
    };
  }

  // Connect to WebSocket server
  connect(token = null) {
    if (this.isConnecting || (this.socket && this.socket.readyState === WebSocket.OPEN)) {
      return;
    }

    this.isConnecting = true;
    
    try {
      const url = token 
        ? `${this.config.url}?token=${token}`
        : this.config.url;
      
      this.socket = new WebSocket(url, this.config.protocols);
      
      this.setupEventHandlers();
    } catch (error) {
      console.error('WebSocket connection error:', error);
      this.handleReconnect();
    }
  }

  // Setup WebSocket event handlers
  setupEventHandlers() {
    this.socket.onopen = (event) => {
      console.log('✅ WebSocket connected');
      this.isConnecting = false;
      this.reconnectAttempts = 0;
      
      // Send queued messages
      this.flushMessageQueue();
      
      // Start heartbeat if enabled
      if (this.config.heartbeat) {
        this.startHeartbeat();
      }
      
      this.emit('connected', event);
    };

    this.socket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        this.handleMessage(message);
      } catch (error) {
        console.error('WebSocket message parsing error:', error);
        this.emit('error', { type: 'parse_error', error });
      }
    };

    this.socket.onclose = (event) => {
      console.log('⚠️ WebSocket disconnected:', event.code, event.reason);
      this.isConnecting = false;
      
      this.emit('disconnected', event);
      
      // Handle reconnection
      if (this.config.reconnect && 
          !event.wasClean && 
          this.reconnectAttempts < this.maxReconnectAttempts) {
        this.handleReconnect();
      }
    };

    this.socket.onerror = (error) => {
      console.error('WebSocket error:', error);
      this.emit('error', error);
    };
  }

  // Handle incoming messages
  handleMessage(message) {
    const { type, data, id } = message;
    
    // Handle different message types
    switch (type) {
      case 'notification':
        this.emit('notification', data);
        break;
      
      case 'form_update':
        this.emit('form_update', data);
        break;
      
      case 'submission_update':
        this.emit('submission_update', data);
        break;
      
      case 'assignment_update':
        this.emit('assignment_update', data);
        break;
      
      case 'approval_update':
        this.emit('approval_update', data);
        break;
      
      case 'heartbeat':
        // Heartbeat response - do nothing
        break;
        
      default:
        this.emit('message', message);
    }
    
    // Emit to specific listeners
    if (id) {
      this.emit(`message:${id}`, message);
    }
  }

  // Send message through WebSocket
  send(message) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      // Validate message size
      const messageString = JSON.stringify(message);
      if (messageString.length > this.config.maxMessageSize) {
        console.error('Message too large');
        this.emit('error', { type: 'message_too_large' });
        return false;
      }
      
      this.socket.send(messageString);
      return true;
    } else {
      // Queue message for when connection is established
      this.messageQueue.push(message);
      this.connect(); // Attempt to reconnect
      return false;
    }
  }

  // Flush message queue
  flushMessageQueue() {
    while (this.messageQueue.length > 0 && 
           this.socket && 
           this.socket.readyState === WebSocket.OPEN) {
      const message = this.messageQueue.shift();
      this.send(message);
    }
  }

  // Start heartbeat mechanism
  startHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }
    
    this.heartbeatInterval = setInterval(() => {
      if (this.socket && this.socket.readyState === WebSocket.OPEN) {
        this.send({
          type: 'heartbeat',
          timestamp: Date.now()
        });
      }
    }, this.config.heartbeatInterval);
  }

  // Stop heartbeat
  stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  // Handle reconnection
  handleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      this.emit('max_reconnect_attempts');
      return;
    }
    
    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
    
    console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`);
    
    setTimeout(() => {
      const token = localStorage.getItem('token');
      this.connect(token);
    }, delay);
  }

  // Add event listener
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  // Remove event listener
  off(event, callback) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  // Emit event to listeners
  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in ${event} listener:`, error);
        }
      });
    }
  }

  // Subscribe to specific events
  subscribe(eventType, callback) {
    const subscriptionId = `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const handler = (data) => {
      if (data.type === eventType) {
        callback(data.data);
      }
    };
    
    this.on('message', handler);
    
    return {
      unsubscribe: () => {
        this.off('message', handler);
      },
      id: subscriptionId
    };
  }

  // Send notification
  sendNotification(notification) {
    return this.send({
      type: 'notification',
      data: notification,
      timestamp: Date.now()
    });
  }

  // Join a room/channel
  joinRoom(roomId) {
    return this.send({
      type: 'join_room',
      room: roomId,
      timestamp: Date.now()
    });
  }

  // Leave a room/channel
  leaveRoom(roomId) {
    return this.send({
      type: 'leave_room',
      room: roomId,
      timestamp: Date.now()
    });
  }

  // Check connection status
  getStatus() {
    if (!this.socket) {
      return 'disconnected';
    }
    
    switch (this.socket.readyState) {
      case WebSocket.CONNECTING:
        return 'connecting';
      case WebSocket.OPEN:
        return 'connected';
      case WebSocket.CLOSING:
        return 'closing';
      case WebSocket.CLOSED:
        return 'disconnected';
      default:
        return 'unknown';
    }
  }

  // Close connection
  disconnect() {
    this.stopHeartbeat();
    
    if (this.socket) {
      this.socket.close(1000, 'Client disconnect');
      this.socket = null;
    }
    
    this.reconnectAttempts = 0;
    this.messageQueue = [];
  }

  // Get connection statistics
  getStats() {
    return {
      status: this.getStatus(),
      reconnectAttempts: this.reconnectAttempts,
      queuedMessages: this.messageQueue.length,
      listeners: this.listeners.size
    };
  }
}

// Create singleton instance
const webSocketService = new WebSocketService();

// Export for use in components
export default webSocketService;

// Convenience hooks for React components
export const useWebSocket = () => {
  return webSocketService;
};

// Notification hook
export const useNotifications = (callback) => {
  const ws = useWebSocket();
  
  // Subscribe to notifications
  ws.on('notification', callback);
  
  // Cleanup on unmount
  return () => {
    ws.off('notification', callback);
  };
};