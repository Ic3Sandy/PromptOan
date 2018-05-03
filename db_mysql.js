var mysql = require('mysql')

// Create Database
var create_db = require('./modules/create_db.js')

var client = mysql.createConnection({
  host: "localhost",
  user: "ic3",
  password: "qazxsw",
  database: "mydb"
});

client.connect(function(err) {
    if (err) throw err
    console.log("[Connected Database!]");
})

var sql = "DROP TABLE IF EXISTS users"
client.query(sql, function (err, result) {
    if (err) throw err;
    console.log("[Drop table users]")
})

var sql = "CREATE TABLE IF NOT EXISTS users (id INT AUTO_INCREMENT PRIMARY KEY, acc_num INT, username VARCHAR(255), password VARCHAR(255), balance INT, session VARCHAR(255))";
client.query(sql, function (err, result) {
    if (err) throw err
    console.log("[Create table users]")
})

var sql = "INSERT INTO users (acc_num, username, password, balance) VALUES ?";
var values = [
    [123, 'foo', 'bar', 500],
    [456, 'alice', 'bob', 500],
]
client.query(sql, [values], function (err, result) {
    if (err) throw err
    console.log("[Insert user to table]")
})

exports.checkLogin = function(username, password, session, callback) {
    
    
    var sql = 'SELECT * FROM users WHERE username = ' + mysql.escape(username)
    client.query(sql, function (err, result, fields) {
        if (err) throw err

        if (result.length == 0 || result[0].password != password)
            callback(false, null)
        
        else if(result[0].password == password){
            var sql = 'UPDATE users SET session = '+mysql.escape(session)+' WHERE username = '+mysql.escape(username)
            client.query(sql, function (err, result) {
                if (err) throw err;
                callback(true, session)
            })
            
        }
    })
}

exports.checkSession = function(session, callback) {

    var sql = 'SELECT * FROM users WHERE session = ' + mysql.escape(session)
    client.query(sql, function (err, result, fields) {
        if (err) throw err

        if (result.length == 0)
            callback(false, null, null, null)
        
        else
            callback(true, result[0].username, result[0].acc_num, result[0].balance)
        
    })
}

exports.transaction = function(session, payer, balance, acc_num, amount, callback) {

    var balance = balance - amount
    var sql = 'UPDATE users SET balance = '+mysql.escape(balance)+' WHERE username = ' + mysql.escape(payer)
    client.query(sql, function (err, result, fields) {
        if (err) throw err
    })
    var sql = 'SELECT * FROM users WHERE acc_num = '+mysql.escape(acc_num)
    function upBalance(balance_payee, acc_num){
        var sql = 'UPDATE users SET balance = '+mysql.escape(balance_payee)+' WHERE acc_num = ' + mysql.escape(acc_num)
        client.query(sql, function (err, result, fields) {
            if (err) throw err
        })
    }
    client.query(sql, function (err, result, fields) {
        if (err) throw err
        var balance_payee = result[0].balance + amount
        upBalance(balance_payee, acc_num)
    })
    callback()
}
