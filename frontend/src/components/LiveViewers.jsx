import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
const MOCK_VIEWERS = [
  { id:1, initials:"MS", name:"Maria S.", color:"#e74c3c" },
  { id:2, initials:"JP", name:"Joao P.", color:"#3498db" },
  { id:3, initials:"AC", name:"Ana C.", color:"#27ae60" },
  { id:4, initials:"CM", name:"Carlos M.", color:"#9b59b6" },
  { id:5, initials:"LR", name:"Lucia R.", color:"#f39c12" },
  { id:6, initials:"PA", name:"Pedro A.", color:"#e67e22" },
  { id:7, initials:"ST", name:"Sara T.", color:"#1abc9c" },
  { id:8, initials:"MF", name:"Miguel F.", color:"#c0392b" },
];
export default function LiveViewers({ activeLive }) {
  const navigate = useNavigate();
  const [viewers, setViewers] = useState([]);
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!activeLive) return;
    const n = Math.floor(Math.random()*6)+3;
    setViewers(MOCK_VIEWERS.slice(0,n));
    setCount(n + Math.floor(Math.random()*20));
    const i = setInterval(() => {
      const m = Math.floor(Math.random()*6)+3;
      setViewers(MOCK_VIEWERS.slice(0,m));
      setCount(prev => Math.max(3, prev + Math.floor(Math.random()*3)-1));
    }, 8000);
    return () => clearInterval(i);
  }, [activeLive]);
  if (!activeLive) return null;
  const extra = count > 6 ? count - 6 : 0;
  return (
    React.createElement("div", {
      onClick: () => navigate("/live-stream"),
      style: { background:"linear-gradient(135deg,#1a0a2e,#2d1054)", borderBottom:"2px solid #e74c3c", padding:"10px 16px", display:"flex", alignItems:"center", gap:12, cursor:"pointer", position:"sticky", top:0, zIndex:100 }
    },
      React.createElement("div", { style:{ display:"flex", alignItems:"center", gap:6, flexShrink:0 } },
        React.createElement("div", { style:{ width:10, height:10, background:"#e74c3c", borderRadius:"50%" } }),
        React.createElement("span", { style:{ color:"white", fontSize:12, fontWeight:800 } }, "AO VIVO")
      ),
      React.createElement("div", { style:{ display:"flex", alignItems:"center" } },
        ...viewers.slice(0,6).map((v,i) => React.createElement("div", { key:v.id, title:v.name, style:{ width:34, height:34, borderRadius:"50%", border:"2px solid #1a0a2e", marginLeft:i===0?0:-10, background:v.color, display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:700, color:"white", flexShrink:0, zIndex:10-i } }, v.initials)),
        extra > 0 ? React.createElement("div", { style:{ width:34, height:34, borderRadius:"50%", border:"2px solid #1a0a2e", marginLeft:-10, background:"rgba(255,255,255,0.15)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, fontWeight:700, color:"white", flexShrink:0 } }, "+" + extra) : null
      ),
      React.createElement("div", { style:{ flex:1, minWidth:0 } },
        React.createElement("p", { style:{ color:"white", fontSize:13, fontWeight:700, margin:0, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" } }, activeLive.user_name),
        React.createElement("p", { style:{ color:"rgba(255,255,255,0.7)", fontSize:11, margin:0 } }, count + " pessoas a ver")
      ),
      React.createElement("button", { style:{ padding:"6px 14px", borderRadius:20, border:"none", background:"#e74c3c", color:"white", fontSize:12, fontWeight:700, cursor:"pointer", flexShrink:0 } }, "Entrar")
    )
  );
}