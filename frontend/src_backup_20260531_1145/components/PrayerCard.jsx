import React from 'react';
import { useTranslation } from 'react-i18next';
import AmemButton from './AmemButton';
import { Church, HandHeart, Sparkles, AlertTriangle, Heart, Stethoscope, Briefcase, Users, GraduationCap, Home, HeartCrack, Scale, Star } from 'lucide-react';

const CATEGORY_ICONS = {
  health: Stethoscope,
  work_finance: Briefcase,
  family: Users,
  studies: GraduationCap,
  housing: Home,
  emotional: HeartCrack,
  decisions: Scale,
  other: Star,
};

export default function PrayerCard({ prayer, onPray, user }) {
  const { t } = useTranslation();

  const initials = (prayer.author_name || '?')
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const timeAgo = (date) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return t('prayerCard.timeAgo.min', { count: mins });
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return t('prayerCard.timeAgo.hour', { count: hrs });
    const days = Math.floor(hrs / 24);
    return t('prayerCard.timeAgo.day', { count: days });
  };

  const CatIcon = CATEGORY_ICONS[prayer.category] || CATEGORY_ICONS.other;
  const catLabel = t(`prayerCard.categories.${prayer.category || 'other'}`);
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
        {catLabel}
      </span>

      {prayer.is_urgent && (
        <span style={{ marginLeft: '0.5rem', color: 'var(--red)', fontWeight: 700, fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
          <AlertTriangle size={14} /> {t('prayerCard.urgent')}
        </span>
      )}

      {prayer.title && <h4 style={{ color: 'var(--green-dark)', margin: '0.5rem 0' }}>{prayer.title}</h4>}
      <p className="prayer-card__content">{prayer.content}</p>

      {prayer.is_answered && prayer.answered_testimony && (
        <div style={{ background: 'var(--gold-pale)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', marginTop: '0.75rem' }}>
          <strong style={{ color: 'var(--gold-dark)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <Sparkles size={16} /> {t('prayerCard.testimony')}
          </strong>
          <p style={{ marginTop: '0.25rem' }}>{prayer.answered_testimony}</p>
        </div>
      )}

      <div className="prayer-card__footer">
        <span className="prayer-card__count" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <HandHeart size={16} style={{ color: 'var(--green)' }} />
          {t('prayerCard.personPraying', { count: prayer.prayer_count || 0 })}
        </span>
        {user && !prayer.is_answered && (
          <AmemButton onClick={() => onPray(prayer.id)} />
        )}
      </div>
    </div>
  );
}
