import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, X, Send, Image, Video, Music, Heart, MessageCircle, Share2, Play, Pause, BookOpen, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// =============================================
// CLOUDINARY CONFIG
// =============================================
const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'degxiuf43';
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'sigo_com_fe';
const API_BASE = import.meta.env.VITE_API_URL || '';

async function uploadToCloudinary(file) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

  const resourceType = file.type.startsWith('video') ? 'video' : 'auto';
  const url = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/${resourceType}/upload`;

  const res = await fetch(url, { method: 'POST', body: formData });
  if (!res.ok) throw new Error('Erro ao fazer upload para Cloudinary');
  const data = await res.json();
  return data.secure_url;
}

// =============================================
// DEMO POSTS
// =============================================
// Demo posts removidos — Mural carrega da API

// =============================================
// CATEGORY CONFIG
// =============================================
const CATEGORY_COLORS = {
  testemunho: { bg: '#fff7ed', border: '#f97316', text: '#ea580c', emoji: '🙌' },
  louvor:     { bg: '#fdf4ff', border: '#a855f7', text: '#9333ea', emoji: '🎵' },
  reflexao:   { bg: '#eff6ff', border: '#3b82f6', text: '#2563eb', emoji: '📖' },
  versiculo:  { bg: '#f0fdf4', border: '#22c55e', text: '#16a34a', emoji: '✨' },
  foto:       { bg: '#fff1f2', border: '#f43f5e', text: '#e11d48', emoji: '📸' },
};

// =============================================
// AUDIO PLAYER MINI — compatível com telemóvel
// =============================================
function MiniAudioPlayer({ src }) {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  const toggle = async () => {
    if (!audioRef.current) return;
    try {
      if (playing) {
        audioRef.current.pause();
        setPlaying(false);
      } else {
        // Necessário para iOS/Android: play() retorna uma Promise
        await audioRef.current.play();
        setPlaying(true);
      }
    } catch (err) {
      console.error('Erro ao tocar áudio:', err);
    }
  };

  const onTimeUpdate = () => {
    if (!audioRef.current || !audioRef.current.duration) return;
    setProgress((audioRef.current.currentTime / audioRef.current.duration) * 100);
  };

  const onEnded = () => { setPlaying(false); setProgress(0); };

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '10px',
      background: 'linear-gradient(135deg, #667eea22, #764ba222)',
      border: '1px solid #667eea44',
      borderRadius: '12px', padding: '10px 14px', marginTop: '10px',
    }}>
      <audio
        ref={audioRef}
        src={src}
        onTimeUpdate={onTimeUpdate}
        onEnded={onEnded}
        preload="metadata"
        playsInline
      />
      <button onClick={toggle} style={{
        width: '36px', height: '36px', borderRadius: '50%',
        background: 'linear-gradient(135deg, #667eea, #764ba2)',
        border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'white', flexShrink: 0,
      }}>
        {playing ? <Pause size={16} /> : <Play size={16} />}
      </button>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '11px', color: '#666', marginBottom: '4px' }}>🎵 Música anexada</div>
        <div style={{ height: '4px', background: '#e2e8f0', borderRadius: '2px', overflow: 'hidden' }}>
          <div style={{ width: `${progress}%`, height: '100%', background: 'linear-gradient(90deg, #667eea, #764ba2)', transition: 'width 0.1s' }} />
        </div>
      </div>
    </div>
  );
}

// =============================================
// AMEN BUTTON — estilo TikTok
// =============================================
function AmenButton({ count, liked, onLike }) {
  const [animate, setAnimate] = useState(false);
  const [floaters, setFloaters] = useState([]);

  const handleClick = () => {
    onLike();
    setAnimate(true);
    setTimeout(() => setAnimate(false), 400);

    // Criar corações flutuantes
    const id = Date.now();
    setFloaters(f => [...f, id]);
    setTimeout(() => setFloaters(f => f.filter(x => x !== id)), 1000);
  };

  return (
    <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
      {/* Corações flutuantes */}
      {floaters.map(id => (
        <div key={id} style={{
          position: 'absolute', bottom: '100%', left: '50%',
          transform: 'translateX(-50%)',
          fontSize: '20px', pointerEvents: 'none',
          animation: 'floatUp 1s ease-out forwards',
        }}>🙏</div>
      ))}
      <button
        onClick={handleClick}
        style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          background: liked ? '#fff0f3' : 'none',
          border: liked ? '1px solid #fecdd3' : 'none',
          cursor: 'pointer',
          color: liked ? '#e11d48' : '#888',
          fontSize: '13px', fontWeight: '700',
          padding: '6px 12px', borderRadius: '20px',
          transition: 'all 0.2s',
          transform: animate ? 'scale(1.3)' : 'scale(1)',
        }}
      >
        <span style={{
          fontSize: animate ? '22px' : '18px',
          transition: 'font-size 0.2s',
        }}>
          {liked ? '🙏' : '🙏'}
        </span>
        <span style={{
          color: liked ? '#e11d48' : '#888',
          fontWeight: '700',
        }}>
          {count} Amén
        </span>
      </button>
    </div>
  );
}

// =============================================
// POST CARD
// =============================================
function PostCard({ post, onLike, onDelete }) {
  const cat = CATEGORY_COLORS[post.type] || CATEGORY_COLORS.reflexao;
  const [showComments, setShowComments] = useState(false);
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState([]);

  const submitComment = (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    setComments([...comments, { id: Date.now(), text: comment, author: 'Você', time: 'Agora' }]);
    setComment('');
  };

  return (
    <div style={{
      background: 'white',
      borderRadius: '16px',
      border: `1px solid ${cat.border}33`,
      overflow: 'hidden',
      boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
      marginBottom: '16px',
    }}>
      {/* Header */}
      <div style={{ padding: '14px 16px 10px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{
          width: '42px', height: '42px', borderRadius: '50%',
          background: `linear-gradient(135deg, ${cat.border}, ${cat.border}88)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'white', fontWeight: '700', fontSize: '14px', flexShrink: 0,
        }}>
          {post.authorInitials}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: '600', fontSize: '14px', color: '#1a1a2e' }}>{post.authorName}</div>
          <div style={{ fontSize: '12px', color: '#888' }}>{post.church} · {post.time}</div>
        </div>
        <span style={{
          fontSize: '11px', fontWeight: '600', padding: '4px 10px',
          borderRadius: '20px', background: cat.bg, color: cat.text,
          border: `1px solid ${cat.border}44`,
        }}>
          {cat.emoji} {post.type}
        </span>
        {/* Botão apagar — só aparece nos posts do utilizador (id > 1000 = posts novos) */}
        {post.id > 1000 && (
          <button
            onClick={() => onDelete(post.id)}
            title="Apagar publicação"
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: '#ccc', padding: '4px', borderRadius: '6px',
              display: 'flex', alignItems: 'center',
              transition: 'color 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.color = '#e11d48'}
            onMouseLeave={e => e.currentTarget.style.color = '#ccc'}
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>

      {/* Media — Foto */}
      {post.mediaType === 'foto' && post.mediaUrl && (
        <div style={{ width: '100%', maxHeight: '400px', overflow: 'hidden' }}>
          <img src={post.mediaUrl} alt="post" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        </div>
      )}

      {/* Media — Vídeo (sem fullscreen, controlado inline) */}
      {post.mediaType === 'video' && post.mediaUrl && (
        <div style={{ background: '#000' }}>
          <video
            src={post.mediaUrl}
            controls
            playsInline
            style={{ width: '100%', maxHeight: '400px', objectFit: 'contain', display: 'block' }}
            controlsList="nodownload nofullscreen noremoteplayback"
            disablePictureInPicture
          />
        </div>
      )}

      {/* Content */}
      <div style={{ padding: '12px 16px' }}>
        {post.type === 'versiculo' ? (
          <div style={{
            background: `linear-gradient(135deg, ${cat.bg}, white)`,
            border: `2px solid ${cat.border}33`,
            borderLeft: `4px solid ${cat.border}`,
            borderRadius: '8px', padding: '12px 14px',
          }}>
            <p style={{ fontStyle: 'italic', color: '#333', fontSize: '15px', lineHeight: '1.6', margin: 0 }}>"{post.content}"</p>
            {post.reference && (
              <p style={{ fontWeight: '700', color: cat.text, marginTop: '8px', marginBottom: 0, fontSize: '13px' }}>— {post.reference}</p>
            )}
          </div>
        ) : (
          <p style={{ color: '#333', fontSize: '14px', lineHeight: '1.65', margin: 0 }}>{post.content}</p>
        )}

        {/* Música */}
        {post.musicUrl && <MiniAudioPlayer src={post.musicUrl} />}
      </div>

      {/* Actions */}
      <div style={{
        padding: '8px 16px 12px',
        borderTop: '1px solid #f0f0f0',
        display: 'flex', gap: '8px', alignItems: 'center',
      }}>
        <AmenButton count={post.amemCount} liked={post.liked} onLike={() => onLike(post.id)} />
        <button onClick={() => setShowComments(!showComments)} style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          background: 'none', border: 'none', cursor: 'pointer',
          color: '#888', fontSize: '13px', fontWeight: '600',
          padding: '6px 10px', borderRadius: '8px',
        }}>
          <MessageCircle size={18} />
          {post.commentCount + comments.length}
        </button>
        
          href={"https://wa.me/?text=" + encodeURIComponent((post.content ? post.content.slice(0, 100) : 'Partilha da fe') + ' | Sigo com Fe ' + window.location.origin + '/mural')}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            background: 'none', border: 'none', cursor: 'pointer',
            color: '#888', fontSize: '13px', fontWeight: '600',
            padding: '6px 10px', borderRadius: '8px', marginLeft: 'auto',
            textDecoration: 'none',
          }}>
          <Share2 size={18} />
        </a>

      {/* Comments */}
      {showComments && (
        <div style={{ padding: '0 16px 14px', borderTop: '1px solid #f0f0f0' }}>
          {comments.map(c => (
            <div key={c.id} style={{ padding: '8px 0', borderBottom: '1px solid #f8f8f8', fontSize: '13px' }}>
              <span style={{ fontWeight: '600', color: '#333' }}>{c.author}</span>
              <span style={{ color: '#555', marginLeft: '8px' }}>{c.text}</span>
            </div>
          ))}
          <form onSubmit={submitComment} style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
            <input
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder="Escreve um comentário..."
              style={{
                flex: 1, padding: '8px 12px', borderRadius: '20px',
                border: '1px solid #e2e8f0', fontSize: '13px', outline: 'none',
              }}
            />
            <button type="submit" style={{
              padding: '8px 14px', borderRadius: '20px',
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              border: 'none', color: 'white', cursor: 'pointer', fontSize: '13px',
            }}>
              <Send size={14} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

// =============================================
// MAIN MURAL COMPONENT
// =============================================
export default function Mural() {
  const { t } = useTranslation();
  const { user, token } = useAuth();
  const [activeFilter, setActiveFilter] = useState('todas');
  const [showForm, setShowForm] = useState(false);
  const [posts, setPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(true);

  // Form state
  const [postText, setPostText] = useState('');
  const [postCategory, setPostCategory] = useState('testemunho');
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);
  const [mediaType, setMediaType] = useState(null);
  const [musicFile, setMusicFile] = useState(null);
  const [musicName, setMusicName] = useState(null);
  const [showMusicPicker, setShowMusicPicker] = useState(false);
  const [libraryTracks, setLibraryTracks] = useState([]);
  const [selectedTrack, setSelectedTrack] = useState(null); // { title, artist, file_url }
  const [loadingTracks, setLoadingTracks] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  const photoInputRef = useRef(null);
  const videoInputRef = useRef(null);
  const musicInputRef = useRef(null);

  const FILTERS = [
    { key: 'todas', label: '🌟 Todas' },
    { key: 'testemunho', label: '🙌 Testemunhos' },
    { key: 'louvor', label: '🎵 Louvores' },
    { key: 'versiculo', label: '✨ Versículos' },
    { key: 'reflexao', label: '📖 Reflexões' },
    { key: 'foto', label: '📸 Fotos & Vídeos' },
  ];

  const CATEGORIES = [
    { value: 'testemunho', label: '🙌 Testemunho' },
    { value: 'louvor', label: '🎵 Louvor' },
    { value: 'reflexao', label: '📖 Reflexão' },
    { value: 'versiculo', label: '✨ Versículo' },
    { value: 'foto', label: '📸 Foto/Vídeo' },
  ];

  const filteredPosts = activeFilter === 'todas'
    ? posts
    : activeFilter === 'foto'
      ? posts.filter(p => p.mediaUrl && (p.type === 'foto' || p.mediaType === 'video' || p.mediaUrl))
      : posts.filter(p => p.type === activeFilter);

  const handleMediaSelect = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;
    setMediaFile(file);
    setMediaType(type);
    setMediaPreview(URL.createObjectURL(file));
  };

  // Função para mapear post do backend para o formato do frontend
  const mapPost = (p) => ({
    id: p.id,
    type: p.category || p.type || 'testemunho',
    authorInitials: (p.author_name || p.authorName || '?').slice(0, 2).toUpperCase(),
    authorName: p.author_name || p.authorName || 'Membro',
    authorAvatar: p.author_avatar || p.authorAvatar || null,
    authorId: p.author_id || p.authorId || null,
    church: p.church_name || 'Sigo com Fé',
    time: p.created_at ? new Date(p.created_at).toLocaleDateString() : 'Agora',
    content: p.content || '',
    amemCount: p.likes_count || p.amemCount || 0,
    commentCount: p.comment_count || p.commentCount || 0,
    liked: p.liked || false,
    mediaUrl: p.media_url || p.mediaUrl || null,
    mediaType: p.media_type || p.mediaType || null,
    musicUrl: p.audio_url || p.musicUrl || null,
    verseReference: p.verse_reference || p.verseReference || null,
    campaignLink: p.campaign_link || null,
  });

  // Carregar posts da API
  useEffect(() => {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    fetch(`${API_BASE}/api/feed`, { headers })
      .then(r => r.ok ? r.json() : { posts: [] })
      .then(data => {
        const fetched = (data.posts || []).map(mapPost);
        setPosts(fetched);
      })
      .catch(() => setPosts([]))
      .finally(() => setLoadingPosts(false));
  }, [token]);

  // Carregar biblioteca quando o picker abrir
  useEffect(() => {
    if (!showMusicPicker) return;
    setLoadingTracks(true);
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    fetch(`${API_BASE}/api/music`, { headers })
      .then(r => r.json())
      .then(d => setLibraryTracks(d.songs || d.tracks || []))
      .catch(() => setLibraryTracks([]))
      .finally(() => setLoadingTracks(false));
  }, [showMusicPicker]);

  const handleMusicSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setMusicFile(file);
    setMusicName(file.name);
  };

  const clearMedia = () => {
    setMediaFile(null);
    setMediaPreview(null);
    setMediaType(null);
    if (photoInputRef.current) photoInputRef.current.value = '';
    if (videoInputRef.current) videoInputRef.current.value = '';
  };

  const clearMusic = () => {
    setMusicFile(null);
    setMusicName(null);
    if (musicInputRef.current) musicInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!postText.trim() && !mediaFile) return;

    setUploading(true);
    setUploadError(null);

    try {
      let mediaUrl = null;
      let musicUrl = null;

      if (mediaFile) {
        mediaUrl = await uploadToCloudinary(mediaFile);
      }

      if (musicFile) {
        musicUrl = await uploadToCloudinary(musicFile);
      }

      const finalMusicUrl = selectedTrack?.file_url || musicUrl;

      // Salvar na API
      const fd = new FormData();
      fd.append('content', postText || '📸');
      fd.append('category', postCategory);
      fd.append('visibility', 'public');
      if (mediaUrl) fd.append('media_url', mediaUrl);
      if (mediaType) fd.append('media_type', mediaType);
      if (finalMusicUrl) fd.append('audio_url', finalMusicUrl);

      let savedPost = null;
      if (token) {
        try {
          const apiRes = await fetch(`${API_BASE}/api/feed`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
            body: fd,
          });
          if (apiRes.ok) {
            const apiData = await apiRes.json();
            savedPost = apiData.post ? mapPost(apiData.post) : null;
          }
        } catch {}
      }

      const newPost = savedPost || {
        id: Date.now(),
        type: postCategory,
        authorInitials: user ? user.full_name?.slice(0, 2).toUpperCase() : 'EU',
        authorName: user ? user.full_name : 'Você',
        church: 'Sigo com Fé',
        time: 'Agora',
        content: postText,
        amemCount: 0,
        commentCount: 0,
        liked: false,
        mediaUrl,
        mediaType,
        musicUrl: finalMusicUrl,
      };

      setPosts([newPost, ...posts]);
      setPostText('');
      setPostCategory('testemunho');
      clearMedia();
      clearMusic();
      setSelectedTrack(null);
      setShowMusicPicker(false);
      setShowForm(false);
    } catch (err) {
      setUploadError('Erro no upload. Verifica a tua ligação e tenta novamente.');
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const handleLike = async (postId) => {
    // Atualizar UI imediatamente (optimistic)
    setPosts(posts.map(p =>
      p.id === postId
        ? { ...p, liked: !p.liked, amemCount: p.liked ? p.amemCount - 1 : p.amemCount + 1 }
        : p
    ));
    // Sincronizar com API
    if (token) {
      try {
        await fetch(`${API_BASE}/api/feed/${postId}/like`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch {}
    }
  };

  const handleDelete = async (postId) => {
    if (window.confirm('Tens a certeza que queres apagar esta publicação?')) {
      setPosts(posts.filter(p => p.id !== postId));
      if (token) {
        try {
          await fetch(`${API_BASE}/api/feed/${postId}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` },
          });
        } catch {}
      }
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '16px' }}>

      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea, #764ba2)',
        borderRadius: '16px', padding: '20px 24px', marginBottom: '20px',
        color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '22px', fontWeight: '700' }}>
            📋 Mural da Comunidade
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: '13px', opacity: 0.85 }}>
            Partilha testemunhos, louvores e reflexões
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          style={{
            background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.4)',
            borderRadius: '12px', padding: '10px 16px', color: 'white',
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
            fontSize: '14px', fontWeight: '600',
          }}
        >
          {showForm ? <X size={16} /> : <Plus size={16} />}
          {showForm ? 'Cancelar' : 'Publicar'}
        </button>
      </div>

      {/* FORM */}
      {showForm && (
        <div style={{
          background: 'white', borderRadius: '16px', padding: '20px',
          border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          marginBottom: '20px',
        }}>
          <h3 style={{ margin: '0 0 16px', fontSize: '16px', color: '#1a1a2e' }}>
            ✏️ Partilha com a comunidade
          </h3>

          {/* Categoria */}
          <div style={{ marginBottom: '14px' }}>
            <label style={{ fontSize: '13px', fontWeight: '600', color: '#555', display: 'block', marginBottom: '6px' }}>
              Categoria
            </label>
            <select
              value={postCategory}
              onChange={e => setPostCategory(e.target.value)}
              style={{
                width: '100%', padding: '10px 12px', borderRadius: '10px',
                border: '1px solid #e2e8f0', fontSize: '14px', outline: 'none',
                background: 'white',
              }}
            >
              {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>

          {/* Texto */}
          <div style={{ marginBottom: '14px' }}>
            <label style={{ fontSize: '13px', fontWeight: '600', color: '#555', display: 'block', marginBottom: '6px' }}>
              Mensagem
            </label>
            <textarea
              rows={4}
              placeholder="Escreve o teu testemunho, louvor ou reflexão..."
              value={postText}
              onChange={e => setPostText(e.target.value)}
              style={{
                width: '100%', padding: '12px', borderRadius: '10px',
                border: '1px solid #e2e8f0', fontSize: '14px', outline: 'none',
                resize: 'vertical', lineHeight: '1.5', boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Preview de media */}
          {mediaPreview && (
            <div style={{ position: 'relative', marginBottom: '14px', borderRadius: '12px', overflow: 'hidden' }}>
              {mediaType === 'foto' ? (
                <img src={mediaPreview} alt="preview" style={{ width: '100%', maxHeight: '300px', objectFit: 'cover', display: 'block' }} />
              ) : (
                <video src={mediaPreview} controls playsInline style={{ width: '100%', maxHeight: '300px', display: 'block' }} />
              )}
              <button
                onClick={clearMedia}
                style={{
                  position: 'absolute', top: '8px', right: '8px',
                  background: 'rgba(0,0,0,0.6)', border: 'none', borderRadius: '50%',
                  width: '28px', height: '28px', cursor: 'pointer', color: 'white',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <X size={14} />
              </button>
            </div>
          )}

          {/* Música selecionada */}
          {musicName && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px',
              background: '#f8f4ff', border: '1px solid #a855f744', borderRadius: '10px', padding: '10px 14px',
            }}>
              <Music size={18} style={{ color: '#9333ea' }} />
              <span style={{ flex: 1, fontSize: '13px', color: '#555' }}>{musicName}</span>
              <button onClick={clearMusic} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888' }}>
                <X size={14} />
              </button>
            </div>
          )}

          {/* Botões de media */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
            <input ref={photoInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handleMediaSelect(e, 'foto')} />
            <input ref={videoInputRef} type="file" accept="video/*" style={{ display: 'none' }} onChange={e => handleMediaSelect(e, 'video')} />
            <input ref={musicInputRef} type="file" accept="audio/*" style={{ display: 'none' }} onChange={e => handleMusicSelect(e)} />

            <button onClick={() => photoInputRef.current?.click()} style={{
              display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px',
              borderRadius: '20px', border: '1px solid #e2e8f0', background: 'white',
              cursor: 'pointer', fontSize: '13px', color: '#555', fontWeight: '500',
            }}>
              <Image size={16} style={{ color: '#f43f5e' }} /> Foto
            </button>

            <button onClick={() => videoInputRef.current?.click()} style={{
              display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px',
              borderRadius: '20px', border: '1px solid #e2e8f0', background: 'white',
              cursor: 'pointer', fontSize: '13px', color: '#555', fontWeight: '500',
            }}>
              <Video size={16} style={{ color: '#3b82f6' }} /> Vídeo
            </button>

            <button onClick={() => musicInputRef.current?.click()} style={{
              display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px',
              borderRadius: '20px', border: '1px solid #e2e8f0', background: 'white',
              cursor: 'pointer', fontSize: '13px', color: '#555', fontWeight: '500',
            }}>
              <Music size={16} style={{ color: '#a855f7' }} /> Música
            </button>
          </div>

          {/* Botão Música da Biblioteca — só quando há foto/vídeo */}
          {mediaFile && (
            <div style={{ marginTop: 8, marginBottom: 14 }}>
              {selectedTrack ? (
                <div style={{ display:'flex', alignItems:'center', gap:8, background:'#f0f4ff', borderRadius:8, padding:'8px 12px' }}>
                  <span>🎵</span>
                  <span style={{ flex:1, fontSize:13, color:'#333' }}>{selectedTrack.title} — {selectedTrack.artist}</span>
                  <button onClick={() => setSelectedTrack(null)} style={{ background:'none', border:'none', cursor:'pointer', color:'#999' }}>✕</button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowMusicPicker(true)}
                  style={{ width:'100%', padding:'8px', borderRadius:8, border:'1px dashed #a78bfa', background:'#faf5ff', color:'#7c3aed', fontSize:13, cursor:'pointer' }}
                >
                  🎵 Adicionar música de fundo
                </button>
              )}
            </div>
          )}

          {/* Erro */}
          {uploadError && (
            <div style={{
              background: '#fff1f2', border: '1px solid #fecdd3', borderRadius: '8px',
              padding: '10px 14px', marginBottom: '14px', fontSize: '13px', color: '#e11d48',
            }}>
              ⚠️ {uploadError}
            </div>
          )}

          {/* Botão publicar */}
          <button
            onClick={handleSubmit}
            disabled={uploading || (!postText.trim() && !mediaFile)}
            style={{
              width: '100%', padding: '12px',
              background: uploading ? '#ccc' : 'linear-gradient(135deg, #667eea, #764ba2)',
              border: 'none', borderRadius: '12px', color: 'white',
              fontSize: '15px', fontWeight: '600', cursor: uploading ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            }}
          >
            {uploading ? (
              <>
                <div style={{
                  width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)',
                  borderTop: '2px solid white', borderRadius: '50%',
                  animation: 'spin 0.8s linear infinite',
                }} />
                A publicar...
              </>
            ) : (
              <><Send size={16} /> Publicar</>
            )}
          </button>
        </div>
      )}

      {/* Filtros */}
      <div style={{
        display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px',
        marginBottom: '16px', scrollbarWidth: 'none',
      }}>
        {FILTERS.map(f => (
          <button
            key={f.key}
            onClick={() => setActiveFilter(f.key)}
            style={{
              padding: '8px 16px', borderRadius: '20px', whiteSpace: 'nowrap',
              border: activeFilter === f.key ? 'none' : '1px solid #e2e8f0',
              background: activeFilter === f.key ? 'linear-gradient(135deg, #667eea, #764ba2)' : 'white',
              color: activeFilter === f.key ? 'white' : '#555',
              cursor: 'pointer', fontSize: '13px', fontWeight: '500',
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Posts */}
      {filteredPosts.map(post => (
        <PostCard key={post.id} post={post} onLike={handleLike} onDelete={handleDelete} />
      ))}

      {filteredPosts.length === 0 && (
        <div style={{
          textAlign: 'center', padding: '40px', color: '#888',
          background: 'white', borderRadius: '16px', border: '1px dashed #e2e8f0',
        }}>
          <BookOpen size={40} style={{ opacity: 0.3, marginBottom: '12px' }} />
          <p style={{ margin: 0, fontSize: '15px' }}>Nenhuma publicação encontrada.</p>
          <p style={{ margin: '4px 0 0', fontSize: '13px' }}>Sê o primeiro a partilhar!</p>
        </div>
      )}

      {/* Music Picker Modal */}
      {showMusicPicker && (
        <div style={{ position:'fixed', top:0, left:0, width:'100%', height:'100%', background:'rgba(0,0,0,0.5)', zIndex:1000, display:'flex', alignItems:'flex-end' }}
          onClick={e => { if (e.target === e.currentTarget) setShowMusicPicker(false); }}
        >
          <div style={{ background:'white', borderRadius:'16px 16px 0 0', padding:16, maxHeight:'70vh', overflowY:'auto', width:'100%' }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
              <h3 style={{ margin:0, fontSize:16, color:'#1a1a2e' }}>🎵 Biblioteca de Músicas</h3>
              <button onClick={() => setShowMusicPicker(false)} style={{ background:'none', border:'none', cursor:'pointer', fontSize:20, color:'#888' }}>❌</button>
            </div>
            {loadingTracks ? (
              <p style={{ textAlign:'center', color:'#888', padding:20 }}>A carregar...</p>
            ) : libraryTracks.length === 0 ? (
              <p style={{ textAlign:'center', color:'#888', padding:20 }}>Nenhuma música na biblioteca.</p>
            ) : (
              libraryTracks.map(track => (
                <div
                  key={track.id}
                  onClick={() => { setSelectedTrack(track); setShowMusicPicker(false); }}
                  style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 0', borderBottom:'1px solid #f0f0f0', cursor:'pointer' }}
                >
                  {track.cover_url ? (
                    <img src={track.cover_url} alt={track.title} style={{ width:44, height:44, borderRadius:8, objectFit:'cover', background:'#f0f0f0' }} />
                  ) : (
                    <div style={{ width:44, height:44, borderRadius:8, background:'#f0f0f0', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20 }}>🎵</div>
                  )}
                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:600, fontSize:14, color:'#1a1a2e' }}>{track.title}</div>
                    <div style={{ fontSize:12, color:'#888' }}>{track.artist}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes floatUp {
          0% { opacity: 1; transform: translateX(-50%) translateY(0) scale(1); }
          100% { opacity: 0; transform: translateX(-50%) translateY(-60px) scale(1.5); }
        }
        ::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}
