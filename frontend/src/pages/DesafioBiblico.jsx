import React, { useState, useEffect, useRef } from ' + chr(39) + 'react' + chr(39) + ';
import { useNavigate } from ' + chr(39) + 'react-router-dom' + chr(39) + ';
import { useAuth } from ' + chr(39) + '../context/AuthContext' + chr(39) + ';

const LIVROS = {
  ' + chr(39) + 'Todos' + chr(39) + ': null,
  ' + chr(39) + 'Genesis' + chr(39) + ': [0,1,2,3],
  ' + chr(39) + 'Exodo' + chr(39) + ': [4,5,6],
  ' + chr(39) + 'Salmos' + chr(39) + ': [7,8,9,10],
  ' + chr(39) + 'Evangelhos' + chr(39) + ': [11,12,13,14],
  ' + chr(39) + 'Apocalipse' + chr(39) + ': [5,6,10,14],
};

const TODAS_PERGUNTAS = [
  { q: ' + chr(39) + 'Quem foi o pai de Matusalem?' + chr(39) + ', opts: [' + chr(39) + 'Noe' + chr(39) + ',' + chr(39) + 'Enoque' + chr(39) + ',' + chr(39) + 'Lameque' + chr(39) + ',' + chr(39) + 'Sete' + chr(39) + '], r: 1, livro: ' + chr(39) + 'Genesis' + chr(39) + ' },
  { q: ' + chr(39) + 'Quantos livros tem o Novo Testamento?' + chr(39) + ', opts: [' + chr(39) + '25' + chr(39) + ',' + chr(39) + '26' + chr(39) + ',' + chr(39) + '27' + chr(39) + ',' + chr(39) + '28' + chr(39) + '], r: 2, livro: ' + chr(39) + 'Todos' + chr(39) + ' },
  { q: ' + chr(39) + 'Quem substituiu Judas Iscariotes?' + chr(39) + ', opts: [' + chr(39) + 'Paulo' + chr(39) + ',' + chr(39) + 'Barnabe' + chr(39) + ',' + chr(39) + 'Matias' + chr(39) + ',' + chr(39) + 'Silas' + chr(39) + '], r: 2, livro: ' + chr(39) + 'Evangelhos' + chr(39) + ' },
  { q: ' + chr(39) + 'Em que monte Moises recebeu a Lei?' + chr(39) + ', opts: [' + chr(39) + 'Carmelo' + chr(39) + ',' + chr(39) + 'Sinai' + chr(39) + ',' + chr(39) + 'Hermon' + chr(39) + ',' + chr(39) + 'Oliveiras' + chr(39) + '], r: 1, livro: ' + chr(39) + 'Exodo' + chr(39) + ' },
  { q: ' + chr(39) + 'Quem foi lancado na cova dos leoes?' + chr(39) + ', opts: [' + chr(39) + 'Elias' + chr(39) + ',' + chr(39) + 'Eliseu' + chr(39) + ',' + chr(39) + 'Daniel' + chr(39) + ',' + chr(39) + 'Jeremias' + chr(39) + '], r: 2, livro: ' + chr(39) + 'Todos' + chr(39) + ' },
  { q: ' + chr(39) + 'Quantas igrejas sao mencionadas no Apocalipse?' + chr(39) + ', opts: [' + chr(39) + '5' + chr(39) + ',' + chr(39) + '6' + chr(39) + ',' + chr(39) + '7' + chr(39) + ',' + chr(39) + '8' + chr(39) + '], r: 2, livro: ' + chr(39) + 'Apocalipse' + chr(39) + ' },
  { q: ' + chr(39) + 'Quem escreveu o Apocalipse?' + chr(39) + ', opts: [' + chr(39) + 'Paulo' + chr(39) + ',' + chr(39) + 'Pedro' + chr(39) + ',' + chr(39) + 'Tiago' + chr(39) + ',' + chr(39) + 'Joao' + chr(39) + '], r: 3, livro: ' + chr(39) + 'Apocalipse' + chr(39) + ' },
  { q: ' + chr(39) + 'Qual o primeiro milagre de Jesus?' + chr(39) + ', opts: [' + chr(39) + 'Cura de cego' + chr(39) + ',' + chr(39) + 'Agua em vinho' + chr(39) + ',' + chr(39) + 'Paes' + chr(39) + ',' + chr(39) + 'Lazaro' + chr(39) + '], r: 1, livro: ' + chr(39) + 'Evangelhos' + chr(39) + ' },
  { q: ' + chr(39) + 'Quantos discipulos Jesus escolheu?' + chr(39) + ', opts: [' + chr(39) + '10' + chr(39) + ',' + chr(39) + '11' + chr(39) + ',' + chr(39) + '12' + chr(39) + ',' + chr(39) + '13' + chr(39) + '], r: 2, livro: ' + chr(39) + 'Evangelhos' + chr(39) + ' },
  { q: ' + chr(39) + 'Deus criou o mundo em quantos dias?' + chr(39) + ', opts: [' + chr(39) + '5' + chr(39) + ',' + chr(39) + '6' + chr(39) + ',' + chr(39) + '7' + chr(39) + ',' + chr(39) + '8' + chr(39) + '], r: 1, livro: ' + chr(39) + 'Genesis' + chr(39) + ' },
  { q: ' + chr(39) + 'Qual o numero da Besta no Apocalipse?' + chr(39) + ', opts: [' + chr(39) + '616' + chr(39) + ',' + chr(39) + '999' + chr(39) + ',' + chr(39) + '666' + chr(39) + ',' + chr(39) + '777' + chr(39) + '], r: 2, livro: ' + chr(39) + 'Apocalipse' + chr(39) + ' },
  { q: ' + chr(39) + 'Quantos anos tinha Noe quando o diluvio comecou?' + chr(39) + ', opts: [' + chr(39) + '500' + chr(39) + ',' + chr(39) + '600' + chr(39) + ',' + chr(39) + '700' + chr(39) + ',' + chr(39) + '800' + chr(39) + '], r: 1, livro: ' + chr(39) + 'Genesis' + chr(39) + ' },
  { q: ' + chr(39) + 'Qual o rio onde Jesus foi batizado?' + chr(39) + ', opts: [' + chr(39) + 'Eufrates' + chr(39) + ',' + chr(39) + 'Nilo' + chr(39) + ',' + chr(39) + 'Jordao' + chr(39) + ',' + chr(39) + 'Tigre' + chr(39) + '], r: 2, livro: ' + chr(39) + 'Evangelhos' + chr(39) + ' },
  { q: ' + chr(39) + 'Quantos Salmos existem na Biblia?' + chr(39) + ', opts: [' + chr(39) + '100' + chr(39) + ',' + chr(39) + '120' + chr(39) + ',' + chr(39) + '150' + chr(39) + ',' + chr(39) + '180' + chr(39) + '], r: 2, livro: ' + chr(39) + 'Salmos' + chr(39) + ' },
  { q: ' + chr(39) + 'O Senhor e o meu pastor e referencia a qual Salmo?' + chr(39) + ', opts: [' + chr(39) + 'Salmo 1' + chr(39) + ',' + chr(39) + 'Salmo 23' + chr(39) + ',' + chr(39) + 'Salmo 91' + chr(39) + ',' + chr(39) + 'Salmo 100' + chr(39) + '], r: 1, livro: ' + chr(39) + 'Salmos' + chr(39) + ' },
];

