content = open("frontend/src/pages/AjudaUmaVida.jsx", "rb").read().decode("utf-8")

old1 = "const API = (import.meta.env.VITE_API_URL || \"\") + \"/api\";"
new1 = old1 + "\nconst CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME or \"degxiuf43\";\nconst CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET or \"sigo_com_fe\";\nasync function uploadToCloudinary(file) {\n  const formData = new FormData();\n  formData.append(\"file\", file);\n  formData.append(\"upload_preset\", CLOUDINARY_UPLOAD_PRESET);\n  const resourceType = file.type.startsWith(\"video\") ? \"video\" : \"image\";\n  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/${resourceType}/upload`, { method: \"POST\", body: formData });\n  const data = await res.json();\n  return data.secure_url;\n}"
content = content.replace(old1, new1)

old2 = "  const [pixKey, setPixKey] = useState(\"\");"
new2 = old2 + "\n  const [mediaFile, setMediaFile] = useState(null);\n  const [mediaUrl, setMediaUrl] = useState(\"\");\n  const [uploading, setUploading] = useState(false);"
content = content.replace(old2, new2)

open("frontend/src/pages/AjudaUmaVida.jsx", "wb").write(content.encode("utf-8"))
print("Feito!")
