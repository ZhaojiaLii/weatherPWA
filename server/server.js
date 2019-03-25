var express=require('express');
var app =express();
 
// configure the server access
app.all('*', function(req, res, next) {
   res.header("Access-Control-Allow-Origin", "*");
   res.header("Access-Control-Allow-Headers", "X-Requested-With");
   res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
   res.header("X-Powered-By",' 3.2.1');
   res.header("Content-Type", "application/json;charset=utf-8");
   next();
});
 
// json data to be posted on the website
var questions=[
{
    name:'zhli'
},
{
    name:'david'
}];
 
// the sync interface 
app.get('/sync',function(req,res){
    console.log("get request from the weatherPWA");
    res.status(200),
    res.json(questions)
});
 
// port of ther server : 3000
 
var server = app.listen(3000, function () {
    var host = server.address().address;
    var port = server.address().port;
    console.log('app listening at http://localhost:%s', host, port);
})
