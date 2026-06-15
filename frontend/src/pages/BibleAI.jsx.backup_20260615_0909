import React, { useState } from "react";
import { useTranslation } from "react-i18next";

const BOOKS = ["Genesis","Exodus","Leviticus","Numbers","Deuteronomy","Joshua","Judges","Ruth","1 Samuel","2 Samuel","1 Kings","2 Kings","1 Chronicles","2 Chronicles","Ezra","Nehemiah","Esther","Job","Psalms","Proverbs","Ecclesiastes","Song of Solomon","Isaiah","Jeremiah","Lamentations","Ezekiel","Daniel","Hosea","Joel","Amos","Obadiah","Jonah","Micah","Nahum","Habakkuk","Zephaniah","Haggai","Zechariah","Malachi","Matthew","Mark","Luke","John","Acts","Romans","1 Corinthians","2 Corinthians","Galatians","Ephesians","Philippians","Colossians","1 Thessalonians","2 Thessalonians","1 Timothy","2 Timothy","Titus","Philemon","Hebrews","James","1 Peter","2 Peter","1 John","2 John","3 John","Jude","Revelation"];
const BOOKS_PT = ["Genesis","Exodo","Levitico","Numeros","Deuteronomio","Josue","Juizes","Rute","1 Samuel","2 Samuel","1 Reis","2 Reis","1 Cronicas","2 Cronicas","Esdras","Neemias","Ester","Jo","Salmos","Proverbios","Eclesiastes","Cantares","Isaias","Jeremias","Lamentacoes","Ezequiel","Daniel","Oseias","Joel","Amos","Obadias","Jonas","Miqueas","Naum","Habacuque","Sofonias","Ageu","Zacarias","Malaquias","Mateus","Marcos","Lucas","Joao","Atos","Romanos","1 Corintios","2 Corintios","Galatas","Efesios","Filipenses","Colossenses","1 Tessalonicenses","2 Tessalonicenses","1 Timoteo","2 Timoteo","Tito","Filemon","Hebreus","Tiago","1 Pedro","2 Pedro","1 Joao","2 Joao","3 Joao","Judas","Apocalipse"];

