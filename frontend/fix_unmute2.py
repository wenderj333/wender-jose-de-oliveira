with open("src/pages/MuralGrid.jsx", "r", encoding="utf-8") as f:
    content = f.read()

old = """  const toggleMute = () => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    if (videoRef.current) {
      const currentTime = videoRef.current.currentTime;
      videoRef.current.muted = newMuted;
      videoRef.current.volume = newMuted ? 0 : 1.0;
      if (!newMuted) {
        videoRef.current.pause();
        videoRef.current.muted = false;
        videoRef.current.volume = 1.0;
        videoRef.current.currentTime = currentTime;
        videoRef.current.play().catch(() => {});
      }
    }
  };"""

new = """  const toggleMute = () => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    if (videoRef.current) {
      videoRef.current.muted = newMuted;
      videoRef.current.volume = newMuted ? 0 : 1.0;
    }
    // Ativar som em todos os videos da pagina
    document.querySelectorAll("video").forEach(v => {
      v.muted = newMuted;
      v.volume = newMuted ? 0 : 1.0;
    });
  };"""

content = content.replace(old, new)
with open("src/pages/MuralGrid.jsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Feito!")
