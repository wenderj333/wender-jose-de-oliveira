import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Search, Loader2 } from "lucide-react";

const API = (import.meta.env.VITE_API_URL || "") + "/api";

export default function Members() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch(`${API}/users`, { headers: { Authorization: "Bearer " + token } })
      .then(res => res.json())
      .then(data => {
        setUsers(Array.isArray(data) ? data : (data.users || []));
        setLoading(false);
      }).catch(() => setLoading(false));
  }, [token]);

  const filtered = users.filter(u => u.username?.toLowerCase().includes(search.toLowerCase()));

  if (loading) return <div style={{ display: "flex", justifyContent: "center", padding: "50px" }}><Loader2 className="animate-spin" /></div>;

  return (
    <div style={{ maxWidth: "600px", margin: "0 auto", padding: "20px", background: "#fff" }}>
      <h2 style={{ fontSize: "24px", fontWeight: "800", marginBottom: "20px" }}>Descobrir</h2>
      <input 
        type="text" 
        placeholder="Pesquisar" 
        onChange={(e) => setSearch(e.target.value)}
        style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #dbdbdb", marginBottom: "20px", background: "#fafafa" }}
      />
      <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
        {filtered.map(u => (
          <div key={u.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div onClick={() => navigate(`/profile/${u.id}`)} style={{ display: "flex", alignItems: "center", gap: "12px", cursor: "pointer" }}>
              <img src={u.avatar_url || "/pro.jpg"} style={{ width: "50px", height: "50px", borderRadius: "50%", objectFit: "cover" }} onError={(e) => e.target.src="/pro.jpg"} />
              <div>
                <div style={{ fontWeight: "600", fontSize: "14px" }}>{u.username}</div>
                <div style={{ color: "#8e8e8e", fontSize: "14px" }}>{u.full_name}</div>
              </div>
            </div>
            <button onClick={() => navigate(`/profile/${u.id}`)} style={{ background: "#0095f6", color: "#fff", border: "none", borderRadius: "8px", padding: "6px 16px", fontWeight: "600", fontSize: "14px" }}>Ver perfil</button>
          </div>
        ))}
      </div>
    </div>
  );
}
