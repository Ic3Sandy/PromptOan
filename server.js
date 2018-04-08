var https = require('https')
var http = require('http')
var pem = require('pem')
var express = require('express')
var session = require('express-session')
var app = express()
var bodyParser = require('body-parser');

// Own Modules
var get_ipwifi = require('./modules/get_ipwifi.js')
var ip = get_ipwifi.getIPwifi()
var db = require('./db_server.js')

app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
app.engine('html', require('ejs').renderFile) //support for res.render()


app.get('/', function (req, res) {
  res.sendFile(__dirname+'/view/main.html');
});

app.get('/camera', function (req, res) {
  res.sendFile(__dirname+'/view/scanqr.html');
});

app.get('/login', function (req, res) {
  res.render(__dirname+"/view/login.html", {ip : ip});
});

app.use(session({secret: 'helloworld'}));//top

app.post('/login', function (req, res) {
  console.log('[server app.post /login] username: '+req.body.username)
  console.log('[server app.post /login] password: '+req.body.password)
  req.session.username = req.body.username;//top  
  req.session.password = req.body.password;//top
   function checkLogin(check){
    if(check){
      console.log('[server app.post /login] ')
      //res.cookie('rememberme', 'tobi', { expires: new Date(Date.now() + 90000) });
      res.redirect(200, 'http://'+ip+':8000/home')
    }else{
      res.redirect(200, 'http://'+ip+':8000/')
    }
  }
  db.checkLogin(req.body.username, req.body.password, checkLogin)
})

function checkLogin(check){
  if(check){
  	res.redirect(200, 'http://'+ip+':8000/home')
  }else{
	  res.redirect(200, 'http://'+ip+':8000/')
  }
}

app.get('/home', function(req,res){ //top
  if(req.session.username){
  	res.render(__dirname+"/view/home.html", {ip:ip});
    res.end();
  }else{
    res.redirect(200, 'http://'+ip+':8000/login');
    res.end();
  }
});

app.get('/scanqr',function(req,res){
	res.render(__dirname+"/view/scanqr.html",{ip:ip});
})

app.get('/genqr',function(req,res){
	res.render(__dirname+"/view/genqr.html",{ip:ip});
})

app.post('/genqr',function(req,res){
	res.render(__dirname+"/view/qrcode.html",{ip:ip});
})


http.createServer(app).listen(8000)
pem.createCertificate({ days: 1, selfSigned: true }, function (err, keys) {
  if (err) {throw err}

  var option = { key: keys.serviceKey, cert: keys.certificate }
  console.log('[server] Server Start...!')

  https.createServer(option, app).listen(5000)
})