var https = require('https')
var pem = require('pem')
var express = require('express')
 
pem.createCertificate({ days: 1, selfSigned: true }, function (err, keys) {
  if (err) {
    throw err
  }
  var app = express()
 
  app.get('/', function (req, res) {
    res.send('Hello HTTPS!')
  })
 
  https.createServer({ key: keys.serviceKey, cert: keys.certificate }, app).listen(5000)
})