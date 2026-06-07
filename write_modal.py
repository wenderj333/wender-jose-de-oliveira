content = """import React, { useState } from "react";

export default function PhotoModal({ url, onClose, onNext, onPrev }) {
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(0);
  const [showComments, setShowComments] = useState(false);
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState([]);

  if (!url) return null;

  const handleLike = () => {
    setLiked(!liked);
    setLikes(l => liked ? l - 1 : l + 1);
  };

  const handleShare = () => {
    if (navigator.share) navigator.share({ title: "Sigo com Fe", url: window.location.href });
    else { navigator.clipboard.writeText(url); alert("Link copiado!"); }
  };

  const handleComment = () => {
    if (!comment.trim()) return;
    setComments(prev => [...prev, { text: comment, id: Date.now() }]);
    setComment("");
  };

  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.92)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <button onClick={onClose} style={{ position: "absolute", top: 20, right: 20, color: "white", background: "none", border: "none", fontSize: 28, cursor: "pointer" }}>✕</button>
      {onPrev && <button onClick={onPrev} style={{ position: "absolute", left: 20, fontSize: 40, color: "white", background: "none", border: "none", cursor: "pointer" }}>❮</button>}
      {onNext && <button onClick={onNext} style={{ position: "absolute", right: 20, fontSize: 40, color: "white", background: "none", border: "none", cursor: "pointer" }}>❯</button>}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", maxWidth: "90vw" }}>
        <img src={url} style={{ maxHeight: "70vh", maxWidth: "85vw", objectFit: "contain", borderRadius: 8 }} />
        <div style={{ display: "flex", gap: 32, marginTop: 20 }}>
          <button onClick={handleLike} style={{ background: "none", border: "none", color: "white", fontSize: 28, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
            {liked ? "❤️" : "🤍"}
            <span style={{ fontSize: 13 }}>{likes}</span>
          </button>
          <button onClick={() => setShowComments(!showComments)} style={{ background: "none", border: "none", color: "white", fontSize: 28, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
            💬
            <span style={{ fontSize: 13 }}>{comments.length}</span>
          </button>
          <button onClick={handleShare} style={{ background: "none", border: "none", color: "white", fontSize: 28, cursor: "pointer" }}>
            🔗
          </button>
        </div>
        {showComments && (
          <div style={{ background: "white", borderRadius: 12, padding: 16, marginTop: 12, width: "90vw", maxWidth: 400 }}>
            <div style={{ maxHeight: 150, overflowY: "auto", marginBottom: 10 }}>
              {comments.length === 0
                ? <p style={{ color: "#999", fontSize: 13, textAlign: "center" }}>Nenhum comentario ainda.</p>
                : comments.map(c => <div key={c.id} style={{ padding: "6px 0", fontSize: 13, borderBottom: "1px solid #eee" }}>{c.text}</div>)
              }
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <input
                value={comment}
                onChange={e => setComment(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleComment()}
                placeholder="Escreve um comentario..."
                style={{ flex: 1, padding: "8px 12px", borderRadius: 20, border: "1px solid #ddd", fontSize: 13, outline: "none" }}
              />
              <button onClick={handleComment} style={{ background: "#6C3FA0", color: "white", border: "none", borderRadius: "50%", width: 36, height: 36, cursor: "pointer", fontSize: 16 }}>✓</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
"""
open("src/components/PhotoModal.jsx", "w", encoding="utf-8").write(content)
print("Feito!")
