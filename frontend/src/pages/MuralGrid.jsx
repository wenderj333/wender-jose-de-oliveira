import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { useWebSocket } from '../context/WebSocketContext';
import { Plus, Filter, X, Send, Heart, MessageCircle, Image, Video, Play, User, Share2, ChevronDown, Trash2, Music, Radio } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

const API_BASE = import.meta.env.VITE_API_URL || '';
const API = `${API_BASE}/api`;

const CATEGORIES_CONFIG = [
  { value: 'testemunho', labelKey: 'mural.testimony', color: '#daa520' },
  { value: 'louvor', labelKey: 'mural.worship', color: '#9b59b6' },
  { value: 'foto', labelKey: 'mural.photo', color: '#3498db' },
  { value: 'versiculo', labelKey: 'mural.verse', color: '#27ae60' },
  { value: 'reflexao', labelKey: 'mural.reflection', color: '#e67e22' },
  { value: 'campanha', labelKey: 'mural.campaign', color: '#e74c3c' },
];

function isAudio(url) {
  if (!url) return false;
  return /\.(mp3|wav|ogg|m4a|aac|flac)/i.test(url);
}

function isVideo(url) {
  if (!url) return false;
  if (isAudio(url)) return false;
  return /\.(mp4|webm|mov)/i.test(url) || url.includes('/video/') || url.includes('resource_type=video');
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

function getTimeAgo(dateStr, t) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return t('time.now', 'Agora');
  if (mins < 60) return t('time.minAgo', 'Há {{count}}min', { count: mins });
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return t('time.hoursAgo', 'Há {{count}}h', { count: hrs });
  const days = Math.floor(hrs / 24);
  return t('time.daysAgo', 'Há {{count}}d', { count: days });
}

