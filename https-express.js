var fs = require('fs');
var http = require('http');
var https = require('https');
var privateKey  = fs.readFileSync('hacksparrow-key.pem');
var certificate = fs.readFileSync('hacksparrow-cert.pem');

var credentials = {key: privateKey, cert: certificate};
var express = require('express');
var app = express();

// your express configuration here
app.get('/', function (req, res) {
    res.sendFile(__dirname+'/view/main.html');
});

var httpServer = http.createServer(app);
var httpsServer = https.createServer(credentials, app);

httpServer.listen(8080);
httpsServer.listen(5000);