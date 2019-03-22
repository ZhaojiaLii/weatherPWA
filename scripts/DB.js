const DB_name = "weatherPWA";
const DB_version = 1;
const DB_store_name_1 = 'weather';
var db;
var store;

var DBadd = ()=>{
    'use strict';
  
    //check for support
    if (!('indexedDB' in window)) {
      console.log('This browser doesn\'t support IndexedDB');
      return;
    }

    function openDB(city,temp,des) {
        var request = indexedDB.open(DB_name,DB_version);
        request.onsuccess = function (event) {
            db = this.result;
            var tx = db.transaction(DB_store_name_1,'readwrite');
            store = tx.objectStore(DB_store_name_1);
            var today = new Date();
            var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
            var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
            var updatetime = date+" "+time;     
                 
            var obj = {
                city:city, 
                temp:temp, 
                description:des,
                update_time: updatetime}
            var req = store.add(obj);
            req.onsuccess = function (event) {     
                //console.log(obj+" insert in DB successful");
            };
            req.onerror = function (event) {
                console.log(obj+" insert in DB error",this.error);
            }
            
            
        };
        request.onerror = function (event) {
            console.log("opendb:", event);
        };

        request.onupgradeneeded = function (event) {
            var store = event.currentTarget.result.createObjectStore(
                DB_store_name_1, {keyPath:'city'});  
                store.createIndex('temp','temp',{unique:false});
                store.createIndex('description','description',{unique:false});
                store.createIndex('update_time','update_time',{unique:false});
        }     
    }
    cities.forEach(function (city) {
        var url = 'http://api.openweathermap.org/data/2.5/weather?q='+city+'&APPID='+APIkey;
        getJSON(url).then((data) => {   
            var city = data.name;
            var temp = (data.main.temp-273.15).toString();
            if (temp.includes('.')) {
                var Temp = temp.slice(0,temp.indexOf('.'))+"℃";
            }else{
                var Temp = temp.slice(0,temp.length)+"℃";
            }
            var des = data.weather[0].main;
            openDB(city,Temp,des);
        },function(status){
            console.log('Something went wrong, status is ' + status);
        });
    });


};


var DBrefresh = ()=>{
    'use strict';

    function openDB(city,temp,des) {
        var request = indexedDB.open(DB_name,DB_version);
        request.onsuccess = function (event) {
            db = this.result;
            var tx = db.transaction(DB_store_name_1,'readwrite');
            store = tx.objectStore(DB_store_name_1);
            var today = new Date();
            var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
            var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
            var updatetime = date+" "+time;  
                 
            var obj = {
                city:city, 
                temp:temp, 
                description:des,
                update_time: updatetime}
                 
            var req = store.put(obj);

            req.onsuccess = function (event) {
                
                //console.log(obj+" insert in DB successful");
            };
            req.onerror = function (event) {
                console.log(obj+" insert in DB error",this.error);
            }
        };
        request.onerror = function (event) {
            console.log("opendb:", event);
        };

      
    }
    cities.forEach(function (city) {
        var url = 'http://api.openweathermap.org/data/2.5/weather?q='+city+'&APPID='+APIkey;
        getJSON(url).then((data) => {   
            var city = data.name;
            var temp = (data.main.temp-273.15).toString();
            if (temp.includes('.')) {
                var Temp = temp.slice(0,temp.indexOf('.'))+"℃";
            }else{
                var Temp = temp.slice(0,temp.length)+"℃";
            }
            var des = data.weather[0].main;
            openDB(city,Temp,des);
        },function(status){
            console.log('Something went wrong, status is ' + status);
        });
    });

    var today = new Date();
    var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
    var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    var updatetime = date+" "+time;  
    var update_time = document.getElementById('update-time');
    if (!document.getElementById('time')) {
        var timeshow = document.createElement('p');
        update_time.appendChild(timeshow);
        timeshow.id = 'time';
        timeshow.innerHTML = "Last update time: "+ updatetime;
        timeshow.style.color = 'white';
        timeshow.style.fontSize = '20px';
        timeshow.style.textAlign = 'center';
        timeshow.style.paddingBottom = '20px';
    }else{
        var timeshow = document.getElementById('time');
        timeshow.innerHTML = "Last update time: "+ updatetime;
    }
};

var CARDrefresh = ()=>{
    'use strict';

    function openDB(city) {
        var request = indexedDB.open(DB_name,DB_version);
        request.onsuccess = function (event) {
            db = this.result;
            var tx = db.transaction(DB_store_name_1,'readonly');
            store = tx.objectStore(DB_store_name_1);  
                 
            var req = store.get(city);
            
            req.onsuccess = function (event) {
                var targettemp = req.result.temp;
                var targetdescription = req.result.description; 
                var icon = document.getElementById('weather-icon');
                var degree = document.getElementById('degree');
                var description = document.getElementById('weather');
                var background = document.getElementById('card'); 
                weathers.forEach(function (element) {
                    if (element.name == targetdescription) {
                        icon.src = element.iconurl;                
                        background.style.backgroundImage = "url('"+element.backgroundurl+"')";
                    }
                })
                degree.innerHTML = targettemp;
                description.innerHTML = targetdescription;
                
            };
            req.onerror = function (event) {
                console.log(obj+" insert in DB error",this.error);
            }
        };
        request.onerror = function (event) {
            console.log("opendb:", event);
        };

      
    }
    
    alreadyadded.forEach(function (city) {
        openDB(city);
    })
};

var getJSON = function (url) {
    var type = 'get';  
    return new Promise(function (resolve,reject) {
        var xhr = new XMLHttpRequest();
        xhr.open(type,url,true);
        xhr.responseType = 'json';
        xhr.onload = function(){
            var status = xhr.status;
            if (status == 200) {
                resolve(xhr.response);
            } else {
                reject(status);
            }
        };
        xhr.send();
    });
};

