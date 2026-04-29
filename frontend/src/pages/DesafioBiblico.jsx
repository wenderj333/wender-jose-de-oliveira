import React, { useState, useEffect, useRef } from 'react';

const DesafioBiblico = () => {
    const [tela, setTela] = useState('inicio'); // inicio, buscando, jogando, fim
    const [oponente, setOponente] = useState(null);
    const [tempo, setTempo] = useState(30);
    const [perguntaAtual, setPerguntaAtual] = useState(0);
    const [pontos, setPontos] = useState(0);
    const [resp, setResp] = useState(null);
    const timerRef = useRef(null);

    const perguntas = [
        { p: "Quem construiu a arca?", r: ["Noé", "Moisés", "Davi", "Pedro"], c: 0 },
        { p: "Qual o primeiro livro da Bíblia?", r: ["Êxodo", "Salmos", "Gênesis", "Mateus"], c: 2 },
        { p: "Quem derrotou Golias?", r: ["Saul", "Davi", "Salomão", "Sansão"], c: 1 }
    ];

    // Lógica de Busca de Oponente
    const iniciarBusca = () => {
        setTela('buscando');
        // Simula a espera do banco de dados (Supabase)
        setTimeout(() => {
            setOponente({ nome: "Irmão André", foto: "https://i.pravatar.cc/150?u=a", pts: 1200 });
            setTela('jogando');
        }, 3000);
    };

    useEffect(() => {
        if (tela === 'jogando' && !resp && tempo > 0) {
            timerRef.current = setInterval(() => setTempo((prev) => prev - 1), 1000);
        } else if (tempo === 0 && !resp) { handleResposta(-1); }
        return () => clearInterval(timerRef.current);
    }, [tela, resp, tempo]);

    const handleResposta = (index) => {
        if (resp !== null) return;
        clearInterval(timerRef.current);
        setResp(index);
        if(index === perguntas[perguntaAtual].c) setPontos(prev => prev + 100);

        setTimeout(() => {
            if (perguntaAtual < perguntas.length - 1) {
                setPerguntaAtual(prev => prev + 1);
                setResp(null);
                setTempo(30);
            } else { setTela('fim'); }
        }, 1500);
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px', backgroundColor: '#1a1a1a', minHeight: '100vh', color: 'white', fontFamily: 'sans-serif' }}>
            
            <div style={{ background: 'rgba(0,0,0,0.9)', padding: '40px', borderRadius: '30px', border: '2px solid #FFD700', width: '100%', maxWidth: '500px', textAlign: 'center' }}>
                
                {tela === 'inicio' && (
                    <>
                        <h1 style={{ color: '#FFD700' }}>Desafio Bíblico 🏆</h1>
                        <p>Teste seus conhecimentos contra outros irmãos!</p>
                        <button onClick={iniciarBusca} style={{ background: '#FFD700', padding: '15px 40px', borderRadius: '30px', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '1.2rem', marginTop: '20px' }}>
                            Encontrar Oponente
                        </button>
                    </>
                )}

                {tela === 'buscando' && (
                    <>
                        <div className="loader" style={{ border: '5px solid #f3f3f3', borderTop: '5px solid #FFD700', borderRadius: '50%', width: '50px', height: '50px', animation: 'spin 1s linear infinite', margin: '0 auto 20px' }}></div>
                        <h2 style={{ color: '#FFD700' }}>Buscando oponente...</h2>
                        <p>Aguarde um momento, estamos conectando você.</p>
                        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
                    </>
                )}

                {tela === 'jogando' && (
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', fontSize: '0.9rem', color: '#FFD700' }}>
                            <span>Você: {pontos} pts</span>
                            <span style={{ background: 'red', color: 'white', padding: '2px 10px', borderRadius: '10px' }}>⏱ {tempo}s</span>
                            <span>{oponente?.nome}: 1100 pts</span>
                        </div>
                        <h3 style={{ fontSize: '1.4rem', marginBottom: '20px' }}>{perguntas[perguntaAtual].p}</h3>
                        <div style={{ display: 'grid', gap: '12px' }}>
                            {perguntas[perguntaAtual].r.map((r, i) => (
                                <button key={i} onClick={() => handleResposta(i)} 
                                    style={{ 
                                        padding: '18px', borderRadius: '15px', border: 'none', 
                                        background: resp === i ? (i === perguntas[perguntaAtual].c ? '#4CAF50' : '#f44336') : 'rgba(255,255,255,0.1)', 
                                        color: 'white', cursor: 'pointer', transition: '0.3s'
                                    }}>
                                    {r}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {tela === 'fim' && (
                    <>
                        <h1 style={{ color: '#FFD700' }}>Fim de Jogo!</h1>
                        <p style={{ fontSize: '1.5rem' }}>Sua pontuação: {pontos}</p>
                        <button onClick={() => window.location.reload()} style={{ background: '#FFD700', padding: '10px 30px', borderRadius: '20px', border: 'none', marginTop: '20px', cursor: 'pointer' }}>Jogar Novamente</button>
                    </>
                )}
            </div>
        </div>
    );
};

export default DesafioBiblico;
