var os = require('os');
var ifaces = os.networkInterfaces();
console.log(ifaces["Wi-Fi"][1].address);

