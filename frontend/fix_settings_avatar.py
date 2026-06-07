with open('src/pages/Settings.jsx', 'r', encoding='utf-8') as f:
    c = f.read()

# Adicionar estado e funcao de upload
c = c.replace(
    '  const [msg, setMsg] = useState("");',
    '''  const [msg, setMsg] = useState("");
  const [avatar, setAvatar] = useState(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const avatarInputRef = React.useRef(null);
  const uploadAvatar = async (file) => {
    if (!file) return;
    setUploadingAvatar(true);
    try {
      const fd = new FormData();
      fd.append("file", file); fd.append("upload_preset", "sigo_com_fe");
      const res = await fetch("https://api.cloudinary.com/v1_1/degxiuf43/image/upload", { method: "POST", body: fd });
      const data = await res.json();
      const url = data.secure_url;
      const token = localStorage.getItem("token");
      await fetch("https://sigo-com-fe-api.onrender.com/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
        body: JSON.stringify({ avatar_url: url })
      });
      setAvatar(url);
      setMsg("Foto atualizada!");
    } catch(e) { setMsg("Erro ao atualizar foto"); }
    setUploadingAvatar(false);
  };'''
)

# Adicionar secao de avatar antes do formulario
c = c.replace(
    '      <div style={sectionStyle}>\n        <h3 style={{ color: "#4A2270"',
    '''      <div style={{...sectionStyle, textAlign:"center"}}>
        <h3 style={{ color: "#4A2270", marginTop: 0, marginBottom: "15px", fontSize: "16px", borderBottom: "1px solid #ddd" }}>📸 Foto de Perfil</h3>
        <img src={avatar || form.avatar_url || "/pro.jpg"} onError={e=>e.target.src="/pro.jpg"} style={{width:100,height:100,borderRadius:"50%",objectFit:"cover",border:"3px solid #6C3FA0",marginBottom:12}} />
        <br/>
        <input ref={avatarInputRef} type="file" accept="image/*" style={{display:"none"}} onChange={e=>uploadAvatar(e.target.files[0])} />
        <button onClick={()=>avatarInputRef.current?.click()} disabled={uploadingAvatar} style={{background:"#6C3FA0",color:"white",border:"none",borderRadius:8,padding:"8px 16px",cursor:"pointer",fontSize:13}}>
          {uploadingAvatar ? "A fazer upload..." : "Mudar Foto"}
        </button>
      </div>
      <div style={sectionStyle}>
        <h3 style={{ color: "#4A2270"'''
)

with open('src/pages/Settings.jsx', 'w', encoding='utf-8') as f:
    f.write(c)
print('Feito!')
