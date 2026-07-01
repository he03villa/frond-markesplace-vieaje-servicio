importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: 'AIzaSyD2GKiEd-wN3LJJrZlaXAYqcN9OIAaXFyM',
  authDomain: 'conexion-php.firebaseapp.com',
  databaseURL: 'https://conexion-php.firebaseio.com',
  projectId: 'conexion-php',
  storageBucket: 'conexion-php.firebasestorage.app',
  messagingSenderId: '457642790423',
  appId: '1:457642790423:web:a4baf0ef5ccb0484041652',
  measurementId: 'G-68NFGDP481',
    vapidKey: 'BF9bNyf8iPwbm0dMLK28SXMCEdIxwalPJwQ9oNf3Q6IYi-sWKis23mhgdcAeyyPQaf0DL2iNJClKk1a0XZjxfaY'
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function (payload) {
  const notificationTitle = payload.notification?.title || payload.data?.title || 'Nueva notificación';
  const notificationOptions = {
    body: payload.notification?.body || payload.data?.body || '',
    icon: payload.notification?.icon || '/assets/icon/favicon.png',
    badge: '/assets/icon/favicon.png',
    data: payload.data || {}
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();

  const route = event.notification.data?.route || '/';
  const urlToOpen = new URL(route, self.location.origin).href;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (clientList) {
      for (const client of clientList) {
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
