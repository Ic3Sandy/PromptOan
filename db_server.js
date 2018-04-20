var mysql = require('mysql')

// Create Database
var create_db = require('./modules/create_db.js')

var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "jjayz8216",
  database: "mydb"
});

con.connect(function(err) {
    if (err) throw err
    //   console.log("Connected Database!");
    var sql = "DROP TABLE IF EXISTS users"
    con.query(sql, function (err, result) {
        if (err) throw err;
        console.log("[db_server] Table drop")
    })

    var sql = "CREATE TABLE IF NOT EXISTS users (id INT AUTO_INCREMENT PRIMARY KEY, acc_num INT, username VARCHAR(255), password VARCHAR(255), balance INT,session VARCHAR(255))";
    con.query(sql, function (err, result) {
        if (err) throw err
        console.log("[db_server] Table created")
    })

    var sql = "INSERT INTO users (acc_num, username, password) VALUES ?";
    var values = [
        [123, 'foo', 'bar'],
        [456, 'alice', 'bob'],
    ];
    con.query(sql, [values], function (err, result) {
      if (err) throw err
    //   console.log("Number of records inserted: " + result.affectedRows);
    })

})

exports.checkLogin = function(username, password, callback) {
    
    console.log("[db_server checkLogin] Check password!")
    var sql = 'SELECT * FROM users WHERE username = ' + mysql.escape(username)
    con.query(sql, function (err, result, fields) {
        if (err) throw err

        console.log('[db_server checkLogin] username: '+username)
        console.log('[db_server checkLogin] password: '+password)
        console.log(result)

        if (result.length == 0 || result[0].password != password){
            console.log('[db_server checkLogin] Username or Password Incorrect')
            callback(false)
        }else if(result[0].password == password){
            console.log('[db_server checkLogin] Access Granted')
            callback(true)
        }
    })
}