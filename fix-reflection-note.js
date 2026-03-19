const fs = require('fs');
const i18nDir = 'frontend/src/i18n';
const notes = { pt:'As perguntas mudam automaticamente a cada dia 🙏', de:'Die Fragen ändern sich täglich automatisch 🙏', en:'Questions change automatically every day 🙏', es:'Las preguntas cambian automáticamente cada día 🙏', fr:'Les questions changent automatiquement chaque jour 🙏', ro:'Întrebările se schimbă automat în fiecare zi 🙏', ru:'Вопросы меняются автоматически каждый день 🙏' };
for (const lang of Object.keys(notes)) {
  const f = `${i18nDir}/${lang}.json`;
  const d = JSON.parse(fs.readFileSync(f,'utf8'));
  if (!d.reflection) d.reflection = {};
  d.reflection.rotateNote = notes[lang];
  fs.writeFileSync(f, JSON.stringify(d,null,2),'utf8');
  console.log(`✓ ${lang}`);
}
