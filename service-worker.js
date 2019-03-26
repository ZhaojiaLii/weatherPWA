
var cacheName = "staticCache"
var staticCache = [
    '/',
    'index.html',
    'manifest.json',
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
    'icons/refreshwhite.svg',
    'icon.png'
];

self.addEventListener('install', function(e) {
    //console.log('[Service Worker] Install');
    e.waitUntil(
      caches.open(cacheName)
      .then(function(cache) {
          console.log('[Service Worker] Caching all: app shell and content');
          return cache.addAll(staticCache);})
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



  
var requestCache = 'requestCache'

self.addEventListener('fetch', function(e) {
      //console.log('[ServiceWorker] Fetch', e.request.url);
      e.respondWith(
        caches.match(e.request).then(function(cache) {
          return cache || fetch(e.request)
          .then(function(response){
            return caches.open(requestCache)
            .then(function(cache){
              cache.put(e.request.url,response.clone());
              return response;
            });
          });
        }).catch(function(){
          console.log("error in fetch request");
        })
    );

    
    // caches.open(requestCache).then(function (cache) {
    //   return fetch(e.request).then(function (response) {
    //     console.log(response);
    //     if (response.statusText !== 'Not Found') {
    //       cache.put(e.request.url,response.clone())
    //     }
    //     return response;
    //   })
    // })    
  });

  self.addEventListener('sync',function (e) {
    console.log('service worker need to sync in background...',e);
    if (e.tag === 'sync-test'){
      console.log("syncing new request...");
      // const url = 'https://localhost:3000/sync';
      init = {
        method:'GET'
      }
      var request = new Request('http://localhost:3000/sync', init);
      e.waitUntil(
          fetch(request).then(function (response) {
              return response.json();
          })
      );
      console.log("sync finished!")
    }else if(e.tag === 'sample_sync_event'){
        console.log('2222222222222');
    }
  })

  self.addEventListener('message' , function(e){
    var data = JSON.parse(e.data),
        type = data.type,
        msg = data.msg;

    console.log(`service worker收到消息 type: ${type} ; msg : ${JSON.stringify(msg)}`)

    dealData.trigger(type , msg);
})

class DealData{
  constructor(){
      this.tagDatas = {};
  }
  //save tag and callback function
  once(tag , callback){
      this.tagDatas[tag] || (this.tagDatas[tag] = []);
      this.tagDatas[tag].push(callback);
  }
  
  //after received data, call callback function
  trigger(tag , data){
      this.tagDatas[tag] = this.tagDatas[tag] || [];
      let tagCallback ;
      while(tagCallback = this.tagDatas[tag].shift()){
          tagCallback(data)
      }
  }
}
const dealData = new DealData();





self.addEventListener('push',function (e) {
  var data = e.data;
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

