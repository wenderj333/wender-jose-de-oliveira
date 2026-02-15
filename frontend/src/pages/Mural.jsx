import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { Plus, Filter, X, Send, Heart, MessageCircle, Image, Video, Play, User, Share2 } from 'lucide-react';

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

  useEffect(() => {
    fetchPosts();
    // Request push notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      setTimeout(() => Notification.requestPermission(), 3000);
    }
  }, []);

  async function fetchPosts() {
    try {
      const res = await fetch(`${API}/feed?limit=50`);
      const data = await res.json();
      setPosts(data.posts || []);
    } catch (err) {
      console.error('Error fetching feed:', err);
    } finally {
      setLoading(false);
    }
  }

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

  // Upload direto ao Cloudinary (evita timeout do Render Free)
  async function uploadDirectToCloudinary(file) {
    const isVid = file.type.startsWith('video/');
    const resourceType = isVid ? 'video' : 'image';

    // Tentar upload assinado via backend
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

        const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`, {
          method: 'POST', body: fd,
        });
        const result = await uploadRes.json();
        if (result.secure_url) return { url: result.secure_url, type: resourceType };
        console.error('Cloudinary signed upload error:', result);
      }
    } catch (e) {
      console.error('Signed upload failed, trying unsigned:', e);
    }

    // Fallback: upload unsigned (precisa de upload preset no Cloudinary)
    const fd = new FormData();
    fd.append('file', file);
    fd.append('upload_preset', 'sigo_com_fe');
    fd.append('folder', 'sigo-com-fe/posts');

    const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/degxiuf43/${resourceType}/upload`, {
      method: 'POST', body: fd,
    });
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

      // Upload mídia direto ao Cloudinary (fotos E vídeos)
      if (newMedia) {
        const result = await uploadDirectToCloudinary(newMedia);
        formData.append('media_url', result.url);
        formData.append('media_type', result.type);
      }

      const res = await fetch(`${API}/feed`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (data.post) {
        data.post.author_name = user.full_name;
        data.post.author_avatar = user.avatar_url;
        setPosts(prev => [data.post, ...prev]);
        setNewText('');
        setNewMedia(null);
        setNewMediaPreview(null);
        setNewMediaIsVideo(false);
        setShowForm(false);
      }
    } catch (err) {
      console.error('Error creating post:', err);
      alert('Erro ao publicar. Tente novamente.');
    } finally {
      setPosting(false);
    }
  }

  const getMediaUrl = (url) => url ? (url.startsWith('http') ? url : `${API_BASE}${url}`) : null;
  const getAvatarUrl = (url) => url ? (url.startsWith('http') ? url : `${API_BASE}${url}`) : null;

  const filteredPosts = activeFilter === 'todas'
    ? posts
    : activeFilter === 'video'
    ? posts.filter(p => p.media_url && isVideo(p.media_url))
    : posts.filter(p => p.category === activeFilter);

  const FILTERS = [
    { key: 'todas', label: 'Todas' },
    { key: 'video', label: '🎬 Vídeos' },
    { key: 'testemunho', label: '🙏 Testemunhos' },
    { key: 'louvor', label: '🎵 Louvor' },
    { key: 'versiculo', label: '📖 Versículos' },
  ];

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: '1rem 0.5rem' }}>
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
            {showForm ? 'Cancelar' : 'Publicar'}
          </button>
        )}
      </div>

      {/* New Post Form */}
      {showForm && user && (
        <form onSubmit={handlePost} style={{
          background: '#fff', borderRadius: 16, padding: '1rem', marginBottom: '1rem',
          border: '1px solid #eee', boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        }}>
          {/* Category */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: '0.75rem' }}>
            {CATEGORIES.map(cat => (
              <button type="button" key={cat.value} onClick={() => setNewCategory(cat.value)} style={{
                padding: '4px 12px', borderRadius: 16, border: 'none', cursor: 'pointer',
                fontSize: '0.8rem',
                background: newCategory === cat.value ? cat.color + '22' : '#f5f5f5',
                color: newCategory === cat.value ? cat.color : '#666',
                fontWeight: newCategory === cat.value ? 600 : 400,
              }}>
                {cat.label}
              </button>
            ))}
          </div>

          {/* Text */}
          <textarea value={newText} onChange={e => setNewText(e.target.value)}
            placeholder="Compartilhe algo com a comunidade..."
            rows={3} style={{
              width: '100%', padding: '0.7rem', borderRadius: 10, border: '1px solid #ddd',
              fontSize: '0.9rem', resize: 'vertical', boxSizing: 'border-box', marginBottom: '0.5rem',
            }} />

          {/* Media preview */}
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

          {/* Dica de edição para vídeos */}
          {newMediaIsVideo && (
            <div style={{
              background: '#fff8e1', border: '1px solid #ffe082', borderRadius: 10,
              padding: '0.7rem', marginBottom: '0.5rem', fontSize: '0.8rem', color: '#6d4c00',
            }}>
              <strong>💡 Dica:</strong> Edite seu vídeo e adicione música antes de postar!
              <div style={{ marginTop: 6, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                <a href="https://www.capcut.com" target="_blank" rel="noopener" style={{
                  background: '#fff', padding: '3px 10px', borderRadius: 12, border: '1px solid #ddd',
                  textDecoration: 'none', color: '#333', fontSize: '0.75rem',
                }}>🎬 CapCut (grátis)</a>
                <a href="https://inshot.com" target="_blank" rel="noopener" style={{
                  background: '#fff', padding: '3px 10px', borderRadius: 12, border: '1px solid #ddd',
                  textDecoration: 'none', color: '#333', fontSize: '0.75rem',
                }}>✂️ InShot (grátis)</a>
              </div>
              <div style={{ marginTop: 8 }}>
                <strong>🎵 Músicas evangélicas sem copyright:</strong>
                <div style={{ marginTop: 4, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  <a href="https://www.youtube.com/results?search_query=m%C3%BAsica+evang%C3%A9lica+sem+copyright" target="_blank" rel="noopener" style={{
                    background: '#fff', padding: '3px 10px', borderRadius: 12, border: '1px solid #ddd',
                    textDecoration: 'none', color: '#c00', fontSize: '0.75rem',
                  }}>▶️ YouTube</a>
                  <a href="https://pixabay.com/music/search/worship/" target="_blank" rel="noopener" style={{
                    background: '#fff', padding: '3px 10px', borderRadius: 12, border: '1px solid #ddd',
                    textDecoration: 'none', color: '#333', fontSize: '0.75rem',
                  }}>🎶 Pixabay Music</a>
                  <a href="https://uppbeat.io/browse/music/christian" target="_blank" rel="noopener" style={{
                    background: '#fff', padding: '3px 10px', borderRadius: 12, border: '1px solid #ddd',
                    textDecoration: 'none', color: '#333', fontSize: '0.75rem',
                  }}>🎹 Uppbeat</a>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button type="button" onClick={() => fileRef.current?.click()} style={{
              padding: '0.4rem 0.8rem', borderRadius: 8, border: '1px solid #ddd',
              background: '#f9f9f9', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4,
              fontSize: '0.8rem', color: '#666',
            }}>
              <Image size={16} /> Foto
            </button>
            <button type="button" onClick={() => fileRef.current?.click()} style={{
              padding: '0.4rem 0.8rem', borderRadius: 8, border: '1px solid #ddd',
              background: '#f9f9f9', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4,
              fontSize: '0.8rem', color: '#666',
            }}>
              <Video size={16} /> Vídeo
            </button>
            <div style={{ flex: 1 }} />
            <button type="submit" disabled={posting || !newText.trim()} style={{
              padding: '0.5rem 1.2rem', borderRadius: 20, border: 'none',
              background: newText.trim() ? '#daa520' : '#ccc', color: '#fff',
              fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
            }}>
              <Send size={16} /> {posting ? 'Enviando...' : 'Publicar'}
            </button>
          </div>
          <input ref={fileRef} type="file" accept="image/*,video/mp4,video/webm,video/quicktime" style={{ display: 'none' }}
            onChange={handleMediaSelect} />
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
          }}>
            {f.label}
          </button>
        ))}
      </div>

      {/* Feed */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
          <div className="loading-spinner" />
        </div>
      ) : filteredPosts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#999' }}>
          <p>Nenhuma publicação ainda. {user ? 'Seja o primeiro a publicar!' : 'Faça login para publicar!'}</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {filteredPosts.map(post => (
            <div key={post.id} style={{
              background: '#fff', borderRadius: 16, overflow: 'hidden',
              border: '1px solid #eee', boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
            }}>
              {/* Author header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0.75rem 1rem 0.5rem' }}>
                <div style={{
                  width: 38, height: 38, borderRadius: '50%', background: '#daa520',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0,
                }}>
                  {post.author_avatar ? (
                    <img src={getAvatarUrl(post.author_avatar)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <User size={20} color="#fff" />
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#1a1a2e' }}>{post.author_name}</div>
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

              {/* Verse reference */}
              {post.verse_reference && (
                <div style={{ padding: '0 1rem 0.5rem', fontSize: '0.85rem', color: '#daa520', fontStyle: 'italic' }}>
                  📖 {post.verse_reference}
                </div>
              )}

              {/* Media — image or video */}
              {post.media_url && (
                <div style={{ width: '100%' }}>
                  {(post.media_type === 'video' || isVideo(post.media_url)) ? (
                    <video
                      src={getMediaUrl(post.media_url)}
                      controls
                      playsInline
                      preload="metadata"
                      style={{ width: '100%', maxHeight: 500, background: '#000' }}
                    />
                  ) : (
                    <img src={getMediaUrl(post.media_url)} alt="" style={{ width: '100%', maxHeight: 500, objectFit: 'cover' }} />
                  )}
                </div>
              )}

              {/* Actions */}
              <div style={{ display: 'flex', gap: 16, padding: '0.5rem 1rem 0.5rem' }}>
                <button onClick={() => {
                  if (!user) { alert(t('common.loginToLike')); return; }
                  setPosts(prev => prev.map(p => p.id === post.id ? {...p, liked: !p.liked, likes: (p.likes||0) + (p.liked ? -1 : 1)} : p));
                }} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, color: post.liked ? '#e74c3c' : '#999', fontSize: '0.8rem' }}>
                  <Heart size={18} fill={post.liked ? '#e74c3c' : 'none'} /> {post.likes || 0} Amém
                </button>
                <button onClick={() => {
                  if (!user) { alert(t('common.loginToComment')); return; }
                  setPosts(prev => prev.map(p => p.id === post.id ? {...p, showComments: !p.showComments} : p));
                }} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, color: '#999', fontSize: '0.8rem' }}>
                  <MessageCircle size={18} /> {t('common.comment')}
                </button>
                <button onClick={() => {
                  const shareText = `${post.content}${post.verse_reference ? '\n📖 ' + post.verse_reference : ''}\n\n🙏 Sigo com Fé - Rede Social Cristã\nhttps://sigo-com-fe.vercel.app`;
                  if (navigator.share) {
                    navigator.share({ title: 'Sigo com Fé', text: shareText, url: 'https://sigo-com-fe.vercel.app' }).catch(() => {});
                  } else {
                    navigator.clipboard.writeText(shareText);
                    alert(t('common.linkCopied'));
                  }
                }} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, color: '#999', fontSize: '0.8rem' }}>
                  <Share2 size={18} /> {t('common.share')}
                </button>
                {user && post.author_id !== user.id && (
                  <button onClick={async () => {
                    if (confirm(t('common.reportConfirm'))) {
                      try {
                        await fetch(`${API}/feed/${post.id}/report`, {
                          method: 'POST',
                          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
                          body: JSON.stringify({ reason: 'Conteúdo inadequado' }),
                        });
                        alert(t('common.reported'));
                      } catch (err) { console.error(err); }
                    }
                  }} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, color: '#ccc', fontSize: '0.75rem', marginLeft: 'auto' }}>
                    ⚠️
                  </button>
                )}
              </div>
              {/* Comments section */}
              {post.showComments && user && (
                <div style={{ padding: '0 1rem 0.75rem' }}>
                  {(post.comments || []).map((c, i) => (
                    <div key={i} style={{ fontSize: '0.8rem', padding: '4px 0', borderTop: '1px solid #f0f0f0' }}>
                      <strong>{c.name}</strong>: {c.text}
                    </div>
                  ))}
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    const input = e.target.elements.comment;
                    if (!input.value.trim()) return;
                    setPosts(prev => prev.map(p => p.id === post.id ? {
                      ...p, comments: [...(p.comments||[]), { name: user.full_name?.split(' ')[0], text: input.value }]
                    } : p));
                    input.value = '';
                  }} style={{ display: 'flex', gap: 6, marginTop: 6 }}>
                    <input name="comment" placeholder={t('common.writeComment')}
                      style={{ flex: 1, padding: '0.4rem 0.7rem', borderRadius: 20, border: '1px solid #ddd', fontSize: '0.8rem' }} />
                    <button type="submit" style={{ padding: '0.4rem 0.8rem', borderRadius: 20, border: 'none', background: '#daa520', color: '#fff', fontSize: '0.8rem', cursor: 'pointer' }}>
                      Enviar
                    </button>
                  </form>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Login prompt for non-logged users */}
      {!user && (
        <div style={{
          position: 'fixed', bottom: 0, left: 0, right: 0, padding: '1rem',
          background: 'linear-gradient(transparent, #fff 30%)', textAlign: 'center',
        }}>
          <p style={{ margin: '0 0 0.5rem', color: '#666', fontSize: '0.9rem' }}>
            Faça login para publicar e interagir!
          </p>
        </div>
      )}
    </div>
  );
}
