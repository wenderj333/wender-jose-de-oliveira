import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import ReportModal from '../components/ReportModal';

// Add Cloudinary transformation to ensure 500x500 crop for avatars
function cloudinaryTransform(url, transforms = 'w_500,h_500,c_fill,q_auto,f_auto') {
  if (!url || !url.includes('cloudinary.com')) return url;
  return url.replace('/upload/', `/upload/${transforms}/`);
}

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

const EFFECTS = [
  { id: 'none', label: 'Normal', filter: 'none' },
  { id: 'sepia', label: 'Sépia', filter: 'sepia(100%)' },
  { id: 'bw', label: 'P&B', filter: 'grayscale(100%)' },
  { id: 'vintage', label: 'Vintage', filter: 'sepia(60%) contrast(110%) brightness(95%)' },
  { id: 'warm', label: 'Quente', filter: 'sepia(40%) saturate(160%) brightness(108%)' },
  { id: 'cold', label: 'Frio', filter: 'hue-rotate(200deg) saturate(130%) brightness(105%)' },
  { id: 'vivid', label: 'Vívido', filter: 'saturate(220%) contrast(115%)' },
  { id: 'fade', label: 'Desbotado', filter: 'brightness(130%) contrast(75%) saturate(70%)' },
  { id: 'dramatic', label: 'Dramático', filter: 'contrast(160%) grayscale(25%) brightness(90%)' },
];

