import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { Music, Play, Pause, Heart, Mic2, Baby, BookOpen, Guitar, Upload, X, User, Image as ImageIcon } from 'lucide-react';

const CLOUD_NAME = 'degxiuf43';
const UPLOAD_PRESET = 'sigo_com_fe';
const API = (import.meta.env.VITE_API_URL || '') + '/api';

const CATEGORIES = [
  { id: 'worship', icon: <Mic2 size={18} />, gradient: 'linear-gradient(135deg, #667eea, #764ba2)' },
  { id: 'hymns', icon: <BookOpen size={18} />, gradient: 'linear-gradient(135deg, #f093fb, #f5576c)' },
  { id: 'instrumental', icon: <Guitar size={18} />, gradient: 'linear-gradient(135deg, #4facfe, #00f2fe)' },
  { id: 'kids', icon: <Baby size={18} />, gradient: 'linear-gradient(135deg, #43e97b, #38f9d7)' },
  { id: 'prayer', icon: <Heart size={18} />, gradient: 'linear-gradient(135deg, #fa709a, #fee140)' },
];

const PLAYLISTS = {
  worship: [
    { id: 'hMrJLbPsTjA', title: 'Eu Navegarei', artist: 'Nivea Soares' },
    { id: 'rgzRZQ1mOEo', title: 'Quao Grande E o Meu Deus', artist: 'Soraya Moraes' },
    { id: 'HcYTm8QBjHk', title: 'Deus e Deus', artist: 'Delino Marcal' },
    { id: 'tKr-mfTfgCQ', title: 'Ninguem Explica Deus', artist: 'Preto no Branco' },
    { id: 'oMKGHOoByMQ', title: 'Raridade', artist: 'Anderson Freire' },
    { id: 'DL7YkJFpkHo', title: 'Oceanos (Portugues)', artist: 'Hillsong' },
    { id: 'KVQnWr4YUZA', title: 'Sou Feliz', artist: 'Fernandinho' },
    { id: 'OJfRVL3Rs_A', title: 'Lugar Secreto', artist: 'Gabriela Rocha' },
    { id: '3F1kR6PBEsg', title: 'Bondade de Deus', artist: 'Isaias Saad' },
  ],
  hymns: [
    { id: 'kkPGZfJjlyY', title: 'Amazing Grace', artist: 'Hino Classico' },
    { id: 'H3x6x3GCDsE', title: 'Castelo Forte', artist: 'Martinho Lutero' },
    { id: 'sb3C9kZMqKE', title: 'Grandioso Es Tu', artist: 'Hino Classico' },
    { id: 'gHdB2TKQOZE', title: 'Rude Cruz', artist: 'Hino Classico' },
    { id: 'ZqBdyAhRCEU', title: 'Quao Bondoso Amigo', artist: 'Hino Classico' },
  ],
  instrumental: [
    { id: 'fnCGsPaGbzM', title: '3 Horas de Piano Instrumental', artist: 'Worship Piano' },
    { id: 'JjPF0h6t458', title: 'Musica para Oracao - Piano', artist: 'Instrumental' },
    { id: 'XQu8TTBmGhA', title: 'Louvor Instrumental Relaxante', artist: 'Instrumental' },
  ],
  kids: [
    { id: '9sX6P7kPJvQ', title: 'Deus e Bom pra Mim', artist: 'Kids' },
    { id: 'FNNl-EE_czk', title: '3 Palavrinhas', artist: 'DT Kids' },
    { id: 'zD81qe5MNMY', title: 'Meu Barquinho', artist: 'Aline Barros Kids' },
  ],
  prayer: [
    { id: 'Dp3jda7JKZY', title: 'Fundo Musical para Oracao - 1h', artist: 'Prayer Music' },
    { id: 'PBz_JkwM880', title: 'Musica Calma para Orar', artist: 'Prayer Music' },
    { id: 'B1pHcaMRBk0', title: 'Atmosfera de Adoracao', artist: 'Worship' },
  ],
};

