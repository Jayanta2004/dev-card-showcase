// service-worker.js
const CACHE_NAME = 'weather-dashboard-v1';
const ASSETS = [
  '/',
  '/projects/Weather-Dashboard/index.html',
  '/projects/Weather-Dashboard/style.css',
  '/projects/Weather-Dashboard/app.js',
  'https://openweathermap.org/img/wn/10d@2x.png',
  'https://openweathermap.org/img/wn/10d.png',
  'https://openweathermap.org/img/wn/04d.png',
  'https://openweathermap.org/img/wn/01d.png',
  'https://openweathermap.org/img/wn/02d.png',
  'https://openweathermap.org/img/wn/03d.png',
  'https://openweathermap.org/img/wn/09d.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request).then(fetchRes => {
        return caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, fetchRes.clone());
          return fetchRes;
        });
      }).catch(() => {
        // Optionally, return fallback page or data
      });
    })
  );
});
