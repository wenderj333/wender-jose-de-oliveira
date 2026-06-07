with open('src/App.jsx', 'r', encoding='utf-8') as f:
    c = f.read()
c = c.replace(
    'import Settings from "./pages/Settings";\n\nimport Settings from "./pages/Settings";',
    'import Settings from "./pages/Settings";'
)
with open('src/App.jsx', 'w', encoding='utf-8') as f:
    f.write(c)
print('OK!')
