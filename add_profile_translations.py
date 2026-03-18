#!/usr/bin/env python3
import json
import os

# New translations for ProfilePage component
translations = {
    "pt": {
        "editCover": "Alterar capa",
        "consecrate": "Consagrar",
        "consecrating": "Consagrando...",
        "editProfile": "Editar",
        "message": "Mensagem",
        "follow": "Seguir",
        "posts": "Posts",
        "friends": "Amigos",
        "prayers": "Orações",
        "memberSince": "Desde",
        "editProfileModalTitle": "✏️ Editar Perfil",
        "updateInfoDesc": "Atualize suas informações",
        "nameLabel": "Nome",
        "namePlaceholder": "Seu nome",
        "bioLabel": "Bio",
        "bioPlaceholder": "Conte algo sobre você...",
        "save": "Salvar",
        "cancel": "Cancelar",
        "previewPhotoTitle": "📸 Pré-visualizar foto",
        "profilePhotoDesc": "Esta será sua foto de perfil",
        "useThisPhoto": "✅ Usar esta foto",
        "noPostsYet": "Nenhum post ainda",
        "noActivityYet": "Nada por aqui ainda"
    },
    "en": {
        "editCover": "Change cover",
        "consecrate": "Consecrate",
        "consecrating": "Consecrating...",
        "editProfile": "Edit",
        "message": "Message",
        "follow": "Follow",
        "posts": "Posts",
        "friends": "Friends",
        "prayers": "Prayers",
        "memberSince": "Member Since",
        "editProfileModalTitle": "✏️ Edit Profile",
        "updateInfoDesc": "Update your information",
        "nameLabel": "Name",
        "namePlaceholder": "Your name",
        "bioLabel": "Bio",
        "bioPlaceholder": "Tell us something about yourself...",
        "save": "Save",
        "cancel": "Cancel",
        "previewPhotoTitle": "📸 Preview photo",
        "profilePhotoDesc": "This will be your profile photo",
        "useThisPhoto": "✅ Use this photo",
        "noPostsYet": "No posts yet",
        "noActivityYet": "Nothing here yet"
    },
    "es": {
        "editCover": "Cambiar portada",
        "consecrate": "Consagrar",
        "consecrating": "Consagrando...",
        "editProfile": "Editar",
        "message": "Mensaje",
        "follow": "Seguir",
        "posts": "Publicaciones",
        "friends": "Amigos",
        "prayers": "Oraciones",
        "memberSince": "Desde",
        "editProfileModalTitle": "✏️ Editar Perfil",
        "updateInfoDesc": "Actualiza tu información",
        "nameLabel": "Nombre",
        "namePlaceholder": "Tu nombre",
        "bioLabel": "Biografía",
        "bioPlaceholder": "Cuéntanos algo sobre ti...",
        "save": "Guardar",
        "cancel": "Cancelar",
        "previewPhotoTitle": "📸 Previsualizar foto",
        "profilePhotoDesc": "Esta será tu foto de perfil",
        "useThisPhoto": "✅ Usar esta foto",
        "noPostsYet": "Aún no hay publicaciones",
        "noActivityYet": "Nada por aquí todavía"
    },
    "de": {
        "editCover": "Cover ändern",
        "consecrate": "Weihen",
        "consecrating": "Weiht...",
        "editProfile": "Bearbeiten",
        "message": "Nachricht",
        "follow": "Folgen",
        "posts": "Beiträge",
        "friends": "Freunde",
        "prayers": "Gebete",
        "memberSince": "Mitglied seit",
        "editProfileModalTitle": "✏️ Profil bearbeiten",
        "updateInfoDesc": "Aktualisiere deine Informationen",
        "nameLabel": "Name",
        "namePlaceholder": "Dein Name",
        "bioLabel": "Bio",
        "bioPlaceholder": "Erzähl uns etwas über dich...",
        "save": "Speichern",
        "cancel": "Abbrechen",
        "previewPhotoTitle": "📸 Foto vorschau",
        "profilePhotoDesc": "Dies wird dein Profilfoto sein",
        "useThisPhoto": "✅ Dieses Foto verwenden",
        "noPostsYet": "Noch keine Beiträge",
        "noActivityYet": "Noch nichts hier"
    },
    "fr": {
        "editCover": "Changer la couverture",
        "consecrate": "Consacrer",
        "consecrating": "Consacrant...",
        "editProfile": "Éditer",
        "message": "Message",
        "follow": "Suivre",
        "posts": "Publications",
        "friends": "Amis",
        "prayers": "Prières",
        "memberSince": "Membre depuis",
        "editProfileModalTitle": "✏️ Éditer le profil",
        "updateInfoDesc": "Mettez à jour vos informations",
        "nameLabel": "Nom",
        "namePlaceholder": "Votre nom",
        "bioLabel": "Bio",
        "bioPlaceholder": "Parlez-nous de vous...",
        "save": "Enregistrer",
        "cancel": "Annuler",
        "previewPhotoTitle": "📸 Prévisualiser la photo",
        "profilePhotoDesc": "Ce sera votre photo de profil",
        "useThisPhoto": "✅ Utiliser cette photo",
        "noPostsYet": "Aucune publication pour l'instant",
        "noActivityYet": "Rien ici pour l'instant"
    },
    "ro": {
        "editCover": "Schimbă coperta",
        "consecrate": "Consacrare",
        "consecrating": "Consacrând...",
        "editProfile": "Editează",
        "message": "Mesaj",
        "follow": "Urmărește",
        "posts": "Postări",
        "friends": "Prieteni",
        "prayers": "Rugăciuni",
        "memberSince": "Membru din",
        "editProfileModalTitle": "✏️ Editează profilul",
        "updateInfoDesc": "Actualizează-ți informațiile",
        "nameLabel": "Nume",
        "namePlaceholder": "Numele tău",
        "bioLabel": "Bio",
        "bioPlaceholder": "Spune-ne ceva despre tine...",
        "save": "Salvează",
        "cancel": "Anulează",
        "previewPhotoTitle": "📸 Previzualizează fotografia",
        "profilePhotoDesc": "Aceasta va fi fotografia ta de profil",
        "useThisPhoto": "✅ Folosește această fotografie",
        "noPostsYet": "Nicio postare încă",
        "noActivityYet": "Nimic aici încă"
    },
    "ru": {
        "editCover": "Изменить обложку",
        "consecrate": "Посвятить",
        "consecrating": "Посвящается...",
        "editProfile": "Редактировать",
        "message": "Сообщение",
        "follow": "Подписаться",
        "posts": "Публикации",
        "friends": "Друзья",
        "prayers": "Молитвы",
        "memberSince": "Участник с",
        "editProfileModalTitle": "✏️ Редактировать профиль",
        "updateInfoDesc": "Обновите вашу информацию",
        "nameLabel": "Имя",
        "namePlaceholder": "Ваше имя",
        "bioLabel": "Биография",
        "bioPlaceholder": "Расскажите что-нибудь о себе...",
        "save": "Сохранить",
        "cancel": "Отмена",
        "previewPhotoTitle": "📸 Предпросмотр фото",
        "profilePhotoDesc": "Это будет ваше фото профиля",
        "useThisPhoto": "✅ Использовать это фото",
        "noPostsYet": "Пока нет публикаций",
        "noActivityYet": "Пока ничего нет"
    }
}

base_path = "frontend/src/i18n/"
lang_files = [f for f in os.listdir(base_path) if f.endswith(".json")]

print("Updating ProfilePage translations in all language files...")

for filename in lang_files:
    file_path = os.path.join(base_path, filename)
    print(f"Processing {file_path}...")
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        if 'profile' not in data:
            data['profile'] = {}
        
        # Add new keys to profile section
        data['profile'].update(translations[filename[:2]])
        
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=4)
        
        print(f"[OK] {filename} updated successfully")
    
    except Exception as e:
        print(f"[ERROR] Unknown error with {filename}: {e}")

print("\nAll language files processed!")
