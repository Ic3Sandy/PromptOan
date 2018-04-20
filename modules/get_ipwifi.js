var os = require('os')
var ifaces = os.networkInterfaces()
if('Wi-Fi' in ifaces)
    var ip = ifaces["Wi-Fi"][1].address
else if('Wi-Fi 2' in ifaces)
    var ip = ifaces['Wi-Fi 2'][1].address

exports.getIPwifi = function() {
    console.log('Wi-Fi address: '+ip)
    return ip
}