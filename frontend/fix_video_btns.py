with open("src/pages/MuralGrid.jsx", "r", encoding="utf-8") as f:
    lines = f.readlines()

new_lines = []
skip_next = 0
tiktok_count = 0

for i, line in enumerate(lines):
    # Contar divs tiktok
    if "position: 'absolute '" in line and "bottom: 60" in line:
        tiktok_count += 1
        if tiktok_count > 1:
            # Pular linha duplicada
            continue
    
    # Corrigir o </button> mal posicionado
    if line.strip() == "</button>" and i > 0:
        # Verificar se linha anterior eh o terceiro div tiktok
        prev = lines[i-1] if i > 0 else ""
        if "position: 'absolute '" in prev or (i > 1 and "position: 'absolute '" in lines[i-2]):
            # Substituir </button> por nada (ja fechado pelo div)
            continue
    
    # Adicionar </button> depois do icone de volume
    if "{isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}" in line:
        new_lines.append(line)
        new_lines.append("          </button>\n")
        continue
    
    new_lines.append(line)

with open("src/pages/MuralGrid.jsx", "w", encoding="utf-8") as f:
    f.writelines(new_lines)
print("Feito!")
