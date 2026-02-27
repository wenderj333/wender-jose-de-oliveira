import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Filter, X, Send, Image, Video, Music, Heart, MessageCircle, Share2, Play, Pause, ChevronLeft, ChevronRight, BookOpen, Mic } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// =============================================
// CLOUDINARY CONFIG — coloca as tuas credenciais
// =============================================
const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'SEU_CLOUD_NAME';
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'SEU_UPLOAD_PRESET';

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
const DEMO_POSTS = [
  {
    id: 1, type: 'testemunho',
    authorInitials: 'MC', authorName: 'Maria Clara',
    church: 'Igreja Batista Central', time: 'Há 2 horas',
    content: 'Glória a Deus! Depois de 3 anos desempregada, o Senhor abriu as portas e fui aprovada no concurso público. Nunca desistam de orar, irmãos! Deus é fiel.',
    amemCount: 47, commentCount: 12, liked: false,
    mediaUrl: null, mediaType: null, musicUrl: null,
  },
  {
    id: 2, type: 'louvor',
    authorInitials: 'PR', authorName: 'Paulo Ricardo',
    church: 'Comunidade Graça e Paz', time: 'Há 4 horas',
    content: 'Novo louvor do ministério de adoração da nossa igreja. Que o Espírito Santo toque cada coração!',
    amemCount: 31, commentCount: 8, liked: false,
    mediaUrl: 'https://images.unsplash.com/photo-1478147427282-58a87a433968?w=600&q=80',
    mediaType: 'foto', musicUrl: null,
  },
  {
    id: 3, type: 'versiculo',
    authorInitials: 'DF', authorName: 'Daniela Ferreira',
    church: 'Assembleia de Deus', time: 'Há 10 horas',
    content: 'Porque eu bem sei os pensamentos que penso de vós, diz o Senhor; pensamentos de paz e não de mal, para vos dar o fim que esperais.',
    reference: 'Jeremias 29:11',
    amemCount: 112, commentCount: 5, liked: false,
    mediaUrl: null, mediaType: null, musicUrl: null,
  },
  {
    id: 4, type: 'reflexao',
    authorInitials: 'JL', authorName: 'Pastor João Lucas',
    church: 'Igreja Presbiteriana do Centro', time: 'Há 8 horas',
    content: 'Muitas vezes queremos que Deus mude as circunstâncias, mas Ele quer mudar o nosso coração primeiro. Confie no processo de Deus para a sua vida.',
    amemCount: 65, commentCount: 18, liked: false,
    mediaUrl: null, mediaType: null, musicUrl: null,
  },
];

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
// AUDIO PLAYER MINI
// =============================================
function MiniAudioPlayer({ src }) {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  const toggle = () => {
    if (!audioRef.current) return;
    if (playing) { audioRef.current.pause(); setPlaying(false); }
    else { audioRef.current.play(); setPlaying(true); }
  };

  const onTimeUpdate = () => {
    if (!audioRef.current) return;
    setProgress((audioRef.current.currentTime / audioRef.current.duration) * 100 || 0);
  };

  const onEnded = () => { setPlaying(false); setProgress(0); };

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '10px',
      background: 'linear-gradient(135deg, #667eea22, #764ba222)',
      border: '1px solid #667eea44',
      borderRadius: '12px', padding: '10px 14px', marginTop: '10px',
    }}>
      <audio ref={audioRef} src={src} onTimeUpdate={onTimeUpdate} onEnded={onEnded} />
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
// POST CARD
// =============================================
function PostCard({ post, onLike, onComment }) {
  const cat = CATEGORY_COLORS[post.type] || CATEGORY_COLORS.reflexao;
  const [showComments, setShowComments] = useState(false);
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState([]);
  const [videoPlaying, setVideoPlaying] = useState(false);
  const videoRef = useRef(null);

  const toggleVideo = () => {
    if (!videoRef.current) return;
    if (videoPlaying) { videoRef.current.pause(); setVideoPlaying(false); }
    else { videoRef.current.play(); setVideoPlaying(true); }
  };

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
      transition: 'transform 0.2s, box-shadow 0.2s',
      marginBottom: '16px',
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.10)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.06)'; }}
    >
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
      </div>

      {/* Media — Foto */}
      {post.mediaType === 'foto' && post.mediaUrl && (
        <div style={{ width: '100%', maxHeight: '400px', overflow: 'hidden' }}>
          <img src={post.mediaUrl} alt="post" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        </div>
      )}

      {/* Media — Vídeo */}
      {post.mediaType === 'video' && post.mediaUrl && (
        <div style={{ position: 'relative', background: '#000', cursor: 'pointer' }} onClick={toggleVideo}>
          <video
            ref={videoRef}
            src={post.mediaUrl}
            style={{ width: '100%', maxHeight: '400px', objectFit: 'contain', display: 'block' }}
            onEnded={() => setVideoPlaying(false)}
          />
          {!videoPlaying && (
            <div style={{
              position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'rgba(0,0,0,0.3)',
            }}>
              <div style={{
                width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(255,255,255,0.9)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Play size={24} style={{ color: '#333', marginLeft: '3px' }} />
              </div>
            </div>
          )}
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
        display: 'flex', gap: '16px', alignItems: 'center',
      }}>
        <button onClick={() => onLike(post.id)} style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          background: 'none', border: 'none', cursor: 'pointer',
          color: post.liked ? '#e11d48' : '#888', fontSize: '13px', fontWeight: '600',
          padding: '6px 10px', borderRadius: '8px',
          transition: 'all 0.2s',
        }}>
          <Heart size={18} fill={post.liked ? '#e11d48' : 'none'} />
          {post.amemCount} Améns
        </button>
        <button onClick={() => setShowComments(!showComments)} style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          background: 'none', border: 'none', cursor: 'pointer',
          color: '#888', fontSize: '13px', fontWeight: '600',
          padding: '6px 10px', borderRadius: '8px',
        }}>
          <MessageCircle size={18} />
          {post.commentCount + comments.length}
        </button>
        <button style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          background: 'none', border: 'none', cursor: 'pointer',
          color: '#888', fontSize: '13px', fontWeight: '600',
          padding: '6px 10px', borderRadius: '8px', marginLeft: 'auto',
        }}>
          <Share2 size={18} />
        </button>
      </div>

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
  const [posts, setPosts] = useState(DEMO_POSTS);

  // Form state
  const [postText, setPostText] = useState('');
  const [postCategory, setPostCategory] = useState('testemunho');
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);
  const [mediaType, setMediaType] = useState(null);
  const [musicFile, setMusicFile] = useState(null);
  const [musicName, setMusicName] = useState(null);
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
    : posts.filter(p => p.type === activeFilter);

  const handleMediaSelect = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;
    setMediaFile(file);
    setMediaType(type);
    setMediaPreview(URL.createObjectURL(file));
  };

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

      // Upload media se existir
      if (mediaFile) {
        mediaUrl = await uploadToCloudinary(mediaFile);
      }

      // Upload música se existir
      if (musicFile) {
        musicUrl = await uploadToCloudinary(musicFile);
      }

      const newPost = {
        id: Date.now(),
        type: postCategory,
        authorInitials: user ? user.full_name?.slice(0, 2).toUpperCase() : 'EU',
        authorName: user ? user.full_name : 'Você',
        church: user?.church || 'Sua Igreja',
        time: 'Agora',
        content: postText,
        amemCount: 0,
        commentCount: 0,
        liked: false,
        mediaUrl,
        mediaType,
        musicUrl,
      };

      setPosts([newPost, ...posts]);
      setPostText('');
      setPostCategory('testemunho');
      clearMedia();
      clearMusic();
      setShowForm(false);
    } catch (err) {
      setUploadError('Erro no upload. Verifica a tua ligação e tenta novamente.');
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const handleLike = (postId) => {
    setPosts(posts.map(p =>
      p.id === postId
        ? { ...p, liked: !p.liked, amemCount: p.liked ? p.amemCount - 1 : p.amemCount + 1 }
        : p
    ));
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
            fontSize: '14px', fontWeight: '600', transition: 'all 0.2s',
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
            ✍️ Partilha com a comunidade
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
                <video src={mediaPreview} controls style={{ width: '100%', maxHeight: '300px', display: 'block' }} />
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

            <button
              onClick={() => photoInputRef.current?.click()}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px',
                borderRadius: '20px', border: '1px solid #e2e8f0', background: 'white',
                cursor: 'pointer', fontSize: '13px', color: '#555', fontWeight: '500',
              }}
            >
              <Image size={16} style={{ color: '#f43f5e' }} /> Foto
            </button>

            <button
              onClick={() => videoInputRef.current?.click()}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px',
                borderRadius: '20px', border: '1px solid #e2e8f0', background: 'white',
                cursor: 'pointer', fontSize: '13px', color: '#555', fontWeight: '500',
              }}
            >
              <Video size={16} style={{ color: '#3b82f6' }} /> Vídeo
            </button>

            <button
              onClick={() => musicInputRef.current?.click()}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px',
                borderRadius: '20px', border: '1px solid #e2e8f0', background: 'white',
                cursor: 'pointer', fontSize: '13px', color: '#555', fontWeight: '500',
              }}
            >
              <Music size={16} style={{ color: '#a855f7' }} /> Música
            </button>
          </div>

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
              transition: 'opacity 0.2s',
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
              transition: 'all 0.2s',
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Posts */}
      {filteredPosts.map(post => (
        <PostCard key={post.id} post={post} onLike={handleLike} />
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

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        ::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}
