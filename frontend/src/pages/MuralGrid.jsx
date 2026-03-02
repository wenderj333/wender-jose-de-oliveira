import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, X, Send, Image, Video, Music, Heart, MessageCircle, Share2, Play, Pause, BookOpen, Trash2, Grid, List, Volume2, VolumeX, Languages } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const API_BASE = import.meta.env.VITE_API_URL || '';
const API = `${API_BASE}/api`;
const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'degxiuf43';
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'sigo_com_fe';

async function uploadToCloudinary(file) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
  const resourceType = file.type.startsWith('video') ? 'video' : file.type.startsWith('audio') ? 'video' : 'auto';
  const url = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/${resourceType}/upload`;
  const res = await fetch(url, { method: 'POST', body: formData });
  if (!res.ok) throw new Error('mural.uploadErrorCloudinary');
  const data = await res.json();
  return data.secure_url;
}

const CATEGORIES_CONFIG = [
  { value: 'testemunho', labelKey: 'mural.categories.testemunho', color: '#f97316' },
  { value: 'louvor',     labelKey: 'mural.categories.louvor',     color: '#a855f7' },
  { value: 'reflexao',   labelKey: 'mural.categories.reflexao',   color: '#3b82f6' },
  { value: 'versiculo',  labelKey: 'mural.categories.versiculo',  color: '#22c55e' },
  { value: 'foto',       labelKey: 'mural.categories.foto',       color: '#f43f5e' },
];

const getCatColor = (type) => CATEGORIES_CONFIG.find(c => c.value === type)?.color || '#888';

function MiniAudioPlayer({ src, isPlaying: propIsPlaying, onPlay: externalOnPlay, onPause: externalOnPause, onEnded: externalOnEnded }) {
  const { t } = useTranslation();
  const audioRef = useRef(null);
  const [internalPlaying, setInternalPlaying] = useState(false);
  const playing = propIsPlaying !== undefined ? propIsPlaying : internalPlaying;
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (audioRef.current) {
      if (playing) audioRef.current.play().catch(e => console.error("Error playing audio:", e));
      else audioRef.current.pause();
    }
  }, [playing]);

  const toggle = async () => {
    if (!audioRef.current) return;
    if (propIsPlaying !== undefined) return;
    try {
      if (internalPlaying) audioRef.current.pause();
      else await audioRef.current.play();
      setInternalPlaying(!internalPlaying);
    } catch (err) { console.error(err); }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current?.duration) {
      setProgress((audioRef.current.currentTime / audioRef.current.duration) * 100);
    }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(102,126,234,0.12)', border: '1px solid rgba(102,126,234,0.3)', borderRadius: 12, padding: '10px 14px', marginTop: 10 }}>
      <audio ref={audioRef} src={src} onTimeUpdate={handleTimeUpdate} onEnded={() => { setInternalPlaying(false); setProgress(0); externalOnEnded && externalOnEnded(); }} onPlay={() => { setInternalPlaying(true); externalOnPlay && externalOnPlay(); }} onPause={() => { setInternalPlaying(false); externalOnPause && externalOnPause(); }} preload="metadata" />
      <button onClick={toggle} style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg,#667eea,#764ba2)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', flexShrink: 0 }}>
        {playing ? <Pause size={16} /> : <Play size={16} />}
      </button>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 11, color: '#888', marginBottom: 4 }}>{t('mural.musicLibrary')}</div>
        <div style={{ height: 4, background: '#e2e8f0', borderRadius: 2 }}>
          <div style={{ width: `${progress}%`, height: '100%', background: 'linear-gradient(90deg,#667eea,#764ba2)', transition: 'width 0.1s' }} />
        </div>
      </div>
    </div>
  );
}

function PostCard({ post, onLike, onDelete, token, user, isPlaying, onVideoPlay, onVideoPause }) {
  const { t, i18n } = useTranslation();
  const color = getCatColor(post.category || post.type);
  const [showComments, setShowComments] = useState(false);
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState(post.comments || []);
  
  const [translatedContent, setTranslatedContent] = useState(null);
  const [translating, setTranslating] = useState(false);
  const [showTranslation, setShowTranslation] = useState(false);

  const authorName = post.full_name || post.author_name || post.authorName || t('common.user');
  const authorInitials = authorName.slice(0, 2).toUpperCase();
  const mediaUrl = post.media_url || post.mediaUrl;
  const musicUrl = post.audio_url || post.musicUrl;
  const isOwner = user && (user.id === post.author_id || user.id === post.user_id);

  const videoRef = useRef(null);
  const [isMuted, setIsMuted] = useState(true);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const postCardRef = useRef(null);

  const isVideo = mediaUrl && mediaUrl.match(/\.(mp4|webm|mov|ogg)(\?|$)/i);
  const isImage = mediaUrl && !mediaUrl.match(/\.(mp4|webm|mov|ogg|mp3|wav|aac|m4a)(\?|$)/i);

  useEffect(() => {
    if (videoRef.current && isVideo) {
      videoRef.current.muted = isMuted;
      if (isPlaying) {
        videoRef.current.play().catch(e => console.error("Error playing video:", e));
        if (!isMuted) videoRef.current.volume = musicUrl ? 0.3 : 1.0;
        if (musicUrl) setIsMusicPlaying(true);
      } else {
        videoRef.current.pause();
        if (musicUrl) setIsMusicPlaying(false);
      }
    }
  }, [isPlaying, isVideo, musicUrl, isMuted]);

  useEffect(() => {
    if (!postCardRef.current || !musicUrl || !isImage) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsMusicPlaying(true);
        else setIsMusicPlaying(false);
      },
      { threshold: 0.7 }
    );
    observer.observe(postCardRef.current);
    return () => observer.disconnect();
  }, [musicUrl, isImage]);

  const handleTranslate = async () => {
    if (showTranslation) { setShowTranslation(false); return; }
    if (translatedContent) { setShowTranslation(true); return; }

    setTranslating(true);
    try {
      // Truncate to 500 chars to avoid API error
      const textToTranslate = post.content.length > 500 ? post.content.substring(0, 500) : post.content;
      const res = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(textToTranslate)}&langpair=pt|${i18n.language}`);
      const data = await res.json();
      if (data.responseData && data.responseData.translatedText) {
        let text = data.responseData.translatedText;
        if (post.content.length > 500) text += '...';
        setTranslatedContent(text);
        setShowTranslation(true);
      } else if (data.responseStatus === 403 || data.responseDetails.includes('LIMIT')) {
         setTranslatedContent(t('mural.translationLimit', 'Tradução indisponível (texto muito longo)'));
         setShowTranslation(true);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setTranslating(false);
    }
  };

  const handleShare = () => {
    const shareText = `${t('mural.checkPost', 'Olha este post incrível no Sigo com Fé!')}\n\n"${post.content?.substring(0, 50)}..."`;
    if (navigator.share) {
      navigator.share({
        title: 'Sigo com Fé',
        text: shareText,
        url: window.location.href
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(`${shareText}\n${window.location.href}`);
      alert(t('common.linkCopied'));
    }
  };

  const handleInternalVideoPlay = () => onVideoPlay(post.id);
  const handleInternalVideoPause = () => onVideoPause(post.id);
  const toggleMute = () => {
    setIsMuted(prev => !prev);
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      if (!isMuted) videoRef.current.volume = musicUrl ? 0.3 : 1.0;
      else videoRef.current.volume = 0;
    }
  };

  const submitComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    try {
      const res = await fetch(`${API}/feed/${post.id}/comments`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: comment })
      });
      const data = await res.json();
      if (data.comment) setComments([...comments, data.comment]);
      setComment('');
    } catch (e) {
      setComments([...comments, { id: Date.now(), content: comment, full_name: user?.full_name || t('common.user') }]);
      setComment('');
    }
  };

  return (
    <div ref={postCardRef} style={{ background: 'white', borderRadius: 16, border: `1px solid ${color}33`, overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', marginBottom: 16 }}>
      <div style={{ padding: '14px 16px 10px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 42, height: 42, borderRadius: '50%', background: `linear-gradient(135deg,${color},${color}88)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: 14, flexShrink: 0 }}>
          {authorInitials}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600, fontSize: 14, color: '#1a1a2e' }}>{authorName}</div>
          <div style={{ fontSize: 12, color: '#888' }}>{post.church || ''}{post.church ? ' · ' : ''}{post.created_at ? new Date(post.created_at).toLocaleDateString(t('locale')) : t('time.now')}</div>
        </div>
        <span style={{ fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 20, background: `${color}18`, color, border: `1px solid ${color}44` }}>
          {CATEGORIES_CONFIG.find(c => c.value === (post.category || post.type))?.labelKey ? t(CATEGORIES_CONFIG.find(c => c.value === (post.category || post.type)).labelKey) : (post.category || post.type)}
        </span>
        {isOwner && (
          <button onClick={() => onDelete(post.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ccc', padding: 4, borderRadius: 6 }} onMouseEnter={e => e.currentTarget.style.color = '#e11d48'} onMouseLeave={e => e.currentTarget.style.color = '#ccc'}>
            <Trash2 size={16} />
          </button>
        )}
      </div>

      {isVideo && (
        <div style={{ background: '#000', position: 'relative' }}>
          <video ref={videoRef} src={mediaUrl} controls playsInline muted={isMuted} style={{ width: '100%', maxHeight: 400, objectFit: 'contain', display: 'block' }} onPlay={handleInternalVideoPlay} onPause={handleInternalVideoPause} />
          <button onClick={toggleMute} style={{ position: 'absolute', top: 10, right: 10, background: 'rgba(0,0,0,0.5)', border: 'none', borderRadius: '50%', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', cursor: 'pointer', zIndex: 10 }}>
            {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </button>
        </div>
      )}
      {isImage && (
        <div style={{ width: '100%', maxHeight: 400, overflow: 'hidden' }}>
          <img src={mediaUrl} alt="post" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        </div>
      )}

      <div style={{ padding: '12px 16px' }}>
        {(post.category || post.type) === 'versiculo' ? (
          <div style={{ background: `linear-gradient(135deg,${color}12,white)`, borderLeft: `4px solid ${color}`, borderRadius: 8, padding: '12px 14px' }}>
            <p style={{ fontStyle: 'italic', color: '#333', fontSize: 15, lineHeight: 1.6, margin: 0 }}>"{post.content}"</p>
            {post.verse_reference && <p style={{ fontWeight: 700, color, marginTop: 8, marginBottom: 0, fontSize: 13 }}>— {post.verse_reference}</p>}
          </div>
        ) : (
          <div>
            <p style={{ color: '#333', fontSize: 14, lineHeight: 1.65, margin: 0 }}>{post.content}</p>
            {showTranslation && (
              <div style={{ marginTop: 8, padding: 10, background: '#f0f9ff', borderRadius: 8, fontSize: 13, color: '#0369a1', borderLeft: '3px solid #0ea5e9' }}>
                🌍 {translatedContent}
              </div>
            )}
          </div>
        )}
        {musicUrl && <MiniAudioPlayer src={musicUrl} isPlaying={isMusicPlaying} />}
      </div>

      <div style={{ padding: '8px 16px 12px', borderTop: '1px solid #f0f0f0', display: 'flex', gap: 8, alignItems: 'center' }}>
        <button onClick={() => onLike(post.id)} style={{ display: 'flex', alignItems: 'center', gap: 6, background: post.liked ? '#fff0f3' : 'none', border: post.liked ? '1px solid #fecdd3' : 'none', cursor: 'pointer', color: post.liked ? '#e11d48' : '#888', fontSize: 13, fontWeight: 700, padding: '6px 12px', borderRadius: 20, transition: 'all 0.2s' }}>
          <Heart size={18} fill={post.liked ? '#e11d48' : 'none'} />
          {post.like_count || post.amemCount || 0} {t('mural.amen', 'Amém')}
        </button>
        <button onClick={() => setShowComments(!showComments)} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', color: '#888', fontSize: 13, fontWeight: 600, padding: '6px 10px', borderRadius: 8 }}>
          <MessageCircle size={18} /> {post.comment_count || post.commentCount || comments.length} {t('common.comment')}
        </button>
        
        {(post.category || post.type) !== 'versiculo' && (
          <button onClick={handleTranslate} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', color: showTranslation ? '#0ea5e9' : '#888', fontSize: 12, padding: '6px 10px', borderRadius: 8 }}>
            <Languages size={16} /> {translating ? '...' : (showTranslation ? t('common.hideTranslation') : t('common.translate'))}
          </button>
        )}

        <button onClick={handleShare} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', color: '#888', fontSize: 13, marginLeft: 'auto', padding: '6px 10px', borderRadius: 8 }}><Share2 size={18} /> {t('common.share')}</button>
      </div>

      {showComments && (
        <div style={{ padding: '0 16px 14px', borderTop: '1px solid #f0f0f0' }}>
          {comments.map((c, i) => (
            <div key={c.id || i} style={{ padding: '8px 0', fontSize: 13 }}>
              <span style={{ fontWeight: 600, color: '#333' }}>{c.full_name || c.author_name || t('common.user')}</span>
              <span style={{ color: '#555', marginLeft: 8 }}>{c.content}</span>
            </div>
          ))}
          {user && (
            <form onSubmit={submitComment} style={{ display: 'flex', gap: 8, marginTop: 10 }}>
              <input value={comment} onChange={e => setComment(e.target.value)} placeholder={t('mural.commentPlaceholder')} style={{ flex: 1, padding: '8px 12px', borderRadius: 20, border: '1px solid #e2e8f0', fontSize: 13, outline: 'none' }} />
              <button type="submit" style={{ padding: '8px 14px', borderRadius: 20, background: 'linear-gradient(135deg,#667eea,#764ba2)', border: 'none', color: 'white', cursor: 'pointer' }}><Send size={14} /> {t('common.send')}</button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}

export default function MuralGrid() {
  const { t } = useTranslation();
  const { user, token } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('todas');
  const [viewMode, setViewMode] = useState('feed');
  const [showForm, setShowForm] = useState(false);
  const [postText, setPostText] = useState('');
  const [postCategory, setPostCategory] = useState('testemunho');
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);
  const [mediaType, setMediaType] = useState(null);
  const [musicFile, setMusicFile] = useState(null);
  const [musicName, setMusicName] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const photoRef = useRef(null);
  const videoRef = useRef(null);
  const musicRef = useRef(null);
  const [activeVideoId, setActiveVideoId] = useState(null);
  const videoRefs = useRef({});

  const fetchPosts = useCallback(async () => {
    try {
      const res = await fetch(`${API}/feed?limit=50`, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
      const data = await res.json();
      const rawPosts = data.posts || data || [];
      let likedIds = [];
      if (token) {
        try {
          const lr = await fetch(`${API}/feed/liked-posts`, { headers: { Authorization: `Bearer ${token}` } });
          const ld = await lr.json();
          likedIds = ld.likedIds || [];
        } catch (e) {}
      }
      setPosts(rawPosts.map(p => ({ ...p, liked: likedIds.includes(p.id) })));
    } catch (e) { console.error(e); } finally { setLoading(false); }
  }, [token]);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.6) setActiveVideoId(entry.target.dataset.postId);
          else if (!entry.isIntersecting && entry.target.dataset.postId === activeVideoId) setActiveVideoId(null);
        });
      }, { threshold: 0.6 }
    );
    posts.forEach(post => {
      if (post.media_url && post.media_url.match(/\.(mp4|webm|mov|ogg)(\?|$)/i)) {
        const videoElement = videoRefs.current[post.id];
        if (videoElement) observer.observe(videoElement);
      }
    });
    return () => { observer.disconnect(); videoRefs.current = {}; };
  }, [posts, activeVideoId]);

  const handleVideoPlay = useCallback((videoId) => setActiveVideoId(videoId), []);
  const handleVideoPause = useCallback((videoId) => { if (activeVideoId === videoId) setActiveVideoId(null); }, [activeVideoId]);

  const handleLike = async (postId) => {
    if (!user) return;
    setPosts(posts.map(p => p.id === postId ? { ...p, liked: !p.liked, like_count: p.liked ? (p.like_count || 1) - 1 : (p.like_count || 0) + 1 } : p));
    try { await fetch(`${API}/feed/${postId}/like`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } }); } catch (e) { console.error(e); }
  };

  const handleDelete = async (postId) => {
    if (!window.confirm(t('mural.confirmDelete'))) return;
    try { await fetch(`${API}/feed/${postId}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } }); setPosts(posts.filter(p => p.id !== postId)); } catch (e) { setPosts(posts.filter(p => p.id !== postId)); }
  };

  const handleMediaSelect = (e, type) => { const file = e.target.files[0]; if (!file) return; setMediaFile(file); setMediaType(type); setMediaPreview(URL.createObjectURL(file)); };
  const clearMedia = () => { setMediaFile(null); setMediaPreview(null); setMediaType(null); if (photoRef.current) photoRef.current.value = ''; if (videoRef.current) videoRef.current.value = ''; };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!postText.trim() && !mediaFile) return;
    setUploading(true); setUploadError(null);
    try {
      let mediaUrl = null, audioUrl = null;
      if (mediaFile) mediaUrl = await uploadToCloudinary(mediaFile);
      if (musicFile) audioUrl = await uploadToCloudinary(musicFile);
      const res = await fetch(`${API}/feed`, { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ content: postText || '📸', category: postCategory, media_url: mediaUrl || undefined, media_type: mediaType || undefined, audio_url: audioUrl || undefined, }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || t('mural.uploadError'));
      const newPost = { ...(data.post || {}), liked: false, full_name: user?.full_name, like_count: 0, comment_count: 0 };
      setPosts([newPost, ...posts]); setPostText(''); setPostCategory('testemunho'); clearMedia(); setMusicFile(null); setMusicName(null); if (musicRef.current) musicRef.current.value = ''; setShowForm(false);
    } catch (err) { setUploadError(err.message || t('mural.uploadConnectionError')); console.error(err); } finally { setUploading(false); }
  };

  const filteredPosts = activeFilter === 'todas' ? posts : posts.filter(p => (p.category || p.type) === activeFilter);
  const FILTERS_CONFIG = [
    { key: 'todas', labelKey: 'mural.filters.all' }, { key: 'testemunho', labelKey: 'mural.filters.testimonies' }, { key: 'louvor', labelKey: 'mural.filters.worship' }, { key: 'versiculo', labelKey: 'mural.filters.verses' }, { key: 'reflexao', labelKey: 'mural.filters.reflections' }, { key: 'foto', labelKey: 'mural.filters.photos' },
  ];

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: 16 }}>
      <div style={{ background: 'linear-gradient(135deg,#667eea,#764ba2)', borderRadius: 16, padding: '20px 24px', marginBottom: 20, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>{t('mural.title')}</h1>
          <p style={{ margin: '4px 0 0', fontSize: 13, opacity: 0.85 }}>{t('mural.subtitle')}</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => setViewMode(viewMode === 'feed' ? 'grid' : 'feed')} style={{ background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.4)', borderRadius: 10, padding: '8px 12px', color: 'white', cursor: 'pointer' }}>{viewMode === 'feed' ? <Grid size={16} /> : <List size={16} />}</button>
          {user && (
            <button onClick={() => setShowForm(!showForm)} style={{ background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.4)', borderRadius: 12, padding: '10px 16px', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, fontWeight: 600 }}>
              {showForm ? <X size={16} /> : <Plus size={16} />} {showForm ? t('mural.cancel') : t('mural.newPost')}
            </button>
          )}
        </div>
      </div>

      {showForm && (
        <div style={{ background: 'white', borderRadius: 16, padding: 20, border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', marginBottom: 20 }}>
          <select value={postCategory} onChange={e => setPostCategory(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 14, marginBottom: 14, outline: 'none' }}>
            {CATEGORIES_CONFIG.map(c => <option key={c.value} value={c.value}>{t(c.labelKey)}</option>)}
          </select>
          <textarea rows={4} placeholder={t('mural.messagePlaceholder')} value={postText} onChange={e => setPostText(e.target.value)} style={{ width: '100%', padding: 12, borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 14, outline: 'none', resize: 'vertical', boxSizing: 'border-box', marginBottom: 14 }} />
          {mediaPreview && (
            <div style={{ position: 'relative', marginBottom: 14, borderRadius: 12, overflow: 'hidden' }}>
              {mediaType === 'foto' ? <img src={mediaPreview} alt="preview" style={{ width: '100%', maxHeight: 300, objectFit: 'cover', display: 'block' }} /> : <video src={mediaPreview} controls playsInline style={{ width: '100%', maxHeight: 300, display: 'block' }} />}
              <button onClick={clearMedia} style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(0,0,0,0.6)', border: 'none', borderRadius: '50%', width: 28, height: 28, cursor: 'pointer', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={14} /></button>
            </div>
          )}
          {musicName && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14, background: '#f8f4ff', border: '1px solid #a855f744', borderRadius: 10, padding: '10px 14px' }}>
              <Music size={18} style={{ color: '#9333ea' }} /> <span style={{ flex: 1, fontSize: 13, color: '#555' }}>{musicName}</span> <button onClick={() => { setMusicFile(null); setMusicName(null); if (musicRef.current) musicRef.current.value = ''; }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888' }}><X size={14} /></button>
            </div>
          )}
          <input ref={photoRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handleMediaSelect(e, 'foto')} />
          <input ref={videoRef} type="file" accept="video/*" style={{ display: 'none' }} onChange={e => handleMediaSelect(e, 'video')} />
          <input ref={musicRef} type="file" accept="audio/*" style={{ display: 'none' }} onChange={e => { const f = e.target.files[0]; if (f) { setMusicFile(f); setMusicName(f.name); } }} />
          <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
            <button onClick={() => photoRef.current?.click()} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 20, border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer', fontSize: 13 }}><Image size={16} style={{ color: '#f43f5e' }} /> {t('media.photo')}</button>
            <button onClick={() => videoRef.current?.click()} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 20, border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer', fontSize: 13 }}><Video size={16} style={{ color: '#3b82f6' }} /> {t('media.video')}</button>
            <button onClick={() => musicRef.current?.click()} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 20, border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer', fontSize: 13 }}><Music size={16} style={{ color: '#a855f7' }} /> {t('media.audio')}</button>
          </div>
          {uploadError && <div style={{ background: '#fff1f2', border: '1px solid #fecdd3', borderRadius: 8, padding: '10px 14px', marginBottom: 14, fontSize: 13, color: '#e11d48' }}>⚠️ {uploadError}</div>}
          <button onClick={handleSubmit} disabled={uploading || (!postText.trim() && !mediaFile)} style={{ width: '100%', padding: 12, background: uploading ? '#ccc' : 'linear-gradient(135deg,#667eea,#764ba2)', border: 'none', borderRadius: 12, color: 'white', fontSize: 15, fontWeight: 600, cursor: uploading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            {uploading ? t('mural.publishing') : <><Send size={16} /> {t('mural.publish')}</>}
          </button>
        </div>
      )}

      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4, marginBottom: 16, scrollbarWidth: 'none' }}>
        {FILTERS_CONFIG.map(f => (
          <button key={f.key} onClick={() => setActiveFilter(f.key)} style={{ padding: '8px 16px', borderRadius: 20, whiteSpace: 'nowrap', border: activeFilter === f.key ? 'none' : '1px solid #e2e8f0', background: activeFilter === f.key ? 'linear-gradient(135deg,#667eea,#764ba2)' : 'white', color: activeFilter === f.key ? 'white' : '#555', cursor: 'pointer', fontSize: 13, fontWeight: 500 }}>{t(f.labelKey)}</button>
        ))}
      </div>

      {loading && <div style={{ textAlign: 'center', padding: 40, color: '#888' }}>{t('common.loading')}</div>}

      {!loading && viewMode === 'grid' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 3, marginBottom: 16 }}>
          {filteredPosts.map(post => {
            const mediaUrl = post.media_url || post.mediaUrl;
            const color = getCatColor(post.category || post.type);
            return (
              <div key={post.id} style={{ aspectRatio: '1/1', background: '#f8f8f8', overflow: 'hidden', cursor: 'pointer', position: 'relative', borderRadius: 4 }}>
                {mediaUrl && !mediaUrl.match(/\.(mp3|wav|aac|m4a)(\?|$)/i) ? (
                  mediaUrl.match(/\.(mp4|webm|mov)(\?|$)/i) ? (
                    <div style={{ width: '100%', height: '100%', background: '#1a1a2e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Play size={28} color="#daa520" /></div>
                  ) : (
                    <img src={mediaUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  )
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: `linear-gradient(135deg,${color}22,white)`, padding: 8 }}>
                    <p style={{ color: '#333', fontSize: 11, textAlign: 'center', lineHeight: 1.4, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical', margin: 0 }}>{post.content}</p>
                  </div>
                )}
                <div style={{ position: 'absolute', bottom: 4, right: 4, width: 8, height: 8, borderRadius: '50%', background: color }} />
              </div>
            );
          })}
        </div>
      )}

      {!loading && viewMode === 'feed' && filteredPosts.map(post => (
        <PostCard
          key={post.id} post={post} onLike={handleLike} onDelete={handleDelete} token={token} user={user}
          isPlaying={activeVideoId === post.id} onVideoPlay={handleVideoPlay} onVideoPause={handleVideoPause}
        />
      ))}

      {!loading && filteredPosts.length === 0 && (
        <div style={{ textAlign: 'center', padding: 40, color: '#888', background: 'white', borderRadius: 16, border: '1px dashed #e2e8f0' }}>
          <BookOpen size={40} style={{ opacity: 0.3, marginBottom: 12 }} />
          <p style={{ margin: 0 }}>{t('mural.noPostsFound')}</p>
          {!user && <p style={{ margin: '8px 0 0', fontSize: 13 }}>{t('mural.loginRequired')}</p>}
        </div>
      )}
    </div>
  );
}
