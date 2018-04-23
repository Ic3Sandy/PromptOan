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
      console.log("Connected Database!");
})

var sql = "DROP TABLE IF EXISTS users"
client.query(sql, function (err, result) {
    if (err) throw err;
    console.log("[db_mysql] Table drop")
})

var sql = "CREATE TABLE IF NOT EXISTS users (id INT AUTO_INCREMENT PRIMARY KEY, acc_num INT, username VARCHAR(255), password VARCHAR(255), balance INT, session VARCHAR(255))";
client.query(sql, function (err, result) {
    if (err) throw err
    console.log("[db_mysql] Table created")
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
    
    // console.log("[db_mysql checkLogin] Check password!")
    var sql = 'SELECT * FROM users WHERE username = ' + mysql.escape(username)
    client.query(sql, function (err, result, fields) {
        if (err) throw err

        // console.log('[db_mysql checkLogin] username: '+username)
        // console.log('[db_mysql checkLogin] password: '+password)

        if (result.length == 0 || result[0].password != password){
            // console.log('[db_mysql checkLogin] Username or Password Incorrect')
            callback(false, null)
        }
        else if(result[0].password == password){
            // console.log('[db_mysql checkLogin] Access Granted')
            var sql = 'UPDATE users SET session = '+mysql.escape(session)+' WHERE username = '+mysql.escape(username)
            client.query(sql, function (err, result) {
                if (err) throw err;
                // console.log(result.affectedRows + " record(s) updated")
                callback(true, session)
            })
            
        }
    })
}

exports.checkSession = function(session, callback) {

    // console.log("[db_mysql checkSession] Check session!")
    var sql = 'SELECT * FROM users WHERE session = ' + mysql.escape(session)
    client.query(sql, function (err, result, fields) {
        if (err) throw err

        if (result.length == 0){
            // console.log('[db_mysql checkSession] Session Incorrect')
            callback(false, null, null, null)
        }else{
            // console.log('[db_mysql checkSession] Session Correct: '+session)
            // console.log(result)
            callback(true, result[0].username, result[0].acc_num, result[0].balance)
        }
    })
}

exports.transaction = function(session, payer, balance, acc_num, amount, callback) {

    // console.log("[db_mysql transaction] Transaction!")
    var balance = balance - amount
    // console.log("[db_mysql transaction] balance: "+balance)
    var sql = 'UPDATE users SET balance = '+mysql.escape(balance)+' WHERE username = ' + mysql.escape(payer)
    // console.log(sql)
    client.query(sql, function (err, result, fields) {
        if (err) throw err
    })
    var sql = 'SELECT * FROM users WHERE acc_num = '+mysql.escape(acc_num)
    // console.log(sql)
    function upBalance(balance_payee, acc_num){
        var sql = 'UPDATE users SET balance = '+mysql.escape(balance_payee)+' WHERE acc_num = ' + mysql.escape(acc_num)
        // console.log(sql)
        client.query(sql, function (err, result, fields) {
            if (err) throw err
        })
    }
    client.query(sql, function (err, result, fields) {
        if (err) throw err
        // console.log(result)
        // console.log('amount: '+amount)
        var balance_payee = result[0].balance + amount
        // console.log('balance_payee: '+balance_payee)
        upBalance(balance_payee, acc_num)
    })
    callback()
}
