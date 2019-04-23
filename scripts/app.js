'use strict'
var Privatekey = 'TIrMnK-r--TE7Tnwf-x4JfKwuFKz5tmQuDRWYmuwbhY';
var APIkey = '186bd32bbcadf6c77e6c370efba0b47d';
var testurl = 'http://192.168.1.137:3000/sync';
var windowDialog = document.getElementById('dialog');
var card = document.getElementById('card');
var description = "";
var temp = 0;
var cities = ['Paris','Jinzhou','Tokyo','New York','Greater London','Shanghai'];
var alreadyadded =[];
var sub_state = 0;
if (window.localStorage.getItem("subscription")) {
    console.log("Welcome back.")
    if (window.localStorage.getItem("subscription")===1) {
        
    }
}else{
    console.log("first time launch the application")
}
window.localStorage.setItem("subscription",0);
for(var i=0; i<window.localStorage.length;i++){
    alreadyadded.push(window.localStorage.key(i));
}
var weathers = [
    
    {
        id:0,
        name:'Rain',
        backgroundurl:'/images/weatherbackground/rainImg.jpg',
        iconurl:'/images/weathericon/rain.png'
    },
    {
        id:1,
        name:'Clear',
        backgroundurl:'/images/weatherbackground/sunnyImg.jpg',
        iconurl:'/images/weathericon/clear.png'
    },
    {
        id:2,
        name:'Clouds',
        backgroundurl:'/images/weatherbackground/cloudyImg.jpg',
        iconurl:'/images/weathericon/cloudy.png'
    },
    {
        id:3,
        name:'Windy',
        backgroundurl:'/images/weatherbackground/windyImg.jpg',
        iconurl:'/images/weathericon/wind.png'
    },
    {
        id:4,
        name:'Storm',
        backgroundurl:'/images/weatherbackground/stormImg.jpg',
        iconurl:'/images/weathericon/thunderstorm.png'
    },
    {
        id:5,
        name:'Drizzle',
        backgroundurl:'/images/weatherbackground/drizzleImg.jpg',
        iconurl:'/images/weathericon/rain.png'
    },
    {
        id:6,
        name:'Mist',
        backgroundurl:'/images/weatherbackground/mistImg.jpg',
        iconurl:'/images/weathericon/mist.png'
    },
    {
        id:7,
        name:'Fog',
        backgroundurl:'/images/weatherbackground/fogImg.jpeg',
        iconurl:'/images/weathericon/fog.png'
    }
    ];

settimebackground();  
//DBadd();  //get all the weather and saved in indexedDB
refreshPage();  //make sure the added weather not disappear

var getstate = window.localStorage.getItem("subscription");
if (getstate === 0) {
    $('#subscription_btn').remove();
    $('#add_btn').remove();
}

document.getElementById('add_btn').addEventListener('click',function(){
    showdialog();
    
});

document.getElementById('refresh_btn').addEventListener('click',function(){
    //DBrefresh();
    //CARDrefresh();
    locateME();
});

document.getElementById('butAddCity').addEventListener('click',function(){
    var city = getSelected();
    handleJSON(city);
    hidedialog();
});

document.getElementById('butAddCancel').addEventListener('click',function(){
    hidedialog();
});

$('#remove_btn').click(function () {
    showRemove();
    
})

function searchADD(id) {
    var url = 'http://api.openweathermap.org/data/2.5/weather?id='+id+'&APPID='+APIkey;
    getJSON(url).then((data)=>{
        var city = data.name;
        var temp = (data.main.temp-273.15).toString();
        if (temp.includes('.')) {
            var Temp = temp.slice(0,temp.indexOf('.')+2)+"℃";
        }else{
            var Temp = temp.slice(0,temp.length)+"℃";
        }
        var des = data.weather[0].main;
        console.log(des);
        addcard(city,Temp,des);
        var jsonstr = JSON.stringify(data)
        window.localStorage.setItem(city,jsonstr);
    },function (status) {
        console.log('Something went wrong, status is ' + status);
    })
}

