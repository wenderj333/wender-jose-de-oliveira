import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { MessageCircle, X, Send, Minus, Maximize2, Minimize2, Image, Smile } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const API = (import.meta.env.VITE_API_URL || '') + '/api';

export default function GlobalChat() {
  const { t } = useTranslation();
  const { user, token } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [activeChat, setActiveChat] = useState(null); // Selected user to chat with
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

  // Poll for messages in active chat
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
      fetchMessages(activeChat.id); // Refresh to get real ID
    } catch (e) { console.error(e); }
  };

  if (!user) return null;

  return (
    <div style={{ position: 'fixed', bottom: 20, right: 20, zIndex: 9999, fontFamily: "'Inter', sans-serif" }}>
      
      {/* Floating Button (Trigger) */}
      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)}
          style={{
            width: 60, height: 60, borderRadius: '50%',
            background: 'linear-gradient(135deg, #1E3A8A, #2563EB)',
            color: 'white', border: 'none', boxShadow: '0 4px 15px rgba(37,99,235,0.4)',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'transform 0.2s'
          }}
          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
        >
          <MessageCircle size={28} />
          {/* Badge could go here */}
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div style={{
          width: 350, height: isMinimized ? 50 : 500,
          background: 'white', borderRadius: '16px 16px 0 0',
          boxShadow: '0 5px 30px rgba(0,0,0,0.15)',
          display: 'flex', flexDirection: 'column', overflow: 'hidden',
          border: '1px solid #e0e0e0', transition: 'height 0.3s ease'
        }}>
          
          {/* Header */}
          <div style={{
            padding: '12px 16px', background: 'white', borderBottom: '1px solid #f0f0f0',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            cursor: 'pointer'
          }} onClick={() => !isMinimized && setIsMinimized(!isMinimized)}>
            <div style={{ fontWeight: 700, fontSize: '1rem', color: '#1a1a1a' }}>
              {activeChat ? (
                  <div style={{display:'flex', alignItems:'center', gap:8}}>
                      <button onClick={(e) => { e.stopPropagation(); setActiveChat(null); }} style={{border:'none', background:'none', cursor:'pointer', padding:0}}>
                          ←
                      </button>
                      <img src={activeChat.avatar_url || 'https://via.placeholder.com/30'} style={{width:24, height:24, borderRadius:'50%'}} />
                      {activeChat.full_name}
                  </div>
              ) : t('messages.title', 'Mensagens')}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={(e) => { e.stopPropagation(); setIsMinimized(!isMinimized); }} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
              </button>
              <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Content Area */}
              <div style={{ flex: 1, overflowY: 'auto', background: '#fff' }} ref={chatBodyRef}>
                
                {/* Conversations List */}
                {!activeChat && (
                  <div style={{ padding: 0 }}>
                    {conversations.length === 0 ? (
                      <div style={{ padding: 20, textAlign: 'center', color: '#999', fontSize: '0.9rem' }}>
                        Nenhuma conversa recente.
                      </div>
                    ) : conversations.map(c => (
                      <div key={c.id} onClick={() => setActiveChat(c)} style={{
                        padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12,
                        cursor: 'pointer', borderBottom: '1px solid #f9f9f9', transition: 'background 0.2s'
                      }} onMouseEnter={e => e.currentTarget.style.background = '#f8f8f8'} onMouseLeave={e => e.currentTarget.style.background = 'white'}>
                        <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#eee', overflow: 'hidden', flexShrink: 0 }}>
                          {c.avatar_url ? <img src={c.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{width:'100%',height:'100%',display:'flex',alignItems:'center',justifyContent:'center'}}>👤</div>}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#1a1a1a' }}>{c.full_name}</div>
                          <div style={{ fontSize: '0.8rem', color: '#888', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {c.last_message || 'Inicie uma conversa'}
                          </div>
                        </div>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#2563EB', opacity: c.unread ? 1 : 0 }} />
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
                          background: isMe ? '#3797F0' : '#EFEFEF', // Instagram Blue / Gray
                          color: isMe ? 'white' : 'black',
                          fontSize: '0.9rem',
                          marginBottom: isLast ? 0 : 2
                        }}>
                          {msg.content}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Input Area (Only when chatting) */}
              {activeChat && (
                <form onSubmit={sendMessage} style={{
                  padding: '10px 12px', borderTop: '1px solid #efefef',
                  display: 'flex', alignItems: 'center', gap: 8
                }}>
                  <button type="button" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#1a1a1a' }}><Smile size={24} /></button>
                  <input 
                    value={newMessage}
                    onChange={e => setNewMessage(e.target.value)}
                    placeholder="Mensagem..."
                    style={{
                      flex: 1, border: 'none', outline: 'none', fontSize: '0.95rem',
                      padding: '8px 0'
                    }}
                  />
                  {newMessage.trim() ? (
                    <button type="submit" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#3797F0', fontWeight: 600 }}>Enviar</button>
                  ) : (
                    <button type="button" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#1a1a1a' }}><Image size={24} /></button>
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
