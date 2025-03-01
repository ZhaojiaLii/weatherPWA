var cacheName = "staticCache"
var APIkey = '186bd32bbcadf6c77e6c370efba0b47d';
var tempdata = "";
var staticCache = [
    '/',
    'index.html',
    'pages/contact-me.html',
    'pages/next-page.html',
    'manifest.json',
    'favicon.ico',
    'scripts/app.js',
    'scripts/DB.js',
    'scripts/idb.js',
    'styles/style.css',
    'json/city.json',

    'images/bgdialog.jpeg',

    'images/background/bg.jpg',
    'images/background/offline.jpg',
    'images/background/bg1.jpg',

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
    'icons/location.svg',
    'icons/subscribed.svg',
    'icons/remove.svg',
    'icon.png'
];

self.addEventListener('install', function(e) {
    console.log('[Service Worker] Install');
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



var requestCache = 'requestCache';
var cacheFetchUrls = ['http://192.168.1.137:3000/sync'];

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

    var needCache = cacheFetchUrls.some(function (url) {
      return e.request.url.indexOf(url) > 1;
    })

    if (needCache) {
      caches.open(requestCache).then(function (cache) {
        return fetch(e.request).then(function (response) {
          if(response.statusText !== 'Not Found'){
            cache.put(e.request.url,response.clone())
            }
            return response;
        })
      })
    }
    
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




var db;
var store;
self.addEventListener('sync',function(e){
  //console.log('service worker need to sync in background...',e);
  if (e.tag == 'sync_test'){
    console.log("request from Weather API background sync fired");
    
    init = {
      method:'GET'
    }

    let msgPromise = new Promise(function (resolve, reject) {
      setTimeout(resolve,1000);
    })
    e.waitUntil(msgPromise.then(function (data) {
      var cityurl = 'http://api.openweathermap.org/data/2.5/weather?q='+tempdata+'&APPID='+APIkey;
      var request = new Request(cityurl,init);
      fetch(cityurl).then(function (response) {
        if (response.status !== 200) {
          console.log('There was a problem. Status Code: ' + response.status);
          return;
        }
        response.json().then(function(data) {
          var request = indexedDB.open("weatherPWA");
          request.onsuccess = function (event) {
            console.log(data.name);
            db = this.result;
            var tx = db.transaction("real time",'readwrite');
            store = tx.objectStore("real time");
            var obj = {
              id: data.name,  
              des: JSON.stringify(data)
            }
            var req = store.add(obj);
            req.onsuccess = function (event) {     
                //console.log(obj+" insert in DB successful");
                
            };
            req.onerror = function (event) {
                console.log(obj+" insert in DB error",this.error);
            }
          } 
          request.onerror = function (event) {
              console.log("opendb:", event);
          };
          request.onupgradeneeded = function (event) {
            var db = event.target.result;
            console.log("opened...",db);
            var store1;
            if (!db.objectStoreNames.contains( "real time" )) {
              store1 = db.createObjectStore("real time", {keyPath:'id',autoIncrement: true});
              store1.createIndex('des','des',{unique:false});
              console.log("new DB for weathers created");
            }else{
              console.log("weather DB already existed");
            }
      }   
          
          
        });
      }).catch(function (error) {
        console.log(error);
      })

      return fetch(request);
    }).then(function (response) {
      console.log(response);
      return response
    })
  )
    console.log("sync finished!")

  }else if(e.tag == 'periodicSync'){
    console.log("Periodic background Sync fired.");
    fetch('http://192.168.1.137:3000/sync').then(function (response) {
      if (response.status !== 200) {
        console.log('Looks like there was a problem. Status Code: '+response.status);
        return;
      }
      //console.log(response);
      response.text().then(function (data) {
        console.log("succeed access to sync interface");
        var request = indexedDB.open("weatherPWA");
        request.onupgradeneeded = function (event) {
          var store = event.target.result.createObjectStore("real time", {keyPath:'id',autoIncrement: true });  
          store.createIndex('time','time',{unique:false});
        }
        request.onsuccess = function (event) {
          console.log(data);
          db = this.result;
          var tx = db.transaction("real time",'readwrite');
          store = tx.objectStore("real time");
          var obj = {
            id:0,
            time:data
          }
          var req = store.put(obj);
          req.onsuccess = function (event) {     
              //console.log(obj+" insert in DB successful");
              
          };
          req.onerror = function (event) {
              console.log(obj+" insert in DB error",this.error);
          }
        }
        request.onerror = function (event) {
          console.log("opendb:", event);
        };
        
        console.log(data);
      })
    })

  }
});
var D = 0 ;
var requestDatA = function (url) {
  
  
}

self.addEventListener('message',function (e) {
  e.source.postMessage(D);
})

// self.addEventListener('periodicsync',function (event) {
//   if (event.registration.tag === "periodicSync") {
//     console.log("Periodic event occurred: ", event);
//   }  
// })

self.addEventListener('message' , function(e){
  var data = JSON.parse(e.data),
      type = data.type,
      msg = data.msg;

  //console.log(`service worker get message type: ${type} ; msg : ${msg.name}`);
  tempdata = msg.name;

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
  console.log("get push request");
  var data = e.data;
    if (e.data) {
        data = data.json();
        console.log('push data is：', data);
        
        var options = {
          dir:'ltr',
          icon: './icon.png',
          body: data,
          image: './images/notification/weather.gif',
          silent:'true',
          tag : 'pwa-starter',
          renotify : true,
          actions:[{
            action : 'next-page',
            title : 'next page'
          },{
              action : 'contact-me',
              title : 'contact me'
          }]
        };
        self.registration.showNotification("A notification from server.",options);        
    } 
    else {
        console.log('push request has no content');
    }
  });


self.addEventListener('notificationclick', event => {  
    var action = event.action;
    switch(action){
      case 'next-page':
        console.log('next page clicked');
        break
      case 'contact-me':
        console.log('contact me clicked');
        break
      default:
        console.log(`no handled: ${event.action}`);
        action = 'default';
        break
    }
    // service worker can't handle DOM, but we can communicate with client
    event.waitUntil(   
      self.clients.matchAll().then(function (clients) {
        clients.forEach(client => {
          client.postMessage(action);
        });
      })
    )
    event.notification.close();  
  });
self.addEventListener('notificationclose', event => {  
    // Do something with the event  
  });

