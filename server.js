var https = require('https')
var http = require('http')
var pem = require('pem')
var express = require('express')
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
  var base_url = 'https://mb-paybank.herokuapp.com'
  var db = require('./db_pg.js')
}else{
  var base_url = 'http://localhost:5000'
  var db = require('./db_mysql.js')
}


app.use(bodyParser.json()) // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })) // support encoded bodies
app.engine('html', require('ejs').renderFile) //support for res.render()
app.use(cookieParser()) // support for req.cookies
app.use(express.static('qr-img')) // public folder
app.use(express.static('assets'))

app.get('/', function (req, res) {
  res.sendFile(dir_views+'main.html')
})

app.get('/login', function (req, res) {
  res.render(dir_views+'login.html')
})

app.post('/login', function (req, res) {
  console.log('[server app.post /login] username: '+req.body.username)
  console.log('[server app.post /login] password: '+req.body.password)
  function checkLogin(check, session){
    if(check){
      console.log(session)
      res.cookie('session', session, { maxAge: 1000 * 60 * 2}) // 2 minute
      console.log(base_url+'/home')
      res.redirect(base_url+'/home')
    }else{
      res.render(dir_views+'login.html')
    }
  }
  db.checkLogin(req.body.username, req.body.password, req.sessionID, checkLogin)
})

app.get('/home', function(req,res){
  console.log('/home')
  if(Object.keys(req.cookies).length == 0 || !('session' in req.cookies)){
    res.redirect(base_url+'/login')
  }
  else{
    function checkSesion(check, username, acc_num, balance){
      if(check)
        res.render(dir_views+'home.html', {username : username, acc_num : acc_num, balance : balance})
      else
        res.redirect(base_url+'/login')
    }
    db.checkSession(req.cookies['session'], checkSesion)
  }
  
})

app.get('/scanqr',function(req,res){
	res.render(dir_views+'scanqr.html', {ip:ip})
})

app.get('/genqr',function(req,res){
	res.render(dir_views+'genqr.html')
})

app.get('/genqr/:payee/:amount',function(req,res){
  var payee = req.params.payee
  var amount = parseInt(req.params.amount)
  console.log('[server app.get /genqr/:payee/:amount] ')
  if(Object.keys(req.cookies).length == 0 || !('session' in req.cookies))
    res.redirect(base_url+'/login')
  else{
    function checkSesion(check, payer, acc_num, balance){
      if(check && amount <= balance){
        function done(){
          res.redirect(base_url+'/home')
          res.end()
        }
        db.transaction(req.cookies['session'], payer, balance, payee, amount, done)
      }
      else
        res.redirect(base_url+'/home')
    }
    db.checkSession(req.cookies['session'], checkSesion)
  }
})

app.post('/genqr',function(req,res){
  var amount = req.body.amount
  if (isNaN(req.body.amount)) {
    console.log('[server app.post /genqr] This is not number')
    res.redirect(base_url+'/genqr')
  }
  if(Object.keys(req.cookies).length == 0 || !('session' in req.cookies)){
    res.redirect(base_url+'/login')
  }
  else{
    function checkSesion(check, username, acc_num, balance){
      if(check){
        genqr.getqr(base_url+'/genqr/'+username+'/'+amount)
        res.render(dir_views+'qrcode.html', {amount : amount})
      }
      else
        res.redirect(base_url+'/genqr')
    }
    db.checkSession(req.cookies['session'], checkSesion)
  }
})

app.listen(PORT)