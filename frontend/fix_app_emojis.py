with open("src/App.jsx", "r", encoding="utf-8-sig") as f:
    c = f.read()

fixes = [
    ("ðŸ"´", chr(0x1F534)),
    ("ðŸ"¸", chr(0x1F4F8)),
    ("ðŸ"–", chr(0x1F4D6)),
    ("ðŸ™", chr(0x1F64F)),
    ("ðŸ"²", chr(0x1F4F2)),
    ("ðŸ•Š", chr(0x1F54A)),
    ("ï¸", ""),
]

for bad, good in fixes:
    c = c.replace(bad, good)

with open("src/App.jsx", "w", encoding="utf-8") as f:
    f.write(c)
print("OK")