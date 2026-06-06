with open("src/pages/MuralGrid.jsx", "r", encoding="utf-8") as f:
    content = f.read()

old = "            onPause={handleInternalVideoPause}"
new = """            onPause={handleInternalVideoPause}
            muted={isMuted}
            onLoadedData={(e) => {
              const obs = new IntersectionObserver(([entry]) => {
                if (entry.isIntersecting) { e.target.play().catch(() => {}); }
                else { e.target.pause(); }
              }, { threshold: 0.5 });
              obs.observe(e.target);
            }}"""

content = content.replace(old, new, 1)
with open("src/pages/MuralGrid.jsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Feito!")
