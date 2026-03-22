const fs = require('fs');
const i18nDir = 'frontend/src/i18n';
const vals = { pt:'Mensagens', de:'Nachrichten', en:'Messages', es:'Mensajes', fr:'Messages', ro:'Mesaje', ru:'Сообщения' };
for (const [lang, val] of Object.entries(vals)) {
  const f = `${i18nDir}/${lang}.json`;
  const d = JSON.parse(fs.readFileSync(f,'utf8'));
  if (!d.nav) d.nav = {};
  d.nav.messages = val;
  fs.writeFileSync(f, JSON.stringify(d,null,2),'utf8');
  console.log(`✓ ${lang}`);
}