function showdialog() {
    var bg = document.getElementById('all');
    
    if (windowDialog.style.display =='none') {
        windowDialog.style.display = 'block';
    }else{
        windowDialog.style.display = 'none';
        
    }
}
function hidedialog(){
    var bg = document.getElementById('all');
    
    if (windowDialog.style.display =='block') {
        windowDialog.style.display = 'none';
    }else{
        windowDialog.style.display = 'block';
    }
}

function getSelected() {
    var select = document.getElementById('selectCityToAdd');
    var index = select.selectedIndex;
    var key = select.options[index].value;
    var text = select.options[index].text;
    return text;
}

function handleJSON(city) {

    var request = indexedDB.open(DB_name,DB_version);
    request.onsuccess = function (event) {
        db = this.result;
        var tx = db.transaction(DB_store_name_1,'readwrite');
        store = tx.objectStore(DB_store_name_1);
        var today = new Date();
        var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
        var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
        var updatetime = date+" "+time;  
        var req = store.get(city);
        req.onerror = function (event) {
            console.log(error);
        } 
        req.onsuccess = function (event) {
            var targetcity = req.result.city;
            var targettemp = req.result.temp;
            var targetdescription = req.result.description; 
            var jsonstr = JSON.stringify(req.result);
            window.localStorage.setItem(targetcity,jsonstr);
            console.log(req.result," object got.");
            if (!alreadyadded.includes(targetcity)) {
                addcard(targetcity,targettemp,targetdescription);
                alreadyadded.push(targetcity);
            }else{
                alert("city already has been added. cities: "+alreadyadded);
            }
            
        }
    }
    
}

function refreshPage() {
    if (window.localStorage.length===0) {
        return
    }else if(window.localStorage.length > 1){
        var showcity = [];
        for (let i = 0; i < window.localStorage.length-1; i++) {
            var element = window.localStorage.getItem(window.localStorage.key(i));
            var json = JSON.parse(element);
            var temp = (json.main.temp-273.15).toString();
            if (temp.includes('.')) {
                var Temp = temp.slice(0,temp.indexOf('.')+2)+"℃";
            }else{
                var Temp = temp.slice(0,temp.length)+"℃";
            }
            addcard(json.name,Temp,json.weather[0].main);
            showcity.push(json.name);
        }
        console.log(showcity + " is reloaded.");
    }
    
}

function addcard(city,temp,weather) {

    var obj = {};
    var value;
    weathers.forEach(function (element) {
        if (element.name === weather) {
            value = element
        }
    });
    
    
    var createCard = {

        createcard:function () {

            var div = document.createElement('div');
            div.className = "container-card";
            div.id = city;
            div.style.position = "relative";
            div.style.marginTop = "20px";
            
            div.style.backgroundImage = "url('"+value.backgroundurl+"')";
            div.style.boxShadow = '5px 5px 5px';

            var carddiv = document.createElement('div');
            carddiv.className = "card-default"; 

            var imgdiv = document.createElement('div');
            imgdiv.className = 'image-weather';   

            var img = document.createElement('img');
            img.className = "weather-icon";
            img.id = "weather-icon";
            img.src = value.iconurl;
            img.style.position = "absolute";
            img.style.top = '0';
            img.style.bottom = '0';
            img.style.left = '0';
            img.style.right = '200px';
            img.style.margin = "auto";
            img.style.width = "130px";
            img.style.height = "130px";

            var discriptiondiv = document.createElement('div');
            discriptiondiv.className = "discription-weather";   
            discriptiondiv.style.position = "absolute";
            discriptiondiv.style.top = '100px';
            discriptiondiv.style.bottom = '0';
            discriptiondiv.style.left = '200px';
            discriptiondiv.style.right = '0';
            discriptiondiv.style.textAlign = 'center';

            var degree = document.createElement('span');
            degree.className = "degree";
            degree.innerHTML = temp;
            var citydiv = document.createElement('div');
            citydiv.className = "city";       
            var cityname = document.createElement('span');
            cityname.className = "city-name";
            cityname.innerHTML = city;
            var space = document.createElement('span');
            space.innerHTML = "&nbsp;&nbsp;"
            var Weather = document.createElement('span');
            Weather.className = 'weather';
            Weather.id = 'weather';
            Weather.innerHTML = weather;

            discriptiondiv.appendChild(degree);         
            citydiv.appendChild(cityname);
            citydiv.appendChild(space);
            citydiv.appendChild(Weather);
            discriptiondiv.appendChild(citydiv);
            imgdiv.appendChild(img);
            carddiv.appendChild(imgdiv);         
            carddiv.appendChild(discriptiondiv);
            div.appendChild(carddiv);
            document.body.appendChild(div);       
        },
    };

    createCard.createcard();
    
    setbackground(weather);
    seticon(weather);
    changetextcolor(weather);
}

