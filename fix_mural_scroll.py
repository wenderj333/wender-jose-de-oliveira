with open(r'C:\Users\wender\Desktop\SIGO COM FE\SIGO COM FE LOCAL\sigo-com-fe\frontend\src\pages\MuralGrid.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

old_effect = """  useEffect(() => { fetchPosts(); }, [fetchPosts]);"""

new_effect = """  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  useEffect(() => {
    if (!loading && postIdFromUrl && posts.length > 0) {
      const el = document.getElementById('post-' + postIdFromUrl);
      if (el) {
        setTimeout(() => {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          el.style.outline = '3px solid #4a80d4';
          el.style.borderRadius = '16px';
          setTimeout(() => { el.style.outline = ''; }, 3000);
        }, 500);
      }
    }
  }, [loading, posts, postIdFromUrl]);"""

content = content.replace(old_effect, new_effect)

with open(r'C:\Users\wender\Desktop\SIGO COM FE\SIGO COM FE LOCAL\sigo-com-fe\frontend\src\pages\MuralGrid.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print('Scroll: ' + ('OK' if 'scrollIntoView' in content else 'FALHOU'))
