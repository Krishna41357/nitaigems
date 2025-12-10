// public/sw.js - Service Worker for Push Notifications

self.addEventListener('install', (event) => {
  console.log('✅ Service Worker installed');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('✅ Service Worker activated');
  event.waitUntil(clients.claim());
});

// Handle push notification events
self.addEventListener('push', (event) => {
  console.log('📬 Push notification received');
  
  let data = {};
  
  try {
    data = event.data ? event.data.json() : {};
  } catch (e) {
    console.error('Error parsing push data:', e);
    data = {
      title: 'New Notification',
      body: event.data ? event.data.text() : 'You have a new notification'
    };
  }

  const title = data.title || '🔐 Your OTP Code';
  const options = {
    body: data.body || 'Your verification code has arrived',
    icon: data.icon || '/logo192.png',
    badge: data.badge || '/badge72.png',
    tag: 'otp-notification',
    requireInteraction: true, // Keep notification visible
    vibrate: [200, 100, 200], // Vibration pattern
    data: data.data || {},
    actions: [
      {
        action: 'view',
        title: 'View OTP',
        icon: '/icons/view.png'
      },
      {
        action: 'close',
        title: 'Dismiss',
        icon: '/icons/close.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  console.log('🖱️ Notification clicked');
  
  event.notification.close();

  if (event.action === 'close') {
    return;
  }

  // Open or focus the app
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // If app is already open, focus it
        for (let client of clientList) {
          if (client.url.includes(self.registration.scope) && 'focus' in client) {
            return client.focus();
          }
        }
        
        // Otherwise open new window
        if (clients.openWindow) {
          return clients.openWindow('/');
        }
      })
  );
});

// Handle notification close
self.addEventListener('notificationclose', (event) => {
  console.log('❌ Notification closed');
});