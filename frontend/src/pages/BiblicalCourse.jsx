import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BookOpen, DollarSign, Award, ChevronRight, PlayCircle, Lock } from 'lucide-react';

export default function BiblicalCourse() {
  const { t } = useTranslation();
  const [activeCourse, setActiveCourse] = useState(null); // 'finance' or 'theology'

  // Helper to get lessons array from translation object
  const getLessons = (courseKey) => {
    const lessonsObj = t(`${courseKey}.lessons`, { returnObjects: true });
    if (!lessonsObj) return [];
    return Object.keys(lessonsObj).map(key => ({ id: key, ...lessonsObj[key] }));
  };

  if (activeCourse) {
    const courseKey = activeCourse === 'finance' ? 'courseFinance' : 'courseTheology';
    const lessons = getLessons(courseKey);
    const title = t(`${courseKey}.title`);
    const subtitle = t(`${courseKey}.subtitle`);

    return (
      <div className="page-container" style={{padding: '20px', maxWidth: '800px', margin: '0 auto'}}>
        <button onClick={() => setActiveCourse(null)} style={{
          background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5,
          color: 'var(--muted)', marginBottom: 20, fontSize: '0.9rem', fontWeight: 600
        }}>
          <ChevronRight size={16} style={{transform: 'rotate(180deg)'}} /> {t('common.back', 'Voltar')}
        </button>

        <header style={{marginBottom: 30}}>
          <div style={{
            background: activeCourse === 'finance' ? 'linear-gradient(135deg, #27ae60, #2ecc71)' : 'linear-gradient(135deg, #8e44ad, #9b59b6)',
            borderRadius: 20, padding: 30, color: 'white', boxShadow: '0 10px 30px rgba(0,0,0,0.15)'
          }}>
            <h1 style={{fontFamily: "'Cormorant Garamond', serif", fontSize: '2.2rem', marginBottom: 10}}>{title}</h1>
            <p style={{fontSize: '1.1rem', opacity: 0.9}}>{subtitle}</p>
            <div style={{marginTop: 20, display: 'flex', gap: 15, fontSize: '0.9rem', fontWeight: 600}}>
              <span style={{background: 'rgba(255,255,255,0.2)', padding: '5px 12px', borderRadius: 20}}>
                <BookOpen size={14} style={{verticalAlign: 'middle', marginRight: 5}}/> 
                {lessons.length} {t('courseFinance.lesson', 'Lições')}
              </span>
              <span style={{background: 'rgba(255,255,255,0.2)', padding: '5px 12px', borderRadius: 20}}>
                <Award size={14} style={{verticalAlign: 'middle', marginRight: 5}}/> 
                {t('courseFinance.certificate', 'Certificado')}
              </span>
            </div>
          </div>
        </header>

        <div className="lessons-list" style={{display: 'flex', flexDirection: 'column', gap: 15}}>
          <h3 style={{fontSize: '1.2rem', color: 'var(--text)', marginBottom: 10}}>{t('courseFinance.content', 'Conteúdo do Curso')}</h3>
          
          {lessons.map((lesson, idx) => (
            <div key={lesson.id} className="glass-card" style={{
              padding: 20, borderRadius: 12, background: 'var(--card)', border: '1px solid var(--border)',
              display: 'flex', alignItems: 'center', gap: 15, transition: 'transform 0.2s', cursor: 'pointer'
            }} onMouseEnter={e => e.currentTarget.style.transform = 'translateX(5px)'} 
               onMouseLeave={e => e.currentTarget.style.transform = 'translateX(0)'}
               onClick={() => alert('Em breve: Conteúdo da aula!')}>
              
              <div style={{
                width: 40, height: 40, borderRadius: '50%', background: 'var(--bg)', 
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: activeCourse === 'finance' ? '#27ae60' : '#8e44ad', fontWeight: 'bold'
              }}>
                {idx + 1}
              </div>
              
              <div style={{flex: 1}}>
                <h4 style={{fontSize: '1rem', color: 'var(--text)', marginBottom: 4}}>{lesson.title}</h4>
                <p style={{fontSize: '0.85rem', color: 'var(--muted)'}}>{lesson.desc}</p>
              </div>

              {idx === 0 ? (
                <PlayCircle size={24} color={activeCourse === 'finance' ? '#27ae60' : '#8e44ad'} />
              ) : (
                <Lock size={20} color="var(--muted)" />
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="page-container" style={{padding: '20px', maxWidth: '1000px', margin: '0 auto'}}>
      <header style={{textAlign: 'center', marginBottom: 40}}>
        <h1 style={{fontFamily: "'Cormorant Garamond', serif", fontSize: '2.5rem', color: 'var(--text)', marginBottom: 10}}>
          {t('course.title', 'Cursos Bíblicos')}
        </h1>
        <p style={{color: 'var(--muted)', fontSize: '1.1rem'}}>
          Aprofunde seu conhecimento e cresça na fé com nossos cursos exclusivos.
        </p>
      </header>

      <div className="courses-grid" style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 30}}>
        
        {/* Finance Course */}
        <div className="course-card glass-card" onClick={() => setActiveCourse('finance')} style={{
          borderRadius: 20, overflow: 'hidden', background: 'var(--card)', border: '1px solid var(--border)',
          cursor: 'pointer', transition: 'transform 0.3s, box-shadow 0.3s', position: 'relative'
        }} onMouseEnter={e => {
             e.currentTarget.style.transform = 'translateY(-5px)';
             e.currentTarget.style.boxShadow = '0 15px 30px rgba(0,0,0,0.1)';
           }} onMouseLeave={e => {
             e.currentTarget.style.transform = 'translateY(0)';
             e.currentTarget.style.boxShadow = 'none';
           }}>
          <div style={{height: 140, background: 'linear-gradient(135deg, #27ae60, #2ecc71)', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            <DollarSign size={60} color="white" style={{opacity: 0.9}} />
          </div>
          <div style={{padding: 25}}>
            <h3 style={{fontSize: '1.4rem', fontFamily: "'Cormorant Garamond', serif", marginBottom: 10, color: 'var(--text)'}}>
              {t('courseFinance.title', 'Finanças Bíblicas')}
            </h3>
            <p style={{fontSize: '0.9rem', color: 'var(--muted)', lineHeight: 1.6, marginBottom: 20}}>
              {t('courseFinance.subtitle', 'Aprenda a administrar suas finanças segundo os princípios de Deus.')}
            </p>
            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 600, color: '#27ae60'}}>
              <span>15 {t('courseFinance.lesson', 'Lições')}</span>
              <span style={{display: 'flex', alignItems: 'center', gap: 5}}>
                {t('common.start', 'Começar')} <ChevronRight size={16} />
              </span>
            </div>
          </div>
        </div>

        {/* Theology Course */}
        <div className="course-card glass-card" onClick={() => setActiveCourse('theology')} style={{
          borderRadius: 20, overflow: 'hidden', background: 'var(--card)', border: '1px solid var(--border)',
          cursor: 'pointer', transition: 'transform 0.3s, box-shadow 0.3s', position: 'relative'
        }} onMouseEnter={e => {
             e.currentTarget.style.transform = 'translateY(-5px)';
             e.currentTarget.style.boxShadow = '0 15px 30px rgba(0,0,0,0.1)';
           }} onMouseLeave={e => {
             e.currentTarget.style.transform = 'translateY(0)';
             e.currentTarget.style.boxShadow = 'none';
           }}>
          <div style={{height: 140, background: 'linear-gradient(135deg, #8e44ad, #9b59b6)', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            <BookOpen size={60} color="white" style={{opacity: 0.9}} />
          </div>
          <div style={{padding: 25}}>
            <h3 style={{fontSize: '1.4rem', fontFamily: "'Cormorant Garamond', serif", marginBottom: 10, color: 'var(--text)'}}>
              {t('courseTheology.title', 'Teologia Cristã')}
            </h3>
            <p style={{fontSize: '0.9rem', color: 'var(--muted)', lineHeight: 1.6, marginBottom: 20}}>
              {t('courseTheology.subtitle', 'Aprofunde seu conhecimento teológico.')}
            </p>
            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 600, color: '#8e44ad'}}>
              <span>20 {t('courseFinance.lesson', 'Lições')}</span>
              <span style={{display: 'flex', alignItems: 'center', gap: 5}}>
                {t('common.start', 'Começar')} <ChevronRight size={16} />
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}