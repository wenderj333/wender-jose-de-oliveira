importScripts('https://www.gstatic.com/firebasejs/10.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.0.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyA2BCit2HeaB_j_xbz-NWqKXosSdvuVX9M",
  authDomain: "sigo-com-fe.firebaseapp.com",
  projectId: "sigo-com-fe",
  storageBucket: "sigo-com-fe.firebasestorage.app",
  messagingSenderId: "77579516493",
  appId: "1:77579516493:web:afad13f1ea23fd03c77a04"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
  const { title, body } = payload.notification;
  self.registration.showNotification(title, {
    body,
    icon: '/logo.png'
  });
});
