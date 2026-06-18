import json

# Ler perguntas do ficheiro json
with open(r"C:\Users\wender\Desktop\duelo-biblico\perguntas_duelo.json", "r", encoding="utf-8") as f:
    perguntas = json.load(f)

# Ler server.js
with open("server.js", "r", encoding="utf-8") as f:
    server = f.read()

# Converter perguntas para formato JS
def perguntas_to_js(lista):
    linhas = []
    for p in lista:
        q = p['q'].replace('"', '\\"')
        a = json.dumps(p['a'], ensure_ascii=False)
        c = p['c']
        linhas.append(f'    {{q:"{q}",a:{a},c:{c}}}')
    return ",\n".join(linhas)

# Substituir cada idioma
idiomas = ['pt', 'en', 'es', 'fr', 'de', 'ro']
for lang in idiomas:
    if lang not in perguntas:
        continue
    js_perguntas = perguntas_to_js(perguntas[lang])
    old_marker = f'  {lang}: ['
    # Encontrar o bloco do idioma
    start = server.find(f'  {lang}: [')
    if start == -1:
        print(f"SKIP: {lang} nao encontrado")
        continue
    # Encontrar o fim do array
    depth = 0
    i = start + len(f'  {lang}: [')
    while i < len(server):
        if server[i] == '[': depth += 1
        elif server[i] == ']':
            if depth == 0:
                end = i
                break
            depth -= 1
        i += 1
    old_block = server[start:end+1]
    new_block = f'  {lang}: [\n{js_perguntas}\n  ]'
    server = server.replace(old_block, new_block)
    print(f"OK: {lang} - {len(perguntas[lang])} perguntas")

with open("server.js", "w", encoding="utf-8") as f:
    f.write(server)
print("Concluido!")