/**
 * 🛡️ Service Worker for BestTutorEver
 * 
 * Provides:
 * - Offline support for static assets
 * - Fast repeat visits via caching
 * - Background sync for homework plans
 * 
 * Cache Strategy:
 * - Static assets: Cache first, network fallback
 * - API calls: Network first, cache fallback
 * - Pages: Network first, cache fallback
 */

const CACHE_VERSION = 'besttutorever-v1';
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const DYNAMIC_CACHE = `${CACHE_VERSION}-dynamic`;
const API_CACHE = `${CACHE_VERSION}-api`;

// Assets to cache immediately on install
const STATIC_ASSETS = [
  '/',
  '/landing',
  '/login',
  '/offline.html', // Fallback page for offline mode
  '/manifest.json',
];

// Install Service Worker
self.addEventListener('install', (event) => {
  console.log('[SW] Installing Service Worker...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      console.log('[SW] Precaching static assets');
      return cache.addAll(STATIC_ASSETS).catch(err => {
        console.warn('[SW] Failed to precache some assets:', err);
        // Don't fail the install if some assets can't be cached
      });
    })
  );
  
  // Activate immediately without waiting
  self.skipWaiting();
});

// Activate Service Worker
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating Service Worker...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name.startsWith('besttutorever-') && name !== CACHE_VERSION)
          .map((name) => {
            console.log('[SW] Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    })
  );
  
  // Take control of all pages immediately
  return self.clients.claim();
});

// Fetch Strategy
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip cross-origin requests
  if (url.origin !== location.origin) {
    return;
  }
  
  // Skip Chrome extensions
  if (url.protocol === 'chrome-extension:') {
    return;
  }
  
  // API Requests: Network first, cache fallback
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirstStrategy(request, API_CACHE));
    return;
  }
  
  // Static assets (JS, CSS, images): Cache first
  if (
    request.destination === 'script' ||
    request.destination === 'style' ||
    request.destination === 'image' ||
    request.destination === 'font'
  ) {
    event.respondWith(cacheFirstStrategy(request, STATIC_CACHE));
    return;
  }
  
  // Pages: Network first, cache fallback
  event.respondWith(networkFirstStrategy(request, DYNAMIC_CACHE));
});

/**
 * Cache First Strategy
 * Best for: Static assets that rarely change
 */
async function cacheFirstStrategy(request, cacheName) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    const networkResponse = await fetch(request);
    
    // Cache successful responses
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error('[SW] Cache first failed:', error);
    
    // Return cached version if available
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline page for navigation requests
    if (request.mode === 'navigate') {
      return caches.match('/offline.html');
    }
    
    throw error;
  }
}

/**
 * Network First Strategy
 * Best for: Pages and API calls that need fresh data
 */
async function networkFirstStrategy(request, cacheName) {
  try {
    const networkResponse = await fetch(request);
    
    // Cache successful responses
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error('[SW] Network first failed, trying cache:', error);
    
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline page for navigation requests
    if (request.mode === 'navigate') {
      return caches.match('/offline.html');
    }
    
    throw error;
  }
}

// Background Sync (for offline homework plan submissions)
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-homework-plans') {
    event.waitUntil(syncHomeworkPlans());
  }
});

async function syncHomeworkPlans() {
  try {
    // Retrieve pending homework plans from IndexedDB
    // Send to API when back online
    console.log('[SW] Syncing homework plans...');
    
    // TODO: Implement actual sync logic when IndexedDB is set up
    
    return Promise.resolve();
  } catch (error) {
    console.error('[SW] Sync failed:', error);
    throw error;
  }
}

// Push Notifications (for study reminders)
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || '📚 Time to Study!';
  const options = {
    body: data.body || 'Your AI tutor is ready to help you learn!',
    icon: '/icon-192.png',
    badge: '/badge-72.png',
    vibrate: [200, 100, 200],
    tag: 'study-reminder',
    requireInteraction: false,
    actions: [
      { action: 'open', title: 'Start Learning', icon: '/icon-open.png' },
      { action: 'dismiss', title: 'Later', icon: '/icon-dismiss.png' },
    ],
  };
  
  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Notification Click Handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'open') {
    event.waitUntil(
      clients.openWindow('/dashboard')
    );
  }
});

