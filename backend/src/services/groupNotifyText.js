// Textos das notificações dos Grupos, na língua de quem as recebe.
// Cada entrada devolve [título, corpo]. v = { who, group, text, event }
const T = {
  post: {
    pt: v => [v.group, `${v.who} publicou: ${v.text}`],
    es: v => [v.group, `${v.who} publicó: ${v.text}`],
    en: v => [v.group, `${v.who} posted: ${v.text}`],
    de: v => [v.group, `${v.who} hat gepostet: ${v.text}`],
    fr: v => [v.group, `${v.who} a publié : ${v.text}`],
    ro: v => [v.group, `${v.who} a publicat: ${v.text}`],
    ru: v => [v.group, `${v.who} опубликовал(а): ${v.text}`],
  },
  prayer_post: {
    pt: v => [`🙏 ${v.group}`, `${v.who} pediu oração: ${v.text}`],
    es: v => [`🙏 ${v.group}`, `${v.who} pidió oración: ${v.text}`],
    en: v => [`🙏 ${v.group}`, `${v.who} asked for prayer: ${v.text}`],
    de: v => [`🙏 ${v.group}`, `${v.who} bittet um Gebet: ${v.text}`],
    fr: v => [`🙏 ${v.group}`, `${v.who} demande la prière : ${v.text}`],
    ro: v => [`🙏 ${v.group}`, `${v.who} a cerut rugăciune: ${v.text}`],
    ru: v => [`🙏 ${v.group}`, `${v.who} просит молитвы: ${v.text}`],
  },
  announcement: {
    pt: v => [`📌 ${v.group}`, `Destaque de ${v.who}: ${v.text}`],
    es: v => [`📌 ${v.group}`, `Destacado de ${v.who}: ${v.text}`],
    en: v => [`📌 ${v.group}`, `Highlight from ${v.who}: ${v.text}`],
    de: v => [`📌 ${v.group}`, `Wichtig von ${v.who}: ${v.text}`],
    fr: v => [`📌 ${v.group}`, `À la une, de ${v.who} : ${v.text}`],
    ro: v => [`📌 ${v.group}`, `Important de la ${v.who}: ${v.text}`],
    ru: v => [`📌 ${v.group}`, `Важное от ${v.who}: ${v.text}`],
  },
  comment: {
    pt: v => [`${v.who} comentou a sua publicação`, v.text],
    es: v => [`${v.who} comentó tu publicación`, v.text],
    en: v => [`${v.who} commented on your post`, v.text],
    de: v => [`${v.who} hat deinen Beitrag kommentiert`, v.text],
    fr: v => [`${v.who} a commenté votre publication`, v.text],
    ro: v => [`${v.who} a comentat la postarea ta`, v.text],
    ru: v => [`${v.who} прокомментировал(а) вашу публикацию`, v.text],
  },
  reply: {
    pt: v => [`${v.who} respondeu ao seu comentário`, v.text],
    es: v => [`${v.who} respondió a tu comentario`, v.text],
    en: v => [`${v.who} replied to your comment`, v.text],
    de: v => [`${v.who} hat auf deinen Kommentar geantwortet`, v.text],
    fr: v => [`${v.who} a répondu à votre commentaire`, v.text],
    ro: v => [`${v.who} a răspuns la comentariul tău`, v.text],
    ru: v => [`${v.who} ответил(а) на ваш комментарий`, v.text],
  },
  join_request: {
    pt: v => [`Novo pedido para entrar em ${v.group}`, `${v.who} quer fazer parte do grupo.`],
    es: v => [`Nueva solicitud para ${v.group}`, `${v.who} quiere unirse al grupo.`],
    en: v => [`New request to join ${v.group}`, `${v.who} wants to join the group.`],
    de: v => [`Neue Beitrittsanfrage für ${v.group}`, `${v.who} möchte der Gruppe beitreten.`],
    fr: v => [`Nouvelle demande pour ${v.group}`, `${v.who} souhaite rejoindre le groupe.`],
    ro: v => [`Cerere nouă pentru ${v.group}`, `${v.who} vrea să intre în grup.`],
    ru: v => [`Новая заявка в ${v.group}`, `${v.who} хочет вступить в группу.`],
  },
  approved: {
    pt: v => [`Bem-vindo(a) ao grupo ${v.group}! 🎉`, 'O seu pedido foi aprovado. Apresente-se à comunidade!'],
    es: v => [`¡Bienvenido(a) al grupo ${v.group}! 🎉`, 'Tu solicitud fue aprobada. ¡Preséntate a la comunidad!'],
    en: v => [`Welcome to ${v.group}! 🎉`, 'Your request was approved. Say hello to the community!'],
    de: v => [`Willkommen in ${v.group}! 🎉`, 'Deine Anfrage wurde angenommen. Stell dich der Gemeinschaft vor!'],
    fr: v => [`Bienvenue dans ${v.group} ! 🎉`, 'Votre demande a été acceptée. Présentez-vous à la communauté !'],
    ro: v => [`Bine ai venit în ${v.group}! 🎉`, 'Cererea ta a fost aprobată. Prezintă-te comunității!'],
    ru: v => [`Добро пожаловать в ${v.group}! 🎉`, 'Ваша заявка одобрена. Поприветствуйте сообщество!'],
  },
  post_approved: {
    pt: v => [`A sua publicação foi aprovada ✅`, `Já está visível no grupo ${v.group}.`],
    es: v => [`Tu publicación fue aprobada ✅`, `Ya es visible en el grupo ${v.group}.`],
    en: v => [`Your post was approved ✅`, `It is now visible in ${v.group}.`],
    de: v => [`Dein Beitrag wurde freigegeben ✅`, `Er ist jetzt in ${v.group} sichtbar.`],
    fr: v => [`Votre publication a été approuvée ✅`, `Elle est maintenant visible dans ${v.group}.`],
    ro: v => [`Postarea ta a fost aprobată ✅`, `Acum este vizibilă în ${v.group}.`],
    ru: v => [`Ваша публикация одобрена ✅`, `Теперь она видна в группе ${v.group}.`],
  },
  event_new: {
    pt: v => [`📅 Novo evento em ${v.group}`, v.event],
    es: v => [`📅 Nuevo evento en ${v.group}`, v.event],
    en: v => [`📅 New event in ${v.group}`, v.event],
    de: v => [`📅 Neuer Termin in ${v.group}`, v.event],
    fr: v => [`📅 Nouvel événement dans ${v.group}`, v.event],
    ro: v => [`📅 Eveniment nou în ${v.group}`, v.event],
    ru: v => [`📅 Новое событие в ${v.group}`, v.event],
  },
  event_reminder: {
    pt: v => [`⏰ ${v.event} começa daqui a pouco`, `Evento do grupo ${v.group} — em cerca de 1 hora.`],
    es: v => [`⏰ ${v.event} empieza pronto`, `Evento del grupo ${v.group} — en aproximadamente 1 hora.`],
    en: v => [`⏰ ${v.event} starts soon`, `Event in ${v.group} — in about 1 hour.`],
    de: v => [`⏰ ${v.event} beginnt bald`, `Termin der Gruppe ${v.group} — in etwa 1 Stunde.`],
    fr: v => [`⏰ ${v.event} commence bientôt`, `Événement du groupe ${v.group} — dans environ 1 heure.`],
    ro: v => [`⏰ ${v.event} începe în curând`, `Eveniment al grupului ${v.group} — în aproximativ o oră.`],
    ru: v => [`⏰ ${v.event} скоро начнётся`, `Событие группы ${v.group} — примерно через 1 час.`],
  },
  invite: {
    pt: v => [`${v.who} convidou você para um grupo`, `Venha participar de ${v.group} 🙏`],
    es: v => [`${v.who} te invitó a un grupo`, `Únete a ${v.group} 🙏`],
    en: v => [`${v.who} invited you to a group`, `Come and join ${v.group} 🙏`],
    de: v => [`${v.who} hat dich in eine Gruppe eingeladen`, `Komm in die Gruppe ${v.group} 🙏`],
    fr: v => [`${v.who} vous a invité(e) dans un groupe`, `Venez rejoindre ${v.group} 🙏`],
    ro: v => [`${v.who} te-a invitat într-un grup`, `Vino în grupul ${v.group} 🙏`],
    ru: v => [`${v.who} пригласил(а) вас в группу`, `Присоединяйтесь к ${v.group} 🙏`],
  },
};
const SOMEONE = { pt: 'Alguém', es: 'Alguien', en: 'Someone', de: 'Jemand', fr: 'Quelqu’un', ro: 'Cineva', ru: 'Кто-то' };
const PHOTO = { pt: '📷 Foto', es: '📷 Foto', en: '📷 Photo', de: '📷 Foto', fr: '📷 Photo', ro: '📷 Fotografie', ru: '📷 Фото' };

function pickLang(language) {
  const k = String(language || 'pt').slice(0, 2).toLowerCase();
  return T.post[k] ? k : 'pt';
}

function groupText(kind, language, vars = {}) {
  const lang = pickLang(language);
  const preview = String(vars.text || '').replace(/\s+/g, ' ').trim();
  const v = {
    who: vars.who || SOMEONE[lang],
    group: String(vars.group || '').slice(0, 80),
    event: String(vars.event || '').slice(0, 120),
    text: preview ? (preview.length > 110 ? preview.slice(0, 107) + '…' : preview) : PHOTO[lang],
  };
  return T[kind][lang](v);
}

module.exports = { groupText, pickLang, KINDS: Object.keys(T) };
