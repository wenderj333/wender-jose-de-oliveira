import React, { useState, useCallback } from "react";
import Cropper from "react-easy-crop";

const CLOUDINARY_BASE = "https://api.cloudinary.com/v1_1/degxiuf43";

export default function PhotoUploader({ token, onSuccess, onClose }) {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [mediaType, setMediaType] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedArea, setCroppedArea] = useState(null);
  const [caption, setCaption] = useState("");
  const [visibility, setVisibility] = useState("public");
  const [publishToMural, setPublishToMural] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const onFileChange = (event) => {
    const selected = event.target.files?.[0];
    if (!selected) return;
    const type = selected.type.startsWith("video/") ? "video" : selected.type.startsWith("image/") ? "image" : null;
    if (!type) { setError("Escolhe uma foto ou um vídeo válido."); return; }
    if (selected.size > 50 * 1024 * 1024) { setError("O ficheiro pode ter no máximo 50 MB."); return; }
    setError(""); setFile(selected); setMediaType(type); setPreviewUrl(URL.createObjectURL(selected));
  };

  const onCropComplete = useCallback((_, area) => setCroppedArea(area), []);
  const getCroppedImage = async () => {
    const image = new Image(); image.src = previewUrl;
    await new Promise((resolve, reject) => { image.onload = resolve; image.onerror = reject; });
    const canvas = document.createElement("canvas"); canvas.width = croppedArea.width; canvas.height = croppedArea.height;
    canvas.getContext("2d").drawImage(image, croppedArea.x, croppedArea.y, croppedArea.width, croppedArea.height, 0, 0, croppedArea.width, croppedArea.height);
    return new Promise(resolve => canvas.toBlob(resolve, "image/jpeg", 0.92));
  };

  const handlePublish = async () => {
    if (!file || !mediaType || (mediaType === "image" && !croppedArea)) return;
    setUploading(true); setError("");
    try {
      const uploadFile = mediaType === "image" ? await getCroppedImage() : file;
      const formData = new FormData();
      formData.append("file", uploadFile, mediaType === "image" ? "foto.jpg" : file.name);
      formData.append("upload_preset", "sigo_com_fe");
      const cloudinary = await fetch(`${CLOUDINARY_BASE}/${mediaType}/upload`, { method: "POST", body: formData });
      const cloudinaryData = await cloudinary.json();
      if (!cloudinary.ok || !cloudinaryData.secure_url) throw new Error(cloudinaryData.error?.message || "Não foi possível enviar o ficheiro.");
      const saved = await fetch((import.meta.env.VITE_API_URL || "") + "/api/photos", {
        method: "POST", headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
        body: JSON.stringify({ url: cloudinaryData.secure_url, caption, visibility, media_type: mediaType }),
      });
      const savedData = await saved.json();
      if (!saved.ok || !savedData.photo) throw new Error(savedData.error || "Não foi possível guardar o ficheiro.");
      let muralWarning = "";
      if (publishToMural) {
        try {
          const mural = await fetch((import.meta.env.VITE_API_URL || "") + "/api/feed", {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
            body: JSON.stringify({
              content: caption.trim() || (mediaType === "video" ? "Novo vídeo no meu perfil" : "Nova foto no meu perfil"),
              category: mediaType === "video" ? "testemunho" : "foto",
              visibility: "public",
              media_url: cloudinaryData.secure_url,
              media_type: mediaType === "video" ? "video" : "foto"
            })
          });
          if (!mural.ok) muralWarning = "A foto foi guardada no perfil, mas não foi possível publicá-la no Mural.";
        } catch (_) { muralWarning = "A foto foi guardada no perfil, mas não foi possível publicá-la no Mural."; }
      }
      onSuccess(savedData.photo); onClose();
      if (muralWarning) window.setTimeout(() => alert(muralWarning), 0);
    } catch (err) { setError(err.message || "Erro ao fazer upload."); }
    finally { setUploading(false); }
  };

  return <div style={{ position:"fixed", inset:0, background:"rgba(17,24,39,.78)", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}>
    <div style={{ background:"white", borderRadius:20, padding:24, width:"100%", maxWidth:520, maxHeight:"90vh", overflowY:"auto", boxShadow:"0 24px 80px rgba(0,0,0,.3)" }}>
      <h3 style={{ color:"#4A2270", margin:"0 0 6px" }}>Adicionar foto ou vídeo</h3>
      <p style={{ color:"#64748b", margin:"0 0 18px", fontSize:13 }}>Escolhe quem pode ver e escreve uma legenda, se quiseres.</p>
      {!previewUrl ? <><input type="file" accept="image/*,video/mp4,video/webm,video/quicktime" onChange={onFileChange} style={{ marginBottom:12 }} /><div style={{ fontSize:12, color:"#64748b" }}>Fotos e vídeos até 50 MB.</div></> : <>
        {mediaType === "image" ? <><div style={{ position:"relative", width:"100%", height:300, background:"#111827", borderRadius:12, overflow:"hidden", marginBottom:12 }}><Cropper image={previewUrl} crop={crop} zoom={zoom} aspect={1} onCropChange={setCrop} onZoomChange={setZoom} onCropComplete={onCropComplete}/></div><label style={{ fontSize:12, color:"#64748b" }}>Ajustar enquadramento</label><input type="range" min={1} max={3} step={0.1} value={zoom} onChange={e=>setZoom(Number(e.target.value))} style={{ width:"100%", margin:"4px 0 14px" }}/></> : <video src={previewUrl} controls style={{ width:"100%", maxHeight:300, background:"#111827", borderRadius:12, marginBottom:14 }} />}
        <input placeholder="Legenda (opcional)" maxLength={500} value={caption} onChange={e=>setCaption(e.target.value)} style={{ width:"100%", padding:11, borderRadius:10, border:"1px solid #dbe2ea", marginBottom:10, fontSize:14, boxSizing:"border-box" }}/>
        <select value={visibility} onChange={e=>setVisibility(e.target.value)} style={{ width:"100%", padding:11, borderRadius:10, border:"1px solid #dbe2ea", marginBottom:16, fontSize:14 }}><option value="public">🌎 Público — toda a comunidade</option><option value="friends">🤝 Só amigos</option><option value="private">🔒 Só eu</option></select>
        <label style={{ display:"flex", alignItems:"center", gap:9, padding:"11px 12px", borderRadius:10, background:"#f4effb", color:"#4A2270", fontSize:13, fontWeight:700, cursor:"pointer" }}><input type="checkbox" checked={publishToMural} onChange={e => setPublishToMural(e.target.checked)} /> Também publicar no meu Mural</label>
      </>}
      {error && <p style={{ color:"#dc2626", fontSize:13, margin:"0 0 12px" }}>{error}</p>}
      <div style={{ display:"flex", gap:8, marginTop:16 }}><button onClick={onClose} disabled={uploading} style={{ flex:1, background:"#f1f5f9", border:"none", borderRadius:10, padding:"11px", cursor:"pointer" }}>Cancelar</button>{previewUrl && <button onClick={handlePublish} disabled={uploading} style={{ flex:2, background:"#6C3FA0", color:"white", border:"none", borderRadius:10, padding:"11px", cursor:"pointer", fontWeight:700 }}>{uploading ? "A publicar..." : "Publicar"}</button>}</div>
    </div>
  </div>;
}
