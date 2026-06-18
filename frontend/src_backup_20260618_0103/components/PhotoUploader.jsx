import React, { useState, useCallback } from "react";
import Cropper from "react-easy-crop";

export default function PhotoUploader({ token, onSuccess, onClose }) {
  const [imgSrc, setImgSrc] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedArea, setCroppedArea] = useState(null);
  const [caption, setCaption] = useState("");
  const [visibility, setVisibility] = useState("public");
  const [uploading, setUploading] = useState(false);

  const onFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setImgSrc(reader.result);
    reader.readAsDataURL(file);
  };

  const onCropComplete = useCallback((_, area) => setCroppedArea(area), []);

  const getCroppedImg = async () => {
    const image = new Image();
    image.src = imgSrc;
    await new Promise(r => image.onload = r);
    const canvas = document.createElement("canvas");
    canvas.width = croppedArea.width;
    canvas.height = croppedArea.height;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(image, croppedArea.x, croppedArea.y, croppedArea.width, croppedArea.height, 0, 0, croppedArea.width, croppedArea.height);
    return new Promise(r => canvas.toBlob(r, "image/jpeg", 0.92));
  };

  const handlePublish = async () => {
    if (!imgSrc || !croppedArea) return;
    setUploading(true);
    try {
      const blob = await getCroppedImg();
      const fd = new FormData();
      fd.append("file", blob, "photo.jpg");
      fd.append("upload_preset", "sigo_com_fe");
      const res = await fetch("https://api.cloudinary.com/v1_1/degxiuf43/image/upload", { method: "POST", body: fd });
      const data = await res.json();
      await fetch((import.meta.env.VITE_API_URL || "") + "/api/photos", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
        body: JSON.stringify({ url: data.secure_url, caption, visibility })
      });
      onSuccess({ id: Date.now(), url: data.secure_url, caption, visibility });
      onClose();
    } catch(e) { alert("Erro ao fazer upload"); }
    setUploading(false);
  };

  return (
    <div style={{position:"fixed",top:0,left:0,right:0,bottom:0,background:"rgba(0,0,0,0.85)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div style={{background:"white",borderRadius:16,padding:24,width:"90%",maxWidth:500,maxHeight:"90vh",overflowY:"auto"}}>
        <h3 style={{color:"#6C3FA0",marginTop:0}}>📸 Adicionar Foto</h3>
        {!imgSrc ? (
          <div>
            <input type="file" accept="image/*" onChange={onFileChange} style={{marginBottom:16}}/>
            <br/>
            <button onClick={onClose} style={{background:"#eee",border:"none",borderRadius:8,padding:"8px 16px",cursor:"pointer"}}>Cancelar</button>
          </div>
        ) : (
          <div>
            <div style={{position:"relative",width:"100%",height:300,background:"#333",borderRadius:12,overflow:"hidden",marginBottom:16}}>
              <Cropper image={imgSrc} crop={crop} zoom={zoom} aspect={1} onCropChange={setCrop} onZoomChange={setZoom} onCropComplete={onCropComplete}/>
            </div>
            <input type="range" min={1} max={3} step={0.1} value={zoom} onChange={e=>setZoom(Number(e.target.value))} style={{width:"100%",marginBottom:12}}/>
            <input placeholder="Legenda (opcional)" value={caption} onChange={e=>setCaption(e.target.value)} style={{width:"100%",padding:8,borderRadius:8,border:"1px solid #ddd",marginBottom:8,fontSize:13,boxSizing:"border-box"}}/>
            <select value={visibility} onChange={e=>setVisibility(e.target.value)} style={{width:"100%",padding:8,borderRadius:8,border:"1px solid #ddd",marginBottom:16,fontSize:13}}>
              <option value="public">🌎 Publico</option>
              <option value="friends">🤝 So irmaos</option>
              <option value="private">🔒 So eu</option>
            </select>
            <div style={{display:"flex",gap:8}}>
              <button onClick={onClose} style={{flex:1,background:"#eee",border:"none",borderRadius:8,padding:"10px",cursor:"pointer"}}>Cancelar</button>
              <button onClick={handlePublish} disabled={uploading} style={{flex:2,background:"#6C3FA0",color:"white",border:"none",borderRadius:8,padding:"10px",cursor:"pointer",fontWeight:"600"}}>{uploading?"A publicar...":"📤 Publicar Foto"}</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