async function applyFilterAndUpload(file, cssFilter) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (cssFilter !== 'none') ctx.filter = cssFilter;
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);
      canvas.toBlob(async (blob) => {
        try {
          const form = new FormData();
          form.append('file', blob, 'avatar.jpg');
          form.append('upload_preset', UPLOAD_PRESET);
          const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, { method: 'POST', body: form });
          const data = await res.json();
          resolve(data.secure_url);
        } catch(e) { reject(e); }
      }, 'image/jpeg', 0.92);
    };
    img.onerror = reject;
    img.src = url;
  });
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

  // Lightbox modal for viewing photos full size
  const [lightboxUrl, setLightboxUrl] = useState(null);

  // Photo effects modal
  const [effectsOpen, setEffectsOpen] = useState(false);
  const [effectsFile, setEffectsFile] = useState(null);
  const [effectsPreviewUrl, setEffectsPreviewUrl] = useState(null);
  const [selectedEffect, setSelectedEffect] = useState('none');
  const [applyingEffect, setApplyingEffect] = useState(false);

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

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const previewUrl = URL.createObjectURL(file);
    setEffectsFile(file);
    setEffectsPreviewUrl(previewUrl);
    setSelectedEffect('none');
    setEffectsOpen(true);
    // reset input so same file can be picked again
    e.target.value = '';
  };

  const handleEffectsCancel = () => {
    if (effectsPreviewUrl) URL.revokeObjectURL(effectsPreviewUrl);
    setEffectsOpen(false);
    setEffectsFile(null);
    setEffectsPreviewUrl(null);
    setSelectedEffect('none');
  };

  const handleEffectsApply = async () => {
    if (!effectsFile) return;
    setApplyingEffect(true);
    try {
      const cssFilter = EFFECTS.find(e => e.id === selectedEffect)?.filter || 'none';
      const url = await applyFilterAndUpload(effectsFile, cssFilter);
      await fetch(`${API}/profile`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ avatar_url: url }),
      });
      setProfile(p => ({ ...p, avatar_url: url }));
      handleEffectsCancel();
    } catch {
      alert('Erro ao aplicar o efeito.');
    }
    setApplyingEffect(false);
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
      <div
        onClick={() => profile.cover_url && setLightboxUrl(profile.cover_url)}
        style={{
          height:160,
          background: profile.cover_url
            ? `url(${profile.cover_url}) center/cover`
            : 'linear-gradient(135deg,var(--fb2,#3568b8),var(--fb,#4a80d4))',
          borderRadius:'0 0 16px 16px',
          cursor: profile.cover_url ? 'zoom-in' : 'default',
          position:'relative',
        }}
      >
        {profile.cover_url && (
          <span style={{position:'absolute',bottom:8,right:10,fontSize:'0.65rem',background:'rgba(0,0,0,0.45)',color:'white',padding:'2px 7px',borderRadius:8,pointerEvents:'none'}}>🔍 Ver foto</span>
        )}
      </div>

      {/* Avatar + Name + Buttons */}
      <div style={{display:'flex',alignItems:'flex-end',gap:14,padding:'0 20px',marginTop:-44,marginBottom:16,flexWrap:'wrap'}}>
        {/* Avatar */}
        <div style={{position:'relative',flexShrink:0}}>
          <div
            onClick={() => profile.avatar_url && setLightboxUrl(cloudinaryTransform(profile.avatar_url, 'w_800,h_800,c_fill,q_auto,f_auto'))}
            style={{width:82,height:82,borderRadius:'50%',border:'3px solid white',overflow:'hidden',background:'var(--bg,#f5f7ff)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'2rem',boxShadow:'0 2px 10px rgba(74,128,212,0.2)',cursor:profile.avatar_url?'zoom-in':'default'}}
          >
            {profile.avatar_url
              ? <img src={cloudinaryTransform(profile.avatar_url)} alt={profile.full_name} style={{width:'100%',height:'100%',objectFit:'cover'}}/>
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

      {/* Lightbox Modal */}
      {lightboxUrl && (
        <div
          onClick={() => setLightboxUrl(null)}
          style={{position:'fixed',inset:0,zIndex:700,background:'rgba(0,0,0,0.88)',display:'flex',alignItems:'center',justifyContent:'center',padding:16}}
        >
          <div style={{position:'relative',maxWidth:'90vw',maxHeight:'90vh'}} onClick={e => e.stopPropagation()}>
            <img
              src={lightboxUrl}
              alt="Foto"
              style={{maxWidth:'100%',maxHeight:'85vh',objectFit:'contain',borderRadius:10,boxShadow:'0 8px 40px rgba(0,0,0,0.6)'}}
            />
            <button
              onClick={() => setLightboxUrl(null)}
              style={{position:'absolute',top:-14,right:-14,width:34,height:34,borderRadius:'50%',background:'white',border:'none',cursor:'pointer',fontSize:'1.1rem',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 2px 8px rgba(0,0,0,0.3)',lineHeight:1}}
            >✕</button>
          </div>
        </div>
      )}

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

      {/* Photo Effects Modal */}
      {effectsOpen && effectsPreviewUrl && (
        <div
          style={{position:'fixed',inset:0,zIndex:600,background:'rgba(0,0,0,0.7)',display:'flex',alignItems:'center',justifyContent:'center',padding:16}}
          onClick={handleEffectsCancel}
        >
          <div
            style={{background:'white',borderRadius:16,width:'100%',maxWidth:420,overflow:'hidden',boxShadow:'0 12px 48px rgba(0,0,0,0.35)'}}
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{padding:'16px 20px',borderBottom:'1px solid #e0e6f5',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
              <span style={{fontWeight:700,color:'#1e2240',fontSize:'0.95rem'}}>Efeitos de foto</span>
              <button onClick={handleEffectsCancel} style={{background:'none',border:'none',cursor:'pointer',color:'#7b83a6',fontSize:'1.2rem',lineHeight:1,padding:0}}>✕</button>
            </div>

            {/* Big preview */}
            <div style={{display:'flex',alignItems:'center',justifyContent:'center',background:'#000',padding:8}}>
              <img
                src={effectsPreviewUrl}
                alt="Preview"
                style={{
                  width:300,
                  height:300,
                  objectFit:'cover',
                  borderRadius:8,
                  filter: EFFECTS.find(e => e.id === selectedEffect)?.filter || 'none',
                  transition:'filter 0.2s ease',
                }}
              />
            </div>

            {/* Effects grid */}
            <div style={{padding:'12px 16px'}}>
              <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:8}}>
                {EFFECTS.map(effect => (
                  <div
                    key={effect.id}
                    onClick={() => setSelectedEffect(effect.id)}
                    style={{
                      cursor:'pointer',
                      display:'flex',
                      flexDirection:'column',
                      alignItems:'center',
                      gap:4,
                      padding:4,
                      borderRadius:10,
                      border: selectedEffect === effect.id ? '2px solid #4a80d4' : '2px solid transparent',
                      background: selectedEffect === effect.id ? '#edf2fc' : 'transparent',
                      transition:'border-color 0.15s, background 0.15s',
                    }}
                  >
                    <div style={{width:80,height:80,borderRadius:8,overflow:'hidden',flexShrink:0}}>
                      <img
                        src={effectsPreviewUrl}
                        alt={effect.label}
                        style={{
                          width:'100%',
                          height:'100%',
                          objectFit:'cover',
                          filter: effect.filter,
                          display:'block',
                        }}
                      />
                    </div>
                    <span style={{
                      fontSize:'0.68rem',
                      fontWeight: selectedEffect === effect.id ? 700 : 500,
                      color: selectedEffect === effect.id ? '#4a80d4' : '#7b83a6',
                      textAlign:'center',
                      lineHeight:1.2,
                    }}>
                      {effect.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Buttons */}
            <div style={{padding:'12px 16px 20px',display:'flex',gap:10}}>
              <button
                onClick={handleEffectsCancel}
                disabled={applyingEffect}
                style={{flex:1,padding:'11px',borderRadius:10,background:'#f0f2f8',border:'none',color:'#3d4466',fontWeight:600,fontSize:'0.9rem',cursor:'pointer'}}
              >
                Cancelar
              </button>
              <button
                onClick={handleEffectsApply}
                disabled={applyingEffect}
                style={{
                  flex:2,
                  padding:'11px',
                  borderRadius:10,
                  background: applyingEffect ? '#a0b8e8' : 'linear-gradient(135deg,#3568b8,#4a80d4)',
                  border:'none',
                  color:'white',
                  fontWeight:700,
                  fontSize:'0.9rem',
                  cursor: applyingEffect ? 'not-allowed' : 'pointer',
                  display:'flex',
                  alignItems:'center',
                  justifyContent:'center',
                  gap:8,
                }}
              >
                {applyingEffect ? (
                  <>
                    <span style={{
                      width:14,height:14,
                      border:'2px solid rgba(255,255,255,0.4)',
                      borderTopColor:'white',
                      borderRadius:'50%',
                      display:'inline-block',
                      animation:'spin 0.8s linear infinite',
                    }}/>
                    A aplicar...
                  </>
                ) : 'Aplicar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
