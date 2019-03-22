var cacheName = "weatherPWA"
var filesToCache = [
    '/',
    'index.html',
    'favicon.ico',
    'scripts/app.js',
    'scripts/DB.js',
    'scripts/idb.js',
    'styles/style.css',

    'images/bgdialog.jpeg',

    'images/background/afternoon.jpeg',
    'images/background/morning.jpg',
    'images/background/night.gif',
    'images/background/sunset.jpeg',

    'images/weathericon/clear.png',
    'images/weathericon/cloudy.png',
    'images/weathericon/rain.png',
    'images/weathericon/fog.png',
    'images/weathericon/mist.png',
    'images/weathericon/snow.png',
    'images/weathericon/wind.png',

    'images/weatherbackground/cloudyImg.jpg',
    'images/weatherbackground/drizzleImg.jpg',
    'images/weatherbackground/fogImg.jpeg',
    'images/weatherbackground/mistImg.jpg',
    'images/weatherbackground/rainImg.jpg',
    'images/weatherbackground/stormImg.jpg',
    'images/weatherbackground/sunnyImg.jpg',
    'images/weatherbackground/windyImg.jpg',

    'icons/addwhite.svg',
    'icons/refreshwhite.svg'
];

self.addEventListener('install', function(e) {
    //console.log('[Service Worker] Install');
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
    //console.log('[ServiceWorker] Activate');
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
      //console.log('[ServiceWorker] Fetch', e.request.url);
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

  self.addEventListener('sync',function (e) {
    console.log(`service worker need to sync in background，tag: ${e.tag}`);
    var init = {
      method : `GET`
    };
    if (e.tag === `sample_sync`){
      var request = new Request(`sync?name=AlienZHOU`, init);
      e.waitUntil(
          fetch(request).then(function (response) {
              response.json().then(console.log.bind(console));
              return response;
          })
      );
    }
  })

  self.addEventListener('push',function (e) {
    e.waitUntil(
      self.registration.showNotification("Hey!")
    )
  });
  self.addEventListener('notificationclick', event => {  
    // Do something with the event  
    event.notification.close();  
  });
  self.addEventListener('notificationclose', event => {  
    // Do something with the event  
  });