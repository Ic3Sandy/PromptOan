var QRCode = require('qrcode')

exports.getqr = function(url) {
  console.log('Gen QR: '+url)
  QRCode.toFile('./qr-img/qrcode.png', url, {
  margin: 1,
  scale: 4,
  errorCorrectionLevel: 'H'
}, function (err) {
  if (err) throw err
  console.log('done')
})
}