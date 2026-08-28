import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { Send, Search, ArrowLeft, UserPlus, MessageCircle, Check, CheckCheck, Mic, MicOff, Trash2, Phone, PhoneOff, Video } from 'lucide-react';
import { useWebSocket } from '../context/WebSocketContext';
import { repairMojibake } from '../utils/textEncoding';

const API = import.meta.env.VITE_API_URL || '';
const CLOUDINARY_BASE = 'https://api.cloudinary.com/v1_1/degxiuf43/video/upload';
const VOICE_PREFIX = '__SCF_VOICE__:';
function playMessageSound(type) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const o = ctx.createOscillator(); const g = ctx.createGain();
    o.connect(g); g.connect(ctx.destination);
    if (type === 'send') {
      o.frequency.setValueAtTime(660, ctx.currentTime);
      o.frequency.setValueAtTime(880, ctx.currentTime + 0.08);
      g.gain.setValueAtTime(0.2, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
      o.start(ctx.currentTime); o.stop(ctx.currentTime + 0.2);
    } else {
      o.frequency.setValueAtTime(880, ctx.currentTime);
      o.frequency.setValueAtTime(1100, ctx.currentTime + 0.08);
      o.frequency.setValueAtTime(880, ctx.currentTime + 0.16);
      g.gain.setValueAtTime(0.5, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      o.start(ctx.currentTime); o.stop(ctx.currentTime + 0.4);
    }
  } catch(e) {}
}

