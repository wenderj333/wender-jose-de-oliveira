import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { user, login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  React.useEffect(() => { if (user) navigate("/mural"); }, [user]);
  const handleGoogle = async () => {
    try { await loginWithGoogle(); navigate("/mural"); }
    catch (err) { setError("Erro ao entrar com Google"); }
  };
  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true); setError("");
    try { await login(email, password); navigate("/mural"); }
    catch (err) { setError("Email ou senha incorretos"); }
    setLoading(false);
  };
  return (
    <div style={{ minHeight:"100vh", background:"#f8f9ff", display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div style={{ background:"white", borderRadius:20, padding:40, maxWidth:420, width:"100%", boxShadow:"0 8px 32px rgba(0,0,0,0.12)" }}>
        <div style={{ textAlign:"center", marginBottom:32 }}>
          <img src="/logo-new.png" style={{ height:60, width:60, borderRadius:12 }} />
          <h1 style={{ color:"#6C3FA0", fontSize:24, fontWeight:800 }}>Sigo com Fe</h1>
        </div>
        {error && <div style={{ background:"#fff0f0", padding:10, borderRadius:8, color:"#c00", marginBottom:16 }}>{error}</div>}
        <button onClick={handleGoogle} style={{ width:"100%", padding:"12px", borderRadius:10, border:"1px solid #ddd", cursor:"pointer", fontWeight:600, marginBottom:20, fontSize:15 }}>Entrar com Google</button>
        <form onSubmit={handleSubmit}>
          <input type="email" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} required style={{ width:"100%", padding:"12px", borderRadius:10, border:"1.5px solid #e0d0f0", marginBottom:12, boxSizing:"border-box", fontSize:15 }} />
          <input type="password" placeholder="Senha" value={password} onChange={e=>setPassword(e.target.value)} required style={{ width:"100%", padding:"12px", borderRadius:10, border:"1.5px solid #e0d0f0", marginBottom:20, boxSizing:"border-box", fontSize:15 }} />
          <button type="submit" style={{ width:"100%", padding:"13px", borderRadius:10, border:"none", background:"#6C3FA0", color:"white", fontWeight:700, fontSize:16 }}>{loading ? "Entrando..." : "Entrar"}</button>
        </form>
        <div style={{ textAlign:"center", marginTop:20, fontSize:14 }}>Nao tens conta? <Link to="/register" style={{ color:"#6C3FA0" }}>Criar conta</Link></div>
        <div style={{ textAlign:"center", marginTop:8 }}><Link to="/" style={{ color:"#aaa", fontSize:13 }}>Voltar</Link></div>
      </div>
    </div>
  );
}
