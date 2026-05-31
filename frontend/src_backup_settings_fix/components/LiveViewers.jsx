import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const MOCK_VIEWERS = [
  { id:1, initials:'MS', color:'#e74c3c' },
  { id:2, initials:'JP', color:'#3498db' },
  { id:3, initials:'AC', color:'#27ae60' },
  { id:4, initials:'CM', color:'#9b59b6' },
  { id:5, initials:'LR', color:'#f39c12' },
  { id:6, initials:'PA', color:'#e67e22' },
];

export default function LiveViewers({ activeLive }) {
  const navigate = useNavigate();
  const [viewers, setViewers] = useState([]);
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!activeLive) return;
    const n = Math.floor(Math.random()*4)+2;
    setViewers(MOCK_VIEWERS.slice(0,n));
    setCount(n + Math.floor(Math.random()*15));
    const i = setInterval(() => {
      setCount(prev => Math.max(2, prev + Math.floor(Math.random()*3)-1));
    }, 8000);
    return () => clearInterval(i);
  }, [activeLive]);

  if (!activeLive) return null;

  return (
    <div onClick={() => navigate('/live-stream')}
      style={{ background:'linear-gradient(135deg,#1a0a2e,#2d1054)', borderBottom:'2px solid #e74c3c', padding:'10px 16px', display:'flex', alignItems:'center', gap:12, cursor:'pointer', position:'sticky', top:0, zIndex:100 }}>
      <div style={{ display:'flex', alignItems:'center', gap:6, flexShrink:0 }}>
        <div style={{ width:10, height:10, background:'#e74c3c', borderRadius:'50%' }} />
        <span style={{ color:'white', fontSize:12, fontWeight:800 }}>AO VIVO</span>
      </div>
      <div style={{ display:'flex', alignItems:'center' }}>
        {viewers.map((v,i) => (
          <div key={v.id} style={{ width:32, height:32, borderRadius:'50%', border:'2px solid #1a0a2e', marginLeft:i===0?0:-8, background:v.color, display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:700, color:'white', flexShrink:0 }}>
            {v.initials}
          </div>
        ))}
        {count > 6 && (
          <div style={{ width:32, height:32, borderRadius:'50%', border:'2px solid #1a0a2e', marginLeft:-8, background:'rgba(255,255,255,0.15)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, color:'white', flexShrink:0 }}>
            +{count-6}
          </div>
        )}
      </div>
      <div style={{ flex:1, minWidth:0 }}>
        <p style={{ color:'white', fontSize:13, fontWeight:700, margin:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{activeLive?.user_name}</p>
        <p style={{ color:'rgba(255,255,255,0.7)', fontSize:11, margin:0 }}>{count} a ver</p>
      </div>
      <button style={{ padding:'6px 14px', borderRadius:20, border:'none', background:'#e74c3c', color:'white', fontSize:12, fontWeight:700, cursor:'pointer', flexShrink:0 }}>Entrar</button>
    </div>
  );
}