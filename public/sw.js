const CACHE_NAME = 'fxsignals-v1';
const OFFLINE_URL = '/offline.html';

const PRECACHE_ASSETS = [
  '/',
  '/manifest.json',
  '/offline.html',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(cacheNames.filter((cacheName) => cacheName !== CACHE_NAME).map((cacheName) => caches.delete(cacheName)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (!event.request.url.startsWith(self.location.origin)) return;
  if (event.request.url.includes('/api/')) return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        event.waitUntil(fetch(event.request).then((response) => {
          if (response && response.status === 200) caches.open(CACHE_NAME).then((cache) => cache.put(event.request, response));
        }).catch(() => {}));
        return cachedResponse;
      }
      return fetch(event.request).then((response) => {
        if (response && response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone));
        }
        return response;
      }).catch(() => event.request.mode === 'navigate' ? caches.match(OFFLINE_URL) : new Response('Offline', { status: 503 }));
    })
  );
});

self.addEventListener('push', (event) => {
  let data = { title: 'New Trading Signal', body: 'A new trading signal is available!', icon: '/icons/icon-192x192.png', badge: '/icons/icon-72x72.png', tag: 'signal', data: { url: '/' } };
  if (event.data) {
    try { data = { ...data, ...event.data.json() }; } catch (e) { data.body = event.data.text(); }
  }
  event.waitUntil(self.registration.showNotification(data.title, { body: data.body, icon: data.icon, badge: data.badge, vibrate: [100, 50, 100], tag: data.tag, renotify: true, requireInteraction: true, actions: [{ action: 'view', title: 'View Signal' }, { action: 'dismiss', title: 'Dismiss' }], data: data.data }));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  if (event.action === 'dismiss') return;
  const urlToOpen = event.notification.data?.url || '/';
  event.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
    for (const client of clientList) {
      if (client.url.includes(self.location.origin) && 'focus' in client) {
        client.navigate(urlToOpen);
        return client.focus();
      }
    }
    if (self.clients.openWindow) return self.clients.openWindow(urlToOpen);
  }));
});
