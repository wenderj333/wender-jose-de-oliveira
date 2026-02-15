import React from 'react';
import { useMusic } from '../context/MusicContext';
import { X, ChevronDown, ChevronUp, Music } from 'lucide-react';

export default function MusicPlayer() {
  const { currentSong, isMinimized, stopSong, toggleMinimize } = useMusic();

  if (!currentSong) return null;

  // Minimized bar at bottom
  if (isMinimized) {
    return (
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 9990,
        background: 'linear-gradient(135deg, #1e1e3f, #2d1569)',
        borderTop: '1px solid rgba(102,126,234,0.3)',
        padding: '0.5rem 1rem',
        display: 'flex', alignItems: 'center', gap: 10,
        boxShadow: '0 -4px 20px rgba(0,0,0,0.4)',
      }}>
        {/* Thumbnail */}
        <div style={{
          width: 40, height: 40, borderRadius: 8, overflow: 'hidden', flexShrink: 0,
          background: '#000',
        }}>
          <img src={`https://img.youtube.com/vi/${currentSong.id}/mqdefault.jpg`}
            alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>

        {/* Song info */}
        <div style={{ flex: 1, minWidth: 0 }} onClick={toggleMinimize}>
          <div style={{
            color: '#fff', fontSize: '0.82rem', fontWeight: 600,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {currentSong.title}
          </div>
          <div style={{ color: '#888', fontSize: '0.72rem' }}>{currentSong.artist}</div>
        </div>

        {/* Animated bars */}
        <div style={{ display: 'flex', gap: 2, alignItems: 'flex-end', height: 16, marginRight: 4 }}>
          {[0, 1, 2].map(i => (
            <div key={i} style={{
              width: 3, background: '#667eea', borderRadius: 2,
              animation: `musicBar 0.6s ${i * 0.15}s ease-in-out infinite alternate`,
            }} />
          ))}
        </div>

        {/* Expand button */}
        <button onClick={toggleMinimize} style={{
          background: 'none', border: 'none', color: '#aaa', cursor: 'pointer', padding: 4,
        }}>
          <ChevronUp size={20} />
        </button>

        {/* Close button */}
        <button onClick={stopSong} style={{
          background: 'none', border: 'none', color: '#666', cursor: 'pointer', padding: 4,
        }}>
          <X size={18} />
        </button>

        <style>{`
          @keyframes musicBar {
            0% { height: 4px; }
            100% { height: 16px; }
          }
        `}</style>
      </div>
    );
  }

  // Expanded player (small floating window)
  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 9990,
      background: 'linear-gradient(180deg, #1e1e3f, #12122b)',
      borderTop: '1px solid rgba(102,126,234,0.3)',
      boxShadow: '0 -8px 30px rgba(0,0,0,0.5)',
      borderRadius: '20px 20px 0 0',
      maxHeight: '45vh',
      display: 'flex', flexDirection: 'column',
    }}>
      {/* Handle bar */}
      <div style={{
        display: 'flex', justifyContent: 'center', padding: '8px 0 4px',
      }}>
        <div style={{ width: 36, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.2)' }} />
      </div>

      {/* Top controls */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 1rem 0.5rem',
      }}>
        <button onClick={toggleMinimize} style={{
          background: 'none', border: 'none', color: '#aaa', cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.8rem',
        }}>
          <ChevronDown size={18} /> Minimizar
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Music size={14} color="#667eea" />
          <span style={{ color: '#667eea', fontSize: '0.75rem', fontWeight: 600 }}>TOCANDO</span>
        </div>
        <button onClick={stopSong} style={{
          background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.8rem',
        }}>
          Fechar
        </button>
      </div>

      {/* YouTube embed */}
      <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, margin: '0 0.75rem' }}>
        <iframe
          src={`https://www.youtube.com/embed/${currentSong.id}?autoplay=1&rel=0`}
          style={{
            position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
            border: 'none', borderRadius: 12,
          }}
          allow="autoplay; encrypted-media"
          allowFullScreen
          title={currentSong.title}
        />
      </div>

      {/* Song info */}
      <div style={{ padding: '0.75rem 1rem 1rem', textAlign: 'center' }}>
        <div style={{ color: '#fff', fontWeight: 700, fontSize: '0.95rem' }}>{currentSong.title}</div>
        <div style={{ color: '#888', fontSize: '0.82rem', marginTop: 2 }}>{currentSong.artist}</div>
      </div>
    </div>
  );
}
