import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Search, Loader2, UserCircle } from "lucide-react";

const API = (import.meta.env.VITE_API_URL || "") + "/api";

export default function Members() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    async function fetchMembers() {
      try {
        const res = await fetch(`${API}/users`, {
          headers: { Authorization: "Bearer " + token }
        });
        const data = await res.json();
        // Ajuste para diferentes formatos de resposta da API
        const userList = Array.isArray(data) ? data : (data.users || []);
        setUsers(userList);
      } catch (err) {
        console.error("Erro ao carregar membros:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchMembers();
  }, [token]);

  const filteredUsers = users.filter(u => 
    u.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <Loader2 className="animate-spin" size={32} color="#0095f6" />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "600px", margin: "0 auto", padding: "20px", background: "#fff", minHeight: "100vh" }}>
      <h2 style={{ fontSize: "24px", fontWeight: "800", marginBottom: "20px", color: "#1a1a1a" }}>Descobrir Pessoas</h2>
      
      {/* Barra de Pesquisa Estilo Clean */}
      <div style={{ position: 'relative', marginBottom: '25px' }}>
        <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#8e8e8e' }} size={18} />
        <input 
          type="text" 
          placeholder="Pesquisar..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ 
            width: '100%', 
            padding: '12px 12px 12px 40px', 
            borderRadius: '10px', 
            border: '1px solid #dbdbdb', 
            background: '#efefef',
            outline: 'none'
          }}
        />
      </div>

      {/* Grid/Lista de Membros */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {filteredUsers.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#8e8e8e' }}>Nenhum membro encontrado.</p>
        ) : (
          filteredUsers.map(user => (
            <div key={user.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div 
                onClick={() => navigate(`/profile/${user.id}`)} 
                style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
              >
                <div style={{ width: '54px', height: '54px', borderRadius: '50%', overflow: 'hidden', border: '1px solid #dbdbdb' }}>
                  <img 
                    src={user.avatar_url || "/pro.jpg"} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => { e.target.src = "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y"; }}
                  />
                </div>
                <div>
                  <div style={{ fontWeight: '600', fontSize: '14px', color: '#262626' }}>{user.username}</div>
                  <div style={{ color: '#8e8e8e', fontSize: '14px' }}>{user.full_name || "Membro da comunidade"}</div>
                </div>
              </div>
              <button 
                onClick={() => navigate(`/profile/${user.id}`)}
                style={{ 
                  background: '#0095f6', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '8px', 
                  padding: '7px 16px', 
                  fontSize: '14px', 
                  fontWeight: '600', 
                  cursor: 'pointer' 
                }}
              >
                Ver Perfil
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
