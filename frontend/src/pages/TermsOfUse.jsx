import React from 'react';
import { Link } from 'react-router-dom';

export default function TermsOfUse() {
  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 20px', fontFamily: 'Nunito, sans-serif', color: '#1c1c1c' }}>
      <Link to="/" style={{ color: '#1877F2', textDecoration: 'none', fontSize: 14 }}>&larr; Voltar</Link>
      <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: '20px 0 10px', color: '#1877F2' }}>Termos de Uso</h1>
      <p style={{ color: '#888', fontSize: 13, marginBottom: 32 }}>Ultima atualizacao: Abril 2026</p>

      <h2 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '24px 0 8px' }}>1. Aceitacao dos Termos</h2>
      <p style={{ lineHeight: 1.8, color: '#444' }}>Ao usar a Sigo com Fe, voce concorda com estes termos. Se nao concordar, nao use a plataforma.</p>

      <h2 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '24px 0 8px' }}>2. Uso Aceitavel</h2>
      <p style={{ lineHeight: 1.8, color: '#444' }}>A Sigo com Fe e uma rede social crista. E proibido publicar conteudo ofensivo, violento, sexual ou que va contra os valores cristãos.</p>

      <h2 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '24px 0 8px' }}>3. Conta do Usuario</h2>
      <p style={{ lineHeight: 1.8, color: '#444' }}>Voce e responsavel pela seguranca da sua conta. Nao compartilhe sua senha com terceiros.</p>

      <h2 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '24px 0 8px' }}>4. Conteudo</h2>
      <p style={{ lineHeight: 1.8, color: '#444' }}>Voce mantem os direitos do conteudo que publica, mas nos concede licenca para exibi-lo na plataforma.</p>

      <h2 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '24px 0 8px' }}>5. Encerramento de Conta</h2>
      <p style={{ lineHeight: 1.8, color: '#444' }}>Voce pode apagar sua conta a qualquer momento nas configuracoes. Reservamos o direito de suspender contas que violem estes termos.</p>

      <h2 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '24px 0 8px' }}>6. Contato</h2>
      <p style={{ lineHeight: 1.8, color: '#444' }}>Duvidas: <a href="mailto:suporte@sigocomfe.com" style={{ color: '#1877F2' }}>suporte@sigocomfe.com</a></p>
    </div>
  );
}
