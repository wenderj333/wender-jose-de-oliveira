import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { Camera, Edit2, Grid, List, Heart, MessageCircle, UserPlus, UserCheck, Send, X, Settings, MapPin, Church, Link as LinkIcon } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || '';
const API = `${API_BASE}/api`;
const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'degxiuf43';
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'sigo_com_fe';

async function uploadPhoto(file) {
  const form = new FormData();
  form.append('file', file);
  form.append('upload_preset', UPLOAD_PRESET);
  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, { method: 'POST', body: form });
  const data = await res.json();
  return data.secure_url;
}

export default function Profile() {
  const { userId } = useParams();
  const { user: currentUser, token } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const avatarRef = useRef(null);
  const [showAvatarBig, setShowAvatarBig] = React.useState(false);
  const coverRef = useRef(null);

  const targetId = userId || currentUser?.id;
  const isOwn = !userId || userId === currentUser?.id;

  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');
  const [editMode, setEditMode] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isFriend, setIsFriend] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [editData, setEditData] = useState({ full_name: '', bio: '', location: '', church_name: '' });
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState('posts');

  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  useEffect(() => {
    if (!targetId) return;
    setLoading(true);
    Promise.all([
        fetch(`${API}/profile/${targetId}`, { headers }).then(r => r.json()),
        fetch(`${API}/feed/user/${targetId}?limit=30`, { headers }).then(r => r.json()),
    ]).then(([profileData, feedData]) => {
      const u = profileData.user || profileData;
      setProfile(u);
      setEditData({ full_name: u.full_name || '', bio: u.bio || '', location: u.location || '', church_name: u.church_name || '' });
      setPosts(feedData.posts || []);
    }).catch(console.error).finally(() => setLoading(false));
  }, [targetId, token]);

  async function saveProfile() {
    const res = await fetch(`/profile`, {
      method: 'PATCH',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify(editData),
    });
    if (res.ok) {
      const data = await res.json();
      setProfile(prev => ({ ...prev, ...editData }));
      setEditMode(false);
    }
  }

  async function handleAvatarChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadPhoto(file);
      await fetch(`${API}/profile`, {
        method: 'PATCH',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ avatar_url: url }),
      });
      setProfile(prev => ({ ...prev, avatar_url: url }));
    } finally { setUploading(false); }
  }

  async function handleCoverChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadPhoto(file);
      await fetch(`${API}/profile`, {
        method: 'PATCH',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ cover_url: url }),
      });
      setProfile(prev => ({ ...prev, cover_url: url }));
    } finally { setUploading(false); }
  }

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}><div className="loading-spinner" /></div>;
  if (!profile) return <div style={{ textAlign: 'center', padding: '3rem' }}>😔 Perfil nao encontrado.</div>;

  const initials = (profile.full_name || 'U').slice(0, 2).toUpperCase();
  const totalPosts = posts.length;

  return (
    <div style={{ maxWidth: 935, margin: '0 auto', padding: '0 0 40px' }}>
      {/* COVER PHOTO */}
        <div style={{ position: 'relative', height: 200, background: profile.cover_url ? `url(${profile.cover_url}) center/cover` : 'linear-gradient(135deg, #1a0a3e, #4a1a8e, #daa520)', borderRadius: '0 0 12px 12px' }}>
        {isOwn && (
          <>
            <button onClick={() => coverRef.current?.click()} style={{ position: 'absolute', bottom: 12, right: 12, background: 'rgba(0,0,0,0.6)', border: 'none', borderRadius: 8, padding: '8px 12px', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, zIndex: 10 }}>
              <Camera size={16} /> {t('profile.changeCover')}
            </button>
            <input ref={coverRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleCoverChange} />
          </>
        )}
      </div>

      {/* PROFILE INFO */}
      <div style={{ padding: '0 24px', marginTop: -50, position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 20, flexWrap: 'wrap' }}>
          {/* AVATAR */}
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <div style={{ width: 100, height: 100, borderRadius: '50%', border: '4px solid #fff', overflow: 'hidden', background: '#daa520', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, fontWeight: 700, color: '#fff', boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}>
              {profile.avatar_url ? <img src={profile.avatar_url} alt="" onClick={()=>setShowAvatarBig(true)} style={{ width: '100%', height: '100%', objectFit: 'cover', cursor:'pointer' }} /> : initials}
              {showAvatarBig && (<div onClick={()=>setShowAvatarBig(false)} style={{position:'fixed',top:0,left:0,right:0,bottom:0,background:'rgba(0,0,0,0.85)',zIndex:9999,display:'flex',alignItems:'center',justifyContent:'center'}}><img src={profile.avatar_url} alt="" style={{maxWidth:'90vw',maxHeight:'90vh',borderRadius:12,boxShadow:'0 0 40px rgba(0,0,0,0.8)'}}/></div>)}
            </div>
            {isOwn && (
              <>
                <button onClick={() => avatarRef.current?.click()} style={{ position: 'absolute', bottom: 4, right: 4, width: 28, height: 28, borderRadius: '50%', background: '#daa520', border: '2px solid #fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Camera size={14} color="#fff" />
                </button>
                <input ref={avatarRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarChange} />
              </>
            )}
          </div>

          {/* NAME & ACTIONS */}
          <div style={{ flex: 1, paddingBottom: 8, minWidth: 200 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 8 }}>
              <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#1a1a2e' }}>{profile.full_name || 'Utilizador'}</h1>
              {profile.role === 'pastor' && <span style={{ background: '#daa520', color: '#fff', borderRadius: 20, padding: '2px 10px', fontSize: 12, fontWeight: 700 }}>Pastor</span>}
              {profile.role === 'admin' && <span style={{ background: '#e74c3c', color: '#fff', borderRadius: 20, padding: '2px 10px', fontSize: 12, fontWeight: 700 }}>Admin</span>}
            </div>

            {/* STATS */}
            <div style={{ display: 'flex', gap: 24, marginBottom: 12 }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontWeight: 700, fontSize: 18, color: '#1a1a2e' }}>{totalPosts}</div>
                <div style={{ fontSize: 12, color: '#888' }}>{t('profile.posts')}</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontWeight: 700, fontSize: 18, color: '#1a1a2e' }}>{profile.stats?.friends || 0}</div>
                <div style={{ fontSize: 12, color: '#888' }}>{t('profile.friends')}</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontWeight: 700, fontSize: 18, color: '#1a1a2e' }}>{profile.stats?.prayers || 0}</div>
                <div style={{ fontSize: 12, color: '#888' }}>{t('profile.prayers')}</div>
              </div>
            </div>

            {/* ACTIONS */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {isOwn ? (
                <>
                <button onClick={() => setEditMode(true)} style={{ padding: '8px 20px', borderRadius: 8, border: '1px solid #dbdbdb', background: '#fff', cursor: 'pointer', fontWeight: 600, fontSize: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Edit2 size={16} /> {t('profile.editProfile')}
                </button>
                <div style={{ position: 'relative' }}>
                  <button onClick={() => setShowMenu(!showMenu)} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #dbdbdb', background: '#fff', cursor: 'pointer', fontWeight: 600, fontSize: 18 }}>⋮</button>
                  {showMenu && (
                    <div style={{ position: 'absolute', top: 40, right: 0, background: '#fff', borderRadius: 12, boxShadow: '0 4px 20px rgba(0,0,0,0.15)', zIndex: 100, minWidth: 200, overflow: 'hidden' }}>
                      <button onClick={() => { navigator.clipboard.writeText(window.location.href); setShowMenu(false); }} style={{ width: '100%', padding: '12px 16px', border: 'none', background: 'none', cursor: 'pointer', textAlign: 'left', fontSize: 14, display: 'flex', alignItems: 'center', gap: 8 }}>🔗 {t('profile.copyLink')}</button>
                      <button onClick={() => { coverRef.current?.click(); setShowMenu(false); }} style={{ width: '100%', padding: '12px 16px', border: 'none', background: 'none', cursor: 'pointer', textAlign: 'left', fontSize: 14, display: 'flex', alignItems: 'center', gap: 8 }}>📷 {t('profile.changeCover')}</button>
                      <button onClick={() => { avatarRef.current?.click(); setShowMenu(false); }} style={{ width: '100%', padding: '12px 16px', border: 'none', background: 'none', cursor: 'pointer', textAlign: 'left', fontSize: 14, display: 'flex', alignItems: 'center', gap: 8 }}>🖼️ {t('profile.changeAvatar')}</button>
                      <button onClick={() => { setProfile(prev => ({...prev, cover_url: null})); setShowMenu(false); }} style={{ width: '100%', padding: '12px 16px', border: 'none', background: 'none', cursor: 'pointer', textAlign: 'left', fontSize: 14, color: '#e11d48', display: 'flex', alignItems: 'center', gap: 8 }}>🗑️ {t('profile.deleteCover')}</button>
                    </div>
                  )}
                </div>
                </>
              ) : (
                <>
                  <button onClick={() => navigate('/mensagens')} style={{ padding: '8px 20px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg,#667eea,#764ba2)', color: '#fff', cursor: 'pointer', fontWeight: 600, fontSize: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Send size={16} /> {t('common.send')}
                  </button>
                  <button style={{ padding: '8px 20px', borderRadius: 8, border: '1px solid #dbdbdb', background: '#fff', cursor: 'pointer', fontWeight: 600, fontSize: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <UserPlus size={16} /> {t('nav.friends')}
                  </button>
                  <button onClick={() => { if(window.confirm(t('profile.blockConfirm', 'Bloquear este utilizador?'))) { fetch(API_BASE+'/api/users/'+profile.id+'/block',{method:'POST',headers:{Authorization:'Bearer '+token}}).then(()=>alert(t('profile.blocked', 'Utilizador bloqueado!'))); }}} style={{padding:'8px 20px',borderRadius:8,border:'1px solid #e74c3c',background:'#fff',color:'#e74c3c',cursor:'pointer',fontWeight:600,fontSize:14}}>Bloquear</button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* BIO */}
        <div style={{ marginTop: 16, paddingBottom: 16, borderBottom: '1px solid #dbdbdb' }}>
          {profile.bio && <p style={{ margin: '0 0 6px', fontSize: 14, color: '#1a1a2e', lineHeight: 1.5 }}>{profile.bio}</p>}
          {profile.church_name && <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#888', marginBottom: 4 }}><Church size={14} /> {profile.church_name}</div>}
          {profile.location && <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#888' }}><MapPin size={14} /> {profile.location}</div>}
        </div>

        {/* TABS */}
        <div style={{ display: 'flex', borderBottom: '1px solid #dbdbdb', marginTop: 0 }}>
          {['posts', 'prayers', 'friends'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{ flex: 1, padding: '14px 0', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 13, color: activeTab === tab ? '#1a1a2e' : '#888', borderBottom: activeTab === tab ? '2px solid #1a1a2e' : '2px solid transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              {tab === 'posts' && <><Grid size={14} /> {t('profile.posts')}</>}
              {tab === 'prayers' && <><Heart size={14} /> {t('profile.prayers')}</>}
              {tab === 'friends' && <><UserCheck size={14} /> {t('profile.friends')}</>}
            </button>
          ))}
          <div style={{ display: 'flex', borderLeft: '1px solid #dbdbdb' }}>
            <button onClick={() => setViewMode('grid')} style={{ padding: '14px 16px', border: 'none', background: 'none', cursor: 'pointer', color: viewMode === 'grid' ? '#1a1a2e' : '#888' }}><Grid size={18} /></button>
            <button onClick={() => setViewMode('list')} style={{ padding: '14px 16px', border: 'none', background: 'none', cursor: 'pointer', color: viewMode === 'list' ? '#1a1a2e' : '#888' }}><List size={18} /></button>
          </div>
        </div>

        {/* POSTS */}
        {activeTab === 'posts' && (
          viewMode === 'grid' ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 3, marginTop: 3 }}>
              {posts.map(post => (
                <div key={post.id} onClick={() => setSelectedPost(post)} style={{ aspectRatio: '1', background: '#f0f0f0', cursor: 'pointer', overflow: 'hidden', position: 'relative' }}>
                  {post.media_url && post.media_url.match(/\.(jpg|jpeg|png|gif|webp)/i) ? (
                    <img src={post.media_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : post.media_url && post.media_url.match(/\.(mp4|webm|mov)/i) ? (
                    <video src={post.media_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} muted />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg,#667eea,#764ba2)', padding: 12 }}>
                      <p style={{ color: '#fff', fontSize: 13, textAlign: 'center', margin: 0, lineHeight: 1.4, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical' }}>{post.content}</p>
                    </div>
                  )}
                  <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0)', transition: 'background 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, color: '#fff', fontWeight: 700 }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.4)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,0,0,0)'}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Heart size={18} fill="#fff" /> {post.like_count || 0}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><MessageCircle size={18} fill="#fff" /> {post.comment_count || 0}</span>
                  </div>
                </div>
              ))}
              {posts.length === 0 && <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '3rem', color: '#888' }}>Nenhuma publicacao ainda.</div>}
            </div>
          ) : (
            <div style={{ marginTop: 16 }}>
              {posts.map(post => (
                <div key={post.id} style={{ background: '#fff', borderRadius: 12, border: '1px solid #eee', marginBottom: 16, overflow: 'hidden' }}>
                  {post.media_url && <img src={post.media_url} alt="" style={{ width: '100%', maxHeight: 400, objectFit: 'cover' }} />}
                  <div style={{ padding: 16 }}>
                    <p style={{ margin: '0 0 12px', fontSize: 14, lineHeight: 1.6 }}>{post.content}</p>
                    <div style={{ display: 'flex', gap: 16, color: '#888', fontSize: 13 }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Heart size={16} /> {post.like_count || 0}</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><MessageCircle size={16} /> {post.comment_count || 0}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {activeTab === 'prayers' && (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#888' }}>
            <Heart size={48} style={{ marginBottom: 16, opacity: 0.3 }} />
            <p>Pedidos de oração em breve</p>
          </div>
        )}

        {activeTab === 'friends' && (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#888' }}>
            <UserCheck size={48} style={{ marginBottom: 16, opacity: 0.3 }} />
            <p>Lista de amigos em breve</p>
          </div>
        )}
      </div>

      {/* EDIT MODAL */}
      {editMode && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 480, padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>{t('profile.editProfile')}</h2>
              <button onClick={() => setEditMode(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={24} /></button>
            </div>
            {[['Nome completo', 'full_name'], ['Bio', 'bio'], ['Localização', 'location'], ['Igreja', 'church_name']].map(([label, key]) => (
              <div key={key} style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontWeight: 600, fontSize: 13, marginBottom: 6, color: '#555' }}>{label}</label>
                {key === 'bio' ? (
                  <textarea value={editData[key]} onChange={e => setEditData(prev => ({ ...prev, [key]: e.target.value }))} rows={3} style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #dbdbdb', fontSize: 14, resize: 'vertical', boxSizing: 'border-box' }} />
                ) : (
                  <input value={editData[key]} onChange={e => setEditData(prev => ({ ...prev, [key]: e.target.value }))} style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #dbdbdb', fontSize: 14, boxSizing: 'border-box' }} />
                )}
              </div>
            ))}
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button onClick={() => setEditMode(false)} style={{ padding: '10px 20px', borderRadius: 8, border: '1px solid #dbdbdb', background: '#fff', cursor: 'pointer', fontWeight: 600 }}>{t('common.close')}</button>
              <button onClick={saveProfile} style={{ padding: '10px 20px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg,#667eea,#764ba2)', color: '#fff', cursor: 'pointer', fontWeight: 600 }}>{t('common.save')}</button>
            </div>
          </div>
        </div>
      )}

      {/* POST MODAL */}
      {selectedPost && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }} onClick={() => setSelectedPost(null)}>
          <div style={{ background: '#fff', borderRadius: 16, maxWidth: 800, width: '100%', maxHeight: '90vh', overflow: 'auto', display: 'flex', flexDirection: 'column' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid #eee' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#daa520', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700 }}>
                  {profile.avatar_url ? <img src={profile.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} /> : initials}
                </div>
                <span style={{ fontWeight: 600 }}>{profile.full_name}</span>
              </div>
              <button onClick={() => setSelectedPost(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={24} /></button>
            </div>
            {selectedPost.media_url && selectedPost.media_url.match(/\.(mp4|webm|mov)/i) ? <video src={selectedPost.media_url} controls style={{ width: '100%', maxHeight: 500, background: '#000' }} /> : selectedPost.media_url ? <img src={selectedPost.media_url} alt='' style={{ width: '100%', maxHeight: 500, objectFit: 'contain', background: '#000' }} /> : null}
            <div style={{ padding: 20 }}>
              <p style={{ fontSize: 14, lineHeight: 1.6, margin: '0 0 12px' }}>{selectedPost.content}</p>
              <div style={{ display: 'flex', gap: 16, color: '#888', fontSize: 13 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Heart size={16} /> {selectedPost.like_count || 0} Amén</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><MessageCircle size={16} /> {selectedPost.comment_count || 0} Comentários</span>
              </div>
            </div>
          </div>
        </div>
      )}
      <div style={{ textAlign: 'center', padding: '20px', marginTop: 20 }}><button onClick={() => { if(window.confirm('Tem certeza que deseja apagar sua conta? Esta acao nao pode ser desfeita.')) { fetch(API_BASE + '/api/auth/delete-account', { method: 'DELETE', headers: { Authorization: 'Bearer ' + token } }).then(() => { logout(); }); } }} style={{ background: '#e74c3c', color: 'white', border: 'none', padding: '10px 24px', borderRadius: 8, cursor: 'pointer', fontSize: 14, fontWeight: 700 }}>{t('profile.deleteAccount', 'Apagar Conta')}</button></div>
    </div>
  );
}
