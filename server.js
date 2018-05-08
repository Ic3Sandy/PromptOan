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


app.use(bodyParser.json()) // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })) // support encoded bodies
app.engine('html', require('ejs').renderFile) //support for res.render()
app.use(cookieParser()) // support for req.cookies

 // public folder
app.use(express.static('qr-img'))
app.use(express.static('assets'))

app.get('/', function (req, res) {

  console.log("[Main...]")

  res.clearCookie('session')
  res.sendFile(dir_views+'main.html')
})


app.get('/login', function (req, res) {

  console.log("[Login]")

  // SetUp IPInves for deploy
  // var request = require('request')
  // request('https://ipinvestigator.expeditedaddons.com/?api_key=Z4857LBYNEWT4D9H0C3U672O9J1QA3MS12RI0VFKXG56P8&ip=68.10.149.45', function (error, response, body) {
  //   console.log('Status:', response.statusCode)
  //   console.log('Headers:', JSON.stringify(response.headers))
  //   console.log('Response:', body)
  // })

  if(Object.keys(req.cookies).length != 0 && ('session' in req.cookies)){

    if('user' in req.cookies['session'])
      res.redirect(base_url+'/home')
    
    else if('scanqr' in req.cookies['session']){

      console.log("[Login from QRcode]")

      res.cookie('session', { 'scanqr' : req.cookies['session']['scanqr'] }, { maxAge: 1000 * 60 * 2 })
      res.render(dir_views+'login.html')
    }
  }

  else
    res.render(dir_views+'login.html')
})


app.post('/login', function (req, res) {

  if(!('username' in req.body && 'password' in req.body))
    res.redirect(base_url+'/login')
  
  else{
    function checkLogin(check, session){

      console.log("[Login checkLogin]")

      if(check && ('session' in req.cookies) && ('scanqr' in req.cookies['session'])){
        res.cookie('session', {'user' : session, 'scanqr' : req.cookies['session']['scanqr']}, { maxAge: 1000 * 60 * 2 }) // 2 minute
        res.redirect(base_url+'/home')
      }
      else if(check){
        res.cookie('session', {'user' : session}, { maxAge: 1000 * 60 * 2 }) // 2 minute
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

  if(Object.keys(req.cookies).length == 0 || !('session' in req.cookies))
    res.redirect(base_url+'/login')
  
  else{
    function checkSesion(check, username, acc_num, balance){

      console.log("[Home checkSesion]")

      if(check && ('scanqr' in req.cookies['session'])){
        
        var str = req.cookies['session']['scanqr']
        str = str.split("/")

        res.cookie('session', {'user' : req.cookies['session']['user'], 'scanqr' : req.cookies['session']['scanqr']}, { maxAge : 1000 * 60 * 2 })
        
        console.log("[Home Confirm!]")
        res.render(dir_views+'confirm.html', {link : req.cookies['session']['scanqr'], acc_num : str[0], amount : str[1]})
      }

      else if(check){
        console.log("[Username login]: "+username)
        res.render(dir_views+'home.html', {username : username, acc_num : acc_num, balance : balance})
      }

      else{
        res.clearCookie('session')
        res.redirect(base_url+'/login')
      }
    }
    db.checkSession(req.cookies['session']['user'], checkSesion)
  }
  
})


app.get('/genqr',function(req,res){

  console.log("[Generate Qrcode!]")

  if(Object.keys(req.cookies).length == 0 || !('session' in req.cookies))
    res.redirect(base_url+'/login')
  else
    res.render(dir_views+'genqr.html')
    
})


app.post('/genqr',function(req,res){

  var amount = req.body.amount

  if(typeof parseInt(amount) != "number")
    res.redirect(base_url+'/genqr')
  
  if(Object.keys(req.cookies).length == 0 || !('session' in req.cookies))
    res.redirect(base_url+'/login')
  
  else{
    function checkSesion(check, username, acc_num, balance){

      console.log("[Generate Qrcode checkSesion!]")

      if(check){
        genqr.getqr(base_url+'/scanqr/'+acc_num+'/'+amount)
        res.render(dir_views+'qrcode.html')
      }
      else
        res.redirect(base_url+'/genqr')
    }
    db.checkSession(req.cookies['session']['user'], checkSesion)
  }
})


app.get('/scanqr/:acc_num/:amount',function(req,res){

  var acc_num = req.params.acc_num
  var amount = parseInt(req.params.amount)

  if(Object.keys(req.cookies).length == 0 || !('session' in req.cookies)){
    res.cookie('session', {'scanqr': acc_num+'/'+amount}, { maxAge: 1000 * 60 * 2})
    res.redirect(base_url+'/login')
  }

  else if(('session' in req.cookies) && ('user' in req.cookies['session'] && !('scanqr' in req.cookies['session']))){
    res.cookie('session', {'user':req.cookies['session']['user'], 'scanqr': acc_num+'/'+amount}, { maxAge : 1000 * 60 * 2 })
    res.redirect(base_url+'/home')
  }

  else{
    function checkSesion(check, payer, acc_payer, balance){

      console.log("[Scan QRcode checkSesion and balance!]")

      if(check && amount <= balance){

        function done(){

          console.log("[Transaction!]")

          res.cookie('session', {'user': req.cookies['session']['user']}, { maxAge : 1000 * 60 * 2})
          res.redirect(base_url+'/home')
        }
        db.transaction(req.cookies['session']['user'], payer, balance, acc_num, amount, done)

      }
      else{
        res.cookie('session', {'user' : req.cookies['session']['user']}, { maxAge : 1000 * 60 * 2 })
        res.redirect(base_url+'/home')
      }
    }
    db.checkSession(req.cookies['session']['user'], checkSesion)
  }
})

app.listen(PORT)