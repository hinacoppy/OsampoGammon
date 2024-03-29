/* serviceWorker.js */
// (参考) https://qiita.com/kaihar4/items/c09a6d73e190ab0b9b01
'use strict';

const CACHE_NAME = "Osampo-v20211111";
const ORIGIN = (location.hostname == 'localhost') ? '' : location.protocol + '//' + location.hostname;

const STATIC_FILES = [
  ORIGIN + '/OsampoGammon/',
  ORIGIN + '/OsampoGammon/index.html',
  ORIGIN + '/OsampoGammon/manifest.json',
  ORIGIN + '/OsampoGammon/icon/favicon.ico',
  ORIGIN + '/OsampoGammon/icon/apple-touch-icon.png',
  ORIGIN + '/OsampoGammon/icon/android-chrome-96x96.png',
  ORIGIN + '/OsampoGammon/icon/android-chrome-192x192.png',
  ORIGIN + '/OsampoGammon/icon/android-chrome-512x512.png',
  ORIGIN + '/OsampoGammon/css/OsampoGammon.css',
  ORIGIN + '/css/font-awesome-animation.min.css',
  ORIGIN + '/OsampoGammon/js/OsgBoard_class.js',
  ORIGIN + '/OsampoGammon/js/OsgChequer_class.js',
  ORIGIN + '/OsampoGammon/js/OsgID_class.js',
  ORIGIN + '/OsampoGammon/js/OsgUtil_class.js',
  ORIGIN + '/OsampoGammon/js/OsgGame_class.js',
  ORIGIN + '/js/fontawesome-all.min.js',
  ORIGIN + '/js/jquery-3.6.0.min.js',
  ORIGIN + '/js/inobounce.min.js'
];

const CACHE_KEYS = [
  CACHE_NAME
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return Promise.all(
        STATIC_FILES.map(url => {
          return fetch(new Request(url, { cache: 'no-cache', mode: 'no-cors' })).then(response => {
            return cache.put(url, response);
          });
        })
      );
    })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => {
          return !CACHE_KEYS.includes(key);
        }).map(key => {
          return caches.delete(key);
        })
      );
    })
  );
});

