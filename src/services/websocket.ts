import { useState, useEffect, useCallback, useRef } from 'react';

// Connection status enum
export enum ConnectionStatus {
  DISCONNECTED = 'disconnected',
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  ERROR = 'error',
}

// Reconnection settings
const RECONNECT_INTERVAL = 5000; // ms

// Base WebSocket URL - can be overridden with environment variable
const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8000/ws';

export function useWebSocket() {
  const [status, setStatus] = useState<ConnectionStatus>(ConnectionStatus.DISCONNECTED);
  const [error, setError] = useState<string | null>(null);
  
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);
  
  // Clear any reconnection attempts
  const clearReconnectTimeout = useCallback(() => {
    if (reconnectTimeoutRef.current !== null) {
      window.clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
  }, []);
  
  // Attempt to reconnect
  const attemptReconnect = useCallback(() => {
    console.log(`Attempting to reconnect in ${RECONNECT_INTERVAL/1000} seconds...`);
    
    clearReconnectTimeout();
    
    reconnectTimeoutRef.current = window.setTimeout(() => {
      connect();
    }, RECONNECT_INTERVAL);
  }, []);

  // Handle incoming messages
  const handleMessage = useCallback((data: any) => {
    try {
      // You can add custom message handling here
      console.log('Received message:', data);
      
      // Dispatch to any subscribers/handlers
      // This is a placeholder for where you'd add your message routing
    } catch (err) {
      console.error('Error processing message:', err);
    }
  }, []);

  // Connect to the WebSocket server
  const connect = useCallback(() => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    setStatus(ConnectionStatus.CONNECTING);
    setError(null);

    try {
      const ws = new WebSocket(WS_URL);
      
      ws.onopen = () => {
        setStatus(ConnectionStatus.CONNECTED);
        console.log('WebSocket connected');
      };

      ws.onclose = (event) => {
        setStatus(ConnectionStatus.DISCONNECTED);
        socketRef.current = null;
        
        // Only try to reconnect if we didn't close it intentionally
        if (!event.wasClean) {
          attemptReconnect();
        }
      };

      ws.onerror = (event) => {
        setStatus(ConnectionStatus.ERROR);
        setError('WebSocket connection error');
        console.error('WebSocket error:', event);
      };

      ws.onmessage = (event) => {
        handleMessage(event.data);
      };

      socketRef.current = ws;
    } catch (err) {
      setStatus(ConnectionStatus.ERROR);
      setError(`Connection error: ${err instanceof Error ? err.message : String(err)}`);
      attemptReconnect();
    }
  }, [attemptReconnect, handleMessage]);

  // Disconnect from the WebSocket server
  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }
    
    setStatus(ConnectionStatus.DISCONNECTED);
    clearReconnectTimeout();
  }, [clearReconnectTimeout]);

  // Send a message through the WebSocket
  const sendMessage = useCallback((message: any) => {
    if (socketRef.current?.readyState !== WebSocket.OPEN) {
      console.warn('Attempted to send message while disconnected');
      return false;
    }

    try {
      socketRef.current.send(typeof message === 'string' ? message : JSON.stringify(message));
      return true;
    } catch (err) {
      console.error('Error sending message:', err);
      return false;
    }
  }, []);

  // Send a video frame
  const sendFrame = useCallback((frame: ImageData | Blob) => {
    if (socketRef.current?.readyState !== WebSocket.OPEN) {
      return false;
    }

    try {
      if (frame instanceof Blob) {
        socketRef.current.send(frame);
      } else {
        // Convert ImageData to Blob if needed
        const canvas = document.createElement('canvas');
        canvas.width = frame.width;
        canvas.height = frame.height;
        const ctx = canvas.getContext('2d');
        
        if (ctx) {
          ctx.putImageData(frame, 0, 0);
          canvas.toBlob((blob) => {
            if (blob && socketRef.current?.readyState === WebSocket.OPEN) {
              socketRef.current.send(blob);
            }
          }, 'image/jpeg', 0.8);
        }
      }
      return true;
    } catch (err) {
      console.error('Error sending frame:', err);
      return false;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  // Check if currently connected
  const isConnected = useCallback(() => {
    return status === ConnectionStatus.CONNECTED;
  }, [status]);

  return {
    status,
    error,
    connect,
    disconnect,
    sendMessage,
    sendFrame,
    isConnected,
  };
}
