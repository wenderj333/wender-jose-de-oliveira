content = """import React from "react";
import { useMusic } from "../context/MusicContext";
import { useTranslation } from "react-i18next";
import { X, ChevronDown, ChevronUp, Music, SkipBack, SkipForward, Shuffle, Repeat } from "lucide-react";

export default function MusicPlayer() {
  const { t } = useTranslation();
  const { currentSong, isMinimized, stopSong, toggleMinimize, nextSong, prevSong, shuffle, repeat, toggleShuffle, toggleRepeat } = useMusic();

  if (!currentSong) return null;

  const btnBase = { background: "none", border: "none", cursor: "pointer", padding: 6, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 8 };

  if (isMinimized) {
    return (
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 9990, background: "linear-gradient(135deg,#1e1e3f,#2d1569)", borderTop: "1px solid rgba(102,126,234,0.3)", padding: "0.3rem 0.8rem", display: "flex", alignItems: "center", gap: 10, boxShadow: "0 -4px 20px rgba(0,0,0,0.4)" }}>
        <div style={{ width: 32, height: 32, borderRadius: 8, overflow: "hidden", flexShrink: 0, background: "#000" }}>
          <img src={"https://img.youtube.com/vi/" + currentSong.id + "/mqdefault.jpg"} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }} onClick={toggleMinimize}>
          <div style={{ color: "#fff", fontSize: "0.82rem", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{currentSong.title}</div>
          <div style={{ color: "#888", fontSize: "0.7rem" }}>{currentSong.artist}</div>
        </div>
        <div style={{ display: "flex", gap: 2, alignItems: "flex-end", height: 16, marginRight: 4 }}>
          {[0,1,2].map(i => <div key={i} style={{ width: 3, background: "#667eea", borderRadius: 2, animation: "musicBar 0.6s " + (i*0.15) + "s ease-in-out infinite alternate" }} />)}
        </div>
        <button onClick={prevSong} style={{ ...btnBase, color: "#aaa" }}><SkipBack size={16} /></button>
        <button onClick={nextSong} style={{ ...btnBase, color: "#aaa" }}><SkipForward size={16} /></button>
        <button onClick={toggleMinimize} style={{ ...btnBase, color: "#aaa" }}><ChevronUp size={20} /></button>
        <button onClick={stopSong} style={{ ...btnBase, color: "#666" }}><X size={18} /></button>
        <style>{"@keyframes musicBar { 0% { height: 4px; } 100% { height: 16px; } }"}</style>
      </div>
    );
  }

  return (
    <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 9990, background: "linear-gradient(180deg,#1e1e3f,#12122b)", borderTop: "1px solid rgba(102,126,234,0.3)", boxShadow: "0 -8px 30px rgba(0,0,0,0.5)", borderRadius: "20px 20px 0 0", maxHeight: "45vh", display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", justifyContent: "center", padding: "8px 0 4px" }}>
        <div style={{ width: 36, height: 4, borderRadius: 2, background: "rgba(255,255,255,0.2)" }} />
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 1rem 0.5rem" }}>
        <button onClick={toggleMinimize} style={{ ...btnBase, color: "#aaa", fontSize: "0.8rem", gap: 4 }}>
          <ChevronDown size={18} /> {t("music.nowPlaying","Minimizar")}
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <Music size={14} color="#667eea" />
          <span style={{ color: "#667eea", fontSize: "0.75rem", fontWeight: 600 }}>{t("music.nowPlaying","TOCANDO")}</span>
        </div>
        <button onClick={stopSong} style={{ ...btnBase, color: "#ef4444", fontSize: "0.8rem" }}>
          <X size={16} />
        </button>
      </div>
      <div style={{ position: "relative", paddingBottom: "40%", height: 0, margin: "0 0.75rem" }}>
        <iframe src={"https://www.youtube.com/embed/" + currentSong.id + "?autoplay=1&rel=0"} style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: "none", borderRadius: 12 }} allow="autoplay; encrypted-media" allowFullScreen title={currentSong.title} />
      </div>
      <div style={{ padding: "0.6rem 1rem 0.3rem", textAlign: "center" }}>
        <div style={{ color: "#fff", fontWeight: 700, fontSize: "0.95rem" }}>{currentSong.title}</div>
        <div style={{ color: "#888", fontSize: "0.8rem", marginTop: 2 }}>{currentSong.artist}</div>
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 16, padding: "0.4rem 1rem 0.8rem" }}>
        <button onClick={toggleShuffle} style={{ ...btnBase, color: shuffle ? "#667eea" : "#555" }} title={t("music.shuffle","Aleatório")}><Shuffle size={18} /></button>
        <button onClick={prevSong} style={{ ...btnBase, color: "#ccc" }} title={t("music.prev","Anterior")}><SkipBack size={22} /></button>
        <button onClick={nextSong} style={{ ...btnBase, color: "#ccc" }} title={t("music.next","Próxima")}><SkipForward size={22} /></button>
        <button onClick={toggleRepeat} style={{ ...btnBase, color: repeat ? "#667eea" : "#555" }} title={t("music.repeat","Repetir")}><Repeat size={18} /></button>
      </div>
    </div>
  );
}
"""
with open("frontend/src/components/MusicPlayer.jsx", "wb") as f:
    f.write(content.encode("utf-8"))
print("MusicPlayer OK!")
