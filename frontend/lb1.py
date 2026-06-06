with open('src/pages/Profile.jsx', 'r', encoding='utf-8') as f:
    c = f.read()
c = c.replace(
    "  const photoInputRef = React.useRef(null);",
    "  const photoInputRef = React.useRef(null);\n  const [selPhoto, setSelPhoto] = useState(null);"
)
c = c.replace(
    'alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>',
    'alt="" style={{width:"100%",height:"100%",objectFit:"cover",cursor:"pointer"}} onClick={()=>setSelPhoto(p.url)}/>'
)
with open('src/pages/Profile.jsx', 'w', encoding='utf-8') as f:
    f.write(c)
print('OK1')