function getindex(weather) {
    var obj = {};
    weathers.forEach(function (v,i) {
        obj[v.id]=v;
    });
    weathers.forEach(function (element) {
        if (element.name == weather) {
            return element;
        }
    });
}

function setbackground(weather) {
    var obj = {};
    var value;
    weathers.forEach(function (v,i) {
        obj[v.id]=v;
    });
    weathers.forEach(function (element) {
        if (element.name == weather) {
            value = element;
        }
    });
    var url = value.backgroundurl ;
    var getcard = document.getElementById('card');
    //var url = "url('/images/"+weather+"Img.jpg')"
    
    getcard.style.backgroundImage = "url('"+url+"')";
    getcard.style.backgroundSize = 'cover';
}

function seticon(weather) {
    var obj = {};
    var value;
    weathers.forEach(function (v,i) {
        obj[v.id]=v;
    });
    weathers.forEach(function (element) {
        if (element.name == weather) {
            value = element;
        }
    })
    var url = value.iconurl;
    var geticon = document.getElementById('weather-icon');
    geticon.src = url;
}

function settimebackground() {
    var state = "none";
    var url = "";
    var time = new Date();
    var hour = time.getHours();

    if (hour<8) {
        state = 'night';
        url = '/images/background/iphoneX.jpg';
        console.log(hour+' hours at '+state)
    }else if (hour<12) {
        state = 'morning';
        url = '/images/background/iphoneX.jpg';
        console.log(hour+' hours in the '+state)
    }else if (hour<17){
        state = 'afternoon';
        url = '/images/background/iphoneX.jpg';
        console.log(hour+' hours in the '+state)
    }else if (hour<20) {
        state = 'sunset';
        url = '/images/background/iphoneX.jpg';
    }
    else if (hour<24) {
        state = 'night';
        url = '/images/background/iphoneX.jpg';
        console.log(hour+' hours at '+state)
    }
    var getbackground = document.getElementById('all');
    //getbackground.style.backgroundImage = "url('"+url+"')";
    getbackground.style.backgroundImage = "url(/images/background/bg1.jpg)"
    getbackground.style.backgroundSize = 'cover';
    getbackground.style.backgroundRepeat = 'no-repeat';
    //getbackground.style.backgroundPosition = 'center center';
    getbackground.style.backgroundColor = '#CCCCCC';
}

function changetextcolor(weather) {
    var getdegree = document.getElementById('degree');
    var getcity = document.getElementById('city-name');
    var getweather = document.getElementById('weather');
    if (weather=='Clouds') {
        getdegree.style.color = '#ffffff';
        getcity.style.color = '#ffffff';
        getweather.style.color = '#ffffff';
    }else if(weather == 'Clear'){
        getdegree.style.color = '#000000';
        getcity.style.color = '#000000';
        getweather.style.color = '#000000';
    }else if(weather == 'Rain'){
        getdegree.style.color = '#ffffff';
        getcity.style.color = '#ffffff';
        getweather.style.color = '#ffffff';
    }else if(weather == 'Drizzle'){
        getdegree.style.color = '#ffffff';
        getcity.style.color = '#ffffff';
        getweather.style.color = '#ffffff';
    }
    
}

