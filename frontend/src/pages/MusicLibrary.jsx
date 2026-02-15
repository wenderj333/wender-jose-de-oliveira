import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Music, Play, Headphones, Heart, ChevronRight, Radio, Mic2, Baby, BookOpen, Guitar } from 'lucide-react';

const CATEGORIES = [
  { id: 'worship', icon: <Mic2 size={20} />, gradient: 'linear-gradient(135deg, #667eea, #764ba2)' },
  { id: 'hymns', icon: <BookOpen size={20} />, gradient: 'linear-gradient(135deg, #f093fb, #f5576c)' },
  { id: 'instrumental', icon: <Guitar size={20} />, gradient: 'linear-gradient(135deg, #4facfe, #00f2fe)' },
  { id: 'kids', icon: <Baby size={20} />, gradient: 'linear-gradient(135deg, #43e97b, #38f9d7)' },
  { id: 'prayer', icon: <Heart size={20} />, gradient: 'linear-gradient(135deg, #fa709a, #fee140)' },
];

// YouTube video IDs — curated free worship music
const PLAYLISTS = {
  worship: [
    { id: 'hMrJLbPsTjA', title: 'Eu Navegarei — Nívea Soares', artist: 'Nívea Soares' },
    { id: 'rgzRZQ1mOEo', title: 'Quão Grande É o Meu Deus', artist: 'Soraya Moraes' },
    { id: 'HcYTm8QBjHk', title: 'Deus é Deus — Delino Marçal', artist: 'Delino Marçal' },
    { id: 'tKr-mfTfgCQ', title: 'Ninguém Explica Deus — Preto no Branco', artist: 'Preto no Branco' },
    { id: 'oMKGHOoByMQ', title: 'Raridade — Anderson Freire', artist: 'Anderson Freire' },
    { id: 'DL7YkJFpkHo', title: 'Oceanos — Hillsong (Português)', artist: 'Hillsong' },
    { id: 'KVQnWr4YUZA', title: 'Sou Feliz — Fernandinho', artist: 'Fernandinho' },
    { id: 'Y5G6gL2eBhI', title: 'Todavia Me Alegrarei — Thalles Roberto', artist: 'Thalles Roberto' },
    { id: 'OJfRVL3Rs_A', title: 'Lugar Secreto — Gabriela Rocha', artist: 'Gabriela Rocha' },
    { id: '3F1kR6PBEsg', title: 'Bondade de Deus — Isaías Saad', artist: 'Isaías Saad' },
  ],
  hymns: [
    { id: 'kkPGZfJjlyY', title: 'Amazing Grace', artist: 'Hino Clássico' },
    { id: 'H3x6x3GCDsE', title: 'Castelo Forte — Martinho Lutero', artist: 'Hino Clássico' },
    { id: 'sb3C9kZMqKE', title: 'Grandioso És Tu', artist: 'Hino Clássico' },
    { id: 'gHdB2TKQOZE', title: 'Rude Cruz', artist: 'Hino Clássico' },
    { id: 'ZqBdyAhRCEU', title: 'Quão Bondoso Amigo', artist: 'Hino Clássico' },
    { id: 'P5AkNqLuVgY', title: 'Santo Santo Santo', artist: 'Hino Clássico' },
  ],
  instrumental: [
    { id: 'fnCGsPaGbzM', title: '3 Horas de Piano Instrumental Cristão', artist: 'Worship Piano' },
    { id: 'JjPF0h6t458', title: 'Música para Oração — Piano', artist: 'Instrumental Worship' },
    { id: 'XQu8TTBmGhA', title: 'Louvor Instrumental Relaxante', artist: 'Worship Instrumental' },
    { id: '1ZYbU82GVz4', title: 'Flauta e Piano — Hinos', artist: 'Instrumental Gospel' },
  ],
  kids: [
    { id: '9sX6P7kPJvQ', title: 'Deus é Bom pra Mim — Crianças', artist: 'Música Kids' },
    { id: 'FNNl-EE_czk', title: '3 Palavrinhas — Diante do Trono Kids', artist: 'DT Kids' },
    { id: 'zD81qe5MNMY', title: 'Meu Barquinho — Crianças', artist: 'Aline Barros Kids' },
    { id: 'Gl9GtO_vQxw', title: 'Deus Cuida de Mim', artist: 'Infantil Gospel' },
  ],
  prayer: [
    { id: 'Dp3jda7JKZY', title: 'Fundo Musical para Oração — 1 Hora', artist: 'Worship Prayer' },
    { id: 'PBz_JkwM880', title: 'Música Calma para Orar', artist: 'Prayer Music' },
    { id: 'B1pHcaMRBk0', title: 'Atmosfera de Adoração', artist: 'Worship Atmosphere' },
    { id: 'G1iFczxpBEM', title: 'Soaking — Imersão na Presença', artist: 'Soaking Worship' },
  ],
};

