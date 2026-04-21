import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Heart, Calendar, BookOpen, Share2, Bookmark, Users, Radio } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_URL || "";
const API = `${API_BASE}/api`;

const VERSES = [
  { t: "Tudo posso naquele que me fortalece", r: "Fil 4:13" },
  { t: "O Senhor e meu pastor e nada me faltara", r: "Sal 23:1" },
  { t: "Confia no Senhor de todo o teu coracao", r: "Prov 3:5" },
  { t: "Porque eu sei os planos que tenho para voces", r: "Jer 29:11" },
  { t: "Esforça-te e tem bom animo", r: "Jos 1:9" },
  { t: "Deus e o nosso refugio e fortaleza", r: "Sal 46:1" },
  { t: "O amor de Deus foi derramado em nossos coracoes", r: "Rom 5:5" },
  { t: "Buscai primeiro o Reino de Deus", r: "Mt 6:33" },
  { t: "Serei com voce onde quer que for", r: "Js 1:9" },
  { t: "Nao temas porque eu estou contigo", r: "Is 41:10" },
  { t: "O Senhor abencoa quem nele confia", r: "Jr 17:7" },
  { t: "Com Deus todas as coisas sao possiveis", r: "Mt 19:26" },
  { t: "Alegrai-vos sempre no Senhor", r: "Fil 4:4" },
  { t: "A fe e a certeza do que esperamos", r: "Hb 11:1" },
  { t: "O Senhor guarda os que o amam", r: "Sal 31:23" },
  { t: "Sede fortes e corajosos", r: "Dt 31:6" },
  { t: "Deus supre todas as nossas necessidades", r: "Fil 4:19" },
  { t: "A graca do Senhor e suficiente para voce", r: "2Co 12:9" },
  { t: "O Senhor e a minha luz e salvacao", r: "Sal 27:1" },
  { t: "Sede cheios do Espirito Santo", r: "Ef 5:18" },
  { t: "O Senhor teu Deus esta no meio de ti", r: "Sf 3:17" },
  { t: "Nao vos preocupeis com coisa alguma", r: "Fil 4:6" },
  { t: "Aquietai-vos e sabeis que eu sou Deus", r: "Sal 46:10" },
  { t: "O amor e paciente e bondoso", r: "1Co 13:4" },
  { t: "Deus e amor", r: "1Jo 4:8" },
  { t: "O Senhor cuida de mim", r: "Sal 23:2" },
  { t: "Louvai ao Senhor todos os povos", r: "Sal 117:1" },
  { t: "A Palavra de Deus e viva e eficaz", r: "Hb 4:12" },
  { t: "Cristo me ama eu sei", r: "Jo 3:16" },
  { t: "Sede luz do mundo", r: "Mt 5:14" },
  { t: "Perdoai e sereis perdoados", r: "Lc 6:37" },
];

const MOCK_PRAYERS = [
  { id: 1, name: "Ana Costa", text: "pede saude para a familia", count: 12, avatar: "AC" },
  { id: 2, name: "Carlos M.", text: "pede paz no lar", count: 8, avatar: "CM" },
  { id: 3, name: "Maria S.", text: "pede emprego", count: 5, avatar: "MS" },
  { id: 4, name: "João P.", text: "pede cura", count: 19, avatar: "JP" },
  { id: 5, name: "Lucia R.", text: "agradece a Deus", count: 23, avatar: "LR" },
];

const ACTIVITY_TEMPLATES = [
  (n) => `${n} publicou um testemunho`,
  (n) => `${n} se juntou a comunidade`,
  (n) => `${n} pediu oracao`,
  (n) => `${n} comentou um post`,
  (n) => `${n} enviou Amen`,
];
const NAMES = ["Maria", "João", "Ana", "Carlos", "Lucia", "Pedro", "Sara", "Miguel", "Rosa", "David"];

