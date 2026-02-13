import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { User, Calendar, Edit, Heart, Users, Church, Save, X } from 'lucide-react';

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

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch(`${API}/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.user) {
        setProfile({ ...profile, ...data.user });
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
      <div style={{ textAlign: 'center', padding: '4rem', color: '#666' }}>
        <User size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
        <p>Usuário não encontrado</p>
      </div>
    );
  }

  const memberSince = new Date(profile.created_at).toLocaleDateString();
  const roleBadgeColors = {
    pastor: { bg: '#8b5cf6', text: '#fff' },
    leader: { bg: '#6366f1', text: '#fff' },
    member: { bg: '#e0e7ff', text: '#4338ca' },
    admin: { bg: '#dc2626', text: '#fff' },
  };
  const badge = roleBadgeColors[profile.role] || roleBadgeColors.member;

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: '1.5rem 1rem' }}>
      {/* Header Card */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: 16,
        padding: '2rem',
        color: '#fff',
        textAlign: 'center',
        marginBottom: '1.5rem',
        boxShadow: '0 4px 20px rgba(102, 126, 234, 0.3)',
      }}>
        {/* Avatar */}
        <div style={{
          width: 96, height: 96, borderRadius: '50%', margin: '0 auto 1rem',
          background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: '3px solid rgba(255,255,255,0.5)', overflow: 'hidden',
        }}>
          {profile.avatar_url ? (
            <img src={profile.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <User size={48} color="#fff" />
          )}
        </div>

        <h2 style={{ margin: 0, fontSize: '1.5rem' }}>{profile.full_name}</h2>
        {profile.display_name && (
          <p style={{ margin: '0.25rem 0 0', opacity: 0.85, fontSize: '0.95rem' }}>@{profile.display_name}</p>
        )}

        {/* Role Badge */}
        <span style={{
          display: 'inline-block', marginTop: '0.75rem', padding: '0.25rem 0.75rem',
          borderRadius: 20, fontSize: '0.8rem', fontWeight: 600,
          background: badge.bg, color: badge.text,
        }}>
          {profile.role}
        </span>

        {/* Church info */}
        {profile.church_name && (
          <p style={{ margin: '0.75rem 0 0', fontSize: '0.85rem', opacity: 0.9 }}>
            <Church size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} />
            {profile.church_name} {profile.church_role && `· ${profile.church_role}`}
          </p>
        )}

        {/* Member since */}
        <p style={{ margin: '0.5rem 0 0', fontSize: '0.85rem', opacity: 0.8 }}>
          <Calendar size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} />
          {t('profile.memberSince')} {memberSince}
        </p>
      </div>

      {/* Stats */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginBottom: '1.5rem',
      }}>
        {[
          { icon: <Heart size={20} color="#8b5cf6" />, value: stats.prayers, label: t('profile.prayers') },
          { icon: <Edit size={20} color="#6366f1" />, value: stats.posts, label: t('profile.posts') },
          { icon: <Users size={20} color="#764ba2" />, value: stats.friends, label: t('profile.friends') },
        ].map((s, i) => (
          <div key={i} style={{
            background: '#f8f7ff', borderRadius: 12, padding: '1rem', textAlign: 'center',
            border: '1px solid #e0e7ff',
          }}>
            <div style={{ marginBottom: '0.25rem' }}>{s.icon}</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#4338ca' }}>{s.value}</div>
            <div style={{ fontSize: '0.8rem', color: '#666' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Bio */}
      <div style={{
        background: '#fff', borderRadius: 12, padding: '1.25rem', marginBottom: '1.5rem',
        border: '1px solid #e5e7eb',
      }}>
        <h3 style={{ margin: '0 0 0.5rem', fontSize: '1rem', color: '#4338ca' }}>
          {t('profile.bio')}
        </h3>
        <p style={{ margin: 0, color: profile.bio ? '#333' : '#999', fontStyle: profile.bio ? 'normal' : 'italic' }}>
          {profile.bio || t('profile.noBio')}
        </p>
      </div>

      {/* Actions */}
      {isOwnProfile && !editing && (
        <button onClick={() => setEditing(true)} style={{
          width: '100%', padding: '0.75rem', borderRadius: 12, border: '2px solid #8b5cf6',
          background: 'transparent', color: '#8b5cf6', fontWeight: 600, fontSize: '1rem',
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        }}>
          <Edit size={18} /> {t('profile.editProfile')}
        </button>
      )}

      {!isOwnProfile && currentUser && (
        <button onClick={handleAddFriend} style={{
          width: '100%', padding: '0.75rem', borderRadius: 12, border: 'none',
          background: 'linear-gradient(135deg, #667eea, #764ba2)', color: '#fff',
          fontWeight: 600, fontSize: '1rem', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        }}>
          <Users size={18} /> {t('profile.friends')}
        </button>
      )}

      {/* Edit Form */}
      {editing && (
        <div style={{
          background: '#fff', borderRadius: 12, padding: '1.25rem', marginTop: '1rem',
          border: '2px solid #8b5cf6',
        }}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: 4, fontWeight: 600, color: '#4338ca', fontSize: '0.85rem' }}>Display Name</label>
            <input value={form.display_name} onChange={e => setForm({ ...form, display_name: e.target.value })}
              style={{ width: '100%', padding: '0.5rem', borderRadius: 8, border: '1px solid #d1d5db', boxSizing: 'border-box' }} />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: 4, fontWeight: 600, color: '#4338ca', fontSize: '0.85rem' }}>{t('profile.bio')}</label>
            <textarea value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} rows={3}
              style={{ width: '100%', padding: '0.5rem', borderRadius: 8, border: '1px solid #d1d5db', boxSizing: 'border-box', resize: 'vertical' }} />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: 4, fontWeight: 600, color: '#4338ca', fontSize: '0.85rem' }}>Avatar URL</label>
            <input value={form.avatar_url} onChange={e => setForm({ ...form, avatar_url: e.target.value })}
              style={{ width: '100%', padding: '0.5rem', borderRadius: 8, border: '1px solid #d1d5db', boxSizing: 'border-box' }} />
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button onClick={handleSave} disabled={saving} style={{
              flex: 1, padding: '0.6rem', borderRadius: 8, border: 'none',
              background: '#8b5cf6', color: '#fff', fontWeight: 600, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            }}>
              <Save size={16} /> {t('profile.save')}
            </button>
            <button onClick={() => setEditing(false)} style={{
              flex: 1, padding: '0.6rem', borderRadius: 8, border: '1px solid #d1d5db',
              background: '#fff', color: '#666', fontWeight: 600, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            }}>
              <X size={16} /> {t('profile.cancel')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
