// Dream Pattern Analyzer - Service Worker for PWA

const CACHE_NAME = 'dream-analyzer-cache-v1';
const urlsToCache = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './utils.js',
  './themes.css',
  './about.html',
  './charts.js',
  './sentiment.js',
  './tags.js',
  './wordcloud.js',
  './export.js',
  './pattern-examples.json'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request))
  );
});
