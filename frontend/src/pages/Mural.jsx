import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Filter, X, Send } from 'lucide-react';
import FeedPost from '../components/FeedPost';

const DEMO_POSTS = [
  { id: 1, type: 'testemunho', authorInitials: 'MC', authorName: 'Maria Clara', church: 'Igreja Batista Central', time: 'Há 2 horas', content: 'Glória a Deus! Depois de 3 anos desempregada, o Senhor abriu as portas e fui aprovada no concurso público. Nunca desistam de orar, irmãos! Deus é fiel e cumpre cada promessa. Ele me sustentou em cada momento de dificuldade e hoje posso testemunhar a Sua bondade.', amemCount: 47, commentCount: 12 },
  { id: 2, type: 'louvor', authorInitials: 'PR', authorName: 'Paulo Ricardo', church: 'Comunidade Graça e Paz', time: 'Há 4 horas', content: 'Novo louvor do ministério de adoração da nossa igreja. Que o Espírito Santo toque cada coração!', amemCount: 31, commentCount: 8 },
  { id: 3, type: 'foto', authorInitials: 'AS', authorName: 'Ana Souza', church: 'Igreja Metodista Renovada', time: 'Há 6 horas', content: 'Batismo nas águas de 15 novos irmãos! Que momento abençoado. O céu está em festa!', amemCount: 89, commentCount: 23 },
  { id: 4, type: 'reflexao', authorInitials: 'JL', authorName: 'Pastor João Lucas', church: 'Igreja Presbiteriana do Centro', time: 'Há 8 horas', content: 'Muitas vezes queremos que Deus mude as circunstâncias, mas Ele quer mudar o nosso coração primeiro. A transformação interior precede a transformação exterior. Quando permitimos que o Senhor trabalhe em nós, tudo ao nosso redor começa a mudar. Confie no processo de Deus para a sua vida.', amemCount: 65, commentCount: 18 },
  { id: 5, type: 'versiculo', authorInitials: 'DF', authorName: 'Daniela Ferreira', church: 'Assembleia de Deus', time: 'Há 10 horas', content: 'Porque eu bem sei os pensamentos que penso de vós, diz o Senhor; pensamentos de paz e não de mal, para vos dar o fim que esperais.', reference: 'Jeremias 29:11', amemCount: 112, commentCount: 5 },
  { id: 6, type: 'testemunho', authorInitials: 'RS', authorName: 'Roberto Santos', church: 'Igreja do Nazareno', time: 'Há 12 horas', content: 'Minha mãe recebeu alta do hospital hoje após uma cirurgia delicada. Os médicos disseram que a recuperação foi surpreendente. Obrigado a todos que oraram! O poder da oração coletiva é real.', amemCount: 73, commentCount: 15 },
];

export default function Mural() {
  const { t } = useTranslation();
  const [activeFilter, setActiveFilter] = useState('todas');
  const [showForm, setShowForm] = useState(false);
  const [newPostText, setNewPostText] = useState('');
  const [newPostCategory, setNewPostCategory] = useState('testemunho');
  const [posts, setPosts] = useState(DEMO_POSTS);

  const FILTERS = [
    { key: 'todas', label: t('mural.filters.all') },
    { key: 'minha-igreja', label: t('mural.filters.myChurch') },
    { key: 'testemunho', label: t('mural.filters.testimonies') },
    { key: 'louvor', label: t('mural.filters.worship') },
    { key: 'versiculo', label: t('mural.filters.verses') },
  ];

  const CATEGORIES = [
    { value: 'testemunho', label: t('mural.categories.testemunho') },
    { value: 'louvor', label: t('mural.categories.louvor') },
    { value: 'reflexao', label: t('mural.categories.reflexao') },
    { value: 'versiculo', label: t('mural.categories.versiculo') },
    { value: 'foto', label: t('mural.categories.foto') },
  ];

  const filteredPosts = activeFilter === 'todas' || activeFilter === 'minha-igreja'
    ? posts
    : posts.filter(p => p.type === activeFilter);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newPostText.trim()) return;
    const newPost = { id: Date.now(), type: newPostCategory, authorInitials: 'EU', authorName: 'Você', church: 'Sua Igreja', time: 'Agora', content: newPostText, amemCount: 0, commentCount: 0 };
    setPosts([newPost, ...posts]);
    setNewPostText('');
    setShowForm(false);
  };

  return (
    <div className="mural-page">
      <div className="mural-header">
        <div className="mural-header__top">
          <h1 className="mural-title">{t('mural.title')}</h1>
          <button className="btn btn-primary btn-sm" onClick={() => setShowForm(!showForm)}>
            {showForm ? <X size={16} /> : <Plus size={16} />}
            {showForm ? t('mural.cancel') : t('mural.newPost')}
          </button>
        </div>
        <p className="mural-subtitle">{t('mural.subtitle')}</p>
      </div>

      {showForm && (
        <form className="mural-new-post card" onSubmit={handleSubmit}>
          <h3>{t('mural.shareWithCommunity')}</h3>
          <div className="form-group">
            <label>{t('mural.categoryLabel')}</label>
            <select value={newPostCategory} onChange={e => setNewPostCategory(e.target.value)}>
              {CATEGORIES.map(c => (<option key={c.value} value={c.value}>{c.label}</option>))}
            </select>
          </div>
          <div className="form-group">
            <label>{t('mural.message')}</label>
            <textarea rows={4} placeholder={t('mural.messagePlaceholder')} value={newPostText} onChange={e => setNewPostText(e.target.value)} />
          </div>
          <button type="submit" className="btn btn-primary"><Send size={16} /> {t('mural.publish')}</button>
        </form>
      )}

      <div className="mural-filters">
        <Filter size={16} style={{ color: 'var(--gray-500)' }} />
        {FILTERS.map(f => (
          <button key={f.key} className={`mural-filter-tab ${activeFilter === f.key ? 'mural-filter-tab--active' : ''}`} onClick={() => setActiveFilter(f.key)}>
            {f.label}
          </button>
        ))}
      </div>

      <div className="mural-feed">
        {filteredPosts.map(post => (<FeedPost key={post.id} post={post} />))}
        {filteredPosts.length === 0 && (
          <div className="mural-empty card"><p>{t('mural.noPostsFound')}</p></div>
        )}
      </div>
    </div>
  );
}
