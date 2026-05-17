const admin = require('firebase-admin');
const serviceAccount = require('./firebase-adminsdk.json');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

async function sendPushNotification(fcmToken, title, body, data = {}) {
  try {
    const message = { notification: { title, body }, data, token: fcmToken };
    const response = await admin.messaging().send(message);
    console.log('Notificacao enviada:', response);
    return response;
  } catch (error) {
    console.error('Erro ao enviar notificacao:', error);
  }
}

module.exports = { sendPushNotification };
