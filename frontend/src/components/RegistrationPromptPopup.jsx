import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Camera, Upload, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'degxiuf43';
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'sigo_com_fe';

async function uploadToCloudinary(file) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
  formData.append('folder', 'sigo-com-fe/avatars'); // Specific folder for avatars

  const url = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;
  const res = await fetch(url, { method: 'POST', body: formData });
  if (!res.ok) throw new Error('Erro ao fazer upload para o Cloudinary');
  const data = await res.json();
  return data.secure_url;
}

function RegistrationPromptPopup({ isOpen, onClose }) {
  const { t } = useTranslation();
  const { user, updateProfilePhoto } = useAuth();
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  // If user already has a photo, close the modal immediately
  useEffect(() => {
    if (user && user.photoURL && isOpen) {
      onClose();
    }
  }, [user, isOpen, onClose]);

  if (!isOpen || (user && user.photoURL)) return null; // Ensure it's only open if needed

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onload = () => setAvatarPreview(reader.result);
      reader.readAsDataURL(file);
      setError('');
    } else {
      setError('Por favor, selecione um ficheiro de imagem válido.');
      setAvatarFile(null);
      setAvatarPreview(null);
    }
  };

  const handleUpload = async () => {
    if (!avatarFile) {
      setError('Por favor, selecione uma foto de perfil antes de continuar.');
      return;
    }
    setUploading(true);
    setError('');
    try {
      const photoURL = await uploadToCloudinary(avatarFile);
      await updateProfilePhoto(photoURL); // Update user in AuthContext and backend
      onClose(); // Close modal on successful upload
    } catch (err) {
      console.error('Upload failed:', err);
      setError(err.message || 'Erro ao subir foto. Tente novamente.');
    } finally {
      setUploading(false);
    }
  };

  // Prevent closing the modal if user is logged in and needs a photo
  const handleOverlayClick = (e) => {
    if (user && !user.photoURL) {
      e.stopPropagation();
    } else {
      onClose();
    }
  };

  return (
    <div className="registration-popup-overlay" onClick={handleOverlayClick} style={{ pointerEvents: (user && !user.photoURL) ? 'auto' : 'none' }}>
      <div classNameName="registration-popup-content" onClick={(e) => e.stopPropagation()} style={{
          padding: '30px',
          borderRadius: '16px',
          maxWidth: '400px',
          width: '90%',
          textAlign: 'center',
          background: 'linear-gradient(135deg, #1a1a2e, #0f0f1a)',
          color: '#fff',
          boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
          border: '1px solid rgba(218,165,32,0.3)',
          position: 'relative',
        }}>
        {user && !user.photoURL && (
          <button className="registration-popup-close" onClick={(e) => { e.stopPropagation(); setError('Por favor, faça upload de uma foto para continuar.'); }} style={{
            position: 'absolute', top: '15px', right: '15px',
            background: 'none', border: 'none', color: '#aaa', cursor: 'pointer',
            fontSize: '1.2rem',
          }}><X size={20} /></button>
        )}
        <Camera size={50} style={{ color: 'var(--gold)', marginBottom: '15px' }} />
        <h3 className="popup-title" style={{ fontSize: '1.5rem', marginBottom: '10px', fontWeight: '700' }}>
          {t('profile.addPhotoPrompt', 'Adicione sua foto de perfil!')}
        </h3>
        <p style={{ fontSize: '0.9rem', color: '#bbb', marginBottom: '25px' }}>
          {t('profile.addPhotoDesc', 'É obrigatório ter uma foto para interagir na comunidade.')}
        </p>

        <div style={{ marginBottom: '20px' }}>
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
          <div
            onClick={() => fileInputRef.current?.click()}
            style={{
              width: '120px', height: '120px', borderRadius: '50%',
              background: avatarPreview ? `url(${avatarPreview}) center/cover` : 'rgba(218,165,32,0.1)',
              border: `3px dashed ${avatarPreview ? '#4caf50' : '#daa520'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 20px', cursor: 'pointer',
              overflow: 'hidden',
              transition: 'all 0.3s ease',
              boxShadow: avatarPreview ? '0 0 0 5px rgba(76,175,80,0.3)' : 'none',
            }}
          >
            {!avatarPreview && <Camera size={40} color="#daa520" />}
          </div>
          <p style={{ fontSize: '0.85rem', color: avatarPreview ? '#4caf50' : '#daa520', fontWeight: '600' }}>
            {avatarPreview ? '✅ Foto selecionada!' : 'Clique para selecionar uma foto *'}
          </p>
        </div>

        {error && <p style={{ color: '#e74c3c', fontSize: '0.85rem', marginBottom: '15px' }}>{error}</p>}

        <button
          onClick={handleUpload}
          disabled={uploading || !avatarFile}
          style={{
            width: '100%', padding: '12px', borderRadius: '10px', border: 'none',
            background: uploading ? '#ccc' : 'linear-gradient(135deg, #daa520, #f4c542)',
            color: '#1a0a3e', fontSize: '1rem', fontWeight: '700', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            boxShadow: '0 4px 15px rgba(218,165,32,0.2)',
            transition: 'all 0.3s ease',
          }}
        >
          {uploading ? '📤 A subir...' : <><Upload size={18} /> Subir Foto e Continuar</>}
        </button>
      </div>
    </div>
  );
}

export default RegistrationPromptPopup;
