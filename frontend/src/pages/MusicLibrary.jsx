import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import {
  Music, Play, Pause, Heart, Upload, X, ChevronLeft, ChevronRight,
  Volume2, Search, LayoutGrid, List, Image, Lock, Trash2, Share2,
} from 'lucide-react';

const CLOUD_NAME = 'degxiuf43';
const UPLOAD_PRESET = 'sigo_com_fe';
const API = (import.meta.env.VITE_API_URL || '') + '/api';

const GENRE_KEYS = ['louvor', 'adoracao', 'hinos', 'instrumental', 'kids', 'oracao'];

const isVideoUrl = (url) => url && /\.(mp4|mov|webm)(\?|$)/i.test(url);

const iconBtn = {
  background: 'none', border: '1px solid var(--border, #e2e8f0)',
  borderRadius: 8, padding: '6px 8px', cursor: 'pointer', display: 'flex',
  alignItems: 'center', justifyContent: 'center', color: 'var(--text, #333)',
};

// ─── Mini Audio Player (fixed bottom bar) ────────────────────────────────────
function MiniPlayer({ songs, currentIdx, setCurrentIdx, audioRef, playing, setPlaying }) {
  const { t } = useTranslation();
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(1);
  const song = songs[currentIdx];

  useEffect(() => {
    if (!audioRef.current || !song || isVideoUrl(song.url)) return;
    audioRef.current.src = song.url;
    audioRef.current.volume = volume;
    if (playing) audioRef.current.play().catch(() => {});
  }, [currentIdx]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onTime = () => {
      if (audio.duration) setProgress((audio.currentTime / audio.duration) * 100);
    };
    const onEnded = () => {
      if (currentIdx < songs.length - 1) setCurrentIdx(currentIdx + 1);
      else setPlaying(false);
    };
    audio.addEventListener('timeupdate', onTime);
    audio.addEventListener('ended', onEnded);
    return () => { audio.removeEventListener('timeupdate', onTime); audio.removeEventListener('ended', onEnded); };
  }, [currentIdx, songs, setCurrentIdx, setPlaying]);

  const toggle = () => {
    if (!audioRef.current) return;
    if (playing) { audioRef.current.pause(); setPlaying(false); }
    else { audioRef.current.play().catch(() => {}); setPlaying(true); }
  };

  const seek = (e) => {
    if (!audioRef.current?.duration) return;
    audioRef.current.currentTime = (e.target.value / 100) * audioRef.current.duration;
  };

  const changeVolume = (e) => {
    const v = parseFloat(e.target.value);
    setVolume(v);
    if (audioRef.current) audioRef.current.volume = v;
  };

  // Don't show mini player for video songs (they have inline player)
  if (!song || isVideoUrl(song.url)) return null;

  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0,
      background: 'var(--card, #fff)',
      borderTop: '2px solid var(--fb, #4a80d4)',
      padding: '10px 16px',
      display: 'flex', alignItems: 'center', gap: 12,
      zIndex: 1000,
      boxShadow: '0 -4px 20px rgba(0,0,0,0.12)',
    }}>
      <div style={{ fontSize: 28 }}>🎵</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text, #1a1a2e)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{song.title}</div>
        <div style={{ fontSize: 11, color: '#888' }}>{song.artist}</div>
        <input type="range" min={0} max={100} value={progress} onChange={seek}
          style={{ width: '100%', accentColor: 'var(--fb, #4a80d4)', height: 3, marginTop: 4 }} />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
        <button onClick={() => setCurrentIdx(Math.max(0, currentIdx - 1))} style={iconBtn}>
          <ChevronLeft size={18} />
        </button>
        <button onClick={toggle} style={{ ...iconBtn, background: 'var(--fb, #4a80d4)', color: '#fff', width: 36, height: 36, borderRadius: '50%' }}>
          {playing ? <Pause size={16} /> : <Play size={16} />}
        </button>
        <button onClick={() => setCurrentIdx(Math.min(songs.length - 1, currentIdx + 1))} style={iconBtn}>
          <ChevronRight size={18} />
        </button>
        <Volume2 size={14} color="#888" />
        <input type="range" min={0} max={1} step={0.05} value={volume} onChange={changeVolume}
          style={{ width: 60, accentColor: 'var(--fb, #4a80d4)' }} />
      </div>
    </div>
  );
}

