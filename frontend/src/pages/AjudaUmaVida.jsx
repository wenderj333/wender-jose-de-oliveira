import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';

const API = (import.meta.env.VITE_API_URL || '') + '/api';

function timeAgo(dateStr, t) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return t('ajudaProximo.justNow');
  if (mins < 60) return t('ajudaProximo.minutesAgo', { count: mins });
  const hours = Math.floor(mins / 60);
  if (hours < 24) return t('ajudaProximo.hoursAgo', { count: hours });
  return t('ajudaProximo.daysAgo', { count: Math.floor(hours / 24) });
}

const TYPE_CONFIG = {
  request:   { label: '🙏 Oração',     color: '#6c47d4', bg: '#f3eeff' },
  testimony: { label: '💛 Testemunho', color: '#c9a84c', bg: '#fffbec' },
  gratitude: { label: '✨ Gratidão',   color: '#1e8a5a', bg: '#edfff5' },
  offer:     { label: '❤️ Ajuda',      color: '#d44747', bg: '#fff0f0' },
};

export default function AjudaUmaVida() {
  const { t } = useTranslation();
  const { user, token } = useAuth();

  const ACTION_CARDS = [
    {
      emoji: '😔',
      image: 'https://images.unsplash.com/photo-1544027993-37dbfe43562a?w=400&q=80',
      label: t('ajudaProximo.needHelp'),
      desc: t('ajudaProximo.needHelpDesc'),
      type: 'request',
      action: 'create',
      borderColor: '#6c47d4',
    },
    {
      emoji: '🙏',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80',
      label: t('ajudaProximo.wantToPray'),
      desc: t('ajudaProximo.wantToPrayDesc'),
      type: null,
      action: 'scroll',
      borderColor: '#1e6ab5',
    },
    {
      emoji: '❤️',
      image: 'https://images.unsplash.com/photo-1509099836639-18ba1795216d?w=400&q=80',
      label: t('ajudaProximo.wantToHelp'),
      desc: t('ajudaProximo.wantToHelpDesc'),
      type: 'offer',
      action: 'create',
      borderColor: '#d44747',
    },
    {
      emoji: '📖',
      image: 'https://images.unsplash.com/photo-1504052434569-70ad5836ab65?w=400&q=80',
      label: t('ajudaProximo.testimony'),
      desc: t('ajudaProximo.testimonyDesc'),
      type: 'testimony',
      action: 'create',
      borderColor: '#c9a84c',
    },
  ];

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [creating, setCreating] = useState(false);
  const [createType, setCreateType] = useState('request');
  const [createContent, setCreateContent] = useState('');
  const [createAnon, setCreateAnon] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);
  const [showEmojis, setShowEmojis] = useState(false);
  const fileRef = React.useRef(null);
  const EMOJIS = ['🙏','❤️','✝️','😢','😊','🔥','✨','🕊️','💛','🫂','🙌','💪','😭','🤲','👐'];

  const [expandedComments, setExpandedComments] = useState(new Set());
  const [commentsData, setCommentsData] = useState({});
  const [commentInputs, setCommentInputs] = useState({});
  const [expandedContent, setExpandedContent] = useState(new Set());
  const [prayingIds, setPrayingIds] = useState(new Set());

  const feedRef = useRef(null);

  const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

  // ── Load feed ──────────────────────────────────────────────────────────────
  async function loadPosts() {
    setLoading(true);
    try {
      const res = await fetch(`${API}/help-posts`, {
        headers: authHeaders,
      });
      const data = await res.json();
      setPosts(data.posts || []);
    } catch (err) {
      console.error('Erro ao carregar posts:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // ── Create post ────────────────────────────────────────────────────────────
  async function handleCreate(e) {
    e.preventDefault();
    if (!user) { alert(t('ajudaProximo.loginToPost')); return; }
    if (!createContent.trim()) { alert('Escreva algo antes de publicar'); return; }
    setSubmitting(true);
    try {
      const res = await fetch(`${API}/help-posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify({
          content: createContent,
          post_type: createType,
          is_anonymous: createAnon,
          category: 'general',
          media_url: mediaPreview || null,
        }),
      });
      if (res.ok) {
        setCreating(false);
        setCreateContent('');
        setCreateAnon(false);
        setMediaFile(null);
        setMediaPreview(null);
        setShowEmojis(false);
        await loadPosts();
      } else {
        const d = await res.json();
        alert(d.error || 'Erro ao publicar');
      }
    } catch (err) {
      alert('Erro de rede');
    } finally {
      setSubmitting(false);
    }
  }

  // ── Pray toggle ────────────────────────────────────────────────────────────
  async function handlePray(postId) {
    if (!user) { alert(t('ajudaProximo.loginToPray')); return; }
    if (prayingIds.has(postId)) return; // debounce
    setPrayingIds(prev => new Set([...prev, postId]));
    try {
      const res = await fetch(`${API}/help-posts/${postId}/pray`, {
        method: 'POST',
        headers: authHeaders,
      });
      if (res.ok) {
        const { prayed, prayer_count } = await res.json();
        setPosts(prev =>
          prev.map(p =>
            p.id === postId ? { ...p, user_prayed: prayed, prayer_count } : p
          )
        );
      }
    } catch (err) {
      console.error('Erro ao orar:', err);
    } finally {
      setPrayingIds(prev => { const s = new Set(prev); s.delete(postId); return s; });
    }
  }

  // ── Comments ───────────────────────────────────────────────────────────────
  async function toggleComments(postId) {
    if (expandedComments.has(postId)) {
      setExpandedComments(prev => { const s = new Set(prev); s.delete(postId); return s; });
      return;
    }
    setExpandedComments(prev => new Set([...prev, postId]));
    if (!commentsData[postId]) {
      try {
        const res = await fetch(`${API}/help-posts/${postId}/comments`, { headers: authHeaders });
        const data = await res.json();
        setCommentsData(prev => ({ ...prev, [postId]: data.comments || [] }));
      } catch (err) {
        console.error('Erro ao carregar comentários:', err);
      }
    }
  }

  async function handleComment(postId) {
    const text = commentInputs[postId] || '';
    if (!user) { alert(t('ajudaProximo.loginToPost')); return; }
    if (!text.trim()) return;
    try {
      const res = await fetch(`${API}/help-posts/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify({ content: text }),
      });
      if (res.ok) {
        const { comment } = await res.json();
        setCommentsData(prev => ({
          ...prev,
          [postId]: [...(prev[postId] || []), { ...comment, author_name: user.full_name, author_avatar: user.avatar_url }],
        }));
        setCommentInputs(prev => ({ ...prev, [postId]: '' }));
        setPosts(prev =>
          prev.map(p => p.id === postId ? { ...p, comment_count: (parseInt(p.comment_count) || 0) + 1 } : p)
        );
      }
    } catch (err) {
      console.error('Erro ao comentar:', err);
    }
  }

  function openCreate(type) {
    if (!user) { alert(t('ajudaProximo.loginToPost')); return; }
    setCreateType(type || 'request');
    setCreating(true);
  }

  function scrollToFeed() {
    feedRef.current?.scrollIntoView({ behavior: 'smooth' });
  }

  // ── Styles ─────────────────────────────────────────────────────────────────
  const styles = {
    page: {
      minHeight: '100vh',
      background: '#f7f8fc',
      fontFamily: "'Inter', sans-serif",
      paddingBottom: 60,
    },
    hero: {
      background: 'linear-gradient(135deg, #1a0533 0%, #2d1260 50%, #1a3a6e 100%)',
      color: '#fff',
      textAlign: 'center',
      padding: '60px 24px 48px',
    },
    heroTitle: {
      fontFamily: "'Cormorant Garamond', Georgia, serif",
      fontSize: 'clamp(2.2rem, 6vw, 3.8rem)',
      fontWeight: 700,
      margin: '0 0 12px',
      letterSpacing: '-0.5px',
    },
    heroSub: {
      fontSize: '1.05rem',
      opacity: 0.88,
      margin: '0 0 18px',
    },
    heroVerse: {
      fontStyle: 'italic',
      color: '#c9a84c',
      fontSize: '0.95rem',
      opacity: 0.95,
    },
    section: {
      maxWidth: 720,
      margin: '0 auto',
      padding: '0 16px',
    },
    sectionTitle: {
      fontSize: '1.1rem',
      fontWeight: 700,
      color: '#2d1260',
      margin: '32px 0 16px',
    },
    actionGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: 12,
      marginBottom: 8,
    },
    actionCard: (borderColor) => ({
      background: '#fff',
      border: '1px solid #ece8f5',
      borderLeft: `4px solid ${borderColor}`,
      borderRadius: 14,
      padding: '18px 16px',
      cursor: 'pointer',
      transition: 'box-shadow 0.2s, transform 0.15s',
      textAlign: 'left',
    }),
    actionEmoji: { fontSize: '2rem', display: 'block', marginBottom: 6 },
    actionLabel: { fontWeight: 700, fontSize: '0.95rem', color: '#1a1a2e', marginBottom: 3 },
    actionDesc: { fontSize: '0.78rem', color: '#888', lineHeight: 1.4 },
    feedCard: {
      background: '#fff',
      borderRadius: 16,
      boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
      marginBottom: 16,
      overflow: 'hidden',
    },
    cardHeader: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      padding: '14px 16px 10px',
    },
    avatar: {
      width: 40,
      height: 40,
      borderRadius: '50%',
      background: 'linear-gradient(135deg, #6c47d4, #1e6ab5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '1.2rem',
      color: '#fff',
      fontWeight: 700,
      flexShrink: 0,
      overflow: 'hidden',
    },
    authorName: { fontWeight: 600, fontSize: '0.9rem', color: '#1a1a2e' },
    timeAgo: { fontSize: '0.75rem', color: '#aaa' },
    badge: (cfg) => ({
      display: 'inline-block',
      background: cfg.bg,
      color: cfg.color,
      borderRadius: 20,
      padding: '2px 10px',
      fontSize: '0.75rem',
      fontWeight: 600,
      marginLeft: 'auto',
    }),
    cardContent: {
      padding: '0 16px 12px',
      fontSize: '0.95rem',
      color: '#333',
      lineHeight: 1.6,
    },
    cardActions: {
      display: 'flex',
      gap: 10,
      padding: '8px 16px 14px',
      borderTop: '1px solid #f0f0f5',
      alignItems: 'center',
    },
    prayBtn: (prayed) => ({
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      padding: '7px 14px',
      borderRadius: 20,
      border: prayed ? 'none' : '1.5px solid #ddd',
      background: prayed ? 'linear-gradient(135deg, #6c47d4, #1e6ab5)' : '#fff',
      color: prayed ? '#fff' : '#555',
      fontWeight: 600,
      fontSize: '0.82rem',
      cursor: 'pointer',
      transition: 'all 0.2s',
    }),
    prayCount: {
      fontSize: '0.78rem',
      color: '#999',
      marginLeft: 2,
    },
    commentBtn: {
      display: 'flex',
      alignItems: 'center',
      gap: 5,
      padding: '7px 12px',
      borderRadius: 20,
      border: '1.5px solid #ddd',
      background: '#fff',
      color: '#555',
      fontWeight: 600,
      fontSize: '0.82rem',
      cursor: 'pointer',
      marginLeft: 'auto',
    },
    commentsArea: {
      background: '#fafafa',
      borderTop: '1px solid #f0f0f5',
      padding: '12px 16px',
    },
    commentItem: {
      display: 'flex',
      gap: 8,
      marginBottom: 10,
      alignItems: 'flex-start',
    },
    commentAvatar: {
      width: 28,
      height: 28,
      borderRadius: '50%',
      background: 'linear-gradient(135deg, #c9a84c, #d44747)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '0.8rem',
      color: '#fff',
      fontWeight: 700,
      flexShrink: 0,
    },
    commentBubble: {
      background: '#fff',
      border: '1px solid #ece8f5',
      borderRadius: '0 12px 12px 12px',
      padding: '6px 12px',
      fontSize: '0.85rem',
      color: '#333',
      flex: 1,
    },
    commentAuthor: { fontWeight: 600, fontSize: '0.78rem', color: '#6c47d4', marginBottom: 2 },
    commentInput: {
      width: '100%',
      border: '1.5px solid #ddd',
      borderRadius: 20,
      padding: '8px 14px',
      fontSize: '0.85rem',
      outline: 'none',
      boxSizing: 'border-box',
      marginTop: 8,
    },
    sendCommentBtn: {
      marginTop: 6,
      padding: '6px 18px',
      background: 'linear-gradient(135deg, #6c47d4, #1e6ab5)',
      color: '#fff',
      border: 'none',
      borderRadius: 20,
      fontSize: '0.82rem',
      fontWeight: 600,
      cursor: 'pointer',
    },
    // Modal
    overlay: {
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.6)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 16,
    },
    modal: {
      background: '#fff',
      borderRadius: 20,
      padding: '28px 24px',
      width: '100%',
      maxWidth: 480,
      boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
    },
    modalTitle: {
      fontFamily: "'Cormorant Garamond', Georgia, serif",
      fontSize: '1.6rem',
      fontWeight: 700,
      color: '#2d1260',
      marginBottom: 18,
    },
    textarea: {
      width: '100%',
      minHeight: 120,
      border: '1.5px solid #ddd',
      borderRadius: 12,
      padding: 14,
      fontSize: '0.95rem',
      resize: 'vertical',
      outline: 'none',
      fontFamily: 'inherit',
      boxSizing: 'border-box',
      lineHeight: 1.5,
    },
    typeSelector: {
      display: 'flex',
      gap: 8,
      margin: '14px 0',
      flexWrap: 'wrap',
    },
    typeBtn: (active, cfg) => ({
      padding: '6px 14px',
      borderRadius: 20,
      border: `1.5px solid ${cfg.color}`,
      background: active ? cfg.color : '#fff',
      color: active ? '#fff' : cfg.color,
      fontWeight: 600,
      fontSize: '0.8rem',
      cursor: 'pointer',
      transition: 'all 0.15s',
    }),
    anonRow: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      margin: '14px 0',
    },
    toggle: (active) => ({
      width: 40,
      height: 22,
      borderRadius: 11,
      background: active ? '#6c47d4' : '#ddd',
      position: 'relative',
      cursor: 'pointer',
      transition: 'background 0.2s',
      flexShrink: 0,
    }),
    toggleDot: (active) => ({
      position: 'absolute',
      top: 3,
      left: active ? 20 : 3,
      width: 16,
      height: 16,
      borderRadius: '50%',
      background: '#fff',
      transition: 'left 0.2s',
      boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
    }),
    submitBtn: {
      width: '100%',
      padding: '13px',
      background: 'linear-gradient(135deg, #6c47d4, #1e6ab5)',
      color: '#fff',
      border: 'none',
      borderRadius: 12,
      fontSize: '1rem',
      fontWeight: 700,
      cursor: 'pointer',
      marginTop: 6,
    },
    cancelBtn: {
      width: '100%',
      padding: '10px',
      background: 'none',
      border: '1.5px solid #ddd',
      borderRadius: 12,
      fontSize: '0.9rem',
      color: '#888',
      cursor: 'pointer',
      marginTop: 8,
    },
    readMore: {
      background: 'none',
      border: 'none',
      color: '#6c47d4',
      fontSize: '0.85rem',
      cursor: 'pointer',
      padding: 0,
      fontWeight: 600,
    },
    emptyState: {
      textAlign: 'center',
      color: '#aaa',
      padding: '40px 0',
      fontSize: '0.95rem',
    },
    loadingSpinner: {
      textAlign: 'center',
      padding: '40px 0',
      color: '#6c47d4',
      fontSize: '1.5rem',
    },
  };

  return (
    <div style={styles.page}>
      {/* ── HERO ────────────────────────────────────────────────────────── */}
      <div style={styles.hero}>
        <h1 style={styles.heroTitle}>Ajuda uma Vida</h1>
        <p style={styles.heroSub}>Uma comunidade que ora, cuida e caminha junto.</p>
        <p style={styles.heroVerse}>
          "Carregai os fardos uns dos outros e assim cumprireis a lei de Cristo." — Gálatas 6:2
        </p>
      </div>

      <div style={styles.section}>
        {/* ── COMO VOCÊ ESTÁ? ─────────────────────────────────────────────── */}
        <p style={styles.sectionTitle}>{t('ajudaProximo.howAreYou')}</p>
        <div style={styles.actionGrid}>
          {ACTION_CARDS.map((card) => (
            <div
              key={card.label}
              style={styles.actionCard(card.borderColor)}
              onClick={() => card.action === 'scroll' ? scrollToFeed() : openCreate(card.type)}
              onMouseEnter={e => {
                e.currentTarget.style.boxShadow = '0 6px 24px rgba(108,71,212,0.18)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              {card.image ? <img src={card.image} alt={card.label} style={{ width:'100%', height:120, objectFit:'cover', borderRadius:10, marginBottom:10, display:'block' }} onError={e => { e.target.style.display='none'; }} /> : <span style={styles.actionEmoji}>{card.emoji}</span>}
              <div style={styles.actionLabel}>{card.label}</div>
              <div style={styles.actionDesc}>{card.desc}</div>
            </div>
          ))}
        </div>

        {/* ── FEED ────────────────────────────────────────────────────────── */}
        <div ref={feedRef}>
          <p style={styles.sectionTitle}>🕊️ {t('ajudaProximo.feedTitle')}</p>

          {loading ? (
            <div style={styles.loadingSpinner}>🙏</div>
          ) : posts.length === 0 ? (
            <div style={styles.emptyState}>
              <div style={{ fontSize: '2.5rem', marginBottom: 8 }}>🕊️</div>
              <div>{t('ajudaProximo.noPosts')}</div>
            </div>
          ) : (
            posts.map(post => {
              const typeCfg = TYPE_CONFIG[post.post_type] || TYPE_CONFIG.request;
              const isExpanded = expandedContent.has(post.id);
              const content = post.content || '';
              const longContent = content.length > 220;
              const displayContent = !isExpanded && longContent
                ? content.slice(0, 220) + '…'
                : content;
              const showComments = expandedComments.has(post.id);
              const comments = commentsData[post.id] || [];

              return (
                <div key={post.id} style={styles.feedCard}>
                  {/* Card header */}
                  <div style={styles.cardHeader}>
                    <div style={styles.avatar}>
                      {post.author_avatar ? (
                        <img
                          src={post.author_avatar}
                          alt={post.author_name}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      ) : (
                        post.is_anonymous ? '🙏' : (post.author_name || '?')[0].toUpperCase()
                      )}
                    </div>
                    <div>
                      <div style={styles.authorName}>{post.author_name || t('ajudaProximo.anonymous')}</div>
                      <div style={styles.timeAgo}>{timeAgo(post.created_at, t)}</div>
                    </div>
                    <div style={styles.badge(typeCfg)}>{typeCfg.label}</div>
                  </div>

                  {/* Content */}
                  <div style={styles.cardContent}>
                    <span>{displayContent}</span>
                    {longContent && (
                      <button
                        style={styles.readMore}
                        onClick={() => setExpandedContent(prev => {
                          const s = new Set(prev);
                          isExpanded ? s.delete(post.id) : s.add(post.id);
                          return s;
                        })}
                      >
                        {isExpanded ? ' ver menos' : ' ver mais'}
                      </button>
                    )}
                  </div>

                  {/* Actions */}
                  <div style={styles.cardActions}>
                    <button
                      style={styles.prayBtn(post.user_prayed)}
                      onClick={() => handlePray(post.id)}
                      disabled={prayingIds.has(post.id)}
                    >
                      {post.user_prayed
                        ? `✓ ${t('ajudaProximo.prayed')}`
                        : `🙏 ${t('ajudaProximo.prayForYou')}`}
                    </button>
                    {post.prayer_count > 0 && (
                      <span style={styles.prayCount}>
                        {post.prayer_count} {t('ajudaProximo.peoplePreyed')}
                      </span>
                    )}
                    <button
                      style={styles.commentBtn}
                      onClick={() => toggleComments(post.id)}
                    >
                      💬 {post.comment_count > 0 ? post.comment_count : ''} {showComments ? '▲' : '▼'}
                    </button>
                  </div>

                  {/* Comments section */}
                  {showComments && (
                    <div style={styles.commentsArea}>
                      {comments.length === 0 && (
                        <div style={{ color: '#bbb', fontSize: '0.82rem', marginBottom: 8 }}>
                          Sem comentários ainda. Seja o primeiro!
                        </div>
                      )}
                      {comments.map(c => (
                        <div key={c.id} style={styles.commentItem}>
                          <div style={styles.commentAvatar}>
                            {c.author_avatar ? (
                              <img
                                src={c.author_avatar}
                                alt=""
                                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
                              />
                            ) : (
                              c.is_anonymous ? '🙏' : (c.author_name || '?')[0].toUpperCase()
                            )}
                          </div>
                          <div style={styles.commentBubble}>
                            <div style={styles.commentAuthor}>{c.author_name || t('ajudaProximo.anonymous')}</div>
                            <div>{c.content}</div>
                          </div>
                        </div>
                      ))}
                      {user && (
                        <div>
                          <input
                            style={styles.commentInput}
                            placeholder={t('ajudaProximo.commentPlaceholder')}
                            value={commentInputs[post.id] || ''}
                            onChange={e => setCommentInputs(prev => ({ ...prev, [post.id]: e.target.value }))}
                            onKeyDown={e => e.key === 'Enter' && handleComment(post.id)}
                          />
                          <button
                            style={styles.sendCommentBtn}
                            onClick={() => handleComment(post.id)}
                          >
                            {t('ajudaProximo.send')} 🕊️
                          </button>
                        </div>
                      )}
                      {!user && (
                        <div style={{ color: '#aaa', fontSize: '0.82rem', marginTop: 6 }}>
                          {t('ajudaProximo.loginToPost')}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ── MODAL DE CRIAR POST ──────────────────────────────────────────── */}
      {creating && (
        <div style={styles.overlay} onClick={e => e.target === e.currentTarget && setCreating(false)}>
          <div style={styles.modal}>
            <h2 style={styles.modalTitle}>✍️ Compartilhar</h2>

            <textarea
              style={styles.textarea}
              placeholder={t('ajudaProximo.postPlaceholder')}
              value={createContent}
              onChange={e => setCreateContent(e.target.value)}
              autoFocus
            />
            {/* Emojis */}
            {showEmojis && (
              <div style={{ display:'flex', flexWrap:'wrap', gap:6, padding:'10px 0' }}>
                {['🙏','❤️','✝️','😢','😊','🔥','✨','🕊️','💛','🫂','🙌','💪','😭','🤲','👐'].map(e => (
                  <button key={e} type="button" onClick={() => { setCreateContent(prev => prev + e); setShowEmojis(false); }} style={{ fontSize:22, background:'none', border:'none', cursor:'pointer', padding:2 }}>{e}</button>
                ))}
              </div>
            )}
            {/* Media preview */}
            {mediaPreview && (
              <div style={{ position:'relative', marginTop:10 }}>
                <img src={mediaPreview} alt="preview" style={{ width:'100%', maxHeight:200, objectFit:'cover', borderRadius:10 }} />
                <button type="button" onClick={() => { setMediaFile(null); setMediaPreview(null); }} style={{ position:'absolute', top:6, right:6, background:'rgba(0,0,0,0.6)', border:'none', borderRadius:'50%', width:28, height:28, color:'white', cursor:'pointer', fontSize:16 }}>✕</button>
              </div>
            )}
            {/* Botoes media + emoji */}
            <div style={{ display:'flex', gap:10, marginTop:10 }}>
              <button type="button" onClick={() => fileRef.current?.click()} style={{ padding:'6px 14px', borderRadius:20, border:'1.5px solid #6c47d4', background:'white', color:'#6c47d4', fontSize:13, fontWeight:600, cursor:'pointer' }}>📷 Foto</button>
              <button type="button" onClick={() => setShowEmojis(v => !v)} style={{ padding:'6px 14px', borderRadius:20, border:'1.5px solid #6c47d4', background:'white', color:'#6c47d4', fontSize:13, fontWeight:600, cursor:'pointer' }}>😊 Emoji</button>
              <input ref={fileRef} type="file" accept="image/*,video/*" style={{ display:'none' }} onChange={e => {
                const f = e.target.files[0];
                if (!f) return;
                setMediaFile(f);
                const reader = new FileReader();
                reader.onload = ev => setMediaPreview(ev.target.result);
                reader.readAsDataURL(f);
              }} />
            </div>

            {/* Tipo selector */}
            <div style={{ fontSize: '0.8rem', color: '#888', marginTop: 10, marginBottom: 4 }}>
              {t('ajudaProximo.postTypeLabel')}
            </div>
            <div style={styles.typeSelector}>
              {[
                { key: 'request',   label: `🙏 ${t('ajudaProximo.typeRequest')}` },
                { key: 'testimony', label: `💛 ${t('ajudaProximo.typeTestimony')}` },
                { key: 'gratitude', label: '✨ Gratidão' },
                { key: 'offer',     label: `❤️ ${t('ajudaProximo.typeOffer')}` },
              ].map(tp => {
                const cfg = TYPE_CONFIG[tp.key];
                return (
                  <button
                    key={tp.key}
                    style={styles.typeBtn(createType === tp.key, cfg)}
                    onClick={() => setCreateType(tp.key)}
                  >
                    {tp.label}
                  </button>
                );
              })}
            </div>

            {/* Anónimo toggle */}
            <div style={styles.anonRow}>
              <div
                style={styles.toggle(createAnon)}
                onClick={() => setCreateAnon(v => !v)}
              >
                <div style={styles.toggleDot(createAnon)} />
              </div>
              <span style={{ fontSize: '0.9rem', color: '#555' }}>
                {t('ajudaProximo.postAnon')}
              </span>
            </div>

            <button
              style={styles.submitBtn}
              onClick={handleCreate}
              disabled={submitting || !createContent.trim()}
            >
              {submitting ? 'Publicando…' : `${t('ajudaProximo.publish')} 🕊️`}
            </button>
            <button
              style={styles.cancelBtn}
              onClick={() => setCreating(false)}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
