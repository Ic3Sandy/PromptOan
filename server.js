var https = require('https')
var http = require('http')
var pem = require('pem')
var express = require('express')
var app = express()
var bodyParser = require('body-parser')

// Own Modules
var get_ipwifi = require('./modules/get_ipwifi.js')
var ip = get_ipwifi.getIPwifi()
var db = require('./db_server.js')

// SETUP Protocol
var protocol = 'http'
if (protocol == 'http')
  var port = 8000
else
  var port = 5000

app.use(bodyParser.json()) // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })) // support encoded bodies
app.engine('html', require('ejs').renderFile) //support for res.render()


app.get('/', function (req, res) {
  res.sendFile(__dirname+'/view/main.html')
})

app.get('/login', function (req, res) {
  res.render(__dirname+"/view/login.html", {ip : ip, protocol : protocol, port : port})
})

app.post('/login', function (req, res) {
  console.log('[server app.post /login] username: '+req.body.username)
  console.log('[server app.post /login] password: '+req.body.password)
  function checkLogin(check){
    if(check){
      res.redirect(protocol+'://'+ip+':'+port+'/home')
    }else{
      res.redirect(protocol+'://'+ip+':'+port+'/login')
    }
  }
  db.checkLogin(req.body.username, req.body.password, checkLogin)
})

app.get('/home', function(req,res){
	res.render(__dirname+"/view/home.html", {ip:ip});
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