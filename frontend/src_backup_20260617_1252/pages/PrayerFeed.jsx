import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import PrayerCard from '../components/PrayerCard';
import { useAuth } from '../context/AuthContext';
import {
  HandHeart,
  Trophy,
  Plus,
  X,
  Camera,
  Image,
  Sparkles,
} from 'lucide-react';
import { Link } from 'react-router-dom';

const API_BASE = import.meta.env.VITE_API_URL || '';

const CATEGORY_CONFIG = {
  health: {
    label: 'Saúde',
    color: '#ff5a5f',
    icon: '❤️',
  },
  work_finance: {
    label: 'Trabalho',
    color: '#f59e0b',
    icon: '💼',
  },
  family: {
    label: 'Família',
    color: '#3b82f6',
    icon: '👨‍👩‍👧',
  },
  studies: {
    label: 'Estudos',
    color: '#8b5cf6',
    icon: '📚',
  },
  housing: {
    label: 'Moradia',
    color: '#14b8a6',
    icon: '🏠',
  },
  emotional: {
    label: 'Emocional',
    color: '#ec4899',
    icon: '💜',
  },
  decisions: {
    label: 'Decisões',
    color: '#f97316',
    icon: '🤔',
  },
  other: {
    label: 'Outro',
    color: '#a855f7',
    icon: '✨',
  },
};

