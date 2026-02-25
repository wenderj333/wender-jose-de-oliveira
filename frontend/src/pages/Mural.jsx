import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { Plus, X, Send, Heart, MessageCircle, Image, Trash2, Grid, List } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

const API_BASE = import.meta.env.VITE_API_URL || '';
const API = `${API_BASE}/api`;

const CATEGORIES = [
  { value: 'testemunho', label: 'ðŸ™ Testemunho', color: '#daa520' },
  { value: 'louvor', label: 'ðŸŽµ Louvor', color: '#9b59b6' },
  { value: 'foto', label: 'ðŸ“¸ Foto/VÃ­deo', color: '#3498db' },
  { value: 'versiculo', label: 'ðŸ“– VersÃ­culo', color: '#27ae60' },
  { value: 'reflexao', label: 'ðŸ’­ ReflexÃ£o', color: '#e67e22' },
  { value: 'campanha', label: 'ðŸ¤ Campanha', color: '#e74c3c' },
];

export default function Mural() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'feed'
  const [selectedPost, setSelectedPost] = useState(null);
  const [showNewPost, setShowNewPost] = useState(false);
  const [newPost, setNewPost] = useState({ content: '', category: 'reflexao', mediaUrl: '' });
  const [comment, setComment] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');

  const fetchPosts = useCallback(async () => {
    try {
      const res = await fetch(`${API}/posts?limit=60`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      const data = await res.json();
      setPosts(data.posts || data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  const handleLike = async (postId) => {
    if (!user) { navigate('/login'); return; }
    try {
      await fetch(`${API}/posts/${postId}/like`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchPosts();
      if (selectedPost?.id === postId) {
        setSelectedPost(prev => ({
          ...prev,
          liked: !prev.liked,
          likes_count: prev.liked ? prev.likes_count - 1 : prev.likes_count + 1
        }));
      }
    } catch (e) { console.error(e); }
  };

  const handleComment = async (postId) => {
    if (!user) { navigate('/login'); return; }
    if (!comment.trim()) return;
    try {
      await fetch(`${API}/posts/${postId}/comments`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: comment })
      });
      setComment('');
      fetchPosts();
    } catch (e) { console.error(e); }
  };

  const handleDelete = async (postId) => {
    if (!window.confirm('Eliminar post?')) return;
    try {
      await fetch(`${API}/posts/${postId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      setSelectedPost(null);
      fetchPosts();
    } catch (e) { console.error(e); }
  };

  const handleSubmitPost = async () => {
    if (!newPost.content.trim()) return;
    try {
      await fetch(`${API}/posts`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(newPost)
      });
      setNewPost({ content: '', category: 'reflexao', mediaUrl: '' });
      setShowNewPost(false);
      fetchPosts();
    } catch (e) { console.error(e); }
  };

  const filteredPosts = filterCategory === 'all'
    ? posts
    : posts.filter(p => p.category === filterCategory);

  const getCategoryColor = (cat) => CATEGORIES.find(c => c.value === cat)?.color || '#daa520';

const isVideo = (url) => {
  if (!url) return false;
  const lower = url.toLowerCase();
  return lower.includes('youtube.com') || lower.includes('youtu.be') ||
    lower.includes('vimeo.com') || /\.(mp4|webm|ogg|mov)(\?|$)/.test(lower);
};
const getYoutubeId = (url) => {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&?/]+)/);
  return match ? match[1] : null;
};
const MediaPlayer = ({ url, style }) => {
  if (!url) return null;
  const ytId = getYoutubeId(url);
  if (ytId) {
    return React.createElement('iframe', {
      src: 'https://www.youtube.com/embed/' + ytId,
      style: { width: '100%', aspectRatio: '16/9', border: 'none', ...style },
      allow: 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture',
      allowFullScreen: true
    });
  }
  if (isVideo(url)) return <video src={url} controls style={{ width: '100%', maxHeight: 400, ...style }} />;
  return <img src={url} alt="" style={{ width: '100%', maxHeight: 400, objectFit: 'cover', ...style }} />;
};

  // â”€â”€ MODAL POST DETAIL â”€â”€
  const PostModal = ({ post, onClose }) => (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)',
      zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center'
    }} onClick={onClose}>
      <div style={{
        background: '#1a1a2e', borderRadius: 12, maxWidth: 900, width: '95vw',
        maxHeight: '90vh', display: 'flex', overflow: 'hidden',
        flexDirection: window.innerWidth < 768 ? 'column' : 'row'
      }} onClick={e => e.stopPropagation()}>

        {/* Left: Media or Text */}
        <div style={{
          flex: post.media_url ? '1.2' : '1',
          background: '#0f0f1a',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          minHeight: 300, position: 'relative'
        }}>
          {post.media_url ? (
            <MediaPlayer url={post.media_url} style={{ height: "100%", objectFit: "cover" }} />
          ) : (
            <div style={{ padding: 32, textAlign: 'center' }}>
              <div style={{
                fontSize: '3rem', marginBottom: 16,
                background: `linear-gradient(135deg, ${getCategoryColor(post.category)}, #fff)`,
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
              }}>âœï¸</div>
              <p style={{ color: '#fff', fontSize: '1.1rem', lineHeight: 1.6 }}>{post.content}</p>
            </div>
          )}
          <button onClick={onClose} style={{
            position: 'absolute', top: 12, right: 12,
            background: 'rgba(0,0,0,0.5)', border: 'none', color: '#fff',
            borderRadius: '50%', width: 32, height: 32, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}><X size={16} /></button>
        </div>

        {/* Right: Info + Comments */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', maxHeight: '90vh' }}>
          {/* Header */}
          <div style={{ padding: '16px', borderBottom: '1px solid #333', display: 'flex', alignItems: 'center', gap: 12 }}>
            <Link to={`/perfil/${post.user_id}`} onClick={onClose}>
              <img
                src={post.avatar_url || `https://ui-avatars.com/api/?name=${post.full_name || 'U'}&background=daa520&color=fff`}
                style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }}
                alt=""
              />
            </Link>
            <div style={{ flex: 1 }}>
              <Link to={`/perfil/${post.user_id}`} onClick={onClose} style={{ color: '#daa520', fontWeight: 600, textDecoration: 'none' }}>
                {post.full_name || 'Utilizador'}
              </Link>
              <div style={{ color: '#999', fontSize: '0.75rem' }}>
                {new Date(post.created_at).toLocaleDateString('pt-BR')}
              </div>
            </div>
            <span style={{
              background: getCategoryColor(post.category) + '33',
              color: getCategoryColor(post.category),
              padding: '2px 8px', borderRadius: 12, fontSize: '0.7rem'
            }}>
              {CATEGORIES.find(c => c.value === post.category)?.label || post.category}
            </span>
            {user?.id === post.user_id && (
              <button onClick={() => handleDelete(post.id)} style={{ background: 'none', border: 'none', color: '#e74c3c', cursor: 'pointer' }}>
                <Trash2 size={16} />
              </button>
            )}
          </div>

          {/* Content if has media */}
          {post.media_url && post.content && (
            <div style={{ padding: '12px 16px', borderBottom: '1px solid #333', color: '#ccc', fontSize: '0.9rem' }}>
              {post.content}
            </div>
          )}

          {/* Comments */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px' }}>
            {(post.comments || []).map((c, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                <img
                  src={c.avatar_url || `https://ui-avatars.com/api/?name=${c.full_name || 'U'}&background=555&color=fff`}
                  style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
                  alt=""
                />
                <div>
                  <span style={{ color: '#daa520', fontWeight: 600, fontSize: '0.82rem' }}>{c.full_name} </span>
                  <span style={{ color: '#ccc', fontSize: '0.82rem' }}>{c.content}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div style={{ borderTop: '1px solid #333', padding: '12px 16px' }}>
            <div style={{ display: 'flex', gap: 16, marginBottom: 8 }}>
              <button onClick={() => handleLike(post.id)} style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: post.liked ? '#e74c3c' : '#aaa', display: 'flex', alignItems: 'center', gap: 4
              }}>
                <Heart size={20} fill={post.liked ? '#e74c3c' : 'none'} />
                <span style={{ fontSize: '0.85rem' }}>{post.likes_count || 0}</span>
              </button>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#aaa', display: 'flex', alignItems: 'center', gap: 4 }}>
                <MessageCircle size={20} />
                <span style={{ fontSize: '0.85rem' }}>{(post.comments || []).length}</span>
              </button>
            </div>
            {user && (
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleComment(post.id)}
                  placeholder="Adicionar comentÃ¡rio..."
                  style={{
                    flex: 1, background: '#0f0f1a', border: '1px solid #333',
                    borderRadius: 20, padding: '8px 14px', color: '#fff', fontSize: '0.85rem'
                  }}
                />
                <button onClick={() => handleComment(post.id)} style={{
                  background: '#daa520', border: 'none', borderRadius: '50%',
                  width: 34, height: 34, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <Send size={14} color="#000" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  // â”€â”€ GRID CARD â”€â”€
  const GridCard = ({ post }) => (
    <div
      onClick={() => setSelectedPost(post)}
      style={{
        aspectRatio: '1/1', position: 'relative', cursor: 'pointer',
        background: '#1a1a2e', overflow: 'hidden', borderRadius: 4
      }}
    >
      {post.media_url ? (
        <MediaPlayer url={post.media_url} style={{ height: "100%", objectFit: "cover" }} />
      ) : (
        <div style={{
          width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: `linear-gradient(135deg, ${getCategoryColor(post.category)}22, #1a1a2e)`,
          padding: 12
        }}>
          <p style={{ color: '#fff', fontSize: '0.75rem', textAlign: 'center', lineHeight: 1.4, overflow: 'hidden',
            display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical' }}>
            {post.content}
          </p>
        </div>
      )}
      {/* Hover overlay */}
      <div className="grid-overlay" style={{
        position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16,
        opacity: 0, transition: 'opacity 0.2s'
      }}>
        <span style={{ color: '#fff', display: 'flex', alignItems: 'center', gap: 4 }}>
          <Heart size={16} fill="#fff" /> {post.likes_count || 0}
        </span>
        <span style={{ color: '#fff', display: 'flex', alignItems: 'center', gap: 4 }}>
          <MessageCircle size={16} /> {(post.comments || []).length}
        </span>
      </div>
      {/* Category dot */}
      <div style={{
        position: 'absolute', top: 6, right: 6, width: 8, height: 8,
        borderRadius: '50%', background: getCategoryColor(post.category)
      }} />
    </div>
  );

  // â”€â”€ FEED CARD â”€â”€
  const FeedCard = ({ post }) => (
    <div style={{ background: '#1a1a2e', borderRadius: 12, marginBottom: 16, overflow: 'hidden', border: '1px solid #333' }}>
      {/* Header */}
      <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <Link to={`/perfil/${post.user_id}`}>
          <img
            src={post.avatar_url || `https://ui-avatars.com/api/?name=${post.full_name || 'U'}&background=daa520&color=fff`}
            style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }}
            alt=""
          />
        </Link>
        <div style={{ flex: 1 }}>
          <Link to={`/perfil/${post.user_id}`} style={{ color: '#daa520', fontWeight: 600, textDecoration: 'none', fontSize: '0.9rem' }}>
            {post.full_name || 'Utilizador'}
          </Link>
          <div style={{ color: '#999', fontSize: '0.72rem' }}>{new Date(post.created_at).toLocaleDateString('pt-BR')}</div>
        </div>
        <span style={{
          background: getCategoryColor(post.category) + '33',
          color: getCategoryColor(post.category),
          padding: '2px 8px', borderRadius: 12, fontSize: '0.7rem'
        }}>
          {CATEGORIES.find(c => c.value === post.category)?.label || post.category}
        </span>
      </div>

      {/* Media */}
      {post.media_url && (
        <MediaPlayer url={post.media_url} />
      )}

      {/* Content */}
      <div style={{ padding: '12px 16px', color: '#ddd', fontSize: '0.9rem', lineHeight: 1.6 }}>
        {post.content}
      </div>

      {/* Actions */}
      <div style={{ padding: '8px 16px 12px', display: 'flex', gap: 16, borderTop: '1px solid #2a2a3e' }}>
        <button onClick={() => handleLike(post.id)} style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: post.liked ? '#e74c3c' : '#aaa', display: 'flex', alignItems: 'center', gap: 4
        }}>
          <Heart size={18} fill={post.liked ? '#e74c3c' : 'none'} />
          <span style={{ fontSize: '0.82rem' }}>{post.likes_count || 0}</span>
        </button>
        <button onClick={() => setSelectedPost(post)} style={{
          background: 'none', border: 'none', cursor: 'pointer', color: '#aaa', display: 'flex', alignItems: 'center', gap: 4
        }}>
          <MessageCircle size={18} />
          <span style={{ fontSize: '0.82rem' }}>{(post.comments || []).length}</span>
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ maxWidth: 935, margin: '0 auto', padding: '0 16px 80px' }}>
      <style>{`
        .grid-card:hover .grid-overlay { opacity: 1 !important; }
        @media (max-width: 600px) { .mural-grid { grid-template-columns: repeat(3, 1fr) !important; gap: 2px !important; } }
      `}</style>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 0 16px', borderBottom: '1px solid #333', marginBottom: 16 }}>
        <h2 style={{ color: '#daa520', margin: 0, fontSize: '1.4rem' }}>âœï¸ Mural</h2>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => setViewMode('grid')} style={{
            background: viewMode === 'grid' ? '#daa520' : 'transparent',
            border: '1px solid #daa520', borderRadius: 6, padding: '6px 10px', cursor: 'pointer',
            color: viewMode === 'grid' ? '#000' : '#daa520'
          }}><Grid size={16} /></button>
          <button onClick={() => setViewMode('feed')} style={{
            background: viewMode === 'feed' ? '#daa520' : 'transparent',
            border: '1px solid #daa520', borderRadius: 6, padding: '6px 10px', cursor: 'pointer',
            color: viewMode === 'feed' ? '#000' : '#daa520'
          }}><List size={16} /></button>
          {user && (
            <button onClick={() => setShowNewPost(true)} style={{
              background: '#daa520', border: 'none', borderRadius: 6, padding: '6px 12px',
              cursor: 'pointer', color: '#000', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4
            }}>
              <Plus size={16} /> Publicar
            </button>
          )}
        </div>
      </div>

      {/* Category Filter */}
      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 12, marginBottom: 16 }}>
        <button onClick={() => setFilterCategory('all')} style={{
          background: filterCategory === 'all' ? '#daa520' : '#1a1a2e',
          border: '1px solid #333', borderRadius: 20, padding: '4px 14px',
          color: filterCategory === 'all' ? '#000' : '#aaa', cursor: 'pointer', whiteSpace: 'nowrap', fontSize: '0.82rem'
        }}>Todos</button>
        {CATEGORIES.map(cat => (
          <button key={cat.value} onClick={() => setFilterCategory(cat.value)} style={{
            background: filterCategory === cat.value ? cat.color : '#1a1a2e',
            border: `1px solid ${cat.color}`, borderRadius: 20, padding: '4px 14px',
            color: filterCategory === cat.value ? '#000' : cat.color, cursor: 'pointer', whiteSpace: 'nowrap', fontSize: '0.82rem'
          }}>{cat.label}</button>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ textAlign: 'center', padding: 40, color: '#daa520' }}>A carregar...</div>
      )}

      {/* Grid View */}
      {!loading && viewMode === 'grid' && (
        <div className="mural-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 3
        }}>
          {filteredPosts.map(post => (
            <div key={post.id} className="grid-card" style={{ position: 'relative' }}>
              <GridCard post={post} />
            </div>
          ))}
        </div>
      )}

      {/* Feed View */}
      {!loading && viewMode === 'feed' && (
        <div style={{ maxWidth: 614, margin: '0 auto' }}>
          {filteredPosts.map(post => <FeedCard key={post.id} post={post} />)}
        </div>
      )}

      {filteredPosts.length === 0 && !loading && (
        <div style={{ textAlign: 'center', padding: 60, color: '#666' }}>
          <p>Nenhum post encontrado.</p>
        </div>
      )}

      {/* Post Modal */}
      {selectedPost && <PostModal post={selectedPost} onClose={() => setSelectedPost(null)} />}

      {/* New Post Modal */}
      {showNewPost && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)',
          zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{ background: '#1a1a2e', borderRadius: 12, padding: 24, width: '90%', maxWidth: 500 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
              <h3 style={{ color: '#daa520', margin: 0 }}>Nova PublicaÃ§Ã£o</h3>
              <button onClick={() => setShowNewPost(false)} style={{ background: 'none', border: 'none', color: '#aaa', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>
            <textarea
              value={newPost.content}
              onChange={e => setNewPost(p => ({ ...p, content: e.target.value }))}
              placeholder="Partilha algo com a comunidade..."
              rows={4}
              style={{
                width: '100%', background: '#0f0f1a', border: '1px solid #333',
                borderRadius: 8, padding: 12, color: '#fff', fontSize: '0.9rem',
                resize: 'none', boxSizing: 'border-box'
              }}
            />
            <input
              value={newPost.mediaUrl}
              onChange={e => setNewPost(p => ({ ...p, mediaUrl: e.target.value }))}
              placeholder="URL da imagem (opcional)"
              style={{
                width: '100%', background: '#0f0f1a', border: '1px solid #333',
                borderRadius: 8, padding: 10, color: '#fff', fontSize: '0.85rem',
                marginTop: 8, boxSizing: 'border-box'
              }}
            />
            <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
              {CATEGORIES.map(cat => (
                <button key={cat.value} onClick={() => setNewPost(p => ({ ...p, category: cat.value }))} style={{
                  background: newPost.category === cat.value ? cat.color : 'transparent',
                  border: `1px solid ${cat.color}`, borderRadius: 20, padding: '3px 10px',
                  color: newPost.category === cat.value ? '#000' : cat.color, cursor: 'pointer', fontSize: '0.75rem'
                }}>{cat.label}</button>
              ))}
            </div>
            <button onClick={handleSubmitPost} style={{
              width: '100%', marginTop: 16, background: '#daa520', border: 'none',
              borderRadius: 8, padding: 12, color: '#000', fontWeight: 700, cursor: 'pointer', fontSize: '1rem'
            }}>Publicar</button>
          </div>
        </div>
      )}
    </div>
  );
}


