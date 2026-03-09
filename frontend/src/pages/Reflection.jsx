import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { BookOpen } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Reflection() {
  const { t } = useTranslation();
  const { user, token } = useAuth();
  const [questions, setQuestions] = useState([]);
  const [reflectionText, setReflectionText] = useState('');
  const [saving, setSaving] = useState(false);
  const [recentReflections, setRecentReflections] = useState([]);

  useEffect(() => {
    // Carrega perguntas baseadas no dia do ano
    const allQuestions = t('reflection.questions', { returnObjects: true });
    if (Array.isArray(allQuestions) && allQuestions.length > 0) {
      const now = new Date();
      const start = new Date(now.getFullYear(), 0, 0);
      const diff = now - start;
      const oneDay = 1000 * 60 * 60 * 24;
      const day = Math.floor(diff / oneDay);

      const q1 = allQuestions[day % allQuestions.length];
      const q2 = allQuestions[(day + 5) % allQuestions.length];
      const q3 = allQuestions[(day + 10) % allQuestions.length];
      setQuestions([q1, q2, q3]);
    }

    // Busca reflexões recentes da comunidade (usando endpoint de feed)
    fetchCommunityReflections();
  }, [t, token]);

  const fetchCommunityReflections = async () => {
    try {
      // Usando o endpoint de feed filtrado por categoria (se o backend suportar)
      // Se não suportar ainda, busca o geral e filtra no frontend temporariamente
      const API = (import.meta.env.VITE_API_URL || '') + '/api';
      const res = await fetch(`${API}/feed?limit=20`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      const data = await res.json();
      if (data.posts) {
        // Filtra apenas posts da categoria 'reflexao'
        const reflections = data.posts.filter(p => p.category === 'reflexao');
        setRecentReflections(reflections);
      }
    } catch (e) {
      console.error("Erro ao buscar reflexões:", e);
    }
  };

  const handleSave = async () => {
    if (!reflectionText.trim()) return;
    setSaving(true);
    try {
      const API = (import.meta.env.VITE_API_URL || '') + '/api';
      const res = await fetch(`${API}/feed`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          content: reflectionText,
          category: 'reflexao'
        })
      });

      if (res.ok) {
        alert(t('reflection.saved', 'Reflexão compartilhada com a comunidade!'));
        setReflectionText('');
        fetchCommunityReflections(); // Atualiza a lista
      } else {
        throw new Error('Falha ao salvar');
      }
    } catch (e) {
      console.error(e);
      alert(t('common.error', 'Ocorreu um erro. Tente novamente.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page-container" style={{padding: '20px', maxWidth: '800px', margin: '0 auto'}}>
      <header style={{textAlign: 'center', marginBottom: '40px'}}>
        <div style={{
          width: 80, height: 80, background: 'linear-gradient(135deg, #a8e063 0%, #56ab2f 100%)', 
          borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px',
          boxShadow: '0 10px 25px rgba(86, 171, 47, 0.3)'
        }}>
          <span style={{fontSize: '2.5rem'}}>🌿</span>
        </div>
        <h1 style={{fontFamily: "'Cormorant Garamond', serif", fontSize: '2.5rem', color: 'var(--text)', marginBottom: '10px'}}>
          {t('reflection.title', 'Reflexão com Deus')}
        </h1>
        <p style={{color: 'var(--muted)', fontSize: '1.1rem'}}>
          {t('reflection.subtitle', 'Pare um momento. Respire. Ouça a voz de Deus.')}
        </p>
      </header>

      <div className="reflection-cards" style={{display: 'flex', flexDirection: 'column', gap: '20px'}}>
        {questions.map((q, i) => (
          <div key={i} className="glass-card" style={{
            padding: '30px', borderRadius: '20px', background: 'var(--card)', 
            borderLeft: '5px solid #56ab2f', display: 'flex', gap: '20px', alignItems: 'flex-start',
            boxShadow: '0 4px 20px rgba(0,0,0,0.05)', animation: `fadeIn 0.5s ease-out ${i * 0.2}s backwards`
          }}>
            <div style={{
              background: 'rgba(86, 171, 47, 0.1)', color: '#56ab2f', width: 40, height: 40, borderRadius: '50%', 
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontWeight: 'bold'
            }}>
              {i + 1}
            </div>
            <div>
              <h3 style={{fontSize: '1.4rem', fontFamily: "'Cormorant Garamond', serif", marginBottom: '10px', color: 'var(--text)'}}>
                {q}
              </h3>
            </div>
          </div>
        ))}
      </div>

      {user ? (
        <div style={{marginTop: '40px', background: 'var(--card)', padding: '30px', borderRadius: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)'}}>
          <h3 style={{fontSize: '1.2rem', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px'}}>
            <BookOpen size={20} color="var(--gold)" /> 
            {t('reflection.journal', 'Seu Diário Espiritual (Opcional)')}
          </h3>
          <textarea 
            value={reflectionText}
            onChange={(e) => setReflectionText(e.target.value)}
            placeholder={t('reflection.placeholder', 'Escreva aqui o que Deus falou ao seu coração...')}
            style={{
              width: '100%', height: '150px', padding: '15px', borderRadius: '12px', border: '1px solid var(--border)', 
              background: 'var(--bg)', fontSize: '1rem', fontFamily: 'inherit', resize: 'vertical', outline: 'none'
            }}
          />
          <div style={{marginTop: '15px', display: 'flex', justifyContent: 'flex-end'}}>
            <button className="btn btn-primary" onClick={handleSave} disabled={saving || !reflectionText.trim()}>
              {saving ? '...' : t('reflection.saveBtn', 'Compartilhar Reflexão')}
            </button>
          </div>
        </div>
      ) : (
        <div style={{textAlign:'center', marginTop:'40px', padding:'20px', background:'var(--bg)', borderRadius:'12px'}}>
          <p>{t('reflection.loginRequired', 'Faça login para escrever e compartilhar sua reflexão.')}</p>
        </div>
      )}

      {/* Community Reflections Section */}
      <div style={{marginTop: '50px'}}>
        <h2 style={{fontSize: '1.5rem', marginBottom: '20px', color: 'var(--primary-dark)', textAlign: 'center'}}>
          {t('reflection.community', 'Reflexões da Comunidade')}
        </h2>
        {recentReflections.length > 0 ? (
          <div style={{display: 'flex', flexDirection: 'column', gap: '15px'}}>
            {recentReflections.map(post => (
              <div key={post.id} style={{padding: '20px', background: 'var(--card)', borderRadius: '16px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)'}}>
                <div style={{display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px'}}>
                  {post.author_avatar ? (
                    <img src={post.author_avatar} alt="" style={{width: 36, height: 36, borderRadius: '50%', objectFit: 'cover'}} />
                  ) : (
                    <div style={{width: 36, height: 36, borderRadius: '50%', background: 'var(--primary-pale)', color: 'var(--primary-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold'}}>
                      {post.author_name?.charAt(0) || '👤'}
                    </div>
                  )}
                  <div>
                    <div style={{fontWeight: 600, fontSize: '0.95rem'}}>{post.author_name}</div>
                    <div style={{fontSize: '0.75rem', color: 'var(--muted)'}}>{new Date(post.created_at).toLocaleDateString()}</div>
                  </div>
                </div>
                <p style={{fontSize: '1rem', lineHeight: '1.6', color: 'var(--gray-800)', whiteSpace: 'pre-wrap'}}>{post.content}</p>
              </div>
            ))}
          </div>
        ) : (
          <p style={{textAlign: 'center', color: 'var(--muted)'}}>{t('reflection.noCommunity', 'Seja o primeiro a compartilhar uma reflexão hoje!')}</p>
        )}
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}