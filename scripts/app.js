'use strict'

var APIkey = '186bd32bbcadf6c77e6c370efba0b47d';
var windowDialog = document.getElementById('dialog');
var card = document.getElementById('card');
var description = "";
var temp = 0;
var cities = ['Paris','Jinzhou','Tokyo','New York','Greater London','Shanghai'];

var weathers = [
    
    {
        id:0,
        name:'Rain',
        backgroundurl:'/images/rainImg.jpg',
        iconurl:'/images/rain.png'
    },
    {
        id:1,
        name:'Clear',
        backgroundurl:'/images/sunnyImg.jpg',
        iconurl:'/images/clear.png'
    },
    {
        id:2,
        name:'Clouds',
        backgroundurl:'/images/cloudyImg.jpg',
        iconurl:'/images/cloudy.png'
    },
    {
        id:3,
        name:'windy',
        backgroundurl:'/images/windyImg.jpg',
        iconurl:'/images/wind.png'
    },
    {
        id:4,
        name:'storm',
        backgroundurl:'/images/stormImg.jpg',
        iconurl:'/images/thunderstorm.png'
    },
    {
        id:5,
        name:'Drizzle',
        backgroundurl:'/images/drizzle.jpg',
        iconurl:'/images/rain.png'
    }
    ];

var backgroundgif = [
    {
        id:0,
        name:'night',
        url:'/images/night.gif'
    },
    {
        id:1,
        name:'morning',
        url:'/images/morning.gif'
    }
];

var values = [];
var woeid = [];
var cardlist = [];

settimebackground();

document.getElementById('add_btn').addEventListener('click',function(){
    showdialog();
    
});

document.getElementById('refresh_btn').addEventListener('click',function(){
    addlocalStorage();
});

document.getElementById('butAddCity').addEventListener('click',function(){
    var city = getSelected();
    handleJSON(city);
    hidedialog();
});

document.getElementById('butAddCancel').addEventListener('click',function(){
    hidedialog();
});

document.getElementById('confirm').addEventListener('click',function () {
    var city = document.getElementById('search').value;
    if (cities.includes(city)) {
        handleJSON(city);
    }else{
        alert('wrong city');
    }
    
})

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

    var get = window.localStorage.getItem(city);
    var json = JSON.parse(get);
    temp = (json.main.temp-273.15).toString();
    if (temp.includes('.')) {
        var Temp = temp.slice(0,temp.indexOf('.'))+"℃";
    }else{
        var Temp = temp.slice(0,temp.length)+"℃";
    }
    description = json.weather[0].main;
    
    addcard(city,Temp,description);
    
}

function addcard(city,temp,weather) {
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
    
    var createCard = {

        createcard:function () {

            var div = document.createElement('div');
            div.className = "container-card";
            div.id = "card";
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
        url = '/images/night.gif';
        console.log(hour+' hours at '+state)
    }else if (hour<12) {
        state = 'morning';
        url = '/images/morning.jpg';
        console.log(hour+' hours in the '+state)
    }else if (hour<17){
        state = 'afternoon';
        url = '/images/afternoon.jpeg';
        console.log(hour+' hours in the '+state)
    }else if (hour<20) {
        state = 'sunset';
        url = '/images/sunset.jpeg';
    }
    else if (hour<24) {
        state = 'night';
        url = '/images/night.gif';
        console.log(hour+' hours at '+state)
    }
    var getbackground = document.getElementById('all');
    getbackground.style.backgroundImage = "url('"+url+"')";
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

var url ;
var city ;
var data ;
var addlocalStorage = () => {
    cities.forEach(function (city) {
        url = 'http://api.openweathermap.org/data/2.5/weather?q='+city+'&APPID='+APIkey;
        getJSON(url).then((data) => {   
            var jsonstr = JSON.stringify(data); 
            window.localStorage.setItem(data.name,jsonstr);
        },function(status){
            console.log('Something went wrong, status is ' + status);
        });
    })    
}



if('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/service-worker.js',{scope:'/'})
    .then(  // promise resolve
    	function(reg){
    		console.log("Successfully registed serviceWorker. Scope is: "+ reg.scope)
    	})
    .catch(  // promise rejected
    	function(error){
    		console.log("error in registration with "+ error)
    	});
};

if('serviceWorker' in navigator && 'PushManager' in window){
    navigator.serviceWorker.register('./serviceWorker.js').then(function(registration){
        return Promise.all([registration,askPermission()])
    }).then(function(result){
        console.log(result);
    })
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

navigator.serviceWorker.ready.then(function (registration) {
    var tag = "sample_sync";  // can be used connect with service-worker.js
    registration.sync.register(tag).then(function () {
        console.log(`background sync actived`);
    }).catch(function (err) {
        console.log(`background sync failed`, err);
    });
});

if (`serviceWorker` in navigator && `SyncManager` in window) {
    console.log('service worker and sync Manager are all registed');
}else{
    console.log('error in install service worker or sync manager');
}


