with open(r'C:\Users\wender\Desktop\SIGO COM FE\SIGO COM FE LOCAL\sigo-com-fe\frontend\src\pages\MuralGrid.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

old_pc = """              onVideoPlay={handleVideoPlay}
              onVideoPause={handleVideoPause}
            />"""

new_pc = """              onVideoPlay={handleVideoPlay}
              onVideoPause={handleVideoPause}
              postId={post.id}
            />"""

content = content.replace(old_pc, new_pc, 1)

# Adicionar id no PostCard
old_postcard_div = """function PostCard({ post, onLike, onDelete, token, user, isPlaying, onVideoPlay, onVideoPause }) {"""
new_postcard_div = """function PostCard({ post, onLike, onDelete, token, user, isPlaying, onVideoPlay, onVideoPause, postId }) {"""
content = content.replace(old_postcard_div, new_postcard_div)

# Adicionar id na div principal do PostCard
old_card_div = """  return (
    <div style={{ background: 'white', borderRadius: 16, border: '1px solid #f0f0f0', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>"""
new_card_div = """  return (
    <div id={postId ? 'post-' + postId : undefined} style={{ background: 'white', borderRadius: 16, border: '1px solid #f0f0f0', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>"""
content = content.replace(old_card_div, new_card_div)

with open(r'C:\Users\wender\Desktop\SIGO COM FE\SIGO COM FE LOCAL\sigo-com-fe\frontend\src\pages\MuralGrid.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print('ID no PostCard: ' + ('OK' if "id={postId ? 'post-'" in content else 'FALHOU'))
