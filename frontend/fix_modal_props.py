c = open('src/pages/Profile.jsx', 'r', encoding='utf-8').read()
c = c.replace(
    '{currentIndex !== null && <PhotoModal url={photos[currentIndex].url}\nonClose={closePhoto} onNext={nextPhoto} onPrev={prevPhoto} />}',
    '{currentIndex !== null && <PhotoModal url={photos[currentIndex].url} photoId={photos[currentIndex].id} token={token} onClose={closePhoto} onNext={nextPhoto} onPrev={prevPhoto} />}'
)
open('src/pages/Profile.jsx', 'w', encoding='utf-8').write(c)
print('OK: ' + str(c.count('photoId')))
