var fs = require('fs');
const https = require('https');

var hskey = fs.readFileSync('hacksparrow-key.pem');
var hscert = fs.readFileSync('hacksparrow-cert.pem')

var options = {
    key: hskey,
    cert: hscert
};
https.createServer(options, (req, res) => {
    res.writeHead(200);
    res.end('hello world\n');
}).listen(5000);