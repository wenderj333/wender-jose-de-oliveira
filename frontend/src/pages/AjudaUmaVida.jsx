import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";

const API = (import.meta.env.VITE_API_URL || "") + "/api";

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "agora";
  if (mins < 60) return `${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
}

const TABS = [
  { key: "all",       label: "🕊️ Todos" },
  { key: "request",   label: "🙏 Petições" },
  { key: "testimony", label: "💛 Testemunhos" },
  { key: "offer",     label: "❤️ Ajuda" },
  { key: "gratitude", label: "✨ Gratidão" },
];

const TYPE_CONFIG = {
  request:   { label: "🙏 Petição",     color: "#6c47d4", bg: "#f3eeff" },
  testimony: { label: "💛 Testemunho",  color: "#c9a84c", bg: "#fffbec" },
  gratitude: { label: "✨ Gratidão",    color: "#1e8a5a", bg: "#edfff5" },
  offer:     { label: "❤️ Ajuda",       color: "#d44747", bg: "#fff0f0" },
};

const QUICK_ACTIONS = [
  { icon: "🙏", image: "https://images.unsplash.com/photo-1544027993-37dbfe43562a?w=400&q=80", label: "Pedir oração",    desc: "Alguém vai orar por ti",        type: "request"   },
  { icon: "🕊️", image: "https://images.unsplash.com/photo-1490730141103-6cac27aaab94?w=400&q=80", label: "Orar por alguém", desc: "Responde com oração",           type: null, scroll: true },
  { icon: "🤝", image: "https://images.unsplash.com/photo-1509099836639-18ba1795216d?w=400&q=80", label: "Oferecer ajuda",  desc: "Apoia alguém da comunidade",    type: "offer"     },
  { icon: "💛", image: "https://images.unsplash.com/photo-1504052434569-70ad5836ab65?w=400&q=80", label: "Testemunho",      desc: "Partilha o que Deus fez",        type: "testimony" },
];

const EMOJIS = ["🙏","❤️","✝️","😢","😊","🔥","✨","🕊️","💛","🫂","🙌","💪","😭","🤲","👐"];

export default function AjudaUmaVida() {
  const { t } = useTranslation();
  const { user, token } = useAuth();
  const feedRef = useRef(null);
  const fileRef = useRef(null);

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [content, setContent] = useState("");
  const [postType, setPostType] = useState("request");
  const [isAnon, setIsAnon] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [mediaPreview, setMediaPreview] = useState(null);
  const [showEmojis, setShowEmojis] = useState(false);
  const [prayedIds, setPrayedIds] = useState(new Set());
  const [charCount, setCharCount] = useState(0);
  const [successMsg, setSuccessMsg] = useState("");

  const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

  async function loadPosts() {
    setLoading(true);
    try {
      const res = await fetch(`${API}/help-posts`, { headers: authHeaders });
      const data = await res.json();
      setPosts(data.posts || []);
    } catch (e) {}
    finally { setLoading(false); }
  }

  useEffect(() => { loadPosts(); }, []);

  const filteredPosts = activeTab === "all" ? posts : posts.filter(p => p.post_type === activeTab);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!user) { alert("Faz login para publicar"); return; }
    if (!content.trim()) { alert("Escreve algo antes de publicar"); return; }
    setSubmitting(true);
    try {
      const res = await fetch(`${API}/help-posts`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders },
        body: JSON.stringify({ content, post_type: postType, is_anonymous: isAnon, media_url: mediaPreview || null }),
      });
      if (res.ok) {
        setContent(""); setCharCount(0); setMediaPreview(null); setIsAnon(false); setShowEmojis(false);
        setSuccessMsg("Publicado! A comunidade vai orar por ti 🙏");
        setTimeout(() => setSuccessMsg(""), 4000);
        await loadPosts();
        feedRef.current?.scrollIntoView({ behavior: "smooth" });
      }
    } catch(e) { alert("Erro de rede"); }
    finally { setSubmitting(false); }
  }

  async function handlePray(postId) {
    if (!user) { alert("Faz login para orar"); return; }
    if (prayedIds.has(postId)) return;
    setPrayedIds(prev => new Set([...prev, postId]));
    try {
      await fetch(`${API}/help-posts/${postId}/pray`, { method: "POST", headers: authHeaders });
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, prayer_count: (p.prayer_count || 0) + 1 } : p));
    } catch(e) {}
  }

  return (
    <div style={{ maxWidth: 680, margin: "0 auto", padding: "0 16px 40px" }}>

      {/* HEADER */}
      <div style={{ background: "linear-gradient(135deg,#1a0a3e,#6c47d4)", borderRadius: "0 0 24px 24px", padding: "32px 24px", textAlign: "center", marginBottom: 24, color: "white" }}>
        <h1 style={{ fontSize: 28, fontWeight: 900, margin: "0 0 8px" }}>🕊️ Ajuda uma Vida</h1>
        <p style={{ fontSize: 14, opacity: 0.85, margin: "0 0 4px" }}>Um lugar onde ninguém ora sozinho</p>
        <p style={{ fontSize: 12, opacity: 0.6, fontStyle: "italic" }}>"Carregai os fardos uns dos outros" — Gál 6:2</p>
      </div>

      {/* ACOES RAPIDAS */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 24 }}>
        {QUICK_ACTIONS.map((a) => (
          <div key={a.label} onClick={() => { if (a.scroll) { feedRef.current?.scrollIntoView({ behavior: "smooth" }); } else { setPostType(a.type); document.getElementById("ajuda-form")?.scrollIntoView({ behavior: "smooth" }); } }}
            style={{ background: "white", borderRadius: 16, padding: 16, cursor: "pointer", border: "2px solid #f0eaff", textAlign: "center", transition: "all 0.2s", boxShadow: "0 2px 8px rgba(108,71,212,0.08)" }}
            onMouseEnter={e => e.currentTarget.style.borderColor = "#6c47d4"}
            onMouseLeave={e => e.currentTarget.style.borderColor = "#f0eaff"}>
            {a.image ? <img src={a.image} alt={a.label} style={{ width:'100%', height:90, objectFit:'cover', borderRadius:10, marginBottom:8 }} onError={e => e.target.style.display='none'} /> : <div style={{ fontSize:32, marginBottom:8 }}>{a.icon}</div>}
            <p style={{ fontSize: 14, fontWeight: 700, color: "#1a0a3e", margin: "0 0 4px" }}>{a.label}</p>
            <p style={{ fontSize: 12, color: "#888", margin: 0 }}>{a.desc}</p>
          </div>
        ))}
      </div>

      {/* FORMULARIO */}
      <div id="ajuda-form" style={{ background: "white", borderRadius: 20, padding: 20, marginBottom: 24, boxShadow: "0 4px 20px rgba(108,71,212,0.1)", border: "1px solid #f0eaff" }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: "#1a0a3e", margin: "0 0 14px", display: "flex", alignItems: "center", gap: 8 }}>✍️ Compartilhar</h2>
        <textarea
          value={content}
          onChange={e => { setContent(e.target.value); setCharCount(e.target.value.length); }}
          placeholder="Escreve o teu pedido, testemunho ou mensagem..."
          style={{ width: "100%", minHeight: 100, border: "1.5px solid #e0d0ff", borderRadius: 12, padding: 14, fontSize: 14, resize: "vertical", outline: "none", fontFamily: "inherit", boxSizing: "border-box", lineHeight: 1.5 }}
        />
        <div style={{ display: "flex", justifyContent: "flex-end", fontSize: 11, color: charCount > 400 ? "#e74c3c" : "#aaa", marginBottom: 10 }}>{charCount}/500</div>

        {showEmojis && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, padding: "8px 0 12px" }}>
            {EMOJIS.map(e => (
              <button key={e} type="button" onClick={() => { setContent(prev => prev + e); setShowEmojis(false); }} style={{ fontSize: 22, background: "none", border: "none", cursor: "pointer", padding: 2 }}>{e}</button>
            ))}
          </div>
        )}

        {mediaPreview && (
          <div style={{ position: "relative", marginBottom: 12 }}>
            <img src={mediaPreview} alt="preview" style={{ width: "100%", maxHeight: 180, objectFit: "cover", borderRadius: 10 }} />
            <button type="button" onClick={() => setMediaPreview(null)} style={{ position: "absolute", top: 6, right: 6, background: "rgba(0,0,0,0.6)", border: "none", borderRadius: "50%", width: 28, height: 28, color: "white", cursor: "pointer", fontSize: 16 }}>✕</button>
          </div>
        )}

        <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
          <button type="button" onClick={() => fileRef.current?.click()} style={{ padding: "6px 12px", borderRadius: 20, border: "1.5px solid #6c47d4", background: "white", color: "#6c47d4", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>📷 Foto</button>
          <button type="button" onClick={() => setShowEmojis(v => !v)} style={{ padding: "6px 12px", borderRadius: 20, border: "1.5px solid #6c47d4", background: "white", color: "#6c47d4", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>😊 Emoji</button>
          <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={e => { const f = e.target.files[0]; if (!f) return; const r = new FileReader(); r.onload = ev => setMediaPreview(ev.target.result); r.readAsDataURL(f); }} />
        </div>

        <p style={{ fontSize: 12, color: "#888", marginBottom: 8 }}>Tipo:</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 14 }}>
          {Object.entries(TYPE_CONFIG).map(([key, cfg]) => (
            <button key={key} type="button" onClick={() => setPostType(key)} style={{ padding: "8px 12px", borderRadius: 10, border: `2px solid ${postType === key ? cfg.color : "#eee"}`, background: postType === key ? cfg.bg : "white", color: cfg.color, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>{cfg.label}</button>
          ))}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
          <div onClick={() => setIsAnon(v => !v)} style={{ width: 40, height: 22, borderRadius: 11, background: isAnon ? "#6c47d4" : "#ddd", cursor: "pointer", position: "relative", transition: "background 0.2s" }}>
            <div style={{ width: 18, height: 18, borderRadius: "50%", background: "white", position: "absolute", top: 2, left: isAnon ? 20 : 2, transition: "left 0.2s" }} />
          </div>
          <span style={{ fontSize: 13, color: "#555" }}>🔒 Publicar anonimamente</span>
        </div>

        {successMsg && <div style={{ background: "#edfff5", color: "#1e8a5a", borderRadius: 10, padding: "10px 14px", marginBottom: 12, fontSize: 13, fontWeight: 600 }}>{successMsg}</div>}

        <button onClick={handleSubmit} disabled={submitting || !content.trim()} style={{ width: "100%", padding: 14, borderRadius: 12, border: "none", background: submitting ? "#aaa" : "linear-gradient(135deg,#6c47d4,#4A2270)", color: "white", fontSize: 15, fontWeight: 700, cursor: submitting ? "not-allowed" : "pointer" }}>
          {submitting ? "A publicar..." : "✍️ Publicar"}
        </button>
      </div>

      {/* FEED */}
      <div ref={feedRef}>
        <h2 style={{ fontSize: 18, fontWeight: 800, color: "#1a0a3e", marginBottom: 16 }}>🕊️ Comunidade</h2>

        {/* ABAS */}
        <div style={{ display: "flex", gap: 8, overflowX: "auto", marginBottom: 20, paddingBottom: 4 }}>
          {TABS.map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{ padding: "6px 14px", borderRadius: 20, border: "none", background: activeTab === tab.key ? "#6c47d4" : "#f0eaff", color: activeTab === tab.key ? "white" : "#6c47d4", fontSize: 13, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0 }}>{tab.label}</button>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: 40, color: "#888" }}>A carregar... 🙏</div>
        ) : filteredPosts.length === 0 ? (
          <div style={{ textAlign: "center", padding: 40, color: "#888" }}>
            <p style={{ fontSize: 32 }}>🕊️</p>
            <p>Nenhuma publicação ainda. Sê o primeiro!</p>
          </div>
        ) : filteredPosts.map(post => {
          const cfg = TYPE_CONFIG[post.post_type] || TYPE_CONFIG.request;
          const prayed = prayedIds.has(post.id);
          return (
            <div key={post.id} style={{ background: "white", borderRadius: 16, padding: 16, marginBottom: 14, boxShadow: "0 2px 12px rgba(0,0,0,0.06)", border: "1px solid #f0eaff" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                <div style={{ width: 38, height: 38, borderRadius: "50%", background: "linear-gradient(135deg,#6c47d4,#4A2270)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 700, fontSize: 14, flexShrink: 0 }}>
                  {post.is_anonymous ? "?" : (post.author_name || "?").charAt(0).toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#1a0a3e" }}>{post.is_anonymous ? "Anónimo" : (post.author_name || "Utilizador")}</p>
                  <p style={{ margin: 0, fontSize: 11, color: "#aaa" }}>{timeAgo(post.created_at)}</p>
                </div>
                <span style={{ padding: "3px 10px", borderRadius: 20, background: cfg.bg, color: cfg.color, fontSize: 11, fontWeight: 700 }}>{cfg.label}</span>
              </div>

              {post.media_url && <img src={post.media_url} alt="" style={{ width: "100%", maxHeight: 200, objectFit: "cover", borderRadius: 10, marginBottom: 10 }} />}

              <p style={{ fontSize: 14, color: "#333", lineHeight: 1.6, margin: "0 0 12px" }}>{post.content}</p>

              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => handlePray(post.id)} style={{ padding: "7px 16px", borderRadius: 20, border: `1.5px solid ${prayed ? "#6c47d4" : "#ddd"}`, background: prayed ? "#f3eeff" : "white", color: prayed ? "#6c47d4" : "#555", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                  🙏 {prayed ? "Orado" : "Orar"} {post.prayer_count > 0 && `(${post.prayer_count})`}
                </button>
                <button onClick={() => { setContent("@" + (post.author_name || "alguem") + " "); document.getElementById("ajuda-form")?.scrollIntoView({ behavior: "smooth" }); }} style={{ padding: "7px 16px", borderRadius: 20, border: "1.5px solid #ddd", background: "white", color: "#555", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                  💬 Responder
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
