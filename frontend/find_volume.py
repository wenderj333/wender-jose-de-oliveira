with open("src/pages/MuralGrid.jsx", "r", encoding="utf-8") as f:
    content = f.read()

for i, line in enumerate(content.split("\n")):
    if "VolumeX" in line or "Volume2" in line or "toggleMute" in line:
        print(f"Linha {i}: {repr(line.strip()[:100])}")
