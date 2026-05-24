content = open("frontend/src/pages/MuralGrid.jsx", "rb").read().decode("utf-8")
old = """            {musicUrl && !isImage && !isVideo && (
              <MiniAudioPlayer src={musicUrl} isPlaying={isMusicPlaying} onPlay={()=>setIsMusicPlaying(true)} onPause={()=>setIsMusicPlaying(false)} onEnded={()=>setIsMusicPlaying(false)} />
            )}"""
if old in content:
    content = content.replace(old, "")
    print("Removido OK")
else:
    print("Nao encontrado")
open("frontend/src/pages/MuralGrid.jsx", "wb").write(content.encode("utf-8"))
print("Feito!")
