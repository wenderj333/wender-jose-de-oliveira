import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, X, Send, Image, Video, Music, Heart, MessageCircle, Share2, Play, Pause, BookOpen, Trash2, Grid, List, Volume2, VolumeX, Search, Flag } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import LiveViewers from '../components/LiveViewers';
import ReportModal from '../components/ReportModal';
import { repairMojibake } from '../utils/textEncoding';
import surpriseVerses from '../data/biblia-livre-surpresas.json';

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

function DailySurpriseBoxes() {
  const { i18n } = useTranslation();
  const [message, setMessage] = useState(null);
  const today = new Date().toISOString().slice(0, 10);
  const storageKey = `sigo_mural_surprise_${today}`;
  const lang = (i18n.language || navigator.language || 'pt').split('-')[0];
  const boxes = [
    { icon: '🦁', color: '#f59e0b', title: { pt: 'Coragem', es: 'Valentía', en: 'Courage' }, hint: { pt: 'Fortaleça o coração', es: 'Fortalece el corazón', en: 'Strengthen your heart' } },
    { icon: '🌿', color: '#42a77a', title: { pt: 'Esperança', es: 'Esperanza', en: 'Hope' }, hint: { pt: 'Uma promessa para hoje', es: 'Una promesa para hoy', en: 'A promise for today' } },
    { icon: '🕊️', color: '#7651b8', title: { pt: 'Direção', es: 'Dirección', en: 'Guidance' }, hint: { pt: 'Sabedoria para o caminho', es: 'Sabiduría para tu camino', en: 'Wisdom for your path' } },
  ];
  const copy = { choose: { pt: 'Escolha uma surpresa', es: 'Elige una sorpresa', en: 'Choose a surprise' }, done: { pt: 'Você já recebeu sua palavra hoje', es: 'Ya recibiste tu palabra de hoy', en: "You already received today's word" }, share: { pt: 'Compartilhar esta palavra', es: 'Compartir esta palabra', en: 'Share this word' }, fallback: { pt: '', es: 'Texto disponível em português', en: 'Text available in Portuguese' } };
  useEffect(() => { try { const saved = JSON.parse(localStorage.getItem(storageKey)); if (saved) setMessage(saved); } catch (_) {} }, [storageKey]);
  const choose = box => { if (message) return; const pool = surpriseVerses.filter(word => word.category === ({ Coragem: 'coragem', Esperança: 'esperanca', Direção: 'direcao' }[box.title.pt] || 'coragem')); const word = pool[Math.floor(Math.random() * pool.length)] || surpriseVerses[Math.floor(Math.random() * surpriseVerses.length)]; const value = { ...word, box: box.title.pt }; setMessage(value); localStorage.setItem(storageKey, JSON.stringify(value)); };
  const verseText = message ? (message[lang] || message.pt) : '';
  const isFallback = Boolean(message && lang !== 'pt' && !message[lang]);
  const share = async () => { if (!message) return; const body = `${verseText}\n— ${message.ref}\nSigo com Fé`; try { if (navigator.share) await navigator.share({ title: 'Palavra do dia', text: body }); else await navigator.clipboard.writeText(body); } catch (_) {} };
  return <section aria-label={copy.choose[lang] || copy.choose.pt} style={{ marginBottom: 20, padding: '18px 16px', borderRadius: 18, background: 'linear-gradient(135deg,#fffaf1,#f6f3ff)', border: '1px solid #eadff3', boxShadow: '0 8px 24px rgba(70,45,100,.08)' }}><div style={{ textAlign: 'center', marginBottom: 14 }}><div style={{ fontSize: 22 }}>✨</div><h2 style={{ margin: '2px 0 3px', color: '#30204f', fontSize: 19 }}>{message ? (copy.done[lang] || copy.done.pt) : (copy.choose[lang] || copy.choose.pt)}</h2><p style={{ margin: 0, color: '#756b80', fontSize: 12 }}>{message ? verseText : 'Uma palavra especial para a sua caminhada'}</p>{isFallback && <small style={{ display: 'block', marginTop: 6, color: '#8a7896', fontSize: 10 }}>{copy.fallback[lang] || copy.fallback.en}</small>}</div>{!message ? <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 10 }}>{boxes.map(box => <button key={box.title.pt} type="button" onClick={() => choose(box)} style={{ border: 'none', borderRadius: 14, padding: '15px 8px', color: 'white', background: `linear-gradient(145deg,${box.color},${box.color}cc)`, cursor: 'pointer', minHeight: 105, boxShadow: '0 6px 14px rgba(56,35,80,.16)', transition: 'transform .2s' }} onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; }} onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}><span style={{ display: 'block', fontSize: 28, marginBottom: 6 }}>{box.icon}</span><strong style={{ display: 'block', fontSize: 14 }}>{box.title[lang] || box.title.pt}</strong><small style={{ display: 'block', marginTop: 5, opacity: .9, lineHeight: 1.2 }}>{box.hint[lang] || box.hint.pt}</small></button>)}</div> : <div style={{ textAlign: 'center' }}><div style={{ color: '#7c6d90', fontSize: 12, marginBottom: 12 }}>{message.ref}</div><button type="button" onClick={share} style={{ border: 'none', borderRadius: 20, padding: '9px 17px', color: 'white', background: '#6d47a8', cursor: 'pointer', fontWeight: 700 }}>↗ {copy.share[lang] || copy.share.pt}</button></div>}<div style={{ marginTop: 12, textAlign: 'center', color: '#9a8ca8', fontSize: 10 }}>Textos: Bíblia Livre (BLIVRE), CC BY 3.0 BR</div></section>;
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
  const [uploadError, setUploadError] = useState(null);
  const photoRef = useRef(null);
  const videoRef = useRef(null);
  const musicRef = useRef(null);
  const [activeLive, setActiveLive] = useState(null);

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

  const filteredPosts = activeFilter === 'todas' ? posts : posts.filter(p => (p.category || p.type) === activeFilter);

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
            <button onClick={() => setShowForm(!showForm)} style={{ background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.4)', borderRadius: 12, padding: '10px 16px', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, fontWeight: 600 }}>
              {showForm ? <X size={16} /> : <Plus size={16} />}
              {showForm ? t('mural.cancel') : t('mural.newPost')}
            </button>
          )}
        </div>
      </div>

      <DailySurpriseBoxes />

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


