export default function MusicLibrary() {
  const { t } = useTranslation();
  const { user, token } = useAuth();
  const [activeCategory, setActiveCategory] = useState('uploaded');
  const [playingId, setPlayingId] = useState(null);
  const [favorites, setFavorites] = useState(() => {
    try { return JSON.parse(localStorage.getItem('music_favs') || '[]'); } catch { return []; }
  });
  const [showFavs, setShowFavs] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadCover, setUploadCover] = useState(null);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadArtist, setUploadArtist] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadedSongs, setUploadedSongs] = useState([]);
  const [loadingSongs, setLoadingSongs] = useState(false);
  const [playingAudio, setPlayingAudio] = useState(null);
  const [autoplay, setAutoplay] = useState(true);
  const audioRef = useRef(null);

  useEffect(() => { fetchUploadedSongs(); }, []);

  async function fetchUploadedSongs() {
    setLoadingSongs(true);
    try {
      const res = await fetch(`${API}/music`);
      const data = await res.json();
      const songs = data.songs;
      setUploadedSongs(Array.isArray(songs) ? songs : songs?.rows || Object.values(songs || {}) || []);
    } catch {}
    finally { setLoadingSongs(false); }
  }

  const categoryLabels = {
    worship: t('music.worship', 'Louvor e Adoracao'),
    hymns: t('music.hymns', 'Hinos Classicos'),
    instrumental: t('music.instrumental', 'Instrumental'),
    kids: t('music.kids', 'Kids Gospel'),
    prayer: t('music.prayer', 'Musica para Oracao'),
    uploaded: t('music.community', 'Comunidade'),
  };

  function toggleFav(videoId) {
    const next = favorites.includes(videoId) ? favorites.filter(f => f !== videoId) : [...favorites, videoId];
    setFavorites(next);
    localStorage.setItem('music_favs', JSON.stringify(next));
  }

  function playYoutube(song) {
    if (audioRef.current) { audioRef.current.pause(); setPlayingAudio(null); }
    setPlayingId(playingId === song.id ? null : song.id);
  }

  function playUploadedSong(song) {
    setPlayingId(null);
    if (playingAudio === song.url) {
      audioRef.current?.pause();
      setPlayingAudio(null);
    } else {
      if (audioRef.current) audioRef.current.pause();
      const audio = new Audio(song.url);
      audio.play();
      audioRef.current = audio;
      setPlayingAudio(song.url);
      audio.onended = () => {
        if (autoplay) {
          const idx = uploadedSongs.findIndex(s => s.url === song.url);
          if (idx >= 0 && idx < uploadedSongs.length - 1) {
            playUploadedSong(uploadedSongs[idx + 1]);
          } else {
            setPlayingAudio(null);
          }
        } else {
          setPlayingAudio(null);
        }
      };
    }
  }

  async function handleUpload() {
    if (!uploadFile || !uploadTitle.trim()) return;
    setUploading(true);
    try {
      // 1. Upload Music (MP3)
      const fd = new FormData();
      fd.append('file', uploadFile);
      fd.append('upload_preset', UPLOAD_PRESET);
      fd.append('folder', 'sigo-com-fe/music');
      fd.append('resource_type', 'video');
      const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/video/upload`, { method: 'POST', body: fd });
      const data = await res.json();
      if (!data.secure_url) {
        alert(t('music.uploadError', 'Erro ao subir arquivo. Tente novamente.'));
        setUploading(false);
        return;
      }

      // 2. Upload Cover (Image) - Optional
      let coverUrl = null;
      if (uploadCover) {
        const coverFd = new FormData();
        coverFd.append('file', uploadCover);
        coverFd.append('upload_preset', UPLOAD_PRESET);
        coverFd.append('resource_type', 'image');
        const coverRes = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, { method: 'POST', body: coverFd });
        const coverData = await coverRes.json();
        coverUrl = coverData.secure_url;
      }

      // 3. Save to Backend
      const saveRes = await fetch(`${API}/music`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ 
            title: uploadTitle.trim(), 
            artist: uploadArtist.trim() || '', 
            url: data.secure_url,
            image_url: coverUrl // New field for cover
        }),
      });
      const saveData = await saveRes.json();
      if (saveData.song) {
        setUploadedSongs(prev => [saveData.song, ...prev]);
        setUploadFile(null);
        setUploadCover(null);
        setUploadTitle('');
        setUploadArtist('');
        setShowUpload(false);
        alert(t('music.uploadSuccess', 'Musica subida com sucesso!'));
      } else {
        alert(t('music.saveError', 'Erro ao salvar musica no banco.'));
      }
    } catch (err) { console.error(err); alert('Erro: ' + err.message); }
    finally { setUploading(false); }
  }

  const allYoutube = Object.values(PLAYLISTS).flat();
  const displaySongs = showFavs
    ? allYoutube.filter(s => favorites.includes(s.id))
    : activeCategory === 'uploaded' ? uploadedSongs : (PLAYLISTS[activeCategory] || []);

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: '0 0 2rem' }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
        padding: '2rem 1.25rem 1.5rem', borderRadius: '0 0 28px 28px',
        position: 'relative', overflow: 'hidden', marginBottom: '1rem',
      }}>
        <div style={{ position: 'absolute', top: -30, right: -30, width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 48, height: 48, borderRadius: 14, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Music size={26} color="#fff" />
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: '#fff' }}>{t('music.title', 'Música Gospel')}</h1>
              <p style={{ margin: 0, fontSize: '0.82rem', color: 'rgba(255,255,255,0.7)' }}>{t('music.subtitle', 'Ouça e suba suas músicas')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Upload button */}
      {token && (
        <div style={{ padding: '0 1rem', marginBottom: '0.75rem' }}>
          <button onClick={() => setShowUpload(!showUpload)} style={{
            width: '100%', padding: '0.7rem', borderRadius: 14, border: '2px dashed rgba(102,126,234,0.4)',
            background: showUpload ? 'rgba(102,126,234,0.15)' : 'rgba(255,255,255,0.04)',
            color: '#667eea', cursor: 'pointer', fontWeight: 700, fontSize: '0.9rem',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}>
            {showUpload ? <X size={18} /> : <Upload size={18} />}
            {showUpload ? t('common.close', 'Fechar') : t('music.uploadBtn', 'Subir Musica (MP3)')}
          </button>
        </div>
      )}

      {/* Upload form */}
      {showUpload && (
        <div style={{ padding: '0 1rem', marginBottom: '1rem' }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: '1.2rem', border: '1px solid #e0e0e0', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>

            {/* Step 1: MP3 */}
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '0.5rem' }}>
                <span style={{ width: 28, height: 28, borderRadius: '50%', background: uploadFile ? '#4caf50' : '#667eea', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.85rem', flexShrink: 0 }}>1</span>
                <span style={{ fontWeight: 600, color: '#333', fontSize: '0.95rem' }}>{t('music.step1', 'Escolha o arquivo de musica')}</span>
              </div>
              <input id="mp3-input" type="file" accept="audio/*,.mp3,.m4a,.wav,.ogg,.aac" onChange={e => setUploadFile(e.target.files?.[0])}
                style={{ position: 'absolute', opacity: 0, width: 0, height: 0 }} />
              <div onClick={() => document.getElementById('mp3-input')?.click()} style={{
                padding: '1.2rem', borderRadius: 12, border: '2px dashed #ccc',
                background: uploadFile ? '#e8f5e9' : '#f9f9f9',
                textAlign: 'center', cursor: 'pointer',
              }}>
                {uploadFile ? (
                  <p style={{ margin: 0, color: '#2e7d32', fontWeight: 600, fontSize: '0.9rem' }}>
                    {uploadFile.name}
                  </p>
                ) : (
                  <>
                    <Music size={36} color="#667eea" style={{ marginBottom: 6 }} />
                    <p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>{t('music.tapToChoose', 'Toque aqui para escolher MP3')}</p>
                  </>
                )}
              </div>
            </div>

            {/* Step 2: Cover (Optional) - NEW */}
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '0.5rem' }}>
                <span style={{ width: 28, height: 28, borderRadius: '50%', background: uploadCover ? '#4caf50' : '#667eea', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.85rem', flexShrink: 0 }}>2</span>
                <span style={{ fontWeight: 600, color: '#333', fontSize: '0.95rem' }}>Capa do Álbum (opcional)</span>
              </div>
              <input id="cover-input" type="file" accept="image/*" onChange={e => setUploadCover(e.target.files?.[0])}
                style={{ position: 'absolute', opacity: 0, width: 0, height: 0 }} />
              <div onClick={() => document.getElementById('cover-input')?.click()} style={{
                padding: '0.8rem', borderRadius: 12, border: '2px dashed #ccc',
                background: uploadCover ? '#e8f5e9' : '#f9f9f9',
                textAlign: 'center', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10
              }}>
                {uploadCover ? (
                  <><ImageIcon size={20} color="#2e7d32" /> <span style={{color: '#2e7d32', fontWeight: 600}}>{uploadCover.name}</span></>
                ) : (
                  <><ImageIcon size={20} color="#667eea" /> <span style={{color: '#666'}}>Escolher Capa (Foto)</span></>
                )}
              </div>
            </div>

            {/* Step 3: Info */}
            <div style={{ marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '0.4rem' }}>
                <span style={{ width: 28, height: 28, borderRadius: '50%', background: uploadTitle.trim() ? '#4caf50' : '#667eea', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.85rem', flexShrink: 0 }}>3</span>
                <span style={{ fontWeight: 600, color: '#333', fontSize: '0.95rem' }}>{t('music.step2', 'Nome da musica')}</span>
              </div>
              <input value={uploadTitle} onChange={e => setUploadTitle(e.target.value)} placeholder={t('music.titlePlaceholder', 'Ex: Grande e o Senhor')} style={{
                width: '100%', padding: '0.7rem 0.85rem', borderRadius: 10, border: '1px solid #ccc',
                background: '#fff', color: '#333', fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box',
              }} />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <input value={uploadArtist} onChange={e => setUploadArtist(e.target.value)} placeholder={t('music.artistPlaceholder', 'Artista (opcional)')} style={{
                width: '100%', padding: '0.7rem 0.85rem', borderRadius: 10, border: '1px solid #ccc',
                background: '#fff', color: '#333', fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box',
              }} />
            </div>

            {/* Step 4: Publish */}
            <div>
              <button onClick={handleUpload} disabled={!uploadFile || !uploadTitle.trim() || uploading} style={{
                width: '100%', padding: '0.8rem', borderRadius: 12, border: 'none',
                background: uploadFile && uploadTitle.trim() ? 'linear-gradient(135deg, #667eea, #764ba2)' : '#e0e0e0',
                color: uploadFile && uploadTitle.trim() ? '#fff' : '#999', fontWeight: 700, fontSize: '1rem', cursor: 'pointer',
              }}>
                {uploading ? t('music.uploading', 'Subindo...') : t('music.uploadBtn', 'Subir Musica')}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Category tabs */}
      <div style={{ display: 'flex', gap: 8, padding: '0 1rem', overflowX: 'auto', marginBottom: '1rem', scrollbarWidth: 'none' }}>
        <button onClick={() => { setActiveCategory('uploaded'); setShowFavs(false); fetchUploadedSongs(); }} style={{
          flexShrink: 0, padding: '8px 14px', borderRadius: 12, border: 'none', cursor: 'pointer',
          background: !showFavs && activeCategory === 'uploaded' ? 'linear-gradient(135deg, #4caf50, #66bb6a)' : 'rgba(255,255,255,0.08)',
          color: !showFavs && activeCategory === 'uploaded' ? '#fff' : '#aaa', fontWeight: 600, fontSize: '0.8rem',
          display: 'flex', alignItems: 'center', gap: 5,
        }}>
          <Upload size={14} /> {t('music.community', 'Comunidade')} ({uploadedSongs.length})
        </button>
        {/* ... (Favs and other categories) */}
      </div>

      {/* Uploaded songs list - Updated to show Cover Art */}
      {activeCategory === 'uploaded' && !showFavs && (
        <div style={{ padding: '0 1rem' }}>
          {/* ... (Autoplay control) */}
          {uploadedSongs.map(song => (
            <div key={song.id} onClick={() => playUploadedSong(song)} style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '0.6rem 0.5rem',
              borderBottom: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer',
              background: playingAudio === song.url ? 'rgba(102,126,234,0.1)' : 'transparent', borderRadius: 12,
            }}>
              {/* Cover Art or Default Icon */}
              <div style={{
                width: 48, height: 48, borderRadius: 10, overflow: 'hidden',
                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                {song.image_url ? (
                    <img src={song.image_url} style={{width:'100%', height:'100%', objectFit:'cover'}} />
                ) : (
                    playingAudio === song.url ? <Pause size={20} color="#fff" /> : <Play size={20} color="#fff" fill="#fff" />
                )}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ color: playingAudio === song.url ? '#667eea' : '#1a0a3e', fontWeight: 600, fontSize: '0.85rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {song.title}
                </div>
                <div style={{ color: '#666', fontSize: '0.75rem' }}>{song.artist}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
