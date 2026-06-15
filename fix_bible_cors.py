with open(r'C:\Users\wender\Desktop\SIGO COM FE\SIGO COM FE LOCAL\sigo-com-fe\frontend\src\pages\BibleAI.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Usar sempre KJV que funciona com CORS
old_trans = """  const userLang = (navigator.language || 'pt').split('-')[0];
  const translation = LANG_TRANSLATION[userLang] || 'almeida';
  const booksLocal = LANG_BOOKS[userLang] || LANG_BOOKS.pt;"""

new_trans = """  const userLang = (navigator.language || 'pt').split('-')[0];
  const [translation, setTranslation] = useState('kjv');
  const [bibleLang, setBibleLang] = useState('en');
  const booksLocal = LANG_BOOKS[bibleLang] || LANG_BOOKS.en;"""

content = content.replace(old_trans, new_trans)

# Adicionar selector de traducao
old_header = """      <div style={{ background: "linear-gradient(135deg,#1a3a5c,#2d6a9f)", borderRadius: 16, padding: "20px 24px", marginBottom: 20, color: "white" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 32 }}>📖</span>
          <div>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>{t("bible.bibleStudy","Biblia de Estudo")}</h1>
            <p style={{ margin: "4px 0 0", fontSize: 13, opacity: 0.85 }}>Almeida Revista e Corrigida</p>
          </div>
        </div>
      </div>"""

new_header = """      <div style={{ background: "linear-gradient(135deg,#1a3a5c,#2d6a9f)", borderRadius: 16, padding: "20px 24px", marginBottom: 20, color: "white" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 32 }}>📖</span>
          <div style={{ flex: 1 }}>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>{t("bible.bibleStudy","Biblia de Estudo")}</h1>
            <p style={{ margin: "4px 0 0", fontSize: 13, opacity: 0.85 }}>Traducao: {translation.toUpperCase()}</p>
          </div>
          <select value={translation} onChange={e => { const t=e.target.value; setTranslation(t); setBibleLang(Object.keys(LANG_TRANSLATION).find(k=>LANG_TRANSLATION[k]===t)||'en'); setShowBooks(true); }} style={{ background: "rgba(255,255,255,0.2)", border: "1px solid rgba(255,255,255,0.4)", borderRadius: 8, padding: "6px 10px", color: "white", cursor: "pointer", fontSize: 13 }}>
            <option value="almeida" style={{color:"#333"}}>PT - Almeida</option>
            <option value="kjv" style={{color:"#333"}}>EN - KJV</option>
            <option value="rva" style={{color:"#333"}}>ES - RVA</option>
            <option value="luther1912" style={{color:"#333"}}>DE - Luther</option>
            <option value="martin" style={{color:"#333"}}>FR - Martin</option>
            <option value="cornilescu" style={{color:"#333"}}>RO - Cornilescu</option>
            <option value="synodal" style={{color:"#333"}}>RU - Sinodal</option>
          </select>
        </div>
      </div>"""

content = content.replace(old_header, new_header)

# Usar proxy para evitar CORS
old_api = '"https://bible-api.com/"'
new_api = '"https://api.allorigins.win/get?url="+encodeURIComponent("https://bible-api.com/"'
# Nao mudar a API, usar proxy diferente
# Usar fetch directo mas com modo no-cors nao funciona
# Melhor solucao: usar backend como proxy

with open(r'C:\Users\wender\Desktop\SIGO COM FE\SIGO COM FE LOCAL\sigo-com-fe\frontend\src\pages\BibleAI.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print('Selector: ' + ('OK' if 'setTranslation' in content else 'FALHOU'))
