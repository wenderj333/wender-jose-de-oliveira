content = open("frontend/src/pages/Members.jsx", "rb").read().decode("utf-8")

old = """              {/* Avatar */}
              <div style={{
                width:""" + chr(39) + """72px""" + chr(39) + """, height:""" + chr(39) + """72px""" + chr(39) + """, borderRadius:""" + chr(39) + """50%""" + chr(39) + """,
                overflow:""" + chr(39) + """hidden""" + chr(39) + """,
                border:""" + chr(39) + """3px solid transparent""" + chr(39) + """, background:""" + chr(39) + """linear-gradient(white,white) padding-box, linear-gradient(135deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888) border-box""" + chr(39) + """,
                boxShadow:""" + chr(39) + """0 0 0 3px #e8e6ff""" + chr(39) + """
              }}>"""

new = """              {/* Avatar */}
              <div style={{position:""" + chr(39) + """relative""" + chr(39) + """,display:""" + chr(39) + """inline-block""" + chr(39) + """}}>
              {user.last_seen_at && (new Date()-new Date(user.last_seen_at))<5*60*1000 && <div style={{position:""" + chr(39) + """absolute""" + chr(39) + """,bottom:2,right:2,width:12,height:12,borderRadius:""" + chr(39) + """50%""" + chr(39) + """,background:""" + chr(39) + """#22c55e""" + chr(39) + """,border:""" + chr(39) + """2px solid white""" + chr(39) + """,zIndex:2}}/>}
              <div style={{
                width:""" + chr(39) + """72px""" + chr(39) + """, height:""" + chr(39) + """72px""" + chr(39) + """, borderRadius:""" + chr(39) + """50%""" + chr(39) + """,
                overflow:""" + chr(39) + """hidden""" + chr(39) + """,
                border:""" + chr(39) + """3px solid transparent""" + chr(39) + """, background:""" + chr(39) + """linear-gradient(white,white) padding-box, linear-gradient(135deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888) border-box""" + chr(39) + """,
                boxShadow:""" + chr(39) + """0 0 0 3px #e8e6ff""" + chr(39) + """
              }}>"""

if old in content:
    content = content.replace(old, new)
    # Fechar a div extra antes do Nome
    content = content.replace("              {/* Nome */}", "              </div>\n              {/* Nome */}")
    open("frontend/src/pages/Members.jsx", "wb").write(content.encode("utf-8"))
    print("Feito!")
else:
    print("Nao encontrado")

