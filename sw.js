/**
 * Service Worker PWA - Suivi AG & Votes Le Floréal 2026
 * Assure le chargement instantané, le mode plein écran et la résilience hors-ligne
 */

const CACHE_NAME = 'floreal-ag-2026-v3';
const STATIC_ASSETS = [
  './',
  './index.html',
  './css/style.css',
  './css/auth.css',
  './js/data.js',
  './js/audit.js',
  './js/auth.js',
  './js/sync.js',
  './js/cloud.js',
  './js/pwa.js',
  './js/app.js',
  './assets/icon.svg',
  './manifest.webmanifest'
];

// Installation : mise en cache des fichiers statiques
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activation : nettoyage des anciens caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// Interception des requêtes réseau
self.addEventListener('fetch', (event) => {
  const url = event.request.url;

  // IMPORTANT : Toutes les requêtes dynamiques temps réel (Firebase, PeerJS, WebRTC, API externe)
  // ne doivent JAMAIS être bloquées par le cache statique
  if (
    url.includes('firebasedatabase.app') ||
    url.includes('peerjs') ||
    url.includes('gstatic.com/firebasejs') ||
    url.includes('.json') ||
    event.request.method !== 'GET'
  ) {
    return;
  }

  // Stratégie Stale-While-Revalidate pour les fichiers de l'application
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      }).catch(() => {
        // En cas de coupure réseau complète, fallback sur le cache
        return cachedResponse;
      });

      return cachedResponse || fetchPromise;
    })
  );
});
