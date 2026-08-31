import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, X, Send, Image, Video, Music, Heart, MessageCircle, Share2, Play, Pause, BookOpen, Trash2, Grid, List, Volume2, VolumeX, Search, Flag } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import LiveViewers from '../components/LiveViewers';
import ReportModal from '../components/ReportModal';
import { repairMojibake } from '../utils/textEncoding';
import surpriseMessages from '../data/surpresas-biblicas-traduzidas.json';

const API_BASE = import.meta.env.VITE_API_URL || '';
const API = `${API_BASE}/api`;
const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'degxiuf43';
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'sigo_com_fe';
async function getVideoDuration(file) {
  return new Promise((resolve) => {
    const video = document.createElement("video");
    video.preload = "metadata";
    video.onloadedmetadata = () => { window.URL.revokeObjectURL(video.src); resolve(video.duration); };
    video.src = URL.createObjectURL(file);
  });
}

async function uploadToCloudinary(file) {
  if (file.type.startsWith("video")) {
    const duration = await getVideoDuration(file);
    if (duration > 180) throw new Error("Video muito longo. Maximo 3 minutos.");
  }
  // Converter HEIC/HEIF para JPEG (Xiaomi/iPhone)
  let uploadFile = file;
  if (file.type === 'image/heic' || file.type === 'image/heif' || file.name.toLowerCase().endsWith('.heic') || file.name.toLowerCase().endsWith('.heif')) {
    try {
      const bitmap = await createImageBitmap(file);
      const canvas = document.createElement('canvas');
      canvas.width = bitmap.width;
      canvas.height = bitmap.height;
      canvas.getContext('2d').drawImage(bitmap, 0, 0);
      const blob = await new Promise(res => canvas.toBlob(res, 'image/jpeg', 0.92));
      uploadFile = new File([blob], file.name.replace(/\.heic$/i, '.jpg').replace(/\.heif$/i, '.jpg'), { type: 'image/jpeg' });
    } catch(e) { console.warn('HEIC conversion failed, uploading raw', e); }
  }
  const formData = new FormData();
  formData.append("file", uploadFile);
  formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
  const resourceType = uploadFile.type.startsWith("video") ? "video" : uploadFile.type.startsWith("audio") ? "video" : "auto";
  const url = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/${resourceType}/upload`;
  const res = await fetch(url, { method: "POST", body: formData });
  if (!res.ok) { const err = await res.json().catch(() => ({})); throw new Error(err.error?.message || "Erro no upload"); }
  const data = await res.json();
  return data.secure_url;
}

const CATEGORIES_CONFIG = [
  { value: 'testemunho', labelKey: 'mural.categories.testemunho', color: '#f97316' },
  { value: 'louvor',     labelKey: 'mural.categories.louvor',     color: '#a855f7' },
  { value: 'reflexao',   labelKey: 'mural.categories.reflexao',   color: '#3b82f6' },
  { value: 'versiculo',  labelKey: 'mural.categories.versiculo',  color: '#22c55e' },
  { value: 'foto',       labelKey: 'mural.categories.foto', color: '#f43f5e' },
];

const getCatColor = (type) => CATEGORIES_CONFIG.find(c => c.value === type)?.color || '#888';

function MiniAudioPlayer({ src, isPlaying: propIsPlaying, onPlay: externalOnPlay, onPause: externalOnPause, onEnded: externalOnEnded }) {
  const { t } = useTranslation(); // Add useTranslation
  const audioRef = useRef(null);
  const [internalPlaying, setInternalPlaying] = useState(false);
  const playing = propIsPlaying !== undefined ? propIsPlaying : internalPlaying;
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (audioRef.current) {
      if (playing) {
        audioRef.current.play().catch(e => console.error("Error playing audio:", e));
      } else {
        audioRef.current.pause();
      }
    }
  }, [playing]);

  const toggle = async () => {
    if (!audioRef.current) return;
    try {
      if (internalPlaying) { audioRef.current.pause(); }
      else { await audioRef.current.play(); }
      setInternalPlaying(!internalPlaying);
    } catch (err) { console.error(err); }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current?.duration) {
      setProgress((audioRef.current.currentTime / audioRef.current.duration) * 100);
    }
  };

  const handleEnded = () => {
    if (propIsPlaying === undefined) setInternalPlaying(false);
    setProgress(0);
    externalOnEnded && externalOnEnded();
  };

  const handleOnPlay = () => {
    if (propIsPlaying === undefined) setInternalPlaying(true);
    externalOnPlay && externalOnPlay();
  };

  const handleOnPause = () => {
    if (propIsPlaying === undefined) setInternalPlaying(false);
    externalOnPause && externalOnPause();
  };

  const { user: guestUser } = useAuth();
  const isGuest = !guestUser && new URLSearchParams(window.location.search).get('guest') === '1';
  const guestBar = isGuest ? (
    <div>
      <div style={{background:'#1a1a2e',padding:'10px 20px',display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:8}}>
        <div style={{display:'flex',alignItems:'center',gap:6}}>
          <img src="/logo.svg" alt="logo" style={{width:28,height:28}} />
          <span style={{color:'#f0c040',fontWeight:700,fontSize:15}}>Sigo com Fe</span>
        </div>
        <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
          <a href="/mural" style={{color:'rgba(255,255,255,0.85)',fontSize:12,textDecoration:'none',padding:'4px 10px',borderRadius:16,background:'rgba(255,255,255,0.1)'}}>Mural</a>
          <a href="/register" style={{color:'#1a1a2e',fontSize:12,fontWeight:700,background:'#f0c040',padding:'5px 14px',borderRadius:20,textDecoration:'none'}}>Criar conta</a>
          <a href="/login" style={{color:'#fff',fontSize:12,fontWeight:700,background:'rgba(255,255,255,0.15)',padding:'5px 14px',borderRadius:20,textDecoration:'none'}}>Entrar</a>
        </div>
      </div>
      <div style={{background:'#0077b6',padding:'8px 20px',textAlign:'center'}}>
        <span style={{color:'#fff',fontSize:12}}>Voce esta visitando como convidado. </span>
        <a href="/register" style={{color:'#fff',fontWeight:700,fontSize:12}}>Registe-se para participar!</a>
      </div>
    </div>
  ) : null;

  return (
    <div>
      {guestBar}
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(102,126,234,0.12)', border: '1px solid rgba(102,126,234,0.3)', borderRadius: 12, padding: '6px 10px', marginTop: 6 }}>
      <audio
        ref={audioRef}
        src={src}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
        onPlay={handleOnPlay}
        onPause={handleOnPause}
        preload="metadata"
      />
      <button onClick={toggle} style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg,#7a9e7e,#c4b89a)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', flexShrink: 0 }}>
        {playing ? <Pause size={16} /> : <Play size={16} />}
      </button>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 11, color: '#888', marginBottom: 4 }}>{t('mural.musicLabel')}</div>
        <div style={{ height: 4, background: '#e2e8f0', borderRadius: 2 }}>
          <div style={{ width: `${progress}%`, height: '100%', background: 'linear-gradient(90deg,#7a9e7e,#c4b89a)', transition: 'width 0.1s' }} />
        </div>
      </div>
    </div>
    </div>
  );
}

// ï¿½"?ï¿½"?ï¿½"? Music Picker Modal ï¿½"?ï¿½"?ï¿½"?ï¿½"?ï¿½"?ï¿½"?ï¿½"?ï¿½"?ï¿½"?ï¿½"?ï¿½"?ï¿½"?ï¿½"?ï¿½"?ï¿½"?ï¿½"?ï¿½"?ï¿½"?ï¿½"?ï¿½"?ï¿½"?ï¿½"?ï¿½"?ï¿½"?ï¿½"?ï¿½"?ï¿½"?ï¿½"?ï¿½"?ï¿½"?ï¿½"?ï¿½"?ï¿½"?ï¿½"?ï¿½"?ï¿½"?ï¿½"?ï¿½"?ï¿½"?ï¿½"?ï¿½"?ï¿½"?ï¿½"?ï¿½"?ï¿½"?ï¿½"?ï¿½"?ï¿½"?ï¿½"?ï¿½"?ï¿½"?ï¿½"?ï¿½"?ï¿½"?ï¿½"?
function MusicPickerModal({ onClose, onSelect }) {
  const { t } = useTranslation();
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');

  useEffect(() => {
    fetch(`${API}/music?limit=20`)
      .then(r => r.json())
      .then(d => setSongs(Array.isArray(d.songs) ? d.songs : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = songs.filter(s =>
    !query || s.title.toLowerCase().includes(query.toLowerCase()) || (s.artist || '').toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 3000 }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: 'white', borderRadius: '20px 20px 0 0', width: '100%', maxWidth: 900, maxHeight: '50vh', display: 'flex', flexDirection: 'column', padding: 20, boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>🎵 {t('mural.pickMusic')}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888' }}><X size={20} /></button>
        </div>
        <div style={{ position: 'relative', marginBottom: 12 }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder={t('music.searchPlaceholder')}
            style={{ width: '100%', padding: '8px 10px 8px 30px', borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
        </div>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: 24, color: '#888' }}>A carregar músicas...</div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 24, color: '#888', fontSize: 14 }}>{t('music.noSongs')}</div>
          ) : filtered.map(song => (
            <div key={song.id} onClick={() => { onSelect(song); onClose(); }} style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '10px 8px', borderRadius: 10, cursor: 'pointer',
              borderBottom: '1px solid #f0f0f0',
            }}
              onMouseEnter={e => e.currentTarget.style.background = '#f5f5f5'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: 'linear-gradient(135deg,#7a9e7e,#c4b89a)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 18 }}>🎵</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{song.title}</div>
                <div style={{ fontSize: 11, color: '#888' }}>{song.artist}</div>
              </div>
              <audio controls preload="none" src={song.url} onClick={e => e.stopPropagation()} style={{ width: 145, height: 28 }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PostCard({ post, onLike, onDelete, token, user, isPlaying, onVideoPlay, onVideoPause, onVideoNode, soundEnabled, onCommentAdded }) {
  const { t } = useTranslation(); // Add useTranslation
  const color = getCatColor(post.category || post.type);
  const [showComments, setShowComments] = useState(false);
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState(post.comments || []);
  const [commentError, setCommentError] = useState('');
  const loadComments = async () => {
    try {
      const res = await fetch(`${API}/feed/${post.id}/comments`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      if (res.ok) {
        const data = await res.json();
        setComments(data.comments || data || []);
      }
    } catch (e) { console.error('Error loading comments:', e); }
  };

  const [reportOpen, setReportOpen] = useState(false);
  const [commentAmens, setCommentAmens] = useState({});
  const [replyTo, setReplyTo] = useState(null);

  const toggleCommentAmen = (commentId) => {
    setCommentAmens(prev => ({
      ...prev,
      [commentId]: !prev[commentId]
    }));
  };
  const authorName = repairMojibake(post.full_name || post.author_name || post.authorName) || t('common.user');
  const postContent = repairMojibake(post.content || '');
  const authorInitials = authorName.slice(0, 2).toUpperCase();
  const mediaUrl = post.media_url || post.mediaUrl;
  const musicUrl = post.audio_url || post.musicUrl;
  const isOwner = user != null && (user.id === post.author_id || user.id === post.user_id);

  const videoRef = useRef(null);
  const recordRef = useRef(null);
  const [isMuted, setIsMuted] = useState(true);
  const [imageModal, setImageModal] = useState(null);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const postCardRef = useRef(null);

  const isVideo = post.media_type === 'video' || Boolean(mediaUrl && mediaUrl.match(/\.(mp4|webm|mov|ogg)(\?|$)/i));
  const isAudio = post.media_type === 'audio' || Boolean(mediaUrl && mediaUrl.match(/\.(mp3|wav|aac|m4a|ogg)(\?|$)/i));
  const isImage = Boolean(mediaUrl) && !isVideo && !isAudio;
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !isVideo) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && entry.intersectionRatio >= 0.25) {
        video.muted = true;
        video.defaultMuted = true;
        video.play().catch(() => {});
      } else if (!entry.isIntersecting) {
        video.pause();
      }
    }, { threshold: [0.1, 0.25, 0.5] });
    observer.observe(video);
    return () => observer.disconnect();
  }, [isVideo]);
  // Som automatico so e permitido pelo navegador depois de uma acao do utilizador.
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !isVideo) return;
    // Vídeos iniciam silenciosos: assim o navegador permite a reprodução automática.
    video.muted = true;
    // Mantém o volume preparado em 50%; o mute continua ativo para permitir autoplay.
    video.volume = 0.5;
    setIsMuted(true);
  }, [isVideo, mediaUrl]);
  const videoPoster = isVideo && mediaUrl && mediaUrl.includes('cloudinary.com') ? mediaUrl.replace('/video/upload/', '/video/upload/so_0,w_600/').replace(/\.(mp4|webm|mov|ogg)/i, '.jpg') : null;

  // Effect to manage video play/pause based on `isPlaying` prop
  useEffect(() => {
    if (videoRef.current && isVideo) {
      videoRef.current.muted = isMuted; // Sync video muted state
      if (isPlaying) {
        videoRef.current.play().catch(e => console.error("Error playing video:", e));
        if (!isMuted) { // Only set volume if not muted by user
          videoRef.current.volume = musicUrl ? 0.3 : 1.0; // Set video volume to 30% if music, else 100%
        }
        if (musicUrl) {
            setIsMusicPlaying(true);
        }
      } else {
        videoRef.current.pause();
        if (musicUrl) {
            setIsMusicPlaying(false);
        }
      }
    }
  }, [isPlaying, isVideo, musicUrl, isMuted]);

  // Effect for image + music autoplay (IntersectionObserver)
  useEffect(() => {
    if (!postCardRef.current || !musicUrl || !isImage) return; // Only apply for images with music

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsMusicPlaying(true);
        } else {
          setIsMusicPlaying(false);
        }
      },
      { threshold: 0.7 } // Threshold for image music autoplay remains at 70%
    );

    observer.observe(postCardRef.current);

    return () => {
      observer.disconnect();
    };
  }, [musicUrl, isImage]);
  const handleInternalVideoPlay = () => {
    onVideoPlay(post.id); // Notify parent that this video is playing
  };

  const handleInternalVideoPause = () => {
    onVideoPause(post.id); // Notify parent that this video is paused
  };

  const toggleMute = () => {
    setIsMuted(prev => !prev);
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      // If unmuting and there's music, set video volume to 0.3
      // Otherwise, set to 1.0 (full volume)
      if (!isMuted) { // if it was muted and now unmuting
          videoRef.current.volume = musicUrl ? 0.3 : 1.0;
      } else { // if it was unmuted and now muting
          videoRef.current.volume = 0.5;
      }
    }
  };

  const submitComment = async (e) => {
    e.preventDefault();
    const value = comment.trim();
    if (!token) {
      setCommentError('Inicia sessão para comentar.');
      return;
    }
    if (!value) {
      setCommentError('Escreve um comentário antes de enviar.');
      return;
    }
    setCommentError('');
    try {
      const res = await fetch(`${API}/feed/${post.id}/comments`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: value })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.comment) throw new Error(data.error || 'Não foi possível enviar o comentário.');
      setComments(prev => [...prev, data.comment]);
      setComment('');
      onCommentAdded?.(post.id);
    } catch (error) {
      setCommentError(error.message || 'Não foi possível enviar o comentário.');
    }
  };

  return (
    <div ref={postCardRef} style={{ background: 'white', borderRadius: 16, border: `1px solid ${color}33`, overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', marginBottom: 16 }}>
      <div style={{ padding: '14px 16px 10px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <div onClick={()=>window.location.href='/perfil/'+(post.author_id||post.user_id)} style={{ width: 42, height: 42, borderRadius: '50%', background: `linear-gradient(135deg,${color},${color}88)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: 14, flexShrink: 0, cursor:'pointer', overflow:'hidden' }}>
          {post.author_avatar||post.avatar_url ? <img src={post.author_avatar||post.avatar_url} style={{width:'100%',height:'100%',objectFit:'cover'}}/> : authorInitials}
        </div>
        <div style={{ flex: 1 }}>
          <div onClick={()=>window.location.href='/perfil/'+(post.author_id||post.user_id)} style={{ fontWeight: 600, fontSize: 14, color: '#1a1a2e', cursor:'pointer' }}>{authorName}</div>
          <div style={{ fontSize: 12, color: '#888' }}>{repairMojibake(post.church) || ''}{post.church ? ' · ' : ''}{post.created_at ? new Date(post.created_at).toLocaleDateString(t('locale')) : t('time.now')}</div>
        </div>
        <span style={{ fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 20, background: `${color}18`, color, border: `1px solid ${color}44` }}>
          {CATEGORIES_CONFIG.find(c => c.value === (post.category || post.type))?.labelKey ? t(CATEGORIES_CONFIG.find(c => c.value === (post.category || post.type)).labelKey) : (post.category || post.type)}
        </span>
        {isOwner && (
          <button onClick={() => onDelete(post.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ccc', padding: 4, borderRadius: 6 }}
            onMouseEnter={e => e.currentTarget.style.color = '#e11d48'} onMouseLeave={e => e.currentTarget.style.color = '#ccc'}>
            <Trash2 size={16} />
          </button>
        )}
      </div>

      {isVideo && (
        <div style={{ background: '#000', position: 'relative' }}>
          <video
            ref={(node) => { videoRef.current = node; onVideoNode?.(post.id, node); }}
            data-post-id={post.id}
            src={mediaUrl}
            controls
            autoPlay
            playsInline
            defaultMuted
            preload="metadata"
            muted={isMuted}
            poster={videoPoster || undefined}
            style={{ width: '100%', maxHeight: 400, objectFit: 'contain', display: 'block' }}
            onCanPlay={e => { e.currentTarget.muted = true; e.currentTarget.play().catch(() => {}); }}
            onPlay={handleInternalVideoPlay}
            onPause={handleInternalVideoPause}
          />
        </div>
      )}      {isImage && (
        <div style={{ width: '100%', height: 'clamp(220px, 48vw, 420px)', overflow: 'hidden', background: 'linear-gradient(135deg,#f3f6fb,#eef1f8)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <img src={mediaUrl} alt="post" loading="lazy" onClick={() => setImageModal(mediaUrl)} style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block', cursor: 'zoom-in' }} />
        </div>
      )}


      {musicUrl && (isImage || isVideo) && (
        <div style={{ padding: '10px 16px 0', background: '#fbfcff' }}>
          <div style={{ fontSize: 12, color: '#64748b', fontWeight: 700, marginBottom: 6 }}>Musica desta publicacao</div>
          <MiniAudioPlayer src={musicUrl} isPlaying={isMusicPlaying} onPlay={() => setIsMusicPlaying(true)} onPause={() => setIsMusicPlaying(false)} onEnded={() => setIsMusicPlaying(false)} />
        </div>
      )}
      <div style={{ padding: '12px 16px' }}>
        {(post.category || post.type) === 'versiculo' ? (
          <div style={{ background: `linear-gradient(135deg,${color}12,white)`, borderLeft: `4px solid ${color}`, borderRadius: 8, padding: '12px 14px' }}>
            <p style={{ fontStyle: 'italic', color: '#333', fontSize: 15, lineHeight: 1.6, margin: 0 }}>"{postContent}"</p>
            {post.verse_reference && <p style={{ fontWeight: 700, color, marginTop: 8, marginBottom: 0, fontSize: 13 }}>— {repairMojibake(post.verse_reference)}</p>}
          </div>
        ) : (
          <><p style={{ color: '#333', fontSize: 14, lineHeight: 1.65, margin: 0 }}>{postContent}</p>{musicUrl && !isImage && !isVideo && (<MiniAudioPlayer src={musicUrl} onPlay={()=>setIsMusicPlaying(true)} onPause={()=>setIsMusicPlaying(false)} onEnded={()=>setIsMusicPlaying(false)} />)}</>
        )}
      </div>

      <div style={{ padding: '8px 16px 12px', borderTop: '1px solid #f0f0f0', display: 'flex', gap: 8, alignItems: 'center', justifyContent: 'space-around' }}>
        <button onClick={() => onLike(post.id)} style={{ display: 'flex', alignItems: 'center', gap: 6, background: post.liked ? '#fff0f3' : 'none', border: post.liked ? '1px solid #fecdd3' : 'none', cursor: 'pointer', color: post.liked ? '#e11d48' : '#888', fontSize: 13, fontWeight: 700, padding: '6px 12px', borderRadius: 20, transition: 'all 0.2s' }}>
          <Heart size={18} fill={post.liked ? '#e11d48' : 'none'} />
          {post.like_count || post.amemCount || 0} {t('mural.amen')}
        </button>
        <button onClick={() => { if (!showComments) loadComments(); setShowComments(!showComments); }} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', color: '#888', fontSize: 13, fontWeight: 600, padding: '6px 10px', borderRadius: 8 }}>
          <MessageCircle size={18} /> {post.comment_count || post.commentCount || comments.length} {t('common.comment')}
        </button>
        <button onClick={() => { const url = window.location.origin + "/mural?post=" + post.id; if (navigator.share) { navigator.share({ title: "Sigo com Fé", text: postContent, url }); } else { navigator.clipboard.writeText(url); alert("Link copiado!"); } }} style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer", color: "#888", fontSize: 13, marginLeft: "auto", padding: "6px 10px", borderRadius: 8 }}><Share2 size={18} /> {t("common.share")}</button>
        {user && !isOwner && (
          <button onClick={() => setReportOpen(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ccc', padding: '6px 8px', borderRadius: 8, display: 'flex', alignItems: 'center' }} title={t('report.title')}
            onMouseEnter={e => e.currentTarget.style.color = '#e11d48'} onMouseLeave={e => e.currentTarget.style.color = '#ccc'}>
            <Flag size={15} />
          </button>
        )}
      </div>
      {imageModal && (
        <div onClick={() => setImageModal(null)} style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.95)',zIndex:9999,display:'flex',alignItems:'center',justifyContent:'center'}}>
          <img src={imageModal} alt='' style={{maxWidth:'95vw',maxHeight:'95vh',objectFit:'contain',borderRadius:12}} />
          <button onClick={() => setImageModal(null)} style={{position:'fixed',top:16,right:16,background:'rgba(255,255,255,0.2)',border:'none',borderRadius:'50%',width:40,height:40,color:'white',cursor:'pointer',fontSize:24}}>x</button>
        </div>
      )}
      {reportOpen && (
        <ReportModal type="post" targetId={post.id} targetName={null} onClose={() => setReportOpen(false)} />
      )}

      {showComments && (
        <div style={{ padding: '0 16px 14px', borderTop: '1px solid #f0f0f0' }}>
          {comments.length === 0 && (
            <p style={{ color: '#aaa', fontSize: 13, textAlign: 'center', padding: '12px 0' }}>{t('mural.beFirstComment', 'Seja o primeiro a comentar')}</p>
          )}
          {comments.map((c, i) => (
            <div key={c.id || i} style={{ padding: '10px 0', borderBottom: '1px solid #f5f5f5' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'linear-gradient(135deg,#7a9e7e,#c4b89a)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: 12, flexShrink: 0 }}>
                  {(c.full_name || c.author_name || 'U').charAt(0).toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ background: '#f7f7f7', borderRadius: 12, padding: '8px 12px' }}>
                    <span style={{ fontWeight: 700, color: '#1a1a2e', fontSize: 13 }}>{repairMojibake(c.full_name || c.author_name) || t('common.user')}</span>
                    <p style={{ color: '#444', fontSize: 13, margin: '4px 0 0', lineHeight: 1.5 }}>{repairMojibake(c.content)}</p>
                  </div>
                  <div style={{ display: 'flex', gap: 12, marginTop: 4, paddingLeft: 4 }}>
                    <button onClick={() => toggleCommentAmen(c.id || i)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: commentAmens[c.id || i] ? '#e11d48' : '#888', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 3 }}>{t('mural.amen', 'Amen')} {commentAmens[c.id || i] ? 'OK' : ''}</button>
                    {user && (
                      <button onClick={() => setReplyTo(replyTo === (c.id || i) ? null : (c.id || i))} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: '#888', fontWeight: 600 }}>{t('mural.reply', 'Responder')}</button>
                    )}
                  </div>
                  {replyTo === (c.id || i) && user && (
                    <form onSubmit={(e) => { e.preventDefault(); submitComment(e); setReplyTo(null); }} style={{ display: 'flex', gap: 6, marginTop: 6 }}>
                      <input value={comment} onChange={e => setComment(e.target.value)} placeholder={`Responder a ${c.full_name || 'utilizador'}...`} style={{ flex: 1, padding: '6px 10px', borderRadius: 16, border: '1px solid #e2e8f0', fontSize: 12, outline: 'none' }} autoFocus />
                      <button type="submit" style={{ padding: '6px 12px', borderRadius: 16, background: 'linear-gradient(135deg,#7a9e7e,#c4b89a)', border: 'none', color: 'white', cursor: 'pointer', fontSize: 12 }}>Enviar</button>
                    </form>
                  )}
                </div>
              </div>
            </div>
          ))}
          {commentError && <p style={{ color: '#b42318', fontSize: '.86rem', margin: '8px 0' }}>{commentError}</p>}
          {user && (
            <form onSubmit={submitComment} style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,#7a9e7e,#c4b89a)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: 13, flexShrink: 0 }}>
                {(user?.full_name || 'U').charAt(0).toUpperCase()}
              </div>
              <input value={comment} onChange={e => setComment(e.target.value)} placeholder={t('mural.commentPlaceholder')} style={{ flex: 1, padding: '8px 14px', borderRadius: 20, border: '1px solid #e2e8f0', fontSize: 13, outline: 'none', background: '#f7f7f7' }} />
              <button type="submit" style={{ padding: '8px 14px', borderRadius: 20, background: 'linear-gradient(135deg,#7a9e7e,#c4b89a)', border: 'none', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}><Send size={14} /></button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}

const MULTILINGUAL_SURPRISES = [
  {
    id: 'courage', icon: '🦁', color: '#f59e0b',
    title: { pt: 'Baú da Coragem', es: 'Cofre de Valentía', en: 'Chest of Courage', de: 'Mut-Schatztruhe', fr: 'Coffre du Courage', ro: 'Cufărul Curajului', ru: 'Сундук мужества' },
    hint: { pt: 'Fortaleça o coração', es: 'Fortalece el corazón', en: 'Strengthen your heart', de: 'Stärke dein Herz', fr: 'Fortifie ton cœur', ro: 'Întărește-ți inima', ru: 'Укрепи сердце' },
    ref: { pt: 'Isaías 41:10', es: 'Isaías 41:10', en: 'Isaiah 41:10', de: 'Jesaja 41,10', fr: 'Ésaïe 41:10', ro: 'Isaia 41:10', ru: 'Исаия 41:10' },
    text: {
      pt: 'Não temas, porque eu sou contigo; não te assombres, porque eu sou teu Deus; eu te fortaleço, e te ajudo, e te sustento com a minha destra fiel.',
      es: 'No temas, porque yo estoy contigo; no desmayes, porque yo soy tu Dios que te esfuerzo; siempre te ayudaré, siempre te sustentaré con la diestra de mi justicia.',
      en: 'Fear thou not; for I am with thee: be not dismayed; for I am thy God: I will strengthen thee; yea, I will help thee.',
      de: 'Fürchte dich nicht, ich bin mit dir; weiche nicht, denn ich bin dein Gott. Ich stärke dich, ich helfe dir auch.',
      fr: 'Ne crains rien, car je suis avec toi; ne promène pas des regards inquiets, car je suis ton Dieu; je te fortifie, je viens à ton secours.',
      ro: 'Nu te teme, căci Eu sunt cu tine; nu te uita cu îngrijorare, căci Eu sunt Dumnezeul tău; Eu te întăresc, tot Eu îți vin în ajutor.',
      ru: 'не бойся, ибо Я с тобою; не смущайся, ибо Я Бог твой; Я укреплю тебя, и помогу тебе.'
    }
  },
  {
    id: 'hope', icon: '🌿', color: '#42a77a',
    title: { pt: 'Baú da Esperança', es: 'Cofre de Esperanza', en: 'Chest of Hope', de: 'Hoffnungs-Schatztruhe', fr: 'Coffre de l’Espérance', ro: 'Cufărul Speranței', ru: 'Сундук надежды' },
    hint: { pt: 'Uma promessa para hoje', es: 'Una promesa para hoy', en: 'A promise for today', de: 'Eine Verheißung für heute', fr: 'Une promesse pour aujourd’hui', ro: 'O promisiune pentru azi', ru: 'Обетование на сегодня' },
    ref: { pt: 'Jeremias 29:11', es: 'Jeremías 29:11', en: 'Jeremiah 29:11', de: 'Jeremia 29,11', fr: 'Jérémie 29:11', ro: 'Ieremia 29:11', ru: 'Иеремия 29:11' },
    text: {
      pt: 'Porque eu bem sei os pensamentos que tenho a vosso respeito, diz o Senhor; pensamentos de paz, e não de mal, para vos dar o fim que esperais.',
      es: 'Porque yo sé los pensamientos que tengo acerca de vosotros, dice el Señor, pensamientos de paz, y no de mal, para daros el fin que esperáis.',
      en: 'For I know the thoughts that I think toward you, saith the Lord, thoughts of peace, and not of evil, to give you an expected end.',
      de: 'Denn ich weiß wohl, was ich für Gedanken über euch habe, spricht der Herr: Gedanken des Friedens und nicht des Leides, dass ich euch gebe Zukunft und Hoffnung.',
      fr: 'Car je connais les projets que j’ai formés sur vous, dit l’Éternel, projets de paix et non de malheur, afin de vous donner un avenir et de l’espérance.',
      ro: 'Căci Eu știu gândurile pe care le am cu privire la voi, zice Domnul, gânduri de pace și nu de nenorocire, ca să vă dau un viitor și o nădejde.',
      ru: 'Ибо только Я знаю намерения, какие имею о вас, говорит Господь, намерения во благо, а не на зло, чтобы дать вам будущность и надежду.'
    }
  },
  {
    id: 'guidance', icon: '🕊️', color: '#7651b8',
    title: { pt: 'Baú da Direção', es: 'Cofre de Dirección', en: 'Chest of Guidance', de: 'Schatztruhe der Führung', fr: 'Coffre de la Direction', ro: 'Cufărul Călăuzirii', ru: 'Сундук направления' },
    hint: { pt: 'Sabedoria para o caminho', es: 'Sabiduría para tu camino', en: 'Wisdom for your path', de: 'Weisheit für deinen Weg', fr: 'Sagesse pour ton chemin', ro: 'Înțelepciune pentru drumul tău', ru: 'Мудрость для пути' },
    ref: { pt: 'Provérbios 3:5-6', es: 'Proverbios 3:5-6', en: 'Proverbs 3:5-6', de: 'Sprüche 3,5-6', fr: 'Proverbes 3:5-6', ro: 'Proverbe 3:5-6', ru: 'Притчи 3:5-6' },
    text: {
      pt: 'Confia no Senhor de todo o teu coração, e não te estribes no teu próprio entendimento. Reconhece-o em todos os teus caminhos, e ele endireitará as tuas veredas.',
      es: 'Fíate del Señor de todo tu corazón, y no te apoyes en tu propia prudencia. Reconócelo en todos tus caminos, y él enderezará tus veredas.',
      en: 'Trust in the Lord with all thine heart; and lean not unto thine own understanding. In all thy ways acknowledge him, and he shall direct thy paths.',
      de: 'Verlass dich auf den Herrn von ganzem Herzen und verlass dich nicht auf deinen Verstand; sondern gedenke an ihn in allen deinen Wegen, so wird er dich recht führen.',
      fr: 'Confie-toi en l’Éternel de tout ton cœur, et ne t’appuie pas sur ta sagesse; reconnais-le dans toutes tes voies, et il aplanira tes sentiers.',
      ro: 'Încrede-te în Domnul din toată inima ta și nu te bizui pe înțelepciunea ta. Recunoaște-L în toate căile tale, și El îți va netezi cărările.',
      ru: 'Надейся на Господа всем сердцем твоим и не полагайся на разум твой. Во всех путях твоих познавай Его, и Он направит стези твои.'
    }
  }
];

function DailySurpriseBoxes({ onPublish, publishing }) {
  const { i18n } = useTranslation();
  const [message, setMessage] = useState(null);
  const [showBoxes, setShowBoxes] = useState(false);
  const [openingBox, setOpeningBox] = useState('');
  const today = new Date().toISOString().slice(0, 10);
  const storageKey = `sigo_mural_surprise_v3_${today}`;
  const lang = (i18n.language || navigator.language || 'pt').split('-')[0];
  const copy = {
    choose: { pt: 'Escolha uma surpresa', es: 'Elige una sorpresa', en: 'Choose a surprise', de: 'Wähle eine Überraschung', fr: 'Choisis une surprise', ro: 'Alege o surpriză', ru: 'Выберите сюрприз' },
    intro: { pt: 'Uma palavra especial para a sua caminhada', es: 'Una palabra especial para tu camino', en: 'A special word for your journey', de: 'Ein besonderes Wort für deinen Weg', fr: 'Une parole spéciale pour ton chemin', ro: 'Un cuvânt special pentru drumul tău', ru: 'Особое слово для вашего пути' },
    done: { pt: 'Você já recebeu sua palavra hoje', es: 'Ya recibiste tu palabra de hoy', en: "You already received today's word", de: 'Du hast dein Wort für heute bereits erhalten', fr: 'Tu as déjà reçu ta parole du jour', ro: 'Ai primit deja cuvântul pentru astăzi', ru: 'Вы уже получили слово на сегодня' },
    back: { pt: 'Voltar às caixinhas', es: 'Volver a las cajitas', en: 'Back to the boxes', de: 'Zurück zu den Kästchen', fr: 'Retour aux boîtes', ro: 'Înapoi la căsuțe', ru: 'Вернуться к коробочкам' },
    saved: { pt: 'A sua palavra de hoje continua guardada.', es: 'Tu palabra de hoy sigue guardada.', en: 'Your word for today is still saved.', de: 'Dein Wort für heute bleibt gespeichert.', fr: 'Ta parole du jour reste enregistrée.', ro: 'Cuvântul tău de astăzi rămâne salvat.', ru: 'Ваше слово на сегодня сохранено.' },
    share: { pt: 'Compartilhar esta palavra', es: 'Compartir esta palabra', en: 'Share this word', de: 'Dieses Wort teilen', fr: 'Partager cette parole', ro: 'Distribuie acest cuvânt', ru: 'Поделиться этим словом' },
    publish: { pt: 'Publicar no meu mural', es: 'Publicar en mi mural', en: 'Post on my wall', de: 'In meinem Feed veröffentlichen', fr: 'Publier sur mon mur', ro: 'Publică pe muralul meu', ru: 'Опубликовать на моей стене' },
    publishing: { pt: 'Publicando...', es: 'Publicando...', en: 'Posting...', de: 'Wird veröffentlicht...', fr: 'Publication...', ro: 'Se publică...', ru: 'Публикация...' },
    source: { pt: 'Textos bíblicos em domínio público', es: 'Textos bíblicos de dominio público', en: 'Public-domain Bible texts', de: 'Bibeltexte gemeinfrei', fr: 'Textes bibliques du domaine public', ro: 'Texte biblice din domeniul public', ru: 'Библейские тексты в общественном достоянии' }
  };
  useEffect(() => { try { const saved = JSON.parse(localStorage.getItem(storageKey)); if (saved) setMessage(saved); } catch (_) {} }, [storageKey]);
  const choose = box => {
    if (message) return;
    const categories = { courage: 'coragem', hope: 'esperanca', guidance: 'direcao' };
    const list = surpriseMessages.filter(item => item.category === categories[box.id]);
    const start = Date.UTC(new Date().getUTCFullYear(), 0, 1);
    const day = Math.floor((Date.now() - start) / 86400000);
    const verse = list[day % list.length];
    const value = { ...box, ref: Object.fromEntries(['pt','es','en','de','fr','ro','ru'].map(locale => [locale, verse.ref])), text: verse.texts };
    setMessage(value);
    localStorage.setItem(storageKey, JSON.stringify(value));
  };
  const openChest = box => {
    if (message || openingBox) return;
    setOpeningBox(box.id);
    window.setTimeout(() => choose(box), 560);
  };
  useEffect(() => {
    const styleId = 'sf-mural-chest-effect';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `.sf-mural-chest{position:relative!important;overflow:visible!important;background:linear-gradient(155deg,#a96525,#512307 62%,#2c1205)!important;border:2px solid #f5ca5e!important;box-shadow:0 8px 0 #3a1806,0 15px 25px rgba(117,73,12,.28)!important;animation:sfChestFloat 2.8s ease-in-out infinite}.sf-mural-chest:before{content:'';position:absolute;left:7px;right:7px;top:-10px;height:25px;border:2px solid #f7d171;border-bottom:0;border-radius:11px 11px 4px 4px;background:linear-gradient(#d99a42,#754015);transform-origin:bottom;transition:transform .5s}.sf-mural-chest:after{content:'✦  ✧  ✦';position:absolute;top:-30px;left:0;right:0;color:#ffe99b;font-size:16px;opacity:.9;animation:sfChestSparkle 1.7s ease-in-out infinite}.sf-mural-chest.sf-opening:before{transform:rotateX(70deg) translateY(-8px)}.sf-mural-chest.sf-opening:after{animation:sfChestBurst .55s ease-out forwards}.sf-opened-chest{position:relative;overflow:hidden;margin:18px auto 10px;max-width:680px;padding:34px 24px 25px;border:2px solid #f7d171;border-radius:16px;background:linear-gradient(155deg,#b66f27,#552407 58%,#2e1205);box-shadow:0 10px 0 #3a1806,0 20px 28px rgba(117,73,12,.28);color:#fff8df}.sf-opened-chest:before{content:'';position:absolute;left:18px;right:18px;top:0;height:28px;border:2px solid #f7d171;border-top:0;border-radius:0 0 16px 16px;background:linear-gradient(#e0a047,#794116)}.sf-opened-chest:after{content:'✦   ✧   ✦';position:absolute;top:6px;left:0;right:0;text-align:center;color:#fff0a7;letter-spacing:18px;animation:sfChestSparkle 1.7s ease-in-out infinite}@keyframes sfChestFloat{50%{transform:translateY(-5px)}}@keyframes sfChestSparkle{50%{opacity:.25;transform:translateY(-5px)}}@keyframes sfChestBurst{to{opacity:0;transform:translateY(-30px) scale(1.8)}}@media (prefers-reduced-motion:reduce){.sf-mural-chest,.sf-mural-chest:after,.sf-opened-chest:after{animation:none!important}}`;
      document.head.appendChild(style);
    }
    const titles = MULTILINGUAL_SURPRISES.flatMap(box => Object.values(box.title));
    const buttons = [...document.querySelectorAll('button')].filter(button => titles.includes(button.querySelector('strong')?.textContent?.trim()));
    const handlers = buttons.map(button => {
      button.classList.add('sf-mural-chest');
      const box = MULTILINGUAL_SURPRISES.find(item => Object.values(item.title).includes(button.querySelector('strong')?.textContent?.trim()));
      const handler = event => { if (!message && box) { event.stopPropagation(); button.classList.add('sf-opening'); openChest(box); } };
      button.addEventListener('click', handler, true);
      return [button, handler];
    });
    return () => handlers.forEach(([button, handler]) => button.removeEventListener('click', handler, true));
  }, [lang, message, openingBox, showBoxes]);
  const verseText = message ? (message.text[lang] || message.text.en || message.text.pt) : '';
  const verseRef = message ? (message.ref[lang] || message.ref.en || message.ref.pt) : '';
  const share = async () => { if (!message) return; const body = `${verseText}\n— ${verseRef}\nSigo com Fé`; try { if (navigator.share) await navigator.share({ title: 'Palavra do dia', text: body }); else await navigator.clipboard.writeText(body); } catch (_) {} };
  const publish = () => onPublish?.({ content: `“${verseText}”\n— ${verseRef}` });
  const showingMessage = message && !showBoxes;
  return (
    <section aria-label={copy.choose[lang] || copy.choose.pt} style={{ marginBottom: 20, padding: '18px 16px', borderRadius: 18, background: 'linear-gradient(135deg,#fffaf1,#f6f3ff)', border: '1px solid #eadff3', boxShadow: '0 8px 24px rgba(70,45,100,.08)' }}>
      {!showingMessage && <div style={{ textAlign: 'center', marginBottom: 14 }}>
        <div style={{ fontSize: 22 }}>✨</div>
        <h2 style={{ margin: '2px 0 3px', color: '#30204f', fontSize: 19 }}>{copy.choose[lang] || copy.choose.pt}</h2>
        <p style={{ margin: 0, color: '#756b80', fontSize: 12 }}>{copy.intro[lang] || copy.intro.pt}</p>
      </div>}
      {!showingMessage ? <div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 10 }}>
          {MULTILINGUAL_SURPRISES.map(box => <button key={box.id} type="button" onClick={() => choose(box)} disabled={Boolean(message)} style={{ border: 'none', borderRadius: 14, padding: '15px 8px', color: 'white', background: `linear-gradient(145deg,${box.color},${box.color}cc)`, cursor: message ? 'default' : 'pointer', minHeight: 105, opacity: message && message.id !== box.id ? .55 : 1, boxShadow: '0 6px 14px rgba(56,35,80,.16)', transition: 'transform .2s' }}>
            <span style={{ display: 'block', fontSize: 28, marginBottom: 6 }}>{box.icon}</span>
            <strong style={{ display: 'block', fontSize: 14 }}>{box.title[lang] || box.title.en || box.title.pt}</strong>
            <small style={{ display: 'block', marginTop: 5, opacity: .9, lineHeight: 1.2 }}>{box.hint[lang] || box.hint.en || box.hint.pt}</small>
          </button>)}
        </div>
        {message && <p style={{ margin: '12px 0 0', textAlign: 'center', color: '#756b80', fontSize: 12 }}>{copy.saved[lang] || copy.saved.pt}</p>}
      </div> : <div style={{ textAlign: 'center' }}>
        <div className="sf-opened-chest">
          <div style={{ position: 'relative', zIndex: 1, fontSize: 24, marginBottom: 8 }}>📜</div>
          <h2 style={{ position: 'relative', zIndex: 1, margin: '0 0 14px', color: '#fff5cf', fontSize: 20 }}>{copy.done[lang] || copy.done.pt}</h2>
          <p style={{ position: 'relative', zIndex: 1, margin: '0 auto 14px', maxWidth: 560, color: '#fffdf1', lineHeight: 1.65, fontSize: 15, fontStyle: 'italic' }}>“{verseText}”</p>
          <div style={{ position: 'relative', zIndex: 1, color: '#ffe39c', fontWeight: 700, fontSize: 13 }}>{verseRef}</div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, flexWrap: 'wrap', marginTop: 18 }}>
          <button type="button" onClick={() => setShowBoxes(true)} style={{ border: '1px solid #a96525', borderRadius: 20, padding: '9px 17px', color: '#6a340c', background: 'white', cursor: 'pointer', fontWeight: 700 }}>← {copy.back[lang] || copy.back.pt}</button>
          <button type="button" onClick={share} style={{ border: 'none', borderRadius: 20, padding: '9px 17px', color: '#fff7de', background: '#78410f', cursor: 'pointer', fontWeight: 700 }}>↗ {copy.share[lang] || copy.share.pt}</button>
          <button type="button" onClick={publish} disabled={publishing} style={{ border: 'none', borderRadius: 20, padding: '9px 17px', color: '#fff', background: '#5d987a', cursor: publishing ? 'wait' : 'pointer', fontWeight: 700, opacity: publishing ? .7 : 1 }}>✦ {publishing ? (copy.publishing[lang] || copy.publishing.pt) : (copy.publish[lang] || copy.publish.pt)}</button>
        </div>
      </div>}
      <div style={{ marginTop: 12, textAlign: 'center', color: '#9a8ca8', fontSize: 10 }}>{copy.source[lang] || copy.source.en}</div>
    </section>
  );
}