function getRandomActivity() {
  const name = NAMES[Math.floor(Math.random() * NAMES.length)];
  const tmpl = ACTIVITY_TEMPLATES[Math.floor(Math.random() * ACTIVITY_TEMPLATES.length)];
  const mins = Math.floor(Math.random() * 10) + 1;
  return { text: tmpl(name), time: `ha ${mins} min`, id: Date.now() + Math.random() };
}

export default function RightSidebar({ showInstall, onInstall, activeLive }) {
  const { t } = useTranslation();
  const { user, token } = useAuth();
  const navigate = useNavigate();
  useEffect(() => { fetch((import.meta.env.VITE_API_URL||'')+ '/api/quiz/ranking?periodo='+periodo).then(r=>r.json()).then(d=>{if(Array.isArray(d))setRanking(d);}).catch(()=>{}); }, [periodo]);

  const today = new Date();
  const verseIdx = (today.getDate() + today.getMonth() * 31) % VERSES.length;
  const verse = VERSES[verseIdx];

  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [prayers, setPrayers] = useState(MOCK_PRAYERS);
  const [prayedIds, setPrayedIds] = useState([]);
  const [showAllPrayers, setShowAllPrayers] = useState(false);
  const [online, setOnline] = useState(Math.floor(Math.random() * 40) + 60);
  const [activity, setActivity] = useState([
    getRandomActivity(),
    getRandomActivity(),
    getRandomActivity(),
  ]);
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    const i = setInterval(() => {
      setOnline(n => Math.max(50, n + Math.floor(Math.random() * 5) - 2));
    }, 8000);
    return () => clearInterval(i);
  }, []);

  useEffect(() => {
    const i = setInterval(() => {
      setActivity(prev => [getRandomActivity(), ...prev.slice(0, 3)]);
    }, 15000);
    return () => clearInterval(i);
  }, []);

  useEffect(() => {
    if (!token) return;
    fetch(`${API}/users/suggestions`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => setSuggestions((d.users || []).slice(0, 4)))
      .catch(() => {});
  }, [token]);

  const handlePray = (id) => {
    if (prayedIds.includes(id)) return;
    setPrayedIds(prev => [...prev, id]);
    setPrayers(prev => prev.map(p => p.id === id ? { ...p, count: p.count + 1 } : p));
  };

  const handleSaveVerse = async () => {
    setSaved(true);
    if (token) {
      await fetch(`${API}/users/saved-verses`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ verse: verse.t, ref: verse.r }),
      }).catch(() => {});
    }
  };

  const handleCopyVerse = () => {
    navigator.clipboard.writeText(`"${verse.t}" - ${verse.r}`).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const visiblePrayers = showAllPrayers ? prayers : prayers.slice(0, 2);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

      {/* VERSICULO DO DIA */}
      <div style={{ background: "linear-gradient(135deg,#6C3FA0,#4A2270)", borderRadius: 14, padding: 16, color: "white" }}>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", opacity: 0.8, marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
          <BookOpen size={13} /> {t("sidebar.verse", "VERSICULO DO DIA")}
        </p>
        <p style={{ fontSize: 13, fontStyle: "italic", lineHeight: 1.6, marginBottom: 4 }}>"{verse.t}"</p>
        <p style={{ fontSize: 11, opacity: 0.8, textAlign: "right", marginBottom: 12 }}>{verse.r}</p>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={handleSaveVerse} style={{ flex: 1, padding: "6px 0", borderRadius: 8, border: "1px solid rgba(255,255,255,0.4)", background: saved ? "rgba(255,255,255,0.3)" : "transparent", color: "white", fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
            <Bookmark size={12} /> {saved ? "Guardado!" : t("sidebar.save", "Guardar")}
          </button>
          <button onClick={handleCopyVerse} style={{ flex: 1, padding: "6px 0", borderRadius: 8, border: "1px solid rgba(255,255,255,0.4)", background: "transparent", color: "white", fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
            <Share2 size={12} /> {copied ? "Copiado!" : t("sidebar.share", "Compartir")}
          </button>
        </div>
      </div>

      {/* LIVE / COMUNIDADE ACTIVA */}
      <div style={{ background: "linear-gradient(135deg,#3568b8,#4a80d4)", borderRadius: 14, padding: 16, color: "white", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: "linear-gradient(90deg,transparent,#f0c040,transparent)" }} />
        {activeLive ? (
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <div style={{ width: 10, height: 10, background: "#e74c3c", borderRadius: "50%" }} />
              <span style={{ fontSize: 13, fontWeight: 700 }}>AO VIVO</span>
            </div>
            <p style={{ fontSize: 12, marginBottom: 12 }}>{activeLive.user_name} esta transmitindo</p>
            <button onClick={() => navigate("/live-stream")} style={{ width: "100%", padding: 10, borderRadius: 10, background: "linear-gradient(135deg,#e74c3c,#c0392b)", color: "white", fontSize: 13, fontWeight: 700, border: "none", cursor: "pointer" }}>
              Entrar no Live
            </button>
          </div>
        ) : (
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <div style={{ width: 8, height: 8, background: "#27ae60", borderRadius: "50%" }} />
              <span style={{ fontSize: 12, fontWeight: 700 }}>Comunidade ativa agora</span>
            </div>
            <p style={{ fontSize: 20, fontWeight: 800, marginBottom: 4 }}>{online} <span style={{ fontSize: 12, fontWeight: 400 }}>pessoas online</span></p>
            <button onClick={() => navigate("/live-stream")} style={{ width: "100%", padding: 10, borderRadius: 10, background: "linear-gradient(135deg,#c49a28,#f0c040)", color: "#1e2240", fontSize: 13, fontWeight: 700, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
              <Radio size={14} /> {t("live.start", "Iniciar Live")}
            </button>
          </div>
        )}
      </div>

      {/* PETICIONES DE ORACION */}
      <div style={{ background: "var(--card)", borderRadius: 14, padding: 16, border: "1px solid var(--border)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 12, paddingBottom: 10, borderBottom: "1px solid var(--border)" }}>
          <Heart size={15} style={{ color: "#e74c3c" }} />
          <span style={{ fontSize: 14, fontWeight: 700, color: "var(--text)" }}>{t("nav.prayers", "Peticiones de Oracion")}</span>
        </div>
        {visiblePrayers.map(p => (
          <div key={p.id} style={{ display: "flex", gap: 9, padding: "8px 0", borderBottom: "1px solid var(--border)" }}>
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg,#6C3FA0,#4A2270)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 11, fontWeight: 700, flexShrink: 0 }}>
              {p.avatar}
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 12, color: "var(--text)", lineHeight: 1.4 }}>
                <b style={{ color: "#3568b8" }}>{p.name}</b> {p.text}
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
                <button onClick={() => handlePray(p.id)} style={{ padding: "3px 10px", borderRadius: 10, fontSize: 11, fontWeight: 600, border: "1px solid #e8c04060", background: prayedIds.includes(p.id) ? "#fff3cd" : "#fffbec", color: "#a07820", cursor: "pointer", transition: "all 0.2s" }}>
                  {prayedIds.includes(p.id) ? "Orado! " : ""}{t("mural.pray", "Orar")} {p.count > 0 && `(${p.count})`}
                </button>
              </div>
            </div>
          </div>
        ))}
        <button onClick={() => setShowAllPrayers(v => !v)} style={{ width: "100%", marginTop: 10, padding: "6px 0", borderRadius: 8, border: "1px solid var(--border)", background: "transparent", color: "var(--muted)", fontSize: 12, cursor: "pointer" }}>
          {showAllPrayers ? "Ver menos" : t("sidebar.viewMore", "Ver mas")}
        </button>
      </div>

      {/* ACTIVIDAD RECIENTE */}
      <div style={{ background: "var(--card)", borderRadius: 14, padding: 16, border: "1px solid var(--border)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 12, paddingBottom: 10, borderBottom: "1px solid var(--border)" }}>
          <Users size={15} style={{ color: "#3568b8" }} />
          <span style={{ fontSize: 14, fontWeight: 700, color: "var(--text)" }}>Atividade Recente</span>
        </div>
        {activity.map((a, i) => (
          <div key={a.id} style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "6px 0", borderBottom: i < activity.length - 1 ? "1px solid var(--border)" : "none" }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#27ae60", marginTop: 5, flexShrink: 0 }} />
            <div>
              <p style={{ fontSize: 12, color: "var(--text)", lineHeight: 1.4 }}>{a.text}</p>
              <p style={{ fontSize: 11, color: "var(--muted)" }}>{a.time}</p>
            </div>
          </div>
        ))}
      </div>

      {/* SUGESTOES */}
      {suggestions.length > 0 && (
        <div style={{ background: "var(--card)", borderRadius: 14, padding: 16, border: "1px solid var(--border)" }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text)", marginBottom: 12, paddingBottom: 10, borderBottom: "1px solid var(--border)" }}>
            Sugestoes para seguir
          </div>
          {suggestions.map(u => (
            <div key={u.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 0" }}>
              <img src={u.photo_url || u.avatar_url} alt="" style={{ width: 32, height: 32, borderRadius: "50%", objectFit: "cover", background: "#e0e0e0" }} onError={e => e.target.style.display = "none"} />
              <span style={{ flex: 1, fontSize: 13, color: "var(--text)" }}>{u.full_name}</span>
              <button onClick={() => navigate(`/perfil/${u.id}`)} style={{ padding: "4px 10px", borderRadius: 8, border: "1px solid #3568b8", background: "transparent", color: "#3568b8", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>Ver</button>
            </div>
          ))}
        </div>
      )}

      {/* EVENTO */}
      <div style={{ background: "var(--card)", borderRadius: 14, padding: 16, border: "1px solid var(--border)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 12, paddingBottom: 10, borderBottom: "1px solid var(--border)" }}>
          <Calendar size={15} style={{ color: "#f0c040" }} />
          <span style={{ fontSize: 14, fontWeight: 700, color: "var(--text)" }}>{t("events.title", "Proximos Eventos")}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 38, height: 38, borderRadius: 9, background: "linear-gradient(135deg,#3568b8,#4a80d4)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "white", flexShrink: 0 }}>
            <span style={{ fontSize: 16, fontWeight: 700, color: "#f0c040", lineHeight: 1 }}>09</span>
            <span style={{ fontSize: 9, color: "rgba(255,255,255,0.7)", textTransform: "uppercase" }}>MAR</span>
          </div>
          <div>
            <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>Culto Dominical</p>
            <p style={{ fontSize: 12, color: "var(--muted)" }}>10:00h · Online</p>
          </div>
        </div>
      </div>


      <div style={{ background: ' + chr(39) + 'var(--card)' + chr(39) + ', borderRadius: 14, padding: 16, marginBottom: 16, border: ' + chr(39) + '1px solid var(--border)' + chr(39) + ' }}>
        <div style={{ display: ' + chr(39) + 'flex' + chr(39) + ', alignItems: ' + chr(39) + 'center' + chr(39) + ', justifyContent: ' + chr(39) + 'space-between' + chr(39) + ', marginBottom: 12 }}>
          <h3 style={{ fontSize: 13, fontWeight: 700, margin: 0 }}>🏆 {t(' + chr(39) + 'quiz.ranking' + chr(39) + ', ' + chr(39) + 'Ranking Biblico' + chr(39) + ')}</h3>
          <div style={{ display: ' + chr(39) + 'flex' + chr(39) + ', gap: 4 }}>
            {[' + chr(39) + 'hoje' + chr(39) + ',' + chr(39) + 'semana' + chr(39) + ',' + chr(39) + 'mes' + chr(39) + '].map(p => (
              <button key={p} onClick={() => setPeriodo(p)} style={{ padding: ' + chr(39) + '2px 8px' + chr(39) + ', borderRadius: 10, border: ' + chr(39) + 'none' + chr(39) + ', background: periodo===p ? ' + chr(39) + '#6c47d4' + chr(39) + ' : ' + chr(39) + 'var(--bg)' + chr(39) + ', color: periodo===p ? ' + chr(39) + 'white' + chr(39) + ' : ' + chr(39) + 'var(--muted)' + chr(39) + ', fontSize: 10, cursor: ' + chr(39) + 'pointer' + chr(39) + ', fontWeight: 600 }}>
                {p}
              </button>
            ))}
          </div>
        </div>
        {ranking.length === 0 ? (
          <p style={{ fontSize: 12, color: ' + chr(39) + 'var(--muted)' + chr(39) + ', textAlign: ' + chr(39) + 'center' + chr(39) + ' }}>🎮 Joga para aparecer!</p>
        ) : ranking.map((j, i) => (
          <div key={j.id} style={{ display: ' + chr(39) + 'flex' + chr(39) + ', alignItems: ' + chr(39) + 'center' + chr(39) + ', gap: 8, padding: ' + chr(39) + '6px 0' + chr(39) + ', borderBottom: i < ranking.length-1 ? ' + chr(39) + '1px solid var(--border)' + chr(39) + ' : ' + chr(39) + 'none' + chr(39) + ', background: user?.id === j.id ? ' + chr(39) + 'rgba(108,71,212,0.1)' + chr(39) + ' : ' + chr(39) + 'transparent' + chr(39) + ', borderRadius: 8, paddingLeft: 4 }}>
            <span style={{ fontSize: 16, width: 24 }}>{i < 3 ? [' + chr(39) + '🥇' + chr(39) + ',' + chr(39) + '🥈' + chr(39) + ',' + chr(39) + '🥉' + chr(39) + '][i] : ' + chr(39) + '#' + chr(39) + '+(i+1)}</span>
            {j.avatar_url ? <img src={j.avatar_url} style={{ width: 28, height: 28, borderRadius: ' + chr(39) + '50%' + chr(39) + ', objectFit: ' + chr(39) + 'cover' + chr(39) + ' }} /> : <div style={{ width: 28, height: 28, borderRadius: ' + chr(39) + '50%' + chr(39) + ', background: ' + chr(39) + '#6c47d4' + chr(39) + ', display: ' + chr(39) + 'flex' + chr(39) + ', alignItems: ' + chr(39) + 'center' + chr(39) + ', justifyContent: ' + chr(39) + 'center' + chr(39) + ', fontSize: 12, color: ' + chr(39) + 'white' + chr(39) + ', fontWeight: 700 }}>{j.full_name?.charAt(0)}</div>}
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 12, fontWeight: user?.id === j.id ? 700 : 600, color: user?.id === j.id ? ' + chr(39) + '#6c47d4' + chr(39) + ' : ' + chr(39) + 'var(--text)' + chr(39) + ', margin: 0, overflow: ' + chr(39) + 'hidden' + chr(39) + ', textOverflow: ' + chr(39) + 'ellipsis' + chr(39) + ', whiteSpace: ' + chr(39) + 'nowrap' + chr(39) + ' }}>{j.full_name}</p>
            </div>
            <div style={{ textAlign: ' + chr(39) + 'right' + chr(39) + ' }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: ' + chr(39) + '#f0c040' + chr(39) + ', margin: 0 }}>{j.total_pontos} pts</p>
              <p style={{ fontSize: 10, color: ' + chr(39) + 'var(--muted)' + chr(39) + ', margin: 0 }}>⚡ {j.tempo_medio}s</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
