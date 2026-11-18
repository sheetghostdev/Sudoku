// Offline support. When online, the app always loads the newest version from
// the web, so updates arrive the next time it is opened. When offline, the
// last copy saved on the phone is used instead.
const CACHE = 'cozy-sudoku-v3';
const SHELL = ['./', 'index.html', 'manifest.webmanifest', 'icons/favicon.svg', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/apple-touch-icon.png'];
const FONT_HOSTS = ['fonts.googleapis.com', 'fonts.gstatic.com'];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(SHELL.map((u) => new Request(u, { cache: 'reload' })))).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((names) => Promise.all(names.filter((n) => n !== CACHE).map((n) => caches.delete(n))))
      .then(() => self.clients.claim())
  );
});

function timeout(ms) {
  return new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), ms));
}

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  if (url.origin === self.location.origin) {
    // Network first, so a new version shows up right away. Fall back to the
    // saved copy when offline or when the network is very slow.
    const key = url.origin + url.pathname;
    event.respondWith(
      caches.open(CACHE).then((cache) =>
        Promise.race([fetch(req, { cache: 'no-cache' }), timeout(4000)])
          .then((res) => {
            if (res.ok) cache.put(key, res.clone());
            return res;
          })
          .catch(() => cache.match(key).then((hit) => hit || cache.match('./') || fetch(req)))
      )
    );
    return;
  }

  if (FONT_HOSTS.includes(url.hostname)) {
    // Fonts never change, so the saved copy is always fine.
    event.respondWith(
      caches.open(CACHE).then((cache) =>
        cache.match(req).then((hit) => hit || fetch(req).then((res) => {
          if (res.ok || res.type === 'opaque') cache.put(req, res.clone());
          return res;
        }))
      )
    );
  }
});
