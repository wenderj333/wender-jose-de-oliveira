with open("src/pages/MuralGrid.jsx", "r", encoding="utf-8") as f:
    lines = f.readlines()

new_lines = []
for i, line in enumerate(lines):
    if i == 370 and line.strip() == "controls":
        continue
    new_lines.append(line)

with open("src/pages/MuralGrid.jsx", "w", encoding="utf-8") as f:
    f.writelines(new_lines)
print("Feito!")
