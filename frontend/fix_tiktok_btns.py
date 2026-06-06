with open("src/pages/MuralGrid.jsx", "r", encoding="utf-8") as f:
    content = f.read()

# Adicionar botoes TikTok dentro do video
old = """          </button>
        </div>
      )}
      {isImage &&"""

new = """          </button>
          <div style={{ position: 'absolute', right: 10, bottom: 60, display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center', zIndex: 10 }}>
            <button onClick={() => onLike(post.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: post.liked ? '#e11d48' : 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
              <Heart size={28} fill={post.liked ? '#e11d48' : 'none'} />
              <span style={{ fontSize: 11, color: 'white', fontWeight: 700 }}>{post.like_count || 0}</span>
            </button>
            <button onClick={() => { if (!showComments) loadComments(); setShowComments(!showComments); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
              <MessageCircle size={28} />
              <span style={{ fontSize: 11, color: 'white', fontWeight: 700 }}>{post.comment_count || 0}</span>
            </button>
            <button onClick={() => { const url = window.location.origin + '/mural?post=' + post.id; if (navigator.share) navigator.share({ title: 'Sigo com Fe', text: post.content, url }); else navigator.clipboard.writeText(url); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
              <Share2 size={28} />
              <span style={{ fontSize: 11, color: 'white', fontWeight: 700 }}>{t('common.share')}</span>
            </button>
            {isOwner && <button onClick={() => onDelete(post.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
              <Trash2 size={28} />
              <span style={{ fontSize: 11, color: 'white', fontWeight: 700 }}>Apagar</span>
            </button>}
          </div>
        </div>
      )}
      {isImage &&"""

content = content.replace(old, new)
with open("src/pages/MuralGrid.jsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Feito!")
