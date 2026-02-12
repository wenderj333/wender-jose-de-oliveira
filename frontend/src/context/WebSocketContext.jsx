import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';

const WebSocketContext = createContext(null);

export function WebSocketProvider({ children }) {
  const { user } = useAuth();
  const wsRef = useRef(null);
  const [liveSessions, setLiveSessions] = useState([]);
  const [totalChurchesPraying, setTotalChurchesPraying] = useState(0);
  const [lastEvent, setLastEvent] = useState(null);

  useEffect(() => {
    const apiBase = import.meta.env.VITE_API_URL || '';
    let wsUrl;
    if (apiBase) {
      const url = new URL(apiBase);
      const protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
      wsUrl = `${protocol}//${url.host}/ws`;
    } else {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      wsUrl = `${protocol}//${window.location.host}/ws`;
    }
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      if (user) {
        ws.send(JSON.stringify({ type: 'identify', userId: user.id, churchId: user.churchId }));
      }
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      switch (data.type) {
        case 'live_sessions':
          setLiveSessions(data.sessions);
          setTotalChurchesPraying(data.totalChurchesPraying);
          break;
        case 'pastor_praying':
          if (data.action === 'started') {
            setLiveSessions((prev) => [...prev, data.session]);
          } else if (data.action === 'stopped') {
            setLiveSessions((prev) => prev.filter((s) => s.id !== data.sessionId));
          }
          setTotalChurchesPraying(data.totalChurchesPraying);
          break;
        case 'new_prayer_response':
        case 'amem':
          setLastEvent(data);
          break;
      }
    };

    ws.onclose = () => {
      // Reconnect after 3s
      setTimeout(() => {
        if (wsRef.current?.readyState === WebSocket.CLOSED) {
          // Component will re-mount or we can trigger reconnect
        }
      }, 3000);
    };

    return () => ws.close();
  }, [user]);

  const send = useCallback((data) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data));
    }
  }, []);

  return (
    <WebSocketContext.Provider value={{ liveSessions, totalChurchesPraying, lastEvent, send }}>
      {children}
    </WebSocketContext.Provider>
  );
}

export const useWebSocket = () => useContext(WebSocketContext);
