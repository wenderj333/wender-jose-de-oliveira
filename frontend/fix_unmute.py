with open("src/pages/MuralGrid.jsx", "r", encoding="utf-8") as f:
    content = f.read()

old = """  const toggleMute = () => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    if (videoRef.current) {
      videoRef.current.muted = newMuted;
      videoRef.current.volume = newMuted ? 0 : 1.0;
    }
  };"""

new = """  const toggleMute = () => {
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

content = content.replace(old, new)
with open("src/pages/MuralGrid.jsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Feito!")
