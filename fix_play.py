f = open("frontend/src/pages/LiveCommunity.jsx", "rb")
c = f.read().decode("utf-8")
f.close()

old = "  const togglePlay = () => {\r\n    if (!audioRef.current) return;\r\n    if (!hasStarted) {\r\n      setHasStarted(true);\r\n    }\r\n    if (isPlaying) {\r\n      audioRef.current.pause();\r\n      setIsPlaying(false);\r\n    } else {\r\n      audioRef.current.play()\r\n        .then(() => setIsPlaying(true))\r\n        .catch((err) => {\r\n          console.error(" + chr(39) + "Play error:" + chr(39) + ", err);\r\n          setIsPlaying(false);\r\n        });\r\n    }\r\n  };"

new = "  const togglePlay = () => {\r\n    if (!audioRef.current) return;\r\n    if (!hasStarted) {\r\n      setHasStarted(true);\r\n      if (songs[currentSongIndex]?.file_url) {\r\n        audioRef.current.src = songs[currentSongIndex].file_url;\r\n      }\r\n    }\r\n    if (isPlaying) {\r\n      audioRef.current.pause();\r\n      setIsPlaying(false);\r\n    } else {\r\n      audioRef.current.load();\r\n      audioRef.current.play()\r\n        .then(() => setIsPlaying(true))\r\n        .catch((err) => {\r\n          console.error(" + chr(39) + "Play error:" + chr(39) + ", err);\r\n          setIsPlaying(false);\r\n        });\r\n    }\r\n  };"

if old in c:
    c = c.replace(old, new)
    print("OK!")
else:
    print("NAO ENCONTRADO")
    idx = c.find("togglePlay")
    print(repr(c[idx:idx+200]))

open("frontend/src/pages/LiveCommunity.jsx", "wb").write(c.encode("utf-8"))
print("Feito!")
