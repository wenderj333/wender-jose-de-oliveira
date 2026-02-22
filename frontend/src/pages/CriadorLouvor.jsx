TypeScript


{error && error !== 'no_credits' && (
            <div style={{ background: '#fee', borderRadius: 10, padding: '0.6rem', marginBottom: '0.75rem', color: '#c0392b', fontSize: '0.85rem' }}>
              ❌ {error}
            </div>
          )}
          {error === 'no_credits' && (
            <div style={{
              background: 'linear-gradient(135deg, #fff5e0, #fff0d0)', borderRadius: 12, padding: '1rem',
              marginBottom: '0.75rem', textAlign: 'center', border: '2px solid #daa520',
            }}>
              <div style={{ fontSize: '1.5rem', marginBottom: 4 }}>🎵</div>
              <div style={{ fontWeight: 700, color: '#1a0a3e', fontSize: '0.95rem' }}>Seus créditos acabaram!</div>
              <div style={{ fontSize: '0.82rem', color: '#666', margin: '4px 0 8px' }}>Adquira o pacote de 250 músicas por apenas €5</div>
              <button onClick={() => alert('💳 Integração de pagamento em breve!')} style={{
                padding: '0.5rem 1.5rem', borderRadius: 12, border: 'none',
                background: 'linear-gradient(135deg, #daa520, #f4c542)', color: '#1a0a3e',
                fontWeight: 700, cursor: 'pointer',
              }}>Comprar €5 — 250 músicas</button>
            </div>
          )}

          {/* Generate button (Gemini) */}
          <button onClick={handleGenerate} disabled={generating || (credits !== null && credits <= 0) || showCustomLyricForm} // Desabilitar se formulário customizado estiver aberto
            style={{
              width: '100%', padding: '0.85rem', borderRadius: 14, border: 'none',
              background: generating ? '#ccc' : 'linear-gradient(135deg, #9b59b6, #667eea)',
              color: '#fff', fontWeight: 700, fontSize: '1rem', cursor: generating ? 'default' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              boxShadow: generating ? 'none' : '0 4px 15px rgba(155,89,182,0.3)',
            }}>
            {generating ? (
              <>
                <div style={{ width: 20, height: 20, border: '3px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                Criando louvor... pode demorar até 30s
              </>
            ) : (
              <><Sparkles size={20} /> Gerar Louvor com IA</> // Texto atualizado
            )}
          </button>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

          {/* Botão Adicionar Minha Letra */}
          <button onClick={() => setShowCustomLyricForm(prev => !prev)}
            style={{
              width: '100%', padding: '0.85rem', borderRadius: 14, border: '1px solid #9b59b6',
              background: showCustomLyricForm ? '#e8f0ff' : '#fff', color: '#9b59b6',
              fontWeight: 700, fontSize: '1rem', cursor: 'pointer', marginTop: '0.75rem',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}>
            <Music size={20} /> {showCustomLyricForm ? 'Esconder Formulário' : 'Adicionar Minha Letra'}
          </button>

          {/* Formulário Adicionar Minha Letra */}
JSON


{showCustomLyricForm &&
JavaScript


(
            <div style={{
              marginTop: '1rem', background: '#f8f8f8', borderRadius: 16, padding: '1rem',
              border: '1px solid #ddd', boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            }}>
              <h3 style={{ margin: '0 0 1rem', fontSize: '1.1rem', color: '#1a0a3e' }}>✍️ Minha Letra</h3>
              
              <label style={{ fontWeight: 700, fontSize: '0.85rem', color: '#1a0a3e', display: 'block', marginBottom: 6 }}>
                🎵 Título da Música
              </label>
              <input value={customTitle} onChange={e => setCustomTitle(e.target.value)}
                placeholder='Ex: "A Graça que me Alcançou"'
                style={{
                  width: '100%', padding: '0.6rem', borderRadius: 10, border: '1px solid #ddd',
                  fontSize: '0.85rem', marginBottom: '0.75rem', boxSizing: 'border-box',
                }} />

              <label style={{ fontWeight: 700, fontSize: '0.85rem', color: '#1a0a3e', display: 'block', marginBottom: 6 }}>
                📝 Letra Completa
              </label>
              <textarea value={customLyrics} onChange={e => setCustomLyrics(e.target.value)}
                placeholder='Escreva sua letra aqui (Verso, Coro, Ponte, etc.)'
                rows={10}
                style={{
                  width: '100%', padding: '0.6rem', borderRadius: 10, border: '1px solid #ddd',
                  fontSize: '0.85rem', marginBottom: '0.75rem', boxSizing: 'border-box',
                  resize: 'vertical',
                }} />
              
              {/* Theme (reusing THEMES constant) */}
              <label style={{ fontWeight: 700, fontSize: '0.85rem', color: '#1a0a3e', display: 'block', marginBottom: 6 }}>
                🎯 Tema (opcional)
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: '1rem' }}>
                {THEMES.map(th => (
                  <button key={`custom-theme-${th.value}`} onClick={() => setCustomTheme(th.value)} style={{
                    padding: '5px 12px', borderRadius: 16, border: 'none', cursor: 'pointer', fontSize: '0.78rem',
                    background: customTheme === th.value ? th.color + '25' : '#f5f5f5',
                    color: customTheme === th.value ? th.color : '#666',
                    fontWeight: customTheme === th.value ? 700 : 400,
                    boxShadow: customTheme === th.value ? `0 2px 8px ${th.color}30` : 'none',
                  }}>{th.label}</button>
                ))}
              </div>

              {/* Style (reusing STYLES constant) */}
              <label style={{ fontWeight: 700, fontSize: '0.85rem', color: '#1a0a3e', display: 'block', marginBottom: 6 }}>
                🎵 Estilo Musical (opcional)
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: '1rem' }}>
                {STYLES.map(s => (
                  <button key={`custom-style-${s.value}`} onClick={() => setCustomStyle(s.value)} style={{
                    padding: '5px 12px', borderRadius: 16, border: 'none', cursor: 'pointer', fontSize: '0.78rem',
                    background: customStyle === s.value ? '#9b59b622' : '#f5f5f5',
                    color: customStyle === s.value ? '#9b59b6' : '#666',
                    fontWeight: customStyle === s.value ? 700 : 400,
                  }}>{s.label}</button>
                ))}
              </div>

              {/* Botão Salvar Letra */}
              <button onClick={handleSaveCustomLyric} disabled={savingCustomLyric}
                style={{
                  width: '100%', padding: '0.85rem', borderRadius: 14, border: 'none',
                  background: savingCustomLyric ? '#ccc' : 'linear-gradient(135deg, #28a745, #218838)',
                  color: '#fff', fontWeight: 700, fontSize: '1rem', cursor: savingCustomLyric ? 'default' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyCont
JavaScript


ent: 'center', gap: 8,
                  boxShadow: savingCustomLyric ? 'none' : '0 4px 15px rgba(40,167,69,0.3)',
                  marginTop: '0.75rem',
                }}>
                {savingCustomLyric ? (
                  <div style={{ width: 20, height: 20, border: '3px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                ) : (
                  <Heart size={20} />
                )}
                {savingCustomLyric ? 'Salvando...' : 'Salvar Minha Letra'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* MY SONGS TAB */}
JavaScript


{tab === 'songs' &&
JavaScript


(
        <div>
          {mySongs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#999' }}>
              <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🎵</div>
              <p>Nenhuma música criada ainda.</p>
              <button onClick={() => setTab('create')} style={{
                padding: '0.6rem 1.5rem', borderRadius: 12, border: 'none',
                background: '#9b59b6', color: '#fff', fontWeight: 600, cursor: 'pointer',
              }}>Criar primeira música</button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {mySongs.map(song => (
                <div key={song.id} style={{
                  background: '#fff', borderRadius: 14, border: '1px solid #eee',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.06)', overflow: 'hidden',
                }}>
                  <div onClick={() => setExpandedSong(expandedSong === song.id ? null : song.id)}
                    style={{
                      padding: '0.8rem 1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10,
                    }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: 10,
                      background: 'linear-gradient(135deg, #9b59b6, #667eea)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}>
                      <Music size={20} color="#fff" />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#1a0a3e' }}>{song.title || 'Louvor sem título'}</div>
                      <div style={{ fontSize: '0.72rem', color: '#999' }}>
                        {song.theme && <span style={{ marginRight: 8 }}>🎯 {song.theme}</span>}
                        {song.style && <span style={{ marginRight: 8 }}>🎵 {song.style}</span>}
                        {new Date(song.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <ChevronDown size={18} color="#999" style={{ transform: expandedSong === song.id ? 'rotate(180deg)' : 'none', transition: '0.2s' }} />
                  </div>
                  {expandedSong === song.id && (
                    <div style={{ padding: '0 1rem 1rem', borderTop: '1px solid #f0f0f0' }}>
                      <pre style={{
                        whiteWhiteSpace: 'pre-wrap', wordBreak: 'break-word', fontFamily: 'inherit',
                        fontSize: '0.85rem', lineHeight: 1.6, color: '#333', margin: '0.75rem 0',
                        maxHeight: 400, overflowY: 'auto',
                      }}>{song.lyrics}</pre>

                      {song.audio_url ? (
                        <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                          <audio controls src={song.audio_url} style={{ width: '100%', borderRadius: 10 }} />
                          <p style={{ fontSize: '0.75rem', color: '#666', marginTop: '0.5rem' }}>Música gerada</p>
                        </div>
                      ) : (
                        <button onClick={() => handleGenerateAudio(song)} disabled={generatingAudioForSongId === song.id}
                          style={{
                            width: '100%', padding: '0.5rem', borderRadius: 10, border: 'none',
                            background: generatingAudioForSongId === song.id ? '#ccc' : 'linear-gradient(135deg, #2ecc71, #27ae60)',
                            color: '#fff', fontWeight: 600, fontSize: '0.8rem', cursor: generatingAudioForSongId === song.id ? 'default' : 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
                            marginTop: '0.75rem',
                          }}>
                          {generatingAudioForSongId === song.id ?
JavaScript


(
                            <div style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                          ) : (
                            <Music size={14} />
                          )}
                          {generatingAudioForSongId === song.id ? 'Gerando...' : 'Gerar Música'}
                        </button>
                      )}
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button onClick={() => handleShare(song)} style={{
                          flex: 1, padding: '0.5rem', borderRadius: 10, border: '1px solid #9b59b6',
                          background: '#fff', color: '#9b59b6', cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
                        }}><Share2 size={14} /> Compartilhar</button>
                        <button onClick={() => handleDownload(song)} style={{
                          flex: 1, padding: '0.5rem', borderRadius: 10, border: '1px solid #667eea',
                          background: '#fff', color: '#667eea', cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
                        }}><Download size={14} /> Download</button>
                        <button onClick={() => handleDelete(song.id)} style={{
                          padding: '0.5rem 0.8rem', borderRadius: 10, border: '1px solid #e74c3c',
                          background: '#fff', color: '#e74c3c', cursor: 'pointer', fontSize: '0.8rem',
                        }}><Trash2 size={14} /></button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Stats */}
      <div style={{
        marginTop: '1rem', background: 'linear-gradient(135deg, #f8f0ff, #f0e8ff)',
        borderRadius: 14, padding: '0.8rem 1rem', textAlign: 'center',
        fontSize: '0.8rem', color: '#666',
      }}>
        🎵 Total de músicas criadas: <strong style={{ color: '#9b59b6' }}>{totalGenerated}</strong>
        {credits !== null && credits > 0 && (
          <span> · Créditos: <strong style={{ color: '#daa520' }}>{credits}</strong></span>
        )}
      </div>
    </div>
  );
}
