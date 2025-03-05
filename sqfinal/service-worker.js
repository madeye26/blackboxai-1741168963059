/**
 * Service Worker for Payroll System
 * Provides offline capabilities and caching of static assets
 */

const CACHE_NAME = 'payroll-cache-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/styles/main.css',
  '/styles/chart-styles.css',
  '/styles/dashboard-styles.css',
  '/styles/dark-theme.css',
  '/styles/arabic-typography.css',
  '/js/main.js',
  '/js/charts.js',
  '/js/dashboard-customizer.js',
  '/js/dashboard-drag-drop.js',
  '/js/leave-management.js',
  '/js/payroll.js',
  '/js/reports.js',
  '/js/theme-color-selector.js',
  '/js/theme-switcher.js',
  '/js/time-tracking.js',
  '/js/performance-optimizations.js'
];

// Install event - cache static assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - serve from cache, fall back to network
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          return response;
        }

        // Clone the request
        const fetchRequest = event.request.clone();

        return fetch(fetchRequest).then(response => {
          // Check if valid response
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // Clone the response
          const responseToCache = response.clone();

          // Only cache static assets and API responses
          const url = event.request.url;
          if (url.includes('/styles/') || url.includes('/js/') || url.includes('/images/') || url.includes('/api/')) {
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });
          }

          return response;
        });
      })
  );
});

// Handle messages from clients
self.addEventListener('message', event => {
  if (event.data.action === 'skipWaiting') {
    self.skipWaiting();
  }
});