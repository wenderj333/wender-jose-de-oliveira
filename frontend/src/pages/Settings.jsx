import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
const API = (import.meta.env.VITE_API_URL || "") + "/api";
export default function Settings() {
  const { user, token, setUser } = useAuth();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState(user?.full_name || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${API}/profile`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
        body: JSON.stringify({ full_name: fullName, bio })
      });
      const data = await res.json();
      if (res.ok) {
        setMsg("Perfil atualizado!");
        if (data.user) setUser(prev => ({ ...prev, ...data.user }));
      } else {
        setMsg(data.error || "Erro ao guardar");
      }
    } catch (e) {
      setMsg("Erro de ligacao");
    } finally {
      setSaving(false);
    }
  };
  return (
    <div style={{ maxWidth: 600, margin: "0 auto", padding: 24 }}>
      <button onClick={() => navigate(-1)} style={{ marginBottom: 16, background: "none", border: "none", cursor: "pointer", fontSize: 16 }}>← Voltar</button>
      <h2 style={{ marginBottom: 24 }}>Editar Perfil</h2>
      <div style={{ marginBottom: 16 }}>
        <label style={{ display: "block", marginBottom: 8, fontWeight: 600 }}>Nome</label>
        <input value={fullName} onChange={e => setFullName(e.target.value)} style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #dbdbdb", fontSize: 16 }} />
      </div>
      <div style={{ marginBottom: 16 }}>
        <label style={{ display: "block", marginBottom: 8, fontWeight: 600 }}>Bio</label>
        <textarea value={bio} onChange={e => setBio(e.target.value)} rows={4} style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #dbdbdb", fontSize: 16 }} />
      </div>
      {msg && <p style={{ color: msg.includes("Erro") ? "red" : "green", marginBottom: 16 }}>{msg}</p>}
      <button onClick={handleSave} disabled={saving} style={{ background: "#0095f6", color: "white", border: "none", borderRadius: 8, padding: "12px 24px", fontSize: 16, fontWeight: 600, cursor: "pointer" }}>
        {saving ? "A guardar..." : "Guardar"}
      </button>
    </div>
  );
}