export default function MusicLibrary() {
  const { t } = useTranslation();
  const [activeCategory, setActiveCategory] = useState('worship');
  const [playingVideo, setPlayingVideo] = useState(null);
  const [favorites, setFavorites] = useState(() => {
    try { return JSON.parse(localStorage.getItem('music_favs') || '[]'); } catch { return []; }
  });
  const [showFavs, setShowFavs] = useState(false);

  const categoryLabels = {
    worship: t('music.worship', 'Louvor & Adoração'),
    hymns: t('music.hymns', 'Hinos Clássicos'),
    instrumental: t('music.instrumental', 'Instrumental'),
    kids: t('music.kids', 'Kids Gospel'),
    prayer: t('music.prayer', 'Música para Oração'),
  };

  function toggleFav(videoId) {
    const next = favorites.includes(videoId)
      ? favorites.filter(f => f !== videoId)
      : [...favorites, videoId];
    setFavorites(next);
    localStorage.setItem('music_favs', JSON.stringify(next));
  }

  const allSongs = Object.values(PLAYLISTS).flat();
  const displaySongs = showFavs
    ? allSongs.filter(s => favorites.includes(s.id))
    : PLAYLISTS[activeCategory] || [];

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: '0 0 2rem' }}>

      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
        padding: '2rem 1.25rem 1.5rem',
        borderRadius: '0 0 28px 28px',
        position: 'relative', overflow: 'hidden',
        marginBottom: '1rem',
      }}>
        <div style={{ position: 'absolute', top: -30, right: -30, width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
        <div style={{ position: 'absolute', bottom: -20, left: 20, width: 60, height: 60, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '0.5rem' }}>
            <div style={{
              width: 48, height: 48, borderRadius: 14, background: 'rgba(255,255,255,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              backdropFilter: 'blur(10px)',
            }}>
              <Music size={26} color="#fff" />
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: '#fff' }}>
                {t('music.title', 'Biblioteca Musical')}
              </h1>
              <p style={{ margin: 0, fontSize: '0.82rem', color: 'rgba(255,255,255,0.7)' }}>
                {t('music.subtitle', 'Louvor e adoração 100% gratuitos')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Category tabs - horizontal scroll */}
      <div style={{
        display: 'flex', gap: 10, padding: '0 1rem', overflowX: 'auto',
        WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none', marginBottom: '1rem',
      }}>
        {/* Favorites button */}
        <button onClick={() => setShowFavs(!showFavs)} style={{
          flexShrink: 0, padding: '10px 16px', borderRadius: 14, border: 'none', cursor: 'pointer',
          background: showFavs ? 'linear-gradient(135deg, #ef4444, #f97316)' : 'rgba(255,255,255,0.08)',
          color: showFavs ? '#fff' : '#aaa', fontWeight: 600, fontSize: '0.82rem',
          display: 'flex', alignItems: 'center', gap: 6, transition: 'all 0.3s',
        }}>
          <Heart size={16} fill={showFavs ? '#fff' : 'none'} /> {t('music.favorites', 'Favoritos')}
          {favorites.length > 0 && (
            <span style={{
              background: 'rgba(255,255,255,0.25)', borderRadius: 10, padding: '1px 7px',
              fontSize: '0.7rem', fontWeight: 700,
            }}>{favorites.length}</span>
          )}
        </button>

        {CATEGORIES.map(cat => (
          <button key={cat.id} onClick={() => { setActiveCategory(cat.id); setShowFavs(false); }} style={{
            flexShrink: 0, padding: '10px 16px', borderRadius: 14, border: 'none', cursor: 'pointer',
            background: !showFavs && activeCategory === cat.id ? cat.gradient : 'rgba(255,255,255,0.08)',
            color: !showFavs && activeCategory === cat.id ? '#fff' : '#aaa',
            fontWeight: 600, fontSize: '0.82rem',
            display: 'flex', alignItems: 'center', gap: 6, transition: 'all 0.3s',
          }}>
            {cat.icon} {categoryLabels[cat.id]}
          </button>
        ))}
      </div>

      {/* Now playing */}
      {playingVideo && (
        <div style={{
          margin: '0 1rem 1rem', borderRadius: 16, overflow: 'hidden',
          boxShadow: '0 8px 32px rgba(102,126,234,0.3)',
          border: '1px solid rgba(102,126,234,0.3)',
        }}>
          <div style={{
            position: 'relative', paddingBottom: '56.25%', height: 0,
          }}>
            <iframe
              src={`https://www.youtube.com/embed/${playingVideo.id}?autoplay=1&rel=0`}
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
              allow="autoplay; encrypted-media"
              allowFullScreen
              title={playingVideo.title}
            />
          </div>
          <div style={{
            padding: '0.75rem 1rem',
            background: 'linear-gradient(135deg, rgba(102,126,234,0.15), rgba(118,75,162,0.15))',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div>
              <div style={{ color: '#fff', fontWeight: 700, fontSize: '0.9rem' }}>{playingVideo.title}</div>
              <div style={{ color: '#aaa', fontSize: '0.78rem' }}>{playingVideo.artist}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Radio size={16} color="#667eea" className="pulse-icon" />
              <span style={{ color: '#667eea', fontSize: '0.75rem', fontWeight: 600 }}>AO VIVO</span>
            </div>
          </div>
        </div>
      )}

      {/* Song list */}
      <div style={{ padding: '0 1rem' }}>
        {showFavs && displaySongs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#666' }}>
            <Heart size={48} style={{ opacity: 0.3, marginBottom: '0.75rem' }} />
            <p style={{ margin: 0, fontSize: '0.95rem' }}>{t('music.noFavorites', 'Nenhum favorito ainda')}</p>
            <p style={{ margin: '0.3rem 0 0', fontSize: '0.82rem', color: '#555' }}>
              {t('music.tapHeart', 'Toque no ❤️ para salvar músicas')}
            </p>
          </div>
        ) : (
          displaySongs.map((song, idx) => (
            <div key={song.id} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '0.75rem 0.5rem',
              borderBottom: '1px solid rgba(255,255,255,0.05)',
              borderRadius: 12,
              cursor: 'pointer',
              background: playingVideo?.id === song.id ? 'rgba(102,126,234,0.1)' : 'transparent',
              transition: 'background 0.2s',
            }}>
              {/* Thumbnail / Play button */}
              <div onClick={() => setPlayingVideo(song)} style={{
                width: 52, height: 52, borderRadius: 12, overflow: 'hidden',
                position: 'relative', flexShrink: 0,
                background: '#1a1a2e',
              }}>
                <img
                  src={`https://img.youtube.com/vi/${song.id}/mqdefault.jpg`}
                  alt=""
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  loading="lazy"
                />
                <div style={{
                  position: 'absolute', inset: 0,
                  background: playingVideo?.id === song.id ? 'rgba(102,126,234,0.5)' : 'rgba(0,0,0,0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {playingVideo?.id === song.id ? (
                    <div style={{ display: 'flex', gap: 2, alignItems: 'flex-end', height: 16 }}>
                      {[0, 1, 2].map(i => (
                        <div key={i} style={{
                          width: 3, background: '#fff', borderRadius: 2,
                          animation: `musicBar 0.6s ${i * 0.15}s ease-in-out infinite alternate`,
                        }} />
                      ))}
                    </div>
                  ) : (
                    <Play size={20} color="#fff" fill="#fff" />
                  )}
                </div>
              </div>

              {/* Song info */}
              <div onClick={() => setPlayingVideo(song)} style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  color: playingVideo?.id === song.id ? '#667eea' : '#fff',
                  fontWeight: 600, fontSize: '0.88rem',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {song.title}
                </div>
                <div style={{ color: '#888', fontSize: '0.78rem', marginTop: 2 }}>{song.artist}</div>
              </div>

              {/* Favorite button */}
              <button onClick={(e) => { e.stopPropagation(); toggleFav(song.id); }} style={{
                background: 'none', border: 'none', cursor: 'pointer', padding: 6, flexShrink: 0,
              }}>
                <Heart
                  size={20}
                  color={favorites.includes(song.id) ? '#ef4444' : '#555'}
                  fill={favorites.includes(song.id) ? '#ef4444' : 'none'}
                  style={{ transition: 'all 0.2s' }}
                />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Free music sources */}
      <div style={{
        margin: '1.5rem 1rem 0', padding: '1rem', borderRadius: 16,
        background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
      }}>
        <h3 style={{ margin: '0 0 0.75rem', color: '#667eea', fontSize: '0.85rem', fontWeight: 700 }}>
          🎵 {t('music.freeSources', 'Mais música gratuita')}
        </h3>
        {[
          { name: 'Vagalume Gospel', url: 'https://www.vagalume.com.br/browse/style/gospel.html', desc: 'Letras de louvor' },
          { name: 'YouTube Worship', url: 'https://www.youtube.com/results?search_query=louvor+e+adoração+playlist', desc: 'Playlists no YouTube' },
          { name: 'Pixabay Music', url: 'https://pixabay.com/music/search/worship/', desc: 'Música sem direitos autorais' },
          { name: 'Free Music Archive', url: 'https://freemusicarchive.org/genre/Gospel', desc: 'Música gospel gratuita' },
        ].map((source, i) => (
          <a key={i} href={source.url} target="_blank" rel="noopener noreferrer" style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '0.6rem 0', borderBottom: i < 3 ? '1px solid rgba(255,255,255,0.05)' : 'none',
            textDecoration: 'none', color: '#ccc',
          }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{source.name}</div>
              <div style={{ fontSize: '0.75rem', color: '#888' }}>{source.desc}</div>
            </div>
            <ChevronRight size={16} color="#667eea" />
          </a>
        ))}
      </div>

      {/* CSS animations */}
      <style>{`
        @keyframes musicBar {
          0% { height: 4px; }
          100% { height: 16px; }
        }
        @keyframes pulse-glow {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        .pulse-icon { animation: pulse-glow 1.5s ease-in-out infinite; }
      `}</style>
    </div>
  );
}
