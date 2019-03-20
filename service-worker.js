var cacheName = "weatherPWA"
var filesToCache = [
    '/',
    'index.html',
    'favicon.ico',
    'scripts/app.js',
    'styles/style.css',
    'images/afternoon.jpg',
    'images/afternoon.jpeg',
    'images/bgdialog.jpeg',
    'images/clear.png',
    'images/cloudy.png',
    'images/cloudyImg.jpeg',
    'images/cloudyImg.jpg',
    'images/morning.jpg',
    'images/morning.gif',
    'images/night.gif',
    'images/rain.png',
    'images/drizzle.jpg',
    'images/rainImg.jpg',
    'images/sunset.jpeg',
    'images/sunnyImg.jpg',
    'icons/addwhite.svg',
    'icons/refreshwhite.svg'
];

self.addEventListener('install', function(e) {
    console.log('[Service Worker] Install');
    e.waitUntil(
      caches.open(cacheName)
      .then(function(cache) {
          console.log('[Service Worker] Caching all: app shell and content');
          return cache.addAll(filesToCache);})
      .then(function(){
        self.skipWaiting()
      })
    );
  });
  
  self.addEventListener('activate', function(e) {
    console.log('[ServiceWorker] Activate');
    e.waitUntil(
        caches.keys().then(function(keyList){
            return Promise.all(keyList.map(function(key){
                if (key !== cacheName) {
                console.log('[ServiceWorker] Removing old cache', key);
                return caches.delete(key);
            }
            })).catch(function(error){console.log(error)});
        })
        );
    return self.clients.claim();
  });
  
  self.addEventListener('fetch', function(e) {
      console.log('[ServiceWorker] Fetch', e.request.url);
      e.respondWith(
        caches.match(e.request).then(function(response) {
          return response || fetch(e.request).then(function(response){
            return caches.open(cacheName).then(function(cache){
              cache.put(e.request,response.clone());
              return response;
            });
          });
        }).catch(function(){
          console.log("error in request");
        })
    );
  });