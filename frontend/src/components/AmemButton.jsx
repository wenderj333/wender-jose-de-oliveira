import React, { useState } from 'react';
import { HandHeart, Check } from 'lucide-react';

export default function AmemButton({ onClick }) {
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
        <><Check size={16} style={{ verticalAlign: 'middle', marginRight: '4px' }} /> Estou Orando!</>
      ) : (
        <><HandHeart size={16} style={{ verticalAlign: 'middle', marginRight: '4px' }} /> Estou Orando por Você</>
      )}
    </button>
  );
}
