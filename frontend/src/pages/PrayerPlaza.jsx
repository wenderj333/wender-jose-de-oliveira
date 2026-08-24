import React, { useEffect, useMemo, useState } from 'react';
import { HeartHandshake, Radio, Users, MessageCircle, HandHeart, X, Play, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useWebSocket } from '../context/WebSocketContext';

const activityFor = (session, index) => {
  const viewers = Number(session.viewer_count || session.viewerCount || 0);
  const minutes = Math.max(1, Math.round((Date.now() - new Date(session.started_at || session.startedAt || Date.now()).getTime()) / 60000));
  return Math.min(100, 40 + viewers * 9 + Math.min(25, minutes));
};

export default function PrayerPlaza() {
  const { user } = useAuth();
  const { liveSessions = [], totalChurchesPraying = 0, send, on, off } = useWebSocket();
  const [selected, setSelected] = useState(null);
  const [mySessionId, setMySessionId] = useState(null);
  const [focus, setFocus] = useState('');
  const isLeader = ['pastor', 'admin'].includes(user?.role);
  const active = useMemo(() => liveSessions.map((session, index) => ({ ...session, activity: activityFor(session, index) })), [liveSessions]);

  useEffect(() => {
    const receive = (event) => {
      if (event.action === 'started' && String(event.session?.pastorId) === String(user?.id)) setMySessionId(event.session.id);
      if (event.action === 'stopped' && event.sessionId === mySessionId) setMySessionId(null);
    };
    on('pastor_praying', receive);
    return () => off('pastor_praying', receive);
  }, [mySessionId, off, on, user?.id]);

  const start = () => {
    if (!user?.churchId && !user?.church_id) return window.alert('Primeiro cria ou associa a tua igreja na Sala do Pastor.');
    send({ type: 'pastor_start_praying', pastorId: user.id, churchId: user.churchId || user.church_id, churchName: user.church_name || 'Minha igreja', pastorName: user.full_name, prayerFocus: focus });
  };

  return (
    <div className="prayer-plaza">
      <section className="prayer-plaza__hero">
        <span><Sparkles size={17}/> Sigo com Fé · unidos em oração</span>
        <h1>Praça Mundial de Oração</h1>
        <p>Igrejas de diferentes lugares orando juntas pelas pessoas. Cada bolha é uma igreja numa sessão real de oração.</p>
        <div className="prayer-plaza__stats"><strong><Radio size={18}/> {totalChurchesPraying} igreja{totalChurchesPraying === 1 ? '' : 's'} em oração agora</strong><span><Users size={18}/> Toque numa bolha para participar</span></div>
      </section>

      <section className="prayer-plaza__map" aria-label="Igrejas orando agora">
        <div className="prayer-plaza__legend"><span className="low"/> oração iniciada <span className="mid"/> participação a crescer <span className="high"/> muita atividade</div>
        {active.length === 0 ? (
          <div className="prayer-plaza__empty"><HandHeart size={48}/><h2>A praça está a aguardar a primeira igreja</h2><p>Quando um pastor iniciar uma oração, a igreja aparecerá aqui em verde.</p>{isLeader && <button onClick={start}><Radio size={18}/> Iniciar oração da minha igreja</button>}</div>
        ) : active.map((session, index) => {
          const size = 128 + Math.min(62, session.activity);
          const position = [{ left: '8%', top: '15%' }, { left: '58%', top: '12%' }, { left: '31%', top: '43%' }, { left: '70%', top: '52%' }, { left: '12%', top: '67%' }][index % 5];
          const color = session.activity > 78 ? 'high' : session.activity > 58 ? 'mid' : 'low';
          return <button key={session.id} className={`prayer-plaza__bubble ${color}`} onClick={() => setSelected(session)} style={{ ...position, width: size, height: size }}>
            <span className="prayer-plaza__pulse"/><Radio size={20}/><b>{session.church_name || session.churchName || 'Igreja em oração'}</b><small>{session.viewer_count || 0} a orar junto</small><em>AO VIVO</em>
          </button>;
        })}
      </section>

      <section className="prayer-plaza__actions">
        <Link to="/ajuda-uma-vida"><HeartHandshake size={22}/><span><b>Pedir oração</b><small>Partilha o teu pedido com respeito e privacidade.</small></span></Link>
        <Link to="/comunidade-ao-vivo"><MessageCircle size={22}/><span><b>Chat de oração</b><small>Conversa, agradece e apoia a comunidade.</small></span></Link>
        {isLeader && <button onClick={mySessionId ? () => send({ type: 'pastor_stop_praying', sessionId: mySessionId }) : start}><Radio size={22}/><span><b>{mySessionId ? 'Terminar minha oração' : 'Minha igreja vai orar'}</b><small>Faz a tua igreja aparecer na praça.</small></span></button>}
      </section>

      {isLeader && !mySessionId && <div className="prayer-plaza__leader"><label>Foco da oração (opcional)</label><input value={focus} onChange={(e) => setFocus(e.target.value)} placeholder="Ex.: famílias, saúde, cidade..."/></div>}

      {selected && <div className="prayer-plaza__modal" role="dialog" aria-modal="true"><div><button className="close" onClick={() => setSelected(null)} aria-label="Fechar"><X/></button><span className="live"><Radio size={16}/> oração ao vivo</span><h2>{selected.church_name || selected.churchName}</h2><p>Conduzida por {selected.pastor_name || selected.pastorName || 'um pastor'}.</p>{(selected.prayer_focus || selected.prayerFocus) && <blockquote>“{selected.prayer_focus || selected.prayerFocus}”</blockquote>}<button className="join" onClick={() => { setSelected(null); window.location.hash = 'orar-junto'; }}><HandHeart size={19}/> Entrar para orar junto</button><small>O áudio/vídeo aparece aqui apenas quando a igreja iniciar uma transmissão. Nunca mostramos uma transmissão sem autorização.</small></div></div>}
    </div>
  );
}
