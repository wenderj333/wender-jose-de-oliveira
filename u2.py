f = open("frontend/src/pages/AjudaUmaVida.jsx", "rb")
content = f.read().decode("utf-8")
f.close()
cloudinary = chr(10) + "const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || " + chr(34) + "degxiuf43" + chr(34) + ";" + chr(10) + "const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || " + chr(34) + "sigo_com_fe" + chr(34) + ";" + chr(10) + "async function uploadToCloudinary(file) {" + chr(10) + "  const formData = new FormData();" + chr(10) + "  formData.append(" + chr(34) + "file" + chr(34) + ", file);" + chr(10) + "  formData.append(" + chr(34) + "upload_preset" + chr(34) + ", CLOUDINARY_UPLOAD_PRESET);" + chr(10) + "  const rt = file.type.startsWith(" + chr(34) + "video" + chr(34) + ") ? " + chr(34) + "video" + chr(34) + " : " + chr(34) + "image" + chr(34) + ";" + chr(10) + "  const res = await fetch(" + chr(34) + "https://api.cloudinary.com/v1_1/" + chr(34) + " + CLOUDINARY_CLOUD_NAME + " + chr(34) + "/" + chr(34) + " + rt + " + chr(34) + "/upload" + chr(34) + ", { method: " + chr(34) + "POST" + chr(34) + ", body: formData });" + chr(10) + "  const data = await res.json();" + chr(10) + "  return data.secure_url;" + chr(10) + "}"
old1 = "const API = (import.meta.env.VITE_API_URL || " + chr(34) + chr(34) + ") + " + chr(34) + "/api" + chr(34) + ";"
if old1 in content:
    content = content.replace(old1, old1 + cloudinary)
    print("Cloudinary OK")
old2 = "  const [pixKey, setPixKey] = useState(" + chr(34) + chr(34) + ");"
if old2 in content:
    content = content.replace(old2, old2 + chr(10) + "  const [mediaFile, setMediaFile] = useState(null);" + chr(10) + "  const [uploading, setUploading] = useState(false);")
    print("States OK")
open("frontend/src/pages/AjudaUmaVida.jsx", "wb").write(content.encode("utf-8"))
print("Feito!")
