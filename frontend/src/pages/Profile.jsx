import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { User, Calendar, Edit, Heart, Users, Church, Save, X, Camera, Lock, Globe } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || '';
const API = `${API_BASE}/api`;

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

  const isOwnProfile = currentUser?.id === userId;

  useEffect(() => {
    fetchProfile();
    fetchStats();
  }, [userId]);

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

  // Privacy check: if profile is private & viewer is not owner, show limited view
  const isPrivateAndNotOwner = profile.is_private && !isOwnProfile;
  // TODO: check friendship status for private profiles — for now, show lock for all non-owners

  const memberSince = new Date(profile.created_at).toLocaleDateString();
  const avatarSrc = profile.avatar_url
    ? (profile.avatar_url.startsWith('http') ? profile.avatar_url : `${API_BASE}${profile.avatar_url}`)
    : null;

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: '0' }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #1a0a3e 0%, #2d1b69 50%, #1a0a3e 100%)',
        padding: '2rem 1.5rem 1.5rem',
        color: '#fff',
        textAlign: 'center',
        position: 'relative',
      }}>
        {/* Privacy toggle for own profile */}
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

        {/* Role badge */}
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
      </div>

      {/* Stats bar — Instagram style */}
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

      {/* Private profile lock message */}
      {isPrivateAndNotOwner && (
        <div style={{
          background: '#1a0a3e', padding: '3rem 2rem', textAlign: 'center', color: '#999',
        }}>
          <Lock size={48} color="#daa520" style={{ marginBottom: '1rem', opacity: 0.6 }} />
          <h3 style={{ color: '#fff', margin: '0 0 0.5rem' }}>Conta Privada</h3>
          <p style={{ margin: 0, fontSize: '0.9rem' }}>
            Adicione como amigo para ver o perfil completo.
          </p>
          {currentUser && (
            <button onClick={handleAddFriend} style={{
              marginTop: '1.5rem', padding: '0.7rem 2rem', borderRadius: 8, border: 'none',
              background: '#daa520', color: '#1a0a3e', fontWeight: 700, fontSize: '0.95rem',
              cursor: 'pointer',
            }}>
              <Users size={16} style={{ verticalAlign: 'middle', marginRight: 6 }} />
              Adicionar Amigo
            </button>
          )}
        </div>
      )}

      {/* Bio + actions — only show if not private or is own profile */}
      {(!isPrivateAndNotOwner) && (
        <div style={{ background: '#1a0a3e', padding: '1.5rem', minHeight: 200 }}>
          {/* Bio */}
          <div style={{
            background: 'rgba(255,255,255,0.05)', borderRadius: 12, padding: '1.25rem', marginBottom: '1.25rem',
            border: '1px solid rgba(218,165,32,0.15)',
          }}>
            <h3 style={{ margin: '0 0 0.5rem', fontSize: '0.9rem', color: '#daa520', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {t('profile.bio')}
            </h3>
            <p style={{ margin: 0, color: profile.bio ? '#e0e0e0' : '#666', fontStyle: profile.bio ? 'normal' : 'italic', lineHeight: 1.5 }}>
              {profile.bio || t('profile.noBio')}
            </p>
          </div>

          {/* Actions */}
          {isOwnProfile && !editing && (
            <button onClick={() => setEditing(true)} style={{
              width: '100%', padding: '0.75rem', borderRadius: 10, border: '2px solid #daa520',
              background: 'transparent', color: '#daa520', fontWeight: 600, fontSize: '0.95rem',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}>
              <Edit size={18} /> {t('profile.editProfile')}
            </button>
          )}

          {!isOwnProfile && currentUser && (
            <button onClick={handleAddFriend} style={{
              width: '100%', padding: '0.75rem', borderRadius: 10, border: 'none',
              background: '#daa520', color: '#1a0a3e', fontWeight: 700, fontSize: '0.95rem',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}>
              <Users size={18} /> Adicionar Amigo
            </button>
          )}

          {/* Edit Form — Modal overlay */}
          {editing && (
            <div style={{
              position: 'fixed', inset: 0, zIndex: 9999,
              background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: '1rem',
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
      )}
    </div>
  );
}
