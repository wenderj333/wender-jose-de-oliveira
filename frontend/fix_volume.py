with open("src/pages/MuralGrid.jsx", "r", encoding="utf-8") as f:
    content = f.read()

# Encontrar e remover divs duplicados
tiktok_div = '<div style={{ position: \'absolute \', right: 10, bottom: 60, display: \'flex \', flexDirection: \'column \''

count = content.count(tiktok_div)
print(f"Encontrado {count} vezes")

# Manter apenas a primeira ocorrencia
if count > 1:
    first = content.find(tiktok_div)
    second = content.find(tiktok_div, first + 1)
    third = content.find(tiktok_div, second + 1)
    
    # Remover segunda e terceira ocorrencias
    # Encontrar fim de cada div (</div>)
    end2 = content.find("</div>", second) + 6
    end3 = content.find("</div>", third) + 6
    
    # Remover terceira primeiro (para nao afetar indices)
    content = content[:third] + content[end3:]
    
    # Recalcular segunda posicao
    second = content.find(tiktok_div, first + 1)
    end2 = content.find("</div>", second) + 6
    content = content[:second] + content[end2:]
    
    print("Duplicados removidos!")

# Fechar botao de som corretamente  
content = content.replace(
    "{isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}\n          <div",
    "{isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}\n          </button>\n          <div"
)
content = content.replace(
    "          </button>\n        </div>",
    "        </div>"
)

with open("src/pages/MuralGrid.jsx", "w", encoding="utf-8") as f:
    f.write(content)
print("Feito!")
