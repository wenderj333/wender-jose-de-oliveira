import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { useWebSocket } from '../context/WebSocketContext';
import { Clock, CheckCircle, Loader, User, Phone, MessageCircle } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || '';

const STATUS_COLORS = {
  pending: '#e74c3c',
  in_progress: '#f39c12',
  resolved: '#27ae60',
};

const DEST_COLORS = {
  public: '#4a80d4',
  group: '#6c47d4',
  pastor: '#c9a84c',
};

const DEST_CONFIG = [
  { key: 'public',  icon: '🌍', bgSelected: '#e8f0fc', borderSelected: '#4a80d4' },
  { key: 'group',   icon: '👥', bgSelected: '#f0ebfd', borderSelected: '#6c47d4' },
  { key: 'pastor',  icon: '🕊️', bgSelected: '#fdf6e3', borderSelected: '#c9a84c' },
];


function TrabalhoOportunidades({ token, user, t }) {
  const [tab, setTab] = React.useState('feed');
  const [posts, setPosts] = React.useState([
    { id:1, name:'Joao Carlos', initials:'JC', type:'work', time:'ha 2h', text:'Sou eletricista com 8 anos de experiencia. Disponivel para servicos residenciais e comerciais.', skills:['Eletricista','Residencial','Comercial'] },
    { id:2, name:'Maria Rita',  initials:'MR', type:'offer', time:'ha 5h', text:'Preciso de pessoa de confianca para cuidar do jardim 2x por semana. Pagamento semanal. Irmao na fe tem preferencia!', skills:['Jardinagem','Presencial'] },
    { id:3, name:'Pedro Lima',  initials:'PL', type:'indicate', time:'ha 1 dia', text:'Indico o irmao Carlos Santos para pintura. Trabalho impecavel, pontual e honesto!', skills:[] },
  ]);
  const [showForm, setShowForm] = React.useState(false);
  const [formType, setFormType] = React.useState('work');
  const [formText, setFormText] = React.useState('');
  const [formSkills, setFormSkills] = React.useState('');

  const TYPE_CONFIG = {
    work:     { label:'Preciso de trabalho',    badge:'#e8f4e8', badgeText:'#2d6a2d', icon:'🧑‍🔧' },
    offer:    { label:'Oferecer oportunidade',  badge:'#e8efff', badgeText:'#1a3a6e', icon:'🤝' },
    find:     { label:'Buscar profissional',    badge:'#fff8e0', badgeText:'#7a5800', icon:'🔍' },
    indicate: { label:'Indicar alguem',         badge:'#fce8f0', badgeText:'#8a1a4a', icon:'📢' },
  };

  function submitPost(e) {
    e.preventDefault();
    if(!formText.trim()) return;
    const p = {
      id: Date.now(),
      name: user?.name || 'Voce',
      initials: (user?.name||'VC').slice(0,2).toUpperCase(),
      type: formType,
      time: 'agora',
      text: formText,
      skills: formSkills.split(',').map(s=>s.trim()).filter(Boolean),
    };
    setPosts(prev=>[p,...prev]);
    setFormText(''); setFormSkills(''); setShowForm(false);
  }

  return (
    <div style={{marginTop:'2rem',borderTop:'2px solid #e8efff',paddingTop:'1.5rem'}}>
      <div style={{background:'linear-gradient(135deg,#1a3a6e,#2d5a9e)',borderRadius:12,padding:'14px 18px',marginBottom:14,textAlign:'center'}}>
        <div style={{color:'#fff',fontSize:15,fontWeight:700,marginBottom:4}}>💼 Trabalho & Oportunidades</div>
        <div style={{color:'rgba(200,220,255,0.85)',fontSize:11,marginBottom:6,lineHeight:1.5}}>
          Acreditamos que Deus abre portas atraves das pessoas.<br/>
          Aqui voce encontra e oferece oportunidades com fe e solidariedade.
        </div>
        <div style={{color:'rgba(180,210,255,0.7)',fontSize:10,fontStyle:'italic'}}>
          "Tudo quanto te vier a mao para fazer, faze-o conforme as tuas forcas." — Eclesiastes 9:10
        </div>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:14}}>
        {Object.entries(TYPE_CONFIG).map(([key,cfg])=>(
          <div key={key} onClick={()=>{setFormType(key);setShowForm(true);}}
            style={{background:'#fff',borderRadius:10,padding:12,border:'1px solid #e0e8ff',cursor:'pointer',transition:'all 0.15s'}}>
            <div style={{fontSize:22,marginBottom:6}}>{cfg.icon}</div>
            <div style={{fontSize:12,fontWeight:700,color:'#1a3a6e',marginBottom:3}}>{cfg.label}</div>
          </div>
        ))}
      </div>

      {showForm && (
        <div style={{background:'#fff',borderRadius:12,padding:16,border:'1px solid #d0dbff',marginBottom:14}}>
          <div style={{fontWeight:700,color:'#1a3a6e',fontSize:13,marginBottom:10}}>
            {TYPE_CONFIG[formType].icon} {TYPE_CONFIG[formType].label}
          </div>
          <textarea value={formText} onChange={e=>setFormText(e.target.value)}
            placeholder="Conte um pouco sobre voce ou a oportunidade..."
            style={{width:'100%',minHeight:80,padding:'8px 10px',borderRadius:8,border:'1px solid #d0dbff',fontSize:12,resize:'vertical',outline:'none',fontFamily:'inherit',marginBottom:8}}
          />
          <input value={formSkills} onChange={e=>setFormSkills(e.target.value)}
            placeholder="Habilidades / areas (separadas por virgula)"
            style={{width:'100%',padding:'7px 10px',borderRadius:8,border:'1px solid #d0dbff',fontSize:12,outline:'none',marginBottom:10}}
          />
          <div style={{display:'flex',gap:8}}>
            <button onClick={submitPost}
              style={{background:'#1a3a6e',color:'#fff',border:'none',borderRadius:20,padding:'8px 20px',fontSize:12,fontWeight:700,cursor:'pointer'}}>
              Publicar
            </button>
            <button onClick={()=>setShowForm(false)}
              style={{background:'none',border:'1px solid #d0dbff',borderRadius:20,padding:'8px 16px',fontSize:12,cursor:'pointer',color:'#666'}}>
              Cancelar
            </button>
          </div>
        </div>
      )}

      <div style={{fontWeight:700,color:'#1a3a6e',fontSize:12,marginBottom:10}}>Oportunidades da comunidade</div>

      {posts.map(p=>{
        const cfg=TYPE_CONFIG[p.type]||TYPE_CONFIG.work;
        return(
          <div key={p.id} style={{background:'#fff',borderRadius:10,padding:12,border:'1px solid #e0e8ff',marginBottom:8}}>
            <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:8}}>
              <div style={{width:32,height:32,borderRadius:'50%',background:'#e8efff',display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,color:'#3a6ad4',fontWeight:700,flexShrink:0}}>
                {p.initials}
              </div>
              <div>
                <div style={{fontSize:12,fontWeight:700,color:'#1a3a6e'}}>{p.name}</div>
                <div style={{fontSize:10,color:'#999'}}>{p.time}</div>
              </div>
              <span style={{marginLeft:'auto',fontSize:9,padding:'3px 8px',borderRadius:20,fontWeight:700,background:cfg.badge,color:cfg.badgeText}}>
                {cfg.icon} {cfg.label}
              </span>
            </div>
            <div style={{fontSize:11,color:'#444',lineHeight:1.5,marginBottom:8}}>{p.text}</div>
            {p.skills.length>0&&(
              <div style={{display:'flex',flexWrap:'wrap',gap:4,marginBottom:8}}>
                {p.skills.map((s,i)=>(
                  <span key={i} style={{background:'#f0f4ff',color:'#3a6ad4',fontSize:9,padding:'2px 8px',borderRadius:20,border:'1px solid #d0dbff'}}>{s}</span>
                ))}
              </div>
            )}
            <div style={{display:'flex',gap:6}}>
              <button style={{fontSize:10,padding:'5px 12px',borderRadius:20,border:'none',background:'#1a3a6e',color:'#fff',cursor:'pointer',fontWeight:600}}>
                Entrar em contato
              </button>
              <button style={{fontSize:10,padding:'5px 12px',borderRadius:20,border:'1px solid #d0dbff',background:'#fff',color:'#3a6ad4',cursor:'pointer'}}>
                Orar por esta pessoa
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function HelpRequests() {
  const { t } = useTranslation();
  const { user, token } = useAuth();
  const { lastEvent } = useWebSocket();
  const isPastor = user?.role === 'pastor' || user?.role === 'admin';

  // ---- submission form state ----
  const [destination, setDestination] = useState('pastor');
  const [content, setContent] = useState('');
  const [anonymous, setAnonymous] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // ---- pastor panel state ----
  const [requests, setRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [filter, setFilter] = useState('all');

  // Load existing requests (pastor panel)
  useEffect(() => {
    if (!isPastor) { setLoadingRequests(false); return; }
    fetch(`${API_BASE}/api/help-requests`)
      .then(r => r.json())
      .then(data => setRequests(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoadingRequests(false));
  }, [isPastor]);

  // WebSocket updates
  useEffect(() => {
    if (!lastEvent) return;
    if (lastEvent.type === 'new_help_request') {
      setRequests(prev => [lastEvent.request, ...prev]);
    }
    if (lastEvent.type === 'help_request_update') {
      setRequests(prev => prev.map(r =>
        r.id === lastEvent.id ? { ...r, status: lastEvent.status } : r
      ));
    }
  }, [lastEvent]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;
    if (!content.trim()) return;

    setSubmitting(true);
    setSuccessMsg('');
    try {
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${API_BASE}/api/help-requests`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          type: 'needPrayer',
          name: anonymous ? null : (user?.full_name || user?.name || ''),
          contact: user?.email || user?.phone || 'via-app',
          message: content.trim(),
          destination,
          anonymous,
        }),
      });

      if (res.ok) {
        const msgs = {
          public: t('prayers.successPublic'),
          group: t('prayers.successGroup'),
          pastor: t('prayers.successPastor'),
        };
        setSuccessMsg(msgs[destination] || t('prayers.successPastor'));
        setContent('');
        setAnonymous(false);
        setDestination('pastor');
        setTimeout(() => setSuccessMsg(''), 5000);
      }
    } catch (err) {
      console.error('Erro ao enviar pedido:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await fetch(`${API_BASE}/api/help-requests/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      setRequests(prev => prev.map(r => r.id === id ? { ...r, status } : r));
    } catch (e) { /* ok */ }
  };

  const filtered = filter === 'all' ? requests : requests.filter(r => r.status === filter);

  const timeAgo = (date) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return t('helpRequests.justNow', 'agora');
    if (mins < 60) return `${mins}min`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h`;
    return `${Math.floor(hrs / 24)}d`;
  };

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: '0 0 2rem' }}>

      {/* ===== HEADER EMOCIONAL ===== */}
      <div style={{
        textAlign: 'center',
        padding: '2rem 1rem 1.5rem',
        background: 'linear-gradient(135deg, #f0f4ff 0%, #fdf6e3 100%)',
        borderRadius: 16,
        marginBottom: '1.5rem',
        boxShadow: '0 2px 12px rgba(74,128,212,0.08)',
      }}>
        <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🙏</div>
        <h2 style={{ color: '#2c3e7a', margin: '0 0 0.5rem', fontSize: '1.4rem', fontWeight: 700 }}>
          {t('prayers.title')}
        </h2>
        <p style={{ color: '#6a5acd', fontStyle: 'italic', fontSize: '0.9rem', margin: 0 }}>
          {t('prayers.verse')}
        </p>
      </div>

      {/* ===== FORMULÁRIO DE SUBMISSÃO ===== */}
      {!user ? (
        <div style={{
          background: '#fff',
          borderRadius: 12,
          padding: '1.5rem',
          textAlign: 'center',
          color: '#666',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          marginBottom: '1.5rem',
        }}>
          <span style={{ fontSize: '1.5rem' }}>🔐</span>
          <p style={{ margin: '0.5rem 0 0', fontSize: '0.95rem' }}>{t('prayers.loginRequired')}</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ marginBottom: '1.5rem' }}>

          {/* Destino */}
          <p style={{ fontWeight: 600, color: '#444', marginBottom: '0.75rem', fontSize: '0.95rem' }}>
            {t('prayers.whereToSend')}
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1.25rem' }}>
            {DEST_CONFIG.map(({ key, icon, bgSelected, borderSelected }) => {
              const selected = destination === key;
              const color = DEST_COLORS[key];
              return (
                <div
                  key={key}
                  onClick={() => setDestination(key)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    padding: '14px 16px',
                    borderRadius: 12,
                    background: selected ? bgSelected : '#fff',
                    border: `1.5px solid ${selected ? borderSelected : '#e0e0e0'}`,
                    borderLeft: `4px solid ${color}`,
                    boxShadow: selected ? `0 2px 10px ${color}22` : '0 1px 4px rgba(0,0,0,0.05)',
                    cursor: 'pointer',
                    transition: 'all 0.18s ease',
                  }}
                >
                  <span style={{ fontSize: '1.6rem', flexShrink: 0 }}>{icon}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, color: selected ? color : '#333', fontSize: '0.95rem' }}>
                      {t(`prayers.${key}Title`)}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#777', marginTop: 2 }}>
                      {t(`prayers.${key}Desc`)}
                    </div>
                  </div>
                  {selected && (
                    <div style={{
                      width: 20, height: 20, borderRadius: '50%',
                      background: color, display: 'flex', alignItems: 'center',
                      justifyContent: 'center', flexShrink: 0,
                    }}>
                      <span style={{ color: '#fff', fontSize: '0.7rem', fontWeight: 700 }}>✓</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Textarea */}
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder={t('prayers.placeholder')}
            required
            rows={4}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: 10,
              border: '1.5px solid #e0e0e0',
              fontSize: '0.95rem',
              fontFamily: 'inherit',
              resize: 'vertical',
              outline: 'none',
              boxSizing: 'border-box',
              transition: 'border-color 0.15s',
            }}
            onFocus={e => e.target.style.borderColor = DEST_COLORS[destination]}
            onBlur={e => e.target.style.borderColor = '#e0e0e0'}
          />

          {/* Anónimo toggle */}
          <label style={{
            display: 'flex', alignItems: 'center', gap: '0.6rem',
            margin: '0.75rem 0', cursor: 'pointer', userSelect: 'none',
          }}>
            <div
              onClick={() => setAnonymous(!anonymous)}
              style={{
                width: 44, height: 24, borderRadius: 12,
                background: anonymous ? '#4a80d4' : '#ccc',
                position: 'relative', transition: 'background 0.2s', cursor: 'pointer',
                flexShrink: 0,
              }}
            >
              <div style={{
                position: 'absolute', top: 3, left: anonymous ? 22 : 3,
                width: 18, height: 18, borderRadius: '50%',
                background: '#fff', transition: 'left 0.2s',
                boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
              }} />
            </div>
            <span style={{ fontSize: '0.9rem', color: '#555' }}>{t('prayers.sendAnon')}</span>
          </label>

          {/* Success message */}
          {successMsg && (
            <div style={{
              background: '#e8f5e9', color: '#2e7d32', borderRadius: 8,
              padding: '10px 14px', marginBottom: '0.75rem', fontSize: '0.9rem',
              display: 'flex', alignItems: 'center', gap: '0.5rem',
            }}>
              <CheckCircle size={16} /> {successMsg}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting || !content.trim()}
            style={{
              width: '100%', padding: '13px',
              borderRadius: 10, border: 'none',
              background: submitting || !content.trim()
                ? '#b0bec5'
                : `linear-gradient(135deg, ${DEST_COLORS[destination]}, ${DEST_COLORS[destination]}cc)`,
              color: '#fff', fontSize: '1rem', fontWeight: 700,
              cursor: submitting || !content.trim() ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s', letterSpacing: '0.02em',
              boxShadow: submitting || !content.trim() ? 'none' : '0 3px 10px rgba(74,128,212,0.3)',
            }}
          >
            {submitting ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                <Loader size={16} className="spin" /> {t('prayers.sending')}
              </span>
            ) : t('prayers.submitBtn')}
          </button>
        </form>
      )}

      {/* ===== PAINEL DO PASTOR ===== */}
      {isPastor && (
        <>
          {/* Separador */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.75rem',
            margin: '2rem 0 1.25rem',
          }}>
            <div style={{ flex: 1, height: 1, background: '#e0e0e0' }} />
            <span style={{ color: '#c9a84c', fontWeight: 700, fontSize: '0.9rem', whiteSpace: 'nowrap' }}>
              — 🕊️ {t('prayers.pastorPanel')} —
            </span>
            <div style={{ flex: 1, height: 1, background: '#e0e0e0' }} />
          </div>

          {/* Filtros */}
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
            {[
              { key: 'all',         label: t('prayers.filterAll') },
              { key: 'pending',     label: t('prayers.statusPending') },
              { key: 'in_progress', label: t('prayers.statusInProgress') },
              { key: 'resolved',    label: t('prayers.statusResolved') },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`btn btn-sm ${filter === key ? 'btn-primary' : 'btn-outline'}`}
                style={filter !== key ? {
                  borderColor: STATUS_COLORS[key] || 'var(--gray-300)',
                  color: STATUS_COLORS[key] || 'var(--gray-500)',
                } : {}}
              >
                {label}
                {key !== 'all' && ` (${requests.filter(r => r.status === key).length})`}
              </button>
            ))}
          </div>

          {loadingRequests ? (
            <p style={{ textAlign: 'center', color: 'var(--gray-500)', padding: '2rem' }}>
              <Loader size={20} className="spin" />
            </p>
          ) : filtered.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '2rem', color: 'var(--gray-500)' }}>
              <CheckCircle size={32} style={{ marginBottom: '0.5rem', color: 'var(--green)' }} />
              <p>{t('prayers.noPending')}</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {filtered.map(req => (
                <div key={req.id} className="card" style={{
                  borderLeft: `4px solid ${STATUS_COLORS[req.status] || STATUS_COLORS.pending}`,
                  padding: '1rem',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '1.3rem' }}>🙏</span>
                      <strong style={{ fontSize: '0.9rem', color: '#333' }}>
                        {req.destination === 'public' ? '🌍 Público' : req.destination === 'group' ? '👥 Grupo' : '🕊️ Pastor'}
                      </strong>
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--gray-500)', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Clock size={12} /> {timeAgo(req.created_at)}
                    </span>
                  </div>

                  {req.name && (
                    <p style={{ fontSize: '0.85rem', color: 'var(--gray-600)', display: 'flex', alignItems: 'center', gap: 4, margin: '0.15rem 0' }}>
                      <User size={14} /> {req.name}
                    </p>
                  )}
                  <p style={{ fontSize: '0.85rem', color: 'var(--gray-600)', display: 'flex', alignItems: 'center', gap: 4, margin: '0.15rem 0' }}>
                    <Phone size={14} /> {req.contact}
                  </p>
                  {req.message && (
                    <p style={{ fontSize: '0.85rem', color: 'var(--gray-600)', display: 'flex', alignItems: 'center', gap: 4, marginTop: '0.25rem' }}>
                      <MessageCircle size={14} /> {req.message}
                    </p>
                  )}

                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
                    {req.status === 'pending' && (
                      <button className="btn btn-sm" style={{ background: '#f39c12', color: '#fff', border: 'none' }}
                        onClick={() => updateStatus(req.id, 'in_progress')}>
                        {t('prayers.markInProgress')}
                      </button>
                    )}
                    {(req.status === 'pending' || req.status === 'in_progress') && (
                      <button className="btn btn-sm btn-green"
                        onClick={() => updateStatus(req.id, 'resolved')}>
                        {t('prayers.markResolved')}
                      </button>
                    )}
                    {req.status === 'resolved' && (
                      <span style={{ color: 'var(--green)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <CheckCircle size={14} /> {t('prayers.statusResolved')}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
