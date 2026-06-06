import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Heart, MessageCircle, Share2, Video, Image, BookOpen, Award, Play, Music } from 'lucide-react';

const TYPE_STYLES = {
  testemunho: { borderColor: 'var(--gold)', icon: Award, iconColor: 'var(--gold)' },
  louvor: { borderColor: 'var(--primary)', icon: Video, iconColor: 'var(--primary)' },
  foto: { borderColor: 'var(--green)', icon: Image, iconColor: 'var(--green)' },
  versiculo: { borderColor: 'var(--gold)', icon: BookOpen, iconColor: 'var(--gold-dark)' },
  reflexao: { borderColor: 'var(--gray-500)', icon: BookOpen, iconColor: 'var(--primary)' },
};

// Adicionamos onImageClick para abrir o Zoom
export default function FeedPost({ post, isPlaying, onVideoPlay, onImageClick }) {
  const { t } = useTranslation();
  const audioRef = useRef(null);
  const [amem, setAmem] = useState(false);
  const [amemCount, setAmemCount] = useState(post.amemCount || 0);

  const style = TYPE_STYLES[post.type] || TYPE_STYLES.reflexao;
  const TypeIcon = style.icon;

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(err => console.log("Erro áudio:", err));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying]);

  const renderContent = () => {
    if (post.type === 'louvor' || post.video_url) {
      return (
        <div className="feed-post__media" onClick={() => onVideoPlay(post.id)}>
          <video src={post.video_url} className="feed-post__video" poster={post.thumbnail_url} />
          {!isPlaying && <Play className="feed-post__play-icon" size={48} />}
        </div>
      );
    }

    if (post.type === 'foto' || post.image_url) {
      return (
        <div className="feed-post__media" onClick={() => onImageClick && onImageClick(post.image_url)}>
          <img 
            src={post.image_url} 
            alt="Post" 
            className="feed-post__image" 
            style={{ cursor: 'zoom-in' }} 
          />
        </div>
      );
    }

    if (post.type === 'versiculo') {
      return (
        <div className="feed-post__verse-card">
          <p className="feed-post__verse-text">{post.content}</p>
          {post.reference && <span className="feed-post__verse-ref">{post.reference}</span>}
        </div>
      );
    }

    return <p className="feed-post__text">{post.content}</p>;
  };

  return (
    <article className={`feed-post feed-post--${post.type}`} style={{ borderLeftColor: style.borderColor }}>
      <div className="feed-post__header">
        <div className="feed-post__avatar" style={{ background: style.borderColor }}>{post.authorInitials}</div>
        <div className="feed-post__author-info">
          <span className="feed-post__author-name">{post.authorName}</span>
          <span className="feed-post__author-church">{post.church}</span>
        </div>
        <div className="feed-post__meta">
          <TypeIcon size={16} style={{ color: style.iconColor }} />
          <span className="feed-post__time">{post.time}</span>
        </div>
      </div>

      <div className="feed-post__content" style={{ position: 'relative' }}>
        {renderContent()}
        
        {post.bg_music_url && (
          <div 
            onClick={(e) => { e.stopPropagation(); onVideoPlay(isPlaying ? null : post.id); }}
            style={{ 
              position: 'absolute', bottom: '15px', right: '15px', zIndex: 10,
              background: 'rgba(0,0,0,0.5)', padding: '8px', borderRadius: '50%', 
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}
          >
            <Music size={16} color="#fff" className={isPlaying ? "animate-spin" : ""} />
            <audio ref={audioRef} src={post.bg_music_url} loop />
          </div>
        )}
      </div>

      <div className="feed-post__footer">
        <button className="feed-post__action-btn" onClick={() => { setAmem(!amem); setAmemCount(prev => amem ? prev - 1 : prev + 1); }}>
          <Heart size={18} fill={amem ? 'var(--gold)' : 'none'} color={amem ? 'var(--gold)' : 'currentColor'} />
          <span>{t('feedPost.amem')} ({amemCount})</span>
        </button>
        <button className="feed-post__action-btn"><MessageCircle size={18} /> <span>{post.commentCount || 0}</span></button>
        <button className="feed-post__action-btn"><Share2 size={18} /></button>
      </div>
    </article>
  );
}

