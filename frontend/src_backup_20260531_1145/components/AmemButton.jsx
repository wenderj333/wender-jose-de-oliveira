import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { HandHeart, Check } from 'lucide-react';

export default function AmemButton({ onClick }) {
  const { t } = useTranslation();
  const [clicked, setClicked] = useState(false);

  const handleClick = () => {
    if (clicked) return;
    setClicked(true);
    onClick?.();
  };

  return (
    <button
      className="btn-amem"
      onClick={handleClick}
      disabled={clicked}
      style={clicked ? { background: 'var(--green)', color: 'var(--white)' } : {}}
    >
      {clicked ? (
        <><Check size={16} style={{ verticalAlign: 'middle', marginRight: '4px' }} /> {t('amemButton.praying')}</>
      ) : (
        <><HandHeart size={16} style={{ verticalAlign: 'middle', marginRight: '4px' }} /> {t('amemButton.prayForYou')}</>
      )}
    </button>
  );
}
