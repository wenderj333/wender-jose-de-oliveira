import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { User, Calendar, Edit, Heart, Users, Church, Save, X, Camera, Lock, Globe, Plus, Image, BookOpen, Info, Grid3x3, MessageCircle } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || '';
const API = `${API_BASE}/api`;

const CATEGORIES = [
  { value: 'testemunho', label: '🙏 Testemunho', color: '#daa520' },
  { value: 'louvor', label: '🎵 Louvor', color: '#9b59b6' },
  { value: 'foto', label: '📸 Foto', color: '#3498db' },
  { value: 'versiculo', label: '📖 Versículo', color: '#27ae60' },
  { value: 'reflexao', label: '💭 Reflexão', color: '#e67e22' },
];

export default function Profile() {
  const { userId } = useParams();
  const { t } = useTranslation();
  const { user: currentUser, token } = useAuth();
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState({ prayers: 0, posts: 0, friends: 0 });
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ display_name: '', bio: '', avatar_url: '', phone: '' });
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef(null);

  // Tabs & content
  const [activeTab, setActiveTab] = useState('posts');
  const [posts, setPosts] = useState([]);
  const [prayers, setPrayers] = useState([]);
  const [loadingContent, setLoadingContent] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);

  // New post modal
  const [showNewPost, setShowNewPost] = useState(false);
  const [newPost, setNewPost] = useState({ content: '', category: 'testemunho', verse_reference: '' });
  const [newPostImage, setNewPostImage] = useState(null);
  const [newPostPreview, setNewPostPreview] = useState(null);
  const [creatingPost, setCreatingPost] = useState(false);
  const postImageRef = useRef(null);

  const isOwnProfile = currentUser?.id === userId;

  useEffect(() => {
    fetchProfile();
    fetchStats();
  }, [userId]);

  useEffect(() => {
    if (activeTab === 'posts') fetchPosts();
    else if (activeTab === 'prayers') fetchPrayers();
  }, [activeTab, userId]);

  async function fetchProfile() {
    try {
      const res = await fetch(`${API}/profile/${userId}`);
      const data = await res.json();
      if (data.user) {
        setProfile(data.user);
        setForm({
          display_name: data.user.display_name || '',
          bio: data.user.bio || '',
          avatar_url: data.user.avatar_url || '',
          phone: '',
        });
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  }

  async function fetchStats() {
    try {
      const res = await fetch(`${API}/profile/${userId}/stats`);
      const data = await res.json();
      setStats(data);
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  }

  async function fetchPosts() {
    setLoadingContent(true);
    try {
      const res = await fetch(`${API}/feed/user/${userId}`);
      const data = await res.json();
      setPosts(data.posts || []);
    } catch (err) {
      console.error('Error fetching posts:', err);
    } finally {
      setLoadingContent(false);
    }
  }

  async function fetchPrayers() {
    setLoadingContent(true);
    try {
      const res = await fetch(`${API}/prayers?authorId=${userId}`);
      const data = await res.json();
      setPrayers(data.prayers || []);
    } catch (err) {
      console.error('Error fetching prayers:', err);
    } finally {
      setLoadingContent(false);
    }
  }

  async function handleAvatarUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      const res = await fetch(`${API}/profile/avatar`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (data.avatar_url) {
        setProfile(prev => ({ ...prev, avatar_url: data.avatar_url }));
        setForm(prev => ({ ...prev, avatar_url: data.avatar_url }));
      }
    } catch (err) {
      console.error('Error uploading avatar:', err);
    } finally {
      setUploadingAvatar(false);
    }
  }

  async function handleTogglePrivacy() {
    const newVal = !profile.is_private;
    try {
      const res = await fetch(`${API}/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...form, is_private: newVal }),
      });
      const data = await res.json();
      if (data.user) setProfile(prev => ({ ...prev, ...data.user }));
    } catch (err) {
      console.error('Error toggling privacy:', err);
    }
  }

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch(`${API}/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...form, is_private: profile.is_private }),
      });
      const data = await res.json();
      if (data.user) {
        setProfile(prev => ({ ...prev, ...data.user }));
        setEditing(false);
      }
    } catch (err) {
      console.error('Error saving profile:', err);
    } finally {
      setSaving(false);
    }
  }

  async function handleCreatePost() {
    if (!newPost.content.trim()) return;
    setCreatingPost(true);
    try {
      const formData = new FormData();
      formData.append('content', newPost.content);
      formData.append('category', newPost.category);
      if (newPost.verse_reference) formData.append('verse_reference', newPost.verse_reference);
      if (newPostImage) formData.append('image', newPostImage);

      const res = await fetch(`${API}/feed`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (data.post) {
        setPosts(prev => [data.post, ...prev]);
        setStats(prev => ({ ...prev, posts: prev.posts + 1 }));
        setShowNewPost(false);
        setNewPost({ content: '', category: 'testemunho', verse_reference: '' });
        setNewPostImage(null);
        setNewPostPreview(null);
      }
    } catch (err) {
      console.error('Error creating post:', err);
    } finally {
      setCreatingPost(false);
    }
  }

  async function handleDeletePost(postId) {
    try {
      await fetch(`${API}/feed/${postId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      setPosts(prev => prev.filter(p => p.id !== postId));
      setStats(prev => ({ ...prev, posts: Math.max(0, prev.posts - 1) }));
      setSelectedPost(null);
    } catch (err) {
      console.error('Error deleting post:', err);
    }
  }

  function handlePostImageSelect(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setNewPostImage(file);
    const reader = new FileReader();
    reader.onload = () => setNewPostPreview(reader.result);
    reader.readAsDataURL(file);
  }

  async function handleAddFriend() {
    try {
      await fetch(`${API}/friends/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ addressee_id: userId }),
      });
    } catch (err) {
      console.error('Error sending friend request:', err);
    }
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
        <div className="loading-spinner" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem', color: '#999' }}>
        <User size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
        <p>Usuário não encontrado</p>
      </div>
    );
  }

  const isPrivateAndNotOwner = profile.is_private && !isOwnProfile;
  const memberSince = new Date(profile.created_at).toLocaleDateString();
  const avatarSrc = profile.avatar_url
    ? (profile.avatar_url.startsWith('http') ? profile.avatar_url : `${API_BASE}${profile.avatar_url}`)
    : null;

  const getMediaUrl = (url) => url ? (url.startsWith('http') ? url : `${API_BASE}${url}`) : null;

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: '0' }}>
      {/* Header - compact Instagram style */}
      <div style={{
        background: 'rgba(26, 10, 62, 0.6)', // Fundo semitransparente mais leve
        padding: '1.5rem 1.25rem 1rem',
        color: '#fff',
        position: 'relative',
        overflow: 'hidden',
        borderRadius: '16px',
        marginBottom: '1.5rem',
        boxShadow: '0 8px 30px rgba(0,0,0,0.3)',
        backdropFilter: 'blur(8px)', // Efeito de vidro
        WebkitBackdropFilter: 'blur(8px)',
      }}>
        {/* Bolhas Douradas (pseudo-elementos seriam melhores em CSS puro, mas inline para o exemplo) */}
        <div style={{
          position: 'absolute', top: '10%', left: '15%', width: 80, height: 80, borderRadius: '50%',
          background: 'rgba(218,165,32,0.15)', filter: 'blur(15px)', zIndex: 0,
        }} />
        <div style={{
          position: 'absolute', bottom: '20%', right: '10%', width: 100, height: 100, borderRadius: '50%',
          background: 'rgba(218,165,32,0.1)', filter: 'blur(20px)', zIndex: 0,
        }} />
        <div style={{
          position: 'absolute', top: '50%', left: '50%', width: 60, height: 60, borderRadius: '50%',
          background: 'rgba(218,165,32,0.1)', filter: 'blur(10px)', zIndex: 0,
        }} />

        {/* Conteúdo do Header com z-index maior para ficar acima das bolhas */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          {/* Top row: Avatar + Stats + Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '0.75rem' }}>
          {/* Avatar */}
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <div style={{
              width: 86, height: 86, borderRadius: '50%',
              background: 'rgba(218,165,32,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '3px solid #daa520', overflow: 'hidden', cursor: isOwnProfile ? 'pointer' : 'default',
            }} onClick={() => isOwnProfile && fileInputRef.current?.click()}>
              {avatarSrc ? (
                <img src={avatarSrc} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <User size={40} color="#daa520" />
              )}
              {uploadingAvatar && (
                <div style={{
                  position: 'absolute', inset: 0, borderRadius: '50%',
                  background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <div className="loading-spinner" style={{ width: 20, height: 20 }} />
                </div>
              )}
            </div>
            {isOwnProfile && (
              <div style={{
                position: 'absolute', bottom: 0, right: 0,
                background: '#daa520', borderRadius: '50%', width: 26, height: 26,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', border: '2px solid #1a0a3e',
              }} onClick={() => fileInputRef.current?.click()}>
                <Camera size={13} color="#1a0a3e" />
              </div>
            )}
            <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }}
              onChange={handleAvatarUpload} />
          </div>

          {/* Stats inline */}
          <div style={{ display: 'flex', flex: 1, justifyContent: 'space-around', textAlign: 'center' }}>
            {[
              { value: stats.posts, label: 'Posts' },
              { value: stats.friends, label: 'Amigos' },
              { value: stats.prayers, label: 'Orações' },
            ].map((s, i) => (
              <div key={i}>
                <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff' }}>{s.value}</div>
                <div style={{ fontSize: '0.7rem', color: '#aaa', marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Name & bio */}
        <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>{profile.full_name}</h2>
        {profile.display_name && (
          <p style={{ margin: '0.15rem 0 0', opacity: 0.6, fontSize: '0.85rem', color: '#ccc' }}>@{profile.display_name}</p>
        )}
        {profile.bio && (
          <p style={{ margin: '0.4rem 0 0', fontSize: '0.85rem', color: '#ddd', lineHeight: 1.4 }}>{profile.bio}</p>
        )}

        {/* Role badge + church */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: '0.5rem', flexWrap: 'wrap' }}>
          <span style={{
            padding: '3px 10px', borderRadius: 12, fontSize: '0.7rem', fontWeight: 600,
            textTransform: 'uppercase', background: 'rgba(218,165,32,0.2)', color: '#daa520',
            border: '1px solid rgba(218,165,32,0.3)',
          }}>
            {profile.role}
          </span>
          {profile.church_name && (
            <span style={{ fontSize: '0.8rem', color: '#aaa' }}>
              <Church size={12} style={{ verticalAlign: 'middle', marginRight: 3 }} />
              {profile.church_name}
            </span>
          )}
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: 8, marginTop: '0.75rem' }}>
          {isOwnProfile ? (
            <>
              <button onClick={() => setEditing(true)} style={{
                flex: 1, padding: '0.45rem', borderRadius: 8, border: '1px solid rgba(218,165,32,0.5)',
                background: 'rgba(255,255,255,0.08)', color: '#daa520', fontWeight: 600, fontSize: '0.85rem',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              }}>
                <Edit size={14} /> Editar
              </button>
              <button onClick={handleTogglePrivacy} style={{
                padding: '0.45rem 0.75rem', borderRadius: 8, border: '1px solid rgba(218,165,32,0.3)',
                background: 'rgba(255,255,255,0.05)', color: '#aaa', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.8rem',
              }}>
                {profile.is_private ? <Lock size={14} /> : <Globe size={14} />}
                {profile.is_private ? 'Privado' : 'Público'}
              </button>
            </>
          ) : currentUser ? (
            <button onClick={handleAddFriend} style={{
              flex: 1, padding: '0.5rem', borderRadius: 8, border: 'none',
              background: '#daa520', color: '#1a0a3e', fontWeight: 700, fontSize: '0.9rem',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            }}>
              <Users size={16} /> Adicionar Amigo
            </button>
          ) : null}
        </div>
      </div>

      {/* Private profile lock */}
      {isPrivateAndNotOwner ? (
        <div style={{
          background: 'rgba(18, 8, 51, 0.7)', // Fundo semitransparente mais leve
          padding: '3rem 2rem', textAlign: 'center', color: '#999',
          borderRadius: '16px', // Adiciona borda arredondada
          boxShadow: '0 8px 30px rgba(0,0,0,0.3)',
          backdropFilter: 'blur(8px)', // Efeito de vidro
          WebkitBackdropFilter: 'blur(8px)',
        }}>
          <Lock size={48} color="#daa520" style={{ marginBottom: '1rem', opacity: 0.6 }} />
          <h3 style={{ color: '#fff', margin: '0 0 0.5rem' }}>Conta Privada</h3>
          <p style={{ margin: 0, fontSize: '0.9rem' }}>Adicione como amigo para ver o perfil completo.</p>
        </div>
      ) : (
        <>
          {/* Tabs */}
          <div style={{
            display: 'flex', background: 'rgba(18, 8, 51, 0.7)',
            borderBottom: '1px solid rgba(218,165,32,0.2)',
            backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
            borderTopLeftRadius: '16px', borderTopRightRadius: '16px',
          }}>
            {[
              { key: 'posts', icon: <Grid3x3 size={20} />, label: 'Posts' },
              { key: 'prayers', icon: <Heart size={20} />, label: 'Orações' },
              { key: 'info', icon: <Info size={20} />, label: 'Info' },
            ].map(tab => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
                flex: 1, padding: '0.75rem 0', border: 'none',
                background: 'transparent', cursor: 'pointer',
                color: activeTab === tab.key ? '#daa520' : '#666',
                borderBottom: activeTab === tab.key ? '2px solid #daa520' : '2px solid transparent',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                fontSize: '0.7rem', fontWeight: activeTab === tab.key ? 600 : 400,
                transition: 'all 0.2s',
              }}>
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div style={{
            background: 'rgba(26, 10, 62, 0.6)', minHeight: 300,
            backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
            borderBottomLeftRadius: '16px', borderBottomRightRadius: '16px',
            marginBottom: '1.5rem',
            boxShadow: '0 8px 30px rgba(0,0,0,0.3)',
          }}>
            {/* POSTS tab */}
            {activeTab === 'posts' && (
              <div>
                {/* New post button for own profile */}
                {isOwnProfile && (
                  <button onClick={() => setShowNewPost(true)} style={{
                    width: '100%', padding: '0.75rem', border: 'none',
                    background: 'rgba(218,165,32,0.1)', color: '#daa520',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    fontSize: '0.9rem', fontWeight: 600,
                    borderBottom: '1px solid rgba(218,165,32,0.15)',
                  }}>
                    <Plus size={18} /> Nova Publicação
                  </button>
                )}

                {loadingContent ? (
                  <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
                    <div className="loading-spinner" />
                  </div>
                ) : posts.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>
                    <Image size={48} style={{ marginBottom: '0.75rem', opacity: 0.4 }} />
                    <p style={{ margin: 0, fontSize: '0.9rem' }}>Nenhuma publicação ainda</p>
                  </div>
                ) : (
                  /* 3-column grid */
                  <div style={{
                    display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2, padding: 2,
                  }}>
                    {posts.map(post => (
                      <div key={post.id} onClick={() => setSelectedPost(post)} style={{
                        aspectRatio: '1', cursor: 'pointer', position: 'relative',
                        background: '#2d1b69', overflow: 'hidden',
                      }}>
                        {post.media_url ? (
                          <img src={getMediaUrl(post.media_url)} alt="" style={{
                            width: '100%', height: '100%', objectFit: 'cover',
                          }} />
                        ) : (
                          <div style={{
                            width: '100%', height: '100%', display: 'flex',
                            alignItems: 'center', justifyContent: 'center', padding: 8,
                            fontSize: '0.75rem', color: '#ccc', textAlign: 'center',
                            background: `linear-gradient(135deg, #2d1b69, #1a0a3e)`,
                          }}>
                            {post.content.substring(0, 80)}{post.content.length > 80 ? '...' : ''}
                          </div>
                        )}
                        {/* Category badge */}
                        <div style={{
                          position: 'absolute', top: 4, left: 4,
                          fontSize: '0.65rem', padding: '2px 6px', borderRadius: 4,
                          background: 'rgba(0,0,0,0.6)', color: '#daa520',
                        }}>
                          {CATEGORIES.find(c => c.value === post.category)?.label?.split(' ')[0] || '📝'}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* PRAYERS tab */}
            {activeTab === 'prayers' && (
              <div style={{ padding: '1rem' }}>
                {loadingContent ? (
                  <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
                    <div className="loading-spinner" />
                  </div>
                ) : prayers.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>
                    <Heart size={48} style={{ marginBottom: '0.75rem', opacity: 0.4 }} />
                    <p style={{ margin: 0, fontSize: '0.9rem' }}>Nenhuma oração ainda</p>
                  </div>
                ) : (
                  prayers.map(prayer => (
                    <div key={prayer.id} style={{
                      background: 'rgba(255,255,255,0.05)', borderRadius: 12, padding: '1rem',
                      marginBottom: '0.75rem', border: '1px solid rgba(218,165,32,0.15)',
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                        <span style={{ fontSize: '0.75rem', color: '#daa520', fontWeight: 600, textTransform: 'uppercase' }}>
                          {prayer.category}
                        </span>
                        {prayer.is_urgent && (
                          <span style={{ fontSize: '0.7rem', color: '#e74c3c', fontWeight: 600 }}>🔴 Urgente</span>
                        )}
                      </div>
                      {prayer.title && <h4 style={{ margin: '0 0 0.4rem', color: '#fff', fontSize: '0.95rem' }}>{prayer.title}</h4>}
                      <p style={{ margin: 0, color: '#ccc', fontSize: '0.85rem', lineHeight: 1.5 }}>{prayer.content}</p>
                      <div style={{ marginTop: 8, fontSize: '0.75rem', color: '#888' }}>
                        🙏 {prayer.prayer_count || 0} orando · {new Date(prayer.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* INFO tab */}
            {activeTab === 'info' && (
              <div style={{ padding: '1.25rem' }}>
                <div style={{
                  background: 'rgba(255,255,255,0.05)', borderRadius: 12, padding: '1rem',
                  border: '1px solid rgba(218,165,32,0.15)',
                }}>
                  <h3 style={{ margin: '0 0 0.75rem', fontSize: '0.85rem', color: '#daa520', textTransform: 'uppercase' }}>
                    {t('profile.bio')}
                  </h3>
                  <p style={{ margin: '0 0 1rem', color: profile.bio ? '#ddd' : '#666', fontStyle: profile.bio ? 'normal' : 'italic', lineHeight: 1.5 }}>
                    {profile.bio || t('profile.noBio')}
                  </p>

                  {profile.church_name && (
                    <div style={{ marginBottom: '0.75rem' }}>
                      <span style={{ fontSize: '0.75rem', color: '#daa520', fontWeight: 600 }}>IGREJA</span>
                      <p style={{ margin: '0.25rem 0 0', color: '#ccc', fontSize: '0.9rem' }}>
                        <Church size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                        {profile.church_name} {profile.church_role && `· ${profile.church_role}`}
                      </p>
                    </div>
                  )}

                  <div>
                    <span style={{ fontSize: '0.75rem', color: '#daa520', fontWeight: 600 }}>MEMBRO DESDE</span>
                    <p style={{ margin: '0.25rem 0 0', color: '#ccc', fontSize: '0.9rem' }}>
                      <Calendar size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                      {memberSince}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* ===== MODALS ===== */}

      {/* Edit Profile Modal */}
      {editing && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
        }} onClick={(e) => { if (e.target === e.currentTarget) setEditing(false); }}>
          <div style={{
            background: '#1a0a3e', borderRadius: 16, padding: '1.5rem', width: '100%', maxWidth: 420,
            border: '2px solid #daa520', maxHeight: '80vh', overflowY: 'auto',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ margin: 0, color: '#daa520', fontSize: '1.1rem' }}>✏️ Editar Perfil</h3>
              <button onClick={() => setEditing(false)} style={{ background: 'none', border: 'none', color: '#999', cursor: 'pointer' }}>
                <X size={22} />
              </button>
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: 4, fontWeight: 600, color: '#daa520', fontSize: '0.8rem', textTransform: 'uppercase' }}>Display Name</label>
              <input value={form.display_name} onChange={e => setForm({ ...form, display_name: e.target.value })}
                style={{ width: '100%', padding: '0.6rem', borderRadius: 8, border: '1px solid rgba(218,165,32,0.3)', background: 'rgba(0,0,0,0.3)', color: '#fff', boxSizing: 'border-box' }} />
            </div>
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', marginBottom: 4, fontWeight: 600, color: '#daa520', fontSize: '0.8rem', textTransform: 'uppercase' }}>{t('profile.bio')}</label>
              <textarea value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} rows={4}
                style={{ width: '100%', padding: '0.6rem', borderRadius: 8, border: '1px solid rgba(218,165,32,0.3)', background: 'rgba(0,0,0,0.3)', color: '#fff', boxSizing: 'border-box', resize: 'vertical' }} />
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button onClick={handleSave} disabled={saving} style={{
                flex: 1, padding: '0.7rem', borderRadius: 8, border: 'none',
                background: '#daa520', color: '#1a0a3e', fontWeight: 700, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: '0.95rem',
              }}>
                <Save size={16} /> {t('profile.save')}
              </button>
              <button onClick={() => setEditing(false)} style={{
                flex: 1, padding: '0.7rem', borderRadius: 8, border: '1px solid rgba(218,165,32,0.3)',
                background: 'transparent', color: '#ccc', fontWeight: 600, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: '0.95rem',
              }}>
                <X size={16} /> {t('profile.cancel')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Post Modal */}
      {showNewPost && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
        }} onClick={(e) => { if (e.target === e.currentTarget) setShowNewPost(false); }}>
          <div style={{
            background: '#1a0a3e', borderRadius: 16, padding: '1.5rem', width: '100%', maxWidth: 420,
            border: '2px solid #daa520', maxHeight: '85vh', overflowY: 'auto',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0, color: '#daa520', fontSize: '1.1rem' }}>📸 Nova Publicação</h3>
              <button onClick={() => setShowNewPost(false)} style={{ background: 'none', border: 'none', color: '#999', cursor: 'pointer' }}>
                <X size={22} />
              </button>
            </div>

            {/* Image upload area */}
            <div onClick={() => postImageRef.current?.click()} style={{
              width: '100%', aspectRatio: '1', borderRadius: 12, marginBottom: '1rem',
              border: '2px dashed rgba(218,165,32,0.4)', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column',
              background: newPostPreview ? 'transparent' : 'rgba(0,0,0,0.2)',
              overflow: 'hidden', position: 'relative',
            }}>
              {newPostPreview ? (
                <img src={newPostPreview} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <>
                  <Camera size={40} color="#daa520" style={{ opacity: 0.5, marginBottom: 8 }} />
                  <span style={{ color: '#888', fontSize: '0.85rem' }}>Toque para adicionar foto</span>
                </>
              )}
            </div>
            <input ref={postImageRef} type="file" accept="image/*" style={{ display: 'none' }}
              onChange={handlePostImageSelect} />

            {/* Category selector */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: '1rem' }}>
              {CATEGORIES.map(cat => (
                <button key={cat.value} onClick={() => setNewPost({ ...newPost, category: cat.value })} style={{
                  padding: '6px 12px', borderRadius: 20, border: 'none', cursor: 'pointer',
                  fontSize: '0.8rem', fontWeight: 500,
                  background: newPost.category === cat.value ? 'rgba(218,165,32,0.3)' : 'rgba(255,255,255,0.08)',
                  color: newPost.category === cat.value ? '#daa520' : '#aaa',
                  transition: 'all 0.2s',
                }}>
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Content */}
            <textarea value={newPost.content} onChange={e => setNewPost({ ...newPost, content: e.target.value })}
              placeholder="Compartilhe algo com a comunidade..."
              rows={3} style={{
                width: '100%', padding: '0.7rem', borderRadius: 8, border: '1px solid rgba(218,165,32,0.3)',
                background: 'rgba(0,0,0,0.3)', color: '#fff', boxSizing: 'border-box', resize: 'vertical',
                marginBottom: '0.75rem', fontSize: '0.9rem',
              }} />

            {/* Verse reference (optional) */}
            {(newPost.category === 'versiculo' || newPost.category === 'reflexao') && (
              <input value={newPost.verse_reference} onChange={e => setNewPost({ ...newPost, verse_reference: e.target.value })}
                placeholder="Referência bíblica (ex: João 3:16)"
                style={{
                  width: '100%', padding: '0.6rem', borderRadius: 8, border: '1px solid rgba(218,165,32,0.3)',
                  background: 'rgba(0,0,0,0.3)', color: '#fff', boxSizing: 'border-box', marginBottom: '1rem',
                  fontSize: '0.85rem',
                }} />
            )}

            <button onClick={handleCreatePost} disabled={creatingPost || !newPost.content.trim()} style={{
              width: '100%', padding: '0.75rem', borderRadius: 10, border: 'none',
              background: newPost.content.trim() ? '#daa520' : 'rgba(218,165,32,0.3)',
              color: '#1a0a3e', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}>
              {creatingPost ? 'Publicando...' : '✨ Publicar'}
            </button>
          </div>
        </div>
      )}

      {/* Post Detail Modal */}
      {selectedPost && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
        }} onClick={(e) => { if (e.target === e.currentTarget) setSelectedPost(null); }}>
          <div style={{
            background: '#1a0a3e', borderRadius: 16, width: '100%', maxWidth: 480,
            maxHeight: '90vh', overflowY: 'auto', border: '1px solid rgba(218,165,32,0.3)',
          }}>
            {/* Post image */}
            {selectedPost.media_url && (
              <img src={getMediaUrl(selectedPost.media_url)} alt="" style={{
                width: '100%', maxHeight: 400, objectFit: 'cover', borderRadius: '16px 16px 0 0',
              }} />
            )}
            <div style={{ padding: '1.25rem' }}>
              {/* Category & date */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{
                  fontSize: '0.8rem', padding: '3px 10px', borderRadius: 12,
                  background: 'rgba(218,165,32,0.2)', color: '#daa520',
                }}>
                  {CATEGORIES.find(c => c.value === selectedPost.category)?.label || selectedPost.category}
                </span>
                <span style={{ fontSize: '0.75rem', color: '#888' }}>
                  {new Date(selectedPost.created_at).toLocaleDateString()}
                </span>
              </div>

              {/* Content */}
              <p style={{ margin: '0.5rem 0', color: '#e0e0e0', fontSize: '0.95rem', lineHeight: 1.6 }}>
                {selectedPost.content}
              </p>

              {selectedPost.verse_reference && (
                <p style={{ margin: '0.5rem 0 0', color: '#daa520', fontSize: '0.85rem', fontStyle: 'italic' }}>
                  📖 {selectedPost.verse_reference}
                </p>
              )}

              {/* Delete button for own posts */}
              {isOwnProfile && (
                <button onClick={() => handleDeletePost(selectedPost.id)} style={{
                  marginTop: '1rem', width: '100%', padding: '0.6rem', borderRadius: 8,
                  border: '1px solid rgba(231,76,60,0.4)', background: 'rgba(231,76,60,0.1)',
                  color: '#e74c3c', cursor: 'pointer', fontSize: '0.85rem',
                }}>
                  🗑️ Deletar publicação
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
