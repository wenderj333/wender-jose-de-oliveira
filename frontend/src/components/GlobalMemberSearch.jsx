import React, { useEffect, useRef, useState } from 'react';
import { Search, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const API = (import.meta.env.VITE_API_URL || '') + '/api';

export default function GlobalMemberSearch({ mobile = false }) {
  const { token } = useAuth();
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const close = event => { if (!containerRef.current?.contains(event.target)) setOpen(false); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  useEffect(() => {
    const clean = query.trim();
    if (clean.length < 2) { setResults([]); setLoading(false); return; }
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const response = await fetch(`${API}/members?q=${encodeURIComponent(clean)}`, {
          headers: { Authorization: `Bearer ${token || localStorage.getItem('token')}` },
          signal: controller.signal
        });
        const data = await response.json();
        if (response.ok) setResults((data.members || []).slice(0, 8));
      } catch (error) {
        if (error.name !== 'AbortError') setResults([]);
      } finally { setLoading(false); }
    }, 250);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [query, token]);

  const choose = id => {
    setOpen(false);
    setQuery('');
    navigate(`/perfil/${id}`);
  };

  return <div ref={containerRef} className={mobile ? 'global-member-search' : 'global-member-search desktop-only'} style={{ position: 'relative', width: mobile ? '100%' : 'min(320px, 28vw)' }}>
    <div style={{ display: 'flex', alignItems: 'center', background: '#fff', borderRadius: 18, padding: '5px 10px', gap: 7 }}>
      <Search size={15} color="#53706a" />
      <input value={query} onFocus={() => setOpen(true)} onChange={event => { setQuery(event.target.value); setOpen(true); }} placeholder="Buscar pessoas..." aria-label="Buscar pessoas" style={{ border: 0, outline: 0, minWidth: 0, width: '100%', fontSize: 13, background: 'transparent' }} />
      {query && <button type="button" onClick={() => { setQuery(''); setResults([]); }} aria-label="Limpar busca" style={{ border: 0, background: 'transparent', cursor: 'pointer', display: 'grid', padding: 0 }}><X size={14}/></button>}
    </div>
    {open && query.trim().length >= 2 && <div style={{ position: 'absolute', top: 'calc(100% + 8px)', left: 0, right: 0, background: '#fff', color: '#273b37', border: '1px solid #dce7e2', borderRadius: 14, boxShadow: '0 12px 32px rgba(26,55,46,.18)', overflow: 'hidden', zIndex: 500 }}>
      {loading ? <div style={{ padding: 14, fontSize: 13 }}>Buscando...</div> : results.length ? results.map(person => <button type="button" key={person.id} onClick={() => choose(person.id)} style={{ width: '100%', border: 0, borderBottom: '1px solid #edf2ef', background: '#fff', padding: '10px 12px', display: 'flex', gap: 10, alignItems: 'center', cursor: 'pointer', textAlign: 'left' }}>
        <img src={person.avatar_url || '/pro.jpg'} onError={event => { event.currentTarget.src = '/pro.jpg'; }} alt="" style={{ width: 34, height: 34, borderRadius: '50%', objectFit: 'cover' }} />
        <span><strong style={{ display: 'block', fontSize: 13 }}>{person.full_name}</strong><small style={{ color: '#758681' }}>{person.role === 'pastor' ? 'Pastor' : 'Membro'}</small></span>
      </button>) : <div style={{ padding: 14, fontSize: 13 }}>Nenhuma pessoa encontrada.</div>}
    </div>}
  </div>;
}
