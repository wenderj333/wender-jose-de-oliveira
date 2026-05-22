f = open("frontend/src/pages/LiveCommunity.jsx", "rb")
c = f.read().decode("utf-8")
f.close()

old = "  // Carregar playlist\r\n  useEffect(() => {\r\n    fetch(`${API_BASE}/api/live-community/playlist`)\r\n      .then(r => r.json())\r\n      .then(data => setSongs(data.songs || []))\r\n      .catch(() => {});\r\n  }, []);"

new = "  // Carregar playlist e autoplay\r\n  useEffect(() => {\r\n    fetch(`${API_BASE}/api/live-community/playlist`)\r\n      .then(r => r.json())\r\n      .then(data => {\r\n        const list = data.songs || [];\r\n        setSongs(list);\r\n        if (list.length > 0 && audioRef.current) {\r\n          audioRef.current.src = list[0].file_url;\r\n          audioRef.current.play()\r\n            .then(() => { setIsPlaying(true); setHasStarted(true); })\r\n            .catch(() => {});\r\n        }\r\n      })\r\n      .catch(() => {});\r\n  }, []);"

if old in c:
    c = c.replace(old, new)
    print("OK!")
else:
    print("NAO ENCONTRADO")
    idx = c.find("Carregar playlist")
    print(repr(c[idx:idx+200]))

open("frontend/src/pages/LiveCommunity.jsx", "wb").write(c.encode("utf-8"))
print("Feito!")
