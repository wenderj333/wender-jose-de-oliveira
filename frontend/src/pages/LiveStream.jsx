import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useWebSocket } from '../context/WebSocketContext';
import { Video, VideoOff, Mic, MicOff, Users, Heart, Send, X, Radio } from 'lucide-react';

const ICE_SERVERS = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
];

export default function LiveStream() {
  const { user } = useAuth();
  const { send, lastEvent } = useWebSocket();
  const [streams, setStreams] = useState([]); // active streams list
  const [mode, setMode] = useState('list'); // list | broadcasting | viewing
  const [localStream, setLocalStream] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [viewerCount, setViewerCount] = useState(0);
  const [currentStreamId, setCurrentStreamId] = useState(null);
  const [cameraError, setCameraError] = useState(null);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnections = useRef(new Map()); // viewerId -> RTCPeerConnection (broadcaster)
  const viewerPc = useRef(null); // single PC for viewer

  // Handle WS messages for live streaming
  useEffect(() => {
    if (!lastEvent) return;
    const ev = lastEvent;

    switch (ev.type) {
      case 'live_streams_list':
        setStreams(ev.streams || []);
        break;

      case 'live_started':
        setStreams(prev => {
          if (prev.find(s => s.id === ev.stream.id)) return prev;
          return [...prev, ev.stream];
        });
        break;

      case 'live_stopped':
        setStreams(prev => prev.filter(s => s.id !== ev.streamId));
        if (currentStreamId === ev.streamId && mode === 'viewing') {
          cleanupViewer();
          setMode('list');
          setCurrentStreamId(null);
        }
        break;

      case 'live_viewer_count':
        if (ev.streamId === currentStreamId) {
          setViewerCount(ev.count);
        }
        setStreams(prev => prev.map(s => s.id === ev.streamId ? { ...s, viewers: ev.count } : s));
        break;

      case 'live_chat_message':
        if (ev.streamId === currentStreamId) {
          setChatMessages(prev => [...prev.slice(-100), { name: ev.name, text: ev.text, time: ev.time }]);
        }
        break;

      case 'live_reaction':
        // Could show floating reactions - simple for now
        break;

      // WebRTC signaling - BROADCASTER receives these
      case 'live_offer': {
        if (mode === 'broadcasting') handleViewerOffer(ev);
        break;
      }

      // WebRTC signaling - VIEWER receives these
      case 'live_answer': {
        if (mode === 'viewing' && viewerPc.current) {
          viewerPc.current.setRemoteDescription(new RTCSessionDescription(ev.answer)).catch(console.error);
        }
        break;
      }

      case 'live_ice_candidate': {
        const candidate = new RTCIceCandidate(ev.candidate);
        if (mode === 'broadcasting') {
          const pc = peerConnections.current.get(ev.fromId);
          if (pc) pc.addIceCandidate(candidate).catch(console.error);
        } else if (mode === 'viewing' && viewerPc.current) {
          viewerPc.current.addIceCandidate(candidate).catch(console.error);
        }
        break;
      }

      case 'live_viewer_left': {
        if (mode === 'broadcasting') {
          const pc = peerConnections.current.get(ev.viewerId);
          if (pc) { pc.close(); peerConnections.current.delete(ev.viewerId); }
        }
        break;
      }
    }
  }, [lastEvent]);

  // Broadcaster: handle incoming viewer offer
  async function handleViewerOffer(ev) {
    const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
    peerConnections.current.set(ev.viewerId, pc);

    // Add local tracks
    if (localStream) {
      localStream.getTracks().forEach(track => pc.addTrack(track, localStream));
    }

    pc.onicecandidate = (e) => {
      if (e.candidate) {
        send({ type: 'live_ice_candidate', streamId: currentStreamId, targetId: ev.viewerId, candidate: e.candidate });
      }
    };

    await pc.setRemoteDescription(new RTCSessionDescription(ev.offer));
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);

    send({ type: 'live_answer', streamId: currentStreamId, targetId: ev.viewerId, answer });
  }

  // Start broadcasting
  async function startBroadcast() {
    if (!user) return;
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setLocalStream(stream);
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;

      const streamId = `${user.id}_${Date.now()}`;
      setCurrentStreamId(streamId);
      setMode('broadcasting');
      setChatMessages([]);
      setViewerCount(0);

      send({ type: 'live_start', streamId, broadcasterName: user.full_name || user.username, broadcasterId: user.id });
    } catch (err) {
      console.error('Camera error:', err);
      setCameraError('Não foi possível acessar a câmera. Verifique as permissões.');
    }
  }

  // Stop broadcasting
  function stopBroadcast() {
    if (localStream) {
      localStream.getTracks().forEach(t => t.stop());
      setLocalStream(null);
    }
    peerConnections.current.forEach(pc => pc.close());
    peerConnections.current.clear();
    send({ type: 'live_stop', streamId: currentStreamId });
    setMode('list');
    setCurrentStreamId(null);
    setChatMessages([]);
  }

  // Join a stream as viewer
  async function joinStream(stream) {
    if (!user) return;
    setCurrentStreamId(stream.id);
    setMode('viewing');
    setChatMessages([]);
    setViewerCount(stream.viewers || 0);

    send({ type: 'live_join', streamId: stream.id, viewerName: user.full_name || user.username, viewerId: user.id });

    // Create PeerConnection and send offer to broadcaster
    const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
    viewerPc.current = pc;

    pc.ontrack = (e) => {
      if (remoteVideoRef.current && e.streams[0]) {
        remoteVideoRef.current.srcObject = e.streams[0];
      }
    };

    pc.onicecandidate = (e) => {
      if (e.candidate) {
        send({ type: 'live_ice_candidate', streamId: stream.id, targetId: stream.broadcasterId, candidate: e.candidate });
      }
    };

    // Add transceiver to receive media
    pc.addTransceiver('video', { direction: 'recvonly' });
    pc.addTransceiver('audio', { direction: 'recvonly' });

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    send({ type: 'live_offer', streamId: stream.id, viewerId: user.id, offer });
  }

  function cleanupViewer() {
    if (viewerPc.current) { viewerPc.current.close(); viewerPc.current = null; }
  }

  // Leave stream
  function leaveStream() {
    cleanupViewer();
    send({ type: 'live_leave', streamId: currentStreamId, viewerId: user?.id });
    setMode('list');
    setCurrentStreamId(null);
    setChatMessages([]);
  }

  // Send chat
  function sendChat(e) {
    e.preventDefault();
    if (!chatInput.trim() || !currentStreamId) return;
    send({ type: 'live_chat', streamId: currentStreamId, name: user?.full_name || 'Anónimo', text: chatInput.trim() });
    setChatMessages(prev => [...prev, { name: user?.full_name || 'Eu', text: chatInput.trim(), time: new Date().toISOString() }]);
    setChatInput('');
  }

  // Send reaction
  function sendReaction(emoji) {
    if (!currentStreamId) return;
    send({ type: 'live_reaction', streamId: currentStreamId, emoji, name: user?.full_name });
  }

  // Request streams list on mount
  useEffect(() => {
    send({ type: 'live_list' });
    return () => {
      if (mode === 'broadcasting') stopBroadcast();
      if (mode === 'viewing') leaveStream();
    };
  }, []);

  // Auto-scroll chat
  const chatEndRef = useRef(null);
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [chatMessages]);

  // Attach local video
  useEffect(() => {
    if (localVideoRef.current && localStream) localVideoRef.current.srcObject = localStream;
  }, [localStream, mode]);

  const styles = {
    container: { minHeight: '100vh', background: 'linear-gradient(135deg, #0d0221 0%, #1a0a3e 50%, #2d1b69 100%)', color: '#fff', padding: '1rem', maxWidth: 800, margin: '0 auto' },
    header: { textAlign: 'center', marginBottom: '1.5rem', paddingTop: '1rem' },
    title: { fontSize: '1.8rem', fontWeight: 800, background: 'linear-gradient(135deg, #daa520, #f4c542)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
    subtitle: { color: '#b8a9d4', fontSize: '0.9rem', marginTop: 4 },
    card: { background: 'rgba(255,255,255,0.08)', borderRadius: 16, padding: '1rem', marginBottom: '0.75rem', border: '1px solid rgba(218,165,32,0.2)', cursor: 'pointer', transition: 'transform 0.2s' },
    btn: { padding: '0.7rem 1.5rem', borderRadius: 25, border: 'none', fontWeight: 700, cursor: 'pointer', fontSize: '1rem', display: 'inline-flex', alignItems: 'center', gap: 8 },
    btnPrimary: { background: 'linear-gradient(135deg, #e74c3c, #c0392b)', color: '#fff' },
    btnGold: { background: 'linear-gradient(135deg, #daa520, #f4c542)', color: '#1a0a3e' },
    btnOutline: { background: 'transparent', border: '2px solid #daa520', color: '#daa520' },
    video: { width: '100%', borderRadius: 12, background: '#000', maxHeight: 400 },
    chatBox: { background: 'rgba(0,0,0,0.3)', borderRadius: 12, padding: '0.75rem', height: 200, overflowY: 'auto', marginTop: '0.75rem' },
    chatMsg: { marginBottom: 6, fontSize: '0.85rem' },
    chatName: { fontWeight: 700, color: '#daa520', marginRight: 6 },
    chatForm: { display: 'flex', gap: 8, marginTop: 8 },
    chatInput: { flex: 1, padding: '0.5rem 0.75rem', borderRadius: 20, border: '1px solid rgba(218,165,32,0.3)', background: 'rgba(255,255,255,0.1)', color: '#fff', fontSize: '0.9rem', outline: 'none' },
    badge: { background: 'rgba(231,76,60,0.9)', padding: '2px 10px', borderRadius: 12, fontSize: '0.75rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 4 },
    reactions: { display: 'flex', gap: 8, marginTop: 8, justifyContent: 'center' },
    reactionBtn: { background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 20, padding: '6px 14px', cursor: 'pointer', fontSize: '1.1rem', transition: 'transform 0.15s' },
    empty: { textAlign: 'center', padding: '3rem 1rem', color: '#b8a9d4' },
    viewerBadge: { display: 'inline-flex', alignItems: 'center', gap: 4, color: '#b8a9d4', fontSize: '0.85rem' },
  };

  // LIST VIEW
  if (mode === 'list') {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <div style={styles.title}>🔴 Directo</div>
          <div style={styles.subtitle}>Transmissões ao vivo da comunidade</div>
        </div>

        {user && (
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <button style={{ ...styles.btn, ...styles.btnPrimary }} onClick={startBroadcast}>
              <Radio size={18} /> Iniciar Directo
            </button>
            {cameraError && <p style={{ color: '#e74c3c', fontSize: '0.85rem', marginTop: 8 }}>{cameraError}</p>}
          </div>
        )}

        {streams.length === 0 ? (
          <div style={styles.empty}>
            <div style={{ fontSize: '3rem', marginBottom: 12 }}>📡</div>
            <p style={{ fontWeight: 600, fontSize: '1.1rem', color: '#fff' }}>Nenhuma transmissão ao vivo</p>
            <p>Seja o primeiro a iniciar um directo!</p>
          </div>
        ) : (
          streams.map(s => (
            <div key={s.id} style={styles.card} onClick={() => user && joinStream(s)} onMouseOver={e => e.currentTarget.style.transform = 'scale(1.02)'} onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '1.05rem' }}>{s.broadcasterName}</div>
                  <div style={styles.viewerBadge}><Users size={14} /> {s.viewers || 0} a assistir</div>
                </div>
                <span style={styles.badge}><span style={{ width: 8, height: 8, borderRadius: '50%', background: '#ff0000', display: 'inline-block', animation: 'pulse 1.5s infinite' }} /> AO VIVO</span>
              </div>
            </div>
          ))
        )}

        {!user && (
          <p style={{ textAlign: 'center', color: '#b8a9d4', fontSize: '0.85rem', marginTop: '1rem' }}>
            Faça login para iniciar ou assistir transmissões.
          </p>
        )}

        <style>{`@keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.3; } }`}</style>
      </div>
    );
  }

  // BROADCASTER VIEW
  if (mode === 'broadcasting') {
    return (
      <div style={styles.container}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <span style={styles.badge}><span style={{ width: 8, height: 8, borderRadius: '50%', background: '#ff0000', display: 'inline-block', animation: 'pulse 1.5s infinite' }} /> AO VIVO</span>
          <span style={styles.viewerBadge}><Users size={14} /> {viewerCount}</span>
          <button style={{ ...styles.btn, background: '#e74c3c', color: '#fff', padding: '0.5rem 1rem', fontSize: '0.85rem' }} onClick={stopBroadcast}>
            <X size={16} /> Terminar
          </button>
        </div>

        <video ref={localVideoRef} autoPlay muted playsInline style={styles.video} />

        {/* Chat */}
        <div style={styles.chatBox}>
          {chatMessages.map((m, i) => (
            <div key={i} style={styles.chatMsg}><span style={styles.chatName}>{m.name}:</span>{m.text}</div>
          ))}
          <div ref={chatEndRef} />
        </div>
        <form onSubmit={sendChat} style={styles.chatForm}>
          <input style={styles.chatInput} value={chatInput} onChange={e => setChatInput(e.target.value)} placeholder="Escrever mensagem..." />
          <button type="submit" style={{ ...styles.btn, ...styles.btnGold, padding: '0.5rem 1rem' }}><Send size={16} /></button>
        </form>

        <style>{`@keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.3; } }`}</style>
      </div>
    );
  }

  // VIEWER VIEW
  if (mode === 'viewing') {
    return (
      <div style={styles.container}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <span style={styles.badge}><span style={{ width: 8, height: 8, borderRadius: '50%', background: '#ff0000', display: 'inline-block', animation: 'pulse 1.5s infinite' }} /> AO VIVO</span>
          <span style={styles.viewerBadge}><Users size={14} /> {viewerCount}</span>
          <button style={{ ...styles.btn, ...styles.btnOutline, padding: '0.5rem 1rem', fontSize: '0.85rem' }} onClick={leaveStream}>
            <X size={16} /> Sair
          </button>
        </div>

        <video ref={remoteVideoRef} autoPlay playsInline style={styles.video} />

        {/* Reactions */}
        <div style={styles.reactions}>
          {['🙏', '❤️', '🔥', '👏', '✝️'].map(emoji => (
            <button key={emoji} style={styles.reactionBtn} onClick={() => sendReaction(emoji)}
              onMouseOver={e => e.currentTarget.style.transform = 'scale(1.2)'}
              onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}>{emoji}</button>
          ))}
        </div>

        {/* Chat */}
        <div style={styles.chatBox}>
          {chatMessages.map((m, i) => (
            <div key={i} style={styles.chatMsg}><span style={styles.chatName}>{m.name}:</span>{m.text}</div>
          ))}
          <div ref={chatEndRef} />
        </div>
        <form onSubmit={sendChat} style={styles.chatForm}>
          <input style={styles.chatInput} value={chatInput} onChange={e => setChatInput(e.target.value)} placeholder="Escrever mensagem..." />
          <button type="submit" style={{ ...styles.btn, ...styles.btnGold, padding: '0.5rem 1rem' }}><Send size={16} /></button>
        </form>

        <style>{`@keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.3; } }`}</style>
      </div>
    );
  }
}
