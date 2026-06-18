import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
export default function TokenLogin() {
  const navigate = useNavigate();
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("t");
    const user = params.get("u");
    if (token) localStorage.setItem("token", token);
    if (user) try { localStorage.setItem("user", decodeURIComponent(user)); } catch(e) {}
    navigate("/configuracoes");
  }, []);
  return <div style={{padding:40,textAlign:"center"}}>A carregar...</div>;
}