var unvalidurl = 'http://api.openweathermap.org/data/2.5/weather?id=undefined&APPID='+APIkey;
var getJSON = function (url) {
    if (url === unvalidurl) {
        alert("cannot find the city from server");
        $('.hint-Selector').hide();
        $('#search-box').val("") ;
    }else{
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
    }
    
};

function readJSONfile(file,callback) {
    var rawFile = new XMLHttpRequest();
    rawFile.overrideMimeType("application/json");
    rawFile.open("GET",file,true);
    rawFile.onreadystatechange = function () {
        if (rawFile.readyState === 4 && rawFile.status == "200") {
            callback(rawFile.responseText);
        }
    }
    rawFile.send(null);
}
let alreadyAdded = [];
function getCityIDbyName(name,data) {
    var id = 0;
    var country = "";
    var lon = 0;
    var lat = 0;
    data.forEach(function (element) {
        if (element.name===name) {
            id = element.id;
            country = element.country;
            lon = element.coord.lon;
            lat = element.coord.lat;
            var msg = "city: "+name+",id: "+id+",country: "+country+",coord: "+lon+" "+lat;
            console.log(msg);
            alreadyAdded.push(name);
            return 
        }
    });
    if (id === 0) {
        console.log("city doesn't exist...");
        alert("city doesn't exist...");
        return id;
    }else{
        return id;
    }
    
}
$('.hintShow').append('<select class="hint-Selector" style="width:200px; height:50px" onclick="getClick()" multiple></select>');
$('.hint-Selector').hide();
$('.hintShow').addClass("hintShow");
$('.hint-Selector').addClass("hint-Selector");

function showHint(string) {
    
    string = string.slice(0,1).toUpperCase()+string.slice(1).toLowerCase();
    //console.log(string);
    if (string === "") {
        $('.hint').remove();
        $('.hint-Selector').hide();
    }else{
        readJSONfile("/json/city.json", function(text){
            var data = JSON.parse(text);
            
            var cityFind = [];
            var cityID = [];
            data.forEach(function (element) {
                if (element.name.includes(string)) {
                    cityFind.push(element.name+" "+element.country)
                    cityID.push(element.id);
                }
            })
            var showCity = [];
            var showID = [];
            if (cityFind.length<30) {
                for (let i = 0; i < cityFind.length; i++) {
                    const element1 = cityFind[i];
                    const element2 = cityID[i];
                    showCity.push(element1);
                    showID.push(element2);
                }
            }else{
                //console.log("too many results.")
            }
            
            var hint = $('.hint')
            if (hint.length!==0) {
                $('.hint').remove();
            }

            $('.hintShow').append('<p class="hint">'+showCity+'</p>');
            $('.hint').css("color","white");

            var getOption = $('.hint-Selector option');
            if (getOption.length !== 0) {
                //$('.hint-Selector').show();
                $('.hint-Selector').empty();
            }
            for (let i = 0; i < showCity.length; i++) {
                const element1 = showCity[i];
                const element2 = showID[i];
                // console.log(element1);
                // console.log(element2);
                $('.hint-Selector').append('<option value="'+element2+'">'+element1+'</option>');    
                $('.hint-Selector').hide();
                $('.hint').hide();
            }
        });
    }  
}

// get selected option of city
function getClick() {
    var options = $('.hint-Selector option:selected');
    var id = options.val();
    var city = options.text();
    console.log(city+" selected, ID: "+id);
    searchADD(id);
    $('.hint-Selector').hide();
    $('.hint').remove();
    $('.search-box').val("");
}

