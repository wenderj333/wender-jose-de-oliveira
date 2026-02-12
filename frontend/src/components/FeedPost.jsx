import React, { useState } from 'react';
import { Heart, MessageCircle, Share2, Video, Image, BookOpen, Award, Play } from 'lucide-react';

const TYPE_STYLES = {
  testemunho: { borderColor: 'var(--gold)', icon: Award, iconColor: 'var(--gold)' },
  louvor: { borderColor: 'var(--primary)', icon: Video, iconColor: 'var(--primary)' },
  foto: { borderColor: 'var(--green)', icon: Image, iconColor: 'var(--green)' },
  versiculo: { borderColor: 'var(--gold)', icon: BookOpen, iconColor: 'var(--gold-dark)' },
  reflexao: { borderColor: 'var(--gray-500)', icon: BookOpen, iconColor: 'var(--primary)' },
};

export default function FeedPost({ post }) {
  const [amem, setAmem] = useState(false);
  const [amemCount, setAmemCount] = useState(post.amemCount || 0);

  const style = TYPE_STYLES[post.type] || TYPE_STYLES.reflexao;
  const TypeIcon = style.icon;

  const toggleAmem = () => {
    setAmem(!amem);
    setAmemCount(prev => amem ? prev - 1 : prev + 1);
  };

  const renderContent = () => {
    switch (post.type) {
      case 'louvor':
        return (
          <div className="feed-post__video-placeholder">
            <Play size={48} />
            <span>Toque para assistir</span>
            {post.content && <p className="feed-post__text">{post.content}</p>}
          </div>
        );
      case 'foto':
        return (
          <div className="feed-post__image-placeholder">
            <Image size={48} />
            <span>Foto</span>
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
        <div className="feed-post__avatar" style={{ background: style.borderColor }}>
          {post.authorInitials}
        </div>
        <div className="feed-post__author-info">
          <span className="feed-post__author-name">{post.authorName}</span>
          <span className="feed-post__author-church">{post.church}</span>
        </div>
        <div className="feed-post__meta">
          <TypeIcon size={16} style={{ color: style.iconColor }} />
          <span className="feed-post__time">{post.time}</span>
        </div>
      </div>

      <div className="feed-post__content">
        {renderContent()}
      </div>

      <div className="feed-post__footer">
        <button className={`feed-post__amem-btn ${amem ? 'feed-post__amem-btn--active' : ''}`} onClick={toggleAmem}>
          <Heart size={18} fill={amem ? 'var(--gold)' : 'none'} />
          <span>Amém {amemCount > 0 && `(${amemCount})`}</span>
        </button>
        <button className="feed-post__action-btn">
          <MessageCircle size={18} />
          <span>{post.commentCount || 0}</span>
        </button>
        <button className="feed-post__action-btn">
          <Share2 size={18} />
          <span>Partilhar</span>
        </button>
      </div>
    </article>
  );
}
