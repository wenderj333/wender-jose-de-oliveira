c = open('src/pages/Profile.jsx', 'r', encoding='utf-8').read()
c = c.replace(
    'import PhotoModal from "../components/PhotoModal";\nimport PhotoUploader from "../components/PhotoUploader";\nimport PhotoModal from "../components/PhotoModal";',
    'import PhotoModal from "../components/PhotoModal";\nimport PhotoUploader from "../components/PhotoUploader";'
)
open('src/pages/Profile.jsx', 'w', encoding='utf-8').write(c)
print('OK!')