$('.remove-menu').hide();
var tagRemove = 0
function showRemove() {
    if (tagRemove === 0) {
        if ($('.remove').length!==0) {
            for(var i=0; i<window.localStorage.length-1;i++){
                var city = window.localStorage.key(i);
                console.log(city);
                $('.remove').append('<li class="ops"><input type="button"  class="op" value='+city+' onclick="Delete(this.value)"></input></li>');
            }
            
            $('.ops').css("background-color","white");
            $('.ops').css("margin-right","50px");
            $('.op').css("width","300px");
            $('.op').css("height","80px");
            $('.op').css("font-size","40px");
            $('.card').css("position","relative");
            $('.card').css("float","right");
            $('.card').css("padding-right","80px");
            $('.card').css("padding-top","100px");
        
            $('.card').css("z-index","9999");
            $('.remove-menu').show();
            tagRemove = 1;
        }else{
            console.log("nothing in the list.")
            console.log($('.remove'))
        }
        
    }else{
        $('.ops').remove();
        tagRemove = 0;
    }
    
    
}

function Delete(name) {
    $('.container-card#'+name).remove();
    $('.op[value='+name+']').remove();
    window.localStorage.removeItem(name);
    var request = indexedDB.open("weatherPWA"); 
    request.onsuccess = function (event) {
    var db = this.result;
    var store = db.transaction("weather",'readwrite').objectStore("weather");
    store.delete(name);
    } 
    request.onerror = function (event) {
        console.log("opendb:", event);
    };
}

// ask permission to push notification to user
function askPermission() {
    return new Promise(function (resolve, reject) {
        var permissionResult = Notification.requestPermission(function (result) {
            resolve(result);
        });
  
        if (permissionResult) {
            permissionResult.then(resolve, reject);
        }
    }).then(function (permissionResult) {
        if (permissionResult !== 'granted') {
            throw new Error('We weren\'t granted permission.');
        }
    });
}

if('serviceWorker' in navigator) {
    window.navigator.serviceWorker.register('./service-worker.js',{scope:'/'})
    .then(  // promise resolve
    	function(reg){
            console.log("Successfully registed serviceWorker. Scope is: "+ reg.scope);
            askPermission();
            
    	})
    .catch(  // promise rejected
    	function(error){
    		console.log("error in registration with "+ error)
    	});
}else{
    console.log("service worker not supported")
};
var state = 0;
function show_time() {
    $('.request-sync').css("display","none");
    $('.real-sync').css("display","none");
    state = 1;
}
var num_request = 0; 

var cycle = function () {
    registerPeriodicSync();
    if (state === 1 ) {
        console.log("bg sync is stopped.");
    }
    else {setTimeout(cycle,5000);}
}
cycle();

    

