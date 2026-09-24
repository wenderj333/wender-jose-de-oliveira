import React, { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { t } = useTranslation();
  const { user, login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const returnTo = location.pathname.startsWith("/mensagens/") ? `${location.pathname}${location.search}` : "/mural";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  React.useEffect(() => { if (user) navigate(returnTo, { replace: true }); }, [user, returnTo, navigate]);
  const handleGoogle = async () => {
    try { setLoading(true); setError(""); const result = await loginWithGoogle(); if (result) navigate(returnTo, { replace: true }); }
    catch (err) { if (err.code !== 'auth/popup-closed-by-user') setError(t("authUi.googleError")); }
    finally { setLoading(false); }
  };
  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true); setError("");
    try { await login(email.trim().toLowerCase(), password); navigate(returnTo, { replace: true }); }
    catch (err) { setError(t("authUi.loginError")); }
    setLoading(false);
  };
  return (
    <div style={{ minHeight:"100vh", background:"#f8f9ff", display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div style={{ background:"white", borderRadius:20, padding:40, maxWidth:420, width:"100%", boxShadow:"0 8px 32px rgba(0,0,0,0.12)" }}>
        <div style={{ textAlign:"center", marginBottom:32 }}>
          <img alt="Sigo com Fé" src="/logo-new.png" style={{ height:60, width:60, borderRadius:12 }} />
          <h1 style={{ color:"#6C3FA0", fontSize:24, fontWeight:800 }}>Sigo com Fé</h1>
        </div>
        {error && <div role="alert" style={{ background:"#fff0f0", padding:10, borderRadius:8, color:"#c00", marginBottom:16 }}>{error}</div>}
        <button disabled={loading} onClick={handleGoogle} style={{ width:"100%", padding:"12px", borderRadius:10, border:"1px solid #ddd", cursor:"pointer", fontWeight:600, marginBottom:20, fontSize:15 }}>{t('login.google')}</button>
        <p style={{ margin:"-10px 0 18px", color:"#6b6180", fontSize:12, lineHeight:1.4, textAlign:"center" }}>{t('authUi.googleHelp')}</p>
        <form onSubmit={handleSubmit}>
          <input type="email" autoComplete="email" aria-label={t("login.email")} placeholder={t("login.email")} value={email} onChange={e=>setEmail(e.target.value)} required style={{ width:"100%", padding:"12px", borderRadius:10, border:"1.5px solid #e0d0f0", marginBottom:12, boxSizing:"border-box", fontSize:15 }} />
          <input type="password" autoComplete="current-password" aria-label={t("login.password")} placeholder={t("login.password")} value={password} onChange={e=>setPassword(e.target.value)} required style={{ width:"100%", padding:"12px", borderRadius:10, border:"1.5px solid #e0d0f0", marginBottom:20, boxSizing:"border-box", fontSize:15 }} />
          <button disabled={loading} type="submit" style={{ width:"100%", padding:"13px", borderRadius:10, border:"none", background:"#6C3FA0", color:"white", fontWeight:700, fontSize:16 }}>{loading ? t('authUi.busy') : t('login.submit')}</button>
        </form>
        <div style={{ textAlign:"center", marginTop:14 }}><Link to="/forgot-password" style={{ color:"#6C3FA0", fontSize:14, fontWeight:600 }}>{t('authUi.forgot')}</Link></div>
        <div style={{ textAlign:"center", marginTop:20, fontSize:14 }}>{t("login.noAccount", "Ainda não tem conta?")} <Link to="/register" style={{ color:"#6C3FA0" }}>{t('register.submit')}</Link></div>
        <div style={{ textAlign:"center", marginTop:8 }}><Link to="/" style={{ color:"#aaa", fontSize:13 }}>{t('authUi.back')}</Link></div>
      </div>
    </div>
  );
}
