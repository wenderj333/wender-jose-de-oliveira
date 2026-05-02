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
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    async function fetchMembers() {
      try {
        const t = token || localStorage.getItem('token');
        const res = await fetch(`${API}/members`, {
          headers: { Authorization: "Bearer " + t }
        });
        if (!res.ok) { setLoading(false); return; }
        const data = await res.json();
        const userList = Array.isArray(data) ? data : (data.members || data.users || []);
        setUsers(userList);
      } catch (err) {
        console.error("Erro:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchMembers();
  }, [token]);

  const filtered = users.filter(u =>
    u.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return (
    <div style={{ display:'flex', justifyContent:'center', alignItems:'center', height:'50vh' }}>
      <Loader2 className="animate-spin" size={32} color="#6c63ff" />
    </div>
  );

  return (
    <div style={{ maxWidth:"900px", margin:"0 auto", padding:"24px 16px" }}>
      <h2 style={{ fontSize:"22px", fontWeight:"800", marginBottom:"20px", color:"#1a1a1a" }}>
        🙏 Membros da Comunidade
      </h2>

      {/* Pesquisa */}
      <div style={{ position:'relative', marginBottom:'28px' }}>
        <Search style={{ position:'absolute', left:'14px', top:'50%', transform:'translateY(-50%)', color:'#aaa' }} size={18} />
        <input
          type="text"
          placeholder="Pesquisar membro..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          style={{
            width:'100%', padding:'12px 12px 12px 44px',
            borderRadius:'12px', border:'1px solid #e0e0e0',
            background:'#f7f7f7', fontSize:'15px', outline:'none',
            boxSizing:'border-box'
          }}
        />
      </div>

      {/* Grid de Cards */}
      <div style={{
        display:'grid',
        gridTemplateColumns:'repeat(auto-fill, minmax(160px, 1fr))',
        gap:'16px'
      }}>
        {filtered.length === 0 ? (
          <p style={{ color:'#aaa', gridColumn:'1/-1', textAlign:'center' }}>Nenhum membro encontrado.</p>
        ) : (
          filtered.map(user => (
            <div
              key={user.id}
              onClick={() => navigate(`/profile/${user.id}`)}
              style={{
                background:'#fff',
                borderRadius:'16px',
                boxShadow:'0 2px 12px rgba(0,0,0,0.08)',
                padding:'20px 12px',
                display:'flex',
                flexDirection:'column',
                alignItems:'center',
                gap:'10px',
                cursor:'pointer',
                transition:'transform 0.15s, box-shadow 0.15s',
                border:'1px solid #f0f0f0'
              }}
              onMouseEnter={e => { e.currentTarget.style.transform='translateY(-4px)'; e.currentTarget.style.boxShadow='0 6px 20px rgba(108,99,255,0.15)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='0 2px 12px rgba(0,0,0,0.08)'; }}
            >
              {/* Avatar */}
              <div style={{
                width:'72px', height:'72px', borderRadius:'50%',
                overflow:'hidden',
                border:'3px solid #6c63ff',
                boxShadow:'0 0 0 3px #e8e6ff'
              }}>
                <img
                  src={user.avatar_url || "/pro.jpg"}
                  style={{ width:'100%', height:'100%', objectFit:'cover' }}
                  onError={e => { e.target.src="https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y"; }}
                />
              </div>

              {/* Nome */}
              <div style={{ textAlign:'center' }}>
                <div style={{ fontWeight:'700', fontSize:'14px', color:'#1a1a1a' }}>{user.username}</div>
                <div style={{ fontSize:'12px', color:'#999', marginTop:'2px' }}>{user.full_name || "Membro"}</div>
              </div>

              {/* Botão */}
              <button style={{
                background:'linear-gradient(135deg, #6c63ff, #a78bfa)',
                color:'white', border:'none',
                borderRadius:'20px', padding:'6px 18px',
                fontSize:'12px', fontWeight:'600', cursor:'pointer',
                width:'100%'
              }}>
                Ver Perfil
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
