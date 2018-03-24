var express = require('express');
var app = express();
var bodyParser = require('body-parser');
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

app.get('/main', function (req, res) {
    res.sendFile(__dirname+'/main.html');
});

app.get('/test-post', function (req, res) {
    res.sendFile(__dirname+'/test-post.html');
});

app.get('/test-sendfile', function (req, res) {
    res.download(__dirname+'/main.html', 'namefile.html');
});

app.post('/main', function (req, res) {
    res.redirect(200, 'http://localhost:8080/main');
    console.log(req.body.user.name);
    console.log(req.body.user.email);
});

var server = app.listen(8080, function () {

  var host = server.address().address;
  var port = server.address().port;

  console.log("Example app listening at http://%s:%s", host, port);

});