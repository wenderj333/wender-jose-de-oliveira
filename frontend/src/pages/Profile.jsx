import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { User, Calendar, Edit, Heart, Users, Church, Save, X, Camera, Lock, Globe, Plus, Image, Grid3X3, BookOpen, Info } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || '';
const API = `${API_BASE}/api`;

const CATEGORIES = [
  { value: 'testemunho', label: '🙏 Testemunho' },
  { value: 'louvor', label: '🎵 Louvor' },
  { value: 'foto', label: '📸 Foto' },
  { value: 'versiculo', label: '📖 Versículo' },
  { value: 'reflexao', label: '💭 Reflexão' },
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

  // Tabs
  const [activeTab, setActiveTab] = useState('posts');
  const [userPosts, setUserPosts] = useState([]);
  const [userPrayers, setUserPrayers] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [loadingPrayers, setLoadingPrayers] = useState(false);

  // Post modal (view)
  const [selectedPost, setSelectedPost] = useState(null);

  // New post modal
  const [showNewPost, setShowNewPost] = useState(false);
  const [newPost, setNewPost] = useState({ content: '', category: 'testemunho', image: null });
  const [newPostPreview, setNewPostPreview] = useState(null);
  const [creatingPost, setCreatingPost] = useState(false);
  const newPostFileRef = useRef(null);

  const isOwnProfile = currentUser?.id === userId;

  useEffect(() => {
    fetchProfile();
    fetchStats();
  }, [userId]);

  useEffect(() => {
    if (activeTab === 'posts') fetchUserPosts();
    if (activeTab === 'prayers') fetchUserPrayers();
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

  async function fetchUserPosts() {
    setLoadingPosts(true);
    try {
      const res = await fetch(`${API}/feed/user/${userId}`);
      const data = await res.json();
      setUserPosts(data.posts || []);
    } catch (err) {
      console.error('Error fetching user posts:', err);
    } finally {
      setLoadingPosts(false);
    }
  }

  async function fetchUserPrayers() {
    setLoadingPrayers(true);
    try {
      const res = await fetch(`${API}/prayers?author_id=${userId}`);
      const data = await res.json();
      setUserPrayers(data.prayers || []);
    } catch (err) {
      console.error('Error fetching user prayers:', err);
    } finally {
      setLoadingPrayers(false);
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

  async function handleAddFriend() {
    try {
      await fetch(`${API}/friends/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ friendId: userId }),
      });
    } catch (err) {
      console.error('Error sending friend request:', err);
    }
  }

  function handleNewPostImage(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setNewPost(prev => ({ ...prev, image: file }));
    const reader = new FileReader();
    reader.onload = (ev) => setNewPostPreview(ev.target.result);
    reader.readAsDataURL(file);
  }

  async function handleCreatePost() {
    if (!newPost.content.trim()) return;
    setCreatingPost(true);
    try {
      const formData = new FormData();
      formData.append('content', newPost.content);
      formData.append('category', newPost.category);
      if (newPost.image) formData.append('image', newPost.image);
      const res = await fetch(`${API}/feed`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (data.post) {
        setUserPosts(prev => [data.post, ...prev]);
        setStats(prev => ({ ...prev, posts: prev.posts + 1 }));
        setShowNewPost(false);
        setNewPost({ content: '', category: 'testemunho', image: null });
        setNewPostPreview(null);
      }
    } catch (err) {
      console.error('Error creating post:', err);
    } finally {
      setCreatingPost(false);
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

  const tabStyle = (tab) => ({
    flex: 1, padding: '0.75rem 0', textAlign: 'center', cursor: 'pointer',
    background: 'none', border: 'none',
    borderBottom: activeTab === tab ? '2px solid #daa520' : '2px solid transparent',
    color: activeTab === tab ? '#daa520' : '#888',
    fontWeight: activeTab === tab ? 700 : 500,
    fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px',
    transition: 'all 0.2s',
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
  });

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: '0' }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #1a0a3e 0%, #2d1b69 50%, #1a0a3e 100%)',
        padding: '2rem 1.5rem 1.5rem', color: '#fff', textAlign: 'center', position: 'relative',
      }}>
        {isOwnProfile && (
          <button onClick={handleTogglePrivacy} style={{
            position: 'absolute', top: 16, right: 16,
            background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(218,165,32,0.5)',
            borderRadius: 20, padding: '6px 14px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 6, color: '#daa520', fontSize: '0.8rem',
          }}>
            {profile.is_private ? <Lock size={14} /> : <Globe size={14} />}
            {profile.is_private ? 'Privado' : 'Público'}
          </button>
        )}

        {/* Avatar */}
        <div style={{ position: 'relative', display: 'inline-block', marginBottom: '1rem' }}>
          <div style={{
            width: 110, height: 110, borderRadius: '50%',
            background: 'rgba(218,165,32,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '3px solid #daa520', overflow: 'hidden', cursor: isOwnProfile ? 'pointer' : 'default',
          }} onClick={() => isOwnProfile && fileInputRef.current?.click()}>
            {avatarSrc ? (
              <img src={avatarSrc} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <User size={50} color="#daa520" />
            )}
            {uploadingAvatar && (
              <div style={{
                position: 'absolute', inset: 0, borderRadius: '50%',
                background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <div className="loading-spinner" style={{ width: 24, height: 24 }} />
              </div>
            )}
          </div>
          {isOwnProfile && (
            <div style={{
              position: 'absolute', bottom: 2, right: 2,
              background: '#daa520', borderRadius: '50%', width: 32, height: 32,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', border: '2px solid #1a0a3e',
            }} onClick={() => fileInputRef.current?.click()}>
              <Camera size={16} color="#1a0a3e" />
            </div>
          )}
          <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }}
            onChange={handleAvatarUpload} />
        </div>

        <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700 }}>{profile.full_name}</h2>
        {profile.display_name && (
          <p style={{ margin: '0.25rem 0 0', opacity: 0.7, fontSize: '0.95rem', color: '#ccc' }}>@{profile.display_name}</p>
        )}

        <span style={{
          display: 'inline-block', marginTop: '0.75rem', padding: '4px 14px',
          borderRadius: 20, fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase',
          background: 'rgba(218,165,32,0.2)', color: '#daa520', border: '1px solid rgba(218,165,32,0.4)',
          letterSpacing: '0.5px',
        }}>
          {profile.role}
        </span>

        {profile.church_name && (
          <p style={{ margin: '0.75rem 0 0', fontSize: '0.85rem', opacity: 0.8, color: '#ccc' }}>
            <Church size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} />
            {profile.church_name} {profile.church_role && `· ${profile.church_role}`}
          </p>
        )}

        <p style={{ margin: '0.5rem 0 0', fontSize: '0.8rem', opacity: 0.6, color: '#aaa' }}>
          <Calendar size={13} style={{ verticalAlign: 'middle', marginRight: 4 }} />
          {t('profile.memberSince')} {memberSince}
        </p>

        {/* Action buttons in header */}
        <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
          {isOwnProfile && !editing && (
            <button onClick={() => setEditing(true)} style={{
              padding: '0.5rem 1.25rem', borderRadius: 8, border: '1px solid #daa520',
              background: 'transparent', color: '#daa520', fontWeight: 600, fontSize: '0.85rem',
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
            }}>
              <Edit size={14} /> Editar Perfil
            </button>
          )}
          {!isOwnProfile && currentUser && (
            <button onClick={handleAddFriend} style={{
              padding: '0.5rem 1.25rem', borderRadius: 8, border: 'none',
              background: '#daa520', color: '#1a0a3e', fontWeight: 700, fontSize: '0.85rem',
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
            }}>
              <Users size={14} /> Adicionar Amigo
            </button>
          )}
        </div>
      </div>

      {/* Stats bar */}
      <div style={{
        display: 'flex', background: '#120833', borderBottom: '1px solid rgba(218,165,32,0.2)',
      }}>
        {[
          { value: stats.posts, label: 'publicações' },
          { value: stats.friends, label: 'amigos' },
          { value: stats.prayers, label: 'orações' },
        ].map((s, i) => (
          <div key={i} style={{
            flex: 1, textAlign: 'center', padding: '1rem 0',
            borderRight: i < 2 ? '1px solid rgba(218,165,32,0.15)' : 'none',
          }}>
            <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#fff' }}>{s.value}</div>
            <div style={{ fontSize: '0.75rem', color: '#daa520', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Private profile lock */}
      {isPrivateAndNotOwner && (
        <div style={{
          background: '#1a0a3e', padding: '3rem 2rem', textAlign: 'center', color: '#999',
        }}>
          <Lock size={48} color="#daa520" style={{ marginBottom: '1rem', opacity: 0.6 }} />
          <h3 style={{ color: '#fff', margin: '0 0 0.5rem' }}>Conta Privada</h3>
          <p style={{ margin: 0, fontSize: '0.9rem' }}>Adicione como amigo para ver o perfil completo.</p>
        </div>
      )}

      {/* Tabs + Content — only if not private or own profile */}
      {!isPrivateAndNotOwner && (
        <>
          {/* Tab bar */}
          <div style={{ display: 'flex', background: '#120833', borderBottom: '1px solid rgba(218,165,32,0.2)' }}>
            <button style={tabStyle('posts')} onClick={() => setActiveTab('posts')}>
              <Grid3X3 size={16} /> Publicações
            </button>
            <button style={tabStyle('prayers')} onClick={() => setActiveTab('prayers')}>
              <BookOpen size={16} /> Orações
            </button>
            <button style={tabStyle('info')} onClick={() => setActiveTab('info')}>
              <Info size={16} /> Info
            </button>
          </div>

          <div style={{ background: '#1a0a3e', minHeight: 300 }}>
            {/* ===== PUBLICAÇÕES TAB ===== */}
            {activeTab === 'posts' && (
              <div>
                {/* New post button */}
                {isOwnProfile && (
                  <div style={{ padding: '1rem 1rem 0' }}>
                    <button onClick={() => setShowNewPost(true)} style={{
                      width: '100%', padding: '0.75rem', borderRadius: 10,
                      border: '2px dashed rgba(218,165,32,0.4)', background: 'rgba(218,165,32,0.05)',
                      color: '#daa520', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    }}>
                      <Plus size={18} /> Nova Publicação
                    </button>
                  </div>
                )}

                {loadingPosts ? (
                  <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
                    <div className="loading-spinner" />
                  </div>
                ) : userPosts.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#666' }}>
                    <Image size={48} style={{ marginBottom: '1rem', opacity: 0.3 }} />
                    <p style={{ margin: 0 }}>Nenhuma publicação ainda</p>
                  </div>
                ) : (
                  /* 3-column photo grid */
                  <div style={{
                    display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2, padding: 2, marginTop: 2,
                  }}>
                    {userPosts.map(post => (
                      <div key={post.id} onClick={() => setSelectedPost(post)} style={{
                        aspectRatio: '1', cursor: 'pointer', overflow: 'hidden',
                        background: 'rgba(218,165,32,0.1)', position: 'relative',
                      }}>
                        {post.media_url ? (
                          <img
                            src={post.media_url.startsWith('http') ? post.media_url : `${API_BASE}${post.media_url}`}
                            alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        ) : (
                          <div style={{
                            width: '100%', height: '100%', display: 'flex', alignItems: 'center',
                            justifyContent: 'center', padding: '0.5rem',
                            background: getCategoryGradient(post.category),
                          }}>
                            <p style={{
                              color: '#fff', fontSize: '0.7rem', textAlign: 'center',
                              margin: 0, lineHeight: 1.3, overflow: 'hidden',
                              display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical',
                            }}>
                              {post.content}
                            </p>
                          </div>
                        )}
                        {/* Category badge */}
                        <span style={{
                          position: 'absolute', top: 4, right: 4, fontSize: '0.6rem',
                          background: 'rgba(0,0,0,0.6)', color: '#daa520', padding: '2px 6px',
                          borderRadius: 8, fontWeight: 600,
                        }}>
                          {getCategoryEmoji(post.category)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ===== ORAÇÕES TAB ===== */}
            {activeTab === 'prayers' && (
              <div style={{ padding: '1rem' }}>
                {loadingPrayers ? (
                  <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
                    <div className="loading-spinner" />
                  </div>
                ) : userPrayers.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#666' }}>
                    <Heart size={48} style={{ marginBottom: '1rem', opacity: 0.3 }} />
                    <p style={{ margin: 0 }}>Nenhum pedido de oração</p>
                  </div>
                ) : (
                  userPrayers.map(prayer => (
                    <div key={prayer.id} style={{
                      background: 'rgba(255,255,255,0.05)', borderRadius: 12, padding: '1rem',
                      marginBottom: '0.75rem', border: '1px solid rgba(218,165,32,0.15)',
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <h4 style={{ margin: 0, color: '#daa520', fontSize: '0.95rem' }}>
                          {prayer.title || 'Pedido de Oração'}
                        </h4>
                        {prayer.is_answered && (
                          <span style={{
                            background: 'rgba(76,175,80,0.2)', color: '#4caf50', padding: '2px 10px',
                            borderRadius: 12, fontSize: '0.7rem', fontWeight: 600,
                          }}>✅ Respondida</span>
                        )}
                      </div>
                      <p style={{ margin: 0, color: '#ccc', fontSize: '0.85rem', lineHeight: 1.5 }}>
                        {prayer.content}
                      </p>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem' }}>
                        <span style={{ fontSize: '0.75rem', color: '#888' }}>
                          {new Date(prayer.created_at).toLocaleDateString()}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: '#daa520' }}>
                          🙏 {prayer.prayer_count || 0} orando
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* ===== INFO TAB ===== */}
            {activeTab === 'info' && (
              <div style={{ padding: '1.5rem' }}>
                {/* Bio */}
                <div style={{
                  background: 'rgba(255,255,255,0.05)', borderRadius: 12, padding: '1.25rem',
                  marginBottom: '1rem', border: '1px solid rgba(218,165,32,0.15)',
                }}>
                  <h3 style={{ margin: '0 0 0.5rem', fontSize: '0.9rem', color: '#daa520', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    {t('profile.bio')}
                  </h3>
                  <p style={{ margin: 0, color: profile.bio ? '#e0e0e0' : '#666', fontStyle: profile.bio ? 'normal' : 'italic', lineHeight: 1.5 }}>
                    {profile.bio || t('profile.noBio')}
                  </p>
                </div>

                {/* Church info */}
                {profile.church_name && (
                  <div style={{
                    background: 'rgba(255,255,255,0.05)', borderRadius: 12, padding: '1.25rem',
                    marginBottom: '1rem', border: '1px solid rgba(218,165,32,0.15)',
                  }}>
                    <h3 style={{ margin: '0 0 0.5rem', fontSize: '0.9rem', color: '#daa520', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Igreja
                    </h3>
                    <p style={{ margin: 0, color: '#e0e0e0' }}>
                      <Church size={14} style={{ verticalAlign: 'middle', marginRight: 6 }} />
                      {profile.church_name}
                    </p>
                    {profile.church_role && (
                      <p style={{ margin: '0.25rem 0 0', color: '#aaa', fontSize: '0.85rem' }}>
                        Cargo: {profile.church_role}
                      </p>
                    )}
                  </div>
                )}

                {/* Member since */}
                <div style={{
                  background: 'rgba(255,255,255,0.05)', borderRadius: 12, padding: '1.25rem',
                  border: '1px solid rgba(218,165,32,0.15)',
                }}>
                  <h3 style={{ margin: '0 0 0.5rem', fontSize: '0.9rem', color: '#daa520', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Membro desde
                  </h3>
                  <p style={{ margin: 0, color: '#e0e0e0' }}>
                    <Calendar size={14} style={{ verticalAlign: 'middle', marginRight: 6 }} />
                    {new Date(profile.created_at).toLocaleDateString('pt-BR', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* ===== VIEW POST MODAL ===== */}
      {selectedPost && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
        }} onClick={(e) => { if (e.target === e.currentTarget) setSelectedPost(null); }}>
          <div style={{
            background: '#1a0a3e', borderRadius: 16, width: '100%', maxWidth: 500,
            border: '2px solid #daa520', maxHeight: '85vh', overflowY: 'auto',
          }}>
            {selectedPost.media_url && (
              <img
                src={selectedPost.media_url.startsWith('http') ? selectedPost.media_url : `${API_BASE}${selectedPost.media_url}`}
                alt="" style={{ width: '100%', borderRadius: '14px 14px 0 0', maxHeight: 400, objectFit: 'cover' }}
              />
            )}
            <div style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span style={{
                  background: 'rgba(218,165,32,0.2)', color: '#daa520', padding: '4px 12px',
                  borderRadius: 12, fontSize: '0.75rem', fontWeight: 600,
                }}>
                  {getCategoryEmoji(selectedPost.category)} {selectedPost.category}
                </span>
                <button onClick={() => setSelectedPost(null)} style={{
                  background: 'none', border: 'none', color: '#999', cursor: 'pointer',
                }}>
                  <X size={20} />
                </button>
              </div>
              <p style={{ margin: 0, color: '#e0e0e0', lineHeight: 1.6, fontSize: '0.95rem' }}>
                {selectedPost.content}
              </p>
              {selectedPost.verse_reference && (
                <p style={{ margin: '0.75rem 0 0', color: '#daa520', fontSize: '0.85rem', fontStyle: 'italic' }}>
                  📖 {selectedPost.verse_reference}
                </p>
              )}
              <p style={{ margin: '0.75rem 0 0', color: '#666', fontSize: '0.75rem' }}>
                {new Date(selectedPost.created_at).toLocaleDateString('pt-BR', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ===== NEW POST MODAL ===== */}
      {showNewPost && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
        }} onClick={(e) => { if (e.target === e.currentTarget) setShowNewPost(false); }}>
          <div style={{
            background: '#1a0a3e', borderRadius: 16, padding: '1.5rem', width: '100%', maxWidth: 450,
            border: '2px solid #daa520', maxHeight: '85vh', overflowY: 'auto',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ margin: 0, color: '#daa520', fontSize: '1.1rem' }}>✨ Nova Publicação</h3>
              <button onClick={() => setShowNewPost(false)} style={{
                background: 'none', border: 'none', color: '#999', cursor: 'pointer', padding: 4,
              }}>
                <X size={22} />
              </button>
            </div>

            {/* Image upload */}
            <div style={{ marginBottom: '1rem' }}>
              {newPostPreview ? (
                <div style={{ position: 'relative' }}>
                  <img src={newPostPreview} alt="" style={{
                    width: '100%', borderRadius: 10, maxHeight: 250, objectFit: 'cover',
                  }} />
                  <button onClick={() => { setNewPostPreview(null); setNewPost(p => ({ ...p, image: null })); }} style={{
                    position: 'absolute', top: 8, right: 8,
                    background: 'rgba(0,0,0,0.7)', border: 'none', borderRadius: '50%',
                    width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', color: '#fff',
                  }}>
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <div onClick={() => newPostFileRef.current?.click()} style={{
                  border: '2px dashed rgba(218,165,32,0.3)', borderRadius: 10,
                  padding: '2rem', textAlign: 'center', cursor: 'pointer',
                  color: '#888', fontSize: '0.85rem',
                }}>
                  <Camera size={32} color="#daa520" style={{ marginBottom: '0.5rem', opacity: 0.5 }} />
                  <p style={{ margin: 0 }}>Toque para adicionar uma foto</p>
                </div>
              )}
              <input ref={newPostFileRef} type="file" accept="image/*" style={{ display: 'none' }}
                onChange={handleNewPostImage} />
            </div>

            {/* Content */}
            <div style={{ marginBottom: '1rem' }}>
              <textarea
                value={newPost.content}
                onChange={e => setNewPost(p => ({ ...p, content: e.target.value }))}
                placeholder="Compartilhe sua fé..."
                rows={4}
                style={{
                  width: '100%', padding: '0.75rem', borderRadius: 10,
                  border: '1px solid rgba(218,165,32,0.3)', background: 'rgba(0,0,0,0.3)',
                  color: '#fff', boxSizing: 'border-box', resize: 'vertical', fontSize: '0.9rem',
                }}
              />
            </div>

            {/* Category selector */}
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, color: '#daa520', fontSize: '0.8rem', textTransform: 'uppercase' }}>
                Categoria
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {CATEGORIES.map(cat => (
                  <button key={cat.value} onClick={() => setNewPost(p => ({ ...p, category: cat.value }))}
                    style={{
                      padding: '6px 12px', borderRadius: 20, border: '1px solid',
                      borderColor: newPost.category === cat.value ? '#daa520' : 'rgba(218,165,32,0.2)',
                      background: newPost.category === cat.value ? 'rgba(218,165,32,0.2)' : 'transparent',
                      color: newPost.category === cat.value ? '#daa520' : '#aaa',
                      fontSize: '0.8rem', cursor: 'pointer', fontWeight: newPost.category === cat.value ? 600 : 400,
                    }}>
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Submit */}
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

      {/* ===== EDIT PROFILE MODAL ===== */}
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
              <button onClick={() => setEditing(false)} style={{
                background: 'none', border: 'none', color: '#999', cursor: 'pointer', padding: 4,
              }}>
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
    </div>
  );
}

function getCategoryEmoji(cat) {
  const map = { testemunho: '🙏', louvor: '🎵', foto: '📸', versiculo: '📖', reflexao: '💭' };
  return map[cat] || '📝';
}

function getCategoryGradient(cat) {
  const map = {
    testemunho: 'linear-gradient(135deg, #2d1b69, #1a0a3e)',
    louvor: 'linear-gradient(135deg, #1a3a5c, #0d1f33)',
    foto: 'linear-gradient(135deg, #3e1a0a, #1a0a3e)',
    versiculo: 'linear-gradient(135deg, #0a3e1a, #1a0a3e)',
    reflexao: 'linear-gradient(135deg, #3e0a3e, #1a0a3e)',
  };
  return map[cat] || 'linear-gradient(135deg, #2d1b69, #1a0a3e)';
}