export default function MuralGrid() {
  const { t, i18n } = useTranslation();
  const soundCopy = {
    pt: { on: 'Som automático ativo', off: 'Ativar som automático' },
    es: { on: 'Sonido automático activado', off: 'Activar sonido automático' },
    de: { on: 'Automatischer Ton aktiv', off: 'Automatischen Ton aktivieren' },
    en: { on: 'Automatic sound on', off: 'Enable automatic sound' },
    fr: { on: 'Son automatique activé', off: 'Activer le son automatique' },
    ro: { on: 'Sunet automat activat', off: 'Activează sunetul automat' },
    ru: { on: 'Avtozvuk vkluchen', off: 'Vklyuchit avtozvuk' }
  };
  const currentLanguage = (i18n?.language || 'pt').slice(0, 2);
  const { user, token } = useAuth();
  const [posts, setPosts] = useState([]);
  const [actionError, setActionError] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('todas');
  const [viewMode, setViewMode] = useState('feed');
  const [soundEnabled, setSoundEnabled] = useState(() => localStorage.getItem('sigo_mural_sound') === 'on');
  const soundLabel = (soundCopy[currentLanguage] || soundCopy.pt)[soundEnabled ? 'on' : 'off'];
  const trackMuralAction = (name) => {
    if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
      window.gtag('event', 'mural_action', { action_name: name, page: 'mural' });
    }
  };
  const [showForm, setShowForm] = useState(false);
  const [postText, setPostText] = useState('');
  const [postVisibility, setPostVisibility] = useState('public');
  const [postCategory, setPostCategory] = useState('testemunho');
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);
  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(0);
  const [mediaDuration, setMediaDuration] = useState(0);
  const [showTrimmer, setShowTrimmer] = useState(false);
  const [mediaType, setMediaType] = useState(null);
  const [musicFile, setMusicFile] = useState(null);
  const [musicName, setMusicName] = useState(null);
  const [selectedMusicSong, setSelectedMusicSong] = useState(null);
  const [showMusicPicker, setShowMusicPicker] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [publishingSurprise, setPublishingSurprise] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const photoRef = useRef(null);
  const videoRef = useRef(null);
  const musicRef = useRef(null);
  const [activeLive, setActiveLive] = useState(null);
  const [showWelcome, setShowWelcome] = useState(() => localStorage.getItem('sigo_welcome_seen') !== '1');
  const welcomeCopy = {
    pt: { title: 'Bem-vindo ao Sigo com Fé', text: 'Comece em três passos simples para a comunidade conhecer você.', post: 'Fazer a primeira publicação', photo: 'Adicionar foto de perfil', duel: 'Jogar o Duelo Bíblico', close: 'Já entendi' },
    es: { title: 'Bienvenido a Sigo com Fé', text: 'Comienza con tres pasos sencillos para que la comunidad te conozca.', post: 'Hacer mi primera publicación', photo: 'Añadir foto de perfil', duel: 'Jugar el Duelo Bíblico', close: 'Ya lo entiendo' },
    en: { title: 'Welcome to Sigo com Fé', text: 'Start with three simple steps so the community can get to know you.', post: 'Make my first post', photo: 'Add a profile photo', duel: 'Play Bible Duel', close: 'Got it' },
    de: { title: 'Willkommen bei Sigo com Fé', text: 'Beginne mit drei einfachen Schritten, damit dich die Gemeinschaft kennenlernen kann.', post: 'Ersten Beitrag erstellen', photo: 'Profilfoto hinzufügen', duel: 'Bibelduell spielen', close: 'Verstanden' },
    fr: { title: 'Bienvenue sur Sigo com Fé', text: 'Commencez par trois étapes simples pour que la communauté vous connaisse.', post: 'Faire ma première publication', photo: 'Ajouter une photo de profil', duel: 'Jouer au Duel biblique', close: 'J’ai compris' },
    ro: { title: 'Bine ai venit la Sigo com Fé', text: 'Începe cu trei pași simpli pentru ca comunitatea să te cunoască.', post: 'Prima mea postare', photo: 'Adaugă o fotografie de profil', duel: 'Joacă Duelul Biblic', close: 'Am înțeles' },
    ru: { title: 'Добро пожаловать в Sigo com Fé', text: 'Начните с трёх простых шагов, чтобы сообщество могло вас узнать.', post: 'Сделать первую публикацию', photo: 'Добавить фото профиля', duel: 'Играть в Библейскую дуэль', close: 'Понятно' }
  };
  const welcome = welcomeCopy[currentLanguage] || welcomeCopy.pt;
  const dismissWelcome = () => { localStorage.setItem('sigo_welcome_seen', '1'); setShowWelcome(false); };

  // Informação clara para o Google e para quem partilha esta página.
  useEffect(() => {
    const seo = {
      pt: { title: 'Baús Bíblicos Diários: coragem, esperança e direção | Sigo com Fé', description: 'Abra um Baú Bíblico Diário e receba uma palavra de coragem, esperança ou direção. Comunidade cristã Sigo com Fé.' },
      es: { title: 'Cofres Bíblicos Diarios: valentía, esperanza y dirección | Sigo com Fé', description: 'Abre un Cofre Bíblico Diario y recibe una palabra de valentía, esperanza o dirección en la comunidad cristiana Sigo com Fé.' },
      en: { title: 'Daily Bible Chests: courage, hope and guidance | Sigo com Fé', description: 'Open a Daily Bible Chest and receive a word of courage, hope or guidance in the Sigo com Fé Christian community.' },
      de: { title: 'Tägliche Bibel-Schatztruhen: Mut, Hoffnung und Führung | Sigo com Fé', description: 'Öffne eine tägliche Bibel-Schatztruhe und empfange ein Wort voller Mut, Hoffnung oder Führung.' },
      fr: { title: 'Coffres bibliques quotidiens : courage, espérance et direction | Sigo com Fé', description: 'Ouvre un coffre biblique quotidien et reçois une parole de courage, d’espérance ou de direction.' },
      ro: { title: 'Cufere biblice zilnice: curaj, speranță și călăuzire | Sigo com Fé', description: 'Deschide un cufăr biblic zilnic și primește un cuvânt de curaj, speranță sau călăuzire.' },
      ru: { title: 'Ежедневные библейские сундуки: мужество, надежда и направление | Sigo com Fé', description: 'Откройте ежедневный библейский сундук и получите слово мужества, надежды или направления.' }
    }[currentLanguage] || { title: 'Baús Bíblicos Diários: coragem, esperança e direção | Sigo com Fé', description: 'Abra um Baú Bíblico Diário e receba uma palavra de coragem, esperança ou direção.' };
    const description = document.querySelector('meta[name="description"]');
    const ogTitle = document.querySelector('meta[property="og:title"]');
    const ogDescription = document.querySelector('meta[property="og:description"]');
    const canonical = document.querySelector('link[rel="canonical"]');
    const previous = { title: document.title, description: description?.content, ogTitle: ogTitle?.content, ogDescription: ogDescription?.content, canonical: canonical?.href };
    document.title = seo.title;
    if (description) description.content = seo.description;
    if (ogTitle) ogTitle.content = seo.title;
    if (ogDescription) ogDescription.content = seo.description;
    if (canonical) canonical.href = 'https://www.sigocomfe.com/mural';
    const schema = document.createElement('script');
    schema.id = 'mural-bible-chests-schema';
    schema.type = 'application/ld+json';
    schema.text = JSON.stringify({ '@context': 'https://schema.org', '@type': 'WebPage', name: seo.title, description: seo.description, url: 'https://www.sigocomfe.com/mural', about: ['Baú da Coragem', 'Baú da Esperança', 'Baú da Direção'] });
    document.head.appendChild(schema);
    return () => {
      document.title = previous.title;
      if (description && previous.description) description.content = previous.description;
      if (ogTitle && previous.ogTitle) ogTitle.content = previous.ogTitle;
      if (ogDescription && previous.ogDescription) ogDescription.content = previous.ogDescription;
      if (canonical && previous.canonical) canonical.href = previous.canonical;
      schema.remove();
    };
  }, [currentLanguage]);

  // Recebe um diploma vindo do Duelo Bíblico, abre o compositor e deixa a
  // publicação sempre sob a confirmação do próprio jogador.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const diploma = params.get('dueloDiploma');
    if (diploma) {
      const safeDiploma = diploma.slice(0, 1800);
      localStorage.setItem('sigo_diploma_pendente', safeDiploma);
      window.history.replaceState({}, '', window.location.pathname);
    }
    const pendingDiploma = localStorage.getItem('sigo_diploma_pendente');
    if (user && pendingDiploma) {
      setPostText(pendingDiploma);
      setPostCategory('testemunho');
      setPostVisibility('public');
      setShowForm(true);
      localStorage.removeItem('sigo_diploma_pendente');
    }
  }, [user]);

  useEffect(() => {
    const API_URL = import.meta.env.VITE_API_URL || 'https://sigo-com-fe-api.onrender.com';
    const checkLive = async () => {
      try {
        const r = await fetch(API_URL + '/api/live-community/active');
        const d = await r.json();
        setActiveLive(d.live || null);
      } catch(e) {}
    };
    checkLive();
    const iv = setInterval(checkLive, 15000);
    return () => clearInterval(iv);
  }, []);

  // State for active video playback
  const [activeVideoId, setActiveVideoId] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null);
  const videoRefs = useRef({}); // To store refs for each video post

  const fetchPosts = useCallback(async () => {
    try {
      const res = await fetch(`${API}/feed?limit=50`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      const data = await res.json();
      const rawPosts = data.posts || data || [];
      // fetch liked status
      let likedIds = [];
      if (token) {
        try {
          const lr = await fetch(`${API}/feed/liked-posts`, { headers: { Authorization: `Bearer ${token}` } });
          const ld = await lr.json();
          likedIds = ld.likedIds || [];
        } catch (e) {}
      }
      setPosts(rawPosts.map(p => ({ ...p, liked: likedIds.includes(p.id) })));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  // Intersection Observer for video autoplay
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.35) {
            // Começa assim que uma parte confortável do vídeo estiver visível.
            setActiveVideoId(entry.target.dataset.postId);
          } else if (!entry.isIntersecting) {
            // Pausa somente o vídeo que saiu da área visível.
            setActiveVideoId(current => current === entry.target.dataset.postId ? null : current);
          }
        });
      },
      { threshold: [0.25, 0.35, 0.6] }
    );

    // Observe all video post elements
    posts.forEach(post => {
      if (post.media_type === 'video' || (post.media_url && post.media_url.match(/\.(mp4|webm|mov|ogg)(\?|$)/i))) {
        const videoElement = videoRefs.current[post.id];
        if (videoElement) {
          observer.observe(videoElement);
        }
      }
    });

    return () => {
      observer.disconnect();
      videoRefs.current = {}; // Clear refs on unmount
    };
  }, [posts]);

  const handleVideoPlay = useCallback((videoId) => {
    setActiveVideoId(videoId);
  }, []);

  const handleVideoPause = useCallback((videoId) => {
    if (activeVideoId === videoId) {
      setActiveVideoId(null);
    }
  }, [activeVideoId]);

  const handleLike = async (postId) => {
    if (!user || !token) {
      setActionError('Inicia sessão para dizer Amém.');
      return;
    }
    try {
      const res = await fetch(`${API}/feed/${postId}/like`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || typeof data.liked !== 'boolean') {
        throw new Error(data.error || 'Não foi possível atualizar o Amém.');
      }
      // Atualiza imediatamente o cartão, sem recarregar o mural inteiro.
      setPosts(prev => prev.map(post => {
        if (post.id !== postId) return post;
        const current = Number(post.like_count ?? post.amemCount ?? 0);
        return { ...post, liked: data.liked, like_count: Number.isFinite(Number(data.likeCount)) ? Number(data.likeCount) : Math.max(0, current + (data.liked ? 1 : -1)) };
      }));
      setActionError('');
    } catch (error) {
      console.error(error);
      setActionError(error.message || 'Não foi possível atualizar o Amém. Tenta novamente.');
    }
  };

  const handleDelete = async (postId) => {
    if (!window.confirm(t('mural.confirmDelete'))) return;
    try {
      const res = await fetch(`${API}/feed/${postId}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Nao foi possivel apagar a publicacao.');
      setPosts(prev => prev.filter(p => p.id !== postId));
    } catch (error) {
      console.error(error);
      alert(error.message || 'Nao foi possivel apagar a publicacao.');
    }
  };

  const handleMediaSelect = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;
    setMediaFile(file); setMediaType(type); setMediaPreview(URL.createObjectURL(file));
  };

  const clearMedia = () => {
    setMediaFile(null); setMediaPreview(null); setMediaType(null);
    if (photoRef.current) photoRef.current.value = '';
    if (videoRef.current) videoRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!postText.trim() && !mediaFile && !musicFile && !selectedMusicSong) return;
    if (!user || !token) {
      setUploadError(t('mural.loginRequired', 'Entre na sua conta para publicar no mural.'));
      return;
    }
    setUploading(true); setUploadError(null);
    try {
      let mediaUrl = null, audioUrl = null;
      if (mediaFile) mediaUrl = await uploadToCloudinary(mediaFile);
      if (musicFile) audioUrl = await uploadToCloudinary(musicFile);
      if (!audioUrl && selectedMusicSong) audioUrl = selectedMusicSong.url;

      const res = await fetch(`${API}/feed`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ bg_music_url: audioUrl || null, bg_music_start: null, bg_music_duration: null,
          music_title: selectedMusicSong?.title || musicName || null,
          content: postText || 'Publicacao com media',
          category: postCategory,
          visibility: postVisibility,
          media_url: mediaUrl || undefined,
          media_type: mediaType || undefined,
          audio_url: audioUrl || undefined,
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || t('mural.uploadError'));

      const newPost = { ...(data.post || {}), liked: false, full_name: user?.full_name, like_count: 0, comment_count: 0 };
      setPosts([newPost, ...posts]);
      setPostText(''); setPostCategory('testemunho');
      clearMedia(); setMusicFile(null); setMusicName(null); setSelectedMusicSong(null);
      if (musicRef.current) musicRef.current.value = '';
      setShowForm(false);
    } catch (err) {
      setUploadError(err.message || t('mural.uploadConnectionError'));
      console.error('UPLOAD ERROR:', err);
      alert('Erro: ' + (err.message || 'desconhecido'));
    } finally { setUploading(false); }
  };

  const publishSurprise = async ({ content }) => {
    if (!content) return;
    if (!user || !token) {
      setActionError(t('mural.loginRequired', 'Entre na sua conta para publicar no mural.'));
      return;
    }
    setPublishingSurprise(true);
    try {
      const res = await fetch(`${API}/feed`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, category: 'versiculo', visibility: 'public' })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Não foi possível publicar a palavra.');
      const newPost = { ...(data.post || {}), liked: false, full_name: user.full_name, like_count: 0, comment_count: 0 };
      setPosts(prev => [newPost, ...prev]);
      setActiveFilter('todas');
      trackMuralAction('publish_daily_surprise');
    } catch (error) {
      alert(error.message || 'Não foi possível publicar a palavra.');
    } finally {
      setPublishingSurprise(false);
    }
  };

  const filteredPosts = activeFilter === 'todas' ? posts : posts.filter(p => (p.category || p.type) === activeFilter);
  const toggleComposer = () => {
    if (!user || !token) {
      setActionError(t('mural.loginRequired', 'Entre na sua conta para publicar no mural.'));
      return;
    }
    setShowForm(value => !value);
  };

  const FILTERS_CONFIG = [
    { key: 'todas', labelKey: 'mural.filters.all' },
    { key: 'testemunho', labelKey: 'mural.filters.testimonies' },
    { key: 'louvor', labelKey: 'mural.filters.worship' },
    { key: 'versiculo', labelKey: 'mural.filters.verses' },
    { key: 'reflexao', labelKey: 'mural.filters.reflections' },
    { key: 'foto', labelKey: 'mural.filters.photos' },
  ];

  return (
    <div>
      <LiveViewers activeLive={activeLive} />
      {false && (
        <div onClick={() => window.location.href='/live'} style={{ background:'linear-gradient(135deg,#e74c3c,#c0392b)', borderRadius:12, padding:'14px 20px', marginBottom:16, cursor:'pointer', display:'flex', alignItems:'center', gap:12, boxShadow:'0 4px 15px rgba(231,76,60,0.4)' }}>
          <div style={{ width:12, height:12, background:'white', borderRadius:'50%' }}/>
          <div style={{ flex:1 }}>
            <p style={{ color:'white', fontWeight:800, fontSize:16, margin:0 }}>🔴 AO VIVO agora!</p>
            <p style={{ color:'rgba(255,255,255,0.85)', fontSize:13, margin:0 }}>{repairMojibake(activeLive?.user_name)} está transmitindo</p>
          </div>
          <span style={{ color:'white', fontSize:13, fontWeight:600 }}>Entrar →</span>
        </div>
      )}
    <div style={{ maxWidth: 900, margin: '0 auto', padding: 16 }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg,#7a9e7e,#c4b89a)', borderRadius: 16, padding: '20px 24px', marginBottom: 20, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>{t('mural.title')}</h1>
          <p style={{ margin: '4px 0 0', fontSize: 13, opacity: 0.85 }}>{t('mural.subtitle')}</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => setViewMode(viewMode === 'feed' ? 'grid' : 'feed')} style={{ background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.4)', borderRadius: 10, padding: '8px 12px', color: 'white', cursor: 'pointer' }}>
            {viewMode === 'feed' ? <Grid size={16} /> : <List size={16} />}
          </button>
          {user && (
            <button onClick={toggleComposer} style={{ background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.4)', borderRadius: 12, padding: '10px 16px', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, fontWeight: 600 }}>
              {showForm ? <X size={16} /> : <Plus size={16} />}
              {showForm ? t('mural.cancel') : t('mural.newPost', 'Criar publicação')}
            </button>
          )}
        </div>
      </div>

      {user && showWelcome && <section style={{ marginBottom:20, padding:'18px 20px', borderRadius:16, background:'linear-gradient(135deg,#f7f0ff,#fffdf6)', border:'1px solid #e7d8f5', boxShadow:'0 5px 18px rgba(75,48,120,.07)' }}>
        <div style={{ display:'flex', gap:12, alignItems:'flex-start', justifyContent:'space-between' }}><div><h2 style={{ margin:0, color:'#442469', fontSize:18 }}>✨ {welcome.title}</h2><p style={{ margin:'6px 0 0', color:'#70627f', fontSize:13, lineHeight:1.45 }}>{welcome.text}</p></div><button type="button" aria-label={welcome.close} onClick={dismissWelcome} style={{ border:0, background:'transparent', color:'#78698a', cursor:'pointer', padding:2 }}><X size={18}/></button></div>
        <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginTop:14 }}>
          <button type="button" onClick={() => { setShowForm(true); dismissWelcome(); }} style={{ border:0, borderRadius:10, padding:'9px 12px', background:'#6a42a0', color:'#fff', fontWeight:800, cursor:'pointer', fontSize:12 }}><Send size={14} style={{ verticalAlign:'middle', marginRight:5 }}/>{welcome.post}</button>
          {!user.avatar_url && <button type="button" onClick={() => { window.location.href=`/perfil/${user.id}`; }} style={{ border:'1px solid #cbb7e8', borderRadius:10, padding:'9px 12px', background:'#fff', color:'#5c368c', fontWeight:800, cursor:'pointer', fontSize:12 }}><Image size={14} style={{ verticalAlign:'middle', marginRight:5 }}/>{welcome.photo}</button>}
          <button type="button" onClick={() => { window.location.href='/duelo-biblico'; }} style={{ border:'1px solid #efd49a', borderRadius:10, padding:'9px 12px', background:'#fffaf0', color:'#92600d', fontWeight:800, cursor:'pointer', fontSize:12 }}><Play size={14} style={{ verticalAlign:'middle', marginRight:5 }}/>{welcome.duel}</button>
        </div>
      </section>}

      <DailySurpriseBoxes onPublish={publishSurprise} publishing={publishingSurprise} />

      {/* Form */}
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
              <Music size={18} style={{ color: '#9333ea' }} />
              <span style={{ flex: 1, fontSize: 13, color: '#555' }}>{musicName}</span>
              <button onClick={() => { setMusicFile(null); setMusicName(null); if (musicRef.current) musicRef.current.value = ''; }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888' }}><X size={14} /></button>
            </div>
          )}

          <input ref={photoRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handleMediaSelect(e, 'foto')} />
          <input ref={videoRef} type="file" accept="video/*" style={{ display: 'none' }} onChange={e => handleMediaSelect(e, 'video')} />
          
          <input ref={videoRef} type="file" accept="video/*" style={{ display: "none" }} onChange={e => handleMediaSelect(e, "video")} />
          <input ref={musicRef} type="file" accept="audio/*" style={{ display: 'none' }} onChange={e => { const f = e.target.files[0]; if (f) { setMusicFile(f); setMusicName(f.name); } }} />

          {/* Selected music from library */}
          {selectedMusicSong && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, background: '#f0f5ff', border: '1px solid #4a80d444', borderRadius: 10, padding: '10px 14px' }}>
               <span style={{ fontSize: 20 }}>🎵</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{selectedMusicSong.title}</div>
                <div style={{ fontSize: 11, color: '#888' }}>{selectedMusicSong.artist}</div>
                <audio controls preload="metadata" src={selectedMusicSong.url} style={{ width: '100%', height: 28, marginTop: 7 }} />
              </div>
              <button onClick={() => setSelectedMusicSong(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888' }}><X size={14} /></button>
            </div>
          )}

          <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
            <button onClick={() => photoRef.current?.click()} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 20, border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer', fontSize: 13 }}><Image size={16} style={{ color: '#f43f5e' }} /> {t('media.photo')}</button>
            <button onClick={() => videoRef.current?.click()} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 20, border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer', fontSize: 13 }}><Video size={16} style={{ color: '#3b82f6' }} /> {t('media.video')}</button>
             <button onClick={() => { const input = document.createElement("input"); input.type = "file"; input.accept = "video/*"; input.capture = "environment"; input.onchange = e => handleMediaSelect(e, "video"); input.click(); }} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 20, border: "1px solid #e2e8f0", background: "white", cursor: "pointer", fontSize: 13 }}>🎥 Gravar</button>
            <button onClick={() => musicRef.current?.click()} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 20, border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer', fontSize: 13 }}><Music size={16} style={{ color: '#a855f7' }} /> {t('media.audio')}</button>
             <button onClick={() => setShowMusicPicker(true)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 20, border: '1px solid #4a80d444', background: '#f0f5ff', cursor: 'pointer', fontSize: 13, color: '#4a80d4', fontWeight: 600 }}>🎵 {t('mural.addMusic')}</button>
          </div>

           {uploadError && <div style={{ background: '#fff1f2', border: '1px solid #fecdd3', borderRadius: 8, padding: '10px 14px', marginBottom: 14, fontSize: 13, color: '#e11d48' }}>⚠️ {repairMojibake(uploadError)}</div>}

          {/* Selector de visibilidade */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
            {[
              { value: 'public', label: '🌍 ' + t('mural.visPublic', 'Público'), color: '#27ae60' },
              { value: 'members', label: '👥 ' + t('mural.visMembers', 'Membros'), color: '#2980b9' },
              { value: 'private', label: '🔒 ' + t('mural.visPrivate', 'Privado'), color: '#7f8c8d' },
            ].map(opt => (
              <button key={opt.value} type="button" onClick={() => setPostVisibility(opt.value)}
                style={{ flex: 1, padding: '6px 4px', borderRadius: 8, border: `2px solid ${postVisibility === opt.value ? opt.color : '#eee'}`, background: postVisibility === opt.value ? opt.color : 'white', color: postVisibility === opt.value ? 'white' : '#666', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>
                {opt.label}
              </button>
            ))}
          </div>
          <button onClick={handleSubmit} disabled={uploading || (!postText.trim() && !mediaFile)} style={{ width: '100%', padding: 12, background: uploading ? '#ccc' : 'linear-gradient(135deg,#7a9e7e,#c4b89a)', border: 'none', borderRadius: 12, color: 'white', fontSize: 15, fontWeight: 600, cursor: uploading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            {uploading ? t('mural.publishing') : <><Send size={16} /> {t('mural.publish')}</>}
          </button>
        </div>
      )}

      {/* Filtros */}
      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4, marginBottom: 16, scrollbarWidth: 'none' }}>
        {FILTERS_CONFIG.map(f => (
          <button key={f.key} onClick={() => setActiveFilter(f.key)} style={{ padding: '8px 16px', borderRadius: 20, whiteSpace: 'nowrap', border: activeFilter === f.key ? 'none' : '1px solid #e2e8f0', background: activeFilter === f.key ? 'linear-gradient(135deg,#7a9e7e,#c4b89a)' : 'white', color: activeFilter === f.key ? 'white' : '#555', cursor: 'pointer', fontSize: 13, fontWeight: 500 }}>{t(f.labelKey)}</button>
        ))}
      </div>

      <div style={{display:"flex",gap:10,marginBottom:16,flexWrap:"wrap"}}>
        
        <button onClick={()=>{ trackMuralAction('duelo_biblico'); window.location.href="/duelo-biblico"; }} style={{padding:"8px 16px",borderRadius:20,border:"none",background:"linear-gradient(135deg,#c0392b,#922b21)",color:"white",cursor:"pointer",fontSize:13,fontWeight:700,display:"flex",alignItems:"center",gap:6}}>Duelo Bíblico</button>
      
        <button aria-pressed={soundEnabled} onClick={() => { const next = !soundEnabled; trackMuralAction(next ? 'enable_sound' : 'disable_sound'); setSoundEnabled(next); localStorage.setItem('sigo_mural_sound', next ? 'on' : 'off'); }} style={{padding:"8px 16px",borderRadius:20,border:"none",background:soundEnabled ? '#1f8b4c' : '#456fd0',color:"white",cursor:"pointer",fontSize:13,fontWeight:700,display:"flex",alignItems:"center",gap:6}}>
          {soundLabel}
        </button>
      </div>
      {/* Loading */}
      {loading && (
        <div style={{ textAlign: 'center', padding: 60 }}>
          <div style={{ marginBottom: 16, color: '#7a9e7e' }}><BookOpen size={44} strokeWidth={2.2} /></div>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#7a9e7e', marginBottom: 8 }}>Sigo com Fe</div>
          <div style={{ fontSize: 14, color: '#888', marginBottom: 24 }}>{t('mural.loadingPosts','A carregar publicacoes...')}</div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
            {[0,1,2].map(i => (
              <div key={i} style={{ width: 10, height: 10, borderRadius: '50%', background: '#7a9e7e', animation: 'bounce 1s infinite', animationDelay: i*0.2+'s' }} />
            ))}
          </div>
          <style>{'@keyframes bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }'}</style>
        </div>
      )}
      {actionError && (
        <div role="status" style={{ margin: '0 0 12px', padding: '10px 14px', borderRadius: 10, background: '#fff4f2', color: '#b42318', fontSize: 13 }}>
          {actionError}
        </div>
      )}

      {/* Grid View */}
      {!loading && viewMode === 'grid' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 3, marginBottom: 16 }}>
          {filteredPosts.map(post => {
            const mediaUrl = post.media_url || post.mediaUrl;
            const color = getCatColor(post.category || post.type);
            return (
              <div key={post.id} onClick={() => setSelectedPost(post)} style={{ aspectRatio: '1/1', background: '#f8f8f8', overflow: 'hidden', cursor: 'pointer', position: 'relative', borderRadius: 4 }}>
                {mediaUrl && !mediaUrl.match(/\.(mp3|wav|aac|m4a)(\?|$)/i) ? (
                  mediaUrl.match(/\.(mp4|webm|mov)(\?|$)/i) ? (
                    <div style={{ width: '100%', height: '100%', background: '#1a1a2e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Play size={28} color="#daa520" /></div>
                  ) : (
                    <img src={mediaUrl} alt="" style={{ width: '100%', maxHeight: '400px', objectFit: 'contain', background: '#f8f8f8' }} />
                  )
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: `linear-gradient(135deg,${color}22,white)`, padding: 8 }}>
                    <p style={{ color: '#333', fontSize: 11, textAlign: 'center', lineHeight: 1.4, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical', margin: 0 }}>{repairMojibake(post.content)}</p>
                  </div>
                )}
                <div style={{ position: 'absolute', bottom: 4, right: 4, width: 8, height: 8, borderRadius: '50%', background: color }} />
              </div>
            );
          })}
        </div>
      )}

      {/* Feed View */}
      {!loading && viewMode === 'feed' && filteredPosts.map(post => (
        <PostCard
          key={post.id}
          post={post} bgMusicStart={post.bg_music_start} bgMusicDuration={post.bg_music_duration}
          onLike={handleLike}
          onDelete={handleDelete}
          onCommentAdded={(postId) => setPosts(prev => prev.map(item => item.id === postId ? { ...item, comment_count: Number(item.comment_count || 0) + 1 } : item))}
          token={token}
          user={user}
          isPlaying={activeVideoId === post.id} // Pass isPlaying prop
          onVideoPlay={handleVideoPlay}
          onVideoPause={handleVideoPause}
          onVideoNode={(id, node) => { if (node) videoRefs.current[id] = node; else delete videoRefs.current[id]; }}
          soundEnabled={soundEnabled}
        />
      ))}

      {!loading && filteredPosts.length === 0 && (
        <div style={{ textAlign: 'center', padding: 40, color: '#888', background: 'white', borderRadius: 16, border: '1px dashed #e2e8f0' }}>
          <BookOpen size={40} style={{ opacity: 0.3, marginBottom: 12 }} />
          <p style={{ margin: 0 }}>{t('mural.noPostsFound')}</p>
          {!user && <p style={{ margin: '8px 0 0', fontSize: 13 }}>{t('mural.loginRequired')}</p>}
        </div>
      )}

      {/* Post Viewer Modal */}
      {selectedPost && (
        <div onClick={() => setSelectedPost(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.92)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: "white", borderRadius: 20, overflow: "hidden", maxWidth: 500, width: "100%", maxHeight: "90vh", overflowY: "auto", position: "relative" }}>
            <button onClick={() => setSelectedPost(null)} style={{ position: "absolute", top: 12, right: 12, zIndex: 10, background: "rgba(0,0,0,0.5)", border: "none", borderRadius: "50%", width: 36, height: 36, color: "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>×</button>
            {selectedPost.media_url && selectedPost.media_url.match(/\.(mp4|webm|mov)(\?|$)/i) ? (
              <video src={selectedPost.media_url} controls autoPlay playsInline style={{ width: "100%", maxHeight: 400, background: "#000", display: "block" }} />
            ) : selectedPost.media_url && !selectedPost.media_url.match(/\.(mp3|wav|aac|m4a)(\?|$)/i) ? (
              <img src={selectedPost.media_url} alt="" style={{ width: "100%", maxHeight: 500, objectFit: "contain", display: "block", background: "#000" }} />
            ) : null}
            <div style={{ padding: "16px 20px 20px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <div style={{ width: 38, height: 38, borderRadius: "50%", background: "linear-gradient(135deg,#7a9e7e,#c4b89a)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 700, fontSize: 14 }}>
                  {(selectedPost.full_name || selectedPost.author_name || "U").charAt(0).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{selectedPost.full_name || selectedPost.author_name || "Utilizador"}</div>
                  <div style={{ fontSize: 12, color: "#888" }}>{selectedPost.created_at ? new Date(selectedPost.created_at).toLocaleDateString() : ""}</div>
                </div>
              </div>
              {selectedPost.content && <p style={{ color: "#333", fontSize: 14, lineHeight: 1.65, margin: 0 }}>{selectedPost.content}</p>}
            </div>
          </div>
        </div>
      )}

      {/* Music Picker Modal */}
      {showMusicPicker && (
        <MusicPickerModal
          onClose={() => setShowMusicPicker(false)}
          onSelect={(song) => { setSelectedMusicSong(song); setMusicFile(null); setMusicName(null); if (musicRef.current) musicRef.current.value = ''; }}
        />
      )}
    </div>
    </div>
  );
}


















