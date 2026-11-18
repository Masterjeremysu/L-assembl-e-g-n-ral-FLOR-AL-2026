/**
 * Service Worker PWA - Suivi AG & Votes Le Floréal 2026
 * Assure le chargement instantané, le mode plein écran et la résilience hors-ligne
 */

const CACHE_NAME = 'floreal-ag-2026-v4';
const STATIC_ASSETS = [
  './',
  './index.html',
  './public.html',
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

// Activation : nettoyage des anciens caches et prise de contrôle immédiate
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

  // Stratégie Network-First avec fallback Cache pour garantir la fraîcheur du code et le fonctionnement hors-ligne
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        // En cas de coupure réseau ou mode hors-ligne, fallback sur le cache
        return caches.match(event.request);
      })
  );
});