export default function PrayerFeed() {
  const { user, token } = useAuth();
  const { t } = useTranslation();

  const [prayers, setPrayers] = useState([]);
  const [tab, setTab] = useState('all');
  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    title: '',
    content: '',
    category: 'other',
    is_urgent: false,
  });

  const [loading, setLoading] = useState(true);

  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoWall, setPhotoWall] = useState([]);

  const fileRef = useRef(null);

  const isPastor =
    user?.role === 'pastor' || user?.role === 'admin';

  const fetchPrayers = async () => {
    setLoading(true);

    const endpoint =
      tab === 'answered'
        ? API_BASE + '/api/prayers/answered'
        : API_BASE + '/api/prayers';

    try {
      const headers = token
        ? { Authorization: 'Bearer ' + token }
        : {};

      const res = await fetch(endpoint, { headers });

      const data = await res.json();

      let result = data.prayers || [];

      if (user && !isPastor) {
        result = result.filter(
          (p) => p.author_id === user.id
        );
      }

      setPrayers(result);
    } catch {
      setPrayers([]);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchPrayers();
  }, [tab]);

  useEffect(() => {
    const saved = JSON.parse(
      localStorage.getItem('prayer_photos') || '[]'
    );

    setPhotoWall(saved);
  }, []);

  const handlePhoto = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    setPhotoFile(file);

    const reader = new FileReader();

    reader.onload = () => setPhotoPreview(reader.result);

    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.content.trim()) return;

    if (photoPreview) {
      const saved = JSON.parse(
        localStorage.getItem('prayer_photos') || '[]'
      );

      const newPhoto = {
        id: Date.now(),
        photo: photoPreview,
        author: user?.full_name || 'Anônimo',
        date: new Date().toLocaleDateString(),
        prayers: 0,
      };

      saved.unshift(newPhoto);

      localStorage.setItem(
        'prayer_photos',
        JSON.stringify(saved.slice(0, 20))
      );

      setPhotoWall(saved.slice(0, 20));
    }

    await fetch(API_BASE + '/api/prayers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + token,
      },
      body: JSON.stringify(form),
    });

    setForm({
      title: '',
      content: '',
      category: 'other',
      is_urgent: false,
    });

    setPhotoFile(null);
    setPhotoPreview(null);

    setShowForm(false);

    fetchPrayers();
  };

  const handlePray = async (prayerId) => {
    await fetch(
      API_BASE + '/api/prayers/' + prayerId + '/pray',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token,
        },
        body: JSON.stringify({ message: '' }),
      }
    );

    fetchPrayers();
  };

  const prayForPhoto = (photoId) => {
    const saved = JSON.parse(
      localStorage.getItem('prayer_photos') || '[]'
    );

    const updated = saved.map((p) =>
      p.id === photoId
        ? { ...p, prayers: (p.prayers || 0) + 1 }
        : p
    );

    localStorage.setItem(
      'prayer_photos',
      JSON.stringify(updated)
    );

    setPhotoWall(updated);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background:
          'linear-gradient(to bottom, #0f0f1a, #17172a)',
        paddingBottom: 100,
        color: 'white',
        fontFamily:
          "'Inter', 'Segoe UI', sans-serif",
      }}
    >
      <style>
        {`
          .glass {
            background: rgba(255,255,255,0.06);
            backdrop-filter: blur(14px);
            border: 1px solid rgba(255,255,255,0.08);
          }

          .input-modern {
            width: 100%;
            background: rgba(255,255,255,0.06);
            border: 1px solid rgba(255,255,255,0.08);
            border-radius: 16px;
            padding: 14px 16px;
            color: white;
            font-size: .95rem;
            outline: none;
            box-sizing: border-box;
          }

          .input-modern::placeholder {
            color: rgba(255,255,255,0.45);
          }

          .input-modern:focus {
            border: 1px solid #8b5cf6;
            box-shadow: 0 0 0 3px rgba(139,92,246,.2);
          }

          .tab-btn {
            flex: 1;
            border: none;
            padding: 12px;
            border-radius: 14px;
            cursor: pointer;
            font-weight: 700;
            transition: .2s;
          }

          .tab-active {
            background: linear-gradient(135deg,#8b5cf6,#6d28d9);
            color: white;
          }

          .tab-inactive {
            background: rgba(255,255,255,.05);
            color: rgba(255,255,255,.6);
          }

          .modern-button {
            border: none;
            cursor: pointer;
            transition: .2s;
          }

          .modern-button:hover {
            transform: translateY(-2px);
          }
        `}
      </style>

      {/* HERO */}
      <div
        style={{
          padding: '28px 20px 10px',
          maxWidth: 760,
          margin: '0 auto',
        }}
      >
        <div
          className="glass"
          style={{
            borderRadius: 32,
            padding: 28,
            background:
              'linear-gradient(135deg, rgba(139,92,246,.25), rgba(76,29,149,.2))',
            boxShadow:
              '0 10px 40px rgba(0,0,0,.35)',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              gap: 20,
              flexWrap: 'wrap',
              marginBottom: 22,
            }}
          >
            <div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  marginBottom: 12,
                }}
              >
                <div
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: 18,
                    background:
                      'linear-gradient(135deg,#8b5cf6,#6d28d9)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <HandHeart size={24} />
                </div>

                <div>
                  <h1
                    style={{
                      margin: 0,
                      fontSize: '1.8rem',
                      fontWeight: 900,
                    }}
                  >
                    Pedidos de Oração
                  </h1>

                  <p
                    style={{
                      margin: '4px 0 0',
                      color: 'rgba(255,255,255,.7)',
                      fontSize: '.92rem',
                    }}
                  >
                    Uma comunidade unida pela fé ❤️
                  </p>
                </div>
              </div>

              <p
                style={{
                  color: 'rgba(255,255,255,.55)',
                  margin: 0,
                  lineHeight: 1.5,
                }}
              >
                “A oração feita por um justo pode muito.”
                — Tiago 5:16
              </p>
            </div>

            {user && (
              <button
                onClick={() =>
                  setShowForm(!showForm)
                }
                className="modern-button"
                style={{
                  background:
                    'linear-gradient(135deg,#8b5cf6,#6d28d9)',
                  color: 'white',
                  padding: '14px 22px',
                  borderRadius: 18,
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  height: 'fit-content',
                }}
              >
                {showForm ? (
                  <>
                    <X size={18} />
                    Fechar
                  </>
                ) : (
                  <>
                    <Plus size={18} />
                    Novo Pedido
                  </>
                )}
              </button>
            )}
          </div>

          {/* TABS */}
          <div
            style={{
              display: 'flex',
              gap: 10,
            }}
          >
            {[
              ['all', 'Todos'],
              ['photos', 'Fotos'],
              ['answered', 'Respondidas'],
            ].map(([value, label]) => (
              <button
                key={value}
                onClick={() => setTab(value)}
                className={`tab-btn ${
                  tab === value
                    ? 'tab-active'
                    : 'tab-inactive'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* CTA LOGIN */}
      {!user && (
        <div
          style={{
            maxWidth: 760,
            margin: '20px auto',
            padding: '0 20px',
          }}
        >
          <Link
            to="/cadastro"
            style={{ textDecoration: 'none' }}
          >
            <div
              className="glass"
              style={{
                borderRadius: 24,
                padding: 24,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <h3
                  style={{
                    margin: 0,
                    color: 'white',
                  }}
                >
                  Crie sua conta ✨
                </h3>

                <p
                  style={{
                    margin: '6px 0 0',
                    color: 'rgba(255,255,255,.6)',
                  }}
                >
                  Compartilhe pedidos e ore pela comunidade
                </p>
              </div>

              <div
                style={{
                  background:
                    'linear-gradient(135deg,#8b5cf6,#6d28d9)',
                  padding: '12px 18px',
                  borderRadius: 16,
                  color: 'white',
                  fontWeight: 800,
                }}
              >
                Entrar
              </div>
            </div>
          </Link>
        </div>
      )}

      {/* FORM */}
      {showForm && (
        <div
          style={{
            maxWidth: 760,
            margin: '20px auto',
            padding: '0 20px',
          }}
        >
          <form
            onSubmit={handleSubmit}
            className="glass"
            style={{
              borderRadius: 28,
              padding: 28,
            }}
          >
            <h2
              style={{
                marginTop: 0,
                marginBottom: 22,
                display: 'flex',
                alignItems: 'center',
                gap: 10,
              }}
            >
              <Sparkles size={22} />
              Novo Pedido de Oração
            </h2>

            <input
              className="input-modern"
              value={form.title}
              onChange={(e) =>
                setForm({
                  ...form,
                  title: e.target.value,
                })
              }
              placeholder="Título (opcional)"
              style={{ marginBottom: 14 }}
            />

            <textarea
              rows={5}
              className="input-modern"
              value={form.content}
              onChange={(e) =>
                setForm({
                  ...form,
                  content: e.target.value,
                })
              }
              placeholder="Descreva seu pedido..."
              style={{
                resize: 'none',
                marginBottom: 18,
              }}
            />

            {/* FOTO */}
            <div style={{ marginBottom: 18 }}>
              <p
                style={{
                  fontWeight: 700,
                  marginBottom: 10,
                }}
              >
                📷 Foto opcional
              </p>

              {photoPreview ? (
                <div
                  style={{
                    position: 'relative',
                    width: 'fit-content',
                  }}
                >
                  <img
                    src={photoPreview}
                    alt=""
                    style={{
                      width: 130,
                      height: 130,
                      borderRadius: 20,
                      objectFit: 'cover',
                    }}
                  />

                  <button
                    type="button"
                    onClick={() => {
                      setPhotoFile(null);
                      setPhotoPreview(null);
                    }}
                    style={{
                      position: 'absolute',
                      top: -8,
                      right: -8,
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      border: 'none',
                      background: '#ef4444',
                      color: 'white',
                      cursor: 'pointer',
                    }}
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() =>
                    fileRef.current?.click()
                  }
                  className="modern-button"
                  style={{
                    background:
                      'rgba(255,255,255,.06)',
                    border:
                      '1px dashed rgba(255,255,255,.15)',
                    padding: '14px 18px',
                    borderRadius: 18,
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                  }}
                >
                  <Camera size={18} />
                  Adicionar foto
                </button>
              )}

              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                onChange={handlePhoto}
                style={{ display: 'none' }}
              />
            </div>

            {/* CATEGORIAS */}
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 10,
                marginBottom: 18,
              }}
            >
              {Object.entries(
                CATEGORY_CONFIG
              ).map(([value, cfg]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() =>
                    setForm({
                      ...form,
                      category: value,
                    })
                  }
                  style={{
                    background:
                      form.category === value
                        ? cfg.color
                        : 'rgba(255,255,255,.05)',
                    border: 'none',
                    padding: '10px 14px',
                    borderRadius: 16,
                    color: 'white',
                    cursor: 'pointer',
                    fontWeight: 700,
                  }}
                >
                  {cfg.icon} {cfg.label}
                </button>
              ))}
            </div>

            {/* URGENTE */}
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                marginBottom: 24,
                cursor: 'pointer',
              }}
            >
              <input
                type="checkbox"
                checked={form.is_urgent}
                onChange={(e) =>
                  setForm({
                    ...form,
                    is_urgent: e.target.checked,
                  })
                }
              />

              <span
                style={{
                  color: '#fb7185',
                  fontWeight: 700,
                }}
              >
                🚨 Pedido urgente
              </span>
            </label>

            <button
              type="submit"
              className="modern-button"
              style={{
                width: '100%',
                background:
                  'linear-gradient(135deg,#8b5cf6,#6d28d9)',
                border: 'none',
                padding: 16,
                borderRadius: 18,
                color: 'white',
                fontWeight: 900,
                fontSize: '1rem',
              }}
            >
              Enviar Pedido 🙏
            </button>
          </form>
        </div>
      )}

      {/* MURAL */}
      {tab === 'photos' && (
        <div
          style={{
            maxWidth: 760,
            margin: '0 auto',
            padding: '0 20px',
          }}
        >
          {photoWall.length === 0 ? (
            <div
              className="glass"
              style={{
                borderRadius: 24,
                padding: 40,
                textAlign: 'center',
              }}
            >
              <Image
                size={52}
                style={{
                  opacity: 0.4,
                  marginBottom: 16,
                }}
              />

              <p
                style={{
                  color: 'rgba(255,255,255,.6)',
                }}
              >
                Nenhuma foto ainda.
              </p>
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns:
                  'repeat(auto-fill,minmax(180px,1fr))',
                gap: 16,
              }}
            >
              {photoWall.map((p) => (
                <div
                  key={p.id}
                  className="glass"
                  style={{
                    borderRadius: 24,
                    overflow: 'hidden',
                  }}
                >
                  <img
                    src={p.photo}
                    alt=""
                    style={{
                      width: '100%',
                      height: 180,
                      objectFit: 'cover',
                    }}
                  />

                  <div style={{ padding: 16 }}>
                    <p
                      style={{
                        margin: '0 0 12px',
                        color:
                          'rgba(255,255,255,.7)',
                      }}
                    >
                      🙏 {p.prayers || 0} orações
                    </p>

                    <button
                      onClick={() =>
                        prayForPhoto(p.id)
                      }
                      className="modern-button"
                      style={{
                        width: '100%',
                        border: 'none',
                        padding: 12,
                        borderRadius: 14,
                        background:
                          'linear-gradient(135deg,#8b5cf6,#6d28d9)',
                        color: 'white',
                        fontWeight: 800,
                      }}
                    >
                      Orar 🙏
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* PEDIDOS */}
      {tab !== 'photos' && (
        <div
          style={{
            maxWidth: 760,
            margin: '0 auto',
            padding: '0 20px',
          }}
        >
          {loading ? (
            <div
              style={{
                textAlign: 'center',
                padding: 50,
                color:
                  'rgba(255,255,255,.5)',
              }}
            >
              Carregando...
            </div>
          ) : prayers.length === 0 ? (
            <div
              className="glass"
              style={{
                borderRadius: 24,
                padding: 40,
                textAlign: 'center',
              }}
            >
              <HandHeart
                size={52}
                style={{
                  opacity: 0.4,
                  marginBottom: 16,
                }}
              />

              <p
                style={{
                  color: 'rgba(255,255,255,.6)',
                }}
              >
                Nenhum pedido ainda.
              </p>
            </div>
          ) : (
            prayers.map((prayer) => (
              <div
                key={prayer.id}
                style={{ marginBottom: 18 }}
              >
                <PrayerCard
                  prayer={prayer}
                  onPray={handlePray}
                  user={
                    user || { id: 'visitor' }
                  }
                />
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}