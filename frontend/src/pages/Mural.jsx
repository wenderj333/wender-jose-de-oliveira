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

function isAudio(url) {
  if (!url) return false;
  return /\.(mp3|wav|ogg|m4a|aac|flac)/i.test(url);
}

function isYouTube(url) {
  if (!url) return false;
  return url.includes('youtube.com/watch') || url.includes('youtu.be/');
}

function getYouTubeId(url) {
  if (!url) return null;
  const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/);
  return m ? m[1] : null;
}

function isVideo(url) {
  if (!url) return false;
  if (isAudio(url)) return false; // audio is NOT video
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
  const [newMediaIsAudio, setNewMediaIsAudio] = useState(false);
  const [posting, setPosting] = useState(false);
  const [showMusicPicker, setShowMusicPicker] = useState(false);
  const [librarySongs, setLibrarySongs] = useState([]);
  const [selectedSongUrl, setSelectedSongUrl] = useState(null);
  const [selectedSongName, setSelectedSongName] = useState('');
  const fileRef = useRef(null);
  const photoRef = useRef(null);
  const videoRef = useRef(null);
  const audioRef = useRef(null);

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

  async function handleDeletePost(postId) {
    if (!confirm('Tem certeza que deseja excluir esta publicação?')) return;
    try {
      const res = await fetch(`${API}/feed/${postId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setPosts(prev => prev.filter(p => p.id !== postId));
      } else {
        alert('Erro ao excluir publicação');
      }
    } catch (err) { console.error(err); alert('Erro ao excluir'); }
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
  // Popular gospel songs (YouTube)
  const popularGospel = [
    { id: 'yt1', title: 'Lugar Secreto', artist: 'Gabriela Rocha', url: 'https://www.youtube.com/watch?v=ePGMkFPp-zI', type: 'youtube' },
    { id: 'yt2', title: 'Ninguém Explica Deus', artist: 'Preto no Branco', url: 'https://www.youtube.com/watch?v=GM5qMxKn3bk', type: 'youtube' },
    { id: 'yt3', title: 'Deus é Deus', artist: 'Delino Marçal', url: 'https://www.youtube.com/watch?v=jRZxbM3xNKU', type: 'youtube' },
    { id: 'yt4', title: 'Raridade', artist: 'Anderson Freire', url: 'https://www.youtube.com/watch?v=zB3sv1BSDWE', type: 'youtube' },
    { id: 'yt5', title: 'Primeiro Amor', artist: 'Preto no Branco', url: 'https://www.youtube.com/watch?v=3j3okb3kuts', type: 'youtube' },
    { id: 'yt6', title: 'Ousado Amor', artist: 'Isaías Saad', url: 'https://www.youtube.com/watch?v=pFRr3IJxVJo', type: 'youtube' },
    { id: 'yt7', title: 'Bondade de Deus', artist: 'Isaías Saad', url: 'https://www.youtube.com/watch?v=X1dGL0k6B5c', type: 'youtube' },
    { id: 'yt8', title: 'Eu Cuido de Ti', artist: 'Canção e Louvor', url: 'https://www.youtube.com/watch?v=9bDVpDEz2qs', type: 'youtube' },
    { id: 'yt9', title: 'Oceanos', artist: 'Ana Nóbrega', url: 'https://www.youtube.com/watch?v=dy9nwe_KxtE', type: 'youtube' },
    { id: 'yt10', title: 'Grande é o Senhor', artist: 'Soraya Moraes', url: 'https://www.youtube.com/watch?v=GhE3bDCr0QM', type: 'youtube' },
    { id: 'yt11', title: 'Tua Graça Me Basta', artist: 'Toque no Altar', url: 'https://www.youtube.com/watch?v=6UoVGm7Iy5E', type: 'youtube' },
    { id: 'yt12', title: 'Todavia Me Alegrarei', artist: 'Fernandinho', url: 'https://www.youtube.com/watch?v=ISwFnRD_vXI', type: 'youtube' },
    { id: 'yt13', title: 'A Casa É Sua', artist: 'Casa Worship', url: 'https://www.youtube.com/watch?v=JFKl8NPxUfc', type: 'youtube' },
    { id: 'yt14', title: 'Aquieta Minh\'alma', artist: 'Ministério Zoe', url: 'https://www.youtube.com/watch?v=1ZYc0OHQSAE', type: 'youtube' },
    { id: 'yt15', title: 'Yeshua', artist: 'Heloisa Rosa', url: 'https://www.youtube.com/watch?v=eWCFjB3zuCY', type: 'youtube' },
  ];

  const [musicTab, setMusicTab] = useState('popular'); // 'popular' | 'library' | 'upload'

  async function openMusicPicker() {
    setShowMusicPicker(true);
    if (librarySongs.length === 0) {
      try {
        const res = await fetch(`${API}/music`);
        const data = await res.json();
        setLibrarySongs(data.songs || []);
      } catch (err) { console.error(err); }
    }
  }

  function selectLibrarySong(song) {
    setSelectedSongUrl(song.url);
    setSelectedSongName(song.title + (song.artist ? ` - ${song.artist}` : ''));
    setShowMusicPicker(false);
    // Don't clear photo if one is already selected
  }

  function handleMediaSelect(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const isVid = file.type.startsWith('video/');
    const isAud = file.type.startsWith('audio/');
    
    if (isAud) {
      // Audio from phone - treat like library song
      setSelectedSongUrl(null);
      setSelectedSongName(file.name);
      setNewMedia(file);
      setNewMediaIsAudio(true);
      setNewMediaIsVideo(false);
      setNewMediaPreview(URL.createObjectURL(file));
    } else {
      // Photo or Video - keep music selection if any
      setNewMedia(file);
      setNewMediaIsVideo(isVid);
      setNewMediaIsAudio(false);
      if (isVid) {
        setNewMediaPreview(URL.createObjectURL(file));
      } else {
        const reader = new FileReader();
        reader.onload = () => setNewMediaPreview(reader.result);
        reader.readAsDataURL(file);
      }
    }
  }

  async function uploadDirectToCloudinary(file) {
    const isVid = file.type.startsWith('video/');
    const isAud = file.type.startsWith('audio/');
    const resourceType = (isVid || isAud) ? 'video' : 'image'; // Cloudinary uses 'video' for audio too
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
    if ((!newText.trim() && !newMedia && !selectedSongUrl) || !token) return;
    setPosting(true);
    try {
      const formData = new FormData();
      formData.append('content', newText.trim() || (newMediaIsAudio ? '🎵' : newMediaIsVideo ? '🎬' : '📸'));
      formData.append('category', newCategory);
      // If we have a library song AND a photo, upload photo first then add audio_url
      if (selectedSongUrl && newMedia && !newMediaIsAudio) {
        // Photo + Music combo - MUST upload photo to Cloudinary first
        try {
          const result = await uploadDirectToCloudinary(newMedia);
          formData.append('media_url', result.url);
          formData.append('media_type', 'image');
        } catch (uploadErr) {
          // Fallback: unsigned upload directly
          try {
            const fd2 = new FormData();
            fd2.append('file', newMedia);
            fd2.append('upload_preset', 'sigo_com_fe');
            fd2.append('folder', 'sigo-com-fe/posts');
            const upRes = await fetch('https://api.cloudinary.com/v1_1/degxiuf43/image/upload', { method: 'POST', body: fd2 });
            const upData = await upRes.json();
            if (upData.secure_url) {
              formData.append('media_url', upData.secure_url);
              formData.append('media_type', 'image');
            }
          } catch (e2) {
            console.error('Photo upload failed completely:', e2);
          }
        }
        formData.append('audio_url', selectedSongUrl);
      } else if (selectedSongUrl && !newMedia) {
        // Music only from library
        formData.append('media_url', selectedSongUrl);
        formData.append('media_type', 'video');
      } else if (newMedia) {
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
        setNewText(''); setNewMedia(null); setNewMediaPreview(null); setNewMediaIsVideo(false); setNewMediaIsAudio(false); setSelectedSongUrl(null); setSelectedSongName(''); setShowMusicPicker(false); setShowForm(false);
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
      {/* Visitor banner */}
      {!user && (
        <Link to="/cadastro" style={{ textDecoration: 'none' }}>
          <div style={{
            background: 'linear-gradient(135deg, #daa520, #f4c542)', borderRadius: 16, padding: '1rem',
            marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: 12, color: '#1a0a3e',
            boxShadow: '0 4px 15px rgba(218,165,32,0.3)', cursor: 'pointer',
          }}>
            <span style={{ fontSize: '1.8rem' }}>✨</span>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>Crie sua conta para participar!</div>
              <div style={{ fontSize: '0.8rem', opacity: 0.85, marginTop: 2 }}>Publique, comente e conecte-se com irmãos na fé. É rápido!</div>
            </div>
          </div>
        </Link>
      )}
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

      {/* Banner for non-logged users */}
      {!user && (
        <Link to="/cadastro" style={{ textDecoration: 'none' }}>
          <div style={{
            background: 'linear-gradient(135deg, #daa520, #f4d03f)', borderRadius: 12, padding: '0.75rem 1rem',
            marginBottom: '1rem', textAlign: 'center', color: '#1a0a3e', fontWeight: 600, fontSize: '0.9rem',
          }}>
            ✨ Crie sua conta para participar! <span style={{ textDecoration: 'underline' }}>Cadastre-se</span>
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

      {/* New Post Form — TikTok/Instagram style flow */}
      {showForm && user && (
        <form onSubmit={handlePost} style={{
          background: '#fff', borderRadius: 16, padding: '1rem', marginBottom: '1rem',
          border: '1px solid #eee', boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        }}>
          {/* Categories */}
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

          {/* Text */}
          <textarea value={newText} onChange={e => setNewText(e.target.value)}
            placeholder="Compartilhe algo com a comunidade..."
            rows={2} style={{
              width: '100%', padding: '0.7rem', borderRadius: 10, border: '1px solid #ddd',
              fontSize: '0.9rem', resize: 'vertical', boxSizing: 'border-box', marginBottom: '0.5rem',
            }} />

          {/* Media + Music buttons — Instagram style */}
          <div style={{ display: 'flex', gap: 6, marginBottom: '0.5rem' }}>
            <button type="button" onClick={() => photoRef.current?.click()} style={{
              flex: 1, padding: '0.7rem', borderRadius: 12, border: '2px dashed #ddd',
              background: newMedia && !newMediaIsVideo && !newMediaIsAudio ? '#e8f5e9' : '#fafafa',
              cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
              fontSize: '0.78rem', color: '#666',
            }}>
              <Image size={24} color={newMedia && !newMediaIsVideo ? '#4caf50' : '#999'} />
              {newMedia && !newMediaIsVideo && !newMediaIsAudio ? '✅ Foto' : '📸 Foto'}
            </button>
            <button type="button" onClick={() => videoRef.current?.click()} style={{
              flex: 1, padding: '0.7rem', borderRadius: 12, border: '2px dashed #ddd',
              background: newMediaIsVideo ? '#e8f5e9' : '#fafafa',
              cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
              fontSize: '0.78rem', color: '#666',
            }}>
              <Video size={24} color={newMediaIsVideo ? '#4caf50' : '#999'} />
              {newMediaIsVideo ? '✅ Vídeo' : '🎬 Vídeo'}
            </button>
            <button type="button" onClick={openMusicPicker} style={{
              flex: 1, padding: '0.7rem', borderRadius: 12,
              border: selectedSongUrl ? '2px solid #9b59b6' : '2px dashed #ddd',
              background: selectedSongUrl ? 'rgba(155,89,182,0.1)' : '#fafafa',
              cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
              fontSize: '0.78rem', color: selectedSongUrl ? '#9b59b6' : '#666', fontWeight: selectedSongUrl ? 700 : 400,
            }}>
              <Music size={24} color={selectedSongUrl ? '#9b59b6' : '#999'} />
              {selectedSongUrl ? '✅ Música' : '🎵 Música'}
            </button>
          </div>

          {/* Preview: Selected media */}
          {newMediaPreview && (
            <div style={{ position: 'relative', marginBottom: '0.5rem', borderRadius: 12, overflow: 'hidden' }}>
              {newMediaIsAudio ? (
                <div style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)', borderRadius: 12, padding: '1rem', textAlign: 'center' }}>
                  <span style={{ fontSize: '2rem' }}>🎵</span>
                  <p style={{ color: '#fff', fontSize: '0.85rem', margin: '0.5rem 0' }}>{selectedSongName || newMedia?.name || 'Música'}</p>
                  <audio src={newMediaPreview} controls style={{ width: '100%' }} />
                </div>
              ) : newMediaIsVideo ? (
                <video src={newMediaPreview} controls style={{ width: '100%', maxHeight: 280, borderRadius: 12 }} />
              ) : (
                <img src={newMediaPreview} alt="" style={{ width: '100%', maxHeight: 280, objectFit: 'cover', borderRadius: 12 }} />
              )}
              <button type="button" onClick={() => { setNewMedia(null); setNewMediaPreview(null); setNewMediaIsAudio(false); setNewMediaIsVideo(false); }} style={{
                position: 'absolute', top: 8, right: 8, background: 'rgba(0,0,0,0.6)', border: 'none',
                borderRadius: '50%', width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
              }}><X size={16} color="#fff" /></button>
            </div>
          )}

          {/* Auto-prompt: "Adicionar música?" after selecting photo/video */}
          {(newMedia && !newMediaIsAudio && !selectedSongUrl && !showMusicPicker) && (
            <button type="button" onClick={openMusicPicker} style={{
              width: '100%', padding: '0.7rem', borderRadius: 12, marginBottom: '0.5rem',
              border: '2px dashed #9b59b6', background: 'linear-gradient(135deg, rgba(155,89,182,0.05), rgba(102,126,234,0.05))',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              fontSize: '0.88rem', color: '#9b59b6', fontWeight: 600,
            }}>
              🎵 Quer adicionar uma música? Toque aqui!
            </button>
          )}

          {/* Selected music indicator */}
          {selectedSongUrl && (
            <div style={{
              background: 'linear-gradient(135deg, #667eea, #764ba2)', borderRadius: 12,
              padding: '0.6rem 1rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <span style={{ fontSize: '1.3rem' }}>🎵</span>
              <span style={{ color: '#fff', fontSize: '0.82rem', flex: 1 }}>{selectedSongName}</span>
              <button type="button" onClick={() => { setSelectedSongUrl(null); setSelectedSongName(''); }} style={{
                background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '50%', width: 24, height: 24,
                color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem',
              }}>✕</button>
            </div>
          )}

          {/* Music Picker — with tabs */}
          {showMusicPicker && (
            <div style={{
              background: '#fff', border: '2px solid #9b59b6', borderRadius: 14, padding: '1rem',
              marginBottom: '0.5rem',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <h4 style={{ margin: 0, fontSize: '0.95rem', color: '#9b59b6' }}>🎵 Escolha uma música</h4>
                <button type="button" onClick={() => setShowMusicPicker(false)} style={{
                  background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', color: '#999',
                }}>✕</button>
              </div>

              {/* Tabs */}
              <div style={{ display: 'flex', gap: 0, marginBottom: '0.75rem', borderRadius: 10, overflow: 'hidden', border: '1px solid #e0e0e0' }}>
                {[
                  { key: 'popular', label: '🔥 Gospel Popular' },
                  { key: 'library', label: '📚 Minha Biblioteca' },
                ].map(tab => (
                  <button type="button" key={tab.key} onClick={() => setMusicTab(tab.key)} style={{
                    flex: 1, padding: '0.5rem', border: 'none', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600,
                    background: musicTab === tab.key ? '#9b59b6' : '#fafafa',
                    color: musicTab === tab.key ? '#fff' : '#666',
                  }}>{tab.label}</button>
                ))}
              </div>

              {/* Popular Gospel Songs */}
              {musicTab === 'popular' && (
                <div style={{ maxHeight: 250, overflowY: 'auto' }}>
                  <p style={{ fontSize: '0.7rem', color: '#888', margin: '0 0 0.5rem' }}>
                    Músicas gospel mais tocadas do Brasil 🇧🇷
                  </p>
                  {popularGospel.map(song => (
                    <button type="button" key={song.id} onClick={() => { setSelectedSongUrl(song.url); setSelectedSongName(`${song.title} - ${song.artist}`); setShowMusicPicker(false); }} style={{
                      width: '100%', padding: '0.5rem 0.6rem', borderRadius: 10,
                      border: selectedSongUrl === song.url ? '2px solid #9b59b6' : '1px solid #eee',
                      background: selectedSongUrl === song.url ? 'rgba(155,89,182,0.1)' : '#fafafa',
                      cursor: 'pointer', marginBottom: 5, textAlign: 'left', display: 'flex', alignItems: 'center', gap: 10,
                    }}>
                      <div style={{
                        width: 34, height: 34, borderRadius: 8, background: 'linear-gradient(135deg, #ff0000, #cc0000)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '0.9rem',
                      }}>▶️</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: '0.82rem', color: '#1a0a3e' }}>{song.title}</div>
                        <div style={{ fontSize: '0.7rem', color: '#888' }}>{song.artist}</div>
                      </div>
                      {selectedSongUrl === song.url && <span style={{ color: '#9b59b6', fontWeight: 700 }}>✅</span>}
                    </button>
                  ))}
                </div>
              )}

              {/* Library Songs (user uploaded) */}
              {musicTab === 'library' && (
                <div style={{ maxHeight: 250, overflowY: 'auto' }}>
                  <p style={{ fontSize: '0.7rem', color: '#888', margin: '0 0 0.5rem' }}>
                    Músicas enviadas pela comunidade na página Música
                  </p>
                  {librarySongs.length === 0 ? (
                    <p style={{ color: '#999', fontSize: '0.85rem', textAlign: 'center', padding: '1rem' }}>Nenhuma música ainda. Vá em Música e envie!</p>
                  ) : librarySongs.map(song => (
                    <button type="button" key={song.id} onClick={() => selectLibrarySong(song)} style={{
                      width: '100%', padding: '0.5rem 0.6rem', borderRadius: 10,
                      border: selectedSongUrl === song.url ? '2px solid #9b59b6' : '1px solid #eee',
                      background: selectedSongUrl === song.url ? 'rgba(155,89,182,0.1)' : '#fafafa',
                      cursor: 'pointer', marginBottom: 5, textAlign: 'left', display: 'flex', alignItems: 'center', gap: 10,
                    }}>
                      <div style={{
                        width: 34, height: 34, borderRadius: 8, background: 'linear-gradient(135deg, #667eea, #764ba2)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                      }}>
                        <Music size={16} color="#fff" />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: '0.82rem', color: '#1a0a3e' }}>{song.title}</div>
                        <div style={{ fontSize: '0.7rem', color: '#888' }}>{song.artist || song.user_name}</div>
                      </div>
                      {selectedSongUrl === song.url && <span style={{ color: '#9b59b6', fontWeight: 700 }}>✅</span>}
                    </button>
                  ))}
                  <div style={{ borderTop: '1px solid #eee', paddingTop: '0.5rem', marginTop: '0.5rem' }}>
                    <button type="button" onClick={() => { setShowMusicPicker(false); audioRef.current?.click(); }} style={{
                      width: '100%', padding: '0.5rem', borderRadius: 10, border: '1px dashed #9b59b6',
                      background: 'transparent', cursor: 'pointer', fontSize: '0.82rem', color: '#9b59b6',
                    }}>📁 Enviar música do celular</button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Publish button */}
          <button type="submit" disabled={posting || (!newText.trim() && !newMedia && !selectedSongUrl)} style={{
            width: '100%', padding: '0.75rem', borderRadius: 14, border: 'none', marginTop: '0.25rem',
            background: (newText.trim() || newMedia || selectedSongUrl) ? 'linear-gradient(135deg, #daa520, #f4c542)' : '#ddd',
            color: (newText.trim() || newMedia || selectedSongUrl) ? '#1a0a3e' : '#999',
            fontWeight: 700, fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            boxShadow: (newText.trim() || newMedia || selectedSongUrl) ? '0 4px 15px rgba(218,165,32,0.3)' : 'none',
          }}><Send size={18} /> {posting ? 'Publicando...' : 'Publicar'}</button>
          <input ref={photoRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleMediaSelect} />
          <input ref={videoRef} type="file" accept="video/mp4,video/webm,video/quicktime" style={{ display: 'none' }} onChange={handleMediaSelect} />
          <input ref={audioRef} type="file" accept="audio/mpeg,audio/mp3,audio/wav,audio/ogg,audio/m4a,audio/*" style={{ display: 'none' }} onChange={handleMediaSelect} />
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
                  {isYouTube(post.media_url) ? (
                    <div style={{ borderRadius: 12, overflow: 'hidden', background: '#000' }}>
                      <iframe
                        src={`https://www.youtube.com/embed/${getYouTubeId(post.media_url)}?rel=0`}
                        style={{ width: '100%', height: 200, border: 'none' }}
                        allow="autoplay; encrypted-media"
                        allowFullScreen
                      />
                    </div>
                  ) : isAudio(post.media_url) ? (
                    <div style={{
                      background: 'linear-gradient(135deg, #667eea, #764ba2)', borderRadius: 12,
                      padding: '1rem', textAlign: 'center',
                    }}>
                      <span style={{ fontSize: '2rem' }}>🎵</span>
                      <audio src={getMediaUrl(post.media_url)} controls autoPlay loop style={{ width: '100%', marginTop: 8 }} />
                    </div>
                  ) : (post.media_type === 'video' || isVideo(post.media_url)) ? (
                    <video src={getMediaUrl(post.media_url)} controls playsInline autoPlay muted preload="metadata"
                      style={{ width: '100%', maxHeight: 500, background: '#000' }} />
                  ) : (
                    <img src={getMediaUrl(post.media_url)} alt="" style={{ width: '100%', maxHeight: 500, objectFit: 'cover' }} />
                  )}
                </div>
              )}
              {/* Audio attached to photo post */}
              {post.audio_url && (
                isYouTube(post.audio_url) ? (
                  <div style={{ borderRadius: 12, overflow: 'hidden', background: '#000' }}>
                    <iframe
                      src={`https://www.youtube.com/embed/${getYouTubeId(post.audio_url)}?autoplay=0&rel=0`}
                      style={{ width: '100%', height: 60, border: 'none' }}
                      allow="autoplay; encrypted-media"
                      allowFullScreen
                    />
                  </div>
                ) : (
                  <div style={{
                    background: 'linear-gradient(135deg, #667eea, #764ba2)', borderRadius: 12,
                    padding: '0.6rem 1rem', display: 'flex', alignItems: 'center', gap: 8,
                  }}>
                    <span style={{ fontSize: '1.3rem' }}>🎵</span>
                    <audio src={getMediaUrl(post.audio_url)} controls autoPlay style={{ flex: 1, height: 32 }} />
                  </div>
                )
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
                  const shareText = `${post.content?.slice(0, 200)}\n\n🙏 Sigo com Fé - Rede Social Cristã\nhttps://sigo-com-fe.vercel.app`;
                  if (navigator.share) navigator.share({ title: 'Sigo com Fé', text: shareText }).catch(() => {});
                  else { navigator.clipboard?.writeText(shareText); alert('Link copiado! ✅'); }
                }} style={{
                  background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4,
                  color: '#999', fontSize: '0.82rem', marginLeft: 'auto',
                }}>
                  <Share2 size={16} /> <span>Compartilhar</span>
                </button>

                {/* Delete own post */}
                {user && (post.author_id === user?.id || user?.role === 'admin') && (
                  <button onClick={() => handleDeletePost(post.id)} style={{
                    background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 3,
                    color: '#e74c3c', fontSize: '0.78rem',
                  }}>
                    <Trash2 size={14} /> Excluir
                  </button>
                )}

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
