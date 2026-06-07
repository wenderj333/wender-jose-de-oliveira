import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';

export default function Ranking() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [ranking, setRanking] = useState([]);
  const [periodo, setPeriodo] = useState('semana');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch((import.meta.env.VITE_API_URL||'')+ '/api/quiz/ranking?periodo='+periodo)
      .then(r=>r.json())
      .then(d=>{ if(Array.isArray(d)) setRanking(d); setLoading(false); })
      .catch(()=>setLoading(false));
  }, [periodo]);

  return (
    <div style={{ maxWidth:600, margin:'0 auto', padding:24 }}>
      <h1 style={{ fontSize:24, fontWeight:900, marginBottom:4 }}>🏆 Ranking Biblico</h1>
      <p style={{ color:'var(--muted)', marginBottom:20, fontSize:14 }}>Top 10 jogadores do Desafio Biblico</p>
      <div style={{ display:'flex', gap:8, marginBottom:20 }}>
        {['hoje','semana','mes'].map(p=>(
          <button key={p} onClick={()=>setPeriodo(p)} style={{ padding:'8px 18px', borderRadius:20, border:'none', background:periodo===p?'#6c47d4':'var(--card)', color:periodo===p?'white':'var(--text)', fontWeight:700, cursor:'pointer', fontSize:14 }}>{p}</button>
        ))}
      </div>
      {loading ? <p style={{ textAlign:'center', color:'var(--muted)' }}>A carregar...</p> :
      ranking.length===0 ? (
        <div style={{ textAlign:'center', padding:40 }}>
          <div style={{ fontSize:60, marginBottom:16 }}>🎮</div>
          <p style={{ color:'var(--muted)', fontSize:16 }}>Ainda nao ha jogadores! Se o primeiro!</p>
        </div>
      ) : (
        <div>
          {ranking.map((j,i)=>(
            <div key={j.id} style={{ display:'flex', alignItems:'center', gap:16, padding:16, marginBottom:10, background:user?.id===j.id?'rgba(108,71,212,0.1)':'var(--card)', borderRadius:14, border:user?.id===j.id?'2px solid #6c47d4':'1px solid var(--border)' }}>
              <span style={{ fontSize:32, width:40, textAlign:'center' }}>{i<3?['🥇','🥈','🥉'][i]:'#'+(i+1)}</span>
              {j.avatar_url?<img src={j.avatar_url} style={{ width:48,height:48,borderRadius:'50%',objectFit:'cover' }}/>:<div style={{ width:48,height:48,borderRadius:'50%',background:'#6c47d4',display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,color:'white',fontWeight:700 }}>{j.full_name?.charAt(0)}</div>}
              <div style={{ flex:1 }}>
                <p style={{ fontWeight:700, fontSize:16, margin:0, color:user?.id===j.id?'#6c47d4':'var(--text)' }}>{j.full_name}</p>
                <p style={{ fontSize:12, color:'var(--muted)', margin:0 }}>{j.partidas} partidas · ⚡ {j.tempo_medio}s</p>
              </div>
              <div style={{ textAlign:'right' }}>
                <p style={{ fontSize:22, fontWeight:900, color:'#f0c040', margin:0 }}>{j.total_pontos}</p>
                <p style={{ fontSize:11, color:'var(--muted)', margin:0 }}>pontos</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}