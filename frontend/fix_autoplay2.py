with open("src/pages/MuralGrid.jsx", "r", encoding="utf-8") as f:
    lines = f.readlines()

new_lines = []
for i, line in enumerate(lines):
    # Adicionar onClick no video para toggle som
    if "ref={videoRef}" in line and i > 360 and i < 400:
        new_lines.append(line)
        new_lines.append("            onClick={() => { if(videoRef.current) { videoRef.current.muted = !videoRef.current.muted; } }}\n")
        continue
    # Adicionar autoPlay no video
    if "playsInline" in line and i > 360 and i < 400:
        new_lines.append("            autoPlay\n")
        new_lines.append(line)
        continue
    new_lines.append(line)

with open("src/pages/MuralGrid.jsx", "w", encoding="utf-8") as f:
    f.writelines(new_lines)
print("Feito!")
