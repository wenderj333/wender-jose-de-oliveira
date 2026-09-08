import React from 'react';
import { Link } from 'react-router-dom';

const GAME_URL = 'https://playground-gateway-v2-snduoq54tq-uc.a.run.app/api/server/05d6ed6e-2d8f-4a0d-abdf-941ad29c4540/index.html';
export default function GameComingSoon() {
  return <main style={{minHeight:'100vh',display:'grid',placeItems:'center',padding:24,background:'linear-gradient(145deg,#f8f6ff,#eef7f1)'}}><section style={{maxWidth:460,textAlign:'center',background:'#fff',borderRadius:20,padding:24,boxShadow:'0 12px 30px rgba(54,36,91,.12)'}}><img src="/game-covers/guardiao-da-palavra.png" alt="Guardião da Palavra" style={{width:'100%',height:150,objectFit:'cover',borderRadius:14}}/><h1 style={{color:'#3d2165'}}>Guardião da Palavra</h1><p style={{color:'#5d687d',lineHeight:1.6}}>Clique para entrar no jogo e começar sua jornada bíblica.</p><a href={GAME_URL} style={{display:'inline-block',padding:'10px 18px',borderRadius:10,background:'#633da0',color:'#fff',textDecoration:'none',fontWeight:800}}>Abrir o jogo</a><div><Link to="/jogos" style={{display:'inline-block',marginTop:12,color:'#633da0',fontWeight:700}}>Voltar aos jogos</Link></div></section></main>;
}
