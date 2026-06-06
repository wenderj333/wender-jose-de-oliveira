with open("src/pages/MuralGrid.jsx", "r", encoding="utf-8") as f:
    content = f.read()

old = """  const toggleMute = () => {
    setIsMuted(prev => !prev);
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      // If unmuting and there's music, set video volume to 0.3
      // Otherwise, set to 1.0 (full volume)
      if (!isMuted) { // if it was muted and now unmuting
          videoRef.current.volume = musicUrl ? 0.3 : 1.0;
      } else { // if it was unmuted and now muting
          videoRef.current.volume = 0;
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
  };"""

content = content.replace(old, new)
with open("src/pages/MuralGrid.jsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Feito!")
