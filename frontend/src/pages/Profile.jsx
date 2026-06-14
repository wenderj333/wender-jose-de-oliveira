import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "react-i18next";
import { Loader2, Settings } from "lucide-react";
import PhotoModal from "../components/PhotoModal";
import PhotoUploader from "../components/PhotoUploader";
const API = (import.meta.env.VITE_API_URL || "") + "/api";
export default function Profile() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user: currentUser, token } = useAuth();
  const { t } = useTranslation();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [amens, setAmens] = useState(0);
  const [amenDado, setAmenDado] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [userPosts, setUserPosts] = useState([]);
  const [activeTab, setActiveTab] = useState("all");
  const [photos, setPhotos] = useState([]);
  const [showUploader, setShowUploader] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(null);
  const [friendStatus, setFriendStatus] = useState(null);
  const [playingPost, setPlayingPost] = useState(null);
  const audioRef = React.useRef(null);
  const [postAmens, setPostAmens] = useState({});
  const handlePostAmen = async (postId) => {
    if (postAmens[postId]) return;
    setPostAmens(prev => ({ ...prev, [postId]: true }));
    try {
      await fetch(API + "/feed/" + postId + "/like", { method: "POST", headers: { Authorization: "Bearer " + token } });
    } catch(e) {}
  };
  const targetId = userId || currentUser?.id;
  const isOwner = !userId || userId === currentUser?.id;
  useEffect(() => {
    if (!targetId || !token) return;
    fetch(API + "/profile/" + targetId, { headers: { Authorization: "Bearer " + token } })
      .then(r => r.json()).then(d => { setUser(d.user || d); setLoading(false); }).catch(() => setLoading(false));
    fetch(API + "/feed", { headers: { Authorization: "Bearer " + token } })
      .then(r => r.json()).then(d => setUserPosts((d.posts || []).filter(p => p.user_id === targetId || p.author_id === targetId))).catch(() => {});
    fetch(API + "/photos/" + targetId, { headers: { Authorization: "Bearer " + token } })
      .then(r => r.ok ? r.json() : { photos: [] }).then(d => setPhotos(d.photos || [])).catch(() => {});
  }, [targetId, token]);
  useEffect(() => {
    if (!token || !userId || isOwner) return;
    fetch(API + "/friends", { headers: { Authorization: "Bearer " + token } })
      .then(r => r.json()).then(d => { if ((d.friends || []).find(f => f.id === userId)) setFriendStatus("accepted"); }).catch(() => {});
  }, [token, userId]);
  const handleFollow = async () => {
    if (!token || friendStatus) return;
    try {
      await fetch(API + "/friends/request", { method: "POST", headers: { "Content-Type": "application/json", Authorization: "Bearer " + token }, body: JSON.stringify({ addresseeId: userId }) });
      setFriendStatus("pending");
    } catch(e) {}
  };
  const openPhoto = (index) => setCurrentIndex(index);
  const closePhoto = () => setCurrentIndex(null);
  const nextPhoto = () => setCurrentIndex(prev => (prev + 1) % photos.length);
  const prevPhoto = () => setCurrentIndex(prev => (prev - 1 + photos.length) % photos.length);
  if (loading) return <div style={{ display: "flex", justifyContent: "center", padding: "50px" }}><Loader2 className="animate-spin" /></div>;
  if (!user) return <div style={{ textAlign: "center", padding: "20px" }}>{t("profile.notFound","Utilizador nao encontrado.")}</div>;
  const tabs = [["all", t("profile.allPosts","Todas")], ["foto", t("profile.photos","Fotos")], ["video", t("profile.videos","Videos")], ["galeria", t("profile.gallery","Galeria")]];
  const filteredPosts = userPosts.filter(p => activeTab === "all" ? true : activeTab === "foto" ? (p.media_url && !p.media_url.includes("video")) : activeTab === "video" ? (p.media_url && p.media_url.includes("video")) : false);
  return (
    <div style={{ maxWidth: "935px", margin: "0 auto", padding: "0" }}>
      {user.cover_url && <img src={user.cover_url} style={{ width: "100%", height: "200px", objectFit: "cover" }} onError={e => e.target.style.display = "none"} />}
      <div style={{ padding: "20px" }}>
        <header style={{ display: "flex", alignItems: "center", marginBottom: "30px", gap: "30px", flexWrap: "wrap" }}>
          <div style={{ position: "relative", flexShrink: 0 }}>
            <img src={user.avatar_url || "/pro.jpg"} style={{ width: "120px", height: "120px", borderRadius: "50%", objectFit: "cover", border: "1px solid #dbdbdb" }} onError={e => e.target.src = "/pro.jpg"} />
            <button onClick={() => { if (!amenDado) { setAmens(a => a + 1); setAmenDado(true); } }} style={{ position: "absolute", bottom: 4, right: 4, background: amenDado ? "#6C3FA0" : "white", border: "2px solid #6C3FA0", borderRadius: "50%", width: 34, height: 34, cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>🙏</button>
            {amens > 0 && <span style={{ position: "absolute", bottom: 4, left: 0, background: "#6C3FA0", color: "white", borderRadius: 12, padding: "2px 6px", fontSize: 11, fontWeight: "bold" }}>{amens}</span>}
          </div>
          <section style={{ flex: 1, minWidth: 200 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px", flexWrap: "wrap" }}>
              <h2 style={{ fontSize: "22px", fontWeight: "300", margin: 0 }}>{user.username || user.full_name}</h2>
              {isOwner ? (
                <>
                  <button onClick={() => navigate("/settings")} style={{ background: "transparent", border: "1px solid #dbdbdb", borderRadius: "4px", padding: "5px 9px", fontSize: "13px", cursor: "pointer" }}>{t("profile.editProfile","Editar perfil")}</button>
                  <button onClick={() => setShowInfo(!showInfo)} style={{ background: "#6C3FA0", color: "white", border: "none", borderRadius: "4px", padding: "5px 9px", fontSize: "13px", cursor: "pointer" }}>{showInfo ? t("profile.close","Fechar") : t("profile.viewProfile","Ver Perfil")}</button>
                  <Settings size={18} style={{ cursor: "pointer" }} onClick={() => navigate("/settings")} />
                </>
              ) : (
                <button onClick={handleFollow} disabled={!!friendStatus} style={{ background: friendStatus === "accepted" ? "#6C3FA0" : "transparent", color: friendStatus === "accepted" ? "white" : "#6C3FA0", border: "1px solid #6C3FA0", borderRadius: "20px", padding: "4px 14px", fontSize: "13px", cursor: friendStatus ? "default" : "pointer" }}>
                  {friendStatus === "accepted" ? t("profile.brothers","Irmaos") : friendStatus === "pending" ? t("profile.requestSent","Pedido enviado") : t("profile.follow","Seguir")}
                </button>
              )}
            </div>
            <div style={{ display: "flex", gap: "24px", marginBottom: "12px" }}>
              <span><strong>{userPosts.length}</strong> {t("profile.posts","publicacoes")}</span>
              <span><strong>{photos.length}</strong> {t("profile.photos","fotos")}</span>
              <span><strong>0</strong> {t("profile.brothers","irmaos")}</span>
            </div>
            <div><b>{user.full_name}</b><p style={{ margin: "4px 0", color: "#555" }}>{user.bio || ""}</p></div>
          </section>
        </header>

        {showInfo && (
          <div style={{ marginBottom: 16, display: "flex", flexDirection: "column", gap: 10 }}>
            {(user.city || user.country || user.profession || user.marital_status) && (
              <div style={{ background: "#f9f9fe", borderRadius: 10, padding: 14, border: "1px solid #eee" }}>
                <b style={{ color: "#6C3FA0" }}>👤 {t("profile.personalInfo","Info Pessoais")}</b>
                {user.city && <div style={{ fontSize: 13 }}>{t("profile.city","Cidade")}: {user.city}</div>}
                {user.country && <div style={{ fontSize: 13 }}>{t("profile.country","Pais")}: {user.country}</div>}
                {user.profession && <div style={{ fontSize: 13 }}>{t("profile.profession","Profissao")}: {user.profession}</div>}
                {user.marital_status && <div style={{ fontSize: 13 }}>{t("profile.maritalStatus","Estado Civil")}: {user.marital_status}</div>}
              </div>
            )}
            {(user.church_name || user.church_denomination || user.faith_years) && (
              <div style={{ background: "#f9f9fe", borderRadius: 10, padding: 14, border: "1px solid #eee" }}>
                <b style={{ color: "#6C3FA0" }}>⛪ {t("profile.church","Igreja")}</b>
                {user.church_name && <div style={{ fontSize: 13 }}>{t("profile.church","Igreja")}: {user.church_name}</div>}
                {user.church_denomination && <div style={{ fontSize: 13 }}>{t("profile.denomination","Denominacao")}: {user.church_denomination}</div>}
                {user.faith_years && <div style={{ fontSize: 13 }}>{t("profile.faithYears","Anos de Fe")}: {user.faith_years}</div>}
              </div>
            )}
            {user.favorite_verse && (
              <div style={{ background: "#f9f9fe", borderRadius: 10, padding: 14, border: "1px solid #eee" }}>
                <b style={{ color: "#6C3FA0" }}>📖 {t("profile.favoriteVerse","Versiculo")}</b>
                <p style={{ fontSize: 13, fontStyle: "italic", margin: "4px 0" }}>{user.favorite_verse}</p>
              </div>
            )}
            {user.testimony && (
              <div style={{ background: "#f9f9fe", borderRadius: 10, padding: 14, border: "1px solid #eee" }}>
                <b style={{ color: "#6C3FA0" }}>✝️ {t("profile.testimony","Testemunho")}</b>
                <p style={{ fontSize: 13, margin: "4px 0", whiteSpace: "pre-wrap" }}>{user.testimony}</p>
              </div>
            )}
            {user.bio && (
              <div style={{ background: "#f9f9fe", borderRadius: 10, padding: 14, border: "1px solid #eee" }}>
                <b style={{ color: "#6C3FA0" }}>💬 {t("profile.aboutMe","Sobre Mim")}</b>
                <p style={{ fontSize: 13, margin: "4px 0" }}>{user.bio}</p>
              </div>
            )}
          </div>
        )}

        <div style={{ display: "flex", justifyContent: "center", gap: "16px", fontSize: "12px", fontWeight: "600", borderTop: "1px solid #dbdbdb", marginTop: 8 }}>
          {tabs.map(([tab, label]) => (<div key={tab} onClick={() => setActiveTab(tab)} style={{ cursor: "pointer", padding: "12px 4px", borderTop: activeTab === tab ? "2px solid #262626" : "2px solid transparent" }}>{label}</div>))}
        </div>
        {activeTab !== "galeria" && (<div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 3, marginTop: 3 }}>{filteredPosts.map(p => {
            const isMusic = p.audio_url && !p.media_url;
            const coverImg = p.cover_url || (isMusic ? null : null);
            return (
            <div key={p.id} onClick={() => isMusic ? setPlayingPost(p) : null} style={{ aspectRatio: "1", overflow: "hidden", background: "#f0f0f0", position: "relative", cursor: "pointer" }}>
              {p.media_url && p.media_url.includes("video") ? (
                <video src={p.media_url} style={{ width: "100%", height: "100%", objectFit: "cover" }} muted playsInline />
              ) : p.media_url ? (
                <img src={p.media_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : isMusic ? (
                <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg,#4a80d4,#764ba2)", padding: 8 }}>
                  {coverImg ? <img src={coverImg} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", position: "absolute", inset: 0 }} /> : null}
                  <div style={{ position: "relative", zIndex: 1, textAlign: "center" }}>
                    <div style={{ fontSize: 28, marginBottom: 4 }}>🎵</div>
                    <div style={{ fontSize: 10, color: "white", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 80 }}>{p.content?.replace("🎵 ","").split("—")[0]?.trim()}</div>
                  </div>
                </div>
              ) : (
                <div style={{ padding: 8, fontSize: 11, color: "#666", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>{(p.content || "").slice(0,60)}</div>
              )}
              {isMusic && (
                <div style={{ position: "absolute", bottom: 4, right: 4, background: "#4a80d4", borderRadius: "50%", width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="white"><polygon points="5,3 19,12 5,21" /></svg>
                </div>
              )}
              <button onClick={(e) => { e.stopPropagation(); handlePostAmen(p.id); }} style={{ position: "absolute", top: 4, right: 4, background: postAmens[p.id] ? "#e11d48" : "rgba(255,255,255,0.85)", border: "none", borderRadius: 20, padding: "3px 7px", display: "flex", alignItems: "center", gap: 3, cursor: "pointer", fontSize: 11, fontWeight: 700, color: postAmens[p.id] ? "white" : "#e11d48" }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill={postAmens[p.id] ? "white" : "#e11d48"}><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                {t("profile.amen","Amen")}
              </button>
            </div>
            );
          })}{filteredPosts.length === 0 && <div style={{ gridColumn: "1/-1", textAlign: "center", padding: 40, color: "#999" }}>{t("profile.noPosts","Nenhuma publicacao ainda.")}</div>}</div>)}
        {activeTab === "galeria" && (<div style={{ marginTop: 16 }}>{isOwner && <button onClick={() => setShowUploader(true)} style={{ background: "#6C3FA0", color: "white", border: "none", borderRadius: 8, padding: "8px 16px", cursor: "pointer", fontSize: 14, marginBottom: 12 }}>+ {t("profile.addPhoto","Adicionar Foto")}</button>}<div className="gallery-grid">{photos.map((p, index) => (<div key={p.id} className="gallery-item" onClick={() => openPhoto(index)}><img src={p.url} alt="" /></div>))}</div>{photos.length === 0 && <div style={{ textAlign: "center", padding: 40, color: "#999" }}>{t("profile.noPhotos","Nenhuma foto ainda.")}</div>}</div>)}
        {currentIndex !== null && <PhotoModal url={photos[currentIndex].url} onClose={closePhoto} onNext={nextPhoto} onPrev={prevPhoto} />}
        {playingPost && (
          <div onClick={() => setPlayingPost(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
            <div onClick={e => e.stopPropagation()} style={{ background: "white", borderRadius: 20, padding: 24, maxWidth: 380, width: "100%", textAlign: "center" }}>
              <div style={{ width: 200, height: 200, borderRadius: 16, overflow: "hidden", margin: "0 auto 16px", background: "linear-gradient(135deg,#4a80d4,#764ba2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {playingPost.cover_url ? <img src={playingPost.cover_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <span style={{ fontSize: 64 }}>🎵</span>}
              </div>
              <h3 style={{ margin: "0 0 4px", fontSize: 18, fontWeight: 700 }}>{playingPost.content?.replace("🎵 ","").split("—")[0]?.trim()}</h3>
              <p style={{ color: "#888", fontSize: 13, margin: "0 0 16px" }}>{playingPost.content?.split("—")[1]?.trim()}</p>
              <audio ref={audioRef} src={playingPost.audio_url} controls autoPlay style={{ width: "100%", marginBottom: 16 }} />
              <button onClick={() => setPlayingPost(null)} style={{ background: "#6C3FA0", color: "white", border: "none", borderRadius: 10, padding: "10px 24px", cursor: "pointer", fontWeight: 600 }}>{t("profile.closePlayer","Fechar")}</button>
            </div>
          </div>
        )}
        {showUploader && <PhotoUploader token={token} onSuccess={p => { setPhotos(prev => [p, ...prev]); setShowUploader(false); }} onClose={() => setShowUploader(false)} />}
      </div>
    </div>
  );
}
