with open("src/App.jsx", "r", encoding="utf-8") as f:
    c = f.read()

fixes = [
    ("Sigo com FÃ©", "Sigo com Fé"),
    ("IA BÃ­blica", "IA Bíblica"),
    ("IA BÃblica", "IA Bíblica"),
    ("NotificaÃ§Ãµes", "Notificações"),
    ("VOCÃŠ", "VOCÊ"),
    ("OraÃ§Ãµes", "Orações"),
    ("ReflexÃ£o", "Reflexão"),
    ("ConsagraÃ§Ã£o", "Consagração"),
    ("Â·", chr(0xB7)),
]

for bad, good in fixes:
    c = c.replace(bad, good)

# Emojis via chr
c = c.replace("ðŸ" + chr(0x201C) + chr(0x2013), chr(0x1F4D6))
c = c.replace("ðŸ" + chr(0x201C) + chr(0xB2), chr(0x1F4F2))

with open("src/App.jsx", "w", encoding="utf-8") as f:
    f.write(c)
print("OK")