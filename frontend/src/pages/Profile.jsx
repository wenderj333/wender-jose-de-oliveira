import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import ReportModal from '../components/ReportModal';

const API_BASE = import.meta.env.VITE_API_URL || '';
const API = `${API_BASE}/api`;

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'degxiuf43';
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'sigo_com_fe';

async function uploadToCloudinary(file) {
  const form = new FormData();
  form.append('file', file);
  form.append('upload_preset', UPLOAD_PRESET);
  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, { method: 'POST', body: form });
  const data = await res.json();
  return data.secure_url;
}

export default function Profile() {
  const { t } = useTranslation();
  const { userId } = useParams();
  const { user: currentUser, token } = useAuth();

  const targetId = userId || currentUser?.id;
  const isOwn = !userId || userId === currentUser?.id;

  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editBio, setEditBio] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');

  // Instagram-style DM modal
  const [dmOpen, setDmOpen] = useState(false);
  const [dmText, setDmText] = useState('');
  const [dmSent, setDmSent] = useState(false);

  // Report modal
  const [reportOpen, setReportOpen] = useState(false);

  const applyUser = (u) => {
    setProfile(u);
    setEditName(u.full_name || '');
    setEditBio(u.bio || '');
  };

  useEffect(() => {
    if (!targetId) return;
    setLoading(true);
    setError(null);
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    fetch(`${API}/profile/${targetId}`, { headers })
      .then(async r => {
        const data = await r.json().catch(() => ({}));
        if (r.ok && data.user) {
          applyUser(data.user);
        } else if (isOwn && currentUser) {
          applyUser(currentUser);
        } else {
          setError('Perfil nao encontrado.');
        }
        setLoading(false);
      })
      .catch(() => {
        if (isOwn && currentUser) {
          applyUser(currentUser);
        } else {
          setError('Erro ao carregar o perfil.');
        }
        setLoading(false);
      });
  }, [targetId, token]);

  useEffect(() => {
    if (!targetId) return;
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    fetch(`${API}/feed/user/${targetId}?limit=20`, { headers })
      .then(r => r.ok ? r.json() : { posts: [] })
      .then(data => setPosts(data.posts || []))
      .catch(() => setPosts([]));
  }, [targetId, token]);

  const handleSave = async () => {
    setSaving(true);
    setSaveMsg('');
    try {
      const res = await fetch(`${API}/profile`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ full_name: editName, bio: editBio }),
      });
      if (res.ok) {
        setProfile(p => ({ ...p, full_name: editName, bio: editBio }));
        setEditing(false);
        setSaveMsg('Perfil atualizado!');
      } else {
        setSaveMsg('Erro ao guardar.');
      }
    } catch {
      setSaveMsg('Erro ao guardar.');
    }
    setSaving(false);
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const url = await uploadToCloudinary(file);
      await fetch(`${API}/profile`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ avatar_url: url }),
      });
      setProfile(p => ({ ...p, avatar_url: url }));
    } catch {
      alert('Erro ao fazer upload da foto.');
    }
  };

  const sendDM = async () => {
    if (!dmText.trim()) return;
    try {
      await fetch(`${API}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ to_user_id: targetId, content: dmText }),
      });
    } catch {}
    setDmSent(true);
    setTimeout(() => { setDmOpen(false); setDmSent(false); setDmText(''); }, 2000);
  };

  if (loading) return (
    <div style={{padding:40,textAlign:'center',color:'var(--muted,#7b83a6)'}}>
      <div style={{width:36,height:36,border:'3px solid #dde3f0',borderTopColor:'var(--fb,#4a80d4)',borderRadius:'50%',animation:'spin 1s linear infinite',margin:'0 auto 16px'}}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <p>A carregar perfil...</p>
    </div>
  );

  if (error) return (
    <div style={{padding:40,textAlign:'center',color:'#dc2626'}}>
      <p style={{fontSize:'2rem',marginBottom:12}}>😔</p>
      <p>{error}</p>
    </div>
  );

  if (!profile) return null;

  return (
    <div style={{maxWidth:680,margin:'0 auto',paddingBottom:40}}>

      {/* Cover */}
      <div style={{
        height:160,
        background: profile.cover_url
          ? `url(${profile.cover_url}) center/cover`
          : 'linear-gradient(135deg,var(--fb2,#3568b8),var(--fb,#4a80d4))',
        borderRadius:'0 0 16px 16px'
      }}/>

      {/* Avatar + Name + Buttons */}
      <div style={{display:'flex',alignItems:'flex-end',gap:14,padding:'0 20px',marginTop:-44,marginBottom:16,flexWrap:'wrap'}}>
        {/* Avatar */}
        <div style={{position:'relative',flexShrink:0}}>
          <div style={{width:82,height:82,borderRadius:'50%',border:'3px solid white',overflow:'hidden',background:'var(--bg,#f5f7ff)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'2rem',boxShadow:'0 2px 10px rgba(74,128,212,0.2)'}}>
            {profile.avatar_url
              ? <img src={profile.avatar_url} alt={profile.full_name} style={{width:'100%',height:'100%',objectFit:'cover'}}/>
              : <span>{(profile.full_name || '?').charAt(0).toUpperCase()}</span>
            }
          </div>
          {isOwn && (
            <label style={{position:'absolute',bottom:0,right:0,width:26,height:26,borderRadius:'50%',background:'var(--fb,#4a80d4)',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',border:'2px solid white'}}>
              <span style={{color:'white',fontSize:'0.75rem'}}>📷</span>
              <input type="file" accept="image/*" onChange={handleAvatarChange} style={{display:'none'}}/>
            </label>
          )}
        </div>

        {/* Name + role */}
        <div style={{flex:1,minWidth:120,paddingBottom:4}}>
          <h2 style={{color:'var(--text,#1e2240)',fontFamily:"'Cormorant Garamond',serif",fontSize:'1.35rem',fontWeight:700,margin:0,lineHeight:1.2}}>
            {profile.full_name || 'Utilizador'}
          </h2>
          <p style={{color:'var(--muted,#7b83a6)',fontSize:'0.8rem',margin:'2px 0 0'}}>
            {profile.role === 'pastor' ? '🕊️ Pastor' : '🙏 Membro'}
          </p>
        </div>

        {/* Action buttons */}
        <div style={{display:'flex',gap:8,paddingBottom:4,flexShrink:0}}>
          {isOwn && !editing && (
            <button onClick={() => setEditing(true)} style={{padding:'8px 16px',borderRadius:9,background:'var(--fb-light,#edf2fc)',border:'1px solid var(--border,#e0e6f5)',color:'var(--fb,#4a80d4)',fontSize:'0.83rem',fontWeight:600,cursor:'pointer'}}>
              Editar perfil
            </button>
          )}
          {!isOwn && (
            <>
              <button onClick={() => setDmOpen(true)} style={{padding:'8px 16px',borderRadius:9,background:'linear-gradient(135deg,var(--fb2,#3568b8),var(--fb,#4a80d4))',border:'none',color:'white',fontSize:'0.83rem',fontWeight:600,cursor:'pointer',display:'flex',alignItems:'center',gap:6}}>
                💬 {t('profile.message', 'Mensagem')}
              </button>
              <button style={{padding:'8px 14px',borderRadius:9,background:'var(--fb-light,#edf2fc)',border:'1px solid var(--border,#e0e6f5)',color:'var(--fb,#4a80d4)',fontSize:'0.83rem',fontWeight:600,cursor:'pointer'}}>
                ➕ {t('profile.follow', 'Seguir')}
              </button>
              <button onClick={() => setReportOpen(true)} style={{padding:'8px 10px',borderRadius:9,background:'none',border:'none',color:'#aaa',fontSize:'0.8rem',cursor:'pointer',display:'flex',alignItems:'center',gap:4}} title={t('report.title')}>
                🚩
              </button>
            </>
          )}
        </div>
      </div>

      {/* Bio / Edit Form */}
      {!editing ? (
        <div style={{padding:'0 20px',marginBottom:20}}>
          {profile.bio && <p style={{color:'var(--text2,#3d4466)',fontSize:'0.9rem',lineHeight:1.6}}>{profile.bio}</p>}
          {profile.location && <p style={{color:'var(--muted,#7b83a6)',fontSize:'0.8rem',marginTop:6}}>📍 {profile.location}</p>}
          {profile.church_name && <p style={{color:'var(--muted,#7b83a6)',fontSize:'0.8rem'}}>⛪ {profile.church_name}</p>}
          {saveMsg && <p style={{color:'var(--gold,#a07820)',fontSize:'0.82rem',marginTop:8,fontWeight:600}}>{saveMsg}</p>}
        </div>
      ) : (
        <div style={{background:'white',borderRadius:12,margin:'0 20px 20px',padding:16,border:'1px solid var(--border,#e0e6f5)',boxShadow:'0 2px 8px rgba(74,128,212,0.06)'}}>
          <label style={{display:'block',marginBottom:6,fontSize:'0.82rem',color:'var(--muted,#7b83a6)',fontWeight:600}}>Nome</label>
          <input
            value={editName}
            onChange={e => setEditName(e.target.value)}
            style={{width:'100%',background:'var(--bg,#f5f7ff)',border:'1px solid var(--border,#e0e6f5)',borderRadius:8,padding:'9px 12px',color:'var(--text,#1e2240)',fontSize:'0.9rem',marginBottom:12,outline:'none'}}
          />
          <label style={{display:'block',marginBottom:6,fontSize:'0.82rem',color:'var(--muted,#7b83a6)',fontWeight:600}}>Bio</label>
          <textarea
            value={editBio}
            onChange={e => setEditBio(e.target.value)}
            rows={3}
            style={{width:'100%',background:'var(--bg,#f5f7ff)',border:'1px solid var(--border,#e0e6f5)',borderRadius:8,padding:'9px 12px',color:'var(--text,#1e2240)',fontSize:'0.9rem',resize:'vertical',outline:'none',marginBottom:12}}
          />
          <div style={{display:'flex',gap:8}}>
            <button onClick={handleSave} disabled={saving} style={{flex:1,padding:'10px',borderRadius:9,background:'linear-gradient(135deg,#3568b8,#4a80d4)',border:'none',color:'white',fontWeight:600,cursor:'pointer',fontSize:'0.88rem'}}>
              {saving ? 'A guardar...' : 'Guardar'}
            </button>
            <button onClick={() => setEditing(false)} style={{padding:'10px 16px',borderRadius:9,background:'var(--bg,#f5f7ff)',border:'1px solid var(--border,#e0e6f5)',color:'var(--text2,#3d4466)',cursor:'pointer',fontSize:'0.88rem'}}>
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Stats */}
      <div style={{display:'flex',borderTop:'1px solid var(--border,#e0e6f5)',borderBottom:'1px solid var(--border,#e0e6f5)',marginBottom:20}}>
        {[
          { label: 'Publicacoes', val: posts.length },
          { label: t('profile.friends'), val: profile.stats?.friends || 0 },
          { label: t('nav.prayers'), val: profile.stats?.prayers || 0 },
        ].map(s => (
          <div key={s.label} style={{flex:1,textAlign:'center',padding:'14px 0',cursor:'pointer'}}>
            <div style={{fontSize:'1.2rem',fontWeight:700,color:'var(--fb,#4a80d4)'}}>{s.val}</div>
            <div style={{fontSize:'0.68rem',color:'var(--muted,#7b83a6)',textTransform:'uppercase',letterSpacing:'0.06em',marginTop:2}}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Posts Grid */}
      <div style={{padding:'0 16px'}}>
        <h3 style={{color:'var(--muted,#7b83a6)',fontSize:'0.72rem',fontWeight:700,marginBottom:14,textTransform:'uppercase',letterSpacing:'0.1em'}}>
          Publicacoes
        </h3>
        {posts.length === 0 ? (
          <p style={{color:'var(--muted,#7b83a6)',textAlign:'center',padding:32,fontSize:'0.9rem'}}>
            Nenhuma publicacao ainda.
          </p>
        ) : (
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:3}}>
            {posts.filter(p => p.media_url).map(post => (
              <div key={post.id} style={{aspectRatio:'1',borderRadius:4,overflow:'hidden',background:'var(--bg2,#eef1fb)',cursor:'pointer'}}>
                <img src={post.media_url} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>
              </div>
            ))}
            {posts.filter(p => !p.media_url).map(post => (
              <div key={post.id} style={{background:'var(--card,#ffffff)',borderRadius:10,padding:12,border:'1px solid var(--border,#e0e6f5)',gridColumn:'span 3',marginBottom:8}}>
                <p style={{color:'var(--text,#1e2240)',fontSize:'0.88rem',lineHeight:1.6}}>{post.content}</p>
                <p style={{color:'var(--muted,#7b83a6)',fontSize:'0.7rem',marginTop:6}}>{new Date(post.created_at).toLocaleDateString('pt-PT')}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Report Modal */}
      {reportOpen && (
        <ReportModal
          type="user"
          targetId={targetId}
          targetName={profile?.full_name}
          onClose={() => setReportOpen(false)}
        />
      )}

      {/* DM Modal (Instagram-style) */}
      {dmOpen && (
        <div style={{position:'fixed',inset:0,zIndex:500,background:'rgba(0,0,0,0.5)',display:'flex',alignItems:'flex-end',justifyContent:'center',padding:'0 0 0 0'}} onClick={() => setDmOpen(false)}>
          <div style={{background:'white',borderRadius:'20px 20px 0 0',width:'100%',maxWidth:500,padding:24,boxShadow:'0 -8px 32px rgba(0,0,0,0.15)'}} onClick={e => e.stopPropagation()}>
            {/* Handle */}
            <div style={{width:40,height:4,background:'#dde3f0',borderRadius:2,margin:'0 auto 20px'}}/>
            <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:20}}>
              <div style={{width:40,height:40,borderRadius:'50%',background:'linear-gradient(135deg,#3568b8,#4a80d4)',display:'flex',alignItems:'center',justifyContent:'center',color:'white',fontSize:'1rem',flexShrink:0}}>
                {(profile.full_name||'?').charAt(0).toUpperCase()}
              </div>
              <div>
                <p style={{fontWeight:600,color:'#1e2240',fontSize:'0.9rem',margin:0}}>{profile.full_name}</p>
                <p style={{color:'#7b83a6',fontSize:'0.75rem',margin:0}}>Enviar mensagem privada</p>
              </div>
            </div>
            {dmSent ? (
              <div style={{textAlign:'center',padding:20}}>
                <p style={{fontSize:'1.5rem',marginBottom:8}}>✅</p>
                <p style={{color:'#1e2240',fontWeight:600}}>Mensagem enviada!</p>
              </div>
            ) : (
              <>
                <textarea
                  value={dmText}
                  onChange={e => setDmText(e.target.value)}
                  placeholder={`Escreva uma mensagem para ${profile.full_name}...`}
                  rows={4}
                  autoFocus
                  style={{width:'100%',background:'#f5f7ff',border:'1px solid #e0e6f5',borderRadius:12,padding:'12px 14px',color:'#1e2240',fontSize:'0.9rem',resize:'none',outline:'none',marginBottom:14,fontFamily:'inherit'}}
                />
                <button onClick={sendDM} disabled={!dmText.trim()} style={{width:'100%',padding:13,borderRadius:12,background:'linear-gradient(135deg,#3568b8,#4a80d4)',border:'none',color:'white',fontWeight:700,fontSize:'0.95rem',cursor:'pointer',opacity:dmText.trim()?1:0.6}}>
                  Enviar Mensagem
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
