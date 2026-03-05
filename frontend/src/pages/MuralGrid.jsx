import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, X, Send, Image, Video, Music, Heart, MessageCircle, Share2, Play, Pause, BookOpen, Trash2, Volume2, VolumeX, Languages, MoreHorizontal } from 'lucide-react';
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
  if (!res.ok) throw new Error('Erro no upload');
  const data = await res.json();
  return data.secure_url;
}

// Colors for categories
const CATEGORIES_CONFIG = [
  { value: 'testemunho', labelKey: 'mural.categories.testemunho', color: '#1877F2' },
  { value: 'louvor',     labelKey: 'mural.categories.louvor',     color: '#8B5CF6' },
  { value: 'reflexao',   labelKey: 'mural.categories.reflexao',   color: '#0EA5E9' },
  { value: 'versiculo',  labelKey: 'mural.categories.versiculo',  color: '#10B981' },
  { value: 'foto',       labelKey: 'mural.categories.foto',       color: '#F43F5E' },
];

const getCatColor = (type) => CATEGORIES_CONFIG.find(c => c.value === type)?.color || '#888';

function MiniAudioPlayer({ src, isPlaying, onPlay, onPause }) {
  const audioRef = useRef(null);
  const [internalPlaying, setInternalPlaying] = useState(false);
  const playing = isPlaying !== undefined ? isPlaying : internalPlaying;

  useEffect(() => {
    if (audioRef.current) {
      if (playing) audioRef.current.play().catch(e => console.error(e));
      else audioRef.current.pause();
    }
  }, [playing]);

  const toggle = () => {
    if (internalPlaying) {
      onPause && onPause();
      setInternalPlaying(false);
    } else {
      onPlay && onPlay();
      setInternalPlaying(true);
    }
  };

  return (
    <div style={{display:'flex',alignItems:'center',gap:10,background:'#F3F4F6',borderRadius:12,padding:'8px 12px',marginTop:8}}>
      <audio ref={audioRef} src={src} onEnded={()=>setInternalPlaying(false)} />
      <button onClick={toggle} style={{width:32,height:32,borderRadius:'50%',background:'var(--fb2)',border:'none',color:'white',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer'}}>
        {playing ? <Pause size={14}/> : <Play size={14}/>}
      </button>
      <div style={{flex:1,height:4,background:'#E5E7EB',borderRadius:2}}>
         <div style={{width: playing ? '60%' : '0%', height:'100%', background:'var(--fb2)', transition:'width 0.5s'}}/>
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

  const authorName = post.full_name || post.author_name || t('common.user');
  const authorAvatar = post.author_avatar || post.avatar_url;
  const isOwner = user && (user.id === post.author_id || user.id === post.user_id);

  const videoRef = useRef(null);
  const [isMuted, setIsMuted] = useState(true);

  const handleTranslate = async () => {
    if (showTranslation) { setShowTranslation(false); return; }
    if (translatedContent) { setShowTranslation(true); return; }
    setTranslating(true);
    try {
      const res = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(post.content.substring(0,500))}&langpair=pt|${i18n.language}`);
      const data = await res.json();
      if (data.responseData?.translatedText) {
        setTranslatedContent(data.responseData.translatedText);
        setShowTranslation(true);
      }
    } catch (e) { console.error(e); } finally { setTranslating(false); }
  };

  const submitComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    const newComment = { id: Date.now(), content: comment, full_name: user?.full_name };
    setComments([...comments, newComment]);
    setComment('');
    try {
      await fetch(`${API}/feed/${post.id}/comments`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newComment.content })
      });
    } catch(e) { console.error(e); }
  };

  return (
    <article className="modern-card post-card">
      <div style={{padding:'14px 16px 10px',display:'flex',alignItems:'center',gap:10}}>
        {authorAvatar ? (
          <img src={authorAvatar} alt={authorName} style={{width:40,height:40,borderRadius:'50%',objectFit:'cover'}} />
        ) : (
          <div style={{width:40,height:40,borderRadius:'50%',background:`linear-gradient(135deg,${color},${color}88)`,display:'flex',alignItems:'center',justifyContent:'center',color:'white',fontWeight:700}}>
            {authorName.charAt(0)}
          </div>
        )}
        <div style={{flex:1}}>
          <p style={{fontWeight:600,fontSize:'0.9rem',color:'var(--text)'}}>{authorName}</p>
          <p style={{fontSize:'0.75rem',color:'var(--muted)'}}>{new Date(post.created_at).toLocaleDateString()} · {post.church || 'Sigo com Fé'}</p>
        </div>
        {isOwner && (
          <button onClick={()=>onDelete(post.id)} style={{color:'#ccc'}}><Trash2 size={16}/></button>
        )}
      </div>

      {post.media_url && (
        <div style={{width:'100%',background:'#000',display:'flex',justifyContent:'center'}}>
          {post.media_url.match(/\.(mp4|webm|mov)(\?|$)/i) ? (
             <video src={post.media_url} controls style={{maxWidth:'100%',maxHeight:500}} />
          ) : (
             <img src={post.media_url} alt="Post" style={{maxWidth:'100%',maxHeight:500,objectFit:'contain'}} />
          )}
        </div>
      )}

      <div style={{padding:'12px 16px'}}>
         <p style={{fontSize:'0.9rem',lineHeight:1.5,color:'var(--text)'}}>
           {post.content}
         </p>
         {post.audio_url && <MiniAudioPlayer src={post.audio_url} />}
         
         {showTranslation && (
           <div style={{marginTop:8,padding:10,background:'#F0F9FF',borderRadius:8,fontSize:'0.85rem',color:'#0369A1'}}>
             🌍 {translatedContent}
           </div>
         )}
      </div>

      <div style={{padding:'8px 16px 12px',borderTop:'1px solid var(--border)',display:'flex',gap:16}}>
        <button onClick={()=>onLike(post.id)} style={{display:'flex',alignItems:'center',gap:6,color:post.liked?'#E11D48':'var(--muted)',fontSize:'0.85rem',fontWeight:600}}>
           <Heart size={18} fill={post.liked?'#E11D48':'none'} /> {post.like_count||0}
        </button>
        <button onClick={()=>setShowComments(!showComments)} style={{display:'flex',alignItems:'center',gap:6,color:'var(--muted)',fontSize:'0.85rem',fontWeight:600}}>
           <MessageCircle size={18} /> {comments.length}
        </button>
        <button onClick={handleTranslate} style={{display:'flex',alignItems:'center',gap:6,color:'var(--muted)',fontSize:'0.85rem',marginLeft:'auto'}}>
           <Languages size={18} />
        </button>
      </div>
      
      {showComments && (
        <div style={{padding:'0 16px 16px',borderTop:'1px solid var(--border)'}}>
           <div style={{maxHeight:200,overflowY:'auto',marginBottom:10}}>
             {comments.map((c,i) => (
               <div key={i} style={{padding:'6px 0',fontSize:'0.85rem'}}>
                 <b>{c.full_name}:</b> {c.content}
               </div>
             ))}
           </div>
           <form onSubmit={submitComment} style={{display:'flex',gap:8}}>
             <input value={comment} onChange={e=>setComment(e.target.value)} placeholder={t('mural.commentPlaceholder')} style={{flex:1,padding:'8px 12px',borderRadius:20,border:'1px solid var(--border)',fontSize:'0.85rem',outline:'none'}} />
             <button type="submit" style={{color:'var(--fb2)'}}><Send size={18}/></button>
           </form>
        </div>
      )}
    </article>
  );
}

export default function MuralGrid() {
  const { t } = useTranslation();
  const { user, token } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Composer state
  const [postText, setPostText] = useState('');
  const [postCategory, setPostCategory] = useState('testemunho');
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [uploading, setUploading] = useState(false);

  const fileInputRef = useRef(null);

  const fetchPosts = useCallback(async () => {
    try {
      const res = await fetch(`${API}/feed?limit=20`, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
      const data = await res.json();
      const rawPosts = data.posts || [];
      // Fetch likes if logged in
      if (token) {
        try {
          const lr = await fetch(`${API}/feed/liked-posts`, { headers: { Authorization: `Bearer ${token}` } });
          const ld = await lr.json();
          const likedIds = ld.likedIds || [];
          setPosts(rawPosts.map(p => ({ ...p, liked: likedIds.includes(p.id) })));
        } catch(e){ setPosts(rawPosts); }
      } else {
        setPosts(rawPosts);
      }
    } catch (e) { console.error(e); } finally { setLoading(false); }
  }, [token]);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  const handleLike = async (postId) => {
    if (!user) return;
    setPosts(prev => prev.map(p => p.id===postId ? {...p, liked:!p.liked, like_count: p.liked ? p.like_count-1 : p.like_count+1} : p));
    try { await fetch(`${API}/feed/${postId}/like`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } }); } catch(e){}
  };

  const handleDelete = async (postId) => {
    if(!window.confirm(t('mural.confirmDelete'))) return;
    try { 
      await fetch(`${API}/feed/${postId}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      setPosts(prev => prev.filter(p => p.id !== postId));
    } catch(e){}
  };

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (file) {
      setMediaFile(file);
      setMediaPreview(URL.createObjectURL(file));
      setIsExpanded(true);
    }
  };

  const handleSubmit = async () => {
    if (!postText.trim() && !mediaFile) return;
    setUploading(true);
    try {
      let mediaUrl = null;
      if (mediaFile) mediaUrl = await uploadToCloudinary(mediaFile);
      
      const res = await fetch(`${API}/feed`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          content: postText, 
          category: postCategory,
          media_url: mediaUrl,
          media_type: mediaFile ? (mediaFile.type.startsWith('video')?'video':'foto') : undefined
        })
      });
      const data = await res.json();
      if (data.post) {
        setPosts([{...data.post, full_name: user.full_name, author_avatar: user.avatar_url, liked: false, like_count: 0}, ...posts]);
        setPostText('');
        setMediaFile(null);
        setMediaPreview(null);
        setIsExpanded(false);
      }
    } catch(e) { console.error(e); alert('Erro ao publicar'); } finally { setUploading(false); }
  };

  return (
    <div style={{width:'100%', maxWidth: 700, margin: '0 auto'}}>
      
      {/* VERSE BANNER */}
      <div className="verse-banner" style={{background:'linear-gradient(135deg,var(--fb2),var(--fb))',borderRadius:16,padding:'24px 20px',color:'white',marginBottom:20,textAlign:'center',boxShadow:'0 4px 15px rgba(24,119,242,0.25)'}}>
        <p style={{fontSize:'0.7rem',textTransform:'uppercase',letterSpacing:'0.15em',opacity:0.8,marginBottom:8}}>{t('mural.dailyVerse')}</p>
        <p style={{fontFamily:"'Cormorant Garamond',serif",fontSize:'1.3rem',fontStyle:'italic',marginBottom:8}}>
          "Porque onde dois ou três estiverem reunidos em meu nome, ali estou no meio deles."
        </p>
        <p style={{fontSize:'0.8rem',opacity:0.8}}>— Mateus 18:20</p>
      </div>

      {/* COMPOSER */}
      {user && (
        <div className="modern-card composer" style={{padding:16, marginBottom:20}}>
          <div style={{display:'flex',gap:12,marginBottom:12}}>
            {user.avatar_url ? (
               <img src={user.avatar_url} style={{width:40,height:40,borderRadius:'50%',objectFit:'cover'}} />
            ) : (
               <div style={{width:40,height:40,borderRadius:'50%',background:'#E5E7EB',display:'flex',alignItems:'center',justifyContent:'center'}}>👤</div>
            )}
            <input 
              style={{flex:1,padding:'10px 16px',borderRadius:24,border:'1px solid #E5E7EB',background:'#F9FAFB',outline:'none',fontSize:'0.9rem'}}
              placeholder={t('mural.whatsOnMind', 'Partilhe sua fé...')}
              value={postText}
              onChange={e => setPostText(e.target.value)}
              onFocus={() => setIsExpanded(true)}
            />
          </div>
          
          {isExpanded && (
            <div style={{animation:'fadeUp 0.3s ease'}}>
              <div style={{marginBottom:12}}>
                 <select value={postCategory} onChange={e=>setPostCategory(e.target.value)} style={{padding:'6px 10px',borderRadius:8,border:'1px solid #E5E7EB',fontSize:'0.85rem'}}>
                   {CATEGORIES_CONFIG.map(c => <option key={c.value} value={c.value}>{t(c.labelKey)}</option>)}
                 </select>
              </div>
              {mediaPreview && (
                <div style={{position:'relative',marginBottom:12}}>
                   <img src={mediaPreview} style={{maxHeight:200,borderRadius:8}} />
                   <button onClick={()=>{setMediaFile(null);setMediaPreview(null)}} style={{position:'absolute',top:5,right:5,background:'rgba(0,0,0,0.5)',color:'white',borderRadius:'50%',width:24,height:24,display:'flex',alignItems:'center',justifyContent:'center',border:'none',cursor:'pointer'}}><X size={14}/></button>
                </div>
              )}
            </div>
          )}

          <div style={{display:'flex',justifyContent:'space-between',borderTop:'1px solid #F3F4F6',paddingTop:12}}>
             <div style={{display:'flex',gap:4}}>
               <button onClick={()=>fileInputRef.current.click()} style={{display:'flex',alignItems:'center',gap:6,padding:'6px 12px',borderRadius:8,border:'none',background:'none',color:'var(--muted)',cursor:'pointer',fontSize:'0.85rem',transition:'background 0.2s'}}>
                 <Image size={18} color="#10B981" /> <span style={{display:'none', '@media (min-width: 500px)': {display:'inline'}}}>Foto</span>
               </button>
               <button onClick={()=>fileInputRef.current.click()} style={{display:'flex',alignItems:'center',gap:6,padding:'6px 12px',borderRadius:8,border:'none',background:'none',color:'var(--muted)',cursor:'pointer',fontSize:'0.85rem'}}>
                 <Video size={18} color="#F43F5E" />
               </button>
             </div>
             <input type="file" ref={fileInputRef} style={{display:'none'}} onChange={handleFile} accept="image/*,video/*" />
             
             {isExpanded && (
               <button onClick={handleSubmit} disabled={uploading} style={{padding:'6px 20px',borderRadius:20,background:uploading?'#ccc':'var(--fb)',color:'white',border:'none',fontWeight:600,cursor:uploading?'not-allowed':'pointer'}}>
                 {uploading ? '...' : t('mural.publish')}
               </button>
             )}
          </div>
        </div>
      )}

      {/* FEED */}
      <div style={{display:'flex',flexDirection:'column',gap:16}}>
        {loading ? (
          <div style={{textAlign:'center',padding:40,color:'var(--muted)'}}>Loading...</div>
        ) : posts.map(post => (
          <PostCard 
            key={post.id} 
            post={post} 
            user={user} 
            token={token} 
            onLike={handleLike} 
            onDelete={handleDelete} 
          />
        ))}
      </div>
    </div>
  );
}
