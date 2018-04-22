var mysql = require('mysql')

// Create Database
var create_db = require('./modules/create_db.js')

var client = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "123456",
  database: "mydb"
});

client.connect(function(err) {
    if (err) throw err
      console.log("Connected Database!");
})

var sql = "DROP TABLE IF EXISTS users"
client.query(sql, function (err, result) {
    if (err) throw err;
    console.log("[db_server] Table drop")
})

var sql = "CREATE TABLE IF NOT EXISTS users (id INT AUTO_INCREMENT PRIMARY KEY, acc_num INT, username VARCHAR(255), password VARCHAR(255), balance INT, session VARCHAR(255))";
client.query(sql, function (err, result) {
    if (err) throw err
    console.log("[db_server] Table created")
})

var sql = "INSERT INTO users (acc_num, username, password, balance) VALUES ?";
var values = [
    [123, 'foo', 'bar', 500],
    [456, 'alice', 'bob', 500],
]
client.query(sql, [values], function (err, result) {
    if (err) throw err
//   console.log("Number of records inserted: " + result.affectedRows);
})

exports.checkLogin = function(username, password, session, callback) {
    
    console.log("[db_server checkLogin] Check password!")
    var sql = 'SELECT * FROM users WHERE username = ' + mysql.escape(username)
    client.query(sql, function (err, result, fields) {
        if (err) throw err

        console.log('[db_server checkLogin] username: '+username)
        console.log('[db_server checkLogin] password: '+password)
        console.log(result)

        if (result.length == 0 || result[0].password != password){
            console.log('[db_server checkLogin] Username or Password Incorrect')
            callback(false, null)
        }
        else if(result[0].password == password){
            console.log('[db_server checkLogin] Access Granted')
            var sql = 'UPDATE users SET session = '+mysql.escape(session)+' WHERE username = '+mysql.escape(username)
            client.query(sql, function (err, result) {
                if (err) throw err;
                console.log(result.affectedRows + " record(s) updated")
                callback(true, session)
            })
            
        }
    })
}

exports.checkSession = function(session, callback) {

    console.log("[db_server checkSession] Check session!")
    var sql = 'SELECT * FROM users WHERE session = ' + mysql.escape(session)
    client.query(sql, function (err, result, fields) {
        if (err) throw err

        if (result.length == 0){
            console.log('[db_server checkSession] Session Incorrect')
            callback(false, null, null, null)
        }else{
            console.log('[db_server checkSession] Session Correct: '+session)
            // console.log(result)
            callback(true, result[0].username, result[0].acc_num, result[0].balance)
        }
    })
}

exports.transaction = function(session, payer, balance, payee, amount, callback) {

    console.log("[db_server transaction] Transaction!")
    var balance = balance - amount
    var sql = 'UPDATE users SET balance = '+mysql.escape(balance)+' WHERE username = ' + mysql.escape(payer)
    client.query(sql, function (err, result, fields) {
        if (err) throw err
    })
    var sql = 'SELECT * FROM users WHERE username = '+mysql.escape(payee)
    function upBalance(balance_payee, payee){
        var sql = 'UPDATE users SET balance = '+mysql.escape(balance_payee)+' WHERE username = ' + mysql.escape(payee)
        client.query(sql, function (err, result, fields) {
            if (err) throw err
        })
    }
    client.query(sql, function (err, result, fields) {
        if (err) throw err
        var balance_payee = result[0].balance + amount
        upBalance(balance_payee, payee)
    })
    callback()
}
