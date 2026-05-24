content = open("frontend/src/pages/MuralGrid.jsx", "rb").read().decode("utf-8")
lines = content.split("\n")
new_lines = []
skip_count = 0
for i, line in enumerate(lines):
    if skip_count > 0:
        skip_count -= 1
        continue
    if "{musicUrl && !isImage && !isVideo && (" in line and "MiniAudioPlayer" not in line:
        skip_count = 2
        continue
    new_lines.append(line)
result = "\n".join(new_lines)
open("frontend/src/pages/MuralGrid.jsx", "wb").write(result.encode("utf-8"))
print("Feito!")