function registerPeriodicSync() {
    window.navigator.serviceWorker.ready.then(function (registration) {
        if (registration.sync) {
            registration.sync.register('periodicSync').then(function (event) {
                console.log("Periodic_Sync started!");
            }).then(()=>{
                
                num_request = num_request + 1;
                var time = new Date();
                var second = time.getSeconds();
                var requesttime = time.getHours() + ":" + time.getMinutes() + ":" + second;
                var numOfrequest = "request "+num_request.toString();
                //window.localStorage.setItem(numOfrequest,requesttime);
                $('.request-sync').empty();
                $('.request-sync').append('<p class="default-text">Request background sync at:</p>');
                $('.request-sync').append('<p id="request-time">'+requesttime+'</p>');
                $('.request-sync').css("color","white");
                $('.request-sync').css("margin-top","300px");
                $('#request-time').css("font-size","70px");
                $('#request-time').css("text-align","center");

                setTimeout(function () {
                    var request = indexedDB.open("weatherPWA");
                    request.onsuccess = function () {
                        db = this.result; 
                        var tx = db.transaction("real time",'readwrite');
                        store = tx.objectStore("real time");
                        var req = store.get(0);
                        req.onsuccess = function (event) {
                            //console.log(req.result.time);
                            var timeget = req.result.time;
                            var show = timeget.slice(timeget.indexOf(" "),timeget.length-1);
                            $('.real-sync').empty();
                            $('.real-sync').append('<p id="default-text">Background sync at:</p>');
                            $('.real-sync').append('<p id="sync-time">'+show+'</p>');
                            $('.real-sync').css("color","white");
                            $('.real-sync').css("margin-top","300px");
                            $('#sync-time').css("font-size","70px");
                            $('#sync-time').css("text-align","center");
                            $('#default-text').css("font-size","55px");
                            $('#default-text').css("text-align","center");
                        }
                        req.onerror = function (err) {
                            console.log(err);
                        }
                    }
                },500)

                console.log("Periodic sync registration finished");
            }).then(()=>{
                $('.default-text').css("font-size","55px");
                $('.default-text').css("text-align","center");      
            })
            .catch(function (error) {
                return error
            })
        }else{
            console.log("sync function not supported");
        }
    })
    
}
var alreadydone = 0;
window.navigator.serviceWorker.ready.then(function (registration) {
        document.getElementById('confirm').addEventListener('click',function () {
        if (sub_state === 1) {
            var getInput = $('.search-box').val();
            getInput = getInput.slice(0,1).toUpperCase()+getInput.slice(1).toLowerCase();
            if (getInput!=="") {
                if (window.navigator.onLine===true) {
                    console.log("online mode");
                    readJSONfile("/json/city.json", function(text){
                        var data = JSON.parse(text);
                        //console.log(getCityIDbyName(getInput,data));
                        var id = getCityIDbyName(getInput,data);
                        if (id !== 0) {
                            searchADD(id);
                        }
                    });
                }else{
                    if (registration.sync) {
                        registration.sync.register('sync_test').then(function (event) {
                            console.log('background sync start: ',getInput+" need to add after having connection.");
                            //$('.search-box').val("");
                            var input = $('.search-box').val();
                            var msg = JSON.stringify({type:'bgsync', msg:{name:input}});
                            
                            window.navigator.serviceWorker.controller.postMessage(msg);
                            console.log(msg+" already posted");
                            
                        }).then(()=>{
                            console.log("registration finished");
                            alreadydone = 1;
                        })
                        .catch(function (error) {
                            return error 
                        })
                    }else{
                        console.log("sync function not supported")
                    }
                    alert("no network connection");
                }
                
            }else{
                alert("empty city input")
            }  
            
            $('.hint-Selector').hide();
            $('.hint').remove();
        }else{
            alert("subscribe the application first.");
            $('.search-box').val("");
            $('.hint-Selector').hide();
            $('.hint').remove();
        }
        
        
    })
})

//---------------------------  periodic sync  ------------------------------

// if (navigator.serviceWorker.controller) {
//     navigator.serviceWorker.ready.then(function (reg) {
//         if (reg.periodicSync) {
//             reg.periodicSync.register({
//                 tag: 'periodicSync',
//                 minPeriod: 1000,
//                 powerState: 'auto',
//                 networkState: 'any'
//             }).then(function (event) {
//                 console.log('Periodicc registration successful', event);
//             }).catch(function (error) {
//                 console.log('Periodicc registration failed', error);
//             })
//         }else{
//             //console.log("Periodic sync not supported");
//         }
//     })
// }else{
//     //console.log("service worker controller not working");
// }

//---------------------------  periodic sync  ------------------------------


function displayNotification(content) {
    if (Notification.permission == 'granted') {
      navigator.serviceWorker.getRegistration().then(reg => {
        var options = {
          icon: './icon.png',
          body: content,
          //image: 'https://augt-forum-upload.s3-ap-southeast-1.amazonaws.com/original/1X/6b3cd55281b7bedea101dc36a6ef24034806390b.png'
        };
        reg.showNotification('weather PWA', options);
      });
    }
  }
  
function askPermission(){
    return new Promise(function(resolve , reject){
        var permissionResult = Notification.requestPermission(function(result){
            //old version
            resolve(result);
        })
        if(permissionResult){
            //new version
            permissionResult.then(resolve , reject);
        }
    }).then(function(permissionResult){
        if(permissionResult !== 'granted'){
            throw new Error('We weren\'t granted permission.');
        }
    })
}

