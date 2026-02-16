import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import {
  User, Calendar, Edit, Heart, Users, Church, Save, X, Camera, Lock, Globe,
  Plus, Image, BookOpen, Info, Grid3x3, MessageCircle, Play, Send, Trash2,
  ChevronLeft, MoreHorizontal, Share2, Bookmark, Video, Smile, Mail, ArrowLeft, Inbox
} from 'lucide-react';
const API_BASE = import.meta.env.VITE_API_URL || '';
const API = `${API_BASE}/api`;
const CLOUD_NAME = 'degxiuf43';
const UPLOAD_PRESET = 'sigo_com_fe';

const CATEGORIES = [
  { value: 'testemunho', label: '🙏 Testemunho', color: '#daa520' },
  { value: 'louvor', label: '🎵 Louvor / Vídeo', color: '#9b59b6' },
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
  const [updatingPrivacy, setUpdatingPrivacy] = useState(false);
  const [privacyError, setPrivacyError] = useState('');

  const [activeTab, setActiveTab] = useState('posts');
  const [posts, setPosts] = useState([]);
  const [prayers, setPrayers] = useState([]);
  const [loadingContent, setLoadingContent] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);

  // Comments & likes
  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [sendingComment, setSendingComment] = useState(false);
  const [likedPosts, setLikedPosts] = useState({});
  const [likeCounts, setLikeCounts] = useState({});

  // New post
  const [showNewPost, setShowNewPost] = useState(false);
  const [newPost, setNewPost] = useState({ content: '', category: 'foto', verse_reference: '' });
  const [newPostMedia, setNewPostMedia] = useState(null);
  const [newPostPreview, setNewPostPreview] = useState(null);
  const [newPostMediaType, setNewPostMediaType] = useState(null);
  const [creatingPost, setCreatingPost] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const postMediaRef = useRef(null);
  const commentInputRef = useRef(null);

  // Friend status
  const [friendStatus, setFriendStatus] = useState(null);

  // Messages (chat inside profile)
  const [dmMessages, setDmMessages] = useState([]);
  const [dmText, setDmText] = useState('');
  const [sendingDm, setSendingDm] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [loadingDm, setLoadingDm] = useState(false);
  const [selectedConv, setSelectedConv] = useState(null);
  const chatEndRef = useRef(null);

  const isOwnProfile = currentUser?.id === userId;

  useEffect(() => {
    fetchProfile();
    fetchStats();
    if (currentUser && !isOwnProfile) checkFriendship();
  }, [userId, currentUser]);

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
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }

  async function fetchStats() {
    try {
      const res = await fetch(`${API}/profile/${userId}/stats`);
      const data = await res.json();
      setStats(data);
    } catch (err) { console.error(err); }
  }

  async function fetchPosts() {
    setLoadingContent(true);
    try {
      const res = await fetch(`${API}/feed/user/${userId}`);
      const data = await res.json();
      const p = data.posts || [];
      setPosts(p);
      // Init like counts
      const lc = {};
      p.forEach(post => { lc[post.id] = post.like_count || 0; });
      setLikeCounts(lc);
      // Check which posts are liked
      if (token) {
        for (const post of p.slice(0, 30)) {
          try {
            const r = await fetch(`${API}/feed/${post.id}/liked`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            const d = await r.json();
            if (d.liked) setLikedPosts(prev => ({ ...prev, [post.id]: true }));
          } catch {}
        }
      }
    } catch (err) { console.error(err); }
    finally { setLoadingContent(false); }
  }

  async function fetchPrayers() {
    setLoadingContent(true);
    try {
      const res = await fetch(`${API}/prayers?authorId=${userId}`);
      const data = await res.json();
      setPrayers(data.prayers || []);
    } catch (err) { console.error(err); }
    finally { setLoadingContent(false); }
  }

  async function checkFriendship() {
    try {
      const res = await fetch(`${API}/friends/list`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      const friends = data.friends || [];
      const match = friends.find(f => f.id === userId || f.friend_id === userId);
      if (match) setFriendStatus('accepted');
    } catch {}
  }

  // Simple direct avatar upload (no crop - works on all devices)
  async function handleAvatarUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAvatar(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('upload_preset', UPLOAD_PRESET);
      fd.append('folder', 'sigo-com-fe/avatars');
      const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, { method: 'POST', body: fd });
      const data = await res.json();
      if (data.secure_url) {
        await fetch(`${API}/profile`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ ...form, avatar_url: data.secure_url, is_private: profile.is_private }),
        });
        setProfile(prev => ({ ...prev, avatar_url: data.secure_url }));
        setForm(prev => ({ ...prev, avatar_url: data.secure_url }));
      }
    } catch (err) { console.error(err); }
    finally { setUploadingAvatar(false); }
  }

  async function handleTogglePrivacy() {
    const newVal = !profile.is_private;
    // Optimistic update - change immediately
    setProfile(prev => ({ ...prev, is_private: newVal }));
    setUpdatingPrivacy(true);
    setPrivacyError('');
    try {
      const res = await fetch(`${API}/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...form, is_private: newVal }),
      });
      if (!res.ok) throw new Error('Erro ao atualizar');
      const data = await res.json();
      if (data.user) setProfile(prev => ({ ...prev, ...data.user }));
    } catch (err) {
      // Revert on error
      setProfile(prev => ({ ...prev, is_private: !newVal }));
      setPrivacyError('Erro ao mudar privacidade. Tente novamente.');
      setTimeout(() => setPrivacyError(''), 3000);
    } finally {
      setUpdatingPrivacy(false);
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
      if (data.user) { setProfile(prev => ({ ...prev, ...data.user })); setEditing(false); }
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  }

  // Upload media to Cloudinary
  async function uploadToCloudinary(file) {
    const fd = new FormData();
    fd.append('file', file);
    fd.append('upload_preset', UPLOAD_PRESET);
    fd.append('folder', 'sigo-com-fe/posts');
    const resourceType = file.type.startsWith('video/') ? 'video' : 'image';

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resourceType}/upload`);
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) setUploadProgress(Math.round((e.loaded / e.total) * 100));
      };
      xhr.onload = () => {
        if (xhr.status === 200) resolve(JSON.parse(xhr.responseText));
        else reject(new Error('Upload failed'));
      };
      xhr.onerror = () => reject(new Error('Upload error'));
      xhr.send(fd);
    });
  }

  async function handleCreatePost() {
    if (!newPost.content.trim() && !newPostMedia) return;
    setCreatingPost(true);
    setUploadProgress(0);
    try {
      let mediaUrl = null;
      let mediaType = null;

      if (newPostMedia) {
        const result = await uploadToCloudinary(newPostMedia);
        mediaUrl = result.secure_url;
        mediaType = newPostMediaType;
      }

      const formData = new FormData();
      formData.append('content', newPost.content || (newPost.category === 'foto' ? '📸' : '🎵'));
      formData.append('category', newPost.category);
      if (newPost.verse_reference) formData.append('verse_reference', newPost.verse_reference);
      if (mediaUrl) {
        formData.append('media_url', mediaUrl);
        formData.append('media_type', mediaType);
      }

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
        setNewPost({ content: '', category: 'foto', verse_reference: '' });
        setNewPostMedia(null);
        setNewPostPreview(null);
        setNewPostMediaType(null);
      }
    } catch (err) { console.error(err); }
    finally { setCreatingPost(false); setUploadProgress(0); }
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
    } catch (err) { console.error(err); }
  }

  // Like toggle
  async function handleLike(postId) {
    if (!token) return;
    const wasLiked = likedPosts[postId];
    setLikedPosts(prev => ({ ...prev, [postId]: !wasLiked }));
    setLikeCounts(prev => ({ ...prev, [postId]: (prev[postId] || 0) + (wasLiked ? -1 : 1) }));
    try {
      await fetch(`${API}/feed/${postId}/like`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch {
      setLikedPosts(prev => ({ ...prev, [postId]: wasLiked }));
      setLikeCounts(prev => ({ ...prev, [postId]: (prev[postId] || 0) + (wasLiked ? 1 : -1) }));
    }
  }

  // Comments
  async function fetchComments(postId) {
    setLoadingComments(true);
    try {
      const res = await fetch(`${API}/feed/${postId}/comments`);
      const data = await res.json();
      setComments(data.comments || []);
    } catch { setComments([]); }
    finally { setLoadingComments(false); }
  }

  async function handleSendComment(postId) {
    if (!newComment.trim() || !token) return;
    setSendingComment(true);
    try {
      const res = await fetch(`${API}/feed/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ content: newComment.trim() }),
      });
      const data = await res.json();
      if (data.comment) {
        setComments(prev => [...prev, data.comment]);
        setNewComment('');
        // Update post comment count
        setPosts(prev => prev.map(p => p.id === postId ? { ...p, comment_count: (p.comment_count || 0) + 1 } : p));
      }
    } catch (err) { console.error(err); }
    finally { setSendingComment(false); }
  }

  async function handleDeleteComment(commentId, postId) {
    try {
      await fetch(`${API}/feed/comments/${commentId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      setComments(prev => prev.filter(c => c.id !== commentId));
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, comment_count: Math.max(0, (p.comment_count || 0) - 1) } : p));
    } catch {}
  }

  function openPost(post) {
    setSelectedPost(post);
    setComments([]);
    setNewComment('');
    fetchComments(post.id);
  }

  function handleMediaSelect(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const isVideo = file.type.startsWith('video/');
    setNewPostMedia(file);
    setNewPostMediaType(isVideo ? 'video' : 'image');
    if (isVideo) {
      setNewPostPreview(URL.createObjectURL(file));
    } else {
      const reader = new FileReader();
      reader.onload = () => setNewPostPreview(reader.result);
      reader.readAsDataURL(file);
    }
  }

  // ===== MESSAGES =====
  useEffect(() => {
    if (activeTab === 'messages') {
      if (isOwnProfile) fetchConversations();
      else if (token) fetchDmWith(userId);
    }
  }, [activeTab, userId]);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [dmMessages]);

  // Poll messages every 5s when chat is open
  useEffect(() => {
    if (activeTab !== 'messages') return;
    const targetId = isOwnProfile ? selectedConv?.id : userId;
    if (!targetId || !token) return;
    const interval = setInterval(() => fetchDmWith(targetId, true), 5000);
    return () => clearInterval(interval);
  }, [activeTab, selectedConv, userId]);

  async function fetchConversations() {
    setLoadingDm(true);
    try {
      const res = await fetch(`${API}/messages/conversations`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setConversations(data.conversations || []);
    } catch {}
    finally { setLoadingDm(false); }
  }

  async function fetchDmWith(otherId, silent = false) {
    if (!silent) setLoadingDm(true);
    try {
      const res = await fetch(`${API}/messages/${otherId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setDmMessages(data.messages || []);
    } catch {}
    finally { if (!silent) setLoadingDm(false); }
  }

  async function handleSendDm(receiverId) {
    if (!dmText.trim() || !token) return;
    setSendingDm(true);
    try {
      const res = await fetch(`${API}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ receiverId, content: dmText.trim() }),
      });
      const data = await res.json();
      if (data.message) {
        setDmMessages(prev => [...prev, data.message]);
        setDmText('');
      }
    } catch {}
    finally { setSendingDm(false); }
  }

  function openConversation(conv) {
    setSelectedConv({ id: conv.other_id, name: conv.other_name, avatar: conv.other_avatar });
    fetchDmWith(conv.other_id);
  }

  async function handleAddFriend() {
    try {
      await fetch(`${API}/friends/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ addressee_id: userId }),
      });
      setFriendStatus('pending');
    } catch (err) { console.error(err); }
  }

  function timeAgo(dateStr) {
    const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
    if (diff < 60) return 'agora';
    if (diff < 3600) return `${Math.floor(diff / 60)}min`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
    return `${Math.floor(diff / 86400)}d`;
  }

  const getMediaUrl = (url) => url ? (url.startsWith('http') ? url : `${API_BASE}${url}`) : null;

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}><div className="loading-spinner" /></div>;
  if (!profile) return <div style={{ textAlign: 'center', padding: '4rem', color: '#999' }}><User size={48} style={{ opacity: 0.5, marginBottom: '1rem' }} /><p>Usuário não encontrado</p></div>;

  const isPrivateAndNotOwner = profile.is_private && !isOwnProfile && friendStatus !== 'accepted';
  const memberSince = new Date(profile.created_at).toLocaleDateString();
  const avatarSrc = profile.avatar_url ? (profile.avatar_url.startsWith('http') ? profile.avatar_url : `${API_BASE}${profile.avatar_url}`) : null;

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: '0', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>

      {/* Avatar uploading indicator */}
      {uploadingAvatar && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{ color: '#fff', textAlign: 'center' }}>
            <div className="loading-spinner" style={{ margin: '0 auto 1rem' }} />
            <p>Subindo foto...</p>
          </div>
        </div>
      )}

      {/* ======= HEADER PROFILE CARD ======= */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '1.5rem 1.25rem 1rem',
        position: 'relative',
        overflow: 'hidden',
        borderRadius: '0 0 28px 28px',
      }}>
        {/* Decorative circles */}
        <div style={{ position: 'absolute', top: -40, right: -40, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
        <div style={{ position: 'absolute', bottom: -20, left: -20, width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          {/* Avatar + Stats Row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '0.85rem' }}>
            {/* Avatar with ring */}
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <div style={{
                width: 92, height: 92, borderRadius: '50%',
                background: 'linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)',
                padding: 3, cursor: isOwnProfile ? 'pointer' : 'default',
              }} onClick={() => isOwnProfile && fileInputRef.current?.click()}>
                <div style={{
                  width: '100%', height: '100%', borderRadius: '50%',
                  border: '3px solid #1a1a2e', overflow: 'hidden',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: '#2d1b69',
                }}>
                  {avatarSrc ? (
                    <img src={avatarSrc} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <User size={40} color="#daa520" />
                  )}
                </div>
              </div>
              {uploadingAvatar && (
                <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div className="loading-spinner" style={{ width: 20, height: 20 }} />
                </div>
              )}
              {isOwnProfile && (
                <div style={{
                  position: 'absolute', bottom: 2, right: 2,
                  background: '#3b82f6', borderRadius: '50%', width: 28, height: 28,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', border: '2px solid #1a1a2e',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                }} onClick={() => fileInputRef.current?.click()}>
                  <Camera size={14} color="#fff" />
                </div>
              )}
              <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarUpload} />
            </div>

            {/* Stats */}
            <div style={{ display: 'flex', flex: 1, justifyContent: 'space-around', textAlign: 'center' }}>
              {[
                { value: stats.posts, label: 'Posts' },
                { value: stats.friends, label: 'Amigos' },
                { value: stats.prayers, label: 'Orações' },
              ].map((s, i) => (
                <div key={i} style={{ cursor: 'pointer' }}>
                  <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#fff', lineHeight: 1.2 }}>{s.value}</div>
                  <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.7)', marginTop: 2, letterSpacing: 0.3 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Name & bio */}
          <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: '#fff' }}>
            {profile.full_name}
          </h2>
          {profile.display_name && (
            <p style={{ margin: '0.1rem 0 0', color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem' }}>@{profile.display_name}</p>
          )}
          {profile.bio && (
            <p style={{ margin: '0.4rem 0 0', fontSize: '0.85rem', color: 'rgba(255,255,255,0.85)', lineHeight: 1.4 }}>{profile.bio}</p>
          )}

          {/* Role & church badges */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: '0.5rem', flexWrap: 'wrap' }}>
            <span style={{
              padding: '3px 12px', borderRadius: 20, fontSize: '0.7rem', fontWeight: 700,
              textTransform: 'uppercase', letterSpacing: 0.5,
              background: 'rgba(255,255,255,0.15)', color: '#ffd700',
              backdropFilter: 'blur(10px)',
            }}>
              ✝️ {profile.role}
            </span>
            {profile.church_name && (
              <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.7)' }}>
                <Church size={12} style={{ verticalAlign: 'middle', marginRight: 3 }} />
                {profile.church_name}
              </span>
            )}
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: 8, marginTop: '0.85rem' }}>
            {isOwnProfile ? (
              <>
                <button onClick={() => setEditing(true)} style={{
                  flex: 1, padding: '0.5rem', borderRadius: 10, border: 'none',
                  background: 'rgba(255,255,255,0.2)', color: '#fff', fontWeight: 600, fontSize: '0.85rem',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  backdropFilter: 'blur(10px)',
                }}>
                  <Edit size={14} /> Editar Perfil
                </button>
                <button onClick={handleTogglePrivacy} style={{
                  padding: '0.5rem 0.85rem', borderRadius: 10, border: 'none',
                  background: profile.is_private ? 'rgba(239,68,68,0.3)' : 'rgba(34,197,94,0.3)',
                  color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.8rem',
                  backdropFilter: 'blur(10px)',
                }}>
                  {profile.is_private ? <Lock size={14} /> : <Globe size={14} />}
                  {profile.is_private ? 'Privado' : 'Público'}
                </button>
              </>
            ) : currentUser ? (
              <>
                <button onClick={handleAddFriend} disabled={friendStatus === 'pending' || friendStatus === 'accepted'} style={{
                  flex: 1, padding: '0.55rem', borderRadius: 10, border: 'none',
                  background: friendStatus === 'accepted' ? 'rgba(34,197,94,0.3)' : friendStatus === 'pending' ? 'rgba(255,255,255,0.15)' : '#3b82f6',
                  color: '#fff', fontWeight: 700, fontSize: '0.9rem', cursor: friendStatus ? 'default' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                }}>
                  <Users size={16} />
                  {friendStatus === 'accepted' ? '✓ Amigos' : friendStatus === 'pending' ? 'Pendente' : 'Adicionar'}
                </button>
                <button onClick={() => setActiveTab('messages')} style={{
                  padding: '0.55rem 1rem', borderRadius: 10, border: 'none',
                  background: 'rgba(255,255,255,0.2)', color: '#fff', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 5,
                  backdropFilter: 'blur(10px)',
                }}>
                  <MessageCircle size={16} />
                </button>
              </>
            ) : null}
          </div>
        </div>
      </div>

      {/* Private lock */}
      {isPrivateAndNotOwner ? (
        <div style={{
          background: 'rgba(255,255,255,0.05)', padding: '3rem 2rem', textAlign: 'center',
          borderRadius: 20, margin: '1rem 0.5rem', border: '1px solid rgba(255,255,255,0.1)',
        }}>
          <Lock size={52} color="#666" style={{ marginBottom: '1rem' }} />
          <h3 style={{ color: '#fff', margin: '0 0 0.5rem', fontSize: '1.1rem' }}>Conta Privada</h3>
          <p style={{ margin: 0, fontSize: '0.9rem', color: '#888' }}>Adicione como amigo para ver as publicações</p>
        </div>
      ) : (
        <>
          {/* ======= TABS ======= */}
          <div style={{
            display: 'flex', margin: '0.5rem 0 0',
            borderBottom: '1px solid rgba(255,255,255,0.1)',
          }}>
            {[
              { key: 'posts', icon: <Grid3x3 size={22} /> },
              { key: 'prayers', icon: <Heart size={22} /> },
              ...(token ? [{ key: 'messages', icon: <Mail size={22} /> }] : []),
              { key: 'info', icon: <Info size={22} /> },
            ].map(tab => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
                flex: 1, padding: '0.85rem 0', border: 'none', background: 'transparent', cursor: 'pointer',
                color: activeTab === tab.key ? '#667eea' : '#666',
                borderBottom: activeTab === tab.key ? '2px solid #667eea' : '2px solid transparent',
                display: 'flex', justifyContent: 'center', transition: 'all 0.2s',
              }}>
                {tab.icon}
              </button>
            ))}
          </div>

          {/* ======= TAB CONTENT ======= */}
          <div style={{ minHeight: 300, paddingBottom: '2rem' }}>

            {/* POSTS GRID */}
            {activeTab === 'posts' && (
              <div>
                {isOwnProfile && (
                  <button onClick={() => setShowNewPost(true)} style={{
                    width: '100%', padding: '0.85rem', border: 'none',
                    background: 'linear-gradient(135deg, rgba(102,126,234,0.15), rgba(118,75,162,0.15))',
                    color: '#667eea', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    fontSize: '0.9rem', fontWeight: 700,
                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                  }}>
                    <Plus size={20} /> Nova Publicação
                  </button>
                )}

                {loadingContent ? (
                  <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}><div className="loading-spinner" /></div>
                ) : posts.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>
                    <Camera size={52} style={{ opacity: 0.3, marginBottom: '0.75rem' }} />
                    <p style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>Sem publicações</p>
                    <p style={{ margin: '0.3rem 0 0', fontSize: '0.85rem', color: '#555' }}>
                      {isOwnProfile ? 'Compartilhe seus momentos de fé!' : 'Este perfil ainda não publicou nada.'}
                    </p>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2 }}>
                    {posts.map(post => (
                      <div key={post.id} onClick={() => openPost(post)} style={{
                        aspectRatio: '1', cursor: 'pointer', position: 'relative',
                        overflow: 'hidden', background: '#1a1a2e',
                      }}>
                        {post.media_url ? (
                          post.media_type === 'video' ? (
                            <div style={{ width: '100%', height: '100%', position: 'relative' }}>
                              <video src={getMediaUrl(post.media_url)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} muted />
                              <Play size={28} color="#fff" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))' }} />
                            </div>
                          ) : (
                            <img src={getMediaUrl(post.media_url)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          )
                        ) : (
                          <div style={{
                            width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            padding: 10, fontSize: '0.72rem', color: '#ccc', textAlign: 'center',
                            background: `linear-gradient(135deg, #667eea, #764ba2)`,
                          }}>
                            {post.content?.substring(0, 60)}{post.content?.length > 60 ? '...' : ''}
                          </div>
                        )}
                        {/* Hover overlay with likes/comments */}
                        <div style={{
                          position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16,
                          opacity: 0, transition: 'opacity 0.2s',
                        }} className="grid-overlay">
                          <span style={{ color: '#fff', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                            <Heart size={16} fill="#fff" /> {likeCounts[post.id] || 0}
                          </span>
                          <span style={{ color: '#fff', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                            <MessageCircle size={16} fill="#fff" /> {post.comment_count || 0}
                          </span>
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
                  <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}><div className="loading-spinner" /></div>
                ) : prayers.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>
                    <Heart size={48} style={{ opacity: 0.3 }} />
                    <p style={{ margin: '0.75rem 0 0' }}>Nenhuma oração</p>
                  </div>
                ) : (
                  prayers.map(prayer => (
                    <div key={prayer.id} style={{
                      background: 'rgba(255,255,255,0.04)', borderRadius: 16, padding: '1rem',
                      marginBottom: '0.75rem', border: '1px solid rgba(255,255,255,0.08)',
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                        <span style={{ fontSize: '0.72rem', color: '#667eea', fontWeight: 700, textTransform: 'uppercase' }}>{prayer.category}</span>
                        {prayer.is_urgent && <span style={{ fontSize: '0.7rem', color: '#ef4444', fontWeight: 600 }}>🔴 Urgente</span>}
                      </div>
                      {prayer.title && <h4 style={{ margin: '0 0 0.4rem', color: '#fff', fontSize: '0.95rem' }}>{prayer.title}</h4>}
                      <p style={{ margin: 0, color: '#ccc', fontSize: '0.85rem', lineHeight: 1.5 }}>{prayer.content}</p>
                      <div style={{ marginTop: 8, fontSize: '0.75rem', color: '#888' }}>
                        🙏 {prayer.prayer_count || 0} orando · {timeAgo(prayer.created_at)}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* MESSAGES tab */}
            {activeTab === 'messages' && token && (
              <div style={{ padding: '0' }}>
                {isOwnProfile ? (
                  // Own profile: show conversations list or selected chat
                  selectedConv ? (
                    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 400px)', minHeight: 300 }}>
                      {/* Chat header */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0.75rem 1rem', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                        <button onClick={() => { setSelectedConv(null); fetchConversations(); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#667eea' }}>
                          <ArrowLeft size={20} />
                        </button>
                        <Link to={`/perfil/${selectedConv.id}`} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#2d1b69', overflow: 'hidden' }}>
                            {selectedConv.avatar ? <img src={selectedConv.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <User size={16} color="#667eea" style={{ margin: 8 }} />}
                          </div>
                          <span style={{ color: '#fff', fontWeight: 600, fontSize: '0.9rem' }}>{selectedConv.name}</span>
                        </Link>
                      </div>
                      {/* Messages */}
                      <div style={{ flex: 1, overflowY: 'auto', padding: '0.5rem 1rem', display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {dmMessages.length === 0 ? (
                          <p style={{ textAlign: 'center', color: '#666', padding: '2rem 0', fontSize: '0.85rem' }}>💬 Envie a primeira mensagem!</p>
                        ) : dmMessages.map(msg => (
                          <div key={msg.id} style={{
                            alignSelf: msg.sender_id === currentUser?.id ? 'flex-end' : 'flex-start',
                            maxWidth: '75%', padding: '0.5rem 0.85rem', borderRadius: 16,
                            background: msg.sender_id === currentUser?.id ? 'linear-gradient(135deg, #667eea, #764ba2)' : 'rgba(255,255,255,0.08)',
                            color: '#fff', fontSize: '0.85rem', lineHeight: 1.4,
                          }}>
                            {msg.content}
                            <div style={{ fontSize: '0.6rem', opacity: 0.6, marginTop: 3, textAlign: 'right' }}>
                              {new Date(msg.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                        ))}
                        <div ref={chatEndRef} />
                      </div>
                      {/* Input */}
                      <div style={{ display: 'flex', gap: 8, padding: '0.5rem 1rem', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                        <input value={dmText} onChange={e => setDmText(e.target.value)}
                          onKeyDown={e => { if (e.key === 'Enter') handleSendDm(selectedConv.id); }}
                          placeholder="Escreva uma mensagem..." style={{
                            flex: 1, padding: '0.55rem 0.85rem', borderRadius: 20,
                            border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.06)',
                            color: '#fff', fontSize: '0.85rem', outline: 'none',
                          }} />
                        <button onClick={() => handleSendDm(selectedConv.id)} disabled={!dmText.trim() || sendingDm} style={{
                          width: 38, height: 38, borderRadius: '50%', border: 'none',
                          background: dmText.trim() ? 'linear-gradient(135deg, #667eea, #764ba2)' : 'rgba(255,255,255,0.1)',
                          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}><Send size={16} color="#fff" /></button>
                      </div>
                    </div>
                  ) : (
                    // Conversations list
                    <div style={{ padding: '0.75rem' }}>
                      {loadingDm ? (
                        <div style={{ textAlign: 'center', padding: '2rem' }}><div className="loading-spinner" style={{ width: 20, height: 20 }} /></div>
                      ) : conversations.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
                          <Inbox size={40} style={{ opacity: 0.3, marginBottom: '0.5rem' }} />
                          <p style={{ margin: 0, fontSize: '0.9rem' }}>Nenhuma conversa ainda</p>
                        </div>
                      ) : conversations.map(conv => (
                        <div key={conv.other_id} onClick={() => openConversation(conv)} style={{
                          display: 'flex', alignItems: 'center', gap: 10, padding: '0.65rem 0.5rem',
                          borderBottom: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer',
                          borderRadius: 10,
                        }}>
                          <Link to={`/perfil/${conv.other_id}`} onClick={e => e.stopPropagation()} style={{ textDecoration: 'none', flexShrink: 0 }}>
                            <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#2d1b69', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              {conv.other_avatar ? <img src={conv.other_avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <User size={20} color="#667eea" />}
                            </div>
                          </Link>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <span style={{ fontWeight: 600, color: '#fff', fontSize: '0.88rem' }}>{conv.other_name}</span>
                              <span style={{ fontSize: '0.68rem', color: '#888' }}>{timeAgo(conv.last_at)}</span>
                            </div>
                            <div style={{ fontSize: '0.8rem', color: '#888', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {conv.last_content}
                            </div>
                          </div>
                          {conv.unread > 0 && (
                            <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#667eea', color: '#fff', fontSize: '0.65rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              {conv.unread}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )
                ) : (
                  // Other person's profile: direct chat
                  <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 400px)', minHeight: 300 }}>
                    <div style={{ flex: 1, overflowY: 'auto', padding: '0.75rem 1rem', display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {loadingDm ? (
                        <div style={{ textAlign: 'center', padding: '2rem' }}><div className="loading-spinner" style={{ width: 20, height: 20 }} /></div>
                      ) : dmMessages.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
                          <MessageCircle size={40} style={{ opacity: 0.3, marginBottom: '0.5rem' }} />
                          <p style={{ margin: 0, fontSize: '0.9rem' }}>Envie uma mensagem para {profile.full_name?.split(' ')[0]}!</p>
                        </div>
                      ) : dmMessages.map(msg => (
                        <div key={msg.id} style={{
                          alignSelf: msg.sender_id === currentUser?.id ? 'flex-end' : 'flex-start',
                          maxWidth: '75%', padding: '0.5rem 0.85rem', borderRadius: 16,
                          background: msg.sender_id === currentUser?.id ? 'linear-gradient(135deg, #667eea, #764ba2)' : 'rgba(255,255,255,0.08)',
                          color: '#fff', fontSize: '0.85rem', lineHeight: 1.4,
                        }}>
                          {msg.content}
                          <div style={{ fontSize: '0.6rem', opacity: 0.6, marginTop: 3, textAlign: 'right' }}>
                            {new Date(msg.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      ))}
                      <div ref={chatEndRef} />
                    </div>
                    <div style={{ display: 'flex', gap: 8, padding: '0.5rem 1rem', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                      <input value={dmText} onChange={e => setDmText(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') handleSendDm(userId); }}
                        placeholder={`Mensagem para ${profile.full_name?.split(' ')[0]}...`} style={{
                          flex: 1, padding: '0.55rem 0.85rem', borderRadius: 20,
                          border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.06)',
                          color: '#fff', fontSize: '0.85rem', outline: 'none',
                        }} />
                      <button onClick={() => handleSendDm(userId)} disabled={!dmText.trim() || sendingDm} style={{
                        width: 38, height: 38, borderRadius: '50%', border: 'none',
                        background: dmText.trim() ? 'linear-gradient(135deg, #667eea, #764ba2)' : 'rgba(255,255,255,0.1)',
                        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}><Send size={16} color="#fff" /></button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* INFO tab */}
            {activeTab === 'info' && (
              <div style={{ padding: '1.25rem' }}>
                <div style={{
                  background: 'rgba(255,255,255,0.04)', borderRadius: 16, padding: '1.25rem',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}>
                  <h3 style={{ margin: '0 0 0.75rem', fontSize: '0.8rem', color: '#667eea', textTransform: 'uppercase', letterSpacing: 1 }}>Sobre</h3>
                  <p style={{ margin: '0 0 1.25rem', color: profile.bio ? '#ddd' : '#666', fontStyle: profile.bio ? 'normal' : 'italic', lineHeight: 1.6 }}>
                    {profile.bio || 'Nenhuma bio ainda'}
                  </p>
                  {profile.church_name && (
                    <div style={{ marginBottom: '1rem' }}>
                      <span style={{ fontSize: '0.72rem', color: '#667eea', fontWeight: 700, letterSpacing: 0.5 }}>IGREJA</span>
                      <p style={{ margin: '0.25rem 0 0', color: '#ccc', fontSize: '0.9rem' }}>
                        <Church size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                        {profile.church_name}
                      </p>
                    </div>
                  )}
                  <div>
                    <span style={{ fontSize: '0.72rem', color: '#667eea', fontWeight: 700, letterSpacing: 0.5 }}>MEMBRO DESDE</span>
                    <p style={{ margin: '0.25rem 0 0', color: '#ccc', fontSize: '0.9rem' }}>
                      <Calendar size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} /> {memberSince}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* ======= EDIT PROFILE MODAL ======= */}
      {editing && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
        }} onClick={(e) => { if (e.target === e.currentTarget) setEditing(false); }}>
          <div style={{
            background: 'linear-gradient(180deg, #1e1e3f, #12122b)', borderRadius: 20, padding: '1.5rem', width: '100%', maxWidth: 420,
            border: '1px solid rgba(102,126,234,0.3)', maxHeight: '80vh', overflowY: 'auto',
            boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ margin: 0, color: '#fff', fontSize: '1.1rem', fontWeight: 700 }}>Editar Perfil</h3>
              <button onClick={() => setEditing(false)} style={{ background: 'none', border: 'none', color: '#999', cursor: 'pointer' }}><X size={22} /></button>
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: 4, fontWeight: 600, color: '#667eea', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: 0.5 }}>Nome de exibição</label>
              <input value={form.display_name} onChange={e => setForm({ ...form, display_name: e.target.value })}
                style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: 12, border: '1px solid rgba(102,126,234,0.3)', background: 'rgba(255,255,255,0.06)', color: '#fff', boxSizing: 'border-box', fontSize: '0.9rem' }} />
            </div>
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', marginBottom: 4, fontWeight: 600, color: '#667eea', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: 0.5 }}>Bio</label>
              <textarea value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} rows={4}
                style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: 12, border: '1px solid rgba(102,126,234,0.3)', background: 'rgba(255,255,255,0.06)', color: '#fff', boxSizing: 'border-box', resize: 'vertical', fontSize: '0.9rem' }} />
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button onClick={handleSave} disabled={saving} style={{
                flex: 1, padding: '0.7rem', borderRadius: 12, border: 'none',
                background: 'linear-gradient(135deg, #667eea, #764ba2)', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: '0.95rem',
              }}>
                {saving ? 'Salvando...' : '✓ Salvar'}
              </button>
              <button onClick={() => setEditing(false)} style={{
                flex: 1, padding: '0.7rem', borderRadius: 12, border: '1px solid rgba(255,255,255,0.15)',
                background: 'transparent', color: '#ccc', fontWeight: 600, cursor: 'pointer', fontSize: '0.95rem',
              }}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======= NEW POST MODAL ======= */}
      {showNewPost && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(8px)',
          display: 'flex', flexDirection: 'column',
        }}>
          {/* Top bar */}
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '1rem 1.25rem', borderBottom: '1px solid rgba(255,255,255,0.1)',
          }}>
            <button onClick={() => { setShowNewPost(false); setNewPostMedia(null); setNewPostPreview(null); }} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '1rem' }}>
              Cancelar
            </button>
            <h3 style={{ margin: 0, color: '#fff', fontSize: '1rem', fontWeight: 700 }}>Nova Publicação</h3>
            <button onClick={handleCreatePost} disabled={creatingPost || (!newPost.content.trim() && !newPostMedia)} style={{
              background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', fontWeight: 700,
              color: (newPost.content.trim() || newPostMedia) ? '#667eea' : '#444',
            }}>
              {creatingPost ? 'Enviando...' : 'Publicar'}
            </button>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '1rem 1.25rem' }}>
            {/* Media upload area */}
            <div onClick={() => postMediaRef.current?.click()} style={{
              width: '100%', aspectRatio: '1', borderRadius: 16, marginBottom: '1rem',
              border: newPostPreview ? 'none' : '2px dashed rgba(102,126,234,0.4)', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column',
              background: newPostPreview ? '#000' : 'rgba(255,255,255,0.03)',
              overflow: 'hidden', position: 'relative',
            }}>
              {newPostPreview ? (
                newPostMediaType === 'video' ? (
                  <video src={newPostPreview} style={{ width: '100%', height: '100%', objectFit: 'contain' }} controls />
                ) : (
                  <img src={newPostPreview} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                )
              ) : (
                <>
                  <div style={{ display: 'flex', gap: 16, marginBottom: 12 }}>
                    <Camera size={36} color="#667eea" style={{ opacity: 0.6 }} />
                    <Video size={36} color="#764ba2" style={{ opacity: 0.6 }} />
                  </div>
                  <span style={{ color: '#888', fontSize: '0.9rem' }}>Toque para adicionar foto ou vídeo</span>
                </>
              )}
              {creatingPost && uploadProgress > 0 && (
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 4, background: 'rgba(255,255,255,0.1)' }}>
                  <div style={{ height: '100%', width: `${uploadProgress}%`, background: 'linear-gradient(90deg, #667eea, #764ba2)', transition: 'width 0.3s' }} />
                </div>
              )}
            </div>
            <input ref={postMediaRef} type="file" accept="image/*,video/*" style={{ display: 'none' }} onChange={handleMediaSelect} />

            {/* Category chips */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: '1rem' }}>
              {CATEGORIES.map(cat => (
                <button key={cat.value} onClick={() => setNewPost({ ...newPost, category: cat.value })} style={{
                  padding: '7px 14px', borderRadius: 20, border: 'none', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600,
                  background: newPost.category === cat.value ? 'linear-gradient(135deg, #667eea, #764ba2)' : 'rgba(255,255,255,0.08)',
                  color: newPost.category === cat.value ? '#fff' : '#aaa', transition: 'all 0.2s',
                }}>
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Content */}
            <textarea value={newPost.content} onChange={e => setNewPost({ ...newPost, content: e.target.value })}
              placeholder="Compartilhe algo com a comunidade..."
              rows={3} style={{
                width: '100%', padding: '0.75rem', borderRadius: 12, border: '1px solid rgba(255,255,255,0.1)',
                background: 'rgba(255,255,255,0.05)', color: '#fff', boxSizing: 'border-box', resize: 'vertical',
                fontSize: '0.9rem',
              }} />

            {(newPost.category === 'versiculo' || newPost.category === 'reflexao') && (
              <input value={newPost.verse_reference} onChange={e => setNewPost({ ...newPost, verse_reference: e.target.value })}
                placeholder="Referência bíblica (ex: João 3:16)"
                style={{
                  width: '100%', padding: '0.65rem', borderRadius: 12, border: '1px solid rgba(255,255,255,0.1)',
                  background: 'rgba(255,255,255,0.05)', color: '#fff', boxSizing: 'border-box', marginTop: '0.75rem', fontSize: '0.85rem',
                }} />
            )}
          </div>
        </div>
      )}

      {/* ======= POST DETAIL MODAL (Instagram-style) ======= */}
      {selectedPost && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: 'rgba(0,0,0,0.95)',
          display: 'flex', flexDirection: 'column',
        }}>
          {/* Top bar */}
          <div style={{
            display: 'flex', alignItems: 'center', padding: '0.75rem 1rem',
            borderBottom: '1px solid rgba(255,255,255,0.1)',
          }}>
            <button onClick={() => setSelectedPost(null)} style={{
              background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: '4px',
            }}>
              <ChevronLeft size={24} />
            </button>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 10, marginLeft: 8 }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%', overflow: 'hidden',
                background: '#2d1b69', flexShrink: 0,
              }}>
                {avatarSrc ? <img src={avatarSrc} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <User size={18} color="#667eea" style={{ margin: 7 }} />}
              </div>
              <span style={{ color: '#fff', fontWeight: 600, fontSize: '0.9rem' }}>{profile.full_name}</span>
            </div>
            {isOwnProfile && (
              <button onClick={() => handleDeletePost(selectedPost.id)} style={{
                background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer',
              }}>
                <Trash2 size={20} />
              </button>
            )}
          </div>

          {/* Content area - scrollable */}
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {/* Media */}
            {selectedPost.media_url && (
              selectedPost.media_type === 'video' ? (
                <video src={getMediaUrl(selectedPost.media_url)} controls style={{
                  width: '100%', maxHeight: '55vh', objectFit: 'contain', background: '#000',
                }} />
              ) : (
                <img src={getMediaUrl(selectedPost.media_url)} alt="" style={{
                  width: '100%', maxHeight: '55vh', objectFit: 'contain', background: '#000',
                }} />
              )
            )}

            {/* Actions bar */}
            <div style={{ padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: 16 }}>
              <button onClick={() => handleLike(selectedPost.id)} style={{
                background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                transform: likedPosts[selectedPost.id] ? 'scale(1.1)' : 'scale(1)',
                transition: 'transform 0.2s',
              }}>
                <Heart size={26} color={likedPosts[selectedPost.id] ? '#ef4444' : '#fff'} fill={likedPosts[selectedPost.id] ? '#ef4444' : 'none'} />
              </button>
              <button onClick={() => commentInputRef.current?.focus()} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                <MessageCircle size={24} color="#fff" />
              </button>
              <button onClick={() => {
                const url = `${window.location.origin}/perfil/${userId}`;
                navigator.clipboard?.writeText(url);
              }} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                <Share2 size={22} color="#fff" />
              </button>
            </div>

            {/* Like count */}
            {(likeCounts[selectedPost.id] || 0) > 0 && (
              <div style={{ padding: '0 1rem 0.3rem', color: '#fff', fontSize: '0.85rem', fontWeight: 700 }}>
                {likeCounts[selectedPost.id]} {likeCounts[selectedPost.id] === 1 ? 'curtida' : 'curtidas'}
              </div>
            )}

            {/* Caption */}
            <div style={{ padding: '0 1rem 0.5rem' }}>
              <span style={{ color: '#fff', fontWeight: 700, fontSize: '0.85rem', marginRight: 6 }}>{profile.display_name || profile.full_name?.split(' ')[0]}</span>
              <span style={{ color: '#ddd', fontSize: '0.85rem', lineHeight: 1.5 }}>{selectedPost.content}</span>
            </div>

            {selectedPost.verse_reference && (
              <div style={{ padding: '0 1rem 0.5rem', color: '#667eea', fontSize: '0.82rem', fontStyle: 'italic' }}>
                📖 {selectedPost.verse_reference}
              </div>
            )}

            {/* Category + time */}
            <div style={{ padding: '0 1rem 0.75rem', display: 'flex', gap: 12, alignItems: 'center' }}>
              <span style={{
                fontSize: '0.72rem', padding: '3px 10px', borderRadius: 12,
                background: 'rgba(102,126,234,0.2)', color: '#667eea',
              }}>
                {CATEGORIES.find(c => c.value === selectedPost.category)?.label || selectedPost.category}
              </span>
              <span style={{ fontSize: '0.72rem', color: '#666' }}>{timeAgo(selectedPost.created_at)}</span>
            </div>

            {/* Comments section */}
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', padding: '0.75rem 1rem' }}>
              {loadingComments ? (
                <div style={{ textAlign: 'center', padding: '1rem' }}><div className="loading-spinner" style={{ width: 20, height: 20 }} /></div>
              ) : comments.length === 0 ? (
                <p style={{ color: '#555', fontSize: '0.85rem', textAlign: 'center', padding: '0.5rem 0' }}>
                  Sem comentários ainda. Seja o primeiro! 💬
                </p>
              ) : (
                comments.map(c => (
                  <div key={c.id} style={{ display: 'flex', gap: 10, marginBottom: '0.85rem' }}>
                    <div style={{
                      width: 30, height: 30, borderRadius: '50%', background: '#2d1b69', flexShrink: 0,
                      overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {c.author_avatar ? (
                        <img src={c.author_avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <User size={14} color="#667eea" />
                      )}
                    </div>
                    <div style={{ flex: 1 }}>
                      <span style={{ color: '#fff', fontWeight: 700, fontSize: '0.82rem', marginRight: 6 }}>
                        {c.author_name}
                      </span>
                      <span style={{ color: '#ccc', fontSize: '0.82rem' }}>{c.content}</span>
                      <div style={{ display: 'flex', gap: 12, marginTop: 3, alignItems: 'center' }}>
                        <span style={{ fontSize: '0.7rem', color: '#666' }}>{timeAgo(c.created_at)}</span>
                        {c.author_id === currentUser?.id && (
                          <button onClick={() => handleDeleteComment(c.id, selectedPost.id)} style={{
                            background: 'none', border: 'none', color: '#666', cursor: 'pointer', padding: 0, fontSize: '0.7rem',
                          }}>
                            Excluir
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Comment input bar (fixed at bottom) */}
          {token && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '0.65rem 1rem',
              borderTop: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.95)',
            }}>
              <div style={{ width: 30, height: 30, borderRadius: '50%', background: '#2d1b69', flexShrink: 0, overflow: 'hidden' }}>
                {currentUser?.avatar_url ? (
                  <img src={currentUser.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <User size={14} color="#667eea" style={{ margin: 8 }} />
                )}
              </div>
              <input
                ref={commentInputRef}
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendComment(selectedPost.id); } }}
                placeholder="Adicionar comentário..."
                style={{
                  flex: 1, padding: '0.55rem 0.85rem', borderRadius: 20, border: '1px solid rgba(255,255,255,0.12)',
                  background: 'rgba(255,255,255,0.06)', color: '#fff', fontSize: '0.85rem', outline: 'none',
                }}
              />
              <button
                onClick={() => handleSendComment(selectedPost.id)}
                disabled={!newComment.trim() || sendingComment}
                style={{
                  background: 'none', border: 'none', cursor: newComment.trim() ? 'pointer' : 'default',
                  color: newComment.trim() ? '#667eea' : '#444', fontWeight: 700, fontSize: '0.9rem',
                }}
              >
                <Send size={20} />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Hover effect CSS */}
      <style>{`
        .grid-overlay:hover { opacity: 1 !important; }
        @media (hover: none) { .grid-overlay { display: none !important; } }
      `}</style>
    </div>
  );
}
