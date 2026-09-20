import React, { useEffect, useMemo, useRef, useState } from 'react';
import { HeartHandshake, Radio, Users, MessageCircle, HandHeart, X, Sparkles, Send, Share2, Volume2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { useWebSocket } from '../context/WebSocketContext';

const activityFor = (session, index) => {
  const viewers = Number(session.viewer_count || session.viewerCount || 0);
  const minutes = Math.max(1, Math.round((Date.now() - new Date(session.started_at || session.startedAt || Date.now()).getTime()) / 60000));
  return Math.min(100, 40 + viewers * 9 + Math.min(25, minutes));
};

// Exemplos visuais: não são igrejas reais, não recebem pedidos e desaparecem
// assim que houver uma sessão real de oração em andamento.
const DEMO_CHURCHES = [
  { id: 'demo-esperanca', church_name: 'Igreja Esperança Viva', pastor_name: 'Equipe de oração', prayer_focus: 'Famílias e esperança', campaign_name: '7 dias de gratidão', campaign_day: 2, campaign_total: 7, viewer_count: 18, activity: 62, is_demo: true },
  { id: 'demo-caminho', church_name: 'Comunidade Caminho de Luz', pastor_name: 'Equipe de oração', prayer_focus: 'Paz e saúde', campaign_name: 'Paz para as cidades', campaign_day: 4, campaign_total: 7, viewer_count: 11, activity: 54, is_demo: true },
  { id: 'demo-fonte', church_name: 'Igreja Fonte de Vida', pastor_name: 'Equipe de oração', prayer_focus: 'Jovens e cidades', campaign_name: 'Geração com propósito', campaign_day: 1, campaign_total: 7, viewer_count: 24, activity: 79, is_demo: true },
];

const PLAZA_COPY = {
  pt: { title: 'Oração Mundial', intro: 'Igrejas de diferentes lugares orando juntas pelas pessoas. Toque numa igreja para conhecer o seu momento de oração.', praying: 'em oração agora', touch: 'Toque numa bolha para participar', demo: '3 igrejas de demonstração para conhecer a praça', request: 'Pedir oração', chat: 'Chat de oração', start: 'Minha igreja vai orar', stop: 'Terminar minha oração', example: 'Exemplo de igreja na praça', live: 'AO VIVO', demoLabel: 'DEMONSTRAÇÃO' },
  es: { title: 'Oración Mundial', intro: 'Iglesias de distintos lugares orando juntas por las personas. Toca una iglesia para conocer su momento de oración.', praying: 'iglesias orando ahora', touch: 'Toca una esfera para participar', demo: '3 iglesias de demostración para conocer la plaza', request: 'Pedir oración', chat: 'Chat de oración', start: 'Mi iglesia va a orar', stop: 'Terminar mi oración', example: 'Ejemplo de iglesia en la plaza', live: 'EN VIVO', demoLabel: 'DEMOSTRACIÓN' },
  en: { title: 'World Prayer', intro: 'Churches from different places praying together for people. Tap a church to learn about its prayer moment.', praying: 'churches praying now', touch: 'Tap a bubble to join', demo: '3 demo churches to explore the plaza', request: 'Request prayer', chat: 'Prayer chat', start: 'My church will pray', stop: 'End my prayer', example: 'Example church in the plaza', live: 'LIVE', demoLabel: 'DEMONSTRATION' },
  de: { title: 'Weltgebet', intro: 'Gemeinden aus verschiedenen Orten beten gemeinsam für Menschen. Tippe auf eine Gemeinde, um ihren Gebetsmoment kennenzulernen.', praying: 'Gemeinden beten jetzt', touch: 'Tippe auf eine Kugel, um teilzunehmen', demo: '3 Beispielgemeinden zum Kennenlernen', request: 'Gebet erbitten', chat: 'Gebetschat', start: 'Meine Gemeinde betet', stop: 'Mein Gebet beenden', example: 'Beispielgemeinde auf dem Platz', live: 'LIVE', demoLabel: 'DEMONSTRATION' },
  fr: { title: 'Prière Mondiale', intro: 'Des églises de différents lieux prient ensemble pour les personnes. Touchez une église pour découvrir son temps de prière.', praying: 'églises en prière maintenant', touch: 'Touchez une bulle pour participer', demo: '3 églises de démonstration à découvrir', request: 'Demander la prière', chat: 'Chat de prière', start: 'Mon église va prier', stop: 'Terminer ma prière', example: 'Exemple d’église sur la place', live: 'EN DIRECT', demoLabel: 'DÉMONSTRATION' },
  ro: { title: 'Rugăciune Mondială', intro: 'Biserici din locuri diferite se roagă împreună pentru oameni. Atinge o biserică pentru a-i cunoaște momentul de rugăciune.', praying: 'biserici se roagă acum', touch: 'Atinge o bulă pentru a participa', demo: '3 biserici demonstrative pentru a cunoaște piața', request: 'Cere rugăciune', chat: 'Chat de rugăciune', start: 'Biserica mea se va ruga', stop: 'Încheie rugăciunea mea', example: 'Exemplu de biserică în piață', live: 'LIVE', demoLabel: 'DEMONSTRAȚIE' },
  ru: { title: 'Мировая молитва', intro: 'Церкви из разных мест молятся вместе за людей. Нажмите на церковь, чтобы узнать о её молитве.', praying: 'церквей молятся сейчас', touch: 'Нажмите на сферу, чтобы участвовать', demo: '3 демонстрационные церкви для знакомства', request: 'Попросить молитву', chat: 'Молитвенный чат', start: 'Моя церковь будет молиться', stop: 'Завершить мою молитву', example: 'Пример церкви на площади', live: 'В ЭФИРЕ', demoLabel: 'ДЕМОНСТРАЦИЯ' },
};

const PLAZA_DETAILS = {
  pt: { eyebrow: 'Sigo com Fé · unidos em oração', low: 'oração iniciada', mid: 'participação a crescer', high: 'muita atividade', requestInfo: 'Envia a todas as igrejas que estão a orar agora.', requestWaiting: 'Disponível assim que uma igreja real estiver em oração.', chatInfo: 'Conversa, agradece e apoia a comunidade.', leaderInfo: 'Faz a tua igreja aparecer na praça.' },
  es: { eyebrow: 'Sigo com Fé · unidos en oración', low: 'oración iniciada', mid: 'participación creciendo', high: 'mucha actividad', requestInfo: 'Envía a todas las iglesias que están orando ahora.', requestWaiting: 'Disponible cuando una iglesia real comience a orar.', chatInfo: 'Habla, agradece y apoya a la comunidad.', leaderInfo: 'Haz que tu iglesia aparezca en la plaza.' },
  en: { eyebrow: 'Sigo com Fé · united in prayer', low: 'prayer started', mid: 'participation growing', high: 'high activity', requestInfo: 'Send to every church praying now.', requestWaiting: 'Available when a real church starts praying.', chatInfo: 'Talk, give thanks and support the community.', leaderInfo: 'Make your church appear in the plaza.' },
  de: { eyebrow: 'Sigo com Fé · vereint im Gebet', low: 'Gebet begonnen', mid: 'wachsende Teilnahme', high: 'viel Aktivität', requestInfo: 'An alle Gemeinden senden, die jetzt beten.', requestWaiting: 'Verfügbar, sobald eine echte Gemeinde betet.', chatInfo: 'Sprich, danke und unterstütze die Gemeinschaft.', leaderInfo: 'Lass deine Gemeinde auf dem Platz erscheinen.' },
  fr: { eyebrow: 'Sigo com Fé · unis dans la prière', low: 'prière commencée', mid: 'participation en hausse', high: 'forte activité', requestInfo: 'Envoyer à toutes les églises qui prient maintenant.', requestWaiting: 'Disponible lorsqu’une vraie église commence à prier.', chatInfo: 'Échangez, remerciez et soutenez la communauté.', leaderInfo: 'Faites apparaître votre église sur la place.' },
  ro: { eyebrow: 'Sigo com Fé · uniți în rugăciune', low: 'rugăciune începută', mid: 'participare în creștere', high: 'activitate intensă', requestInfo: 'Trimite tuturor bisericilor care se roagă acum.', requestWaiting: 'Disponibil când o biserică reală începe rugăciunea.', chatInfo: 'Vorbește, mulțumește și susține comunitatea.', leaderInfo: 'Fă ca biserica ta să apară în piață.' },
  ru: { eyebrow: 'Sigo com Fé · вместе в молитве', low: 'молитва началась', mid: 'участие растёт', high: 'высокая активность', requestInfo: 'Отправить всем церквям, которые молятся сейчас.', requestWaiting: 'Доступно, когда настоящая церковь начнёт молитву.', chatInfo: 'Общайтесь, благодарите и поддерживайте сообщество.', leaderInfo: 'Покажите свою церковь на площади.' },
};

export default function PrayerPlaza() {
  const { user, token, isGuest } = useAuth();
  const { i18n } = useTranslation();
  const { liveSessions = [], totalChurchesPraying = 0, send, on, off } = useWebSocket();
  const mapRef = useRef(null);
  const [selected, setSelected] = useState(null);
  const [mySessionId, setMySessionId] = useState(null);
  const [showLeaderForm, setShowLeaderForm] = useState(false);
  const [focus, setFocus] = useState('');
  const [campaignName, setCampaignName] = useState('');
  const [campaignDay, setCampaignDay] = useState('1');
  const [campaignTotal, setCampaignTotal] = useState('7');
  const [liveUrl, setLiveUrl] = useState('');
  const [chatEnabled, setChatEnabled] = useState(true);
  const [vowEnabled, setVowEnabled] = useState(false);
  const [churchDetails, setChurchDetails] = useState(null);
  const [churchDetailsLoading, setChurchDetailsLoading] = useState(false);
  const [showRequest, setShowRequest] = useState(false);
  const [requestContent, setRequestContent] = useState('');
  const [requestAnonymous, setRequestAnonymous] = useState(false);
  const [requestUrgent, setRequestUrgent] = useState(false);
  const [requestTargets, setRequestTargets] = useState([]);
  const [requestStatus, setRequestStatus] = useState('');
  const [showPrayerChat, setShowPrayerChat] = useState(false);
  const [prayerMessages, setPrayerMessages] = useState([]);
  const [prayerMessage, setPrayerMessage] = useState('');
  const isLeader = ['pastor', 'admin'].includes(user?.role);
  const active = useMemo(() => liveSessions.map((session, index) => ({ ...session, activity: activityFor(session, index) })), [liveSessions]);
  const visibleSessions = active.length ? active : DEMO_CHURCHES;
  const [bubblePositions, setBubblePositions] = useState([]);
  const language = (i18n.resolvedLanguage || i18n.language || 'pt').split('-')[0];
  const copy = PLAZA_COPY[language] || PLAZA_COPY.pt;
  const details = PLAZA_DETAILS[language] || PLAZA_DETAILS.pt;
  const prayerRoomId = `world-prayer-${language}`;

  useEffect(() => {
    const churchId = new URLSearchParams(window.location.search).get('igreja');
    if (!churchId) return;
    const sharedSession = visibleSessions.find((session) => String(session.church_id || session.churchId || session.id) === String(churchId));
    if (sharedSession) setSelected(sharedSession);
  }, [visibleSessions]);

  useEffect(() => {
    const previousTitle = document.title;
    const description = document.querySelector('meta[name="description"]');
    const previousDescription = description?.getAttribute('content');
    document.title = 'Oração Mundial | Sigo com Fé';
    if (description) description.setAttribute('content', 'Entre na Oração Mundial do Sigo com Fé: faça pedidos, ore com a comunidade e acompanhe momentos de oração ao vivo.');
    return () => {
      document.title = previousTitle;
      if (description && previousDescription) description.setAttribute('content', previousDescription);
    };
  }, []);

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
    send({ type: 'pastor_start_praying', pastorId: user.id, churchId: user.churchId || user.church_id, churchName: user.church_name || 'Minha igreja', pastorName: user.full_name, prayerFocus: focus, campaignName, campaignDay: campaignName ? campaignDay : null, campaignTotal: campaignName ? campaignTotal : null, liveUrl, chatEnabled, vowEnabled });
    setShowLeaderForm(false);
  };

  useEffect(() => {
    const churchId = selected?.church_id || selected?.churchId;
    if (!selected || selected.is_demo || !churchId) { setChurchDetails(null); return; }
    setChurchDetailsLoading(true);
    fetch(`${import.meta.env.VITE_API_URL || ''}/api/churches/${churchId}`)
      .then((response) => response.ok ? response.json() : Promise.reject())
      .then((data) => setChurchDetails(data.church || null))
      .catch(() => setChurchDetails(null))
      .finally(() => setChurchDetailsLoading(false));
  }, [selected]);
  useEffect(() => {
    const arena = mapRef.current;
    if (!arena || !visibleSessions.length) return undefined;

    const rect = arena.getBoundingClientRect();
    const width = Math.max(320, rect.width);
    const height = Math.max(420, rect.height);
    const bubbles = visibleSessions.map((session, index) => {
      const naturalRadius = (128 + Math.min(62, session.activity || 50)) / 2;
      const radius = Math.min(naturalRadius, width < 700 ? 61 : 95);
      return {
        radius,
        x: radius + ((index * 173 + 75) % Math.max(1, width - radius * 2)),
        y: radius + ((index * 137 + 68) % Math.max(1, height - radius * 2 - 76)),
        vx: (index % 2 ? -1 : 1) * (36 + index * 7),
        vy: (index % 3 ? 1 : -1) * (28 + index * 9),
      };
    });
    let frame;
    let previous = performance.now();
    const tick = (now) => {
      const dt = Math.min(0.035, (now - previous) / 1000);
      previous = now;
      bubbles.forEach((bubble) => {
        bubble.x += bubble.vx * dt;
        bubble.y += bubble.vy * dt;
        if (bubble.x - bubble.radius < 0 || bubble.x + bubble.radius > width) {
          bubble.vx *= -1;
          bubble.x = Math.max(bubble.radius, Math.min(width - bubble.radius, bubble.x));
        }
        if (bubble.y - bubble.radius < 0 || bubble.y + bubble.radius > height - 76) {
          bubble.vy *= -1;
          bubble.y = Math.max(bubble.radius, Math.min(height - 76 - bubble.radius, bubble.y));
        }
      });
      for (let a = 0; a < bubbles.length; a += 1) {
        for (let b = a + 1; b < bubbles.length; b += 1) {
          const first = bubbles[a]; const second = bubbles[b];
          const dx = second.x - first.x; const dy = second.y - first.y;
          const distance = Math.hypot(dx, dy) || 1;
          const minimum = first.radius + second.radius;
          if (distance >= minimum) continue;
          const nx = dx / distance; const ny = dy / distance;
          const closingSpeed = (first.vx - second.vx) * nx + (first.vy - second.vy) * ny;
          if (closingSpeed > 0) {
            first.vx -= closingSpeed * nx; first.vy -= closingSpeed * ny;
            second.vx += closingSpeed * nx; second.vy += closingSpeed * ny;
          }
          const separation = (minimum - distance) / 2 + 0.5;
          first.x -= nx * separation; first.y -= ny * separation;
          second.x += nx * separation; second.y += ny * separation;
        }
      }
      setBubblePositions(bubbles.map(({ x, y, radius }) => ({ x, y, radius })));
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [visibleSessions]);

  useEffect(() => {
    if (!showPrayerChat) return undefined;
    const receive = (message) => {
      if (message?.roomId !== prayerRoomId) return;
      setPrayerMessages((previous) => previous.some((item) => item.id === message.id) ? previous : [...previous, message].slice(-80));
    };
    on('live_chat_broadcast', receive);
    if (user && !isGuest) send({ type: 'live_join', roomId: prayerRoomId, userId: user.id, userName: user.full_name, userAvatar: user.avatar_url });
    fetch(`${import.meta.env.VITE_API_URL || ''}/api/live-community/history?roomId=${encodeURIComponent(prayerRoomId)}`)
      .then((response) => response.json())
      .then((data) => setPrayerMessages(data.messages || []))
      .catch(() => {});
    return () => {
      off('live_chat_broadcast', receive);
      if (user && !isGuest) send({ type: 'live_leave', roomId: prayerRoomId, userId: user.id });
    };
  }, [isGuest, off, on, prayerRoomId, send, showPrayerChat, user]);

  const sendPrayerMessage = () => {
    const text = prayerMessage.trim();
    if (!user || isGuest) return window.alert('Entra na tua conta para participar no chat de oração.');
    if (!text) return;
    const message = { id: `local-${Date.now()}`, roomId: prayerRoomId, userId: user.id, userName: user.full_name, userAvatar: user.avatar_url, text, time: new Date().toISOString() };
    setPrayerMessages((previous) => [...previous, message].slice(-80));
    send({ type: 'live_chat_message', ...message });
    fetch(`${import.meta.env.VITE_API_URL || ''}/api/live-community/history`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ roomId: prayerRoomId, userId: user.id, userName: user.full_name, userAvatar: user.avatar_url, message: text }) }).catch(() => {});
    setPrayerMessage('');
  };
  const sharePrayer = async (session = null) => {
    const campaign = session?.campaign_name || session?.campaignName || session?.prayer_focus || session?.prayerFocus;
    const church = session?.church_name || session?.churchName;
    const url = session ? `${window.location.origin}/praca-oracao?igreja=${encodeURIComponent(session.church_id || session.churchId || session.id)}` : window.location.href;
    const shareData = { title: campaign ? `${campaign} · Oração Mundial` : 'Oração Mundial · Sigo com Fé', text: church ? `${church} está em oração. Vem orar connosco.` : 'Vem orar com igrejas de todo o mundo na Oração Mundial.', url };
    try {
      if (navigator.share) await navigator.share(shareData);
      else { await navigator.clipboard.writeText(url); window.alert('Link copiado. Agora podes enviar a quem quiseres.'); }
    } catch (error) { if (error?.name !== 'AbortError') window.alert('Não foi possível partilhar agora.'); }
  };
  const isDirectAudio = (url = '') => /\.(mp3|m4a|aac|ogg|wav|m3u8)(\?.*)?$/i.test(url);
  const openRequest = (churchIds) => {
    if (!user) return window.alert('Entra na tua conta para enviar um pedido de oração.');
    setRequestTargets(churchIds.filter(Boolean)); setRequestStatus(''); setShowRequest(true);
  };
  const sendRequest = async () => {
    if (!requestContent.trim()) return setRequestStatus('Escreve o teu pedido antes de enviar.');
    if (!requestTargets.length) return setRequestStatus('Não há uma igreja em oração disponível neste momento.');
    setRequestStatus('A enviar...');
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/help-posts`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ content: requestContent, post_type: 'request', is_anonymous: requestAnonymous, is_urgent: requestUrgent, target_church_ids: requestTargets }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Não foi possível enviar.');
      setRequestStatus(`Pedido enviado a ${data.churches_notified || requestTargets.length} igreja(s). Vais receber uma notificação quando responderem.`);
      setRequestContent('');
    } catch (error) { setRequestStatus(error.message || 'Não foi possível enviar o pedido.'); }
  };

  return (
    <div className="prayer-plaza">
      <section className="prayer-plaza__hero">
        <span><Sparkles size={17}/> {details.eyebrow}</span>
        <h1>{copy.title}</h1>
        <p>{copy.intro}</p>
        <div className="prayer-plaza__stats"><strong><Radio size={18}/> {totalChurchesPraying} {copy.praying}</strong><span><Users size={18}/> {active.length ? copy.touch : copy.demo}</span></div>
      </section>

      <section className="prayer-plaza__map" ref={mapRef} aria-label={copy.praying}>
        <div className="prayer-plaza__legend"><span className="low"/> {details.low} <span className="mid"/> {details.mid} <span className="high"/> {details.high}</div>
        {visibleSessions.map((session, index) => {
          const position = bubblePositions[index];
          const size = position ? position.radius * 2 : 128 + Math.min(62, session.activity);
          const color = session.activity > 78 ? 'high' : session.activity > 58 ? 'mid' : 'low';
          const style = position ? { left: 0, top: 0, width: size, height: size, transform: `translate3d(${position.x - position.radius}px, ${position.y - position.radius}px, 0)` } : { left: `${12 + index * 22}%`, top: `${15 + index * 15}%`, width: size, height: size };
          return <button key={session.id} className={`prayer-plaza__bubble ${color}`} onClick={() => setSelected(session)} style={style}>
            <span className="prayer-plaza__pulse"/><Radio size={20}/><b>{session.campaign_name || session.campaignName || session.prayer_focus || session.prayerFocus || 'Oração em curso'}</b><small>{session.church_name || session.churchName || 'Igreja em oração'}{(session.campaign_name || session.campaignName) && (session.campaign_day || session.campaignDay) ? ` · dia ${session.campaign_day || session.campaignDay}/${session.campaign_total || session.campaignTotal || 7}` : ''}</small><em>{session.is_demo ? copy.demoLabel : copy.live}</em>
          </button>;
        })}
      </section>

      <section className="prayer-plaza__actions">
        <button onClick={() => active.length ? openRequest(active.map(session => session.church_id || session.churchId)) : window.alert('Quando uma igreja real iniciar uma oração, poderá enviar o seu pedido diretamente para ela.')}><HeartHandshake size={22}/><span><b>{copy.request}</b><small>{active.length ? details.requestInfo : details.requestWaiting}</small></span></button>
        {active.some((session) => session.chat_enabled !== false && session.chatEnabled !== false) && <button onClick={() => setShowPrayerChat(true)}><MessageCircle size={22}/><span><b>{copy.chat}</b><small>{details.chatInfo}</small></span></button>}
        {active.some((session) => session.vow_enabled === true || session.vowEnabled === true) && <button onClick={() => { window.location.href = '/votos-de-fe'; }}><HeartHandshake size={22}/><span><b>Voto de Fé</b><small>Participa no voto ativado pela igreja.</small></span></button>}
        <button onClick={() => sharePrayer()}><Share2 size={22}/><span><b>Partilhar Oração Mundial</b><small>Convida alguém para orar contigo.</small></span></button>
        {isLeader && <button onClick={mySessionId ? () => send({ type: 'pastor_stop_praying', sessionId: mySessionId }) : () => setShowLeaderForm(true)}><Radio size={22}/><span><b>{mySessionId ? copy.stop : copy.start}</b><small>{mySessionId ? details.leaderInfo : 'Configura o tema, a campanha e a transmissão antes de começar.'}</small></span></button>}
        {isLeader && mySessionId && <button onClick={() => sharePrayer(active.find((session) => session.id === mySessionId))}><Share2 size={22}/><span><b>Partilhar a minha oração</b><small>Envia o convite da tua igreja.</small></span></button>}
      </section>

      {isLeader && !mySessionId && showLeaderForm && <div className="prayer-plaza__leader"><button type="button" onClick={() => setShowLeaderForm(false)} style={{ border: 0, background: 'transparent', color: '#35684f', fontWeight: 800, cursor: 'pointer', padding: 0, marginBottom: 12 }}>← Voltar</button><label>O que a igreja está a orar agora?</label><input value={focus} onChange={(e) => setFocus(e.target.value)} placeholder="Ex.: famílias, saúde, cidade..."/><label>Nome da campanha (opcional)</label><input value={campaignName} onChange={(e) => setCampaignName(e.target.value)} placeholder="Ex.: 7 dias de gratidão"/><div style={{ display: 'flex', gap: 10 }}><label style={{ flex: 1 }}>Dia<input type="number" min="1" value={campaignDay} onChange={(e) => setCampaignDay(e.target.value)}/></label><label style={{ flex: 1 }}>Total de dias<input type="number" min="1" value={campaignTotal} onChange={(e) => setCampaignTotal(e.target.value)}/></label></div><label>Link da transmissão ao vivo (opcional)</label><input type="url" value={liveUrl} onChange={(e) => setLiveUrl(e.target.value)} placeholder="https://youtube.com/..."/><div style={{ display: 'grid', gap: 8, margin: '10px 0' }}><label><input type="checkbox" checked={chatEnabled} onChange={(e) => setChatEnabled(e.target.checked)}/> Mostrar chat para os membros</label><label><input type="checkbox" checked={vowEnabled} onChange={(e) => setVowEnabled(e.target.checked)}/> Mostrar Voto de Fé para os membros</label></div><small>O pastor controla estes botões. Só ficam visíveis depois de iniciar a oração.</small><div style={{ display: 'flex', gap: 10, marginTop: 14, flexWrap: 'wrap' }}><button className="join" onClick={start}><Radio size={18}/> Iniciar oração</button><button type="button" onClick={() => setShowLeaderForm(false)} style={{ border: '1px solid #bfcfc2', background: '#fff', color: '#35684f', borderRadius: 10, padding: '10px 16px', fontWeight: 800, cursor: 'pointer' }}>Voltar</button></div></div>}

      {showPrayerChat && <div className="prayer-plaza__modal" role="dialog" aria-modal="true"><div className="prayer-plaza__chat"><button className="close" onClick={() => setShowPrayerChat(false)} aria-label="Fechar"><X/></button><span className="live"><MessageCircle size={16}/> {copy.chat}</span><h2>{copy.title}</h2><p>Partilha um pedido, um versículo ou uma palavra de esperança. Esta conversa continua dentro da Oração Mundial.</p><div className="prayer-plaza__chat-messages">{prayerMessages.length ? prayerMessages.map((message, index) => <article key={message.id || index}><b>{message.userName || 'Membro'}</b><span>{message.text || message.message}</span></article>) : <p>Ainda não há mensagens. Começa com uma oração ou uma palavra de esperança.</p>}</div><div className="prayer-plaza__chat-compose"><input value={prayerMessage} onChange={(event) => setPrayerMessage(event.target.value)} onKeyDown={(event) => event.key === 'Enter' && sendPrayerMessage()} placeholder="Escreve uma mensagem de oração..."/><button className="join" onClick={sendPrayerMessage}><Send size={18}/> Enviar</button></div></div></div>}

      {selected && <div className="prayer-plaza__modal" role="dialog" aria-modal="true"><div><button className="close" onClick={() => setSelected(null)} aria-label="Fechar"><X/></button><span className="live"><Radio size={16}/> {selected.is_demo ? 'demonstração' : 'oração ao vivo'}</span><h2>{selected.church_name || selected.churchName}</h2><p>{selected.is_demo ? 'Este é um exemplo de como uma igreja aparece na Oração Mundial.' : `Conduzida por ${selected.pastor_name || selected.pastorName || 'um pastor'}.`}</p>{(selected.campaign_name || selected.campaignName) && <p style={{ fontWeight: 800, color: '#216b4f' }}>Campanha: {selected.campaign_name || selected.campaignName} {(selected.campaign_day || selected.campaignDay) && `· dia ${selected.campaign_day || selected.campaignDay}/${selected.campaign_total || selected.campaignTotal || 7}`}</p>}{(selected.prayer_focus || selected.prayerFocus) && <blockquote>“{selected.prayer_focus || selected.prayerFocus}”</blockquote>}{!selected.is_demo && <details style={{ margin: '14px 0', borderTop: '1px solid #dceadf', paddingTop: 12 }}><summary style={{ cursor: 'pointer', fontWeight: 800, color: '#245c48' }}>Ver informações da igreja</summary>{churchDetailsLoading ? <p>A carregar informações...</p> : churchDetails ? <div style={{ lineHeight: 1.55 }}><p>{churchDetails.description || 'Esta igreja ainda não adicionou uma apresentação.'}</p>{churchDetails.address && <p><b>Endereço:</b> {churchDetails.address}</p>}{(churchDetails.city || churchDetails.country) && <p><b>Local:</b> {[churchDetails.city, churchDetails.country].filter(Boolean).join(', ')}</p>}<p><b>Pastor:</b> {churchDetails.pastor_name || churchDetails._pastor_full_name || selected.pastor_name || selected.pastorName || 'Não informado'}</p>{churchDetails.events?.length ? <div><b>Próximos cultos e encontros</b>{churchDetails.events.slice(0, 4).map((event) => <p key={event.id} style={{ margin: '5px 0' }}>• {event.title} — {new Date(event.event_date).toLocaleDateString()} {event.event_time ? `às ${String(event.event_time).slice(0, 5)}` : ''}</p>)}</div> : <p><b>Horários:</b> a igreja ainda não publicou os próximos cultos.</p>}</div> : <p>As informações desta igreja não estão disponíveis agora.</p>}</details>}{selected.is_demo ? <button className="join" onClick={() => setSelected(null)}>Entendi</button> : <div style={{ display: 'grid', gap: 9 }}><button className="join" onClick={() => { const churchId = selected.church_id || selected.churchId; setSelected(null); openRequest([churchId]); }}><HandHeart size={19}/> Pedir oração a esta igreja</button><button className="join" onClick={() => sharePrayer(selected)}><Share2 size={19}/> Partilhar esta oração</button>{(selected.live_url || selected.liveUrl) && (isDirectAudio(selected.live_url || selected.liveUrl) ? <audio controls autoPlay playsInline src={selected.live_url || selected.liveUrl} style={{ width: '100%' }}>O teu navegador não suporta áudio.</audio> : <button className="join" onClick={() => window.open(selected.live_url || selected.liveUrl, '_blank', 'noopener,noreferrer')}><Volume2 size={19}/> Ver ou escutar transmissão ao vivo</button>)}</div>}<small>{selected.is_demo ? 'As igrejas reais aparecem como “AO VIVO” quando um pastor inicia uma sessão de oração.' : isDirectAudio(selected.live_url || selected.liveUrl) ? 'Depois de tocares em reproduzir, o áudio direto pode continuar com o ecrã apagado, se o teu telemóvel o permitir.' : (selected.live_url || selected.liveUrl) ? 'A transmissão abre no serviço escolhido pela igreja. A reprodução em segundo plano depende do YouTube, Facebook ou outro serviço.' : 'Esta igreja ainda não adicionou uma transmissão. Podes participar pelo pedido de oração.'}</small></div></div>}
      {showRequest && <div className="prayer-plaza__modal" role="dialog" aria-modal="true"><div><button className="close" onClick={() => setShowRequest(false)} aria-label="Fechar"><X/></button><span className="live"><HeartHandshake size={16}/> pedido protegido</span><h2>Como podemos orar por ti?</h2><p>O pedido será visto apenas pelos pastores das {requestTargets.length} igreja(s) que escolheste.</p><textarea value={requestContent} onChange={(e) => setRequestContent(e.target.value)} placeholder="Escreve o teu pedido de oração..." style={{ width: '100%', minHeight: 105, boxSizing: 'border-box', border: '1px solid #cfe0d5', borderRadius: 12, padding: 12, font: 'inherit', margin: '8px 0' }}/><label style={{ display: 'block', marginTop: 8 }}><input type="checkbox" checked={requestAnonymous} onChange={(e) => setRequestAnonymous(e.target.checked)}/> Enviar como anónimo</label><label style={{ display: 'block', margin: '9px 0 14px' }}><input type="checkbox" checked={requestUrgent} onChange={(e) => setRequestUrgent(e.target.checked)}/> É urgente</label><button className="join" onClick={sendRequest}><Send size={18}/> Enviar pedido</button>{requestStatus && <p style={{ marginTop: 13, color: requestStatus.includes('enviado') ? '#167244' : '#a04c16', fontWeight: 700, lineHeight: 1.45 }}>{requestStatus}</p>}<small>Não publiques dados bancários, documentos ou informação médica detalhada.</small></div></div>}
    </div>
  );
}
