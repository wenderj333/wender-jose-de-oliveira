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
      // Testamos as 3 rotas mais comuns para ver qual responde
      const rotas = [`${API}/users`, `${API}/members`, `${API}/profile/all`];
      
      for (let rota of rotas) {
        try {
          const res = await fetch(rota, { 
            headers: { Authorization: "Bearer " + token } 
          });
          if (res.ok) {
            const data = await res.json();
            const list = Array.isArray(data) ? data : (data.users || data.data || data.members || []);
            if (list.length > 0) {
              setUsers(list);
              setLoading(false);
              return; // Achou! Para de procurar.
            }
          }
        } catch (err) { console.log("Tentativa falhou em: " + rota); }
      }
      setLoading(false);
    }
    load();
  }, [token]);

  if (loading) return <div style={{ textAlign: "center", padding: "50px" }}><Loader2 className="animate-spin" /></div>;

  return (
    <div style={{ maxWidth: "600px", margin: "0 auto", padding: "20px" }}>
      <h2 style={{ fontWeight: "800", marginBottom: "20px" }}>Membros ({users.length})</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
        {users.length === 0 ? <p>Nenhum membro encontrado. (Verificando rotas...)</p> : users.map(u => (
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
