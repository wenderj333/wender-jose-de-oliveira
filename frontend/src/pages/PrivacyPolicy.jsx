import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

export default function PrivacyPolicy() {
  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 20px', fontFamily: 'Nunito, sans-serif', color: '#1c1c1c' }}>
      <Link to="/" style={{ color: '#1877F2', textDecoration: 'none', fontSize: 14 }}>&larr; Voltar</Link>
      <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: '20px 0 10px', color: '#1877F2' }}>Politica de Privacidade</h1>
      <p style={{ color: '#888', fontSize: 13, marginBottom: 32 }}>Ultima atualizacao: Abril 2026</p>

      <h2 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '24px 0 8px' }}>1. Informacoes que coletamos</h2>
      <p style={{ lineHeight: 1.8, color: '#444' }}>Coletamos informacoes que voce nos fornece diretamente, como nome, email, foto de perfil e conteudo que publica na plataforma.</p>

      <h2 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '24px 0 8px' }}>2. Como usamos suas informacoes</h2>
      <p style={{ lineHeight: 1.8, color: '#444' }}>Usamos suas informacoes para fornecer, melhorar e personalizar nossos servicos, enviar notificacoes e garantir a seguranca da plataforma.</p>

      <h2 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '24px 0 8px' }}>3. Compartilhamento de dados</h2>
      <p style={{ lineHeight: 1.8, color: '#444' }}>Nao vendemos seus dados pessoais. Compartilhamos informacoes apenas com provedores de servico necessarios para o funcionamento da plataforma.</p>

      <h2 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '24px 0 8px' }}>4. Seguranca</h2>
      <p style={{ lineHeight: 1.8, color: '#444' }}>Implementamos medidas de seguranca para proteger suas informacoes contra acesso nao autorizado.</p>

      <h2 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '24px 0 8px' }}>5. Seus direitos</h2>
      <p style={{ lineHeight: 1.8, color: '#444' }}>Voce tem o direito de acessar, corrigir ou excluir seus dados pessoais. Para apagar sua conta, va em Configuracoes e clique em Apagar Conta.</p>

      <h2 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '24px 0 8px' }}>6. Contato</h2>
      <p style={{ lineHeight: 1.8, color: '#444' }}>Para duvidas sobre privacidade, entre em contato: <a href="mailto:suporte@sigocomfe.com" style={{ color: '#1877F2' }}>suporte@sigocomfe.com</a></p>
    </div>
  );
}
