// Textos de notificações na língua de quem as recebe (antes saíam sempre em português)
const db = require('../db/connection');

const TEXT = {
  post_amen: {
    pt: w => [`${w} disse Amém à sua publicação 🙏`, ''], es: w => [`${w} dijo Amén a tu publicación 🙏`, ''], en: w => [`${w} said Amen to your post 🙏`, ''],
    de: w => [`${w} hat zu deinem Beitrag Amen gesagt 🙏`, ''], fr: w => [`${w} a dit Amen à votre publication 🙏`, ''], ro: w => [`${w} a spus Amin la postarea ta 🙏`, ''], ru: w => [`${w} сказал(а) «Аминь» к вашей публикации 🙏`, ''],
  },
  friend_request: {
    pt: w => ['Pedido de amizade', `${w} quer ser seu amigo!`], es: w => ['Solicitud de amistad', `¡${w} quiere ser tu amigo!`], en: w => ['Friend request', `${w} wants to be your friend!`],
    de: w => ['Freundschaftsanfrage', `${w} möchte dein Freund sein!`], fr: w => ['Demande d’ami', `${w} veut être votre ami !`], ro: w => ['Cerere de prietenie', `${w} vrea să fie prietenul tău!`], ru: w => ['Заявка в друзья', `${w} хочет добавить вас в друзья!`],
  },
  friend_accepted: {
    pt: w => ['Amizade aceite!', `${w} aceitou o seu pedido de amizade.`], es: w => ['¡Amistad aceptada!', `${w} aceptó tu solicitud de amistad.`], en: w => ['Friend request accepted!', `${w} accepted your friend request.`],
    de: w => ['Freundschaft angenommen!', `${w} hat deine Anfrage angenommen.`], fr: w => ['Demande acceptée !', `${w} a accepté votre demande d’ami.`], ro: w => ['Prietenie acceptată!', `${w} ți-a acceptat cererea de prietenie.`], ru: w => ['Заявка принята!', `${w} принял(а) вашу заявку в друзья.`],
  },
};
const SOMEONE = { pt: 'Alguém', es: 'Alguien', en: 'Someone', de: 'Jemand', fr: 'Quelqu’un', ro: 'Cineva', ru: 'Кто-то' };

async function textFor(kind, recipientId, who) {
  let lang = 'pt';
  try {
    const r = await db.query('SELECT language FROM users WHERE id = $1', [recipientId]);
    const k = String(r.rows[0]?.language || 'pt').slice(0, 2).toLowerCase();
    if (TEXT[kind][k]) lang = k;
  } catch (_) {}
  return TEXT[kind][lang](who || SOMEONE[lang]);
}

module.exports = { textFor };
