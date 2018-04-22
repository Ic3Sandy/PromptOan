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
        console.log("[db_server] Table created")
        insert_info()
    })
}
function insert_info(){
    var sql = "INSERT INTO users (acc_num, username, password, balance) VALUES (123, 'foo', 'bar', 500), (456, 'alice', 'bob', 500)"
    client.query(sql, function (err, result) {
        if (err) throw err
    //   console.log("Number of records inserted: " + result.affectedRows);
    })
}
var sql = "DROP TABLE IF EXISTS users"
client.query(sql, function (err, result) {
    if (err) throw err
    console.log("[db_server] Table drop")
    create_tb()
})

exports.checkLogin = function(username, password, session, callback) {
    
    console.log("[db_pg checkLogin] Check password!")
    client.query('SELECT * FROM users WHERE username = $1', [username], function (err, result, fields) {
        if (err) throw err

        console.log('[db_pg checkLogin] username: '+username)
        console.log('[db_pg checkLogin] password: '+password)

        if (result.length == 0 || result['rows'][0].password != password){
            console.log('[db_pg checkLogin] Username or Password Incorrect')
            callback(false, null)
        }
        else if(result['rows'][0].password == password){
            console.log('[db_pg checkLogin] Access Granted')
            client.query('UPDATE users SET session = $1 WHERE username = $2', [session, username], function (err, result) {
                if (err) throw err;
            })
            callback(true, session)
        }
    })
}

exports.checkSession = function(session, callback) {

    console.log("[db_server checkSession] Check session!")
    client.query('SELECT * FROM users WHERE session = $1', [session], function (err, result, fields) {
        if (err) throw err

        if (result.length == 0){
            console.log('[db_server checkSession] Session Incorrect')
            callback(false, null, null, null)
        }else{
            console.log('[db_server checkSession] Session Correct: '+session)
            // console.log(result)
            console.log(result['rows'][0].username)
            console.log(result['rows'][0].acc_num)
            console.log(result['rows'][0].balance)
            callback(true, result['rows'][0].username, result['rows'][0].acc_num, result['rows'][0].balance)
        }
    })
}

exports.transaction = function(session, payer, balance, payee, amount, callback) {

    console.log("[db_server transaction] Transaction!")
    var balance = balance - amount
    client.query('UPDATE users SET balance = $1 WHERE username = $2', [balance, payer], function (err, result, fields) {
        if (err) throw err
    })
    function upBalance(balance_payee, payee){
        client.query('UPDATE users SET balance = $1 WHERE username = $2', [balance_payee, payee], function (err, result, fields) {
            if (err) throw err
        })
    }
    client.query('SELECT * FROM users WHERE username = $1', [payee], function (err, result, fields) {
        if (err) throw err
        var balance_payee = result['rows'][0].balance + amount
        upBalance(balance_payee, payee)
    })
    callback()
}

