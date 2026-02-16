import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Send, BookOpen, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const API = import.meta.env.VITE_API_URL || '';

const i18n = {
  pt: {
    title: 'IA Bíblica 📖',
    subtitle: 'Tire suas dúvidas sobre a Bíblia',
    placeholder: 'Digite sua pergunta...',
    contexts: { bible: '📖 Bíblia', questions: '❓ Dúvidas', prayer: '🙏 Oração', guidance: '💬 Orientação' },
    welcome: 'Olá! Sou a IA Bíblica do Sigo com Fé. Posso te ajudar a entender a Bíblia, responder dúvidas sobre a fé cristã e te orientar espiritualmente. Pergunte qualquer coisa! 📖✨',
    error: 'Desculpe, ocorreu um erro. Tente novamente.',
    thinking: 'Pensando...',
  },
  en: {
    title: 'Bible AI 📖',
    subtitle: 'Ask your Bible questions',
    placeholder: 'Type your question...',
    contexts: { bible: '📖 Bible', questions: '❓ Questions', prayer: '🙏 Prayer', guidance: '💬 Guidance' },
    welcome: 'Hello! I\'m the Bible AI from Sigo com Fé. I can help you understand the Bible, answer questions about the Christian faith, and offer spiritual guidance. Ask me anything! 📖✨',
    error: 'Sorry, an error occurred. Please try again.',
    thinking: 'Thinking...',
  },
  es: {
    title: 'IA Bíblica 📖',
    subtitle: 'Resuelve tus dudas sobre la Biblia',
    placeholder: 'Escribe tu pregunta...',
    contexts: { bible: '📖 Biblia', questions: '❓ Dudas', prayer: '🙏 Oración', guidance: '💬 Orientación' },
    welcome: '¡Hola! Soy la IA Bíblica de Sigo com Fé. Puedo ayudarte a entender la Biblia, responder dudas sobre la fe cristiana y orientarte espiritualmente. ¡Pregunta lo que quieras! 📖✨',
    error: 'Lo siento, ocurrió un error. Inténtalo de nuevo.',
    thinking: 'Pensando...',
  },
  de: {
    title: 'Bibel-KI 📖',
    subtitle: 'Stellen Sie Ihre Bibelfragen',
    placeholder: 'Geben Sie Ihre Frage ein...',
    contexts: { bible: '📖 Bibel', questions: '❓ Fragen', prayer: '🙏 Gebet', guidance: '💬 Beratung' },
    welcome: 'Hallo! Ich bin die Bibel-KI von Sigo com Fé. Ich kann Ihnen helfen, die Bibel zu verstehen, Fragen zum christlichen Glauben beantworten und geistliche Orientierung bieten. Fragen Sie mich alles! 📖✨',
    error: 'Entschuldigung, ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.',
    thinking: 'Denke nach...',
  },
};

const CONTEXT_KEYS = ['bible', 'questions', 'prayer', 'guidance'];

export default function BibleAI() {
  const { i18n: i18nInstance } = useTranslation();
  const lang = (i18nInstance.language || 'pt').substring(0, 2);
  const t = i18n[lang] || i18n.pt;
  const navigate = useNavigate();

  const [messages, setMessages] = useState([
    { role: 'ai', text: t.welcome },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [context, setContext] = useState('bible');
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    setMessages((prev) => [...prev, { role: 'user', text }]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch(`${API}/api/bible-ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, language: lang, context }),
      });
      const data = await res.json();
      setMessages((prev) => [...prev, { role: 'ai', text: data.reply || t.error }]);
    } catch {
      setMessages((prev) => [...prev, { role: 'ai', text: t.error }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const styles = {
    page: { minHeight: '100vh', background: 'linear-gradient(135deg, #e8edf7 0%, #f0e6d0 100%)', display: 'flex', flexDirection: 'column' },
    header: { background: 'linear-gradient(135deg, #2c3e80, #3a5ba0)', color: '#fff', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '12px' },
    headerText: { flex: 1 },
    title: { margin: 0, fontSize: '1.3rem', fontWeight: 700 },
    subtitle: { margin: 0, fontSize: '0.8rem', opacity: 0.85 },
    backBtn: { background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: '4px' },
    contextBar: { display: 'flex', gap: '6px', padding: '10px 16px', overflowX: 'auto', background: '#fff', borderBottom: '1px solid #d0d5e0' },
    contextBtn: (active) => ({
      padding: '6px 12px', borderRadius: '20px', border: active ? '2px solid #2c3e80' : '1px solid #ccc',
      background: active ? '#2c3e80' : '#fff', color: active ? '#fff' : '#555',
      fontSize: '0.8rem', cursor: 'pointer', whiteSpace: 'nowrap', fontWeight: active ? 600 : 400,
    }),
    chatArea: { flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' },
    bubble: (isUser) => ({
      maxWidth: '80%', padding: '10px 14px', borderRadius: '16px', fontSize: '0.95rem', lineHeight: 1.5, whiteSpace: 'pre-wrap',
      alignSelf: isUser ? 'flex-end' : 'flex-start',
      background: isUser ? '#2c3e80' : '#fff',
      color: isUser ? '#fff' : '#333',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    }),
    loadingBubble: { alignSelf: 'flex-start', background: '#fff', padding: '10px 14px', borderRadius: '16px', color: '#d4a017', fontStyle: 'italic', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' },
    inputBar: { display: 'flex', gap: '8px', padding: '12px 16px', background: '#fff', borderTop: '1px solid #d0d5e0' },
    input: { flex: 1, padding: '10px 14px', borderRadius: '24px', border: '1px solid #ccc', fontSize: '0.95rem', outline: 'none' },
    sendBtn: { background: '#d4a017', color: '#fff', border: 'none', borderRadius: '50%', width: '44px', height: '44px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  };

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <button style={styles.backBtn} onClick={() => navigate('/')}><ArrowLeft size={22} /></button>
        <BookOpen size={28} />
        <div style={styles.headerText}>
          <h2 style={styles.title}>{t.title}</h2>
          <p style={styles.subtitle}>{t.subtitle}</p>
        </div>
        <Sparkles size={20} style={{ opacity: 0.7 }} />
      </div>

      <div style={styles.contextBar}>
        {CONTEXT_KEYS.map((key) => (
          <button key={key} style={styles.contextBtn(context === key)} onClick={() => setContext(key)}>
            {t.contexts[key]}
          </button>
        ))}
      </div>

      <div style={styles.chatArea}>
        {messages.map((msg, i) => (
          <div key={i} style={styles.bubble(msg.role === 'user')}>{msg.text}</div>
        ))}
        {loading && <div style={styles.loadingBubble}>💭 {t.thinking}</div>}
        <div ref={bottomRef} />
      </div>

      <div style={styles.inputBar}>
        <input
          style={styles.input}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder={t.placeholder}
        />
        <button style={styles.sendBtn} onClick={sendMessage} disabled={loading}>
          <Send size={20} />
        </button>
      </div>
    </div>
  );
}
