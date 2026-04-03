import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

export default function TermsOfUse() {
  const { t } = useTranslation();
  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 20px', fontFamily: 'Nunito, sans-serif' }}>
      <Link to="/" style={{ color: '#1877F2', textDecoration: 'none', fontSize: 14 }}>&larr; {t('common.back', 'Voltar')}</Link>
      <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: '20px 0 10px', color: '#1877F2' }}>{t('legal.terms', 'Termos de Uso')}</h1>
      <p style={{ color: '#888', fontSize: 13, marginBottom: 32 }}>{t('legal.lastUpdate', 'Ultima atualizacao')}: Abril 2026</p>
      <h2 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '24px 0 8px' }}>1. {t('legal.t1title', 'Aceitacao dos Termos')}</h2>
      <p style={{ lineHeight: 1.8, color: '#444' }}>{t('legal.t1text', 'Ao usar a Sigo com Fe, voce concorda com estes termos.')}</p>
      <h2 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '24px 0 8px' }}>2. {t('legal.t2title', 'Uso Aceitavel')}</h2>
      <p style={{ lineHeight: 1.8, color: '#444' }}>{t('legal.t2text', 'E proibido publicar conteudo ofensivo ou que va contra os valores cristaos.')}</p>
      <h2 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '24px 0 8px' }}>3. {t('legal.t3title', 'Conta do Usuario')}</h2>
      <p style={{ lineHeight: 1.8, color: '#444' }}>{t('legal.t3text', 'Voce e responsavel pela seguranca da sua conta.')}</p>
      <h2 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '24px 0 8px' }}>4. {t('legal.t4title', 'Conteudo')}</h2>
      <p style={{ lineHeight: 1.8, color: '#444' }}>{t('legal.t4text', 'Voce mantem os direitos do conteudo que publica.')}</p>
      <h2 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '24px 0 8px' }}>5. {t('legal.t5title', 'Encerramento de Conta')}</h2>
      <p style={{ lineHeight: 1.8, color: '#444' }}>{t('legal.t5text', 'Voce pode apagar sua conta a qualquer momento nas configuracoes.')}</p>
      <h2 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '24px 0 8px' }}>6. {t('legal.contact', 'Contato')}</h2>
      <p style={{ lineHeight: 1.8, color: '#444' }}>suporte@sigocomfe.com</p>
    </div>
  );
}
