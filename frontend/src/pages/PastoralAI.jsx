import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Send, Bot, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const API = import.meta.env.VITE_API_URL || '';

const i18n = {
  pt: {
    title: 'IA Pastoral 🤖',
    subtitle: 'Seu assistente pastoral com inteligência artificial',
    placeholder: 'Digite sua pergunta...',
    contexts: { sermon: '📖 Sermão', verse: '📕 Versículos', counseling: '💬 Aconselhamento', prayer: '🙏 Oração', tasks: '📋 Tarefas' },
    welcome: 'Olá! Sou sua IA Pastoral. Posso ajudar com sermões, versículos, aconselhamento, orações e tarefas da igreja. Como posso ajudar? 🙏',
    error: 'Desculpe, ocorreu um erro. Tente novamente.',
    thinking: 'Pensando...',
  },
  en: {
    title: 'Pastoral AI 🤖',
    subtitle: 'Your AI-powered pastoral assistant',
    placeholder: 'Type your question...',
    contexts: { sermon: '📖 Sermon', verse: '📕 Verses', counseling: '💬 Counseling', prayer: '🙏 Prayer', tasks: '📋 Tasks' },
    welcome: 'Hello! I\'m your Pastoral AI. I can help with sermons, Bible verses, counseling, prayers, and church tasks. How can I help? 🙏',
    error: 'Sorry, an error occurred. Please try again.',
    thinking: 'Thinking...',
  },
  es: {
    title: 'IA Pastoral 🤖',
    subtitle: 'Tu asistente pastoral con inteligencia artificial',
    placeholder: 'Escribe tu pregunta...',
    contexts: { sermon: '📖 Sermón', verse: '📕 Versículos', counseling: '💬 Consejería', prayer: '🙏 Oración', tasks: '📋 Tareas' },
    welcome: '¡Hola! Soy tu IA Pastoral. Puedo ayudarte con sermones, versículos, consejería, oraciones y tareas de la iglesia. ¿Cómo puedo ayudar? 🙏',
    error: 'Lo siento, ocurrió un error. Inténtalo de nuevo.',
    thinking: 'Pensando...',
  },
  de: {
    title: 'Pastorale KI 🤖',
    subtitle: 'Ihr KI-gestützter pastoraler Assistent',
    placeholder: 'Geben Sie Ihre Frage ein...',
    contexts: { sermon: '📖 Predigt', verse: '📕 Bibelverse', counseling: '💬 Seelsorge', prayer: '🙏 Gebet', tasks: '📋 Aufgaben' },
    welcome: 'Hallo! Ich bin Ihre Pastorale KI. Ich kann bei Predigten, Bibelversen, Seelsorge, Gebeten und Gemeindeaufgaben helfen. Wie kann ich helfen? 🙏',
    error: 'Entschuldigung, ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.',
    thinking: 'Denke nach...',
  },
};

const CONTEXT_KEYS = ['sermon', 'verse', 'counseling', 'prayer', 'tasks'];

export default function PastoralAI() {
  const { i18n: i18nInstance } = useTranslation();
  const lang = (i18nInstance.language || 'pt').substring(0, 2);
  const t = i18n[lang] || i18n.pt;
  const navigate = useNavigate();

  const [messages, setMessages] = useState([
    { role: 'ai', text: t.welcome },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [context, setContext] = useState('sermon');
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
      const res = await fetch(`${API}/api/pastoral-ai/chat`, {
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
    page: { minHeight: '100vh', background: 'linear-gradient(135deg, #f3e7f9 0%, #e8d5f5 100%)', display: 'flex', flexDirection: 'column' },
    header: { background: 'linear-gradient(135deg, #8e44ad, #9b59b6)', color: '#fff', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '12px' },
    headerText: { flex: 1 },
    title: { margin: 0, fontSize: '1.3rem', fontWeight: 700 },
    subtitle: { margin: 0, fontSize: '0.8rem', opacity: 0.85 },
    backBtn: { background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: '4px' },
    contextBar: { display: 'flex', gap: '6px', padding: '10px 16px', overflowX: 'auto', background: '#fff', borderBottom: '1px solid #e0d0e8' },
    contextBtn: (active) => ({
      padding: '6px 12px', borderRadius: '20px', border: active ? '2px solid #8e44ad' : '1px solid #ccc',
      background: active ? '#8e44ad' : '#fff', color: active ? '#fff' : '#555',
      fontSize: '0.8rem', cursor: 'pointer', whiteSpace: 'nowrap', fontWeight: active ? 600 : 400,
    }),
    chatArea: { flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' },
    bubble: (isUser) => ({
      maxWidth: '80%', padding: '10px 14px', borderRadius: '16px', fontSize: '0.95rem', lineHeight: 1.5, whiteSpace: 'pre-wrap',
      alignSelf: isUser ? 'flex-end' : 'flex-start',
      background: isUser ? '#8e44ad' : '#fff',
      color: isUser ? '#fff' : '#333',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    }),
    loadingBubble: { alignSelf: 'flex-start', background: '#fff', padding: '10px 14px', borderRadius: '16px', color: '#8e44ad', fontStyle: 'italic', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' },
    inputBar: { display: 'flex', gap: '8px', padding: '12px 16px', background: '#fff', borderTop: '1px solid #e0d0e8' },
    input: { flex: 1, padding: '10px 14px', borderRadius: '24px', border: '1px solid #ccc', fontSize: '0.95rem', outline: 'none' },
    sendBtn: { background: '#8e44ad', color: '#fff', border: 'none', borderRadius: '50%', width: '44px', height: '44px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  };

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <button style={styles.backBtn} onClick={() => navigate('/')}><ArrowLeft size={22} /></button>
        <Bot size={28} />
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
