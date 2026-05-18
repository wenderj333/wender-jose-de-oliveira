content = open("frontend/src/App.jsx", "rb").read().decode("utf-8")
lines = content.split("\n")
new_widget = """          {/* Prayers Widget */}
          <div className="modern-card widget-card">
            <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"0.95rem",fontWeight:700,color:"var(--text)",marginBottom:12,display:"flex",alignItems:"center",gap:7,borderBottom:"1px solid var(--border)",paddingBottom:10,cursor:"pointer"}} onClick={()=>navigate("/pedidos-ajuda")}>
              <Heart size={15} style={{color:"var(--gold)"}}/> {t("nav.prayers")}
            </div>
            {prayerRequests.length > 0 ? prayerRequests.map((req, i) => (
              <div key={req.id||i} style={{display:"flex",gap:9,padding:"8px 0",borderBottom:i<prayerRequests.length-1?"1px solid var(--border)":"none"}}>
                <div style={{width:30,height:30,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",background:"linear-gradient(135deg,#4a80d4,#6a9ade)",flexShrink:0}}>??</div>
                <div>
                  <p style={{fontSize:"0.76rem",color:"var(--text)",lineHeight:1.4}}><b style={{color:"var(--fb)"}}>{req.author_name||req.full_name||"Membro"}</b> {(req.content||"").substring(0,40)}</p>
                  <button onClick={()=>navigate("/pedidos-ajuda")} style={{marginTop:4,padding:"3px 10px",borderRadius:10,fontSize:"0.66rem",fontWeight:600,border:"1px solid #e8c04060",background:"#fffbec",color:"#a07820",cursor:"pointer"}}>{t("mural.pray")}</button>
                </div>
              </div>
            )) : (
              <p style={{fontSize:"0.76rem",color:"var(--muted)",textAlign:"center",padding:"8px 0",cursor:"pointer"}} onClick={()=>navigate("/pedidos-ajuda")}>Ver pedidos de ora??o ??</p>
            )}
          </div>"""

new_lines = []
skip = False
for i, line in enumerate(lines):
    if "Prayers Widget" in line and "/*" in line:
        skip = True
        new_lines.append(new_widget)
    elif skip and "</div>" in line:
        count = new_lines[-20:].count("</div>") if new_lines else 0
        if line.strip() == "</div>" and i+1 < len(lines) and "Events Widget" in lines[i+1]:
            skip = False
    if not skip:
        new_lines.append(line)

open("frontend/src/App.jsx", "wb").write("\n".join(new_lines).encode("utf-8"))
print("Feito!")
