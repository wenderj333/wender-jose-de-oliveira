import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { MessageCircle, X, Send, Minus, Maximize2, Minimize2, Image, Smile, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const API = (import.meta.env.VITE_API_URL || '') + '/api';

export default function GlobalChat() {
  const { t } = useTranslation();
  const { user, token } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [activeChat, setActiveChat] = useState(null); 
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const chatBodyRef = useRef(null);

  // Poll for conversations list
  useEffect(() => {
    if (isOpen && !activeChat) {
      fetchConversations();
      const interval = setInterval(fetchConversations, 10000);
      return () => clearInterval(interval);
    }
  }, [isOpen, activeChat]);

  // Poll for messages
  useEffect(() => {
    if (activeChat) {
      fetchMessages(activeChat.id);
      const interval = setInterval(() => fetchMessages(activeChat.id), 5000);
      return () => clearInterval(interval);
    }
  }, [activeChat]);

  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [messages]);

  const fetchConversations = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API}/messages/conversations`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setConversations(data || []);
    } catch (e) { console.error(e); }
  };

  const fetchMessages = async (partnerId) => {
    if (!token) return;
    try {
      const res = await fetch(`${API}/messages/${partnerId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setMessages(data || []);
    } catch (e) { console.error(e); }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChat) return;
    
    const tempMsg = { 
        id: Date.now(), 
        sender_id: user.id, 
        content: newMessage, 
        created_at: new Date().toISOString() 
    };
    setMessages([...messages, tempMsg]);
    setNewMessage('');

    try {
      await fetch(`${API}/messages`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ receiverId: activeChat.id, content: tempMsg.content })
      });
      fetchMessages(activeChat.id); 
    } catch (e) { console.error(e); }
  };

  if (!user) return null;

  return (
    <div className="global-chat-container" style={{ position: 'fixed', bottom: 0, right: 20, zIndex: 9999, fontFamily: "'Inter', sans-serif" }}>
      
      {/* Floating Button (Only when CLOSED) */}
      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)}
          className="floating-chat-button"
          style={{
            marginBottom: 20,
            width: '56px', height: '56px', borderRadius: '50%',
            background: 'linear-gradient(135deg, #1E3A8A, #2563EB)',
            color: 'white', border: 'none', boxShadow: '0 4px 15px rgba(37,99,235,0.4)',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'transform 0.2s'
          }}
          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
        >
          <MessageCircle size={26} />
        </button>
      )}

      {/* Chat Window (Instagram Style - FIXED SIZE) */}
      {isOpen && (
        <div className="global-chat-window" style={{
          width: '330px !important', height: isMinimized ? '48px !important' : '450px !important',
          background: 'white', borderRadius: '12px 12px 0 0',
          boxShadow: '0 0 20px rgba(0,0,0,0.15)',
          display: 'flex', flexDirection: 'column', overflow: 'hidden',
          border: '1px solid #ddd', borderBottom: 'none',
          transition: 'height 0.3s ease',
          maxWidth: '100vw', maxHeight: '80vh' /* Fallback for mobile */
        }}>
          
          {/* Header */}
          <div style={{
            padding: '10px 14px', background: 'white', borderBottom: '1px solid #eee',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
          }} onClick={() => !isMinimized && setIsMinimized(!isMinimized)}>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600, fontSize: '0.95rem', color: '#1a1a1a' }}>
              {activeChat ? (
                  <>
                      <button onClick={(e) => { e.stopPropagation(); setActiveChat(null); }} style={{border:'none', background:'none', cursor:'pointer', padding:0, display:'flex'}}>
                          <ArrowLeft size={18} />
                      </button>
                      <img src={activeChat.avatar_url || 'https://via.placeholder.com/30'} style={{width:24, height:24, borderRadius:'50%', objectFit:'cover'}} />
                      {activeChat.full_name}
                  </>
              ) : (
                  <>
                    <MessageCircle size={20} color="#2563EB"/> 
                    {t('messages.title', 'Mensagens')}
                  </>
              )}
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={(e) => { e.stopPropagation(); setIsMinimized(!isMinimized); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#666' }}>
                <Minus size={18} />
              </button>
              <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#666' }}>
                <X size={18} />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Content */}
              <div style={{ flex: 1, overflowY: 'auto', background: '#fff' }} ref={chatBodyRef}>
                
                {/* Conversations List */}
                {!activeChat && (
                  <div style={{ padding: 0 }}>
                    {conversations.length === 0 ? (
                      <div style={{ padding: '40px 20px', textAlign: 'center', color: '#999', fontSize: '0.85rem' }}>
                        <MessageCircle size={32} style={{opacity:0.2, marginBottom:8}} />
                        <p>Nenhuma conversa recente.</p>
                      </div>
                    ) : conversations.map(c => (
                      <div key={c.id} onClick={() => setActiveChat(c)} style={{
                        padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 12,
                        cursor: 'pointer', borderBottom: '1px solid #f9f9f9', transition: 'background 0.2s'
                      }} onMouseEnter={e => e.currentTarget.style.background = '#f7f7f7'} onMouseLeave={e => e.currentTarget.style.background = 'white'}>
                        <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#eee', overflow: 'hidden', flexShrink: 0 }}>
                          {c.avatar_url ? <img src={c.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{width:'100%',height:'100%',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,color:'#999'}}>👤</div>}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#1a1a1a' }}>{c.full_name}</div>
                          <div style={{ fontSize: '0.8rem', color: '#888', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {c.last_message || 'Inicie uma conversa'}
                          </div>
                        </div>
                        {c.unread && <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#2563EB' }} />}
                      </div>
                    ))}
                  </div>
                )}

                {/* Messages View */}
                {activeChat && (
                  <div style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {messages.map((msg, i) => {
                      const isMe = msg.sender_id === user.id;
                      const isLast = i === messages.length - 1;
                      return (
                        <div key={i} style={{
                          alignSelf: isMe ? 'flex-end' : 'flex-start',
                          maxWidth: '75%',
                          padding: '8px 12px',
                          borderRadius: isMe ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                          background: isMe ? '#3797F0' : '#F1F1F1',
                          color: isMe ? 'white' : '#1a1a1a',
                          fontSize: '0.9rem',
                          marginBottom: isLast ? 0 : 2,
                          boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                        }}>
                          {msg.content}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Input Area */}
              {activeChat && (
                <form onSubmit={sendMessage} style={{
                  padding: '8px 12px', borderTop: '1px solid #eee',
                  display: 'flex', alignItems: 'center', gap: 8, background: 'white'
                }}>
                  <input 
                    value={newMessage}
                    onChange={e => setNewMessage(e.target.value)}
                    placeholder="Mensagem..."
                    style={{
                      flex: 1, border: '1px solid #eee', borderRadius: 20, fontSize: '0.9rem',
                      padding: '8px 12px', background: '#f9f9f9', outline: 'none'
                    }}
                  />
                  {newMessage.trim() ? (
                    <button type="submit" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#3797F0', fontWeight: 600, fontSize:'0.9rem' }}>Enviar</button>
                  ) : (
                    <div style={{width:40}}></div>
                  )}
                </form>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

// Simple ArrowLeft icon component if missing
const ArrowLeft = ({ size = 24, color = "currentColor" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12"></line>
    <polyline points="12 19 5 12 12 5"></polyline>
  </svg>
);
