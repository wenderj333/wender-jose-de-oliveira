with open("src/pages/MuralGrid.jsx", "r", encoding="utf-8") as f:
    content = f.read()

# Adicionar autoplay quando entra no ecra
old = '''            ref={videoRef}
            src={mediaUrl}
            controls
            playsInline
            muted={isMuted}'''

new = '''            ref={videoRef}
            src={mediaUrl}
            controls
            playsInline
            muted={isMuted}
            autoPlay={false}
            onLoadedData={(e) => {
              const observer = new IntersectionObserver(
                ([entry]) => {
                  if (entry.isIntersecting) {
                    e.target.play().catch(() => {});
                  } else {
                    e.target.pause();
                  }
                },
                { threshold: 0.6 }
              );
              observer.observe(e.target);
            }}'''

content = content.replace(old, new)

with open("src/pages/MuralGrid.jsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Feito!")
