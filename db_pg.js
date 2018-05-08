const { Client } = require('pg')

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: true,
})

client.connect()

function create_tb(){
    var sql = "CREATE TABLE IF NOT EXISTS users (acc_num INT PRIMARY KEY, username VARCHAR(255), password VARCHAR(255), balance INT, session VARCHAR(255))";
    client.query(sql, function (err, result) {
        if (err) throw err
        insert_info()
    })
}

function insert_info(){
    var sql = "INSERT INTO users (acc_num, username, password, balance) VALUES (123, 'foo', 'bar', 500), (456, 'alice', 'bob', 500)"
    client.query(sql, function (err, result) {
        if (err) throw err
    })
}

var sql = "DROP TABLE IF EXISTS users"
client.query(sql, function (err, result) {
    if (err) throw err
    create_tb()
})

exports.checkLogin = function(username, password, session, callback) {
  
    client.query('SELECT * FROM users WHERE username = $1', [username], function (err, result, fields) {
        if (err) throw err

        if (result.length == 0 || result['rows'][0].password != password)
            callback(false, null)
        
        else if(result['rows'][0].password == password){
            client.query('UPDATE users SET session = $1 WHERE username = $2', [session, username], function (err, result) {
                if (err) throw err;
            })
            callback(true, session)
        }
    })
}

exports.checkSession = function(session, callback) {

    client.query('SELECT * FROM users WHERE session = $1', [session], function (err, result, fields) {
        if (err) throw err

        if (result.length == 0)
            callback(false, null, null, null)

        else{
            console.log(result['rows'])
            callback(true, result['rows'][0].username, result['rows'][0].acc_num, result['rows'][0].balance)
        }
            
        
    })
}

exports.transaction = function(session, payer, balance, acc_num, amount, callback) {

    var balance = balance - amount
    client.query('UPDATE users SET balance = $1 WHERE username = $2', [balance, payer], function (err, result, fields) {
        if (err) throw err
    })
    function upBalance(balance_payee, acc_num){
        client.query('UPDATE users SET balance = $1 WHERE acc_num = $2', [balance_payee, acc_num], function (err, result, fields) {
            if (err) throw err
        })
    }
    client.query('SELECT * FROM users WHERE acc_num = $1', [acc_num], function (err, result, fields) {
        if (err) throw err
        var balance_payee = result['rows'][0].balance + amount
        upBalance(balance_payee, payee)
    })
    callback()
}

