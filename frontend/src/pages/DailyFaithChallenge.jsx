import { useEffect, useState } from 'react';
import { Flame, Medal, Sparkles, CheckCircle2, XCircle, CalendarDays } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const API_BASE = import.meta.env.VITE_API_URL || 'https://sigo-com-fe-api.onrender.com';

const copy = {
  pt: { title: 'Desafio Diário de Fé', subtitle: 'Uma pergunta para fortalecer a tua caminhada com Deus.', answer: 'Responder', done: 'Já participaste no desafio de hoje. Volta amanhã!', correct: 'Muito bem! Resposta certa.', wrong: 'Boa tentativa. Amanhã há um novo desafio.', streak: 'dias seguidos', loading: 'A preparar o desafio de hoje…', login: 'Entra na tua conta para participar.' },
  es: { title: 'Desafío Diario de Fe', subtitle: 'Una pregunta para fortalecer tu camino con Dios.', answer: 'Responder', done: 'Ya participaste en el desafío de hoy. ¡Vuelve mañana!', correct: '¡Muy bien! Respuesta correcta.', wrong: 'Buen intento. Mañana habrá un nuevo desafío.', streak: 'días seguidos', loading: 'Preparando el desafío de hoy…', login: 'Entra en tu cuenta para participar.' },
  en: { title: 'Daily Faith Challenge', subtitle: 'One question to strengthen your walk with God.', answer: 'Answer', done: 'You already joined today’s challenge. Come back tomorrow!', correct: 'Well done! Correct answer.', wrong: 'Good try. A new challenge arrives tomorrow.', streak: 'days in a row', loading: 'Preparing today’s challenge…', login: 'Sign in to join.' }
};

export default function DailyFaithChallenge() {
  const { i18n } = useTranslation();
  const language = i18n.language?.slice(0, 2) || 'pt';
  const text = copy[language] || copy.pt;
  const [data, setData] = useState(null);
  const [selected, setSelected] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const token = localStorage.getItem('token');
    if (!token) { setError(text.login); setLoading(false); return; }
    setLoading(true); setError('');
    try {
      const response = await fetch(`${API_BASE}/api/quiz/daily?lang=${language}`, { headers: { Authorization: `Bearer ${token}` } });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error);
      setData(payload);
    } catch (err) { setError(err.message || 'Não foi possível carregar o desafio.'); }
    finally { setLoading(false); }
  };
  useEffect(() => { setSelected(null); setResult(null); load(); }, [language]);

  const answer = async () => {
    if (selected === null || !data || result) return;
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${API_BASE}/api/quiz/daily/answer`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ selectedOption: selected }) });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error);
      setResult(payload);
      setData(current => ({ ...current, completed: true, correct: payload.correct === null ? current.correct : payload.correct, streak: payload.streak }));
    } catch (err) { setError(err.message || 'Não foi possível guardar a resposta.'); }
  };

  const medal = (data?.streak || 0) >= 7 ? 'Ouro' : (data?.streak || 0) >= 3 ? 'Prata' : 'Bronze';
  return <div style={{ maxWidth: 760, margin: '0 auto', padding: '28px 16px 48px' }}>
    <section style={{ borderRadius: 24, padding: '30px 26px', color: '#fff', background: 'linear-gradient(135deg,#2b6cb0,#7051b6)', boxShadow: '0 16px 38px rgba(57,74,148,.22)' }}>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', fontWeight: 800, opacity: .92 }}><Sparkles size={22}/> Sigo com Fé</div>
      <h1 style={{ margin: '12px 0 8px', fontSize: 'clamp(1.65rem,5vw,2.35rem)' }}>{text.title}</h1>
      <p style={{ margin: 0, opacity: .9, fontSize: '1.05rem' }}>{text.subtitle}</p>
    </section>

    <section style={{ marginTop: 18, background: '#fff', border: '1px solid #e3e8f2', borderRadius: 22, padding: 24, boxShadow: '0 8px 30px rgba(35,50,90,.07)' }}>
      {loading && <p style={{ textAlign: 'center', color: '#64748b', padding: 32 }}>{text.loading}</p>}
      {error && <div style={{ color: '#b42318', background: '#fff1f0', borderRadius: 14, padding: 16 }}>{error}</div>}
      {!loading && data && <>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', color: '#64748b', fontWeight: 700, fontSize: '.9rem' }}><span><CalendarDays size={16} style={{ verticalAlign: 'text-bottom' }}/> {data.question.livro}</span><span><Flame size={16} color="#f59e0b" style={{ verticalAlign: 'text-bottom' }}/> {data.streak} {text.streak}</span></div>
        <h2 style={{ color: '#172554', lineHeight: 1.3, margin: '22px 0' }}>{data.question.question}</h2>
        <div style={{ display: 'grid', gap: 11 }}>{data.question.options.map((option, index) => <button key={option} disabled={data.completed || Boolean(result)} onClick={() => setSelected(index)} style={{ textAlign: 'left', padding: '15px 16px', borderRadius: 14, border: selected === index ? '2px solid #5b6ee1' : '1px solid #d9e1ee', background: selected === index ? '#eef2ff' : '#fff', color: '#24324a', cursor: data.completed ? 'default' : 'pointer', fontSize: '1rem', fontWeight: selected === index ? 700 : 500 }}>{String.fromCharCode(65 + index)}. {option}</button>)}</div>
        {!data.completed && <button onClick={answer} disabled={selected === null || Boolean(result)} style={{ marginTop: 20, width: '100%', border: 0, borderRadius: 14, padding: '15px 20px', color: '#fff', background: selected === null ? '#aeb8d2' : '#5b44b3', fontSize: '1rem', fontWeight: 800, cursor: selected === null ? 'not-allowed' : 'pointer' }}>{text.answer}</button>}
        {data.completed && <div style={{ marginTop: 22, padding: 17, borderRadius: 15, background: data.correct ? '#ecfdf3' : '#fff7ed', color: data.correct ? '#177245' : '#a85309', fontWeight: 700 }}>{data.correct ? <CheckCircle2 size={20} style={{ verticalAlign: 'text-bottom' }}/> : <XCircle size={20} style={{ verticalAlign: 'text-bottom' }/>} {result ? (result.correct ? text.correct : text.wrong) : text.done}</div>}
      </>}
    </section>
    {data && <div style={{ marginTop: 18, display: 'flex', alignItems: 'center', gap: 14, background: '#fff8e7', border: '1px solid #f4d58d', borderRadius: 18, padding: 18 }}><Medal size={34} color="#d28b00"/><div><strong>Medalha {medal}</strong><div style={{ color: '#6b7280', fontSize: '.9rem', marginTop: 3 }}>3 dias: Prata · 7 dias: Ouro</div></div></div>}
  </div>;
}
