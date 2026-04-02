// Service Worker for RestoPOS Push Notifications
self.addEventListener('push', (event) => {
    if (!event.data) return;

    let data;
    try {
        data = event.data.json();
    } catch {
        data = { title: 'RestoPOS', body: event.data.text() };
    }

    const options = {
        body: data.body || '',
        icon: data.icon || '/icon-192.png',
        badge: '/icon-192.png',
        vibrate: [200, 100, 200],
        data: { url: data.url || '/' },
        actions: [
            { action: 'open', title: 'Ver Panel' },
            { action: 'close', title: 'Cerrar' }
        ],
        requireInteraction: false,
        tag: data.tag || 'restopos-notification',
        renotify: true,
    };

    event.waitUntil(
        self.registration.showNotification(data.title || 'RestoPOS', options)
    );
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    if (event.action === 'close') return;

    const urlToOpen = event.notification.data?.url || '/';
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
            for (const client of windowClients) {
                if (client.url.includes(self.location.origin) && 'focus' in client) {
                    return client.focus();
                }
            }
            if (clients.openWindow) {
                return clients.openWindow(urlToOpen);
            }
        })
    );
});

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(clients.claim()));
