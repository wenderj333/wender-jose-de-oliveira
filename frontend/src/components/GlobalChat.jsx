import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { MessageCircle, X, Send, Minus, Maximize2, Minimize2, ArrowLeft, Image as ImageIcon } from 'lucide-react';
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
  const fileInputRef = useRef(null);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadPreview, setUploadPreview] = useState(null);

  // Poll for conversations list
  useEffect(() => {
    if (isOpen && !activeChat && user) {
      fetchConversations();
      const interval = setInterval(fetchConversations, 10000);
      return () => clearInterval(interval);
    }
  }, [isOpen, activeChat, user]);

  // Poll for messages
  useEffect(() => {
    if (activeChat && user) {
      fetchMessages(activeChat.id);
      const interval = setInterval(() => fetchMessages(activeChat.id), 5000);
      return () => clearInterval(interval);
    }
  }, [activeChat, user]);

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
    } catch (e) { console.error('Erro ao buscar conversas:', e); }
  };

  const fetchMessages = async (partnerId) => {
    if (!token) return;
    try {
      const res = await fetch(`${API}/messages/${partnerId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setMessages(data || []);
    } catch (e) { console.error('Erro ao buscar mensagens:', e); }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() && !uploadFile) return; // Allow sending just a file
    if (!activeChat) return;
    
    let mediaUrl = null;
    if (uploadFile) {
        try {
            const formData = new FormData();
            formData.append('file', uploadFile);
            formData.append('upload_preset', 'sigo_com_fe'); // Your Cloudinary upload preset
            const resourceType = uploadFile.type.startsWith('image') ? 'image' : 'video';
            const cloudinaryRes = await fetch(`https://api.cloudinary.com/v1_1/degxiuf43/${resourceType}/upload`, { method: 'POST', body: formData });
            const cloudinaryData = await cloudinaryRes.json();
            mediaUrl = cloudinaryData.secure_url;
        } catch (e) {
            console.error('Erro ao subir mídia:', e);
            alert('Erro ao subir a mídia. Tente novamente.');
            setUploadFile(null);
            setUploadPreview(null);
            return;
        }
    }

    const tempMsg = { 
        id: Date.now(), 
        sender_id: user.id, 
        content: newMessage || (mediaUrl ? '[Mídia]' : ''), // Show [Mídia] if only media
        media_url: mediaUrl,
        created_at: new Date().toISOString() 
    };
    setMessages(prev => [...prev, tempMsg]);
    setNewMessage('');
    setUploadFile(null);
    setUploadPreview(null);

    try {
      await fetch(`${API}/messages`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            receiverId: activeChat.id, 
            content: tempMsg.content, 
            media_url: tempMsg.media_url
        })
      });
      fetchMessages(activeChat.id); 
    } catch (e) { console.error('Erro ao enviar mensagem:', e); }
  };

  const handleFileChange = (e) => {
      const file = e.target.files[0];
      if (file) {
          setUploadFile(file);
          setUploadPreview(URL.createObjectURL(file));
          setNewMessage(''); // Clear text message if uploading file
      }
  };

  if (!user) return null;

  return (
    <>
      {/* Floating Button (Only when CLOSED) */}
      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)}
          className="floating-chat-button"
        >
          <MessageCircle size={26} />
        </button>
      )}

      {/* Chat Window (Instagram Style - FIXED SIZE) */}
      {isOpen && (
        <div className={`global-chat-container ${isOpen ? 'is-open' : ''} ${isMinimized ? 'is-minimized' : ''}`}> 
          <div className="global-chat-window"> 
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
                    <MessageCircle size={20} color="var(--fb)"/> 
                    {t('messages.title', 'Mensagens')}
                  </>
              )}
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={(e) => { e.stopPropagation(); setIsMinimized(!isMinimized); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)' }}>
                <Minus size={18} />
              </button>
              <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)' }}>
                <X size={18} />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Content */}
              <div style={{ flex: 1, overflowY: 'auto', background: 'var(--bg)' }} ref={chatBodyRef}>
                
                {/* Conversations List */}
                {!activeChat && (
                  <div style={{ padding: 0 }}>
                    {conversations.length === 0 ? (
                      <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--muted)', fontSize: '0.85rem' }}>
                        <MessageCircle size={32} style={{opacity:0.2, marginBottom:8}} />
                        <p>{t('messages.noConversations', 'Nenhuma conversa recente.')}</p>
                      </div>
                    ) : conversations.map(c => (
                      <div key={c.id} onClick={() => setActiveChat(c)} style={{
                        padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 12,
                        cursor: 'pointer', borderBottom: '1px solid var(--border)', transition: 'background 0.2s'
                      }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.02)'} onMouseLeave={e => e.currentTarget.style.background = 'white'}>
                        <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--bg)', overflow: 'hidden', flexShrink: 0 }}>
                          {c.avatar_url ? <img src={c.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{width:'100%',height:'100%',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,color:'var(--muted)'}}>👤</div>}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text)' }}>{c.full_name}</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {c.last_message || t('messages.startConversation', 'Inicie uma conversa')}
                          </div>
                        </div>
                        {c.unread && <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--fb)' }} />}
                      </div>
                    ))}
                  </div>
                )}

                {/* Messages View */}
                {activeChat && (
                  <div style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {messages.map((msg, i) => {
                      const isMe = msg.sender_id === user.id;
                      const isLast = i === messages.length - 1;
                      return (
                        <div key={i} style={{
                          alignSelf: isMe ? 'flex-end' : 'flex-start',
                          maxWidth: '75%',
                          padding: '10px 14px',
                          borderRadius: isMe ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                          background: isMe ? 'var(--fb)' : 'var(--card)',
                          color: isMe ? 'white' : 'var(--text)',
                          fontSize: '0.9rem',
                          boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                        }}>
                          {msg.content}
                          {msg.media_url && (
                              msg.media_url.match(/\.(mp4|webm|mov)(\?|$)/i) ? (
                                  <video src={msg.media_url} controls style={{maxWidth: '100%', borderRadius: 8, marginTop: 5}} />
                              ) : (
                                  <img src={msg.media_url} alt="Mídia" style={{maxWidth: '100%', borderRadius: 8, marginTop: 5}} />
                              )
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Input Area */}
              {activeChat && (
                <form onSubmit={sendMessage} style={{
                  padding: '8px 12px', borderTop: '1px solid var(--border)',
                  display: 'flex', alignItems: 'center', gap: 8, background: 'var(--card)'
                }}>
                  <input 
                    type="file"
                    ref={fileInputRef}
                    style={{display: 'none'}}
                    onChange={handleFileChange}
                    accept="image/*,video/*"
                  />
                  <button 
                      type="button" 
                      onClick={() => fileInputRef.current?.click()}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', display:'flex', alignItems:'center' }}
                  >
                    <ImageIcon size={20} />
                  </button>
                  
                  <input 
                    value={newMessage}
                    onChange={e => setNewMessage(e.target.value)}
                    placeholder={t('messages.writePlaceholder', 'Escreva sua mensagem...')}
                    style={{
                      flex: 1, border: '1px solid var(--border)', borderRadius: 20, fontSize: '0.9rem',
                      padding: '8px 12px', background: 'var(--bg)', outline: 'none',
                    }}
                  />
                  {uploadPreview && (
                      <div style={{position:'relative', display:'flex', alignItems:'center', justifyContent:'center', width:40, height:40, borderRadius:8, overflow:'hidden', border:'1px solid var(--border)'}}>
                          <img src={uploadPreview} style={{maxWidth:'100%', maxHeight:'100%', objectFit:'cover'}} />
                          <button 
                              type="button" 
                              onClick={() => {setUploadFile(null); setUploadPreview(null);}}
                              style={{position:'absolute', top:2, right:2, background:'rgba(0,0,0,0.6)', color:'white', borderRadius:'50%', width:18, height:18, display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, border:'none', cursor:'pointer'}}
                          >
                              <X size={10} />
                          </button>
                      </div>
                  )}
                  {newMessage.trim() || uploadFile ? (
                    <button type="submit" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--fb)', fontWeight: 600, fontSize:'0.9rem' }}>{t('common.send', 'Enviar')}</button>
                  ) : (
                    <button type="button" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)' }}><ImageIcon size={20} /></button>
                  )}
                </form>
              )}
            </>
          </div>
        </div>
      )}
    </>
  );
}
