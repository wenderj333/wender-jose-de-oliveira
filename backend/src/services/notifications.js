const { GoogleAuth } = require('google-auth-library');

function getServiceAccount() {
  const raw = process.env.FCM_SERVICE_ACCOUNT_JSON || process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!raw) return null;
  try { return JSON.parse(raw); } catch (error) {
    console.error('FCM service account inválida:', error.message);
    return null;
  }
}

async function sendPushNotification(fcmToken, title, body, data = {}) {
  const serviceAccount = getServiceAccount();
  if (!serviceAccount?.project_id || !fcmToken) return null;
  try {
    const auth = new GoogleAuth({ credentials: serviceAccount, scopes: ['https://www.googleapis.com/auth/firebase.messaging'] });
    const accessToken = await auth.getAccessToken();
    const response = await fetch(`https://fcm.googleapis.com/v1/projects/${serviceAccount.project_id}/messages:send`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: {
        token: fcmToken,
        notification: { title: title || 'Sigo com Fé', body: body || '' },
        data: Object.fromEntries(Object.entries(data || {}).map(([key, value]) => [key, String(value)])),
        android: { priority: 'high', notification: { channel_id: 'sigo-com-fe', sound: 'default' } }
      }})
    });
    if (!response.ok) throw new Error(`FCM HTTP ${response.status}`);
    return response.json();
  } catch (error) {
    console.error('Erro ao enviar notificação FCM:', error.message);
    return null;
  }
}

module.exports = { sendPushNotification };
