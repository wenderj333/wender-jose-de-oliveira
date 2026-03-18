import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';

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

  // Edit state
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editBio, setEditBio] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');

  useEffect(() => {
    if (!targetId) return;
    setLoading(true);
    setError(null);
    fetch(`${API}/profile/${targetId}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(data => {
        if (data.user) {
          setProfile(data.user);
          setEditName(data.user.full_name || '');
          setEditBio(data.user.bio || '');
        } else {
          setError('Perfil nÃ£o encontrado.');
        }
        setLoading(false);
      })
      .catch(() => {
        setError('Erro ao carregar o perfil.');
        setLoading(false);
      });
  }, [targetId, token]);

  useEffect(() => {
    if (!targetId) return;
    fetch(`${API}/feed/user/${targetId}?limit=20`, {
      headers: { Authorization: `Bearer ${token}` }
    })
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
      const data = await res.json();
      if (res.ok) {
        setProfile(p => ({ ...p, full_name: editName, bio: editBio }));
        setEditing(false);
        setSaveMsg('Perfil atualizado!');
      } else {
        setSaveMsg(data.error || 'Erro ao guardar.');
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

  if (loading) return (
    <div style={{padding:40,textAlign:'center',color:'var(--muted)'}}>
      <div style={{width:36,height:36,border:'3px solid #e2e8f0',borderTopColor:'var(--fb)',borderRadius:'50%',animation:'spin 1s linear infinite',margin:'0 auto 16px'}}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <p>A carregar perfil...</p>
    </div>
  );

  if (error) return (
    <div style={{padding:40,textAlign:'center',color:'#ff6b6b'}}>
      <p style={{fontSize:'2rem',marginBottom:12}}>ðŸ˜”</p>
      <p>{error}</p>
    </div>
  );

  if (!profile) return null;

  return (
    <div style={{maxWidth:680,margin:'0 auto',padding:'0 0 40px'}}>

      {/* Cover */}
      <div style={{height:160,background:profile.cover_url ? `url(${profile.cover_url}) center/cover` : 'linear-gradient(135deg,var(--fb2),var(--fb))',borderRadius:'0 0 16px 16px',marginBottom:0,position:'relative'}}>
      </div>

      {/* Avatar + Name */}
      <div style={{display:'flex',alignItems:'flex-end',gap:16,padding:'0 20px',marginTop:-40,marginBottom:16}}>
        <div style={{position:'relative'}}>
          <div style={{width:80,height:80,borderRadius:'50%',border:'3px solid var(--bg)',overflow:'hidden',background:'var(--card)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'2rem'}}>
            {profile.avatar_url
              ? <img src={profile.avatar_url} alt={profile.full_name} style={{width:'100%',height:'100%',objectFit:'cover'}}/>
              : <span>{profile.full_name?.charAt(0) || '?'}</span>
            }
          </div>
          {isOwn && (
            <label style={{position:'absolute',bottom:0,right:0,width:24,height:24,borderRadius:'50%',background:'var(--fb)',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',border:'2px solid var(--bg)'}}>
              <span style={{color:'white',fontSize:'0.7rem'}}>ðŸ“·</span>
              <input type="file" accept="image/*" onChange={handleAvatarChange} style={{display:'none'}}/>
            </label>
          )}
        </div>
        <div style={{flex:1,paddingBottom:4}}>
          <h2 style={{color:'var(--text)',fontFamily:"'Cormorant Garamond',serif",fontSize:'1.3rem',fontWeight:700,margin:0}}>{profile.full_name}</h2>
          <p style={{color:'var(--muted)',fontSize:'0.8rem',margin:0}}>{profile.role === 'pastor' ? 'ðŸ•Šï¸ Pastor' : 'ðŸ™ Membro'}</p>
        </div>
        {isOwn && !editing && (
          <button onClick={() => setEditing(true)} style={{padding:'7px 16px',borderRadius:9,background:'rgba(255,255,255,0.08)',border:'1px solid var(--border)',color:'var(--text)',fontSize:'0.82rem',cursor:'pointer'}}>
            Editar perfil
          </button>
        )}
      </div>

      {/* Bio */}
      {!editing ? (
        <div style={{padding:'0 20px',marginBottom:20}}>
          {profile.bio && <p style={{color:'var(--text)',fontSize:'0.9rem',lineHeight:1.6}}>{profile.bio}</p>}
          {profile.location && <p style={{color:'var(--muted)',fontSize:'0.8rem',marginTop:6}}>ðŸ“ {profile.location}</p>}
          {profile.church_name && <p style={{color:'var(--muted)',fontSize:'0.8rem'}}>â›ª {profile.church_name}</p>}
          {saveMsg && <p style={{color:'var(--gold)',fontSize:'0.82rem',marginTop:8}}>{saveMsg}</p>}
        </div>
      ) : (
        <div style={{background:'var(--card)',borderRadius:12,margin:'0 20px 20px',padding:16,border:'1px solid var(--border)'}}>
          <label style={{display:'block',marginBottom:6,fontSize:'0.82rem',color:'var(--muted)'}}>Nome</label>
          <input
            value={editName}
            onChange={e=>setEditName(e.target.value)}
            style={{width:'100%',background:'rgba(255,255,255,0.06)',border:'1px solid var(--border)',borderRadius:8,padding:'8px 12px',color:'var(--text)',fontSize:'0.9rem',marginBottom:12,outline:'none'}}
          />
          <label style={{display:'block',marginBottom:6,fontSize:'0.82rem',color:'var(--muted)'}}>Bio</label>
          <textarea
            value={editBio}
            onChange={e=>setEditBio(e.target.value)}
            rows={3}
            style={{width:'100%',background:'rgba(255,255,255,0.06)',border:'1px solid var(--border)',borderRadius:8,padding:'8px 12px',color:'var(--text)',fontSize:'0.9rem',resize:'vertical',outline:'none',marginBottom:12}}
          />
          <div style={{display:'flex',gap:8}}>
            <button onClick={handleSave} disabled={saving} style={{flex:1,padding:'9px',borderRadius:9,background:'linear-gradient(135deg,var(--fb),var(--fb2))',border:'none',color:'white',fontWeight:600,cursor:'pointer',fontSize:'0.88rem'}}>
              {saving ? 'A guardar...' : 'Guardar'}
            </button>
            <button onClick={()=>setEditing(false)} style={{padding:'9px 16px',borderRadius:9,background:'rgba(255,255,255,0.07)',border:'1px solid var(--border)',color:'var(--text)',cursor:'pointer',fontSize:'0.88rem'}}>
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Stats */}
      <div style={{display:'flex',gap:0,borderTop:'1px solid var(--border)',borderBottom:'1px solid var(--border)',margin:'0 0 20px'}}>
        {[
          { label: 'PublicaÃ§Ãµes', val: posts.length },
          { label: 'Amigos', val: profile.stats?.friends || 0 },
          { label: 'OraÃ§Ãµes', val: profile.stats?.prayers || 0 },
        ].map(s => (
          <div key={s.label} style={{flex:1,textAlign:'center',padding:'14px 0'}}>
            <div style={{fontSize:'1.2rem',fontWeight:700,color:'var(--text)'}}>{s.val}</div>
            <div style={{fontSize:'0.7rem',color:'var(--muted)',textTransform:'uppercase',letterSpacing:'0.05em'}}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Posts */}
      <div style={{padding:'0 16px'}}>
        <h3 style={{color:'var(--text)',fontSize:'0.9rem',fontWeight:700,marginBottom:14,textTransform:'uppercase',letterSpacing:'0.05em',opacity:0.7}}>PublicaÃ§Ãµes</h3>
        {posts.length === 0 ? (
          <p style={{color:'var(--muted)',textAlign:'center',padding:24,fontSize:'0.9rem'}}>Nenhuma publicaÃ§Ã£o ainda.</p>
        ) : (
          <div style={{display:'flex',flexDirection:'column',gap:12}}>
            {posts.map(post => (
              <div key={post.id} style={{background:'var(--card)',borderRadius:12,padding:16,border:'1px solid var(--border)'}}>
                {post.media_url && (
                  <img src={post.media_url} alt="" style={{width:'100%',borderRadius:8,marginBottom:10,maxHeight:300,objectFit:'cover'}}/>
                )}
                {post.content && <p style={{color:'var(--text)',fontSize:'0.9rem',lineHeight:1.6}}>{post.content}</p>}
                <p style={{color:'var(--muted)',fontSize:'0.72rem',marginTop:8}}>{new Date(post.created_at).toLocaleDateString('pt-PT')}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

