const { Resend } = require('resend');
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

const T = {pt:{s:'🙏 Bem-vindo ao Sigo com Fe!',g:'Bem-vindo',m:'Estamos felizes por teres entrado na maior rede social crista!'},en:{s:'🙏 Welcome to Sigo com Fe!',g:'Welcome',m:'We are happy to have you in the largest Christian social network!'},de:{s:'🙏 Willkommen bei Sigo com Fe!',g:'Willkommen',m:'Wir freuen uns dass du dabei bist!'},fr:{s:'🙏 Bienvenue sur Sigo com Fe!',g:'Bienvenue',m:'Nous sommes heureux que vous ayez rejoint!'},es:{s:'🙏 Bienvenido a Sigo com Fe!',g:'Bienvenido',m:'Estamos felices de que te hayas unido!'},ro:{s:'🙏 Bun venit la Sigo com Fe!',g:'Bun venit',m:'Suntem bucurosi ca ai intrat!'},ru:{s:'🙏 Dobro pozhalovat!',g:'Dobro pozhalovat',m:'My rady chto vy prisoedinilis!'}};

async function sendWelcomeEmail(email, nome, lang='pt') {
  const txt = T[lang] || T['pt'];
  try {
    if(!resend) return;
    await resend.emails.send({
      from: 'Sigo com Fe <onboarding@resend.dev>',
      to: email,
      subject: txt.s,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#1a0a3e;color:white;padding:32px;border-radius:16px">
          <h1 style="color:#f0c040;text-align:center">🙏 Sigo com Fé</h1>
          <h2 style="color:white">Olá ${nome}! Bem-vindo!</h2>
          <p style="color:rgba(255,255,255,0.8)">Estamos felizes por teres entrado na maior rede social cristã!</p>
          <p style="color:rgba(255,255,255,0.8)">O que podes fazer:</p>
          <ul style="color:rgba(255,255,255,0.8)">
            <li>🏆 Jogar o Desafio Bíblico</li>
            <li>🙏 Partilhar pedidos de oração</li>
            <li>📖 Estudar a Bíblia com IA</li>
            <li>⛪ Encontrar a tua igreja</li>
            <li>🎵 Ouvir música cristã</li>
          </ul>
          <div style="text-align:center;margin-top:24px">
            <a href="https://sigo-com-fe.vercel.app" style="background:#6c47d4;color:white;padding:14px 28px;border-radius:12px;text-decoration:none;font-weight:700">Entrar agora →</a>
          </div>
          <p style="color:rgba(255,255,255,0.4);font-size:12px;text-align:center;margin-top:24px">Sigo com Fé — Rede Social Cristã</p>
        </div>
      `
    });
    console.log('Email de boas-vindas enviado para:', email);
  } catch(e) { console.error('Erro email:', e); }
}

async function sendChallengeEmail(email, nome, desafiante) {
  try {
    if(!resend) return;
    await resend.emails.send({
      from: 'Sigo com Fe <onboarding@resend.dev>',
      to: email,
      subject: '⚔️ Foste desafiado no Desafio Bíblico!',
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#1a0a3e;color:white;padding:32px;border-radius:16px">
          <h1 style="color:#f0c040;text-align:center">⚔️ Desafio Bíblico</h1>
          <h2 style="color:white">Olá ${nome}!</h2>
          <p style="color:rgba(255,255,255,0.8)"><strong style="color:#f0c040">${desafiante}</strong> desafia-te para um Desafio Bíblico!</p>
          <p style="color:rgba(255,255,255,0.8)">Aceitas o desafio? 🏆</p>
          <div style="text-align:center;margin-top:24px">
            <a href="https://sigo-com-fe.vercel.app/desafio-biblico" style="background:#e74c3c;color:white;padding:14px 28px;border-radius:12px;text-decoration:none;font-weight:700">Aceitar Desafio →</a>
          </div>
        </div>
      `
    });
  } catch(e) { console.error('Erro email:', e); }
}

async function sendEventoEmail(email, nome, premio, dataFim) {
  try {
    if(!resend) return;
    await resend.emails.send({
      from: 'Sigo com Fe <onboarding@resend.dev>',
      to: email,
      subject: '🏆 Novo Evento — ' + premio + ' em jogo!',
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#1a0a3e;color:white;padding:32px;border-radius:16px">
          <h1 style="color:#f0c040;text-align:center">🏆 Novo Evento!</h1>
          <h2 style="color:white">Olá ${nome}!</h2>
          <p style="color:rgba(255,255,255,0.8)">Há um novo evento no Desafio Bíblico com <strong style="color:#f0c040">${premio}</strong> em jogo!</p>
          <p style="color:rgba(255,255,255,0.8)">Termina em: <strong>${dataFim}</strong></p>
          <div style="text-align:center;margin-top:24px">
            <a href="https://sigo-com-fe.vercel.app/desafio-biblico" style="background:#f0c040;color:#1a0a3e;padding:14px 28px;border-radius:12px;text-decoration:none;font-weight:700">Jogar agora →</a>
          </div>
        </div>
      `
    });
  } catch(e) { console.error('Erro email:', e); }
}

module.exports = { sendWelcomeEmail, sendChallengeEmail, sendEventoEmail };