export default function BibleStudy() {
  const { t } = useTranslation();
  const [tab, setTab] = useState("read");
  const [selectedBook, setSelectedBook] = useState(null);
  const [selectedBookPt, setSelectedBookPt] = useState(null);
  const [chapter, setChapter] = useState(1);
  const [verses, setVerses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState(null);
  const [favorites, setFavorites] = useState(() => JSON.parse(localStorage.getItem("bible_favs") || "[]"));
  const [showBooks, setShowBooks] = useState(true);

  const saveFavs = (f) => { setFavorites(f); localStorage.setItem("bible_favs", JSON.stringify(f)); };
  const isFav = (v) => favorites.some(f => f.key === v.book_name+v.chapter+":"+v.verse);
  const toggleFav = (v) => {
    const key = v.book_name+v.chapter+":"+v.verse;
    if (isFav(v)) saveFavs(favorites.filter(f => f.key !== key));
    else saveFavs([...favorites, { key, text: v.text, ref: v.book_name+" "+v.chapter+":"+v.verse }]);
  };

  const loadChapter = async (book, bookPt, ch) => {
    setLoading(true); setVerses([]);
    try {
      const res = await fetch("https://bible-api.com/"+encodeURIComponent(book)+"+"+ch+"?translation=almeida");
      const data = await res.json();
      setVerses(data.verses || []); setChapter(ch); setShowBooks(false);
      setSelectedBook(book); setSelectedBookPt(bookPt);
    } catch(e) {}
    setLoading(false);
  };

  const doSearch = async () => {
    if (!search.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("https://bible-api.com/"+encodeURIComponent(search)+"?translation=almeida");
      const data = await res.json();
      setSearchResults(data);
    } catch(e) {}
    setLoading(false);
  };

  const VerseRow = ({ v }) => (
    <div style={{ padding: "10px 0", borderBottom: "1px solid #f0f0f0", display: "flex", gap: 10 }}>
      <span style={{ color: "#2d6a9f", fontWeight: 700, fontSize: 12, minWidth: 24, marginTop: 2 }}>{v.verse}</span>
      <p style={{ margin: 0, fontSize: 15, lineHeight: 1.7, color: "#333", flex: 1 }}>{v.text}</p>
      <button onClick={() => toggleFav(v)} style={{ background: "none", border: "none", cursor: "pointer", flexShrink: 0 }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill={isFav(v) ? "#e11d48" : "none"} stroke={isFav(v) ? "#e11d48" : "#ccc"} strokeWidth="2"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
      </button>
    </div>
  );

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: 16 }}>
      <div style={{ background: "linear-gradient(135deg,#1a3a5c,#2d6a9f)", borderRadius: 16, padding: "20px 24px", marginBottom: 20, color: "white" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 32 }}>📖</span>
          <div>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>{t("bible.bibleStudy","Biblia de Estudo")}</h1>
            <p style={{ margin: "4px 0 0", fontSize: 13, opacity: 0.85 }}>Almeida Revista e Corrigida</p>
          </div>
        </div>
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {[["read","📖 Ler"],["search","🔍 Buscar"],["favorites","❤️ Favoritos"]].map(([k,l]) => (
          <button key={k} onClick={() => setTab(k)} style={{ flex: 1, padding: "10px 8px", borderRadius: 12, border: "none", background: tab===k ? "linear-gradient(135deg,#1a3a5c,#2d6a9f)" : "#f0f4f8", color: tab===k ? "white" : "#555", fontWeight: 600, cursor: "pointer", fontSize: 13 }}>{l}</button>
        ))}
      </div>
      {tab === "read" && (
        showBooks ? (
          <div>
            <h3 style={{ color: "#1a3a5c", marginBottom: 12 }}>📚 {t("bible.books","Livros")}</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 6 }}>
              {BOOKS_PT.map((b, i) => (
                <button key={b} onClick={() => loadChapter(BOOKS[i], b, 1)} style={{ padding: "10px 14px", borderRadius: 10, border: "1px solid #e2e8f0", background: "white", textAlign: "left", cursor: "pointer", fontSize: 13, fontWeight: 500, color: "#1a3a5c" }}>{b}</button>
              ))}
            </div>
          </div>
        ) : (
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
              <button onClick={() => setShowBooks(true)} style={{ background: "#f0f4f8", border: "none", borderRadius: 8, padding: "8px 12px", cursor: "pointer", fontWeight: 600, color: "#1a3a5c" }}>← Livros</button>
              <span style={{ fontWeight: 700, color: "#1a3a5c", fontSize: 16 }}>{selectedBookPt} {chapter}</span>
              <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
                <button onClick={() => chapter > 1 && loadChapter(selectedBook, selectedBookPt, chapter-1)} style={{ background: "#f0f4f8", border: "none", borderRadius: 8, padding: "8px 12px", cursor: "pointer" }}>◀</button>
                <button onClick={() => loadChapter(selectedBook, selectedBookPt, chapter+1)} style={{ background: "#f0f4f8", border: "none", borderRadius: 8, padding: "8px 12px", cursor: "pointer" }}>▶</button>
              </div>
            </div>
            {loading ? <div style={{ textAlign: "center", padding: 40 }}>A carregar...</div> : verses.map((v,i) => <VerseRow key={i} v={v} />)}
          </div>
        )
      )}
      {tab === "search" && (
        <div>
          <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
            <input value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key==="Enter" && doSearch()} placeholder="Ex: Joao 3:16 ou amor" style={{ flex: 1, padding: "12px 16px", borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 14, outline: "none" }} />
            <button onClick={doSearch} style={{ padding: "12px 20px", borderRadius: 12, background: "linear-gradient(135deg,#1a3a5c,#2d6a9f)", border: "none", color: "white", fontWeight: 700, cursor: "pointer" }}>🔍</button>
          </div>
          {loading && <div style={{ textAlign: "center", padding: 40 }}>A buscar...</div>}
          {searchResults && (
            <div>
              <p style={{ color: "#888", fontSize: 13, marginBottom: 12 }}>{searchResults.reference}</p>
              {(searchResults.verses||[]).map((v,i) => <VerseRow key={i} v={v} />)}
              {searchResults.text && !searchResults.verses && <p style={{ fontSize: 15, lineHeight: 1.7 }}>{searchResults.text}</p>}
            </div>
          )}
        </div>
      )}
      {tab === "favorites" && (
        <div>
          <h3 style={{ color: "#1a3a5c", marginBottom: 12 }}>❤️ {t("bible.favorites","Favoritos")} ({favorites.length})</h3>
          {favorites.length === 0 ? (
            <div style={{ textAlign: "center", padding: 40, color: "#888" }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>📖</div>
              <p>Adiciona versiculos clicando no coracao!</p>
            </div>
          ) : favorites.map((f,i) => (
            <div key={i} style={{ background: "white", borderRadius: 12, padding: 16, marginBottom: 10, border: "1px solid #e2e8f0" }}>
              <p style={{ fontWeight: 700, color: "#2d6a9f", fontSize: 13, margin: "0 0 6px" }}>{f.ref}</p>
              <p style={{ margin: 0, fontSize: 14, lineHeight: 1.7 }}>{f.text}</p>
              <button onClick={() => saveFavs(favorites.filter((_,j) => j!==i))} style={{ marginTop: 8, background: "none", border: "none", color: "#e11d48", cursor: "pointer", fontSize: 12 }}>Remover</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
