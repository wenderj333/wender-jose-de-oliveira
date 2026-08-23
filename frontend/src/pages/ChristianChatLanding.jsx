import React, { useEffect } from 'react';
import { ArrowRight, Heart, MessageCircle, ShieldCheck, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getChristianChatCopy } from '../i18n/christianChatCopy';

export default function ChristianChatLanding() {
  const { i18n } = useTranslation();
  const c = getChristianChatCopy(i18n.language);
  useEffect(() => {
    const oldTitle = document.title;
    const description = document.querySelector('meta[name="description"]');
    const oldDescription = description?.content;
    document.title = `${c.publicTitle} — Sigo com Fé`;
    if (description) description.content = c.publicDesc;
    return () => { document.title = oldTitle; if (description && oldDescription) description.content = oldDescription; };
  }, [c]);

  const featureStyle = { background: '#fff', border: '1px solid #e0e6f5', borderRadius: 18, padding: 22, boxShadow: '0 8px 24px rgba(53,104,184,.08)' };
  return <main style={{ minHeight: '100vh', background: 'linear-gradient(180deg,#f5f8ff 0%,#fff 60%)', color: '#1e2240', padding: '20px 18px 56px' }}>
    <nav style={{ maxWidth: 1050, margin: '0 auto 55px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 14 }}><Link to="/" style={{ color: '#3568b8', fontWeight: 900, fontSize: '1.35rem', textDecoration: 'none' }}>{c.brand}</Link><div style={{ display: 'flex', gap: 10 }}><Link to="/login" style={{ textDecoration: 'none', color: '#3568b8', fontWeight: 700, padding: '10px 14px' }}>{c.signIn}</Link><Link to="/register" style={{ textDecoration: 'none', background: '#3568b8', color: '#fff', borderRadius: 10, fontWeight: 700, padding: '10px 14px' }}>{c.createAccount}</Link></div></nav>
    <section style={{ maxWidth: 850, margin: '0 auto', textAlign: 'center' }}><span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: '#eaf2ff', color: '#3568b8', borderRadius: 999, padding: '8px 13px', fontWeight: 800, fontSize: 13 }}><MessageCircle size={16}/> {c.publicBadge}</span><h1 style={{ margin: '18px 0 13px', fontSize: 'clamp(2.1rem,6vw,4.2rem)', lineHeight: 1.05 }}>{c.publicTitle}</h1><p style={{ maxWidth: 650, margin: '0 auto', color: '#59627d', fontSize: '1.14rem', lineHeight: 1.65 }}>{c.publicDesc}</p><div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap', marginTop: 28 }}><Link to="/register" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#3568b8', borderRadius: 12, color: '#fff', padding: '14px 19px', textDecoration: 'none', fontWeight: 800 }}>{c.enterFree} <ArrowRight size={18}/></Link><Link to="/comunidade-ao-vivo" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#fff', border: '1px solid #cfd9ee', borderRadius: 12, color: '#3568b8', padding: '14px 19px', textDecoration: 'none', fontWeight: 800 }}>{c.explore}</Link></div></section>
    <section className="christian-chat-features" style={{ maxWidth: 920, margin: '56px auto 0', display: 'grid', gridTemplateColumns: 'repeat(3,minmax(0,1fr))', gap: 16 }}><article style={featureStyle}><Heart color="#c49a28"/><h2 style={{ fontSize: '1.05rem' }}>{c.prayer}</h2><p style={{ color: '#667085', lineHeight: 1.55, marginBottom: 0 }}>{c.prayerDesc}</p></article><article style={featureStyle}><ShieldCheck color="#3568b8"/><h2 style={{ fontSize: '1.05rem' }}>{c.respectful}</h2><p style={{ color: '#667085', lineHeight: 1.55, marginBottom: 0 }}>{c.respectfulDesc}</p></article><article style={featureStyle}><Sparkles color="#6c3fa0"/><h2 style={{ fontSize: '1.05rem' }}>{c.faith}</h2><p style={{ color: '#667085', lineHeight: 1.55, marginBottom: 0 }}>{c.faithDesc}</p></article></section>
    <section style={{ maxWidth: 780, margin: '50px auto 0', background: '#1e3d6e', color: '#fff', borderRadius: 20, padding: '27px 30px', textAlign: 'center' }}><h2 style={{ marginTop: 0 }}>{c.voice}</h2><p style={{ margin: '0 0 17px', opacity: .9, lineHeight: 1.55 }}>{c.voiceDesc}</p><Link to="/register" style={{ display: 'inline-block', background: '#f0c040', color: '#1e2240', borderRadius: 10, padding: '12px 17px', textDecoration: 'none', fontWeight: 900 }}>{c.createFree}</Link></section>
    <style>{`@media(max-width:700px){.christian-chat-features{grid-template-columns:1fr !important}}`}</style>
  </main>;
}
