with open("src/pages/MuralGrid.jsx", "r", encoding="utf-8") as f:
    lines = f.readlines()

new_lines = []
for i, line in enumerate(lines):
    if i == 370 and "controls" in line:
        # Manter controls mas adicionar autoPlay e intersection observer via onLoadedData
        new_lines.append(line)
        continue
    if "onPause={handleInternalVideoPause}" in line and i > 360 and i < 410:
        new_lines.append(line)
        new_lines.append("            onLoadedData={(e) => { const obs = new IntersectionObserver(([entry]) => { if(entry.isIntersecting){ e.target.play().catch(()=>{}); } else { e.target.pause(); } }, {threshold:0.5}); obs.observe(e.target); }}\n")
        continue
    new_lines.append(line)

with open("src/pages/MuralGrid.jsx", "w", encoding="utf-8") as f:
    f.writelines(new_lines)
print("Feito!")