// ─── Upload Modal ─────────────────────────────────────────────────────────────
function UploadModal({ onClose, onUploaded, token }) {
  const { t } = useTranslation();
  const [file, setFile] = useState(null);
  const [fileDuration, setFileDuration] = useState(null);
  const [durationError, setDurationError] = useState(false);
  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [genre, setGenre] = useState('louvor');
  const [isPublic, setIsPublic] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef();
  const coverRef = useRef();

  const handleCoverChange = (f) => {
    if (!f || !f.type.startsWith('image')) return;
    setCoverFile(f);
    const reader = new FileReader();
    reader.onload = (e) => setCoverPreview(e.target.result);
    reader.readAsDataURL(f);
  };

  const handleFileSelect = (f) => {
    if (!f) return;
    const isAudio = f.type.startsWith('audio');
    const isVideo = f.type.startsWith('video');
    if (!isAudio && !isVideo) return;
    setFile(f);
    setDurationError(false);
    setFileDuration(null);
    // Try to get duration client-side
    const url = URL.createObjectURL(f);
    const media = isVideo ? document.createElement('video') : document.createElement('audio');
    media.preload = 'metadata';
    media.src = url;
    media.onloadedmetadata = () => {
      URL.revokeObjectURL(url);
      const dur = Math.round(media.duration);
      setFileDuration(dur);
      if (dur > 300) setDurationError(true);
    };
  };

  const handleDrop = (e) => {
    e.preventDefault(); setDragOver(false);
    const f = e.dataTransfer.files[0];
    handleFileSelect(f);
  };

  const handleSubmit = async () => {
    if (!file || !title.trim() || durationError) return;
    setUploading(true); setProgress(10);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('upload_preset', UPLOAD_PRESET);
      fd.append('folder', 'sigo-com-fe/music');
      const cloudRes = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`, { method: 'POST', body: fd });
      setProgress(70);
      const cloudData = await cloudRes.json();
      if (!cloudData.secure_url) throw new Error(t('music.uploadError'));

      let coverUrl = null;
      if (coverFile) {
        const coverFd = new FormData();
        coverFd.append('file', coverFile);
        coverFd.append('upload_preset', UPLOAD_PRESET);
        coverFd.append('folder', 'sigo-com-fe/music-covers');
        const coverRes = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, { method: 'POST', body: coverFd });
        const coverData = await coverRes.json();
        coverUrl = coverData.secure_url || null;
      }
      setProgress(80);

      const saveRes = await fetch(`${API}/music`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          title: title.trim(),
          artist: artist.trim() || undefined,
          genre,
          url: cloudData.secure_url,
          cover_url: coverUrl,
          duration: cloudData.duration ? Math.round(cloudData.duration) : undefined,
          is_public: isPublic,
        }),
      });
      setProgress(90);
      const saveData = await saveRes.json();
      if (!saveRes.ok) throw new Error(saveData.error || t('music.uploadError'));
      setProgress(100);
      onUploaded(saveData.song);
      onClose();
    } catch (err) {
      console.error(err);
      alert(t('music.uploadError'));
    } finally { setUploading(false); }
  };

  const formatDuration = (secs) => {
    if (!secs) return '';
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: 16,
    }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: 'var(--card, #fff)', borderRadius: 20, padding: 24, width: '100%', maxWidth: 440, boxShadow: '0 20px 60px rgba(0,0,0,0.2)', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h2 style={{ margin: 0, fontSize: 18, color: 'var(--text, #1a1a2e)', fontWeight: 700 }}>{t('music.upload')}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888' }}><X size={20} /></button>
        </div>

        {/* Drag & drop area */}
        <div
          onDrop={handleDrop}
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onClick={() => fileRef.current?.click()}
          style={{
            border: `2px dashed ${durationError ? '#e11d48' : dragOver ? 'var(--fb, #4a80d4)' : 'var(--border, #e2e8f0)'}`,
            borderRadius: 12, padding: '24px 16px', textAlign: 'center', cursor: 'pointer',
            background: dragOver ? 'rgba(74,128,212,0.06)' : 'var(--bg, #f8f9fa)',
            marginBottom: 8, transition: 'all 0.2s',
          }}>
          <input ref={fileRef} type="file" accept="audio/*,video/*,.mp3,.wav,.ogg,.m4a,.mp4,.mov,.webm" style={{ display: 'none' }}
            onChange={e => handleFileSelect(e.target.files?.[0] || null)} />
          {file ? (
            <div>
              <p style={{ margin: 0, fontWeight: 600, color: durationError ? '#e11d48' : '#2e7d32', fontSize: 14 }}>
                {file.type.startsWith('video') ? '🎬' : '🎵'} {file.name}
              </p>
              {fileDuration && (
                <p style={{ margin: '4px 0 0', fontSize: 12, color: durationError ? '#e11d48' : '#888' }}>
                  {formatDuration(fileDuration)} {durationError ? `— ${t('music.tooLong')}` : ''}
                </p>
              )}
            </div>
          ) : (
            <>
              <Upload size={32} color="var(--fb, #4a80d4)" style={{ marginBottom: 8 }} />
              <p style={{ margin: 0, color: '#666', fontSize: 14 }}>{t('music.uploadHint')}</p>
            </>
          )}
        </div>
        {durationError && (
          <p style={{ color: '#e11d48', fontSize: 12, marginBottom: 10, marginTop: 0 }}>{t('music.tooLong')}</p>
        )}

        {/* Fields */}
        <input value={title} onChange={e => setTitle(e.target.value)}
          placeholder={t('music.uploadTitle')}
          style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid var(--border, #e2e8f0)', marginBottom: 10, fontSize: 14, outline: 'none', boxSizing: 'border-box', background: 'var(--bg, #fff)', color: 'var(--text, #333)' }} />
        <input value={artist} onChange={e => setArtist(e.target.value)}
          placeholder={t('music.uploadArtist')}
          style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid var(--border, #e2e8f0)', marginBottom: 10, fontSize: 14, outline: 'none', boxSizing: 'border-box', background: 'var(--bg, #fff)', color: 'var(--text, #333)' }} />

        {/* Cover image upload */}
        <input ref={coverRef} type="file" accept="image/*" style={{ display: 'none' }}
          onChange={e => handleCoverChange(e.target.files?.[0])} />
        <div onClick={() => coverRef.current?.click()} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 10, border: '1px dashed var(--border, #e2e8f0)', marginBottom: 10, cursor: 'pointer', background: 'var(--bg, #f8f9fa)' }}>
          {coverPreview ? (
            <img src={coverPreview} alt="cover" style={{ width: 48, height: 48, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }} />
          ) : (
            <div style={{ width: 48, height: 48, borderRadius: 8, background: 'linear-gradient(135deg,#4a80d4,#764ba2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Image size={20} color="white" />
            </div>
          )}
          <div>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: 'var(--text, #333)' }}>{t('music.uploadCover')}</p>
            <p style={{ margin: 0, fontSize: 11, color: '#888' }}>{coverFile ? coverFile.name : t('music.uploadCoverHint')}</p>
          </div>
        </div>

        <select value={genre} onChange={e => setGenre(e.target.value)}
          style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid var(--border, #e2e8f0)', marginBottom: 12, fontSize: 14, outline: 'none', background: 'var(--bg, #fff)', color: 'var(--text, #333)' }}>
          {GENRE_KEYS.map(g => (
            <option key={g} value={g}>{t(`music.genre.${g}`)}</option>
          ))}
        </select>

        {/* Visibility toggle */}
        <div style={{ marginBottom: 16, padding: '10px 12px', borderRadius: 10, border: '1px solid var(--border, #e2e8f0)', background: 'var(--bg, #f8f9fa)' }}>
          <p style={{ margin: '0 0 8px', fontSize: 13, fontWeight: 600, color: 'var(--text, #333)' }}>{t('music.visibility')}</p>
          <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', marginBottom: 6 }}>
            <input type="radio" name="visibility" value="public" checked={isPublic} onChange={() => setIsPublic(true)} style={{ accentColor: 'var(--fb, #4a80d4)' }} />
            <span style={{ fontSize: 13, color: isPublic ? 'var(--fb, #4a80d4)' : 'var(--text, #555)', fontWeight: isPublic ? 600 : 400 }}>
              🌍 {t('music.uploadPublic')}
            </span>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
            <input type="radio" name="visibility" value="private" checked={!isPublic} onChange={() => setIsPublic(false)} style={{ accentColor: 'var(--fb, #4a80d4)' }} />
            <span style={{ fontSize: 13, color: !isPublic ? 'var(--fb, #4a80d4)' : 'var(--text, #555)', fontWeight: !isPublic ? 600 : 400 }}>
              🔒 {t('music.uploadPrivate')}
            </span>
          </label>
        </div>

        {uploading && (
          <div style={{ marginBottom: 12 }}>
            <div style={{ height: 6, background: 'var(--border, #e2e8f0)', borderRadius: 3, overflow: 'hidden' }}>
              <div style={{ width: `${progress}%`, height: '100%', background: 'var(--fb, #4a80d4)', transition: 'width 0.3s' }} />
            </div>
            <p style={{ fontSize: 12, color: '#888', marginTop: 4 }}>{t('music.uploading')}</p>
          </div>
        )}

        <button onClick={handleSubmit} disabled={uploading || !file || !title.trim() || durationError} style={{
          width: '100%', padding: 12, borderRadius: 12, border: 'none',
          background: (file && title.trim() && !uploading && !durationError) ? 'var(--fb, #4a80d4)' : '#ccc',
          color: '#fff', fontWeight: 700, fontSize: 15, cursor: (file && title.trim() && !uploading && !durationError) ? 'pointer' : 'not-allowed',
        }}>
          {uploading ? t('music.uploading') : t('music.upload')}
        </button>
      </div>
    </div>
  );
}

// ─── Song Card ────────────────────────────────────────────────────────────────
function SongCard({ song, isPlaying, onPlay, onLike, onDelete, onPublish, token, user, t }) {
  const [likeCount, setLikeCount] = useState(song.like_count || 0);
  const [liked, setLiked] = useState(false);
  const [publishMsg, setPublishMsg] = useState(null);
  const isVideo = isVideoUrl(song.url);
  const isPrivate = !song.is_public;
  const canDelete = user && (song.user_id === user.id || user.role === 'admin' || user.role === 'pastor');

  const handlePublishClick = async (e) => {
    e.stopPropagation();
    if (!user) { alert(t('music.loginToLike')); return; }
    try {
      await onPublish(song);
      setPublishMsg('✅ Publicado no Mural!');
      setTimeout(() => setPublishMsg(null), 3000);
    } catch {
      setPublishMsg('❌ Erro ao publicar');
      setTimeout(() => setPublishMsg(null), 3000);
    }
  };

  const handleDeleteClick = async (e) => {
    e.stopPropagation();
    if (!window.confirm(`Apagar "${song.title}"?`)) return;
    onDelete(song.id);
  };

  const handleLike = async (e) => {
    e.stopPropagation();
    if (!user) { alert(t('music.loginToLike')); return; }
    try {
      const res = await fetch(`${API}/music/${song.id}/like`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setLikeCount(data.like_count);
      setLiked(data.liked);
    } catch (err) { console.error(err); }
  };

  return (
    <div style={{
      background: 'var(--card, #fff)',
      border: isPlaying ? '2px solid var(--fb, #4a80d4)' : '1px solid var(--border, #e2e8f0)',
      borderRadius: 16,
      padding: 14,
      cursor: 'pointer',
      boxShadow: isPlaying ? '0 0 0 4px rgba(74,128,212,0.15)' : '0 2px 8px rgba(0,0,0,0.04)',
      animation: isPlaying && !isVideo ? 'pulse-border 2s infinite' : 'none',
      transition: 'all 0.2s',
      position: 'relative',
    }}>
      {/* Private badge */}
      {isPrivate && (
        <div style={{
          position: 'absolute', top: 10, right: 10, zIndex: 2,
          background: 'rgba(0,0,0,0.55)', borderRadius: 8, padding: '3px 7px',
          display: 'flex', alignItems: 'center', gap: 4,
        }}>
          <Lock size={11} color="#fff" />
          <span style={{ fontSize: 10, color: '#fff', fontWeight: 600 }}>🔒</span>
        </div>
      )}

      {/* Cover / Video */}
      {isVideo ? (
        <div style={{ width: '100%', borderRadius: 12, overflow: 'hidden', marginBottom: 10, background: '#000' }}>
          <video
            src={song.url}
            poster={song.cover_url || undefined}
            controls
            playsInline
            onClick={e => e.stopPropagation()}
            style={{ width: '100%', maxHeight: 180, objectFit: 'contain', display: 'block' }}
          />
        </div>
      ) : (
        <div style={{
          width: '100%', aspectRatio: '1/1', borderRadius: 12,
          background: song.cover_url ? undefined : 'linear-gradient(135deg, var(--fb, #4a80d4), #764ba2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: 10, overflow: 'hidden', fontSize: 40,
        }}>
          {song.cover_url ? (
            <img src={song.cover_url} alt={song.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : '🎵'}
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
        <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text, #1a1a2e)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
          {song.title}
        </div>
        {isVideo && (
          <span style={{ fontSize: 10, background: 'rgba(118,75,162,0.15)', color: '#764ba2', borderRadius: 6, padding: '2px 6px', flexShrink: 0, fontWeight: 600 }}>
            {t('music.video')}
          </span>
        )}
      </div>
      <div style={{ fontSize: 11, color: '#888', marginBottom: 8 }}>{song.artist || song.user_name}</div>

      {/* Genre badge */}
      <div style={{ marginBottom: 10 }}>
        <span style={{ fontSize: 10, fontWeight: 600, padding: '3px 8px', borderRadius: 20, background: 'rgba(74,128,212,0.12)', color: 'var(--fb, #4a80d4)', border: '1px solid rgba(74,128,212,0.2)' }}>
          {song.genre ? t(`music.genre.${song.genre}`, song.genre) : t('music.genre.louvor')}
        </span>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {/* Row 1: like + play */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button onClick={handleLike} style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', cursor: 'pointer', color: liked ? '#e11d48' : '#888', fontSize: 12, padding: 0 }}>
            <Heart size={14} fill={liked ? '#e11d48' : 'none'} color={liked ? '#e11d48' : '#888'} />
            {likeCount} {t('music.likes')}
          </button>
          {!isVideo && (
            <button onClick={(e) => { e.stopPropagation(); onPlay(song); }} style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'var(--fb, #4a80d4)', border: 'none', borderRadius: 8, padding: '6px 10px', cursor: 'pointer', color: '#fff', fontSize: 12, fontWeight: 600 }}>
              {isPlaying ? <Pause size={13} /> : <Play size={13} />}
              {isPlaying ? t('music.pause') : t('music.play')}
            </button>
          )}
        </div>

        {/* Row 2: publish to Mural + delete */}
        {user && (
          <div style={{ display: 'flex', gap: 6 }}>
            <button onClick={handlePublishClick} title="Publicar no Mural" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.3)', borderRadius: 8, padding: '5px 8px', cursor: 'pointer', color: '#9333ea', fontSize: 11, fontWeight: 600 }}>
              <Share2 size={12} /> 📤 Mural
            </button>
            {canDelete && (
              <button onClick={handleDeleteClick} title="Apagar música" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, background: 'rgba(225,29,72,0.08)', border: '1px solid rgba(225,29,72,0.2)', borderRadius: 8, padding: '5px 8px', cursor: 'pointer', color: '#e11d48', fontSize: 11, fontWeight: 600 }}>
                <Trash2 size={12} /> 🗑️
              </button>
            )}
          </div>
        )}

        {/* Feedback */}
        {publishMsg && (
          <div style={{ textAlign: 'center', fontSize: 11, fontWeight: 600, color: publishMsg.startsWith('✅') ? '#16a34a' : '#e11d48', padding: '4px 8px', borderRadius: 6, background: publishMsg.startsWith('✅') ? 'rgba(22,163,74,0.1)' : 'rgba(225,29,72,0.1)' }}>
            {publishMsg}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function MusicLibrary() {
  const { t } = useTranslation();
  const { user, token } = useAuth();

  const [songs, setSongs] = useState([]);
  const [loadingSongs, setLoadingSongs] = useState(false);
  const [activeGenre, setActiveGenre] = useState('all');
  const [search, setSearch] = useState('');
  const [showUpload, setShowUpload] = useState(false);
  const [viewMode, setViewMode] = useState('grid');

  // Audio player
  const audioRef = useRef(new Audio());
  const [currentIdx, setCurrentIdx] = useState(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    fetchSongs();
  }, []);

  const fetchSongs = useCallback(async () => {
    setLoadingSongs(true);
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await fetch(`${API}/music`, { headers });
      const data = await res.json();
      setSongs(Array.isArray(data.songs) ? data.songs : []);
    } catch (err) { console.error(err); }
    finally { setLoadingSongs(false); }
  }, [token]);

  // Filter songs — hide private songs from other users
  const filteredSongs = songs.filter(s => {
    // Hide private songs that don't belong to current user
    if (!s.is_public && s.user_id !== user?.id) return false;
    const matchGenre = activeGenre === 'all' || s.genre === activeGenre;
    const matchSearch = !search || s.title.toLowerCase().includes(search.toLowerCase()) || (s.artist || '').toLowerCase().includes(search.toLowerCase());
    return matchGenre && matchSearch;
  });

  const handlePlay = (song) => {
    if (isVideoUrl(song.url)) return; // videos are inline
    const idx = filteredSongs.findIndex(s => s.id === song.id);
    if (idx === currentIdx) {
      if (playing) { audioRef.current.pause(); setPlaying(false); }
      else { audioRef.current.play().catch(() => {}); setPlaying(true); }
    } else {
      audioRef.current.pause();
      audioRef.current.src = song.url;
      audioRef.current.play().catch(() => {});
      setCurrentIdx(idx);
      setPlaying(true);
    }
  };

  const handleUploaded = (newSong) => {
    setSongs(prev => [newSong, ...prev]);
  };

  const handleDelete = async (songId) => {
    try {
      const res = await fetch(`${API}/music/${songId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setSongs(prev => prev.filter(s => s.id !== songId));
        if (currentIdx !== null && filteredSongs[currentIdx]?.id === songId) {
          audioRef.current.pause();
          setPlaying(false);
          setCurrentIdx(null);
        }
      } else {
        alert('Erro ao apagar música.');
      }
    } catch {
      alert('Erro ao apagar música.');
    }
  };

  const handlePublish = async (song) => {
    const content = `🎵 ${song.title}${song.artist ? ` — ${song.artist}` : ''}`;
    const fd = new FormData();
    fd.append('content', content);
    fd.append('category', 'louvor');
    fd.append('visibility', 'public');
    fd.append('audio_url', song.url);
    const res = await fetch(`${API}/feed`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: fd,
    });
    if (!res.ok) throw new Error('Erro ao publicar');
  };

  // Auto-advance (audio only)
  useEffect(() => {
    const audio = audioRef.current;
    const onEnded = () => {
      if (currentIdx !== null && currentIdx < filteredSongs.length - 1) {
        const next = currentIdx + 1;
        setCurrentIdx(next);
        audio.src = filteredSongs[next].url;
        audio.play().catch(() => {});
      } else {
        setPlaying(false);
      }
    };
    audio.addEventListener('ended', onEnded);
    return () => audio.removeEventListener('ended', onEnded);
  }, [currentIdx, filteredSongs]);

  const genre_chips = [
    { key: 'all', label: t('music.allGenres') },
    ...GENRE_KEYS.map(g => ({ key: g, label: t(`music.genre.${g}`) })),
  ];

  const playerSongs = filteredSongs;
  const playerSong = currentIdx !== null ? playerSongs[currentIdx] : null;

  return (
    <>
      <style>{`
        @keyframes pulse-border {
          0%, 100% { box-shadow: 0 0 0 4px rgba(74,128,212,0.15); }
          50% { box-shadow: 0 0 0 8px rgba(74,128,212,0.08); }
        }
      `}</style>

      <div style={{ maxWidth: 600, margin: '0 auto', padding: '0 0 5rem' }}>

        {/* ── Hero ── */}
        <div style={{
          background: 'linear-gradient(135deg, var(--fb, #4a80d4) 0%, #764ba2 60%, var(--gold, #a07820) 100%)',
          padding: '2rem 1.5rem 1.5rem',
          borderRadius: '0 0 28px 28px',
          marginBottom: '1.25rem',
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', top: -40, right: -40, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.07)' }} />
          <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 52, height: 52, borderRadius: 16, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Music size={28} color="#fff" />
              </div>
              <div>
                <h1 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: '#fff' }}>{t('music.title')}</h1>
                <p style={{ margin: 0, fontSize: '0.82rem', color: 'rgba(255,255,255,0.75)' }}>{t('music.subtitle')}</p>
              </div>
            </div>
            {user && (
              <button onClick={() => setShowUpload(true)} style={{
                background: 'rgba(255,255,255,0.25)', border: '1px solid rgba(255,255,255,0.4)',
                borderRadius: 12, padding: '10px 16px', color: '#fff', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, fontSize: 13,
              }}>
                <Upload size={16} /> {t('music.upload')}
              </button>
            )}
          </div>
        </div>

        {/* ── Filter bar ── */}
        <div style={{ padding: '0 1rem', marginBottom: '1rem' }}>
          <div style={{ position: 'relative', marginBottom: 12 }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder={t('music.searchPlaceholder')}
              style={{
                width: '100%', padding: '10px 12px 10px 36px', borderRadius: 12,
                border: '1px solid var(--border, #e2e8f0)', outline: 'none', fontSize: 14,
                background: 'var(--card, #fff)', color: 'var(--text, #333)', boxSizing: 'border-box',
              }}
            />
          </div>
          <div style={{ display: 'flex', gap: 8, overflowX: 'auto', scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch', paddingBottom: 4, alignItems: 'center' }}>
            {genre_chips.map(chip => (
              <button key={chip.key} onClick={() => setActiveGenre(chip.key)} style={{
                flexShrink: 0, padding: '7px 14px', borderRadius: 20, cursor: 'pointer', fontSize: 12, fontWeight: 600,
                background: activeGenre === chip.key ? 'var(--fb, #4a80d4)' : 'var(--card, #fff)',
                color: activeGenre === chip.key ? '#fff' : 'var(--text, #555)',
                border: activeGenre === chip.key ? '2px solid var(--fb, #4a80d4)' : '1px solid var(--border, #e2e8f0)',
                transition: 'all 0.2s',
              }}>
                {chip.label}
              </button>
            ))}
            {/* View toggle */}
            <div style={{ marginLeft: 'auto', flexShrink: 0, display: 'flex', gap: 4, background: 'var(--card,#fff)', border: '1px solid var(--border)', borderRadius: 10, padding: 3 }}>
              <button onClick={() => setViewMode('grid')} style={{ padding: '5px 8px', borderRadius: 8, border: 'none', cursor: 'pointer', background: viewMode === 'grid' ? 'var(--fb,#4a80d4)' : 'transparent', color: viewMode === 'grid' ? 'white' : '#888' }}>
                <LayoutGrid size={14} />
              </button>
              <button onClick={() => setViewMode('list')} style={{ padding: '5px 8px', borderRadius: 8, border: 'none', cursor: 'pointer', background: viewMode === 'list' ? 'var(--fb,#4a80d4)' : 'transparent', color: viewMode === 'list' ? 'white' : '#888' }}>
                <List size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* ── Songs ── */}
        <div style={{ padding: '0 1rem', marginBottom: '1.5rem' }}>
          {loadingSongs ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#888' }}>🎵</div>
          ) : filteredSongs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#888' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🎵</div>
              <p style={{ margin: '0 0 8px', fontWeight: 600, color: 'var(--text, #333)', fontSize: 15 }}>
                {songs.length === 0 ? 'Biblioteca vazia — sê o primeiro a partilhar! 🎵' : t('music.noSongs')}
              </p>
              {songs.length === 0 && user && (
                <button onClick={() => setShowUpload(true)} style={{ marginTop: 12, padding: '10px 20px', borderRadius: 12, background: 'var(--fb,#4a80d4)', border: 'none', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: 14 }}>
                  ➕ Partilhar música
                </button>
              )}
            </div>
          ) : viewMode === 'grid' ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
              {filteredSongs.map((song, idx) => (
                <SongCard key={song.id} song={song} isPlaying={currentIdx === idx && playing && !isVideoUrl(song.url)} onPlay={handlePlay} onLike={() => {}} onDelete={handleDelete} onPublish={handlePublish} token={token} user={user} t={t} />
              ))}
            </div>
          ) : (
            /* LIST VIEW */
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {filteredSongs.map((song, idx) => {
                const isActive = currentIdx === idx && playing;
                const isVid = isVideoUrl(song.url);
                const isPrivate = !song.is_public;
                return (
                  <div key={song.id} style={{ borderRadius: 12, overflow: 'hidden', background: isActive ? 'rgba(74,128,212,0.08)' : 'var(--card,#fff)', border: isActive ? '1.5px solid var(--fb,#4a80d4)' : '1px solid var(--border,#e2e8f0)', transition: 'all 0.15s' }}>
                    {isVid ? (
                      /* Inline video for list mode */
                      <div>
                        <video src={song.url} poster={song.cover_url || undefined} controls playsInline
                          style={{ width: '100%', maxHeight: 200, objectFit: 'contain', display: 'block', background: '#000' }} />
                        <div style={{ padding: '8px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ margin: 0, fontWeight: 600, fontSize: '0.88rem', color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{song.title}</p>
                            <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: '#888' }}>{song.artist || song.user_name}</p>
                          </div>
                          {isPrivate && <Lock size={14} color="#888" />}
                        </div>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <div onClick={() => handlePlay(song)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', cursor: 'pointer' }}>
                          <div style={{ width: 48, height: 48, borderRadius: 10, flexShrink: 0, overflow: 'hidden', background: 'linear-gradient(135deg,#4a80d4,#764ba2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
                            {song.cover_url ? <img src={song.cover_url} alt={song.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '🎵'}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ margin: 0, fontWeight: 600, fontSize: '0.88rem', color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{song.title}</p>
                            <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: '#888' }}>{song.artist || song.user_name} · {song.genre ? t(`music.genre.${song.genre}`, song.genre) : ''}</p>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                            {isPrivate && <Lock size={13} color="#888" />}
                            <div style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: '0.72rem', color: '#888' }}>
                              <Heart size={12} /> {song.like_count || 0}
                            </div>
                            <div style={{ width: 32, height: 32, borderRadius: '50%', background: isActive ? 'var(--fb,#4a80d4)' : 'var(--bg,#f0f4ff)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              {isActive ? <Pause size={14} color="white" /> : <Play size={14} color="var(--fb,#4a80d4)" />}
                            </div>
                          </div>
                        </div>
                        {user && (
                          <div style={{ display: 'flex', gap: 6, padding: '0 14px 10px' }}>
                            <button onClick={() => handlePublish(song).then(() => alert('✅ Publicado no Mural!')).catch(() => alert('❌ Erro ao publicar'))} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.3)', borderRadius: 8, padding: '5px 8px', cursor: 'pointer', color: '#9333ea', fontSize: 11, fontWeight: 600 }}>
                              <Share2 size={12} /> 📤 Publicar no Mural
                            </button>
                            {(song.user_id === user.id || user.role === 'admin' || user.role === 'pastor') && (
                              <button onClick={() => { if (window.confirm(`Apagar "${song.title}"?`)) handleDelete(song.id); }} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, background: 'rgba(225,29,72,0.08)', border: '1px solid rgba(225,29,72,0.2)', borderRadius: 8, padding: '5px 8px', cursor: 'pointer', color: '#e11d48', fontSize: 11, fontWeight: 600 }}>
                                <Trash2 size={12} /> 🗑️
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Upload Modal */}
      {showUpload && (
        <UploadModal onClose={() => setShowUpload(false)} onUploaded={handleUploaded} token={token} />
      )}

      {/* Mini Audio Player */}
      {playerSong && !isVideoUrl(playerSong.url) && (
        <MiniPlayer
          songs={playerSongs}
          currentIdx={currentIdx}
          setCurrentIdx={(idx) => {
            setCurrentIdx(idx);
            if (playing && playerSongs[idx] && !isVideoUrl(playerSongs[idx].url)) {
              audioRef.current.src = playerSongs[idx].url;
              audioRef.current.play().catch(() => {});
            }
          }}
          audioRef={audioRef}
          playing={playing}
          setPlaying={setPlaying}
        />
      )}
    </>
  );
}
