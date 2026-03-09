import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Heart, MessageCircle, Share2, Video, Image, BookOpen, Award, Play, Volume2, VolumeX } from 'lucide-react';

const TYPE_STYLES = {
  testemunho: { borderColor: 'var(--gold)', icon: Award, iconColor: 'var(--gold)' },
  louvor: { borderColor: 'var(--primary)', icon: Video, iconColor: 'var(--primary)' },
  foto: { borderColor: 'var(--green)', icon: Image, iconColor: 'var(--green)' },
  versiculo: { borderColor: 'var(--gold)', icon: BookOpen, iconColor: 'var(--gold-dark)' },
  reflexao: { borderColor: 'var(--gray-500)', icon: BookOpen, iconColor: 'var(--primary)' },
};

export default function FeedPost({ post }) {
  const { t } = useTranslation();
  const [amem, setAmem] = useState(false);
  const [amemCount, setAmemCount] = useState(post.amemCount || 0);
  const [isMuted, setIsMuted] = useState(true); // Default: muted
  const videoRef = useRef(null);

  const style = TYPE_STYLES[post.type] || TYPE_STYLES.reflexao;
  const TypeIcon = style.icon;

  const toggleAmem = () => {
    setAmem(!amem);
    setAmemCount(prev => amem ? prev - 1 : prev + 1);
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
    }
  };

  useEffect(() => {
    if (post.media_url && post.type === 'louvor') {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (videoRef.current) {
            if (entry.isIntersecting) {
              videoRef.current.play().catch(e => console.error("Video play failed:", e));
            } else {
              videoRef.current.pause();
            }
          }
        },
        { threshold: 0.7 } // Adjust as needed: 70% of video in view
      );

      if (videoRef.current) {
        observer.observe(videoRef.current);
      }

      return () => {
        if (videoRef.current) {
          observer.unobserve(videoRef.current);
        }
      };
    }
  }, [post.media_url, post.type]); // Re-run if post or media changes

  const renderContent = () => {
    switch (post.type) {
      case 'louvor':
        return (
          <div className="feed-post__media-container">
            <video
              ref={videoRef}
              src={post.media_url}
              loop
              muted={isMuted} // Controlled by state
              playsInline
              controls={false} // Custom controls
              className="feed-post__video"
            />
            <button
              onClick={toggleMute}
              style={{
                position: 'absolute', bottom: '10px', right: '10px',
                background: 'rgba(0,0,0,0.6)', border: 'none', borderRadius: '50%',
                width: '36px', height: '36px', display: 'flex', alignItems: 'center',
                justifyContent: 'center', cursor: 'pointer', zIndex: 10,
                color: 'white',
              }}
            >
              {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
            </button>
            {post.content && <p className="feed-post__text">{post.content}</p>}
          </div>
        );
      case 'foto':
        return (
          <div className="feed-post__media-container">
            <img src={post.media_url} alt="Foto do post" className="feed-post__image" />
            {post.content && <p className="feed-post__text">{post.content}</p>}
          </div>
        );
      case 'versiculo':
        return (
          <div className="feed-post__verse-card">
            <span className="feed-post__verse-quote">&ldquo;</span>
            <p className="feed-post__verse-text">{post.content}</p>
            {post.reference && <span className="feed-post__verse-ref">{post.reference}</span>}
            <span className="feed-post__verse-quote feed-post__verse-quote--end">&rdquo;</span>
          </div>
        );
      default:
        return <p className="feed-post__text">{post.content}</p>;
    }
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

      <div className="feed-post__content">{renderContent()}</div>

      <div className="feed-post__footer">
        <button className={`feed-post__amem-btn ${amem ? 'feed-post__amem-btn--active' : ''}`} onClick={toggleAmem}>
          <Heart size={18} fill={amem ? 'var(--gold)' : 'none'} />
          <span>{t('feedPost.amem')} {amemCount > 0 && `(${amemCount})`}</span>
        </button>
        <button className="feed-post__action-btn">
          <MessageCircle size={18} />
          <span>{post.commentCount || 0}</span>
        </button>
        <button className="feed-post__action-btn">
          <Share2 size={18} />
          <span>{t('feedPost.share')}</span>
        </button>
      </div>
    </article>
  );
}
