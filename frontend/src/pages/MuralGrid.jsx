import React, { useState, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, X, Send, Image, Video, Music, Heart, MessageCircle, Share2, Play, Pause, BookOpen, Trash2, Search, Grid, List } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'degxiuf43';
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'sigo_com_fe';

async function uploadToCloudinary(file) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
  const resourceType = file.type.startsWith('video') ? 'video' : 'auto';
  const url = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/${resourceType}/upload`;
  const res = await fetch(url, { method: 'POST', body: formData });
  if (!res.ok) throw new Error('Erro upload Cloudinary');
  const data = await res.json();
  return data.secure_url;
}

const DEMO_POSTS = [
  { id: 1, type: 'testemunho', authorInitials: 'MC', authorName: 'Maria Clara', avatarColor: '#f97316', church: 'Igreja Batista Central', time: 'Há 2 horas', content: 'Glória a Deus! Depois de 3 anos desempregada, fui aprovada no concurso público. Nunca desistam de orar!', amemCount: 47, commentCount: 12, liked: false, mediaUrl: null, mediaType: null, musicUrl: null },
  { id: 2, type: 'louvor', authorInitials: 'PR', authorName: 'Paulo Ricardo', avatarColor: '#a855f7', church: 'Comunidade Graça e Paz', time: 'Há 4 horas', content: 'Novo louvor do ministério de adoração. Que o Espírito Santo toque cada coração!', amemCount: 31, commentCount: 8, liked: false, mediaUrl: 'https://images.unsplash.com/photo-1478147427282-58a87a433968?w=600&q=80', mediaType: 'foto', musicUrl: null },
  { id: 3, type: 'versiculo', authorInitials: 'DF', authorName: 'Daniela Ferreira', avatarColor: '#22c55e', church: 'Assembleia de Deus', time: 'Há 10 horas', content: 'Porque eu bem sei os pensamentos que penso de vós, diz o Senhor; pensamentos de paz e não de mal.', reference: 'Jeremias 29:11', amemCount: 112, commentCount: 5, liked: false, mediaUrl: null, mediaType: null, musicUrl: null },
  { id: 4, type: 'reflexao', authorInitials: 'JL', authorName: 'Pastor João Lucas', avatarColor: '#3b82f6', church: 'Igreja Presbiteriana', time: 'Há 8 horas', content: 'Muitas vezes queremos que Deus mude as circunstâncias, mas Ele quer mudar o nosso coração primeiro.', amemCount: 65, commentCount: 18, liked: false, mediaUrl: null, mediaType: null, musicUrl: null },
];

const CATEGORIES = [
  { value: 'testemunho', label: '🙌 Testemunho', color: '#f97316' },
  { value: 'louvor',     label: '🎵 Louvor',     color: '#a855f7' },
  { value: 'reflexao',  label: '📖 Reflexão',   color: '#3b82f6' },
  { value: 'versiculo', label: '✨ Versículo',  color: '#22c55e' },
  { value: 'foto',      label: '📸 Foto/Vídeo', color: '#f43f5e' },
];

function Avatar({ initials, color, size = 40 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: `linear-gradient(135deg, ${color}, ${color}99)`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: 'white', fontWeight: '700', fontSize: size * 0.35, flexShrink: 0,
      border: '2px solid white', boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
    }}>
      {initials}
    </div>
  );
}

function MiniAudioPlayer({ src }) {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const toggle = async () => {
    if (!audioRef.current) return;
    try {
      if (playing) { audioRef.current.pause(); setPlaying(false); }
      else { await audioRef.current.play(); setPlaying(true); }
    } catch (err) { console.error(err); }
  };
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'linear-gradient(135deg,#667eea15,#764ba215)', border: '1px solid #667eea30', borderRadius: 12, padding: '10px 14px', marginTop: 10 }}>
      <audio ref={audioRef} src={src} onTimeUpdate={() => { if (audioRef.current?.duration) setProgress((audioRef.current.currentTime / audioRef.current.duration) * 100); }} onEnded={() => { setPlaying(false); setProgress(0); }} preload="metadata" playsInline />
      <button onClick={toggle} style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg,#667eea,#764ba2)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', flexShrink: 0 }}>
        {playing ? <Pause size={15} /> : <Play size={15} />}
      </button>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 11, color: '#888', marginBottom: 4 }}>🎵 Música anexada</div>
        <div style={{ height: 3, background: '#e2e8f0', borderRadius: 2 }}>
          <div style={{ width: `${progress}%`, height: '100%', background: 'linear-gradient(90deg,#667eea,#764ba2)', borderRadius: 2 }} />
        </div>
      </div>
    </div>
  );
}

function AmenButton({ count, liked, onLike }) {
  const [animate, setAnimate] = useState(false);
  const [floaters, setFloaters] = useState([]);
  const handleClick = () => {
    onLike();
    setAnimate(true);
    setTimeout(() => setAnimate(false), 300);
    const id = Date.now();
    setFloaters(f => [...f, id]);
    setTimeout(() => setFloaters(f => f.filter(x => x !== id)), 900);
  };
  return (
    <div style={{ position: 'relative', display: 'inline-flex' }}>
      {floaters.map(id => (
        <span key={id} style={{ position: 'absolute', bottom: '100%', left: '50%', fontSize: 18, pointerEvents: 'none', animation: 'floatUp 0.9s ease-out forwards' }}>🙏</span>
      ))}
      <button onClick={handleClick} style={{ display: 'flex', alignItems: 'center', gap: 5, background: liked ? '#fff0f3' : 'transparent', border: liked ? '1px solid #fecdd3' : '1px solid transparent', cursor: 'pointer', color: liked ? '#e11d48' : '#666', fontSize: 13, fontWeight: 600, padding: '7px 12px', borderRadius: 20, transition: 'all 0.2s', transform: animate ? 'scale(1.25)' : 'scale(1)' }}>
        <span style={{ fontSize: animate ? 20 : 17, transition: 'font-size 0.2s' }}>🙏</span>
        <span>{count}</span>
      </button>
    </div>
  );
}

// Modal fullscreen para ver post
function PostModal({ post, onClose, onLike, onDelete }) {
  const cat = CATEGORIES.find(c => c.value === post.type) || CATEGORIES[0];
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState([]);
  const submitComment = (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    setComments([...comments, { id: Date.now(), text: comment, author: 'Você' }]);
    setComment('');
  };
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }} onClick={onClose}>
      <div style={{ background: 'white', borderRadius: 16, maxWidth: 860, width: '100%', maxHeight: '90vh', display: 'flex', flexDirection: window.innerWidth < 700 ? 'column' : 'row', overflow: 'hidden' }} onClick={e => e.stopPropagation()}>
        {/* Media side */}
        <div style={{ flex: '1.2', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300, position: 'relative' }}>
          {post.mediaType === 'foto' && post.mediaUrl ? (
            <img src={post.mediaUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : post.mediaType === 'video' && post.mediaUrl ? (
            <video src={post.mediaUrl} controls playsInline style={{ width: '100%', maxHeight: 500 }} />
          ) : (
            <div style={{ padding: 32, textAlign: 'center' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>{cat.label.split(' ')[0]}</div>
              <p style={{ color: 'white', fontSize: 16, lineHeight: 1.6 }}>{post.content}</p>
              {post.reference && <p style={{ color: cat.color, fontWeight: 700, marginTop: 8 }}>— {post.reference}</p>}
            </div>
          )}
          <button onClick={onClose} style={{ position: 'absolute', top: 12, right: 12, background: 'rgba(0,0,0,0.5)', border: 'none', color: 'white', borderRadius: '50%', width: 32, height: 32, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={16} /></button>
        </div>
        {/* Info side */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', maxHeight: '90vh' }}>
          <div style={{ padding: '14px 16px', borderBottom: '1px solid #f0f0f0', display: 'flex', alignItems: 'center', gap: 10 }}>
            <Avatar initials={post.authorInitials} color={post.avatarColor || cat.color} size={36} />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{post.authorName}</div>
              <div style={{ fontSize: 11, color: '#888' }}>{post.church}</div>
            </div>
            <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 12, background: cat.color + '20', color: cat.color, fontWeight: 600 }}>{cat.label}</span>
            {post.id > 1000 && <button onClick={() => { onDelete(post.id); onClose(); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ddd' }} onMouseEnter={e => e.currentTarget.style.color='#e11d48'} onMouseLeave={e => e.currentTarget.style.color='#ddd'}><Trash2 size={15} /></button>}
          </div>
          {post.mediaUrl && post.content && (
            <div style={{ padding: '10px 16px', borderBottom: '1px solid #f0f0f0', fontSize: 14, color: '#333' }}>{post.content}</div>
          )}
          {post.musicUrl && <div style={{ padding: '0 16px' }}><MiniAudioPlayer src={post.musicUrl} /></div>}
          <div style={{ flex: 1, overflowY: 'auto', padding: '10px 16px' }}>
            {comments.map(c => (
              <div key={c.id} style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#667eea', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>EU</div>
                <div style={{ background: '#f8f8f8', borderRadius: 12, padding: '6px 10px', fontSize: 13 }}>
                  <span style={{ fontWeight: 600, color: '#333' }}>{c.author} </span>
                  <span style={{ color: '#555' }}>{c.text}</span>
                </div>
              </div>
            ))}
          </div>
          <div style={{ borderTop: '1px solid #f0f0f0', padding: '10px 16px' }}>
            <div style={{ display: 'flex', gap: 12, marginBottom: 10 }}>
              <AmenButton count={post.amemCount} liked={post.liked} onLike={() => onLike(post.id)} />
              <button style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'none', border: 'none', cursor: 'pointer', color: '#666', fontSize: 13 }}><MessageCircle size={18} />{post.commentCount + comments.length}</button>
              <button style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'none', border: 'none', cursor: 'pointer', color: '#666', fontSize: 13, marginLeft: 'auto' }}><Share2 size={18} /></button>
            </div>
            <form onSubmit={submitComment} style={{ display: 'flex', gap: 8 }}>
              <input value={comment} onChange={e => setComment(e.target.value)} placeholder="Adicionar comentário..." style={{ flex: 1, padding: '9px 14px', borderRadius: 20, border: '1px solid #e2e8f0', fontSize: 13, outline: 'none' }} />
              <button type="submit" style={{ padding: '9px 14px', borderRadius: 20, background: 'linear-gradient(135deg,#667eea,#764ba2)', border: 'none', color: 'white', cursor: 'pointer' }}><Send size={13} /></button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MuralGrid() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [posts, setPosts] = useState(DEMO_POSTS);
  const [activeFilter, setActiveFilter] = useState('todas');
  const [viewMode, setViewMode] = useState('feed');
  const [showForm, setShowForm] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [postText, setPostText] = useState('');
  const [postCategory, setPostCategory] = useState('testemunho');
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);
  const [mediaType, setMediaType] = useState(null);
  const [musicFile, setMusicFile] = useState(null);
  const [musicName, setMusicName] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const photoRef = useRef(null);
  const videoRef = useRef(null);
  const musicRef = useRef(null);

  const filteredPosts = activeFilter === 'todas' ? posts : posts.filter(p => p.type === activeFilter);

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

  const clearMusic = () => {
    setMusicFile(null); setMusicName('');
    if (musicRef.current) musicRef.current.value = '';
  };

  const handleSubmit = async () => {
    if (!postText.trim() && !mediaFile) return;
    setUploading(true); setUploadError('');
    try {
      let mediaUrl = null, musicUrl = null;
      if (mediaFile) mediaUrl = await uploadToCloudinary(mediaFile);
      if (musicFile) musicUrl = await uploadToCloudinary(musicFile);
      const cat = CATEGORIES.find(c => c.value === postCategory);
      const newPost = {
        id: Date.now(), type: postCategory,
        authorInitials: user?.full_name?.slice(0,2).toUpperCase() || 'EU',
        authorName: user?.full_name || 'Você',
        avatarColor: cat?.color || '#667eea',
        church: user?.church || 'Minha Igreja',
        time: 'Agora', content: postText,
        amemCount: 0, commentCount: 0, liked: false,
        mediaUrl, mediaType, musicUrl,
      };
      setPosts([newPost, ...posts]);
      setPostText(''); setPostCategory('testemunho');
      clearMedia(); clearMusic(); setShowForm(false);
    } catch (err) {
      setUploadError('Erro no upload. Tenta novamente.');
    } finally { setUploading(false); }
  };

  const handleLike = (postId) => {
    setPosts(posts.map(p => p.id === postId ? { ...p, liked: !p.liked, amemCount: p.liked ? p.amemCount - 1 : p.amemCount + 1 } : p));
    if (selectedPost?.id === postId) setSelectedPost(prev => ({ ...prev, liked: !prev.liked, amemCount: prev.liked ? prev.amemCount - 1 : prev.amemCount + 1 }));
  };

  const handleDelete = (postId) => {
    if (window.confirm('Apagar esta publicação?')) {
      setPosts(posts.filter(p => p.id !== postId));
      setSelectedPost(null);
    }
  };

  // Feed card
  const FeedCard = ({ post }) => {
    const cat = CATEGORIES.find(c => c.value === post.type) || CATEGORIES[0];
    const [showComments, setShowComments] = useState(false);
    const [comment, setComment] = useState('');
    const [comments, setComments] = useState([]);
    return (
      <div style={{ background: 'white', borderRadius: 16, overflow: 'hidden', marginBottom: 16, boxShadow: '0 1px 8px rgba(0,0,0,0.08)', border: '1px solid #f0f0f0' }}>
        {/* Header */}
        <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <Avatar initials={post.authorInitials} color={post.avatarColor || cat.color} size={40} />
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: '#1a1a1a' }}>{post.authorName}</div>
            <div style={{ fontSize: 11, color: '#999' }}>{post.church} · {post.time}</div>
          </div>
          <span style={{ fontSize: 11, padding: '3px 9px', borderRadius: 20, background: cat.color + '18', color: cat.color, fontWeight: 600, border: `1px solid ${cat.color}30` }}>{cat.label}</span>
          {post.id > 1000 && (
            <button onClick={() => handleDelete(post.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#e0e0e0', padding: 4, borderRadius: 6 }} onMouseEnter={e => e.currentTarget.style.color='#e11d48'} onMouseLeave={e => e.currentTarget.style.color='#e0e0e0'}><Trash2 size={15} /></button>
          )}
        </div>
        {/* Media */}
        {post.mediaType === 'foto' && post.mediaUrl && (
          <img src={post.mediaUrl} alt="" onClick={() => setSelectedPost(post)} style={{ width: '100%', maxHeight: 420, objectFit: 'cover', display: 'block', cursor: 'pointer' }} />
        )}
        {post.mediaType === 'video' && post.mediaUrl && (
          <video src={post.mediaUrl} controls playsInline controlsList="nodownload nofullscreen" disablePictureInPicture style={{ width: '100%', maxHeight: 420, display: 'block', background: '#000' }} />
        )}
        {/* Content */}
        <div style={{ padding: '10px 16px' }}>
          {post.type === 'versiculo' ? (
            <div style={{ borderLeft: `4px solid ${cat.color}`, paddingLeft: 12, background: cat.color + '08', borderRadius: '0 8px 8px 0', padding: '10px 10px 10px 14px' }}>
              <p style={{ fontStyle: 'italic', color: '#333', fontSize: 14, lineHeight: 1.65, margin: 0 }}>"{post.content}"</p>
              {post.reference && <p style={{ fontWeight: 700, color: cat.color, marginTop: 6, marginBottom: 0, fontSize: 12 }}>— {post.reference}</p>}
            </div>
          ) : (
            <p style={{ color: '#222', fontSize: 14, lineHeight: 1.65, margin: 0 }}>{post.content}</p>
          )}
          {post.musicUrl && <MiniAudioPlayer src={post.musicUrl} />}
        </div>
        {/* Actions */}
        <div style={{ padding: '6px 16px 12px', borderTop: '1px solid #f5f5f5', display: 'flex', gap: 4, alignItems: 'center' }}>
          <AmenButton count={post.amemCount} liked={post.liked} onLike={() => handleLike(post.id)} />
          <button onClick={() => setShowComments(!showComments)} style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'none', border: 'none', cursor: 'pointer', color: '#666', fontSize: 13, fontWeight: 600, padding: '7px 10px', borderRadius: 20 }}>
            <MessageCircle size={17} /> {post.commentCount + comments.length}
          </button>
          <button onClick={() => setSelectedPost(post)} style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'none', border: 'none', cursor: 'pointer', color: '#666', fontSize: 13, marginLeft: 'auto', padding: '7px 10px', borderRadius: 20 }}>
            <Share2 size={17} />
          </button>
        </div>
        {showComments && (
          <div style={{ padding: '0 16px 14px', borderTop: '1px solid #f5f5f5' }}>
            {comments.map(c => (
              <div key={c.id} style={{ display: 'flex', gap: 8, marginBottom: 8, marginTop: 8 }}>
                <div style={{ width: 26, height: 26, borderRadius: '50%', background: '#667eea', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 10, fontWeight: 700 }}>EU</div>
                <div style={{ background: '#f8f8f8', borderRadius: 12, padding: '6px 10px', fontSize: 13, flex: 1 }}>
                  <span style={{ fontWeight: 600 }}>{c.author} </span>
                  <span style={{ color: '#555' }}>{c.text}</span>
                </div>
              </div>
            ))}
            <form onSubmit={e => { e.preventDefault(); if (!comment.trim()) return; setComments([...comments, { id: Date.now(), text: comment, author: 'Você' }]); setComment(''); }} style={{ display: 'flex', gap: 8, marginTop: 10 }}>
              <input value={comment} onChange={e => setComment(e.target.value)} placeholder="Comentar..." style={{ flex: 1, padding: '8px 12px', borderRadius: 20, border: '1px solid #e2e8f0', fontSize: 13, outline: 'none' }} />
              <button type="submit" style={{ padding: '8px 13px', borderRadius: 20, background: 'linear-gradient(135deg,#667eea,#764ba2)', border: 'none', color: 'white', cursor: 'pointer' }}><Send size={13} /></button>
            </form>
          </div>
        )}
      </div>
    );
  };

  // Grid card
  const GridCard = ({ post }) => {
    const cat = CATEGORIES.find(c => c.value === post.type) || CATEGORIES[0];
    return (
      <div onClick={() => setSelectedPost(post)} style={{ aspectRatio: '1/1', cursor: 'pointer', borderRadius: 8, overflow: 'hidden', position: 'relative', background: '#f0f0f0' }}>
        {post.mediaType === 'foto' && post.mediaUrl ? (
          <img src={post.mediaUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : post.mediaType === 'video' && post.mediaUrl ? (
          <div style={{ width: '100%', height: '100%', background: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Play size={32} color="white" />
          </div>
        ) : (
          <div style={{ width: '100%', height: '100%', background: `linear-gradient(135deg, ${cat.color}25, ${cat.color}10)`, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 12 }}>
            <p style={{ color: '#333', fontSize: 12, textAlign: 'center', lineHeight: 1.4, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical' }}>{post.content}</p>
          </div>
        )}
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0)', transition: 'background 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16 }} className="grid-hover">
        </div>
        <div style={{ position: 'absolute', top: 6, right: 6, width: 8, height: 8, borderRadius: '50%', background: cat.color }} />
      </div>
    );
  };

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: '0 16px 80px', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
      <style>{`
        @keyframes floatUp { 0%{opacity:1;transform:translateX(-50%) translateY(0) scale(1)} 100%{opacity:0;transform:translateX(-50%) translateY(-55px) scale(1.4)} }
        @keyframes spin { to{transform:rotate(360deg)} }
        @keyframes slideDown { from{opacity:0;transform:translateY(-10px)} to{opacity:1;transform:translateY(0)} }
      `}</style>

      {/* Header */}
      <div style={{ position: 'sticky', top: 0, background: 'white', zIndex: 100, borderBottom: '1px solid #f0f0f0', padding: '14px 0 10px', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, background: 'linear-gradient(135deg,#667eea,#764ba2)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Mural
          </h1>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button onClick={() => setViewMode(viewMode === 'feed' ? 'grid' : 'feed')} style={{ background: '#f5f5f5', border: 'none', borderRadius: 10, padding: '8px 10px', cursor: 'pointer', color: '#555', display: 'flex', alignItems: 'center' }}>
              {viewMode === 'feed' ? <Grid size={17} /> : <List size={17} />}
            </button>
            <button onClick={() => setShowForm(!showForm)} style={{ background: showForm ? '#fee2e2' : 'linear-gradient(135deg,#667eea,#764ba2)', border: 'none', borderRadius: 12, padding: '8px 16px', cursor: 'pointer', color: showForm ? '#e11d48' : 'white', fontWeight: 700, fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
              {showForm ? <><X size={15} /> Cancelar</> : <><Plus size={15} /> Publicar</>}
            </button>
          </div>
        </div>
        {/* Filtros */}
        <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 2 }}>
          <button onClick={() => setActiveFilter('todas')} style={{ padding: '5px 14px', borderRadius: 20, whiteSpace: 'nowrap', border: activeFilter === 'todas' ? 'none' : '1px solid #e5e5e5', background: activeFilter === 'todas' ? 'linear-gradient(135deg,#667eea,#764ba2)' : 'white', color: activeFilter === 'todas' ? 'white' : '#666', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>🌟 Todas</button>
          {CATEGORIES.map(cat => (
            <button key={cat.value} onClick={() => setActiveFilter(cat.value)} style={{ padding: '5px 14px', borderRadius: 20, whiteSpace: 'nowrap', border: activeFilter === cat.value ? 'none' : `1px solid ${cat.color}40`, background: activeFilter === cat.value ? cat.color : 'white', color: activeFilter === cat.value ? 'white' : cat.color, cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>{cat.label}</button>
          ))}
        </div>
      </div>

      {/* Form publicar */}
      {showForm && (
        <div style={{ background: 'white', borderRadius: 16, padding: 20, border: '1px solid #e5e5e5', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', marginBottom: 20, animation: 'slideDown 0.2s ease' }}>
          {/* Categorias */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
            {CATEGORIES.map(cat => (
              <button key={cat.value} onClick={() => setPostCategory(cat.value)} style={{ padding: '5px 12px', borderRadius: 20, border: `1.5px solid ${postCategory === cat.value ? cat.color : '#e5e5e5'}`, background: postCategory === cat.value ? cat.color + '15' : 'white', color: postCategory === cat.value ? cat.color : '#888', cursor: 'pointer', fontSize: 12, fontWeight: 600, transition: 'all 0.15s' }}>{cat.label}</button>
            ))}
          </div>
          <textarea rows={3} placeholder="Partilha com a comunidade..." value={postText} onChange={e => setPostText(e.target.value)} style={{ width: '100%', padding: 12, borderRadius: 12, border: '1.5px solid #e5e5e5', fontSize: 14, outline: 'none', resize: 'none', lineHeight: 1.6, boxSizing: 'border-box', marginBottom: 12, fontFamily: 'inherit' }} />
          {mediaPreview && (
            <div style={{ position: 'relative', marginBottom: 12, borderRadius: 12, overflow: 'hidden' }}>
              {mediaType === 'foto' ? <img src={mediaPreview} alt="" style={{ width: '100%', maxHeight: 280, objectFit: 'cover', display: 'block' }} /> : <video src={mediaPreview} controls playsInline style={{ width: '100%', maxHeight: 280, display: 'block' }} />}
              <button onClick={clearMedia} style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(0,0,0,0.6)', border: 'none', borderRadius: '50%', width: 28, height: 28, cursor: 'pointer', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={13} /></button>
            </div>
          )}
          {musicName && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, background: '#f8f4ff', border: '1px solid #a855f740', borderRadius: 10, padding: '8px 12px' }}>
              <Music size={16} style={{ color: '#a855f7' }} />
              <span style={{ flex: 1, fontSize: 12, color: '#666' }}>{musicName}</span>
              <button onClick={clearMusic} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#aaa' }}><X size={13} /></button>
            </div>
          )}
          <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
            <input ref={photoRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handleMediaSelect(e, 'foto')} />
            <input ref={videoRef} type="file" accept="video/*" style={{ display: 'none' }} onChange={e => handleMediaSelect(e, 'video')} />
            <input ref={musicRef} type="file" accept="audio/*" style={{ display: 'none' }} onChange={e => { const f = e.target.files[0]; if (f) { setMusicFile(f); setMusicName(f.name); } }} />
            <button onClick={() => photoRef.current?.click()} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 14px', borderRadius: 20, border: '1px solid #fecdd3', background: '#fff1f2', cursor: 'pointer', fontSize: 12, color: '#e11d48', fontWeight: 600 }}><Image size={15} /> Foto</button>
            <button onClick={() => videoRef.current?.click()} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 14px', borderRadius: 20, border: '1px solid #bfdbfe', background: '#eff6ff', cursor: 'pointer', fontSize: 12, color: '#3b82f6', fontWeight: 600 }}><Video size={15} /> Vídeo</button>
            <button onClick={() => musicRef.current?.click()} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 14px', borderRadius: 20, border: '1px solid #e9d5ff', background: '#faf5ff', cursor: 'pointer', fontSize: 12, color: '#a855f7', fontWeight: 600 }}><Music size={15} /> Música</button>
          </div>
          {uploadError && <div style={{ background: '#fff1f2', border: '1px solid #fecdd3', borderRadius: 8, padding: '8px 12px', marginBottom: 12, fontSize: 12, color: '#e11d48' }}>⚠️ {uploadError}</div>}
          <button onClick={handleSubmit} disabled={uploading || (!postText.trim() && !mediaFile)} style={{ width: '100%', padding: 12, background: uploading || (!postText.trim() && !mediaFile) ? '#e5e5e5' : 'linear-gradient(135deg,#667eea,#764ba2)', border: 'none', borderRadius: 12, color: uploading || (!postText.trim() && !mediaFile) ? '#aaa' : 'white', fontSize: 14, fontWeight: 700, cursor: uploading || (!postText.trim() && !mediaFile) ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            {uploading ? <><div style={{ width: 15, height: 15, border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid white', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />A publicar...</> : <><Send size={15} /> Publicar</>}
          </button>
        </div>
      )}

      {/* Posts */}
      {viewMode === 'feed' ? (
        filteredPosts.map(post => <FeedCard key={post.id} post={post} />)
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 3 }}>
          {filteredPosts.map(post => <GridCard key={post.id} post={post} />)}
        </div>
      )}

      {filteredPosts.length === 0 && (
        <div style={{ textAlign: 'center', padding: 60, color: '#aaa' }}>
          <BookOpen size={40} style={{ opacity: 0.3, marginBottom: 12 }} />
          <p style={{ margin: 0, fontSize: 15 }}>Nenhuma publicação encontrada.</p>
          <p style={{ margin: '4px 0 0', fontSize: 13 }}>Sê o primeiro a partilhar!</p>
        </div>
      )}

      {selectedPost && <PostModal post={selectedPost} onClose={() => setSelectedPost(null)} onLike={handleLike} onDelete={handleDelete} />}
    </div>
  );
}
