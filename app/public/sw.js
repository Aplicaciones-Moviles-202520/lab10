/**
 * Service Worker for Imperial Watch App (PWA)
 *
 * Responsibilities:
 * - Precache core assets for offline use
 * - Runtime caching for navigations and static assets
 * - Show notifications (local and push)
 * - Handle notification clicks and close events
 * - Educational: logs all major events for learning
 */

// ---- Install, cache and activate events ----

// Name of the cache (consider versioning for updates)
const CACHE_NAME = 'app-cache-v1';
// List of URLs to precache during install
const PRECACHE_URLS = ['/', '/icons/apple-touch-icon.png', '/icons/favicon-96x96.png', '/icons/favicon.ico', '/icons/favicon.svg', '/icons/web-app-manifest-192x192.png', '/icons/web-app-manifest-512x512.png', '/manifest.webmanifest'];

// Install event: cache core assets
self.addEventListener('install', (event) => {
    console.log('[ServiceWorker] Installed');
    event.waitUntil(
        caches
            .open(CACHE_NAME)
            .then((cache) => cache.addAll(PRECACHE_URLS))
            .catch((e) => {
                console.warn('[ServiceWorker] Precache failed:', e);
            })
    );
    // Activate updated SW immediately (skip waiting phase)
    self.skipWaiting();
});

// Activate event: clean up old caches and take control
self.addEventListener('activate', (event) => {
    console.log('[ServiceWorker] Activated');
    console.log('[ServiceWorker] Cleaning up old caches');
    event.waitUntil(
        (async () => {
            const keys = await caches.keys();
            // Delete all caches except the current one
            await Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)));
            // Take control of all clients immediately
            await self.clients.claim();
        })()
    );
});

// ---- Notification handling ----

/**
 * Show a notification (called for both local and push events)
 * @param {object} data - Notification data (title, body, icon, etc)
 */
function showNotification(data) {
    const title = data.title || 'Notification';
    const options = {
        body: data.body || 'You have a new message',
        icon: data.icon || '/icons/favicon.svg',
        badge: data.badge || '/icons/favicon.svg',
        vibrate: [100, 50, 100],
        data: {
            url: data.url || '/',
            timestamp: Date.now(),
            type: data.type || 'unknown',
        },
        requireInteraction: false,
        tag: data.tag || `${data.type || 'default'}-notification`,
        actions: [
            {
                action: 'open',
                title: 'Open App',
            },
            {
                action: 'close',
                title: 'Close',
            },
        ],
    };
    return self.registration.showNotification(title, options);
}

// Listen for messages from the app (e.g., show local notification)
self.addEventListener('message', (event) => {
    console.log('[ServiceWorker] Message received:', event.data);
    // If message is SHOW_NOTIFICATION, display it
    if (event.data && event.data.type === 'SHOW_NOTIFICATION') {
        const notificationData = { ...event.data.data, type: 'local' };
        event.waitUntil(showNotification(notificationData));
    }
});

// Listen for push events (remote notifications)
self.addEventListener('push', (event) => {
    console.log('[ServiceWorker] Push received');
    if (!event.data) {
        console.log('[ServiceWorker] Push event but no data');
        return;
    }
    let data;
    try {
        data = event.data.json();
    } catch (e) {
        // Fallback: treat as text
        data = {
            title: 'Remote Notification',
            body: event.data.text() || 'You have a new message',
            icon: '/icons/favicon.svg',
        };
    }
    // Mark as remote notification and use centralized function
    const notificationData = { ...data, type: 'remote' };
    event.waitUntil(showNotification(notificationData));
});

// Handle notification clicks (focus or open the app)
self.addEventListener('notificationclick', (event) => {
    console.log('[ServiceWorker] Notification clicked');
    event.notification.close();
    // Get the target URL from notification data
    const targetUrl = (event.notification && event.notification.data && event.notification.data.url) || '/';
    event.waitUntil(
        (async () => {
            const allClients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
            // Try to focus an open tab for our origin
            for (const client of allClients) {
                try {
                    // If already on the target, just focus
                    if (client.url && new URL(client.url).origin === self.location.origin) {
                        await client.focus();
                        // Navigate if different path
                        if (targetUrl && new URL(targetUrl, self.location.origin).href !== client.url && 'navigate' in client) {
                            await client.navigate(targetUrl);
                        }
                        return;
                    }
                } catch (e) {
                    // continue
                }
            }
            // Otherwise open a new window
            await self.clients.openWindow(targetUrl);
        })()
    );
});

// Log notification close events
self.addEventListener('notificationclose', (event) => {
    console.log('[ServiceWorker] Notification closed');
});

// ---- Fetch event: runtime caching ----

self.addEventListener('fetch', (event) => {
    console.log('[ServiceWorker] Fetch event');
    const { request } = event;
    const url = new URL(request.url);

    // Only handle same-origin GET requests
    if (request.method !== 'GET' || url.origin !== self.location.origin) return;

    // Navigation requests: Network-first with cache fallback
    if (request.mode === 'navigate') {
        event.respondWith(
            (async () => {
                const cache = await caches.open(CACHE_NAME);
                try {
                    // Try network first
                    const networkResponse = await fetch(request);
                    // Update cache with latest
                    cache.put(request, networkResponse.clone());
                    return networkResponse;
                } catch (err) {
                    // If offline, try cache for this page, then fallback to '/'
                    const cachedSpecific = await cache.match(request);
                    if (cachedSpecific) return cachedSpecific;
                    const cachedRoot = await cache.match('/');
                    return cachedRoot || new Response('<h1>Offline</h1>', { headers: { 'Content-Type': 'text/html' } });
                }
            })()
        );
        return;
    }

    // Static assets: Cache-first with background update
    const assetPattern = /\.(png|jpg|jpeg|svg|gif|webp|ico|css|js|json|webmanifest)$/i;
    if (assetPattern.test(url.pathname)) {
        event.respondWith(
            (async () => {
                const cache = await caches.open(CACHE_NAME);
                const cached = await cache.match(request);
                // Try cache first, then update in background
                const fetchAndCache = fetch(request)
                    .then((response) => {
                        if (response && response.ok) {
                            cache.put(request, response.clone());
                        }
                        return response;
                    })
                    .catch(() => cached);
                return cached || fetchAndCache;
            })()
        );
    }
});
