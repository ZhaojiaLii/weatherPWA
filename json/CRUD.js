//import { writeFile } from "fs";
var fs = require('fs');
var FR = [];
function read() {
    fs.readFile("./city.list.json",function (err,text) {
        var data = JSON.parse(text);
        data.forEach(element => {
            if (element.country === "FR") {
                console.log(element);
                FR.push(element);
            }
        });
    });
    setTimeout(function () {
        add(FR)
    },5000); 
}
read();

function add(data) {
    var fr = JSON.stringify(data);
    console.log(fr)
    fs.writeFile('city.json',fr,function (err) {
        console.log("-------------added--------------");
    })
}


