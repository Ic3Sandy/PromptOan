var os = require('os');
var ifaces = os.networkInterfaces();
var ip = ifaces["Wi-Fi"][1].address

exports.getIPwifi = function() {
    console.log('Wi-Fi address: '+ip)
    return ip
}

