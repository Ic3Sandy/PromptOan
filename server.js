var https = require('https')
var http = require('http')
var pem = require('pem')
var express = require('express')
var app = express()
var bodyParser = require('body-parser');

// Own Modules
var get_ipwifi = require('./modules/get_ipwifi.js')
var ip = get_ipwifi.getIPwifi()

app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
app.engine('html', require('ejs').renderFile) //support for res.render()



app.get('/', function (req, res) {
  res.sendFile(__dirname+'/view/main.html');
});

app.get('/test-post', function (req, res) {
  res.sendFile(__dirname+'/view/test-post.html');
});

app.get('/test-downloadfile', function (req, res) {
  res.download(__dirname+'/qrcode.png', 'qrcode');
});

app.get('/camera', function (req, res) {
  res.sendFile(__dirname+'/view/scanqr.html');
});

app.post('/main', function (req, res) {
  res.redirect(200, 'https://'+ip+':5000/');
  console.log(req.body.user.name);
  console.log(req.body.user.email);
});

app.get('/login', function (req, res) {
  res.render(__dirname+"/view/login.html", {ip : ip});
});

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



app.post('/login', function (req, res) {
  if(req.body.username=='foo'&&req.body.password=='bar'){
  	res.redirect(200, 'https://'+ip+':5000/home');
  }else{
	res.redirect(200, 'https://'+ip+':5000/login');
  }
})

http.createServer(app).listen(8000)
pem.createCertificate({ days: 1, selfSigned: true }, function (err, keys) {
  if (err) {throw err}

  var option = { key: keys.serviceKey, cert: keys.certificate }
  console.log('Server Start...!')

  https.createServer(option, app).listen(5000)
})