//publish key is base64 type, need to be transfered to Uint8Array type
// start subscription
function subscribeUserToPush(registration , publicKey){
    var subscribeOptions = {
        userVisibleOnly : true,
        applicationServerKey : window.urlBase64ToUint8Array(publicKey)
    };
    return registration.pushManager.subscribe(subscribeOptions).then(function(pushSubscription){
        console.log('pushscription' ,pushSubscription)
        return pushSubscription;
    })
}
// base64 => Unit8Array
// https://github.com/web-push-libs/web-push#using-vapid-key-for-applicationserverkey
window.urlBase64ToUint8Array = function (base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');
  
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
  
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

function sendSubscriptionToServer(body, url) {
    url = url || 'http://192.168.1.137:3000/subscription';
    return new Promise(function (resolve, reject) {
        var xhr = new XMLHttpRequest();
        xhr.timeout = 60000;
        xhr.onreadystatechange = function () {
            var response = {};
            if (xhr.readyState === 4 && xhr.status === 200) {
                try {
                    response = JSON.parse(xhr.responseText);
                    console.log("user subscribed!");
                    alert("subscribed!");
                    sub_state = 1;
                    window.localStorage.setItem("subscription",1);
                    $('#subscription_btn').remove();
                    $('#add_btn').remove();
                }
                catch (e) {
                    response = xhr.responseText;
                }
                resolve(response);
            }
            else if (xhr.readyState === 4) {
                resolve();
            }
        };
        xhr.onabort = reject;
        xhr.onerror = reject;
        xhr.ontimeout = reject;
        xhr.open('POST', url, true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.send(body);
    });
}


function PUSH() {
    if (sub_state === 0) {
        if ('serviceWorker' in navigator && 'PushManager' in window) {
            var publicKey = "BPwgIYTh9n2u8wpAf-_VzZ4dwaBY8UwfRjWZzcoX6RN7y5xD0RL9U4YDCdeoO3T8nJcWsQdvNirT11xJwPljAyk";
            window.navigator.serviceWorker.ready.then(function (registration) {
                //displayNotification();
                // open the subscription function of the page
                return subscribeUserToPush(registration, publicKey);
            }).then(function (subscription) {
                
                var body = {subscription: subscription};
                // give every user a unique id in order to push notification
                body.uniqueid = new Date().getTime();
                console.log('uniqueid', body.uniqueid);
                console.log(JSON.stringify(body))
                // save the subscription info in the server (bedb used for saving)
                return sendSubscriptionToServer(JSON.stringify(body));
            }).then(function (res) {
                console.log(res);
            }).catch(function (err) {
                console.log(err);
            });
        }else{
            console.log('Push messaging is not supported.')
        }
        
    }else{
        alert("you have already subscribed.")
    }   
    
}

// navigator.serviceWorker.addEventListener('message',function (e) {
//     var action = e.data;
//     console.log(`the client clicked on ${e.data}`);
//     switch(action){
//         case 'next-page':
//             location.href = './pages/next-page.html';
//             break;
//         case 'contact-me':
//             location.href = './pages/contact-me.html';
//             break;
//     }
// })



// getJSON(url).then((data)=>{
//     var city = data.name;
//     var temp = (data.main.temp-273.15).toString();
//     if (temp.includes('.')) {
//         var Temp = temp.slice(0,temp.indexOf('.')+2)+"℃";
//     }else{
//         var Temp = temp.slice(0,temp.length)+"℃";
//     }
//     var des = data.weather[0].main;
//     console.log(des);
//     addcard(city,Temp,des);
//     var jsonstr = JSON.stringify(data)
//     window.localStorage.setItem(city,jsonstr);
// }


var version = 1;
window.addEventListener('load',function () {
    function updateOnlineStatus(event) {
      if (navigator.onLine) {
        console.log('device is now online');
        $('#all').css("background-image", "url('/images/background/bg1.jpg')");
        $('.test_sync').css("bottom","0px");
        $('.offline').remove();
        if (alreadydone === 1) {
            setTimeout(function () {
            for (let i = 0; i < window.localStorage.length-1; i++) {
                var cityname = window.localStorage.key(i);
                $('.container-card#'+cityname).remove();
            }
            // navigator.serviceWorker.addEventListener('message',function (e) {
            //     console.log(e.data);
            // })
            
            var request = indexedDB.open("weatherPWA");
            request.onsuccess = function (event) {
            var db = this.result;
            
            db.transaction("real time",'readwrite').objectStore("real time").openCursor()
            .onsuccess = function (e) {
                let cursor = e.target.result;
                if (cursor) {
                    var city = cursor.key;
                    var jsonstr = cursor.value.des;
                    if (isNaN(city)) {
                        window.localStorage.setItem(city,jsonstr);
                    }else{

                    }
                    
                    //console.log(cursor.key, cursor.value.des);
                    
                    cursor.continue();
                }else{
                    for (let i = 0; i < window.localStorage.length-1; i++) {
                        var dataget = window.localStorage.getItem(window.localStorage.key(i));
                        var data = JSON.parse(dataget);
                        var city = data.name;
                        var temp = (data.main.temp-273.15).toString();
                        if (temp.includes('.')) {
                            var Temp = temp.slice(0,temp.indexOf('.')+2)+"℃";
                        }else{
                            var Temp = temp.slice(0,temp.length)+"℃";
                        }
                        var des = data.weather[0].main;
                        
                        //console.log(des);
                        addcard(city,Temp,des);  
                    }
                }
                
            };
            } 
            request.onerror = function (event) {
                console.log("opendb:", event);
            };
            
            
        },2000);
    }
        
        
        setTimeout(function () {
            var request = indexedDB.open("weatherPWA");
            request.onsuccess = function () {
                db = this.result;
                var tx = db.transaction("real time",'readwrite');
                store = tx.objectStore("real time");
                var req = store.get(0);
                req.onsuccess = function (event) {
                    //console.log(req.result.time);
                    var timeget = req.result.time;
                    var show = timeget.slice(timeget.indexOf(" "),timeget.length-1);
                    
                    $('.real-sync').empty();
                    $('.real-sync').append('<p id="default-text">Background sync at:</p>');
                    $('.real-sync').append('<p id="sync-time">'+show+'</p>');
                    $('.real-sync').css("color","white");
                    $('.real-sync').css("margin-top","300px");
                    $('#sync-time').css("font-size","70px");
                    $('#sync-time').css("text-align","center");
                    $('#default-text').css("font-size","55px");
                    $('#default-text').css("text-align","center");
                    
                }
                req.onerror = function (err) {
                    console.log(err);
                }
            }
        },300)
        
      } else {
        console.log('device is now offline');
        $('#all').append('<div class="offline"></div>');
        $('.offline').append('<p class="offline_hint">offline mode</p>');
        $('.offline_hint').css("text-align","center");
        $('.offline_hint').css("font-size","30px");
        $('.offline_hint').css("padding-bottom","20px");
        $('.offline').css("background-color","gray");
        $('.offline').css("position","absolute");
        $('.offline').css("bottom","0px");
        $('.offline').css("height","60px");
        $('.offline').css("width","98%");
        $('.test_sync').css("bottom","60px");
        $('#all').css("background-image", "url('/images/background/offline.jpg')");
      }
    }
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
  });



//============================== get location =============================
function locateME() {
    if(navigator.geolocation){  
        navigator.geolocation.getCurrentPosition(successCallback,errorCallback);
    }else{
        console.log("your browser can't locate your location");
    }
    
    function successCallback(position) {
        var lat = position.coords.latitude.toString();  
        var lon = position.coords.longitude.toString();  
        lat = lat.slice(0,lat.indexOf('.')+3);
        lon = lon.slice(0,lon.indexOf('.')+3);
        console.log("get location successfully: "+"latitude: "+lat+" longitude: "+lon);  
        alert("get location successfully:\n "+"latitude: "+lat+"  longitude: "+lon);
    }
    function errorCallback(error) {
        console.log("failed to get your location");  
        console.log(error);  // PositionError {code: 1, message: "User denied Geolocation"}
    }
}











