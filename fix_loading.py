with open(r'C:\Users\wender\Desktop\SIGO COM FE\SIGO COM FE LOCAL\sigo-com-fe\frontend\src\pages\MuralGrid.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

old_loading = """      {loading && <div style={{ textAlign: 'center', padding: 40, color: '#888' }}>{t('common.loading')}</div>}"""

new_loading = """      {loading && (
        <div style={{ textAlign: 'center', padding: 60 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🙏</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#7a9e7e', marginBottom: 8 }}>Sigo com Fe</div>
          <div style={{ fontSize: 14, color: '#888', marginBottom: 24 }}>{t('mural.loadingPosts','A carregar publicacoes...')}</div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
            {[0,1,2].map(i => (
              <div key={i} style={{ width: 10, height: 10, borderRadius: '50%', background: '#7a9e7e', animation: 'bounce 1s infinite', animationDelay: i*0.2+'s' }} />
            ))}
          </div>
          <style>{'@keyframes bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }'}</style>
        </div>
      )}"""

content = content.replace(old_loading, new_loading)

with open(r'C:\Users\wender\Desktop\SIGO COM FE\SIGO COM FE LOCAL\sigo-com-fe\frontend\src\pages\MuralGrid.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print('Loading: ' + ('OK' if 'bounce' in content else 'FALHOU'))
