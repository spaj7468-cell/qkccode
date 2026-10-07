/* QKCcode service worker — полный офлайн: кэш всего сайта, network-first с фолбэком. */
const CACHE = 'qkccode-v2.0.0';
const CORE = [
  './', './index.html', './css/style.css',
  './js/app.js', './js/i18n.js', './js/dialects.js',
  './js/courses/html.js', './js/courses/javascript.js', './js/courses/python.js',
  './js/courses/lua.js', './js/courses/gdscript.js', './js/courses/csharp.js', './js/courses/qkc.js',
  './vendor/qkc-engine.js', './manifest.webmanifest',
  './assets/logo.png', './assets/favicon.png', './assets/favicon.ico',
  './assets/icon-192.png', './assets/icon-512.png', './assets/apple-touch-icon.png',
  './assets/icon-maskable-512.png'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;
  e.respondWith(
    fetch(req).then(res => {
      const copy = res.clone();
      caches.open(CACHE).then(c => { if (res.status === 200) c.put(req, copy); }).catch(() => {});
      return res;
    }).catch(() => caches.match(req).then(hit => hit || (req.mode === 'navigate' ? caches.match('./index.html') : null)))
  );
});
