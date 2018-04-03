var https = require('https')
var http = require('http')
var pem = require('pem')
var express = require('express')
var app = express()
var bodyParser = require('body-parser');
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies


app.get('/', function (req, res) {
  res.sendFile(__dirname+'/view/main.html');
});

app.get('/test-post', function (req, res) {
  res.sendFile(__dirname+'/view/test-post.html');
});

app.get('/test-sendfile', function (req, res) {
  res.download(__dirname+'/view/main.html', 'namefile.html');
});

app.get('/camera', function (req, res) {
  res.sendFile(__dirname+'/view/scanqr.html');
});

app.post('/main', function (req, res) {
  res.redirect(200, 'https://'+ip_wifi+':5000/');
  console.log(req.body.user.name);
  console.log(req.body.user.email);
});

app.get('/login', function (req, res) {
  res.render(__dirname+'/view/login.html', {ip : ip_wifi});
});

app.post('/login', function (req, res) {
	if(req.body.username=='foo'&&req.body.password=='bar'){
  res.redirect(200, 'https://'+ip_wifi+':5000/home');
}else{
	res.redirect(200, 'https://'+ip_wifi+':5000/login');
}
});

http.createServer(app).listen(8000)
pem.createCertificate({ days: 1, selfSigned: true }, function (err, keys) {
  if (err) {throw err}

  var option = { key: keys.serviceKey, cert: keys.certificate }
  console.log('Server Start...!')

  https.createServer(option, app).listen(5000)
})