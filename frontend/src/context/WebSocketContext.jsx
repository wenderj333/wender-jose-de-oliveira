import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { playNotificationSound } from '../utils/notification-sound';

const WebSocketContext = createContext(null);

export function WebSocketProvider({ children }) {
  const { user } = useAuth();
  const wsRef = useRef(null);
  const reconnectTimer = useRef(null);
  const lastSoundTime = useRef(0);
  const [liveSessions, setLiveSessions] = useState([]);
  const [totalChurchesPraying, setTotalChurchesPraying] = useState(0);
  const [lastEvent, setLastEvent] = useState(null);
  const [liveStreams, setLiveStreams] = useState([]);

  function playSoundThrottled() {
    const now = Date.now();
    // Only play sound once every 30 seconds minimum
    if (now - lastSoundTime.current > 30000) {
      lastSoundTime.current = now;
      playNotificationSound();
    }
  }

  function connect() {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

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

    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('WebSocket conectado');
        if (user) {
          ws.send(JSON.stringify({ type: 'identify', userId: user.id, churchId: user.churchId }));
        }
        ws.send(JSON.stringify({ type: 'live_list' }));
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          switch (data.type) {
            case 'live_sessions':
              setLiveSessions(data.sessions || []);
              setTotalChurchesPraying(data.totalChurchesPraying || 0);
              break;
            case 'pastor_praying':
              if (data.action === 'started') {
                setLiveSessions((prev) => [...prev, data.session]);
              } else if (data.action === 'stopped') {
                setLiveSessions((prev) => prev.filter((s) => s.id !== data.sessionId));
              }
              setTotalChurchesPraying(data.totalChurchesPraying || 0);
              break;
            case 'direct_message':
              setLastEvent(data);
              if (data.senderId !== user?.id) {
                playSoundThrottled();
              }
              break;
            case 'chat_new_message':
            case 'new_help_request':
            case 'new_prayer_response':
              setLastEvent(data);
              playSoundThrottled();
              break;
            case 'amem':
            case 'help_request_update':
            case 'chat_user_joined':
            case 'chat_user_left':
            case 'chat_typing':
            case 'live_streams_list':
              setLiveStreams(data.streams || []);
              setLastEvent(data);
              break;
            case 'live_started':
              setLiveStreams(prev => [...prev.filter(s => s.streamId !== data.streamId), data]);
              // Browser notification
              if (Notification.permission === 'granted' && data.userName) {
                new Notification('🔴 Directo ao Vivo!', { body: `${data.userName} está transmitindo ao vivo!`, icon: data.userAvatar || '/logo.jpg' });
              }
              setLastEvent(data);
              break;
            case 'live_stopped':
              setLiveStreams(prev => prev.filter(s => s.streamId !== data.streamId));
            case 'live_viewer_count':
            case 'live_chat_message':
            case 'live_reaction':
            case 'live_offer':
            case 'live_answer':
            case 'live_ice_candidate':
            case 'live_viewer_left':
            case 'live_error':
              setLastEvent(data);
              break;
          }
        } catch (e) { /* ignore parse errors */ }
      };

      ws.onclose = () => {
        console.log('WebSocket desconectado');
        wsRef.current = null;
        // Reconnect after 30 seconds (not 3!)
        if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
        reconnectTimer.current = setTimeout(connect, 30000);
      };

      ws.onerror = () => {
        ws.close();
      };
    } catch (e) {
      // If WebSocket fails, retry in 60 seconds
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
      reconnectTimer.current = setTimeout(connect, 60000);
    }
  }

  useEffect(() => {
    connect();
    return () => {
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
      if (wsRef.current) wsRef.current.close();
    };
  }, [user]);

  const send = useCallback((data) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data));
    }
  }, []);

  return (
    <WebSocketContext.Provider value={{ liveSessions, totalChurchesPraying, lastEvent, send, liveStreams }}>
      {children}
    </WebSocketContext.Provider>
  );
}

export const useWebSocket = () => useContext(WebSocketContext);