export default function MuralGrid() {
  const { t } = useTranslation();
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const { liveStreams } = useWebSocket();
  
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [newText, setNewText] = useState('');
  const [newCategory, setNewCategory] = useState('testemunho');
  const [newMedia, setNewMedia] = useState(null);
  const [newMediaPreview, setNewMediaPreview] = useState(null);
  const [newMediaIsVideo, setNewMediaIsVideo] = useState(false);
  const [newMediaType, setNewMediaType] = useState(null); // 'photo' | 'video' | 'audio' | 'url'
  const [newMediaUrl, setNewMediaUrl] = useState(''); // Para URLs (YouTube, etc)
  const [selectedMusicUrl, setSelectedMusicUrl] = useState(''); // Música selecionada de "Minha Música"
  const [posting, setPosting] = useState(false);
  const [postingText, setPostingText] = useState('');
  const [likedPosts, setLikedPosts] = useState({});
  const [commentsData, setCommentsData] = useState({});
  const [commentText, setCommentText] = useState({});
  const [sendingComment, setSendingComment] = useState({});
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const [showMyMusicPicker, setShowMyMusicPicker] = useState(false);
  const [myMusic, setMyMusic] = useState([]);
  const [loadingMyMusic, setLoadingMyMusic] = useState(false);

  const photoRef = useRef(null);
  const videoRef = useRef(null);
  const audioRef = useRef(null);

  useEffect(() => {
    fetchPosts();
  }, []);

  async function fetchPosts() {
    try {
      const res = await fetch(`${API}/feed?limit=50`);
      const data = await res.json();
      const p = data.posts || [];
      setPosts(p);
      if (token) {
        try {
          const r = await fetch(`${API}/feed/liked-posts`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          const d = await r.json();
          const liked = {};
          (d.likedIds || []).forEach(id => { liked[id] = true; });
          setLikedPosts(liked);
        } catch {}
      }
    } catch (err) {
      console.error('Error fetching feed:', err);
    } finally {
      setLoading(false);
    }
  }

  async function fetchMyMusic() {
    if (!token) return;
    setLoadingMyMusic(true);
    try {
      const res = await fetch(`${API}/music`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const songs = Array.isArray(data.songs) ? data.songs : (data.songs?.rows || []);
      setMyMusic(songs || []);
    } catch (err) {
      console.warn('Error fetching my music:', err.message);
      setMyMusic([]);
    } finally {
      setLoadingMyMusic(false);
    }
  }

  function selectMyMusic(song) {
    setSelectedMusicUrl(song.url);
    setShowMyMusicPicker(false);
  }

  async function handleLike(postId) {
    if (!token) { setShowLoginPopup(true); return; }
    const wasLiked = likedPosts[postId];
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
      setLikedPosts(prev => ({ ...prev, [postId]: wasLiked }));
      setPosts(prev => prev.map(p => p.id === postId
        ? { ...p, like_count: Math.max(0, (p.like_count || 0) + (wasLiked ? 1 : -1)) }
        : p
      ));
    }
  }

  async function fetchComments(postId) {
    try {
      const res = await fetch(`${API}/feed/${postId}/comments`);
      const data = await res.json();
      setCommentsData(prev => ({ ...prev, [postId]: data.comments || [] }));
    } catch {
      setCommentsData(prev => ({ ...prev, [postId]: [] }));
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
    if (!confirm(t('common.deleteConfirm', 'Tem certeza que deseja excluir esta publicação?'))) return;
    try {
      const res = await fetch(`${API}/feed/${postId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setPosts(prev => prev.filter(p => p.id !== postId));
        setSelectedPost(null);
      }
    } catch (err) { console.error(err); }
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

  function handleMediaSelect(e, type) {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const isVid = file.type.startsWith('video/');
    const isAud = file.type.startsWith('audio/');
    
    setNewMedia(file);
    setNewMediaType(type); // 'photo', 'video', 'audio'
    setNewMediaIsVideo(isVid);
    
    if (isAud) {
      // Para áudio, mostrar nome do ficheiro em vez de preview
      setNewMediaPreview(file.name);
    } else if (isVid) {
      setNewMediaPreview(URL.createObjectURL(file));
    } else {
      // Foto
      const reader = new FileReader();
      reader.onload = () => setNewMediaPreview(reader.result);
      reader.readAsDataURL(file);
    }
  }

  async function uploadDirectToCloudinary(file) {
    const isVid = file.type.startsWith('video/');
    const isAud = file.type.startsWith('audio/');
    const resourceType = isAud ? 'video' : (isVid ? 'video' : 'image');

    // Check file size
    const maxSize = isVid ? 500 * 1024 * 1024 : (isAud ? 100 * 1024 * 1024 : 50 * 1024 * 1024);
    if (file.size > maxSize) {
      throw new Error(t('mural.fileTooLarge', { maxSize: maxSize / (1024 * 1024) }));
    }

    console.log(`📤 Starting upload: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB), type=${resourceType}`);

    // Show progress for large files
    if (file.size > 5 * 1024 * 1024) {
      setPostingText(t('mural.uploadingLarge', { filename: file.name }));
    } else {
      setPostingText(t('mural.uploading', { filename: file.name }));
    }

    const fd = new FormData();
    fd.append('file', file);
    fd.append('upload_preset', 'sigo_com_fe');
    fd.append('folder', 'sigo-com-fe/posts');
    fd.append('resource_type', resourceType);
    
    try {
      const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/degxiuf43/upload`, { 
        method: 'POST', 
        body: fd,
        signal: AbortSignal.timeout(600000) // 10 minutos timeout
      });
      
      if (!uploadRes.ok) {
        const errorData = await uploadRes.json().catch(() => ({}));
        throw new Error(`Cloudinary error ${uploadRes.status}: ${errorData.error?.message || uploadRes.statusText}`);
      }
      
      const result = await uploadRes.json();
      if (result.error) throw new Error(`Cloudinary: ${result.error.message}`);
      if (!result.secure_url) throw new Error('Sem URL retornada. Tente novamente.');
      
      console.log(`✅ Upload complete: ${result.secure_url}`);
      return { url: result.secure_url, type: resourceType };
    } catch (err) {
      console.error('❌ Upload error:', err);
      if (err.name === 'AbortError') {
        throw new Error(t('mural.uploadTooSlow'));
      }
      throw err;
    }
  }

  async function handlePost(e) {
    e.preventDefault();
    if (!token) {
      alert(t('mural.loginRequired'));
      return;
    }
    if (!newText.trim() && !newMedia && !newMediaUrl.trim()) {
      alert(t('mural.addContent'));
      return;
    }
    setPosting(true);
    setPostingText('');
    try {
      const formData = new FormData();
      let postContent = newText.trim();
      
      // Determine default content based on media type
      if (!postContent) {
        if (newMediaUrl) postContent = isYouTube(newMediaUrl) ? '🎬' : '🔗';
        else if (newMediaIsVideo) postContent = '🎬';
        else if (newMedia && isAudio(newMedia.type)) postContent = '🎵';
        else postContent = '📸';
      }
      
      console.log('Posting with content:', postContent, 'category:', newCategory, 'media:', newMedia ? newMedia.name : 'none', 'url:', newMediaUrl);
      formData.append('content', postContent);
      formData.append('category', newCategory);
      
      // Handle media upload
      if (newMedia) {
        try {
          const result = await uploadDirectToCloudinary(newMedia);
          console.log('✅ Upload successful:', { url: result.url, type: result.type });
          formData.append('media_url', result.url);
          formData.append('media_type', result.type);
        } catch (uploadErr) {
          alert(`❌ Erro no upload: ${uploadErr.message}`);
          throw uploadErr;
        }
      } else if (newMediaUrl.trim()) {
        console.log('🔗 Adding URL media:', newMediaUrl.trim());
        formData.append('media_url', newMediaUrl.trim());
        formData.append('media_type', 'video'); // YouTube e URLs tratadas como video
      }
      
      // Handle Minha Música (separadamente - pode ter vídeo + música)
      if (selectedMusicUrl) {
        formData.append('audio_url', selectedMusicUrl);
        if (!postContent || postContent === '📸') postContent = '🎵';
        formData.set('content', postContent);
      }

      const res = await fetch(`${API}/feed`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (!res.ok) {
        const errorText = await res.text();
        alert(`❌ Erro do servidor: ${res.status}\n${errorText}`);
        throw new Error(`Server error ${res.status}: ${errorText}`);
      }
      const data = await res.json();
      if (!data.post) {
        alert(`❌ Erro: O vídeo não foi guardado!\nResposta: ${JSON.stringify(data)}`);
        throw new Error('No post returned from server');
      }
      if (data.post) {
        data.post.author_name = user.full_name;
        data.post.author_avatar = user.avatar_url;
        data.post.like_count = 0;
        data.post.comment_count = 0;
        setPosts(prev => [data.post, ...prev]);
        
        // Reset form
        setNewText('');
        setNewMedia(null);
        setNewMediaPreview(null);
        setNewMediaIsVideo(false);
        setNewMediaType(null);
        setNewMediaUrl('');
        setSelectedMusicUrl('');
        setShowForm(false);
      }
    } catch (err) {
      console.error('Post error:', err);
      const msg = err.message || 'Tente novamente em alguns segundos.';
      if (msg.includes('File size') || msg.includes('too large')) {
        alert(t('mural.fileTooLargeSimple'));
      } else if (msg.includes('network') || msg.includes('fetch')) {
        alert(t('mural.networkError', '❌ Erro de conexão. Verifique sua internet.'));
      } else {
        alert('❌ Erro ao publicar: ' + msg);
      }
    } finally {
      setPosting(false);
      setPostingText('');
    }
  }

  const getMediaUrl = (url) => url ? (url.startsWith('http') ? url : `${API_BASE}${url}`) : null;
  const getAvatarUrl = (url) => url ? (url.startsWith('http') ? url : `${API_BASE}${url}`) : null;

  // Get thumb for grid (prioritize media_url, fallback to others)
  const getThumbnail = (post) => {
    if (post.media_url && post.media_type === 'image') return getMediaUrl(post.media_url);
    if (post.media_url && post.media_type === 'video') {
      // Try to get thumbnail from cloudinary
      if (post.media_url.includes('cloudinary')) {
        return post.media_url.replace('/upload/', '/upload/w_400,h_400,c_fill,q_auto/');
      }
      // Fallback: video icon
      return null;
    }
    if (post.audio_url || (post.media_url && isAudio(post.media_url))) {
      // Audio: return music icon
      return null;
    }
    // Fallback: generate emoji thumbnail based on category
    return null;
  };

  // Render media in modal (supports images, videos, audio, youtube)
  const renderModalMedia = (post) => {
    // Debug: Log what we're trying to render
    if (post.media_url) {
      console.log('🎬 renderModalMedia:', { 
        media_url: post.media_url, 
        media_type: post.media_type,
        isVideo: post.media_type === 'video',
        isAudio: post.media_type === 'audio'
      });
    }
    
    if (post.media_url && post.media_type === 'image') {
      return <img src={getMediaUrl(post.media_url)} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />;
    }
    if (post.media_url && post.media_type === 'video') {
      const videoUrl = getMediaUrl(post.media_url);
      const audioUrl = post.audio_url ? getMediaUrl(post.audio_url) : null;
      
      return (
        <div style={{ width: '100%', height: '100%', background: '#000', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
          {/* Áudio (para reproduzir música junto com vídeo) */}
          {audioUrl && (
            <audio 
              src={audioUrl} 
              controls
              style={{ position: 'absolute', bottom: 10, left: 10, width: 'calc(100% - 20px)', zIndex: 10 }}
            />
          )}
          
          <video 
            key={post.id}
            src={videoUrl} 
            controls 
            controlsList="nodownload"
            preload="metadata"
            style={{ 
              width: '100%', 
              height: '100%', 
              objectFit: 'contain', 
              maxWidth: '100%',
              maxHeight: '100%',
              display: 'block',
            }}
          />
        </div>
      );
    }
    if (post.media_url && isYouTube(post.media_url)) {
      const youtubeId = getYouTubeId(post.media_url);
      return (
        <iframe
          width="100%"
          height="100%"
          src={`https://www.youtube.com/embed/${youtubeId}`}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
        />
      );
    }
    if (post.audio_url || (post.media_url && isAudio(post.media_url))) {
      const audioUrl = post.audio_url || post.media_url;
      return (
        <div style={{
          width: '100%',
          height: '100%',
          background: 'linear-gradient(135deg, #667eea, #764ba2)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎵</div>
          <audio src={getMediaUrl(audioUrl)} controls style={{ width: '80%', maxWidth: '300px' }} />
        </div>
      );
    }
    // Fallback: emoji based on category
    const categoryInfo = CATEGORIES_CONFIG.find(c => c.value === post.category);
    return (
      <div style={{
        width: '100%',
        height: '100%',
        background: `linear-gradient(135deg, ${categoryInfo?.color || '#ddd'}22, ${categoryInfo?.color || '#ddd'}44)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '5rem',
      }}>
        {t(categoryInfo?.labelKey)?.split(' ')[0] || '📸'}
      </div>
    );
  };

  return (
    <div style={{ background: '#fafbfc', minHeight: '100vh', paddingBottom: '2rem' }}>
      {/* Header */}
      <div style={{
        padding: '1rem 1rem',
        background: '#fff',
        borderBottom: '1px solid #e0e0e0',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        position: 'sticky', top: 70, zIndex: 100,
      }}>
        <h1 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 700, color: '#1a0a3e' }}>📸 {t('nav.mural', 'Mural')}</h1>
        {user && (
          <button onClick={() => setShowForm(!showForm)} style={{
            padding: '0.5rem 1rem', borderRadius: 20, border: 'none',
            background: showForm ? '#e74c3c' : '#daa520', color: '#fff',
            fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
            fontSize: '0.9rem',
          }}>
            {showForm ? <X size={16} /> : <Plus size={16} />}
            {showForm ? t('common.cancel', 'Cancelar') : t('mural.publish', 'Publicar')}
          </button>
        )}
      </div>

      {/* New Post Form */}
      {showForm && user && (
        <div style={{
          background: '#fff',
          borderBottom: '1px solid #e0e0e0',
          padding: '1rem',
          maxWidth: '600px',
          margin: '0 auto',
        }}>
          {posting && (
            <div style={{
              background: 'linear-gradient(135deg, #f093fb, #f5576c)',
              color: '#fff',
              padding: '1rem',
              borderRadius: '10px',
              marginBottom: '1rem',
              textAlign: 'center',
              fontSize: '0.9rem',
            }}>
              <div style={{ fontWeight: 700, marginBottom: '0.5rem' }}>⏳ {postingText}</div>
              <div style={{ fontSize: '0.8rem', opacity: 0.9 }}>{t('mural.doNotClose')}</div>
            </div>
          )}
          <form onSubmit={handlePost}>
            {/* Categories */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: '0.75rem' }}>
              {CATEGORIES_CONFIG.map(cat => (
                <button type="button" key={cat.value} onClick={() => setNewCategory(cat.value)} style={{
                  padding: '4px 12px', borderRadius: 16, border: 'none', cursor: 'pointer', fontSize: '0.8rem',
                  background: newCategory === cat.value ? cat.color + '22' : '#f5f5f5',
                  color: newCategory === cat.value ? cat.color : '#666',
                  fontWeight: newCategory === cat.value ? 600 : 400,
                }}>{t(cat.labelKey)}</button>
              ))}
            </div>

            {/* Text */}
            <textarea value={newText} onChange={e => setNewText(e.target.value)}
              placeholder={t('mural.placeholder', 'Compartilhe algo com a comunidade...')}
              rows={2} style={{
                width: '100%', padding: '0.7rem', borderRadius: 10, border: '1px solid #ddd',
                fontSize: '0.9rem', resize: 'vertical', boxSizing: 'border-box', marginBottom: '0.5rem',
              }} />

            {/* Media buttons - Instagram style */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 6, marginBottom: '1rem' }}>
              <button type="button" onClick={() => photoRef.current?.click()} style={{
                padding: '0.8rem', borderRadius: 12, border: '2px solid #e0e0e0',
                background: newMediaType === 'photo' ? '#f0f0f0' : '#fff',
                cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                fontSize: '0.75rem', color: '#666', fontWeight: newMediaType === 'photo' ? 600 : 400,
                transition: 'all 0.2s',
              }}>
                <span style={{ fontSize: '1.5rem' }}>📸</span>
                {t('media.photo', 'Foto')}
              </button>
              <button type="button" onClick={() => videoRef.current?.click()} style={{
                padding: '0.8rem', borderRadius: 12, border: '2px solid #e0e0e0',
                background: newMediaType === 'video' ? '#f0f0f0' : '#fff',
                cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                fontSize: '0.75rem', color: '#666', fontWeight: newMediaType === 'video' ? 600 : 400,
              }}>
                <span style={{ fontSize: '1.5rem' }}>🎬</span>
                {t('media.video', 'Vídeo')}
              </button>
              <button type="button" onClick={() => audioRef.current?.click()} style={{
                padding: '0.8rem', borderRadius: 12, border: '2px solid #e0e0e0',
                background: newMediaType === 'audio' ? '#f0f0f0' : '#fff',
                cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                fontSize: '0.75rem', color: '#666', fontWeight: newMediaType === 'audio' ? 600 : 400,
              }}>
                <span style={{ fontSize: '1.5rem' }}>🎵</span>
                {t('media.audio', 'Áudio')}
              </button>
              <button type="button" onClick={() => { fetchMyMusic(); setShowMyMusicPicker(true); }} style={{
                padding: '0.8rem', borderRadius: 12, border: '2px solid #e0e0e0',
                background: newMediaType === 'mymusic' ? '#f0f0f0' : '#fff',
                cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                fontSize: '0.75rem', color: '#666', fontWeight: newMediaType === 'mymusic' ? 600 : 400,
              }}>
                <span style={{ fontSize: '1.5rem' }}>🎸</span>
                Minha Música
              </button>
              <button type="button" onClick={() => {
                const url = prompt(t('media.urlPrompt', 'Cole a URL (YouTube, Vimeo, etc):'));
                if (url) { setNewMediaUrl(url); setNewMediaType('url'); }
              }} style={{
                padding: '0.8rem', borderRadius: 12, border: '2px solid #e0e0e0',
                background: newMediaType === 'url' ? '#f0f0f0' : '#fff',
                cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                fontSize: '0.75rem', color: '#666', fontWeight: newMediaType === 'url' ? 600 : 400,
              }}>
                <span style={{ fontSize: '1.5rem' }}>🔗</span>
                {t('media.url', 'URL')}
              </button>
            </div>

            {/* URL Input */}
            {newMediaType === 'url' && (
              <div style={{ marginBottom: '0.5rem' }}>
                <input
                  type="text"
                  value={newMediaUrl}
                  onChange={e => setNewMediaUrl(e.target.value)}
                  placeholder={t('media.urlPlaceholder', 'Cole a URL de YouTube ou outro vídeo...')}
                  style={{
                    width: '100%', padding: '0.7rem', borderRadius: 10, border: '2px solid #daa520',
                    fontSize: '0.9rem', boxSizing: 'border-box', marginBottom: '0.5rem',
                    background: '#fffbf0',
                  }}
                />
                <button type="button" onClick={() => { setNewMediaUrl(''); setNewMediaType(null); }} style={{
                  fontSize: '0.75rem', color: '#e74c3c', background: 'none', border: 'none',
                  cursor: 'pointer', padding: '0.25rem',
                }}>{t('media.clearUrl', 'Limpar URL')}</button>
              </div>
            )}

            {/* Preview */}
            {newMediaPreview && newMediaType !== 'audio' && (
              <div style={{ position: 'relative', marginBottom: '0.5rem', borderRadius: 12, overflow: 'hidden' }}>
                {newMediaType === 'video' ? (
                  <video src={newMediaPreview} controls style={{ width: '100%', maxHeight: 280, borderRadius: 12 }} />
                ) : newMediaType === 'url' && isYouTube(newMediaUrl) ? (
                  <div style={{ background: '#000', borderRadius: 12, padding: '1rem', textAlign: 'center' }}>
                    <span style={{ color: '#fff', fontSize: '0.9rem' }}>🎬 {t('media.youtubePreview', 'YouTube (preview indisponível)')}</span>
                  </div>
                ) : (
                  <img src={newMediaPreview} alt="" style={{ width: '100%', maxHeight: 280, objectFit: 'cover', borderRadius: 12 }} />
                )}
                <button type="button" onClick={() => { setNewMedia(null); setNewMediaPreview(null); setNewMediaType(null); }} style={{
                  position: 'absolute', top: 8, right: 8, background: '#e74c3c', border: 'none',
                  borderRadius: '6px', padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', 
                  cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600, color: '#fff', gap: 4,
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#c0392b'; e.currentTarget.style.transform = 'scale(1.05)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = '#e74c3c'; e.currentTarget.style.transform = 'scale(1)'; }}
                ><X size={14} /> {t('common.delete', 'Apagar')}</button>
              </div>
            )}

            {/* Audio preview */}
            {newMediaPreview && newMediaType === 'audio' && (
              <div style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)', borderRadius: 12, padding: '1rem', marginBottom: '0.5rem', textAlign: 'center' }}>
                <div style={{ color: '#fff', fontSize: '1.5rem', marginBottom: '0.5rem' }}>🎵</div>
                <div style={{ color: '#fff', fontSize: '0.85rem', marginBottom: '1rem', wordBreak: 'break-word' }}>{newMediaPreview}</div>
                <button type="button" onClick={() => { setNewMedia(null); setNewMediaPreview(null); setNewMediaType(null); }} style={{
                  background: '#e74c3c', border: 'none', color: '#fff', borderRadius: 6, padding: '0.5rem 1rem',
                  cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#c0392b'; e.currentTarget.style.transform = 'scale(1.05)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = '#e74c3c'; e.currentTarget.style.transform = 'scale(1)'; }}
                >🗑️ {t('common.delete', 'Apagar')}</button>
              </div>
            )}

            {/* My Music preview */}
            {selectedMusicUrl && (
              <div style={{ background: 'linear-gradient(135deg, #9b59b6, #667eea)', borderRadius: 12, padding: '1rem', marginBottom: '0.5rem', textAlign: 'center' }}>
                <div style={{ color: '#fff', fontSize: '1.5rem', marginBottom: '0.5rem' }}>🎸</div>
                <div style={{ color: '#fff', fontSize: '0.85rem', marginBottom: '1rem', wordBreak: 'break-word' }}>🎵 Música da biblioteca pessoal (reproduzida com o post)</div>
                <button type="button" onClick={() => { setSelectedMusicUrl(''); }} style={{
                  background: '#e74c3c', border: 'none', color: '#fff', borderRadius: 6, padding: '0.5rem 1rem',
                  cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#c0392b'; e.currentTarget.style.transform = 'scale(1.05)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = '#e74c3c'; e.currentTarget.style.transform = 'scale(1)'; }}
                >🗑️ {t('common.delete', 'Apagar')}</button>
              </div>
            )}

            <button type="submit" disabled={posting || (!newText.trim() && !newMedia && !newMediaUrl.trim())} style={{
              width: '100%', padding: '0.75rem', borderRadius: 14, border: 'none',
              background: (newText.trim() || newMedia || newMediaUrl.trim()) && !posting ? 'linear-gradient(135deg, #daa520, #f4c542)' : '#ddd',
              color: (newText.trim() || newMedia || newMediaUrl.trim()) && !posting ? '#1a0a3e' : '#999',
              fontWeight: 700, cursor: posting ? 'not-allowed' : 'pointer', fontSize: '0.95rem',
              opacity: posting ? 0.7 : 1,
            }}>
              {posting ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                  <div style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid #999', borderTopColor: '#daa520', animation: 'spin 1s linear infinite' }} />
                  {postingText || t('common.publishing', 'Publicando...')}
                </div>
              ) : t('mural.publish', 'Publicar')}
            </button>
            
            <input ref={photoRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => handleMediaSelect(e, 'photo')} />
            <input ref={videoRef} type="file" accept="video/mp4,video/webm,video/quicktime" style={{ display: 'none' }} onChange={(e) => handleMediaSelect(e, 'video')} />
            <input ref={audioRef} type="file" accept="audio/mp3,audio/mpeg,audio/wav,audio/ogg,audio/m4a,audio/*" style={{ display: 'none' }} onChange={(e) => handleMediaSelect(e, 'audio')} />
          </form>
        </div>
      )}

      {/* Posts Grid - Instagram style (3 columns) */}
      <div style={{
        maxWidth: '100%',
        margin: '0 auto',
        padding: '0.5rem',
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '8px',
        marginTop: '1rem',
      }}
      className="mural-grid">
      
        {loading ? (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '2rem' }}>
            <div style={{ display: 'inline-block', width: 40, height: 40, borderRadius: '50%', border: '3px solid #ddd', borderTopColor: '#daa520', animation: 'spin 1s linear infinite' }} />
          </div>
        ) : posts.length === 0 ? (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '2rem' }}>
            <p style={{ color: '#999', fontSize: '0.95rem' }}>{t('mural.noPosts', 'Nenhum post ainda. Seja o primeiro a publicar! 📸')}</p>
          </div>
        ) : (
          posts.map(post => {
            const thumbnail = getThumbnail(post);
            const categoryInfo = CATEGORIES_CONFIG.find(c => c.value === post.category);

            return (
              <div
                key={post.id}
                onClick={() => {
                  setSelectedPost(post);
                  if (!commentsData[post.id]) fetchComments(post.id);
                }}
                style={{
                  position: 'relative',
                  aspectRatio: '1',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  background: '#f0f0f0',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.02)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                }}
              >
                {/* Thumbnail */}
                {thumbnail ? (
                  <img src={thumbnail} alt="" style={{
                    width: '100%', height: '100%', objectFit: 'cover',
                  }} />
                ) : (
                  <div style={{
                    width: '100%', height: '100%',
                    background: `linear-gradient(135deg, ${categoryInfo?.color || '#ddd'}22, ${categoryInfo?.color || '#ddd'}44)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '3rem',
                  }}>
                    {categoryInfo?.label?.split(' ')[0] || '📸'}
                  </div>
                )}

                {/* Overlay with stats */}
                <div style={{
                  position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                  background: 'rgba(0,0,0,0)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  gap: '1.5rem',
                  fontSize: '0.9rem',
                  color: '#fff',
                  fontWeight: 700,
                  textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                  opacity: 0,
                  transition: 'all 0.2s',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Heart size={18} fill="white" /> {post.like_count || 0}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <MessageCircle size={18} /> {post.comment_count || 0}
                  </div>
                </div>

                {/* Hover state with darker overlay */}
                <div style={{
                  position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                  background: 'rgba(0,0,0,0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  gap: '1.5rem',
                  fontSize: '1.2rem',
                  color: '#fff',
                  fontWeight: 700,
                  opacity: 0,
                  transition: 'opacity 0.2s',
                  pointerEvents: 'none',
                }} className="instagram-grid-hover" />
              </div>
            );
          })
        )}
      </div>

      {/* Modal - My Music Picker */}
      {showMyMusicPicker && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.7)', zIndex: 9999,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '1rem',
        }} onClick={() => setShowMyMusicPicker(false)}>
          <div style={{
            background: '#1a1a2e', borderRadius: '16px',
            maxWidth: '500px', width: '100%', maxHeight: '80vh', overflow: 'hidden',
            display: 'flex', flexDirection: 'column',
            boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{
              padding: '1rem', borderBottom: '1px solid rgba(218,165,32,0.2)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <h3 style={{ margin: 0, color: '#fff', fontSize: '1.1rem' }}>🎵 Minha Música</h3>
              <button onClick={() => setShowMyMusicPicker(false)} style={{
                background: 'none', border: 'none', fontSize: '1.3rem', cursor: 'pointer', color: '#daa520',
              }}>✕</button>
            </div>
            
            <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
              {loadingMyMusic ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#aaa' }}>{t('mural.loading')}</div>
              ) : myMusic.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#aaa' }}>{t('mural.noMusicUploaded')}</div>
              ) : (
                myMusic.map((song) => (
                  <button
                    key={song.id || song.url}
                    onClick={() => selectMyMusic(song)}
                    style={{
                      width: '100%', padding: '0.75rem', marginBottom: '0.5rem',
                      background: 'rgba(218,165,32,0.1)', border: '1px solid rgba(218,165,32,0.3)',
                      borderRadius: '8px', cursor: 'pointer', textAlign: 'left', color: '#fff',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(218,165,32,0.2)';
                      e.currentTarget.style.borderColor = '#daa520';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(218,165,32,0.1)';
                      e.currentTarget.style.borderColor = 'rgba(218,165,32,0.3)';
                    }}
                  >
                    <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>🎵 {song.title || song.name || 'Sem título'}</div>
                    <div style={{ fontSize: '0.8rem', color: '#aaa', marginTop: '0.25rem' }}>{song.artist || song.user_name || 'Seu upload'}</div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal - Post Detail (Dark Mode) */}
      {selectedPost && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.7)', zIndex: 10000,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '1rem',
          overflowY: 'auto',
        }} onClick={() => setSelectedPost(null)}>
          <div className="modal-detail" style={{
            background: '#1a1a2e', borderRadius: '16px',
            maxWidth: '700px', width: '100%', maxHeight: '90vh', overflow: 'hidden',
            display: 'grid', gridTemplateColumns: '1fr 350px', gap: 0,
            boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
          }} onClick={(e) => e.stopPropagation()}>
            {/* Left: Image/Video/Audio/YouTube */}
            <div style={{
              background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center',
              overflow: 'hidden', minHeight: '400px', position: 'relative',
              flex: 1,
            }}>
              {renderModalMedia(selectedPost)}
            </div>

            {/* Right: Details + Comments */}
            <div style={{
              display: 'flex', flexDirection: 'column',
              background: '#1a1a2e', overflowY: 'auto', color: '#fff',
            }}>
              {/* Header */}
              <div style={{
                padding: '1rem', borderBottom: '1px solid rgba(218,165,32,0.2)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <img src={getAvatarUrl(selectedPost.author_avatar) || '/default-avatar.jpg'} alt="" style={{
                    width: 32, height: 32, borderRadius: '50%', objectFit: 'cover', background: '#daa520',
                  }} />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#fff' }}>
                      {selectedPost.author_name || t('common.user', 'Utilizador')}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#aaa' }}>{getTimeAgo(selectedPost.created_at, t)}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  {user?.id === selectedPost.user_id && (
                    <button onClick={() => {
                      if (confirm(t('mural.confirmDelete', 'Tem a certeza que quer deletar este post?'))) {
                        handleDeletePost(selectedPost.id);
                      }
                    }} style={{
                      background: 'none', border: 'none', cursor: 'pointer', color: '#e74c3c',
                      fontSize: '1.1rem', padding: '4px 8px', display: 'flex', alignItems: 'center',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.opacity = '0.7'}
                    onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                    title={t('mural.delete', 'Deletar post')}>
                      <Trash2 size={18} />
                    </button>
                  )}
                  <button onClick={() => setSelectedPost(null)} style={{
                    background: 'none', border: 'none', fontSize: '1.3rem', cursor: 'pointer', color: '#daa520',
                  }}>✕</button>
                </div>
              </div>

              {/* Post Content */}
              <div style={{ padding: '1rem', borderBottom: '1px solid rgba(218,165,32,0.2)', flex: 1, overflowY: 'auto' }}>
                <p style={{ margin: 0, fontSize: '0.95rem', color: '#fff', lineHeight: 1.6, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                  {selectedPost.content || t('common.noText', '(Sem texto)')}
                </p>
              </div>

              {/* Like + Comment buttons */}
              <div style={{
                display: 'flex', gap: 0, borderBottom: '1px solid rgba(218,165,32,0.2)',
                padding: '0.5rem',
              }}>
                <button onClick={() => handleLike(selectedPost.id)} style={{
                  flex: 1, padding: '0.6rem', border: 'none', background: 'none',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  fontSize: '0.85rem', color: likedPosts[selectedPost.id] ? '#e74c3c' : '#aaa',
                  fontWeight: likedPosts[selectedPost.id] ? 600 : 400,
                  transition: 'all 0.2s',
                }}>
                  <Heart size={18} fill={likedPosts[selectedPost.id] ? '#e74c3c' : 'none'} />
                  {selectedPost.like_count || 0}
                </button>
                <button style={{
                  flex: 1, padding: '0.6rem', border: 'none', background: 'none',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  fontSize: '0.85rem', color: '#aaa',
                }}>
                  <MessageCircle size={18} />
                  {selectedPost.comment_count || 0}
                </button>
              </div>

              {/* Comments */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '0.5rem' }}>
                {(commentsData[selectedPost.id] || []).map(comment => (
                  <div key={comment.id} style={{
                    padding: '0.6rem', marginBottom: '0.5rem', borderRadius: 8,
                    background: 'rgba(218,165,32,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
                  }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: '0.8rem', color: '#daa520' }}>
                        {comment.author_name || t('common.user', 'Utilizador')}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#ccc', marginTop: 2 }}>{comment.content}</div>
                    </div>
                    {(user?.id === comment.user_id || user?.id === selectedPost.user_id) && (
                      <button onClick={() => handleDeleteComment(comment.id, selectedPost.id)} style={{
                        background: 'none', border: 'none', color: '#e74c3c', cursor: 'pointer',
                        fontSize: '0.7rem', padding: '2px 6px',
                      }}>✕</button>
                    )}
                  </div>
                ))}
              </div>

              {/* Comment input */}
              {user ? (
                <div style={{
                  padding: '0.75rem', borderTop: '1px solid rgba(218,165,32,0.2)',
                  display: 'flex', gap: 6,
                }}>
                  <input
                    type="text"
                    value={commentText[selectedPost.id] || ''}
                    onChange={(e) => setCommentText(prev => ({ ...prev, [selectedPost.id]: e.target.value }))}
                    placeholder={t('mural.commentPlaceholder', 'Escreva um comentário...')}
                    style={{
                      flex: 1, padding: '0.6rem', borderRadius: 20, border: '1px solid rgba(218,165,32,0.3)',
                      fontSize: '0.8rem', outline: 'none',
                      background: 'rgba(218,165,32,0.05)', color: '#fff',
                    }}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendComment(selectedPost.id)}
                  />
                  <button onClick={() => handleSendComment(selectedPost.id)} disabled={sendingComment[selectedPost.id]} style={{
                    background: '#daa520', border: 'none', borderRadius: '50%', width: 32, height: 32,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                    color: '#1a0a3e', fontWeight: 600,
                  }}>
                    <Send size={16} />
                  </button>
                </div>
              ) : (
                <div style={{
                  padding: '0.75rem', borderTop: '1px solid rgba(218,165,32,0.2)', textAlign: 'center',
                }}>
                  <button onClick={() => navigate('/login')} style={{
                    padding: '0.6rem 1rem', borderRadius: 20, border: 'none',
                    background: '#daa520', color: '#1a0a3e', fontWeight: 600, cursor: 'pointer',
                    fontSize: '0.8rem',
                  }}>{t('common.loginToComment', 'Entrar para comentar')}</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .instagram-grid-hover {
          background: rgba(0,0,0,0.3);
          opacity: 0;
          transition: opacity 0.2s;
        }
        .mural-grid {
          grid-template-columns: repeat(3, 1fr) !important;
        }
        @media (max-width: 1024px) {
          .mural-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
        @media (max-width: 768px) {
          .mural-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 6px !important;
          }
          .modal-detail {
            grid-template-columns: 1fr !important;
          }
        }
        @media (max-width: 480px) {
          .mural-grid {
            grid-template-columns: repeat(1, 1fr) !important;
            gap: 4px !important;
          }
          .modal-detail {
            max-width: 95vw !important;
            max-height: 95vh !important;
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
