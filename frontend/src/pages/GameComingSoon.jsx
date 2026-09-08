import React from 'react';
import { Link } from 'react-router-dom';
export default function GameComingSoon() {
  return <main style={{minHeight:'100vh',display:'grid',placeItems:'center',padding:24,background:'linear-gradient(145deg,#f8f6ff,#eef7f1)'}}><section style={{maxWidth:460,textAlign:'center',background:'#fff',borderRadius:20,padding:24,boxShadow:'0 12px 30px rgba(54,36,91,.12)'}}><img src="/game-covers/guardiao-da-palavra.png" alt="Guardião da Palavra" style={{width:'100%',height:150,objectFit:'cover',borderRadius:14}}/><h1 style={{color:'#3d2165'}}>Guardião da Palavra</h1><p style={{color:'#5d687d',lineHeight:1.6}}>Este jogo está sendo preparado. Em breve você poderá jogar e proteger a Palavra.</p><Link to="/jogos" style={{display:'inline-block',padding:'10px 18px',borderRadius:10,background:'#633da0',color:'#fff',textDecoration:'none',fontWeight:800}}>Voltar aos jogos</Link></section></main>;
}