export default function Chat() {
  const { t } = useTranslation();
  const { user, token } = useAuth();
  const { send: sendSocket, on: onSocket, off: offSocket, isConnected: socketConnected } = useWebSocket();
  const { userId } = useParams(); // /mensagens/:userId
  const navigate = useNavigate();
  const location = useLocation();

  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [otherUser, setOtherUser] = useState(null);
  const [friendStatus, setFriendStatus] = useState('loading'); // 'accepted'|'pending'|'none'|'loading'
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [search, setSearch] = useState('');
  const [loadingConvs, setLoadingConvs] = useState(true);
  const [requestSent, setRequestSent] = useState(false);
  const [translations, setTranslations] = useState({}); // msgId -> translated text
  const [translating, setTranslating] = useState({}); // msgId -> bool
  const messagesEndRef = useRef(null);
  const [recording, setRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const peerRef = useRef(null);
  const localStreamRef = useRef(null);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const callRef = useRef(null);
  const autoCallStartedRef = useRef(false);
  const pendingCandidatesRef = useRef([]);
  const callTimeoutRef = useRef(null);
  const [call, setCall] = useState(null);
  const setCurrentCall = value => { callRef.current = value; setCall(value); };
  const startRecording = async () => { try { const stream = await navigator.mediaDevices.getUserMedia({ audio: true }); const mediaRecorder = new MediaRecorder(stream); mediaRecorderRef.current = mediaRecorder; audioChunksRef.current = []; mediaRecorder.ondataavailable = e => { if (e.data.size > 0) audioChunksRef.current.push(e.data); }; mediaRecorder.onstop = () => { const blob = new Blob(audioChunksRef.current, { type: "audio/webm" }); setAudioBlob(blob); setAudioUrl(URL.createObjectURL(blob)); stream.getTracks().forEach(t => t.stop()); }; mediaRecorder.start(); setRecording(true); } catch(e) { alert("Erro ao aceder ao microfone"); } };
  const stopRecording = () => { if (mediaRecorderRef.current) { mediaRecorderRef.current.stop(); setRecording(false); } };
  const cancelAudio = () => { setAudioBlob(null); setAudioUrl(null); };
  const pollRef = useRef(null);

  const closeCall = (notify = true) => { const active = callRef.current; if (notify && active?.id) sendSocket?.({ type: 'call_end', callId: active.id }); if (callTimeoutRef.current) clearTimeout(callTimeoutRef.current); callTimeoutRef.current = null; pendingCandidatesRef.current = []; peerRef.current?.close(); peerRef.current = null; localStreamRef.current?.getTracks().forEach(track => track.stop()); localStreamRef.current = null; setCurrentCall(null); };
  const mediaErrorMessage = error => {
    if (!navigator.mediaDevices?.getUserMedia) return 'Este navegador não permite chamadas de voz ou vídeo.';
    if (error?.name === 'NotAllowedError' || error?.name === 'SecurityError') return 'Permita o acesso ao microfone e à câmara nas definições do navegador e tente novamente.';
    if (error?.name === 'NotFoundError' || error?.name === 'DevicesNotFoundError') return 'Não foi encontrado um microfone ou uma câmara disponível.';
    if (error?.name === 'NotReadableError' || error?.name === 'TrackStartError') return 'O microfone ou a câmara está a ser usado por outra aplicação.';
    return 'Não foi possível iniciar a chamada. Verifique a ligação e tente novamente.';
  };
  const getIceServers = async () => { try { const response = await fetch(`${API}/api/calls/ice-servers`, { headers: { Authorization: `Bearer ${token}` } }); if (response.ok) { const data = await response.json(); if (Array.isArray(data.iceServers) && data.iceServers.length) return data.iceServers; } } catch (_) {} return [{ urls: 'stun:stun.l.google.com:19302' }]; };
  const setupCall = async (active, initiator) => {
    if (peerRef.current) return peerRef.current;
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: active.mode === 'video' });
    localStreamRef.current = stream;
    const peer = new RTCPeerConnection({ iceServers: await getIceServers() });
    peerRef.current = peer;
    stream.getTracks().forEach(track => peer.addTrack(track, stream));
    peer.ontrack = event => { if (remoteVideoRef.current) remoteVideoRef.current.srcObject = event.streams[0]; };
    peer.onicecandidate = event => { if (event.candidate) sendSocket?.({ type: 'call_signal', callId: active.id, signal: { candidate: event.candidate } }); };
    peer.onconnectionstatechange = () => {
      if (peer.connectionState === 'connected') {
        if (callTimeoutRef.current) clearTimeout(callTimeoutRef.current);
        callTimeoutRef.current = null;
        setCurrentCall({ ...callRef.current, status: 'active' });
      } else if (['failed', 'disconnected'].includes(peer.connectionState)) {
        closeCall(true);
        alert('A chamada foi interrompida. Verifique a ligação à internet e tente novamente.');
      }
    };
    setCurrentCall({ ...active, status: 'connecting' });
    setTimeout(() => { if (localVideoRef.current) localVideoRef.current.srcObject = stream; }, 0);
    if (initiator) {
      const offer = await peer.createOffer();
      await peer.setLocalDescription(offer);
      sendSocket?.({ type: 'call_signal', callId: active.id, signal: { offer } });
    }
    return peer;
  };
  const startCall = mode => {
    if (!otherUser?.id || !sendSocket) return;
    if (!socketConnected) {
      alert('A ligação ao chat ainda está a ser restabelecida. Aguarde alguns segundos e tente novamente.');
      return;
    }
    const id = crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
    const active = { id, mode, status: 'calling', otherName: otherUser.full_name, otherAvatar: otherUser.avatar_url };
    setCurrentCall(active);
    const sent = sendSocket({ type: 'call_request', callId: id, targetUserId: otherUser.id, mode, callerName: user.full_name, callerAvatar: user.avatar_url });
    if (!sent) {
      closeCall(false);
      alert('Não foi possível contactar a outra pessoa. Verifique a ligação e tente novamente.');
      return;
    }
    callTimeoutRef.current = setTimeout(() => {
      if (callRef.current?.id === id && callRef.current.status === 'calling') {
        closeCall(true);
        alert('A pessoa não atendeu à chamada.');
      }
    }, 45000);
  };
  useEffect(() => {
    const mode = new URLSearchParams(location.search).get('call');
    if (!['audio', 'video'].includes(mode) || !otherUser?.id || !sendSocket || autoCallStartedRef.current) return;
    autoCallStartedRef.current = true;
    navigate(`/mensagens/${userId}`, { replace: true });
    startCall(mode);
  }, [location.search, otherUser?.id, sendSocket, userId, navigate]);
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const mode = params.get('incoming');
    const callId = params.get('callId');
    if (!['audio', 'video'].includes(mode) || !callId || callRef.current) return;
    setCurrentCall({ id: callId, mode, status: 'incoming', otherName: params.get('callerName') || otherUser?.full_name, otherAvatar: otherUser?.avatar_url });
    navigate(`/mensagens/${userId}`, { replace: true });
  }, [location.search, otherUser?.full_name, otherUser?.avatar_url, userId, navigate]);
  const acceptCall = async () => { const active = callRef.current; if (!active) return; try { await setupCall(active, false); sendSocket?.({ type: 'call_response', callId: active.id, accepted: true }); } catch (error) { sendSocket?.({ type: 'call_response', callId: active.id, accepted: false }); closeCall(false); alert(mediaErrorMessage(error)); } };
  const declineCall = () => { if (callRef.current?.id) sendSocket?.({ type: 'call_response', callId: callRef.current.id, accepted: false }); closeCall(false); };
  useEffect(() => { const incoming = data => setCurrentCall({ id: data.callId, mode: data.mode, status: 'incoming', otherName: data.callerName, otherAvatar: data.callerAvatar }); const accepted = async data => { const active = callRef.current; if (active?.id === data.callId) try { await setupCall(active, true); } catch (error) { closeCall(true); alert(mediaErrorMessage(error)); } }; const ended = data => { if (callRef.current?.id === data.callId) closeCall(false); }; const unavailable = data => { if (callRef.current?.id === data.callId) { closeCall(false); alert('Esta pessoa não está disponível para chamada agora.'); } }; const signal = async data => { const active = callRef.current; if (!active || active.id !== data.callId) return; try { const peer = peerRef.current || await setupCall(active, false); if (data.signal.offer) { await peer.setRemoteDescription(new RTCSessionDescription(data.signal.offer)); const answer = await peer.createAnswer(); await peer.setLocalDescription(answer); sendSocket?.({ type: 'call_signal', callId: active.id, signal: { answer } }); } if (data.signal.answer) await peer.setRemoteDescription(new RTCSessionDescription(data.signal.answer)); if (data.signal.candidate) { if (peer.remoteDescription) await peer.addIceCandidate(new RTCIceCandidate(data.signal.candidate)); else pendingCandidatesRef.current.push(data.signal.candidate); } if (peer.remoteDescription && pendingCandidatesRef.current.length) { const candidates = pendingCandidatesRef.current.splice(0); for (const candidate of candidates) await peer.addIceCandidate(new RTCIceCandidate(candidate)); } } catch (_) { closeCall(true); alert('Não foi possível estabelecer a chamada. Verifique a ligação e tente novamente.'); } }; onSocket?.('call_incoming', incoming); onSocket?.('call_accepted', accepted); onSocket?.('call_declined', ended); onSocket?.('call_ended', ended); onSocket?.('call_unavailable', unavailable); onSocket?.('call_signal', signal); return () => { offSocket?.('call_incoming', incoming); offSocket?.('call_accepted', accepted); offSocket?.('call_declined', ended); offSocket?.('call_ended', ended); offSocket?.('call_unavailable', unavailable); offSocket?.('call_signal', signal); }; }, [onSocket, offSocket, sendSocket]);
  useEffect(() => () => closeCall(false), []);

  const translateMessage = async (msgId, content) => {
    if (translations[msgId]) {
      setTranslations(prev => { const n = {...prev}; delete n[msgId]; return n; });
      return;
    }
    setTranslating(prev => ({ ...prev, [msgId]: true }));
    try {
      const targetLang = navigator.language?.split('-')[0] || 'pt';
      const res = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(content)}&langpair=auto|${targetLang}`);
      const data = await res.json();
      const translated = data?.responseData?.translatedText;
      if (translated && translated !== content) {
        setTranslations(prev => ({ ...prev, [msgId]: translated }));
      }
    } catch {}
    setTranslating(prev => ({ ...prev, [msgId]: false }));
  };

  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

  // â”€â”€ Load conversations list â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const loadConversations = useCallback(async () => {
    try {
      const res = await fetch(`${API}/api/messages/conversations`, { headers });
      if (res.ok) {
        const data = await res.json();
        setConversations(data.conversations || []);
      }
    } catch (_) {}
    setLoadingConvs(false);
  }, [token]);

  useEffect(() => { loadConversations(); }, [loadConversations]);

  // â”€â”€ Load messages for active chat â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const loadMessages = useCallback(async () => {
    if (!userId) return;
    try {
      const res = await fetch(`${API}/api/messages/${userId}`, { headers });
      if (res.ok) {
        const data = await res.json();
        const prev = messages.length;
        const newMsgs = data.messages || [];
        if (prev > 0 && newMsgs.length > prev && newMsgs[newMsgs.length-1]?.sender_id !== user?.id) { playMessageSound(); }
        setMessages(newMsgs);
        setFriendStatus(data.friendshipStatus || 'none');
        setOtherUser(data.otherUser || null);
      }
    } catch (_) {}
  }, [userId, token]);

  useEffect(() => {
    if (userId) {
      setMessages([]);
      setFriendStatus('loading');
      loadMessages();
      // Poll every 4s for new messages
      pollRef.current = setInterval(() => {
        loadMessages();
        loadConversations();
      }, 4000);
    }
    return () => clearInterval(pollRef.current);
  }, [userId]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // â”€â”€ Send message â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const postMessage = async (content) => {
    if (!content || !userId || sending) return false;
    setSending(true);
    try {
      const res = await fetch(`${API}/api/messages`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ receiverId: userId, content }),
      });
      if (res.ok) {
        playMessageSound('send');
        await loadMessages();
        await loadConversations();
        return true;
      }
    } catch (_) {}
    finally { setSending(false); }
    return false;
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    const content = text.trim();
    if (!content) return;
    if (await postMessage(content)) setText('');
  };

  const sendAudio = async () => {
    if (!audioBlob || sending) return;
    if (audioBlob.size > 12 * 1024 * 1024) { alert('A mensagem de voz é muito grande. Grave uma mensagem menor.'); return; }
    setSending(true);
    try {
      const form = new FormData();
      form.append('file', audioBlob, 'mensagem-de-voz.webm');
      form.append('upload_preset', 'sigo_com_fe');
      form.append('folder', 'sigo-com-fe/voice-messages');
      const upload = await fetch(CLOUDINARY_BASE, { method: 'POST', body: form });
      const data = await upload.json();
      if (!upload.ok || !data.secure_url) throw new Error('Não foi possível enviar o áudio.');
      setSending(false);
      if (await postMessage(`${VOICE_PREFIX}${data.secure_url}`)) cancelAudio();
    } catch (error) {
      setSending(false);
      alert(error.message || 'Não foi possível enviar o áudio.');
    }
  };

  // â”€â”€ Send friend request â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const sendFriendRequest = async () => {
    if (!userId || requestSent) return;
    try {
      const res = await fetch(`${API}/api/friends/request`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ addresseeId: userId }),
      });
      if (res.ok) {
        setFriendStatus('pending');
        setRequestSent(true);
      }
    } catch (_) {}
  };

  // â”€â”€ Filtered conversations â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const filtered = conversations.filter(c =>
    c.other_name?.toLowerCase().includes(search.toLowerCase())
  );

  const isMobile = window.innerWidth < 768;
  const showList = !userId || !isMobile;
  const showChat = !!userId;

  // â”€â”€â”€ Helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const formatTime = (ts) => {
    if (!ts) return '';
    const d = new Date(ts);
    const now = new Date();
    const diffDays = Math.floor((now - d) / 86400000);
    if (diffDays === 0) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (diffDays === 1) return 'Ontem';
    if (diffDays < 7) return d.toLocaleDateString([], { weekday: 'short' });
    return d.toLocaleDateString([], { day: '2-digit', month: '2-digit' });
  };

  const Avatar = ({ url, name, size = 38 }) => (
    <div style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0,
      background: 'linear-gradient(135deg,#4a80d4,#3568b8)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: 'white', fontWeight: 700, fontSize: size * 0.38,
      overflow: 'hidden',
    }}>
      {url ? <img src={url} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : name?.charAt(0)?.toUpperCase()}
    </div>
  );

  return (
    <div style={{
      display: 'flex', height: 'calc(100vh - 60px)',
      background: 'var(--bg)', borderRadius: 12, overflow: 'hidden',
      border: '1px solid var(--border)', boxShadow: '0 4px 20px rgba(74,128,212,0.08)',
    }}>

      {/* â”€â”€ LEFT: Conversations List â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      {showList && (
        <div style={{
          width: userId ? 300 : '100%', maxWidth: userId ? 300 : '100%',
          borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column',
          background: 'var(--card)',
        }}>
          {/* Header */}
          <div style={{ padding: '16px 14px 10px', borderBottom: '1px solid var(--border)' }}>
            <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '1.25rem', fontWeight: 700, color: 'var(--text)', marginBottom: 10 }}>
              💬 Mensagens
            </h2>
            {/* Search */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--bg)', borderRadius: 20, padding: '7px 12px', border: '1px solid var(--border)' }}>
              <Search size={14} style={{ color: 'var(--muted)', flexShrink: 0 }} />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="{t('chat.search', 'Procurar conversa...')}"
                style={{ background: 'none', border: 'none', outline: 'none', fontSize: '0.85rem', color: 'var(--text)', width: '100%' }}
              />
            </div>
          </div>

          {/* List */}
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {loadingConvs ? (
              <div style={{ padding: 24, textAlign: 'center', color: 'var(--muted)', fontSize: '0.85rem' }}>A carregar...</div>
            ) : filtered.length === 0 ? (
              <div style={{ padding: 32, textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', marginBottom: 8 }}>💬</div>
                <p style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>Nenhuma conversa ainda</p>
                <p style={{ color: 'var(--muted)', fontSize: '0.78rem', marginTop: 4 }}>Vai ao perfil de um amigo e envia uma mensagem!</p>
              </div>
            ) : (
              filtered.map(conv => {
                const isActive = conv.other_id === userId;
                return (
                  <div
                    key={conv.other_id}
                    onClick={() => navigate(`/mensagens/${conv.other_id}`)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '11px 14px', cursor: 'pointer',
                      background: isActive ? 'var(--fb-light,#e8f0fe)' : 'transparent',
                      borderLeft: isActive ? '3px solid var(--fb,#4a80d4)' : '3px solid transparent',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'var(--bg)'; }}
                    onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
                  >
                    <div style={{ position: 'relative' }}>
                      <Avatar url={conv.other_avatar} name={conv.other_name} size={42} />
                      {/* Online dot placeholder */}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: conv.unread > 0 ? 700 : 500, fontSize: '0.88rem', color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 130 }}>
                          {repairMojibake(conv.other_name)}
                        </span>
                        <span style={{ fontSize: '0.68rem', color: 'var(--muted)', flexShrink: 0 }}>{formatTime(conv.last_at)}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 2 }}>
                        <span style={{ fontSize: '0.78rem', color: conv.unread > 0 ? 'var(--text)' : 'var(--muted)', fontWeight: conv.unread > 0 ? 600 : 400, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 140 }}>
                          {String(conv.last_content || '').startsWith(VOICE_PREFIX) ? 'Mensagem de voz' : repairMojibake(conv.last_content)}
                        </span>
                        {conv.unread > 0 && (
                          <span style={{ background: 'var(--fb,#4a80d4)', color: 'white', borderRadius: '50%', width: 18, height: 18, fontSize: '0.65rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            {conv.unread}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* â”€â”€ RIGHT: Chat Window â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      {showChat ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          {/* Chat header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', borderBottom: '1px solid var(--border)', background: 'var(--card)' }}>
            {isMobile && (
              <button onClick={() => navigate('/mensagens')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--fb)', padding: 4 }}>
                <ArrowLeft size={20} />
              </button>
            )}
            {otherUser && (
              <>
                <Link to={`/perfil/${otherUser.id}`}>
                  <Avatar url={otherUser.avatar_url} name={otherUser.full_name} size={38} />
                </Link>
                <div>
                  <p style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text)', margin: 0 }}>{repairMojibake(otherUser.full_name)}</p>
                  <p style={{ fontSize: '0.72rem', color: 'var(--muted)', margin: 0 }}>
                    {friendStatus === 'accepted' ? '✓ Amigos' : friendStatus === 'pending' ? '⏳ Pedido enviado' : ''}
                  </p>
                </div>
                <div style={{ marginLeft: 'auto', display: 'flex', gap: 7 }}>
                  <button type="button" onClick={() => startCall('audio')} style={{ display: 'flex', alignItems: 'center', gap: 5, borderRadius: 9, border: '1px solid #bcd2f3', background: '#eef5ff', color: '#245ea7', cursor: 'pointer', padding: '8px 10px', fontWeight: 700, fontSize: 12 }}><Phone size={15}/> Ligar</button>
                  <button type="button" onClick={() => startCall('video')} style={{ display: 'flex', alignItems: 'center', gap: 5, borderRadius: 9, border: '1px solid #bcd2f3', background: '#eef5ff', color: '#245ea7', cursor: 'pointer', padding: '8px 10px', fontWeight: 700, fontSize: 12 }}><Video size={15}/> Vídeo</button>
                </div>
              </>
            )}
          </div>

          {/* NOT FRIENDS â€” show friend request prompt */}
          {false ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 14, padding: 32, textAlign: 'center' }}>
              <div style={{ fontSize: '3rem' }}>🤝</div>
              {otherUser && <Avatar url={otherUser.avatar_url} name={otherUser.full_name} size={64} />}
              <h3 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '1.3rem', fontWeight: 700, color: 'var(--text)', margin: 0 }}>
                {otherUser?.full_name}
              </h3>
              <p style={{ color: 'var(--muted)', fontSize: '0.9rem', maxWidth: 300 }}>
                {friendStatus === 'pending' || requestSent
                  ? 'Pedido de amizade enviado! Quando aceitar, poderão conversar. ✝️'
                  : 'Para enviar mensagens, precisam ser amigos primeiro.'}
              </p>
              {friendStatus === 'none' && !requestSent && (
                <button
                  onClick={sendFriendRequest}
                  style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '11px 28px', borderRadius: 12, background: 'linear-gradient(135deg,#3568b8,#4a80d4)', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '0.95rem', boxShadow: '0 4px 14px rgba(74,128,212,0.3)' }}
                >
                  <UserPlus size={17} /> Enviar pedido de amizade
                </button>
              )}
              {(friendStatus === 'pending' || requestSent) && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 22px', borderRadius: 12, background: '#f0f5ff', color: 'var(--fb)', fontSize: '0.88rem', fontWeight: 600, border: '1px solid #dde8fa' }}>
                  <Check size={15} /> Pedido enviado — aguardando aprovação
                </div>
              )}
            </div>
          ) : friendStatus === 'loading' ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)' }}>
              A carregar...
            </div>
          ) : (
            <>
              {/* Messages */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '16px 16px 8px', display: 'flex', flexDirection: 'column', gap: 4 }}>
                {messages.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--muted)' }}>
                    <div style={{ fontSize: '2rem', marginBottom: 8 }}>🕊️</div>
                    <p style={{ fontSize: '0.88rem' }}>Nenhuma mensagem ainda. Diga olá! 👋</p>
                  </div>
                )}

                {messages.map((msg, i) => {
                  const isMe = msg.sender_id === user?.id;
                  const prevMsg = messages[i - 1];
                  const showAvatar = !isMe && (i === 0 || prevMsg?.sender_id !== msg.sender_id);
                  const showTime = i === messages.length - 1 || messages[i + 1]?.sender_id !== msg.sender_id;

                  return (
                    <div key={msg.id} style={{ display: 'flex', flexDirection: isMe ? 'row-reverse' : 'row', alignItems: 'flex-end', gap: 6, marginBottom: showTime ? 8 : 2 }}>
                      {!isMe && (
                        <div style={{ width: 28, flexShrink: 0 }}>
                          {showAvatar && <Avatar url={msg.sender_avatar} name={msg.sender_name} size={28} />}
                        </div>
                      )}
                      <div style={{ maxWidth: '68%' }}>
                        <div style={{
                          background: isMe ? 'linear-gradient(135deg,#3568b8,#4a80d4)' : 'var(--card)',
                          color: isMe ? 'white' : 'var(--text)',
                          border: isMe ? 'none' : '1px solid var(--border)',
                          borderRadius: isMe ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                          padding: '9px 14px',
                          fontSize: '0.88rem',
                          lineHeight: 1.5,
                          wordBreak: 'break-word',
                          boxShadow: isMe ? '0 2px 8px rgba(53,104,184,0.25)' : '0 1px 4px rgba(0,0,0,0.06)',
                        }}>
                  {String(msg.content || '').startsWith(VOICE_PREFIX) ? <audio controls preload="metadata" src={msg.content.slice(VOICE_PREFIX.length)} style={{ display: 'block', maxWidth: 230, height: 34 }} /> : repairMojibake(msg.content)}
                          {translations[msg.id] && (
                            <div style={{ marginTop: 6, paddingTop: 6, borderTop: isMe ? '1px solid rgba(255,255,255,0.3)' : '1px solid var(--border)', fontSize: '0.8rem', fontStyle: 'italic', opacity: 0.85 }}>
                              🌐 {translations[msg.id]}
                            </div>
                          )}
                        </div>
                        {!isMe && (
                          <button
                            onClick={() => translateMessage(msg.id, msg.content)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.7rem', color: 'var(--muted)', padding: '2px 4px', marginTop: 1, display: 'flex', alignItems: 'center', gap: 3 }}
                            title="Traduzir mensagem"
                          >
                            {translating[msg.id] ? '⏳' : translations[msg.id] ? '✕ ocultar' : '🌐 traduzir'}
                          </button>
                        )}
                        {showTime && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 3, marginTop: 2, justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
                            <span style={{ fontSize: '0.65rem', color: 'var(--muted)' }}>{formatTime(msg.created_at)}</span>
                            {isMe && (msg.is_read
                              ? <CheckCheck size={11} style={{ color: '#4a80d4' }} />
                              : <Check size={11} style={{ color: 'var(--muted)' }} />
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <form onSubmit={sendMessage} style={{ display: 'flex', gap: 10, padding: '12px 14px', borderTop: '1px solid var(--border)', background: 'var(--card)', alignItems: 'flex-end' }}>
                <Avatar url={user?.avatar_url} name={user?.full_name} size={34} />
                {audioBlob ? <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, background: '#eef6ff', border: '1px solid #cfe0fb', borderRadius: 18, padding: '7px 10px' }}><audio controls src={audioUrl} style={{ height: 30, minWidth: 0, flex: 1 }} /><button type="button" onClick={cancelAudio} aria-label="Apagar mensagem de voz" style={{ border: 0, background: 'transparent', color: '#c0392b', cursor: 'pointer' }}><Trash2 size={17}/></button><button type="button" onClick={sendAudio} disabled={sending} style={{ border: 0, borderRadius: 16, background: '#3568b8', color: '#fff', padding: '8px 11px', cursor: 'pointer', fontWeight: 700 }}>Enviar voz</button></div> : <>
                <button type="button" onClick={recording ? stopRecording : startRecording} aria-label={recording ? 'Parar gravação' : 'Gravar mensagem de voz'} style={{ width: 38, height: 38, borderRadius: '50%', background: recording ? '#e74c3c' : '#eef4ff', color: recording ? '#fff' : '#3568b8', border: '1px solid #cfe0fb', cursor: 'pointer', display: 'grid', placeItems: 'center', flexShrink: 0 }}>{recording ? <MicOff size={17}/> : <Mic size={17}/>}</button>
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', background: 'var(--bg)', borderRadius: 22, padding: '8px 14px', border: '1px solid var(--border)', gap: 8 }}>
                  <input
                    value={text}
                    onChange={e => setText(e.target.value)}
                    placeholder="Escreve uma mensagem..."
                    style={{ flex: 1, background: 'none', border: 'none', outline: 'none', fontSize: '0.88rem', color: 'var(--text)' }}
                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(e); } }}
                  />
                </div>
                </>}
                <button
                  type="submit"
                  disabled={!text.trim() || sending}
                  style={{ width: 38, height: 38, borderRadius: '50%', background: text.trim() ? 'linear-gradient(135deg,#3568b8,#4a80d4)' : 'var(--border)', border: 'none', cursor: text.trim() ? 'pointer' : 'default', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s', flexShrink: 0 }}
                >
                  <Send size={15} style={{ color: text.trim() ? 'white' : 'var(--muted)' }} />
                </button>
              </form>
            </>
          )}
        </div>
      ) : (
        // Empty state when no chat selected (desktop)
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12, color: 'var(--muted)' }}>
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--fb-light,#e8f0fe)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <MessageCircle size={34} style={{ color: 'var(--fb,#4a80d4)' }} />
          </div>
          <h3 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: '1.2rem', color: 'var(--text)', fontWeight: 600 }}>
            {t('chat.yourMessages', 'As tuas mensagens')}
          </h3>
          <p style={{ fontSize: '0.85rem', textAlign: 'center', maxWidth: 240 }}>
            {t('chat.selectConvo', 'Seleciona uma conversa')}
          </p>
        </div>
      )}
      {call && <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(15,23,42,.78)', display: 'grid', placeItems: 'center', padding: 16 }}>
        <div style={{ width: 'min(680px,100%)', background: '#101b33', color: '#fff', borderRadius: 20, padding: 20, textAlign: 'center', boxShadow: '0 22px 70px rgba(0,0,0,.35)' }}>
          <p style={{ margin: 0, opacity: .75 }}>{call.status === 'incoming' ? 'Chamada recebida' : call.status === 'calling' ? 'A chamar...' : call.status === 'connecting' ? 'A estabelecer ligação segura...' : call.mode === 'video' ? 'Videochamada em curso' : 'Chamada de voz em curso'}</p>
          <h2 style={{ margin: '9px 0 16px' }}>{call.otherName}</h2>
          {call.mode === 'video' ? <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}><video ref={remoteVideoRef} autoPlay playsInline style={{ width: '100%', minHeight: 180, background: '#050912', borderRadius: 12, objectFit: 'cover' }}/><video ref={localVideoRef} autoPlay muted playsInline style={{ width: '100%', minHeight: 180, background: '#050912', borderRadius: 12, objectFit: 'cover' }}/></div> : <audio ref={remoteVideoRef} autoPlay />}
          {call.status === 'incoming' ? <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}><button onClick={declineCall} style={{ border: 0, borderRadius: 12, padding: '12px 18px', background: '#c0392b', color: '#fff', cursor: 'pointer', fontWeight: 700 }}><PhoneOff size={16} style={{ verticalAlign: 'middle' }}/> Recusar</button><button onClick={acceptCall} style={{ border: 0, borderRadius: 12, padding: '12px 18px', background: '#27894d', color: '#fff', cursor: 'pointer', fontWeight: 700 }}><Phone size={16} style={{ verticalAlign: 'middle' }}/> Aceitar</button></div> : <button onClick={() => closeCall(true)} style={{ border: 0, borderRadius: 12, padding: '12px 20px', background: '#c0392b', color: '#fff', cursor: 'pointer', fontWeight: 700 }}><PhoneOff size={16} style={{ verticalAlign: 'middle' }}/> Encerrar</button>}
        </div>
      </div>}
    </div>
  );
}

