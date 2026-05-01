import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Loader2, Settings, Grid, Bookmark } from "lucide-react";

const API = (import.meta.env.VITE_API_URL || "") + "/api";

const translations = {
  pt: { edit: "Editar Perfil", followers: "seguidores", following: "seguindo", posts: "publicações", loading: "Carregando...", back: "Voltar" },
  en: { edit: "Edit Profile", followers: "followers", following: "following", posts: "posts", loading: "Loading...", back: "Back" },
  es: { edit: "Editar Perfil", followers: "seguidores", following: "siguiendo", posts: "publicaciones", loading: "Cargando...", back: "Volver" }
};

export default function Profile() {
  const { id } = useParams();
  const { token, user, userLanguage = 'pt' } = useAuth();
  const t = translations[userLanguage] || translations.pt;
  const navigate = useNavigate();
  const [profileUser, setProfileUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const targetId = id || user?.id;
        if (!targetId) return;
        const res = await fetch(`${API}/profile/${targetId}`, {
          headers: { Authorization: "Bearer " + token }
        });
        const data = await res.json();
        setProfileUser(data);
      } catch (err) {
        console.error("Erro ao carregar perfil", err);
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, [id, token, user]);

  if (loading) return <div style={{display:'flex', justifyContent:'center', marginTop:'50px'}}><Loader2 className="animate-spin" color="#0095f6" /></div>;

  return (
    <div style={{ maxWidth: "935px", margin: "0 auto", padding: "20px", background: "#fff", minHeight: "100vh" }}>
      <header style={{ display: 'flex', alignItems: 'center', gap: '40px', marginBottom: '40px', padding: '20px' }}>
        <div style={{ flexShrink: 0 }}>
          <img 
            src={profileUser?.avatar_url || "/pro.jpg"} 
            style={{ width: '150px', height: '150px', borderRadius: '50%', objectFit: 'cover', border: '1px solid #dbdbdb' }}
            onError={(e) => { e.target.src = "/pro.jpg"; }}
          />
        </div>
        <section style={{ flexGrow: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '28px', fontWeight: '300' }}>{profileUser?.username || "Usuário"}</h2>
            {(!id || id === user?.id) && (
              <button onClick={() => alert('OK')} style={{ border: '1px solid #dbdbdb', background: 'transparent', padding: '5px 9px', borderRadius: '4px', fontWeight: '600', cursor: 'pointer' }}>
                {t.edit}
              </button>
            )}
          </div>
          <div style={{ display: 'flex', gap: '40px', marginBottom: '20px' }}>
            <span><strong>0</strong> {t.posts}</span>
            <span><strong>0</strong> {t.followers}</span>
            <span><strong>0</strong> {t.following}</span>
          </div>
          <div style={{ fontWeight: '600' }}>{profileUser?.full_name}</div>
        </section>
      </header>
      <div style={{ borderTop: '1px solid #dbdbdb', display: 'flex', justifyContent: 'center', gap: '60px' }}>
         <div style={{ display: 'flex', alignItems: 'center', gap: '6px', paddingTop: '15px', borderTop: '1px solid #262626', marginTop: '-1px', cursor: 'pointer' }}>
            <Grid size={12} /> <span style={{ fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px' }}>{t.posts}</span>
         </div>
      </div>
    </div>
  );
}

