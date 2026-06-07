import React from 'react';

const PhotoModal = ({ url, onClose, onNext, onPrev }) => {
  if (!url) return null;

  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.9)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
      
      {/* Botão Fechar */}
      <button onClick={onClose} style={{ position: "absolute", top: 20, right: 20, color: "white", background: "none", border: "none", fontSize: 30, cursor: "pointer" }}>×</button>

      {/* Seta Anterior */}
      <button onClick={(e) => { e.stopPropagation(); onPrev(); }} style={{ position: "absolute", left: 20, color: "white", background: "none", border: "none", fontSize: 40, cursor: "pointer" }}>❮</button>

      {/* Imagem */}
      <img src={url} style={{ maxHeight: "80vh", maxWidth: "70vw", objectFit: "contain" }} />

      {/* Seta Próximo */}
      <button onClick={(e) => { e.stopPropagation(); onNext(); }} style={{ position: "absolute", right: 20, color: "white", background: "none", border: "none", fontSize: 40, cursor: "pointer" }}>❯</button>
      
    </div>
  );
};

export default PhotoModal;