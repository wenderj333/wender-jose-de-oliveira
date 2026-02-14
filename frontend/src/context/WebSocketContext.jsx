import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { playNotificationSound } from '../utils/notification-sound';

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
        case 'new_help_request':
        case 'help_request_update':
        case 'chat_new_message':
        case 'chat_user_joined':
        case 'chat_user_left':
        case 'chat_typing':
          setLastEvent(data);
          // Play notification sound for messages and important events
          if (['chat_new_message', 'new_help_request', 'new_prayer_response'].includes(data.type)) {
            playNotificationSound();
          }
          break;
      }
    };

    ws.onclose = () => {
      console.log('WebSocket desconectado, reconectando em 3s...');
      setTimeout(() => {
        setLiveSessions([]);
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
