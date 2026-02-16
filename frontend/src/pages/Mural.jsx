import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { Plus, Filter, X, Send, Heart, MessageCircle, Image, Video, Play, User, Share2, ChevronDown, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const API_BASE = import.meta.env.VITE_API_URL || '';
const API = `${API_BASE}/api`;

const CATEGORIES = [
  { value: 'testemunho', label: '🙏 Testemunho', color: '#daa520' },
  { value: 'louvor', label: '🎵 Louvor', color: '#9b59b6' },
  { value: 'foto', label: '📸 Foto/Vídeo', color: '#3498db' },
  { value: 'versiculo', label: '📖 Versículo', color: '#27ae60' },
  { value: 'reflexao', label: '💭 Reflexão', color: '#e67e22' },
];

function isVideo(url) {
  if (!url) return false;
  return /\.(mp4|webm|mov)/i.test(url) || url.includes('/video/') || url.includes('resource_type=video');
}

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Agora';
  if (mins < 60) return `Há ${mins}min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `Há ${hrs}h`;
  const days = Math.floor(hrs / 24);
  return `Há ${days}d`;
}

export default function Mural() {
  const { t } = useTranslation();
  const { user, token } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('todas');

  // New post
  const [showForm, setShowForm] = useState(false);
  const [newText, setNewText] = useState('');
  const [newCategory, setNewCategory] = useState('testemunho');
  const [newMedia, setNewMedia] = useState(null);
  const [newMediaPreview, setNewMediaPreview] = useState(null);
  const [newMediaIsVideo, setNewMediaIsVideo] = useState(false);
  const [posting, setPosting] = useState(false);
  const fileRef = useRef(null);

  // Likes & comments state (from DB)
  const [likedPosts, setLikedPosts] = useState({});
  const [openComments, setOpenComments] = useState({}); // postId -> true
  const [commentsData, setCommentsData] = useState({}); // postId -> [comments]
  const [commentText, setCommentText] = useState({});
  const [sendingComment, setSendingComment] = useState({});

  useEffect(() => {
    fetchPosts();
    if ('Notification' in window && Notification.permission === 'default') {
      setTimeout(() => Notification.requestPermission(), 3000);
    }
  }, []);

  async function fetchPosts() {
    try {
      const res = await fetch(`${API}/feed?limit=50`);
      const data = await res.json();
      const p = data.posts || [];
      setPosts(p);
      // Check which posts user has liked
      if (token) {
        const liked = {};
        for (const post of p.slice(0, 50)) {
          try {
            const r = await fetch(`${API}/feed/${post.id}/liked`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            const d = await r.json();
            if (d.liked) liked[post.id] = true;
          } catch {}
        }
        setLikedPosts(liked);
      }
    } catch (err) {
      console.error('Error fetching feed:', err);
    } finally {
      setLoading(false);
    }
  }

  // ===== LIKES (saved to DB) =====
  async function handleLike(postId) {
    if (!token) { alert(t('common.loginToLike')); return; }
    const wasLiked = likedPosts[postId];
    // Optimistic update
    setLikedPosts(prev => ({ ...prev, [postId]: !wasLiked }));
    setPosts(prev => prev.map(p => p.id === postId
      ? { ...p, like_count: Math.max(0, (p.like_count || 0) + (wasLiked ? -1 : 1)) }
      : p
    ));
    try {
      await fetch(`${API}/feed/${postId}/like`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch {
      // Revert on error
      setLikedPosts(prev => ({ ...prev, [postId]: wasLiked }));
      setPosts(prev => prev.map(p => p.id === postId
        ? { ...p, like_count: Math.max(0, (p.like_count || 0) + (wasLiked ? 1 : -1)) }
        : p
      ));
    }
  }

  // ===== COMMENTS (saved to DB) =====
  async function fetchComments(postId) {
    try {
      const res = await fetch(`${API}/feed/${postId}/comments`);
      const data = await res.json();
      setCommentsData(prev => ({ ...prev, [postId]: data.comments || [] }));
    } catch {
      setCommentsData(prev => ({ ...prev, [postId]: [] }));
    }
  }

  function toggleComments(postId) {
    if (!token) { alert(t('common.loginToComment')); return; }
    const isOpen = openComments[postId];
    setOpenComments(prev => ({ ...prev, [postId]: !isOpen }));
    if (!isOpen && !commentsData[postId]) {
      fetchComments(postId);
    }
  }

  async function handleSendComment(postId) {
    const text = (commentText[postId] || '').trim();
    if (!text || !token) return;
    setSendingComment(prev => ({ ...prev, [postId]: true }));
    try {
      const res = await fetch(`${API}/feed/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ content: text }),
      });
      const data = await res.json();
      if (data.comment) {
        setCommentsData(prev => ({
          ...prev,
          [postId]: [...(prev[postId] || []), data.comment]
        }));
        setCommentText(prev => ({ ...prev, [postId]: '' }));
        setPosts(prev => prev.map(p => p.id === postId
          ? { ...p, comment_count: (p.comment_count || 0) + 1 }
          : p
        ));
      }
    } catch (err) { console.error(err); }
    finally { setSendingComment(prev => ({ ...prev, [postId]: false })); }
  }

  async function handleDeleteComment(commentId, postId) {
    try {
      await fetch(`${API}/feed/comments/${commentId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      setCommentsData(prev => ({
        ...prev,
        [postId]: (prev[postId] || []).filter(c => c.id !== commentId)
      }));
      setPosts(prev => prev.map(p => p.id === postId
        ? { ...p, comment_count: Math.max(0, (p.comment_count || 0) - 1) }
        : p
      ));
    } catch {}
  }

  // ===== MEDIA UPLOAD =====
  function handleMediaSelect(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setNewMedia(file);
    const isVid = file.type.startsWith('video/');
    setNewMediaIsVideo(isVid);
    if (isVid) {
      setNewMediaPreview(URL.createObjectURL(file));
    } else {
      const reader = new FileReader();
      reader.onload = () => setNewMediaPreview(reader.result);
      reader.readAsDataURL(file);
    }
  }

  async function uploadDirectToCloudinary(file) {
    const isVid = file.type.startsWith('video/');
    const resourceType = isVid ? 'video' : 'image';
    try {
      const sigRes = await fetch(`${API}/feed/cloudinary-signature`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (sigRes.ok) {
        const { signature, timestamp, cloudName, apiKey, folder } = await sigRes.json();
        const fd = new FormData();
        fd.append('file', file);
        fd.append('api_key', apiKey);
        fd.append('timestamp', timestamp);
        fd.append('signature', signature);
        fd.append('folder', folder);
        const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`, { method: 'POST', body: fd });
        const result = await uploadRes.json();
        if (result.secure_url) return { url: result.secure_url, type: resourceType };
      }
    } catch (e) { console.error('Signed upload failed:', e); }
    // Fallback unsigned
    const fd = new FormData();
    fd.append('file', file);
    fd.append('upload_preset', 'sigo_com_fe');
    fd.append('folder', 'sigo-com-fe/posts');
    const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/degxiuf43/${resourceType}/upload`, { method: 'POST', body: fd });
    const result = await uploadRes.json();
    if (result.error) throw new Error(result.error.message);
    return { url: result.secure_url, type: resourceType };
  }

  async function handlePost(e) {
    e.preventDefault();
    if (!newText.trim() || !token) return;
    setPosting(true);
    try {
      const formData = new FormData();
      formData.append('content', newText);
      formData.append('category', newCategory);
      if (newMedia) {
        try {
          const result = await uploadDirectToCloudinary(newMedia);
          formData.append('media_url', result.url);
          formData.append('media_type', result.type);
        } catch (uploadErr) {
          console.warn('Direct upload failed:', uploadErr);
          formData.append('image', newMedia);
        }
      }
      const res = await fetch(`${API}/feed`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (!res.ok) throw new Error(`Server error ${res.status}`);
      const data = await res.json();
      if (data.post) {
        data.post.author_name = user.full_name;
        data.post.author_avatar = user.avatar_url;
        data.post.like_count = 0;
        data.post.comment_count = 0;
        setPosts(prev => [data.post, ...prev]);
        setNewText(''); setNewMedia(null); setNewMediaPreview(null); setNewMediaIsVideo(false); setShowForm(false);
      }
    } catch (err) {
      console.error(err);
      alert('Erro ao publicar. Tente novamente.');
    } finally { setPosting(false); }
  }

  // ===== TRANSLATE =====
  async function translatePost(postId, text) {
    const lang = localStorage.getItem('i18nextLng') || 'pt';
    const targetLang = lang.substring(0, 2);
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, translating: true } : p));
    try {
      const parts = [];
      for (let i = 0; i < text.length; i += 500) {
        const part = text.substring(i, i + 500);
        const r = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(part)}&langpair=auto|${targetLang}`);
        const d = await r.json();
        parts.push(d?.responseData?.translatedText || part);
      }
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, translatedContent: parts.join(''), showTranslation: true, translating: false } : p));
    } catch {
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, translating: false } : p));
    }
  }

  const getMediaUrl = (url) => url ? (url.startsWith('http') ? url : `${API_BASE}${url}`) : null;
  const getAvatarUrl = (url) => url ? (url.startsWith('http') ? url : `${API_BASE}${url}`) : null;

  const filteredPosts = activeFilter === 'todas' ? posts
    : activeFilter === 'video' ? posts.filter(p => p.media_url && (p.media_type === 'video' || isVideo(p.media_url)))
    : posts.filter(p => p.category === activeFilter);

  const FILTERS = [
    { key: 'todas', label: t('mural.filters.all', 'Todas') },
    { key: 'video', label: '🎬 ' + t('mural.categories.louvor', 'Vídeos') },
    { key: 'testemunho', label: '🙏 ' + t('mural.filters.testimonies', 'Testemunhos') },
    { key: 'louvor', label: '🎵 ' + t('mural.filters.worship', 'Louvor') },
    { key: 'versiculo', label: '📖 ' + t('mural.filters.verses', 'Versículos') },
  ];

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: '1rem 0.5rem' }}>
      {/* Photo prompt for users without avatar */}
      {user && !user.avatar_url && (
        <Link to={`/perfil/${user.id}`} style={{ textDecoration: 'none' }}>
          <div style={{
            background: 'linear-gradient(135deg, #667eea, #764ba2)', borderRadius: 16, padding: '1rem',
            marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: 12, color: '#fff',
            boxShadow: '0 4px 15px rgba(102,126,234,0.3)', cursor: 'pointer',
          }}>
            <div style={{
              width: 50, height: 50, borderRadius: '50%', background: 'rgba(255,255,255,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', flexShrink: 0,
            }}>📷</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{t('profile.addPhotoPrompt', 'Adicione uma foto ao seu perfil!')}</div>
              <div style={{ fontSize: '0.8rem', opacity: 0.85, marginTop: 2 }}>{t('profile.addPhotoDesc', 'Toque aqui para personalizar seu perfil com uma foto.')}</div>
            </div>
          </div>
        </Link>
      )}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h1 style={{ margin: 0, fontSize: '1.5rem', color: '#1a0a3e' }}>📰 {t('mural.title', 'Mural')}</h1>
        {user && (
          <button onClick={() => setShowForm(!showForm)} style={{
            padding: '0.5rem 1rem', borderRadius: 20, border: 'none',
            background: showForm ? '#e74c3c' : '#daa520', color: '#fff',
            fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
          }}>
            {showForm ? <X size={16} /> : <Plus size={16} />}
            {showForm ? t('mural.cancel', 'Cancelar') : t('common.publish', 'Publicar')}
          </button>
        )}
      </div>

      {/* New Post Form */}
      {showForm && user && (
        <form onSubmit={handlePost} style={{
          background: '#fff', borderRadius: 16, padding: '1rem', marginBottom: '1rem',
          border: '1px solid #eee', boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: '0.75rem' }}>
            {CATEGORIES.map(cat => (
              <button type="button" key={cat.value} onClick={() => setNewCategory(cat.value)} style={{
                padding: '4px 12px', borderRadius: 16, border: 'none', cursor: 'pointer', fontSize: '0.8rem',
                background: newCategory === cat.value ? cat.color + '22' : '#f5f5f5',
                color: newCategory === cat.value ? cat.color : '#666',
                fontWeight: newCategory === cat.value ? 600 : 400,
              }}>{cat.label}</button>
            ))}
          </div>
          <textarea value={newText} onChange={e => setNewText(e.target.value)}
            placeholder={t('common.shareCommunity', 'Compartilhe algo com a comunidade...')}
            rows={3} style={{
              width: '100%', padding: '0.7rem', borderRadius: 10, border: '1px solid #ddd',
              fontSize: '0.9rem', resize: 'vertical', boxSizing: 'border-box', marginBottom: '0.5rem',
            }} />
          {newMediaPreview && (
            <div style={{ position: 'relative', marginBottom: '0.5rem', borderRadius: 10, overflow: 'hidden' }}>
              {newMediaIsVideo ? (
                <video src={newMediaPreview} controls style={{ width: '100%', maxHeight: 300, borderRadius: 10 }} />
              ) : (
                <img src={newMediaPreview} alt="" style={{ width: '100%', maxHeight: 300, objectFit: 'cover', borderRadius: 10 }} />
              )}
              <button type="button" onClick={() => { setNewMedia(null); setNewMediaPreview(null); }} style={{
                position: 'absolute', top: 8, right: 8, background: 'rgba(0,0,0,0.6)', border: 'none',
                borderRadius: '50%', width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
              }}><X size={16} color="#fff" /></button>
            </div>
          )}
          {newMediaIsVideo && (
            <div style={{
              background: '#fff8e1', border: '1px solid #ffe082', borderRadius: 10,
              padding: '0.7rem', marginBottom: '0.5rem', fontSize: '0.8rem', color: '#6d4c00',
            }}>
              <strong>💡 Dica:</strong> Edite seu vídeo antes de postar!
              <div style={{ marginTop: 6, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                <a href="https://www.capcut.com" target="_blank" rel="noopener" style={{ background: '#fff', padding: '3px 10px', borderRadius: 12, border: '1px solid #ddd', textDecoration: 'none', color: '#333', fontSize: '0.75rem' }}>🎬 CapCut</a>
                <a href="https://inshot.com" target="_blank" rel="noopener" style={{ background: '#fff', padding: '3px 10px', borderRadius: 12, border: '1px solid #ddd', textDecoration: 'none', color: '#333', fontSize: '0.75rem' }}>✂️ InShot</a>
              </div>
            </div>
          )}
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button type="button" onClick={() => fileRef.current?.click()} style={{
              padding: '0.4rem 0.8rem', borderRadius: 8, border: '1px solid #ddd',
              background: '#f9f9f9', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.8rem', color: '#666',
            }}><Image size={16} /> {t('feedPost.photo', 'Foto')}</button>
            <button type="button" onClick={() => fileRef.current?.click()} style={{
              padding: '0.4rem 0.8rem', borderRadius: 8, border: '1px solid #ddd',
              background: '#f9f9f9', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.8rem', color: '#666',
            }}><Video size={16} /> Vídeo</button>
            <div style={{ flex: 1 }} />
            <button type="submit" disabled={posting || !newText.trim()} style={{
              padding: '0.5rem 1.2rem', borderRadius: 20, border: 'none',
              background: newText.trim() ? '#daa520' : '#ccc', color: '#fff',
              fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
            }}><Send size={16} /> {posting ? t('common.publishing', 'Enviando...') : t('common.publish', 'Publicar')}</button>
          </div>
          <input ref={fileRef} type="file" accept="image/*,video/mp4,video/webm,video/quicktime" style={{ display: 'none' }} onChange={handleMediaSelect} />
        </form>
      )}

      {/* Filters */}
      <div style={{ display: 'flex', gap: 6, marginBottom: '1rem', overflowX: 'auto', paddingBottom: 4 }}>
        {FILTERS.map(f => (
          <button key={f.key} onClick={() => setActiveFilter(f.key)} style={{
            padding: '6px 14px', borderRadius: 20, border: 'none', cursor: 'pointer',
            fontSize: '0.8rem', whiteSpace: 'nowrap',
            background: activeFilter === f.key ? '#1a0a3e' : '#f0f0f0',
            color: activeFilter === f.key ? '#fff' : '#666',
            fontWeight: activeFilter === f.key ? 600 : 400,
          }}>{f.label}</button>
        ))}
      </div>

      {/* Feed */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}><div className="loading-spinner" /></div>
      ) : filteredPosts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#999' }}>
          <p>{t('common.noPostsYet', 'Nenhuma publicação ainda.')} {user ? t('common.beFirst', 'Seja o primeiro!') : ''}</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {filteredPosts.map(post => (
            <div key={post.id} style={{
              background: '#fff', borderRadius: 16, overflow: 'hidden',
              border: '1px solid #eee', boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
            }}>
              {/* Author header — clickable to profile */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0.75rem 1rem 0.5rem' }}>
                <Link to={`/perfil/${post.author_id}`} style={{ textDecoration: 'none', flexShrink: 0 }}>
                  <div style={{
                    width: 38, height: 38, borderRadius: '50%', background: '#daa520',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
                  }}>
                    {post.author_avatar ? (
                      <img src={getAvatarUrl(post.author_avatar)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (<User size={20} color="#fff" />)}
                  </div>
                </Link>
                <div style={{ flex: 1 }}>
                  <Link to={`/perfil/${post.author_id}`} style={{ textDecoration: 'none' }}>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#1a1a2e' }}>{post.author_name}</div>
                  </Link>
                  <div style={{ fontSize: '0.75rem', color: '#999' }}>{timeAgo(post.created_at)}</div>
                </div>
                <span style={{
                  fontSize: '0.7rem', padding: '2px 8px', borderRadius: 10,
                  background: (CATEGORIES.find(c => c.value === post.category)?.color || '#999') + '15',
                  color: CATEGORIES.find(c => c.value === post.category)?.color || '#999',
                }}>
                  {CATEGORIES.find(c => c.value === post.category)?.label?.split(' ')[0] || '📝'}
                </span>
              </div>

              {/* Content */}
              <div style={{ padding: '0 1rem 0.5rem', fontSize: '0.9rem', lineHeight: 1.5, color: '#333' }}>
                {post.content}
              </div>

              {/* Translation */}
              {post.showTranslation && post.translatedContent && (
                <div style={{ margin: '0 0.5rem 0.5rem', padding: '0.5rem 0.75rem', fontSize: '0.85rem', lineHeight: 1.5, color: '#1a0a3e', background: '#f0f4ff', borderRadius: 8 }}>
                  <div style={{ fontSize: '0.7rem', color: '#666', marginBottom: 4 }}>🌍 {t('common.translation', 'Tradução')}</div>
                  {post.translatedContent}
                </div>
              )}

              {/* Translate button */}
              <div style={{ padding: '0 1rem 0.25rem' }}>
                <button onClick={() => {
                  if (post.showTranslation) setPosts(prev => prev.map(p => p.id === post.id ? { ...p, showTranslation: false } : p));
                  else if (post.translatedContent) setPosts(prev => prev.map(p => p.id === post.id ? { ...p, showTranslation: true } : p));
                  else translatePost(post.id, post.content);
                }} disabled={post.translating} style={{
                  background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.75rem',
                  color: post.showTranslation ? '#1a0a3e' : '#999', display: 'flex', alignItems: 'center', gap: 4,
                }}>
                  🌍 {post.translating ? '...' : post.showTranslation ? t('common.hideTranslation', 'Ocultar') : t('common.translate', 'Traduzir')}
                </button>
              </div>

              {/* Verse */}
              {post.verse_reference && (
                <div style={{ padding: '0 1rem 0.5rem', fontSize: '0.85rem', color: '#daa520', fontStyle: 'italic' }}>
                  📖 {post.verse_reference}
                </div>
              )}

              {/* Media */}
              {post.media_url && (
                <div style={{ width: '100%' }}>
                  {(post.media_type === 'video' || isVideo(post.media_url)) ? (
                    <video src={getMediaUrl(post.media_url)} controls playsInline preload="metadata"
                      style={{ width: '100%', maxHeight: 500, background: '#000' }} />
                  ) : (
                    <img src={getMediaUrl(post.media_url)} alt="" style={{ width: '100%', maxHeight: 500, objectFit: 'cover' }} />
                  )}
                </div>
              )}

              {/* ===== ACTIONS (LIKES & COMMENTS from DB) ===== */}
              <div style={{ display: 'flex', gap: 16, padding: '0.6rem 1rem 0.3rem', alignItems: 'center' }}>
                {/* Like button — saves to database */}
                <button onClick={() => handleLike(post.id)} style={{
                  background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4,
                  color: likedPosts[post.id] ? '#e74c3c' : '#999', fontSize: '0.82rem',
                  transition: 'transform 0.2s',
                  transform: likedPosts[post.id] ? 'scale(1.05)' : 'scale(1)',
                }}>
                  <Heart size={20} fill={likedPosts[post.id] ? '#e74c3c' : 'none'} />
                  {(post.like_count || 0) > 0 && <span style={{ fontWeight: 600 }}>{post.like_count}</span>}
                  <span>Amém</span>
                </button>

                {/* Comment button */}
                <button onClick={() => toggleComments(post.id)} style={{
                  background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4,
                  color: openComments[post.id] ? '#667eea' : '#999', fontSize: '0.82rem',
                }}>
                  <MessageCircle size={18} />
                  {(post.comment_count || 0) > 0 && <span style={{ fontWeight: 600 }}>{post.comment_count}</span>}
                  <span>{t('common.comment', 'Comentar')}</span>
                </button>

                {/* Share */}
                <button onClick={() => {
                  const shareText = `${post.content}\n\n🙏 Sigo com Fé\nhttps://sigo-com-fe.vercel.app`;
                  if (navigator.share) navigator.share({ title: 'Sigo com Fé', text: shareText }).catch(() => {});
                  else { navigator.clipboard?.writeText(shareText); alert(t('common.linkCopied')); }
                }} style={{
                  background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4,
                  color: '#999', fontSize: '0.82rem', marginLeft: 'auto',
                }}>
                  <Share2 size={16} />
                </button>

                {/* Report */}
                {user && post.author_id !== user?.id && (
                  <button onClick={async () => {
                    if (confirm(t('common.reportConfirm'))) {
                      await fetch(`${API}/feed/${post.id}/report`, {
                        method: 'POST',
                        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
                        body: JSON.stringify({ reason: 'Conteúdo inadequado' }),
                      }).catch(() => {});
                      alert(t('common.reported'));
                    }
                  }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ccc', fontSize: '0.75rem' }}>
                    ⚠️
                  </button>
                )}
              </div>

              {/* ===== COMMENTS SECTION (from DB) ===== */}
              {openComments[post.id] && (
                <div style={{ padding: '0.5rem 1rem 0.75rem', borderTop: '1px solid #f0f0f0' }}>
                  {/* Comments list */}
                  {(commentsData[post.id] || []).length === 0 ? (
                    <p style={{ fontSize: '0.8rem', color: '#999', margin: '0.25rem 0 0.5rem', textAlign: 'center' }}>
                      💬 Sem comentários ainda
                    </p>
                  ) : (
                    (commentsData[post.id] || []).map(c => (
                      <div key={c.id} style={{ display: 'flex', gap: 8, marginBottom: '0.6rem' }}>
                        <div style={{
                          width: 28, height: 28, borderRadius: '50%', background: '#667eea', flexShrink: 0,
                          overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          {c.author_avatar ? (
                            <img src={c.author_avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (<User size={12} color="#fff" />)}
                        </div>
                        <div style={{ flex: 1 }}>
                          <span style={{ fontWeight: 700, fontSize: '0.8rem', color: '#1a1a2e', marginRight: 6 }}>{c.author_name}</span>
                          <span style={{ fontSize: '0.8rem', color: '#444' }}>{c.content}</span>
                          <div style={{ display: 'flex', gap: 10, marginTop: 2 }}>
                            <span style={{ fontSize: '0.7rem', color: '#aaa' }}>{timeAgo(c.created_at)}</span>
                            {c.author_id === user?.id && (
                              <button onClick={() => handleDeleteComment(c.id, post.id)} style={{
                                background: 'none', border: 'none', color: '#ccc', cursor: 'pointer', fontSize: '0.7rem', padding: 0,
                              }}>Excluir</button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}

                  {/* Comment input */}
                  {token && (
                    <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                      <input
                        value={commentText[post.id] || ''}
                        onChange={e => setCommentText(prev => ({ ...prev, [post.id]: e.target.value }))}
                        onKeyDown={e => { if (e.key === 'Enter') handleSendComment(post.id); }}
                        placeholder={t('common.writeComment', 'Escreva um comentário...')}
                        style={{
                          flex: 1, padding: '0.45rem 0.75rem', borderRadius: 20, border: '1px solid #ddd',
                          fontSize: '0.82rem', outline: 'none',
                        }}
                      />
                      <button
                        onClick={() => handleSendComment(post.id)}
                        disabled={!(commentText[post.id] || '').trim() || sendingComment[post.id]}
                        style={{
                          padding: '0.4rem 0.9rem', borderRadius: 20, border: 'none',
                          background: (commentText[post.id] || '').trim() ? '#daa520' : '#eee',
                          color: (commentText[post.id] || '').trim() ? '#fff' : '#aaa',
                          fontSize: '0.8rem', cursor: 'pointer', fontWeight: 600,
                        }}
                      >
                        <Send size={14} />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Login prompt */}
      {!user && (
        <div style={{
          position: 'fixed', bottom: 0, left: 0, right: 0, padding: '1rem',
          background: 'linear-gradient(transparent, #fff 30%)', textAlign: 'center',
        }}>
          <p style={{ margin: '0 0 0.5rem', color: '#666', fontSize: '0.9rem' }}>
            {t('common.loginToComment', 'Faça login para publicar e interagir!')}
          </p>
        </div>
      )}
    </div>
  );
}
