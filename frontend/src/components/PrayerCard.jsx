import React from 'react';
import AmemButton from './AmemButton';
import { Church, HandHeart, Sparkles, AlertTriangle, Heart, Stethoscope, Briefcase, Users, GraduationCap, Home, HeartCrack, Scale, Star } from 'lucide-react';

const CATEGORY_CONFIG = {
  health: { label: 'Saúde', icon: Stethoscope },
  work_finance: { label: 'Trabalho/Finanças', icon: Briefcase },
  family: { label: 'Família', icon: Users },
  studies: { label: 'Estudos', icon: GraduationCap },
  housing: { label: 'Moradia', icon: Home },
  emotional: { label: 'Emocional', icon: HeartCrack },
  decisions: { label: 'Decisões', icon: Scale },
  other: { label: 'Outros', icon: Star },
};

export default function PrayerCard({ prayer, onPray, user }) {
  const initials = (prayer.author_name || '?')
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const timeAgo = (date) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}min atrás`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h atrás`;
    const days = Math.floor(hrs / 24);
    return `${days}d atrás`;
  };

  const catConfig = CATEGORY_CONFIG[prayer.category] || CATEGORY_CONFIG.other;
  const CatIcon = catConfig.icon;
  const cardClass = `card prayer-card${prayer.is_urgent ? ' urgent' : ''}${prayer.is_answered ? ' answered' : ''}`;

  return (
    <div className={cardClass}>
      <div className="prayer-card__header">
        <div className="prayer-card__avatar">{initials}</div>
        <div>
          <div className="prayer-card__author">{prayer.author_name}</div>
          <div className="prayer-card__church">
            {prayer.church_name && (<><Church size={12} style={{ verticalAlign: 'middle' }} /> {prayer.church_name} · </>)}
            {timeAgo(prayer.created_at)}
          </div>
        </div>
      </div>

      <span className="prayer-card__category">
        <CatIcon size={12} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
        {catConfig.label}
      </span>

      {prayer.is_urgent && (
        <span style={{ marginLeft: '0.5rem', color: 'var(--red)', fontWeight: 700, fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
          <AlertTriangle size={14} /> URGENTE
        </span>
      )}

      {prayer.title && <h4 style={{ color: 'var(--green-dark)', margin: '0.5rem 0' }}>{prayer.title}</h4>}
      <p className="prayer-card__content">{prayer.content}</p>

      {prayer.is_answered && prayer.answered_testimony && (
        <div style={{ background: 'var(--gold-pale)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', marginTop: '0.75rem' }}>
          <strong style={{ color: 'var(--gold-dark)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <Sparkles size={16} /> Testemunho:
          </strong>
          <p style={{ marginTop: '0.25rem' }}>{prayer.answered_testimony}</p>
        </div>
      )}

      <div className="prayer-card__footer">
        <span className="prayer-card__count" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <HandHeart size={16} style={{ color: 'var(--green)' }} />
          {prayer.prayer_count || 0} {prayer.prayer_count === 1 ? 'pessoa orando' : 'pessoas orando'}
        </span>
        {user && !prayer.is_answered && (
          <AmemButton onClick={() => onPray(prayer.id)} />
        )}
      </div>
    </div>
  );
}
