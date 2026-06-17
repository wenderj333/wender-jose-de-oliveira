import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

export default function PrivacyPolicy() {
  const { t } = useTranslation();
  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 20px', fontFamily: 'Nunito, sans-serif' }}>
      <Link to="/" style={{ color: '#1877F2', textDecoration: 'none', fontSize: 14 }}>&larr; {t('common.back', 'Voltar')}</Link>
      <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: '20px 0 10px', color: '#1877F2' }}>{t('legal.privacy', 'Politica de Privacidade')}</h1>
      <p style={{ color: '#888', fontSize: 13, marginBottom: 32 }}>{t('legal.lastUpdate', 'Ultima atualizacao')}: Abril 2026</p>
      <h2 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '24px 0 8px' }}>1. {t('legal.p1title', 'Informacoes que coletamos')}</h2>
      <p style={{ lineHeight: 1.8, color: '#444' }}>{t('legal.p1text', 'Coletamos informacoes que voce nos fornece diretamente.')}</p>
      <h2 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '24px 0 8px' }}>2. {t('legal.p2title', 'Como usamos suas informacoes')}</h2>
      <p style={{ lineHeight: 1.8, color: '#444' }}>{t('legal.p2text', 'Usamos suas informacoes para fornecer e melhorar nossos servicos.')}</p>
      <h2 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '24px 0 8px' }}>3. {t('legal.p3title', 'Compartilhamento de dados')}</h2>
      <p style={{ lineHeight: 1.8, color: '#444' }}>{t('legal.p3text', 'Nao vendemos seus dados pessoais.')}</p>
      <h2 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '24px 0 8px' }}>4. {t('legal.p4title', 'Seguranca')}</h2>
      <p style={{ lineHeight: 1.8, color: '#444' }}>{t('legal.p4text', 'Implementamos medidas de seguranca para proteger suas informacoes.')}</p>
      <h2 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '24px 0 8px' }}>5. {t('legal.p5title', 'Seus direitos')}</h2>
      <p style={{ lineHeight: 1.8, color: '#444' }}>{t('legal.p5text', 'Voce tem o direito de acessar, corrigir ou excluir seus dados.')}</p>
      <h2 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '24px 0 8px' }}>6. {t('legal.contact', 'Contato')}</h2>
      <p style={{ lineHeight: 1.8, color: '#444' }}>suporte@sigocomfe.com</p>
    </div>
  );
}
