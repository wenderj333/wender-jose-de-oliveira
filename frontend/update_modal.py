content = """import React, { useState } from "react";
export default function PhotoModal({ url, photoId, token, onClose }) {
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
    else navigator.clipboard.writeText(url);
  };
  const handleComment = () => {
    if (!comment.trim()) return;
    setComments(prev => [...prev, { text: comment, id: Date.now() }]);
    setComment("");
  };
  return React.createElement("div", {
    style: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.92)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }
  },
    React.createElement("div", { style: { position: "relative", maxWidth: "90vw", maxHeight: "90vh", display: "flex", flexDirection: "column", alignItems: "center" } },
      React.createElement("img", { src: url, style: { maxWidth: "90vw", maxHeight: "70vh", objectFit: "contain", borderRadius: 8 } }),
      React.createElement("div", { style: { display: "flex", gap: 24, marginTop: 16, alignItems: "center" } },
        React.createElement("button", { onClick: handleLike, style: { background: "none", border: "none", color: liked ? "#e11d48" : "white", fontSize: 28, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center" } },
          liked ? "❤️" : "🤍",
          React.createElement("span", { style: { fontSize: 12, color: "white" } }, likes)
        ),
        React.createElement("button", { onClick: () => setShowComments(!showComments), style: { background: "none", border: "none", color: "white", fontSize: 28, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center" } },
          "💬",
          React.createElement("span", { style: { fontSize: 12, color: "white" } }, comments.length)
        ),
        React.createElement("button", { onClick: handleShare, style: { background: "none", border: "none", color: "white", fontSize: 28, cursor: "pointer" } }, "🔗")
      ),
      showComments && React.createElement("div", { style: { background: "white", borderRadius: 12, padding: 16, marginTop: 12, width: "90vw", maxWidth: 400 } },
        React.createElement("div", { style: { maxHeight: 150, overflowY: "auto", marginBottom: 8 } },
          comments.length === 0 ? React.createElement("p", { style: { color: "#999", fontSize: 13, textAlign: "center" } }, "Nenhum comentario ainda.") :
          comments.map(c => React.createElement("div", { key: c.id, style: { padding: "4px 0", fontSize: 13, borderBottom: "1px solid #eee" } }, c.text))
        ),
        React.createElement("div", { style: { display: "flex", gap: 8 } },
          React.createElement("input", { value: comment, onChange: e => setComment(e.target.value), placeholder: "Escreve um comentario...", style: { flex: 1, padding: "8px 12px", borderRadius: 20, border: "1px solid #ddd", fontSize: 13 },
            onKeyDown: e => e.key === "Enter" && handleComment()
          }),
          React.createElement("button", { onClick: handleComment, style: { background: "#6C3FA0", color: "white", border: "none", borderRadius: "50%", width: 36, height: 36, cursor: "pointer", fontSize: 16 } }, "✓")
        )
      ),
      React.createElement("span", { onClick: onClose, style: { position: "absolute", top: -40, right: 0, color: "white", fontSize: 30, cursor: "pointer", fontWeight: "bold" } }, "✕")
    )
  );
}
"""
open("src/components/PhotoModal.jsx", "w", encoding="utf-8").write(content)
print("Feito!")
