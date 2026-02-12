import React, { useState } from 'react';
import { BookOpen, MapPin, Building2, Phone, User, Users, Navigation, Heart, Share2 } from 'lucide-react';

export default function ChurchPin({ church }) {
  const [following, setFollowing] = useState(false);

  const mapsUrl = church.latitude && church.longitude
    ? `https://www.google.com/maps/dir/?api=1&destination=${church.latitude},${church.longitude}`
    : church.address
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(church.address)}`
    : null;

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: church.name, text: `Conheça ${church.name} no Sigo com Fé!`, url: window.location.href });
    }
  };

  return (
    <div className="card church-pin">
      <div className="church-pin__icon">
        <BookOpen size={32} style={{ color: 'var(--primary)' }} />
      </div>
      <div style={{ flex: 1 }}>
        <div className="church-pin__name">{church.name}</div>
        {church.denomination && <div className="church-pin__denom">{church.denomination}</div>}
        {church.address && (
          <div className="church-pin__info">
            <MapPin size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
            {church.address}
          </div>
        )}
        {church.city && (
          <div className="church-pin__info">
            <Building2 size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
            {church.city}{church.country ? `, ${church.country}` : ''}
          </div>
        )}
        {church.phone && (
          <div className="church-pin__info">
            <Phone size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
            {church.phone}
          </div>
        )}
        {church.pastor_name && (
          <div className="church-pin__info">
            <User size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
            Pastor {church.pastor_name}
          </div>
        )}
        <div className="church-pin__info">
          <Users size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
          {church.member_count || 0} membros
        </div>
        <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            className={`btn btn-sm ${following ? 'btn-follow--active' : 'btn-follow'}`}
            onClick={() => setFollowing(!following)}
          >
            <Heart size={14} fill={following ? '#daa520' : 'none'} /> {following ? 'Seguindo' : 'Seguir'}
          </button>
          {mapsUrl && (
            <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-sm">
              <Navigation size={14} /> Como Chegar
            </a>
          )}
          <button className="btn btn-sm btn-outline" style={{ color: 'var(--primary)', borderColor: 'var(--primary)' }} onClick={handleShare}>
            <Share2 size={14} /> Compartilhar
          </button>
        </div>
      </div>
    </div>
  );
}
