import { useEffect, useRef, useCallback, useState } from 'react';

const useWebSocket = (url, onMessage) => {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);
  const ws = useRef(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;
  const reconnectInterval = 3000; // 3 seconds

  const connect = useCallback(() => {
    if (ws.current) {
      ws.current.close();
    }

    const socket = new WebSocket(url);
    
    socket.onopen = () => {
      console.log('WebSocket connected');
      setIsConnected(true);
      reconnectAttempts.current = 0;
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        onMessage(data);
      } catch (err) {
        console.error('Error parsing WebSocket message:', err);
      }
    };

    socket.onclose = () => {
      setIsConnected(false);
      
      if (reconnectAttempts.current < maxReconnectAttempts) {
        reconnectAttempts.current += 1;
        console.log(`WebSocket connection closed. Reconnecting attempt ${reconnectAttempts.current}/${maxReconnectAttempts}...`);
        setTimeout(connect, reconnectInterval);
      } else {
        console.error('Max reconnection attempts reached');
        setError(new Error('Unable to connect to the server'));
      }
    };

    socket.onerror = (error) => {
      console.error('WebSocket error:', error);
      setError(error);
    };

    ws.current = socket;
  }, [url, onMessage]);

  useEffect(() => {
    if (url) {
      connect();
    }

    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [url, connect]);

  const sendMessage = useCallback((message) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(message));
      return true;
    }
    return false;
  }, []);

  return { isConnected, error, sendMessage };
};

export default useWebSocket;
