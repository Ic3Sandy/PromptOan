var QRCode = require('qrcode')

QRCode.toString('http://www.google.com', function (err, string) {
  if (err) throw err
  console.log(string)
})

QRCode.toFile('qrcode.png', 'http://www.fnitiwat.in.th/jjay.html', {
  // color: {
  //   dark: '#00F',  // Blue dots
  //   light: '#0000' // Transparent background
  // }
  margin: 1,
  scale: 4,
  errorCorrectionLevel: 'H'
}, function (err) {
  if (err) throw err
  console.log('done')
})