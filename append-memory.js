const fs = require('fs');
const path = require('path');
const file = path.join('..', 'memory', '2026-03-19.md');
const append = `
## Session (18:07-18:10)

### Menu + YouTube Fixes
- Wender: Mural not first in sidebar menu; YouTube videos showing "not available".
- Fixed App.jsx: moved Mural link to be first item in MENU section (before Meu Perfil).
- Fixed MusicLibrary.jsx YouTube section:
  - Removed ytPlaying state and iframe embed (iframes get blocked by YouTube).
  - Replaced with 2-column grid of thumbnail cards.
  - Each card: YouTube thumbnail (mqdefault.jpg) + red play button overlay.
  - Clicking opens youtube.com/watch?v=ID in new tab — never blocks.
  - Added music.youtubeNote key to all 7 langs.
- Commit: c07e9fb.
- HEAD: c07e9fb.
`;
fs.appendFileSync(file, append, 'utf8');
console.log('Saved!');
