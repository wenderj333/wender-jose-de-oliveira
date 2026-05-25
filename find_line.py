content = open("frontend/src/pages/MuralGrid.jsx", "rb").read().decode("utf-8")
lines = content.split("\r\n")
for i, line in enumerate(lines):
    if "{authorInitials}" in line:
        print(f"Linha {i}: {repr(line)}")
        print(f"Linha {i-1}: {repr(lines[i-1])}")
        print(f"Linha {i+1}: {repr(lines[i+1])}")