const TEMPO = 15;
const bg = { minHeight: ' + chr(39) + '100vh' + chr(39) + ', background: ' + chr(39) + 'linear-gradient(135deg,#1a0a3e,#2d1054)' + chr(39) + ', display: ' + chr(39) + 'flex' + chr(39) + ', flexDirection: ' + chr(39) + 'column' + chr(39) + ', alignItems: ' + chr(39) + 'center' + chr(39) + ', justifyContent: ' + chr(39) + 'center' + chr(39) + ', padding: 24, color: ' + chr(39) + 'white' + chr(39) + ' };

export default function DesafioBiblico() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tela, setTela] = useState(' + chr(39) + 'lobby' + chr(39) + ');
  const [livroSelecionado, setLivroSelecionado] = useState(' + chr(39) + 'Todos' + chr(39) + ');
  const [codigoSala, setCodigoSala] = useState(' + chr(39) + '' + chr(39) + ');
  const [codigoInput, setCodigoInput] = useState(' + chr(39) + '' + chr(39) + ');
  const [jogadores, setJogadores] = useState([]);
  const [prontoEu, setProntoEu] = useState(false);
  const [perguntas, setPerguntas] = useState([]);
  const [perguntaIdx, setPerguntaIdx] = useState(0);
  const [tempo, setTempo] = useState(TEMPO);
  const [pausado, setPausado] = useState(false);
  const [respostaSelecionada, setRespostaSelecionada] = useState(null);
  const [pontos, setPontos] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [resultado, setResultado] = useState(null);
  const [chatMsgs, setChatMsgs] = useState([]);
  const [chatInput, setChatInput] = useState(' + chr(39) + '' + chr(39) + ');
  const timerRef = useRef(null);
  const tempoRef = useRef(TEMPO);
  const chatEndRef = useRef(null);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: ' + chr(39) + 'smooth' + chr(39) + ' }); }, [chatMsgs]);

  function gerarCodigo() { return Math.random().toString(36).substring(2,8).toUpperCase(); }

  function getPerguntasFiltradas() {
    const todas = TODAS_PERGUNTAS.filter(p => livroSelecionado === ' + chr(39) + 'Todos' + chr(39) + ' || p.livro === livroSelecionado || p.livro === ' + chr(39) + 'Todos' + chr(39) + ');
    const shuffled = [...todas].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 5);
  }

  function criarSala() {
    const codigo = gerarCodigo();
    setCodigoSala(codigo);
    setJogadores([{ nome: user?.full_name || ' + chr(39) + 'Eu' + chr(39) + ', avatar: user?.photo_url, pronto: false }]);
    setTela(' + chr(39) + 'sala' + chr(39) + ');
  }

  function entrarSala() {
    if (!codigoInput.trim()) return;
    setCodigoSala(codigoInput.toUpperCase());
    setJogadores([{ nome: user?.full_name || ' + chr(39) + 'Eu' + chr(39) + ', avatar: user?.photo_url, pronto: false }]);
    setTela(' + chr(39) + 'sala' + chr(39) + ');
  }

  function marcarPronto() {
    setProntoEu(true);
    setJogadores(prev => prev.map((j,i) => i===0 ? {...j, pronto:true} : j));
  }

  function iniciarJogo() {
    const ps = getPerguntasFiltradas();
    setPerguntas(ps);
    setPerguntaIdx(0);
    setPontos(0);
    setRespostaSelecionada(null);
    setFeedback(null);
    setPausado(false);
    setTela(' + chr(39) + 'jogo' + chr(39) + ');
  }

  useEffect(() => {
    if (tela !== ' + chr(39) + 'jogo' + chr(39) + ' || pausado || perguntas.length === 0) return;
    setTempo(TEMPO);
    tempoRef.current = TEMPO;
    timerRef.current = setInterval(() => {
      if (!pausado) {
        setTempo(prev => {
          tempoRef.current = prev - 1;
          if (prev <= 1) { clearInterval(timerRef.current); proximaPergunta(null); return 0; }
          return prev - 1;
        });
      }
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [perguntaIdx, tela, pausado]);

  function responder(idx) {
    if (respostaSelecionada !== null || pausado) return;
    clearInterval(timerRef.current);
    setRespostaSelecionada(idx);
    const correto = idx === perguntas[perguntaIdx]?.r;
    const pts = correto ? (tempoRef.current >= 4 ? 10 : 5) : 0;
    setFeedback({ correto, pts });
    setPontos(prev => prev + pts);
    setTimeout(() => proximaPergunta(idx), 1500);
  }

  function proximaPergunta(resposta) {
    setFeedback(null);
    setRespostaSelecionada(null);
    if (perguntaIdx + 1 >= perguntas.length) {
      setResultado({ pontos });
      setTela(' + chr(39) + 'resultado' + chr(39) + ');
    } else {
      setPerguntaIdx(prev => prev + 1);
    }
  }

  function enviarChat() {
    if (!chatInput.trim()) return;
    setChatMsgs(prev => [...prev, { nome: user?.full_name?.split(' + chr(39) + ' ' + chr(39) + ')[0] || ' + chr(39) + 'Eu' + chr(39) + ', texto: chatInput, cor: ' + chr(39) + '#6c47d4' + chr(39) + ' }]);
    setChatInput(' + chr(39) + '' + chr(39) + ');
  }

  function compartilhar() {
    const msg = ' + chr(39) + 'Joguei o Desafio Biblico no Sigo com Fe e fiz ' + chr(39) + ' + pontos + ' + chr(39) + ' pontos! Te atreves? https://sigo-com-fe.vercel.app/desafio-biblico' + chr(39) + ';
    if (navigator.share) navigator.share({ title: ' + chr(39) + 'Desafio Biblico' + chr(39) + ', text: msg });
    else { navigator.clipboard.writeText(msg); alert(' + chr(39) + 'Copiado!' + chr(39) + '); }
  }

  const pergunta = perguntas[perguntaIdx];

  if (tela === ' + chr(39) + 'lobby' + chr(39) + ') return (
    <div style={bg}>
      <div style={{ fontSize:60, marginBottom:16 }}>🏆</div>
      <h1 style={{ fontSize:28, fontWeight:900, marginBottom:8, textAlign:' + chr(39) + 'center' + chr(39) + ' }}>Desafio Biblico</h1>
      <p style={{ opacity:0.7, marginBottom:20, textAlign:' + chr(39) + 'center' + chr(39) + ' }}>Testa o teu conhecimento da Palavra!</p>

      <p style={{ fontSize:13, opacity:0.8, marginBottom:8 }}>📖 Escolhe o livro:</p>
      <div style={{ display:' + chr(39) + 'flex' + chr(39) + ', flexWrap:' + chr(39) + 'wrap' + chr(39) + ', gap:8, justifyContent:' + chr(39) + 'center' + chr(39) + ', marginBottom:24, maxWidth:360 }}>
        {Object.keys(LIVROS).map(l => (
          <button key={l} onClick={() => setLivroSelecionado(l)} style={{ padding:' + chr(39) + '6px 14px' + chr(39) + ', borderRadius:20, border:' + chr(39) + 'none' + chr(39) + ', background: livroSelecionado===l ? ' + chr(39) + '#f0c040' + chr(39) + ' : ' + chr(39) + 'rgba(255,255,255,0.15)' + chr(39) + ', color: livroSelecionado===l ? ' + chr(39) + '#1a0a3e' + chr(39) + ' : ' + chr(39) + 'white' + chr(39) + ', fontWeight:700, cursor:' + chr(39) + 'pointer' + chr(39) + ', fontSize:13 }}>{l}</button>
        ))}
      </div>

      <button onClick={criarSala} style={{ width:' + chr(39) + '100%' + chr(39) + ', maxWidth:320, padding:16, borderRadius:14, border:' + chr(39) + 'none' + chr(39) + ', background:' + chr(39) + 'linear-gradient(135deg,#6c47d4,#4A2270)' + chr(39) + ', color:' + chr(39) + 'white' + chr(39) + ', fontSize:18, fontWeight:700, cursor:' + chr(39) + 'pointer' + chr(39) + ', marginBottom:14 }}>➕ Criar Sala</button>
      <div style={{ width:' + chr(39) + '100%' + chr(39) + ', maxWidth:320, display:' + chr(39) + 'flex' + chr(39) + ', gap:10, marginBottom:14 }}>
        <input value={codigoInput} onChange={e => setCodigoInput(e.target.value.toUpperCase())} placeholder=' + chr(39) + 'Codigo da sala...' + chr(39) + ' style={{ flex:1, padding:14, borderRadius:12, border:' + chr(39) + 'none' + chr(39) + ', background:' + chr(39) + 'rgba(255,255,255,0.15)' + chr(39) + ', color:' + chr(39) + 'white' + chr(39) + ', fontSize:16, outline:' + chr(39) + 'none' + chr(39) + ' }} />
        <button onClick={entrarSala} style={{ padding:' + chr(39) + '14px 20px' + chr(39) + ', borderRadius:12, border:' + chr(39) + 'none' + chr(39) + ', background:' + chr(39) + '#27ae60' + chr(39) + ', color:' + chr(39) + 'white' + chr(39) + ', fontWeight:700, cursor:' + chr(39) + 'pointer' + chr(39) + ', fontSize:16 }}>Entrar</button>
      </div>
      <button onClick={() => navigate(-1)} style={{ background:' + chr(39) + 'none' + chr(39) + ', border:' + chr(39) + 'none' + chr(39) + ', color:' + chr(39) + 'rgba(255,255,255,0.5)' + chr(39) + ', cursor:' + chr(39) + 'pointer' + chr(39) + ', fontSize:14 }}>
      <button onClick={() => { const m = "Te desafio no Desafio Biblico do Sigo com Fe! Aceitas? https://sigo-com-fe.vercel.app/desafio-biblico"; if(navigator.share) navigator.share({title:"Desafio Biblico",text:m}); else{navigator.clipboard.writeText(m);alert("Copiado!");} }} style={{ width:"100%", maxWidth:320, padding:14, borderRadius:14, border:"none", background:"#25D366", color:"white", fontSize:15, fontWeight:700, cursor:"pointer", marginBottom:12 }}>Desafiar um amigo</button>
      Voltar</button>
    </div>
  );

  if (tela === ' + chr(39) + 'sala' + chr(39) + ') return (
    <div style={bg}>
      <h2 style={{ fontSize:22, marginBottom:8 }}>Sala de Espera</h2>
      <div style={{ background:' + chr(39) + 'rgba(255,255,255,0.1)' + chr(39) + ', borderRadius:12, padding:' + chr(39) + '10px 24px' + chr(39) + ', marginBottom:12, fontSize:28, fontWeight:900, letterSpacing:8 }}>{codigoSala}</div>
      <p style={{ opacity:0.6, fontSize:12, marginBottom:16 }}>Livro: {livroSelecionado}</p>
      <button onClick={() => { navigator.clipboard.writeText(' + chr(39) + 'Vem jogar o Desafio Biblico! Codigo: ' + chr(39) + ' + codigoSala + ' + chr(39) + ' https://sigo-com-fe.vercel.app/desafio-biblico' + chr(39) + '); alert(' + chr(39) + 'Copiado!' + chr(39) + '); }} style={{ padding:' + chr(39) + '8px 20px' + chr(39) + ', borderRadius:20, border:' + chr(39) + '1px solid rgba(255,255,255,0.4)' + chr(39) + ', background:' + chr(39) + 'transparent' + chr(39) + ', color:' + chr(39) + 'white' + chr(39) + ', cursor:' + chr(39) + 'pointer' + chr(39) + ', marginBottom:20, fontSize:13 }}>📋 Copiar convite</button>

      <div style={{ width:' + chr(39) + '100%' + chr(39) + ', maxWidth:320, marginBottom:16 }}>
        <p style={{ opacity:0.6, fontSize:12, marginBottom:8 }}>Jogadores na sala:</p>
        {jogadores.map((j,i) => (
          <div key={i} style={{ display:' + chr(39) + 'flex' + chr(39) + ', alignItems:' + chr(39) + 'center' + chr(39) + ', gap:12, padding:' + chr(39) + '10px 16px' + chr(39) + ', background:' + chr(39) + 'rgba(255,255,255,0.1)' + chr(39) + ', borderRadius:10, marginBottom:8 }}>
            <div style={{ width:36, height:36, borderRadius:' + chr(39) + '50%' + chr(39) + ', background: j.pronto ? ' + chr(39) + '#27ae60' + chr(39) + ' : ' + chr(39) + '#6c47d4' + chr(39) + ', display:' + chr(39) + 'flex' + chr(39) + ', alignItems:' + chr(39) + 'center' + chr(39) + ', justifyContent:' + chr(39) + 'center' + chr(39) + ', fontWeight:700, fontSize:16 }}>{j.nome.charAt(0)}</div>
            <span style={{ flex:1 }}>{j.nome}</span>
            <span>{j.pronto ? ' + chr(39) + '✅ Pronto' + chr(39) + ' : ' + chr(39) + '⏳ A aguardar' + chr(39) + '}</span>
          </div>
        ))}
        <div style={{ display:' + chr(39) + 'flex' + chr(39) + ', alignItems:' + chr(39) + 'center' + chr(39) + ', gap:12, padding:' + chr(39) + '10px 16px' + chr(39) + ', background:' + chr(39) + 'rgba(255,255,255,0.05)' + chr(39) + ', borderRadius:10, border:' + chr(39) + '1px dashed rgba(255,255,255,0.2)' + chr(39) + ' }}>
          <div style={{ width:36, height:36, borderRadius:' + chr(39) + '50%' + chr(39) + ', background:' + chr(39) + 'rgba(255,255,255,0.1)' + chr(39) + ', display:' + chr(39) + 'flex' + chr(39) + ', alignItems:' + chr(39) + 'center' + chr(39) + ', justifyContent:' + chr(39) + 'center' + chr(39) + ' }}>?</div>
          <span style={{ opacity:0.5 }}>A aguardar jogador...</span>
        </div>
      </div>

      {!prontoEu ? (
        <button onClick={marcarPronto} style={{ width:' + chr(39) + '100%' + chr(39) + ', maxWidth:320, padding:14, borderRadius:14, border:' + chr(39) + 'none' + chr(39) + ', background:' + chr(39) + '#27ae60' + chr(39) + ', color:' + chr(39) + 'white' + chr(39) + ', fontSize:16, fontWeight:700, cursor:' + chr(39) + 'pointer' + chr(39) + ', marginBottom:10 }}>✅ Estou Pronto!</button>
      ) : (
        <button onClick={iniciarJogo} style={{ width:' + chr(39) + '100%' + chr(39) + ', maxWidth:320, padding:14, borderRadius:14, border:' + chr(39) + 'none' + chr(39) + ', background:' + chr(39) + 'linear-gradient(135deg,#e74c3c,#c0392b)' + chr(39) + ', color:' + chr(39) + 'white' + chr(39) + ', fontSize:16, fontWeight:700, cursor:' + chr(39) + 'pointer' + chr(39) + ', marginBottom:10 }}>🚀 Iniciar Jogo!</button>
      )}
      <button onClick={() => setTela(' + chr(39) + 'lobby' + chr(39) + ')} style={{ background:' + chr(39) + 'none' + chr(39) + ', border:' + chr(39) + 'none' + chr(39) + ', color:' + chr(39) + 'rgba(255,255,255,0.5)' + chr(39) + ', cursor:' + chr(39) + 'pointer' + chr(39) + ', fontSize:13 }}>Voltar</button>
    </div>
  );

  if (tela === ' + chr(39) + 'jogo' + chr(39) + ' && pergunta) return (
    <div style={{ ...bg, justifyContent:' + chr(39) + 'flex-start' + chr(39) + ', paddingTop:30 }}>
      <div style={{ width:' + chr(39) + '100%' + chr(39) + ', maxWidth:480 }}>
        <div style={{ display:' + chr(39) + 'flex' + chr(39) + ', justifyContent:' + chr(39) + 'space-between' + chr(39) + ', marginBottom:16, alignItems:' + chr(39) + 'center' + chr(39) + ' }}>
          <span style={{ opacity:0.7, fontSize:13 }}>Pergunta {perguntaIdx+1}/{perguntas.length}</span>
          <button onClick={() => { setPausado(p => !p); if (!pausado) clearInterval(timerRef.current); }} style={{ padding:' + chr(39) + '6px 14px' + chr(39) + ', borderRadius:20, border:' + chr(39) + '1px solid rgba(255,255,255,0.3)' + chr(39) + ', background:pausado ? ' + chr(39) + '#f0c040' + chr(39) + ' : ' + chr(39) + 'transparent' + chr(39) + ', color:pausado ? ' + chr(39) + '#1a0a3e' + chr(39) + ' : ' + chr(39) + 'white' + chr(39) + ', cursor:' + chr(39) + 'pointer' + chr(39) + ', fontSize:13, fontWeight:700 }}>{pausado ? ' + chr(39) + '▶ Continuar' + chr(39) + ' : ' + chr(39) + '⏸ Pausa' + chr(39) + '}</button>
          <span style={{ fontWeight:700, color:tempo<=2 ? ' + chr(39) + '#e74c3c' + chr(39) + ' : ' + chr(39) + '#f0c040' + chr(39) + ' }}>⏱ {tempo}s</span>
        </div>

        <div style={{ background:' + chr(39) + 'rgba(255,255,255,0.1)' + chr(39) + ', borderRadius:16, padding:20, marginBottom:16 }}>
          <div style={{ width:' + chr(39) + '100%' + chr(39) + ', height:6, background:' + chr(39) + 'rgba(255,255,255,0.2)' + chr(39) + ', borderRadius:3, marginBottom:14 }}>
            <div style={{ width:(tempo/TEMPO*100) + ' + chr(39) + '%' + chr(39) + ', height:' + chr(39) + '100%' + chr(39) + ', background:tempo<=2 ? ' + chr(39) + '#e74c3c' + chr(39) + ' : ' + chr(39) + '#6c47d4' + chr(39) + ', borderRadius:3, transition:' + chr(39) + 'width 1s linear' + chr(39) + ' }} />
          </div>
          <p style={{ fontSize:17, fontWeight:700, lineHeight:1.5, textAlign:' + chr(39) + 'center' + chr(39) + ' }}>{pergunta.q}</p>
        </div>

        <div style={{ display:' + chr(39) + 'grid' + chr(39) + ', gridTemplateColumns:' + chr(39) + '1fr 1fr' + chr(39) + ', gap:10, marginBottom:16 }}>
          {pergunta.opts.map((opt,i) => {
            let bgC = ' + chr(39) + 'rgba(255,255,255,0.1)' + chr(39) + ';
            if (respostaSelecionada !== null) {
              if (i === pergunta.r) bgC = ' + chr(39) + '#27ae60' + chr(39) + ';
              else if (i === respostaSelecionada) bgC = ' + chr(39) + '#e74c3c' + chr(39) + ';
            }
            return <button key={i} onClick={() => responder(i)} style={{ padding:' + chr(39) + '14px 10px' + chr(39) + ', borderRadius:12, border:' + chr(39) + '1px solid rgba(255,255,255,0.2)' + chr(39) + ', background:bgC, color:' + chr(39) + 'white' + chr(39) + ', fontSize:14, fontWeight:600, cursor:' + chr(39) + 'pointer' + chr(39) + ', transition:' + chr(39) + 'background 0.3s' + chr(39) + ' }}>{opt}</button>;
          })}
        </div>

        {feedback && <div style={{ textAlign:' + chr(39) + 'center' + chr(39) + ', fontSize:24, marginBottom:16 }}>{feedback.correto ? ' + chr(39) + '🙏 Amem! +' + chr(39) + ' + feedback.pts + ' + chr(39) + ' pts' + chr(39) + ' : ' + chr(39) + '❌ Quase!' + chr(39) + '}</div>}

        {pausado && <div style={{ textAlign:' + chr(39) + 'center' + chr(39) + ', fontSize:18, opacity:0.8, marginBottom:16 }}>⏸ Jogo pausado</div>}

        <div style={{ background:' + chr(39) + 'rgba(0,0,0,0.3)' + chr(39) + ', borderRadius:12, padding:12 }}>
          <p style={{ fontSize:12, opacity:0.7, marginBottom:8 }}>💬 Chat</p>
          <div style={{ maxHeight:80, overflowY:' + chr(39) + 'auto' + chr(39) + ', marginBottom:8 }}>
            {chatMsgs.map((m,i) => <div key={i} style={{ fontSize:12, marginBottom:4 }}><b style={{ color:' + chr(39) + '#f0c040' + chr(39) + ' }}>{m.nome}:</b> {m.texto}</div>)}
            <div ref={chatEndRef} />
          </div>
          <div style={{ display:' + chr(39) + 'flex' + chr(39) + ', gap:8 }}>
            <input value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key===' + chr(39) + 'Enter' + chr(39) + ' && enviarChat()} placeholder=' + chr(39) + 'Mensagem...' + chr(39) + ' style={{ flex:1, padding:' + chr(39) + '6px 10px' + chr(39) + ', borderRadius:8, border:' + chr(39) + 'none' + chr(39) + ', background:' + chr(39) + 'rgba(255,255,255,0.15)' + chr(39) + ', color:' + chr(39) + 'white' + chr(39) + ', fontSize:12, outline:' + chr(39) + 'none' + chr(39) + ' }} />
            <button onClick={enviarChat} style={{ padding:' + chr(39) + '6px 12px' + chr(39) + ', borderRadius:8, border:' + chr(39) + 'none' + chr(39) + ', background:' + chr(39) + '#6c47d4' + chr(39) + ', color:' + chr(39) + 'white' + chr(39) + ', cursor:' + chr(39) + 'pointer' + chr(39) + ', fontSize:12 }}>Enviar</button>
          </div>
        </div>
      </div>
    </div>
  );

  if (tela === ' + chr(39) + 'resultado' + chr(39) + ') return (
    <div style={bg}>
      <div style={{ fontSize:60, marginBottom:16 }}>🏆</div>
      <h2 style={{ fontSize:28, fontWeight:900, marginBottom:8 }}>Resultado Final!</h2>
      <div style={{ fontSize:48, fontWeight:900, color:' + chr(39) + '#f0c040' + chr(39) + ', marginBottom:8 }}>{resultado?.pontos} pts</div>
      <p style={{ opacity:0.7, marginBottom:32 }}>{resultado?.pontos >= 40 ? ' + chr(39) + 'Mestre Biblico! 🔥' + chr(39) + ' : resultado?.pontos >= 25 ? ' + chr(39) + 'Muito bem! 🙏' + chr(39) + ' : ' + chr(39) + 'Continue estudando! 📖' + chr(39) + '}</p>
      <button onClick={compartilhar} style={{ width:' + chr(39) + '100%' + chr(39) + ', maxWidth:320, padding:14, borderRadius:14, border:' + chr(39) + 'none' + chr(39) + ', background:' + chr(39) + '#25D366' + chr(39) + ', color:' + chr(39) + 'white' + chr(39) + ', fontSize:15, fontWeight:700, cursor:' + chr(39) + 'pointer' + chr(39) + ', marginBottom:12 }}>📱 Partilhar resultado</button>
      <button onClick={() => { setPontos(0); setPerguntaIdx(0); setTela(' + chr(39) + 'lobby' + chr(39) + '); setProntoEu(false); }} style={{ width:' + chr(39) + '100%' + chr(39) + ', maxWidth:320, padding:14, borderRadius:14, border:' + chr(39) + '1px solid rgba(255,255,255,0.3)' + chr(39) + ', background:' + chr(39) + 'transparent' + chr(39) + ', color:' + chr(39) + 'white' + chr(39) + ', fontSize:15, cursor:' + chr(39) + 'pointer' + chr(39) + ', marginBottom:12 }}>🔄 Jogar de novo</button>
      <button onClick={() => navigate(-1)} style={{ background:' + chr(39) + 'none' + chr(39) + ', border:' + chr(39) + 'none' + chr(39) + ', color:' + chr(39) + 'rgba(255,255,255,0.5)' + chr(39) + ', cursor:' + chr(39) + 'pointer' + chr(39) + ', fontSize:13 }}>Voltar</button>
    </div>
  );

  return null;
}