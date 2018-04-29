var pem = require('pem')
var express = require('express')
var session = require('express-session')
var app = express()
var bodyParser = require('body-parser')
var cookieParser = require('cookie-parser')
var session = require('express-session')


// Own Modules
var get_ipwifi = require('./modules/get_ipwifi.js')
var ip = get_ipwifi.getIPwifi()
var genqr = require('./modules/genqr.js')


// SetUp Port Heroku
const PORT = process.env.PORT || 5000


// SetUp Session
app.set('trust proxy', 1) // trust first proxy
app.use(session({
  secret: 'secretjs',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: true }
}))


// SetUp Path and Database
var dir_views = __dirname+'/views/'
if (PORT != 5000){
  var base_url = 'https://promptoan.herokuapp.com'
  var db = require('./db_pg.js')
}else{
  var base_url = 'http://'+ip+':5000'
  var db = require('./db_mysql.js')
}

// SetUp IPInves for deploy
// var request = require('request')
// request('https://ipinvestigator.expeditedaddons.com/?api_key=Z4857LBYNEWT4D9H0C3U672O9J1QA3MS12RI0VFKXG56P8&ip=68.10.149.45', function (error, response, body) {
//   console.log('Status:', response.statusCode)
//   console.log('Headers:', JSON.stringify(response.headers))
//   console.log('Response:', body)
// })

app.use(bodyParser.json()) // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })) // support encoded bodies
app.engine('html', require('ejs').renderFile) //support for res.render()
app.use(cookieParser()) // support for req.cookies
app.use(express.static('qr-img')) // public folder
app.use(express.static('assets')) // public folder

 // public folder
app.use(express.static('qr-img'))
app.use(express.static('assets'))

app.get('/', function (req, res) {
  res.clearCookie('session')
  res.sendFile(dir_views+'main.html')
})

app.get('/login', function (req, res) {
  if(Object.keys(req.cookies).length != 0 && ('session' in req.cookies)){
    console.log('[server app.get /login] 1')
    if('user' in req.cookies['session']){
      console.log('[server app.get /login] 3')
      res.redirect(base_url+'/home')
    }
    else if('scanqr' in req.cookies['session']){
      console.log('[server app.get /login] 2')
      res.cookie('session', {'scanqr':req.cookies['session']['scanqr']}, { maxAge: 1000 * 60 * 2})
      res.render(dir_views+'login.html')
    }
  }
  else{
    console.log('[server app.get /login] 4')
    res.render(dir_views+'login.html')
  }
})

app.post('/login', function (req, res) {
  if(!('username' in req.body && 'password' in req.body)){
    console.log('[server app.post /login] 1')
    res.redirect(base_url+'/login')
  }
  else{
    function checkLogin(check, session){
      if(check && ('session' in req.cookies) && ('scanqr' in req.cookies['session'])){
        res.cookie('session', {'user':session, 'scanqr':req.cookies['session']['scanqr']}, { maxAge: 1000 * 60 * 2}) // 2 minute
        res.redirect(base_url+'/home')
      }
      else if(check){
        res.cookie('session', {'user':session}, { maxAge: 1000 * 60 * 2}) // 2 minute
        res.redirect(base_url+'/home')
      }
      else{
        res.redirect(base_url+'/login')
      }
    }
    db.checkLogin(req.body.username, req.body.password, req.sessionID, checkLogin)
  }
})

app.get('/home', function(req,res){
  console.log('/home')
  console.log(req.cookies)
  if(Object.keys(req.cookies).length == 0 || !('session' in req.cookies)){
    console.log('/home no session (req.cookies).length: '+ Object.keys(req.cookies).length)
    console.log('/home no session !in req.cookies: '+!('session' in req.cookies))
    res.redirect(base_url+'/login')
  }
  else{
    function checkSesion(check, username, acc_num, balance){
      console.log('/home checkSesion')
      if(check && ('scanqr' in req.cookies['session'])){
        var str = req.cookies['session']['scanqr']
        str = str.split("/")
        res.cookie('session', {'user':req.cookies['session']['user'], 'scanqr':req.cookies['session']['scanqr']}, { maxAge: 1000 * 60 * 2})
        res.render(dir_views+'confirm.html', {link : req.cookies['session']['scanqr'], acc_num : str[0], amount : str[1]})
      }else if(check){ 
        console.log(req.cookies)
        console.log('/home dir_views home.html')
        res.render(dir_views+'home.html', {username : username, acc_num : acc_num, balance : balance})
      }
      else{
        console.log('/home checkSesion /login')
        res.clearCookie('session')
        res.redirect(base_url+'/login')
      }
    }
    db.checkSession(req.cookies['session']['user'], checkSesion)
  }
  
})

app.get('/genqr',function(req,res){
	res.render(dir_views+'genqr.html')
})

app.get('/genqr/:acc_num/:amount',function(req,res){
  var acc_num = req.params.acc_num
  var amount = parseInt(req.params.amount)
  console.log('[server app.get /genqr/:acc_num/:amount] 1')
  if(Object.keys(req.cookies).length == 0 || !('session' in req.cookies)){
    console.log('[server app.get /genqr/:acc_num/:amount] 2')
    res.cookie('session', {'scanqr': acc_num+'/'+amount}, { maxAge: 1000 * 60 * 2})
    res.redirect(base_url+'/login')
  }
  else if(('session' in req.cookies) && ('user' in req.cookies['session'] && !('scanqr' in req.cookies['session']))){
    res.cookie('session', {'user':req.cookies['session']['user'], 'scanqr': acc_num+'/'+amount}, { maxAge: 1000 * 60 * 2})
    res.redirect(base_url+'/home')
  }
  else{
    function checkSesion(check, payer, acc_payer, balance){
      console.log('[server app.get /genqr/:acc_num/:amount] 4')
      if(check && amount <= balance){
        function done(){
          res.cookie('session', {'user': req.cookies['session']['user']}, { maxAge: 1000 * 60 * 2})
          res.redirect(base_url+'/home')
        }
        db.transaction(req.cookies['session']['user'], payer, balance, acc_num, amount, done)
      }
      else{
        res.cookie('session', {'user': req.cookies['session']['user']}, { maxAge: 1000 * 60 * 2})
        res.redirect(base_url+'/home')
      }
    }
    db.checkSession(req.cookies['session']['user'], checkSesion)
  }
})

app.post('/genqr',function(req,res){
  var amount = req.body.amount
  if (typeof parseInt(amount) != "number") {
    console.log('[server app.post /genqr] This is not number')
    res.redirect(base_url+'/genqr')
  }
  if(Object.keys(req.cookies).length == 0 || !('session' in req.cookies)){
    res.redirect(base_url+'/login')
  }
  else{
    function checkSesion(check, username, acc_num, balance){
      if(check){
        genqr.getqr(base_url+'/genqr/'+acc_num+'/'+amount)
        res.render(dir_views+'qrcode.html')
      }
      else
        res.redirect(base_url+'/genqr')
    }
    db.checkSession(req.cookies['session']['user'], checkSesion)
  }
})

app.listen(PORT)