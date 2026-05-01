import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Loader2 } from "lucide-react";

const API = (import.meta.env.VITE_API_URL || "") + "/api";

export default function Members() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`${API}/users`, { 
          headers: { Authorization: "Bearer " + token } 
        });
        const data = await res.json();
        // Tenta encontrar a lista em diferentes formatos
        const list = Array.isArray(data) ? data : (data.users || data.data || []);
        setUsers(list);
      } catch (err) {
        console.error("Erro:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [token]);

  if (loading) return <div style={{ textAlign: "center", padding: "50px" }}><Loader2 className="animate-spin" /></div>;

  return (
    <div style={{ maxWidth: "600px", margin: "0 auto", padding: "20px" }}>
      <h2 style={{ fontWeight: "800", marginBottom: "20px" }}>Membros ({users.length})</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
        {users.length === 0 ? <p>Nenhum membro encontrado.</p> : users.map(u => (
          <div key={u.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div onClick={() => navigate(`/profile/${u.id}`)} style={{ display: "flex", alignItems: "center", gap: "12px", cursor: "pointer" }}>
              <img src={u.avatar_url || "/pro.jpg"} style={{ width: "50px", height: "50px", borderRadius: "50%", objectFit: "cover" }} onError={(e) => e.target.src="/pro.jpg"} />
              <div>
                <div style={{ fontWeight: "600" }}>{u.username}</div>
                <div style={{ color: "#8e8e8e", fontSize: "14px" }}>{u.full_name}</div>
              </div>
            </div>
            <button onClick={() => navigate(`/profile/${u.id}`)} style={{ background: "#0095f6", color: "#fff", border: "none", borderRadius: "8px", padding: "6px 12px" }}>Ver perfil</button>
          </div>
        ))}
      </div>
    </div>
  );
}
