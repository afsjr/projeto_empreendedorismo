// ========================================
// SERVICE WORKER - CACHE OFFLINE
// Empreendedores CSM
// ========================================

const CACHE_NAME = 'ee-csm-v1';
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/pages/teoria.html',
    '/pages/plataforma.html',
    '/pages/mentor.html',
    '/pages/admin.html',
    '/css/styles.css',
    '/css/styles-neo.css',
    '/js/app.js',
    '/js/conteudo.js',
    '/js/mentor.js',
    '/validacao-dados.js',
    '/supabase-config.js',
    '/manifest.json',
    '/CSM.png',
    '/icons/icon-192.png',
    '/icons/icon-512.png'
];

const OFFLINE_PAGE = '/index.html';

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('[SW] Cache created');
            return cache.addAll(STATIC_ASSETS);
        })
    );
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter((name) => name !== CACHE_NAME)
                    .map((name) => caches.delete(name))
            );
        })
    );
    self.clients.claim();
});

self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    if (url.origin !== location.origin) return;

    if (request.method !== 'GET') return;

    event.respondWith(
        caches.match(request).then((cached) => {
            const networked = fetch(request)
                .then((response) => {
                    const clone = response.clone();
                    if (response.status === 200) {
                        caches.open(CACHE_NAME).then((cache) => {
                            cache.put(request, clone);
                        });
                    }
                    return response;
                })
                .catch(() => cached || caches.match(OFFLINE_PAGE));

            return cached || networked;
        })
    );
});

console.log('[SW] Service Worker loaded');